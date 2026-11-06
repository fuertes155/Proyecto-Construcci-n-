import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const requested = params.get('tipo') as CalculatorId | null;
  const active: CalculatorId =
    requested && CALCULATOR_IDS.includes(requested) ? requested : CALCULATOR_IDS[0];
  const meta = CALCULATOR_META[active];

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Herramientas"
        title="Calculadoras"
        description="Calcula los materiales de cada etapa de la obra con precios publicados por comercios de Pasto y Colombia."
      />

      <div className="card p-4 md:hidden">
        <label htmlFor="elegir-calculadora" className="label">
          ¿Qué vas a calcular?
        </label>
        <select
          id="elegir-calculadora"
          className="input"
          value={active}
          onChange={(event) =>
            navigate(calculatorPath(event.target.value as CalculatorId), {
              replace: true,
            })
          }
        >
          {CALCULATOR_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.ids.map((id) => (
                <option key={id} value={id}>
                  {CALCULATOR_META[id].label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <nav
        aria-label="Elegir calculadora"
        className="card hidden overflow-hidden p-3 md:grid md:grid-cols-3 md:gap-4"
      >
        {CALCULATOR_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className="min-w-0">
            <p className="mb-2 flex items-center gap-2 px-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              <span className="text-brand-text">0{groupIndex + 1}</span>
              {group.label}
            </p>
            <ul className="grid grid-cols-3 gap-1">
              {group.ids.map((id) => {
                const item = CALCULATOR_META[id];
                const current = id === active;
                return (
                  <li key={id} className="min-w-0">
                    <Link
                      to={calculatorPath(id)}
                      replace
                      aria-current={current ? 'page' : undefined}
                      className="calculator-switch"
                    >
                      <span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
                      <span>{item.label}</span>
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
