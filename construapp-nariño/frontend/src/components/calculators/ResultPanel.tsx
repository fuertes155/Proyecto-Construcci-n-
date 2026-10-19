import { useState } from 'react';
import { PiFloppyDisk, PiStorefront } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import type { CalculationResult } from '../../services/calculators';
import type { ProjectListItem } from '../../services/projects';
import { formatCOP, formatDateTime, formatPct, formatQty } from '../../utils/format';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { CALCULATOR_META } from './calculatorMeta';

interface ResultPanelProps {
  result: CalculationResult;
  projects: ProjectListItem[] | undefined;
  isLoggedIn: boolean;
  onSave: (projectId: string) => void;
  saving: boolean;
}

export default function ResultPanel({
  result,
  projects,
  isLoggedIn,
  onSave,
  saving,
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

      <div className="overflow-x-auto border-t border-line">
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
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-ink-subtle">
                    <PiStorefront aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
                    {m.provider?.name ?? 'Sin precio registrado'}
                  </p>
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
          <p className="text-sm font-medium text-ink-muted">Total estimado</p>
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
              disabled={!projectId}
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
        Las cantidades son aproximadas (referencias de obra). Valídalas con un profesional antes
        de comprar.
      </p>
    </section>
  );
}
