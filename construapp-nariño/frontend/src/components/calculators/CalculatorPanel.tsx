import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PiCalculator, PiListChecks } from 'react-icons/pi';
import { z, type ZodTypeAny } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';
import type { CalculationResult, CalculatorId } from '../../services/calculators';
import { projectsApi } from '../../services/projects';
import { formatQty } from '../../utils/format';
import Button from '../ui/Button';
import { SelectField, TextField } from '../ui/Field';
import type { NumberField } from './calculatorMeta';
import CalculatorSketch, { type SketchDim } from './CalculatorSketch';
import ResultPanel from './ResultPanel';

export type { NumberField };

export type CalculatorInputs = Record<string, number | string>;
export type CalculatorRunFn = (values: CalculatorInputs) => Promise<CalculationResult>;

interface CalculatorPanelProps {
  calculatorId: CalculatorId;
  fields: NumberField[];
  run: CalculatorRunFn;
}

const MAX_WASTE_PCT = 30;

/**
 * Los campos varían según la calculadora (`fields`), así que el formulario se
 * tipa de forma genérica: un número (o la opción elegida) por campo + `wastePct`
 * opcional. La forma concreta (`ConcreteInput`, `BrickInput`, …) la valida el backend.
 */
type FormValues = Record<string, number | string | undefined>;

/** Validación de un dato: una de las opciones, o una medida mayor que 0 / dentro de límites. */
function fieldSchema(f: NumberField): ZodTypeAny {
  if (f.options) {
    const values = f.options.map((o) => o.value);
    return z.string().refine((v) => values.includes(v), 'Elige una opción');
  }
  const range = (n: number) => `${formatQty(n)} ${f.unit}`;
  let schema = z.coerce.number({ invalid_type_error: `${f.label} es obligatorio` });
  schema =
    f.min !== undefined
      ? schema.min(f.min, `Mínimo ${range(f.min)}`)
      : schema.positive(`${f.label} debe ser mayor a 0`);
  if (f.max !== undefined) schema = schema.max(f.max, `Máximo ${range(f.max)}`);
  if (f.integer) schema = schema.int('Debe ser un número entero');
  return schema;
}

/** Texto de la cota a partir de lo escrito en el campo: "5" → "5 m". */
function dimValue(raw: unknown, unit: string): string | undefined {
  if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? `${formatQty(n)} ${unit}` : undefined;
}

export default function CalculatorPanel({ calculatorId, fields, run }: CalculatorPanelProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastInputs, setLastInputs] = useState<CalculatorInputs | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const shape: Record<string, ZodTypeAny> = Object.fromEntries(
    fields.map((f) => [f.name, fieldSchema(f)])
  );
  const schema = z.object({
    ...shape,
    wastePct: z.coerce
      .number({ invalid_type_error: 'Ingresa un porcentaje' })
      .min(0, 'No puede ser negativo')
      .max(MAX_WASTE_PCT, `Máximo ${MAX_WASTE_PCT}%`)
      .optional(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      wastePct: 5,
      ...Object.fromEntries(
        fields.filter((f) => f.defaultValue !== undefined).map((f) => [f.name, f.defaultValue])
      ),
    },
  });

  // El croquis refleja en vivo las medidas que se van escribiendo.
  const watched = useWatch({ control });
  const choices = fields.filter((f) => f.options);
  const measures = fields.filter((f) => !f.options);
  const dims: Record<string, SketchDim> = Object.fromEntries(
    measures.map((f) => [
      f.name,
      { label: f.short ?? f.label, value: dimValue(watched[f.name], f.unit) },
    ])
  );

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: ({ projectId }: { projectId: string }) =>
      projectsApi.addCalculation(projectId, calculatorId, lastInputs ?? {}),
    onSuccess: () => {
      toast.success('Cálculo guardado en el proyecto');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo guardar el cálculo')),
  });

  // En pantallas angostas el resultado queda debajo del formulario: llevarlo a la vista.
  useEffect(() => {
    if (!result || !window.matchMedia) return;
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [result]);

  const onSubmit = async (values: FormValues) => {
    const { wastePct, ...rest } = values;
    const inputs = { ...rest, ...(wastePct !== undefined ? { wastePct } : {}) } as CalculatorInputs;
    try {
      const res = await run(inputs);
      setResult(res);
      setLastInputs(inputs);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo calcular'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <form className="card overflow-hidden" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="blueprint border-b border-line bg-surface-muted px-4 py-3">
          <CalculatorSketch type={calculatorId} dims={dims} className="mx-auto max-w-sm" />
        </div>

        {/* Dos columnas también en móvil: son números cortos y así el botón queda a la vista */}
        <div className="grid grid-cols-2 gap-4 p-5 sm:p-6">
          {/* Primero la elección de material, a todo el ancho; luego las medidas */}
          {choices.map((f) => (
            <SelectField
              key={f.name}
              id={f.name}
              label={f.label}
              hint={f.hint}
              wrapperClassName="col-span-2"
              error={errors[f.name] ? String(errors[f.name]?.message) : undefined}
              {...register(f.name)}
            >
              {f.options!.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          ))}
          {measures.map((f) => (
            <TextField
              key={f.name}
              id={f.name}
              label={f.label}
              suffix={f.unit}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder={f.placeholder}
              hint={f.hint}
              error={errors[f.name] ? String(errors[f.name]?.message) : undefined}
              {...register(f.name)}
            />
          ))}
          <TextField
            id="wastePct"
            label="Desperdicio"
            suffix="%"
            type="number"
            step="any"
            inputMode="decimal"
            hint={`Extra por cortes y pérdidas (0 a ${MAX_WASTE_PCT}%).`}
            error={errors.wastePct ? String(errors.wastePct.message) : undefined}
            wrapperClassName={measures.length % 2 === 0 ? 'col-span-2' : undefined}
            {...register('wastePct')}
          />
          <div className="col-span-2">
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              icon={<PiCalculator aria-hidden="true" />}
            >
              {isSubmitting ? 'Calculando…' : 'Calcular'}
            </Button>
          </div>
        </div>
      </form>

      <div ref={resultRef} className="scroll-mt-20" aria-live="polite">
        {result ? (
          <ResultPanel
            result={result}
            projects={projectsData?.projects}
            isLoggedIn={!!user}
            onSave={(projectId) => saveMutation.mutate({ projectId })}
            saving={saveMutation.isPending}
          />
        ) : (
          <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-surface text-ink-subtle shadow-card"
            >
              <PiListChecks className="h-7 w-7" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold leading-tight text-ink">
              Aquí verás el resultado
            </p>
            <p className="mt-2 max-w-sm text-ink-muted">
              Ingresa las medidas y presiona <strong className="font-semibold">Calcular</strong> para
              obtener la lista de materiales y su costo con precios locales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
