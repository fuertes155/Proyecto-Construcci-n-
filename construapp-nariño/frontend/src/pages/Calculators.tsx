import clsx from 'clsx';
import { Link, useSearchParams } from 'react-router-dom';
import CalculatorPanel from '../components/calculators/CalculatorPanel';
import {
  CALCULATOR_GROUPS,
  CALCULATOR_IDS,
  CALCULATOR_META,
  calculatorPath,
} from '../components/calculators/calculatorMeta';
import PageHeader from '../components/ui/PageHeader';
import { calculatorsApi, type CalculatorId } from '../services/calculators';

export default function Calculators() {
  // La calculadora activa vive en la URL (?tipo=brick) para poder enlazarla.
  const [params] = useSearchParams();
  const requested = params.get('tipo') as CalculatorId | null;
  const active: CalculatorId =
    requested && CALCULATOR_IDS.includes(requested) ? requested : CALCULATOR_IDS[0];
  const meta = CALCULATOR_META[active];

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Herramientas"
        title="Calculadoras"
        description="Calcula los materiales de cada etapa de la obra con precios de proveedores locales de Nariño."
      />

      <nav
        aria-label="Elegir calculadora"
        className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)]"
      >
        {CALCULATOR_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="eyebrow mb-2">{group.label}</p>
            <ul className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {group.ids.map((id) => {
                const item = CALCULATOR_META[id];
                const current = id === active;
                return (
                  <li key={id} className="min-w-0">
                    <Link
                      to={calculatorPath(id)}
                      replace
                      aria-current={current ? 'page' : undefined}
                      className={clsx(
                        'group flex h-full flex-col items-center gap-2 rounded-lg border p-3 text-center shadow-card transition lg:flex-row lg:gap-3 lg:text-left',
                        current
                          ? 'border-brand bg-brand-soft'
                          : 'border-line bg-surface hover:border-line-strong'
                      )}
                    >
                      <span
                        className={clsx(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition [&>svg]:h-5 [&>svg]:w-5',
                          current ? 'bg-brand text-brand-fg' : 'bg-surface-strong text-ink-muted'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm font-semibold leading-tight text-ink sm:text-[0.9375rem]">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <section aria-labelledby="calculadora-activa" className="space-y-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-text [&>svg]:h-6 [&>svg]:w-6"
          >
            {meta.icon}
          </span>
          <div>
            <h2 id="calculadora-activa" className="title-section">
              {meta.label}
            </h2>
            <p className="mt-0.5 text-ink-muted">{meta.description}</p>
          </div>
        </div>

        {/* La key reinicia formulario y resultado al cambiar de calculadora */}
        <CalculatorPanel
          key={active}
          calculatorId={active}
          fields={meta.fields}
          run={(values) => calculatorsApi.run(active, values)}
        />
      </section>
    </div>
  );
}
