import { useState } from 'react';
import { PiFloppyDisk, PiStorefront } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import type { CalculationResult, PricedMaterial } from '../../services/calculators';
import type { ProjectListItem } from '../../services/projects';
import { formatCOP, formatDateTime, formatPct, formatQty } from '../../utils/format';
import Alert from '../ui/Alert';
import PriceSource from '../PriceSource';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { CALCULATOR_META } from './calculatorMeta';

interface ResultPanelProps {
  result: CalculationResult;
  projects: ProjectListItem[] | undefined;
  isLoggedIn: boolean;
  onSave: (projectId: string) => void;
  saving: boolean;
  outdated?: boolean;
}

function MaterialInfo({ material }: { material: PricedMaterial }) {
  return (
    <>
      <p className="font-semibold">{material.name}</p>
      <p className="mt-0.5 flex items-start gap-1 text-xs text-ink-subtle">
        <PiStorefront aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
        {material.provider?.name ?? 'Sin precio registrado'}
      </p>
      <PriceSource price={material} />
    </>
  );
}

export default function ResultPanel({
  result,
  projects,
  isLoggedIn,
  onSave,
  saving,
  outdated = false,
}: ResultPanelProps) {
  const [projectId, setProjectId] = useState('');
  const meta = CALCULATOR_META[result.calculatorType];
  // `missingPrices` trae el rol interno ("cement"); se muestra el nombre del material.
  const missingNames = result.missingPrices.map(
    (role) => result.materials.find((m) => m.role === role)?.name ?? role
  );

  return (
    <section className="card animate-rise overflow-hidden" aria-label="Resultado del cálculo">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="eyebrow">Resultado</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">
            {formatQty(result.quantity)} {result.unit}{' '}
            <span className="font-normal text-ink-muted">de {meta?.noun ?? 'obra'}</span>
          </h2>
        </div>
        <Badge tone="neutral">Desperdicio {formatPct(result.wastePct)}</Badge>
      </div>

      {outdated && (
        <div className="border-t border-line p-5 sm:px-6">
          <Alert tone="warning" title="Las medidas cambiaron">
            Vuelve a calcular para actualizar las cantidades y el presupuesto antes de guardar.
          </Alert>
        </div>
      )}

      <div className="divide-y divide-line border-t border-line sm:hidden print:hidden">
        {result.materials.map((m) => (
          <article key={m.role} className="p-5" aria-label={`Material: ${m.name}`}>
            <p className="font-semibold text-ink">{m.name}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {m.provider?.name ?? 'Sin precio registrado'}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line bg-surface-muted p-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-ink-subtle">Cantidad</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {formatQty(m.quantity)} <span className="font-normal">{m.unit}</span>
                </dd>
              </div>
              <div className="min-w-0 text-right">
                <dt className="text-xs text-ink-subtle">Precio unitario</dt>
                <dd className="mt-1 font-semibold tabular-nums">{formatCOP(m.pricePerUnit)}</dd>
              </div>
              <div className="col-span-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3">
                <dt className="font-medium text-ink-muted">Subtotal</dt>
                <dd className="font-semibold tabular-nums text-ink">{formatCOP(m.totalPrice)}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <PriceSource price={m} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto border-t border-line sm:block print:block">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col" className="num">
                Cantidad
              </th>
              <th scope="col" className="num hidden sm:table-cell">
                Precio unitario
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {result.materials.map((m) => (
              <tr key={m.role}>
                <td>
                  <MaterialInfo material={m} />
                </td>
                <td className="num">
                  {/* Si no cabe en una línea, el corte cae entre el número y la unidad */}
                  <span className="font-semibold">{formatQty(m.quantity)}</span>{' '}
                  <span className="whitespace-nowrap text-ink-muted">{m.unit}</span>
                  <span className="block text-xs text-ink-subtle sm:hidden">
                    {formatCOP(m.pricePerUnit)} c/u
                  </span>
                </td>
                <td className="num hidden whitespace-nowrap sm:table-cell">
                  {formatCOP(m.pricePerUnit)}
                </td>
                <td className="num whitespace-nowrap font-semibold">{formatCOP(m.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {missingNames.length > 0 && (
        <div className="border-t border-line p-5 sm:px-6">
          <Alert tone="warning" title="Faltan precios en el catálogo">
            No hay precio registrado para: {missingNames.join(', ')}. El total no los incluye.
          </Alert>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-line bg-surface-muted p-5 sm:px-6">
        <div>
          <p className="text-sm font-medium text-ink-muted">
            {outdated ? 'Total anterior · pendiente de recalcular' : 'Total estimado'}
          </p>
          <p className="mt-1 text-[2.5rem] font-semibold leading-none text-ink sm:text-5xl">
            {formatCOP(result.totalCost)}
          </p>
        </div>
        <p className="text-xs text-ink-subtle">Calculado el {formatDateTime(result.timestamp)}</p>
      </div>

      <div className="border-t border-line p-5 sm:px-6">
        {isLoggedIn ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="save-project" className="label">
                Guardar en un proyecto
              </label>
              <select
                id="save-project"
                className="input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Elige un proyecto…</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="secondary"
              disabled={!projectId || outdated}
              loading={saving}
              icon={<PiFloppyDisk aria-hidden="true" />}
              onClick={() => onSave(projectId)}
            >
              {saving ? 'Guardando…' : 'Guardar en proyecto'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            <Link to="/login" className="link">
              Inicia sesión
            </Link>{' '}
            para guardar este cálculo en un proyecto.
          </p>
        )}
        {isLoggedIn && projects?.length === 0 && (
          <p className="mt-3 text-sm text-ink-muted">
            No tienes proyectos aún.{' '}
            <Link to="/projects" className="link">
              Crea uno
            </Link>
            .
          </p>
        )}
      </div>

      <p className="border-t border-line px-5 py-3 text-xs text-ink-subtle sm:px-6">
        Las cantidades son aproximadas (referencias de obra). Valídalas con un profesional antes de
        comprar.
      </p>
    </section>
  );
}
