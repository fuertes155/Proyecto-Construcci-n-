import { PiWarningCircleFill, PiWarningFill } from 'react-icons/pi';
import type { BudgetSummary as BudgetSummaryData } from '../../services/projects';
import { formatCOP, formatPct } from '../../utils/format';
import Meter, { type MeterTone } from '../ui/Meter';

/** A partir de este porcentaje el medidor avisa que el presupuesto está por agotarse. */
const NEAR_LIMIT_PCT = 90;

/** Severidad del presupuesto: normal, cerca del límite o superado. */
export function budgetTone(summary: BudgetSummaryData): MeterTone {
  if (summary.overBudget) return 'danger';
  if ((summary.budgetUsedPct ?? 0) >= NEAR_LIMIT_PCT) return 'warning';
  return 'info';
}

interface BudgetSummaryProps {
  summary: BudgetSummaryData;
  /** `detail` muestra las tres cifras (costo, presupuesto, disponible) en grande. */
  variant?: 'compact' | 'detail';
}

export default function BudgetSummary({ summary, variant = 'compact' }: BudgetSummaryProps) {
  const tone = budgetTone(summary);
  const hasBudget = summary.budget !== null;
  const usedText =
    summary.budgetUsedPct !== null ? `${formatPct(summary.budgetUsedPct)} del presupuesto` : '';
  const remaining = summary.budgetRemaining;

  // El estado se dice con icono y texto, no solo con el color de la barra.
  const status =
    tone === 'danger' ? (
      <span className="inline-flex items-center gap-1 font-semibold text-danger-text">
        <PiWarningCircleFill aria-hidden="true" className="h-4 w-4" />
        Superado por {formatCOP(Math.abs(remaining ?? 0))}
      </span>
    ) : tone === 'warning' ? (
      <span className="inline-flex items-center gap-1 font-semibold text-warning-text">
        <PiWarningFill aria-hidden="true" className="h-4 w-4" />
        Cerca del límite · quedan {formatCOP(remaining)}
      </span>
    ) : (
      <span className="text-ink-muted">Quedan {formatCOP(remaining)}</span>
    );

  if (variant === 'detail') {
    return (
      <div>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-ink-muted">Costo estimado</dt>
            <dd className="mt-1 text-[1.75rem] font-semibold leading-none text-ink">
              {formatCOP(summary.totalCost)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ink-muted">Presupuesto objetivo</dt>
            <dd className="mt-1 text-[1.75rem] font-semibold leading-none text-ink">
              {hasBudget ? formatCOP(summary.budget) : <span className="text-ink-subtle">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ink-muted">
              {summary.overBudget ? 'Exceso' : 'Disponible'}
            </dt>
            <dd className="mt-1 text-[1.75rem] font-semibold leading-none text-ink">
              {hasBudget ? (
                formatCOP(Math.abs(remaining ?? 0))
              ) : (
                <span className="text-ink-subtle">—</span>
              )}
            </dd>
          </div>
        </dl>

        {hasBudget ? (
          <div className="mt-6">
            <Meter
              value={summary.budgetUsedPct ?? 0}
              tone={tone}
              label="Presupuesto usado"
              valueText={usedText}
              className="h-2.5"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <span className="font-medium text-ink">{usedText}</span>
              {tone !== 'info' && status}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-subtle">
            Define un presupuesto objetivo para comparar el costo de tus cálculos.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink-muted">Costo estimado</span>
        <span className="text-lg font-semibold text-ink">{formatCOP(summary.totalCost)}</span>
      </div>

      {hasBudget ? (
        <>
          <Meter
            value={summary.budgetUsedPct ?? 0}
            tone={tone}
            label="Presupuesto usado"
            valueText={usedText}
            className="mt-3"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
            <span className="text-ink-muted">
              {usedText} ({formatCOP(summary.budget)})
            </span>
            {status}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-subtle">Sin presupuesto objetivo</p>
      )}
    </div>
  );
}
