import type { ReactNode } from 'react';
import { PiArrowRight, PiCalculator, PiFolders, PiStorefront } from 'react-icons/pi';
import { Navigate } from 'react-router-dom';
import CalculatorSketch from '../components/calculators/CalculatorSketch';
import {
  CALCULATOR_IDS,
  CALCULATOR_META,
  calculatorPath,
} from '../components/calculators/calculatorMeta';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { ButtonLink } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <PiCalculator aria-hidden="true" />,
    title: 'Calculadoras de obra',
    text: 'Ocho calculadoras para estructura, muros y acabados: ingresa las medidas y obtén la lista de materiales con el desperdicio incluido.',
  },
  {
    icon: <PiStorefront aria-hidden="true" />,
    title: 'Precios locales',
    text: 'Compara el precio de más de 30 materiales entre proveedores de Nariño; las calculadoras cotizan con el más económico.',
  },
  {
    icon: <PiFolders aria-hidden="true" />,
    title: 'Proyectos y presupuesto',
    text: 'Guarda tus cálculos por obra, compara el costo con tu presupuesto y saca la lista de compra completa.',
  },
];

const STEPS = [
  { title: 'Ingresa las medidas', text: 'Largo, ancho, espesor o área, según lo que vayas a construir.' },
  { title: 'Revisa materiales y costo', text: 'Cantidades por material, proveedor y total estimado.' },
  { title: 'Guárdalo en tu proyecto', text: 'Con una cuenta, sigue el presupuesto y arma la lista de compra de cada obra.' },
];

export default function Home() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10">
        <Logo to="/" />
        <nav aria-label="Acceso" className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <ButtonLink to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Iniciar sesión
          </ButtonLink>
          <ButtonLink to="/register" size="sm">
            Crear cuenta
          </ButtonLink>
        </nav>
      </header>

      <main>
        {/* ---------------------------------------------------------- portada */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_72%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:px-10 lg:pb-24 lg:pt-16">
            <div className="animate-rise">
              <p className="eyebrow text-brand-text">Materiales de construcción · Nariño</p>
              <h1 className="mt-4 font-display text-[3.25rem] font-bold leading-[0.95] text-ink sm:text-7xl">
                Calcula materiales con precisión
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-muted">
                Gestiona proyectos, compara precios locales y optimiza tus presupuestos de
                construcción en un solo lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to="/calculators"
                  size="lg"
                  iconRight={<PiArrowRight aria-hidden="true" />}
                >
                  Probar las calculadoras
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary">
                  Iniciar sesión
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-ink-subtle">No necesitas una cuenta para calcular.</p>
            </div>

            <div className="animate-rise [animation-delay:120ms]">
              <div className="card overflow-hidden shadow-raised">
                <div className="blueprint bg-surface-muted px-4 py-5">
                  <CalculatorSketch type="concrete" className="mx-auto max-w-md" />
                </div>
                <div className="border-t border-line p-5">
                  <p className="eyebrow">Volumen de la losa</p>
                  <p className="mt-2 text-xl font-semibold text-ink">Largo × Ancho × Espesor</p>
                  <ul className="mt-4 flex flex-wrap gap-2 text-sm font-medium text-ink-muted">
                    {['Cemento', 'Arena', 'Grava'].map((material) => (
                      <li key={material} className="rounded-full bg-surface-strong px-3 py-1">
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- qué incluye */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-8 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-10">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-soft text-brand-text [&>svg]:h-6 [&>svg]:w-6">
                  {feature.icon}
                </span>
                <h2 className="title-section mt-4">{feature.title}</h2>
                <p className="mt-2 text-ink-muted">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ cómo funciona */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink">
            De las medidas al presupuesto en tres pasos
          </h2>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t-2 border-ink pt-4">
                <span className="font-display text-5xl font-bold leading-none text-brand-text">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CALCULATOR_IDS.map((id) => {
              const meta = CALCULATOR_META[id];
              return (
                <ButtonLink
                  key={id}
                  to={calculatorPath(id)}
                  variant="secondary"
                  size="lg"
                  icon={meta.icon}
                  iconRight={<PiArrowRight aria-hidden="true" className="ml-auto" />}
                  className="justify-start"
                >
                  Calcular {meta.label.toLowerCase()}
                </ButtonLink>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <Logo />
          <p className="max-w-md sm:text-right">
            Las cantidades son aproximadas (referencias de obra). Valídalas con un profesional
            antes de comprar.
          </p>
        </div>
      </footer>
    </div>
  );
}
