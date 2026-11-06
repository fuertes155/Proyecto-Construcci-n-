import clsx from 'clsx';
import { PiArrowUpRight } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { CALCULATOR_GROUPS, CALCULATOR_META, calculatorPath } from './calculatorMeta';

/** La misma organización por etapa en la portada y el espacio de trabajo. */
export default function CalculatorCatalog({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={clsx(
        'calculator-catalog grid gap-7 md:grid-cols-3',
        compact && 'calculator-catalog-compact'
      )}
    >
      {CALCULATOR_GROUPS.map((group, index) => (
        <div key={group.label} className="min-w-0">
          <div className="mb-3 flex min-h-9 items-center gap-3">
            <span className="font-display text-xl font-semibold tabular-nums text-brand-text">
              0{index + 1}
            </span>
            <h3 className="text-sm font-semibold text-ink-muted">{group.label}</h3>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-3">
            {group.ids.map((id) => {
              const meta = CALCULATOR_META[id];
              return (
                <Link key={id} to={calculatorPath(id)} className="calculator-card group">
                  <span className="calculator-card-icon">{meta.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{meta.label}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">
                      {meta.description}
                    </span>
                  </span>
                  <PiArrowUpRight
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-text"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
