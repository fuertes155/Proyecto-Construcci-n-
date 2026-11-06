import type { ReactNode } from 'react';
import {
  PiArrowRight,
  PiArrowUpRight,
  PiCalculator,
  PiCheck,
  PiFolders,
  PiMapPin,
  PiRuler,
  PiStorefront,
} from 'react-icons/pi';
import { Link, Navigate } from 'react-router-dom';
import CatalogSnapshot from '../components/CatalogSnapshot';
import PublicHeader from '../components/PublicHeader';
import CalculatorCatalog from '../components/calculators/CalculatorCatalog';
import CalculatorSketch from '../components/calculators/CalculatorSketch';
import { CALCULATOR_IDS } from '../components/calculators/calculatorMeta';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { ButtonLink } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <PiCalculator aria-hidden="true" />,
    title: 'Cada material, en su medida',
    text: 'Cantidades para estructura, muros y acabados, con un margen para cortes y pérdidas.',
  },
  {
    icon: <PiStorefront aria-hidden="true" />,
    title: 'Compara antes de comprar',
    text: 'Precios publicados por comercios de Pasto y Colombia, con fuente y fecha de consulta.',
  },
  {
    icon: <PiFolders aria-hidden="true" />,
    title: 'Una obra. Todo en su lugar.',
    text: 'Guarda tus cálculos, prepara la lista de compra y sigue el presupuesto de tu proyecto.',
  },
];
const STEPS = [
  {
    title: 'Empieza por las medidas',
    text: 'Elige qué vas a construir e ingresa las dimensiones. Las unidades siempre están a la vista.',
  },
  {
    title: 'Ponle números a tu obra',
    text: 'Revisa las cantidades, el desperdicio y el costo estimado de cada material.',
  },
  {
    title: 'Prepara tu siguiente paso',
    text: 'Guarda el cálculo en un proyecto y reúne tu lista de materiales antes de comprar.',
  },
];

function ConstructionPreview() {
  return (
    <div className="construction-preview animate-rise [animation-delay:100ms]">
      <div className="flex items-center justify-between gap-3 border-b border-shell-line px-5 py-4 sm:px-7">
        <span className="flex items-center gap-2.5 text-sm font-medium text-shell-fg">
          <span className="flex h-7 w-7 items-center justify-center rounded border border-shell-line text-accent">
            <PiCalculator aria-hidden="true" className="h-4 w-4" />
          </span>
          De las medidas a los materiales
        </span>
        <span className="font-mono text-[0.625rem] tracking-wider text-shell-muted">01 / 09</span>
      </div>
      <div className="dark blueprint relative px-2 pb-0 pt-4 sm:px-5">
        <div className="flex items-center justify-between px-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-shell-muted">
          <span>Hormigón · losa</span>
          <span>Vista de referencia</span>
        </div>
        <CalculatorSketch
          type="concrete"
          dims={{
            length: { label: 'Largo', value: '5 m' },
            width: { label: 'Ancho', value: '4 m' },
            height: { label: 'Espesor', value: '0,15 m' },
          }}
          className="mx-auto w-full max-w-[27rem]"
        />
      </div>
      <div className="px-5 pb-5 sm:px-7 sm:pb-7">
        <div className="grid grid-cols-3 divide-x divide-shell-line rounded-lg border border-shell-line bg-shell-raised py-3 text-center">
          {[
            ['Largo', '5,00 m'],
            ['Ancho', '4,00 m'],
            ['Espesor', '0,15 m'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[0.6875rem] text-shell-muted">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-shell-fg">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-shell-muted">Volumen antes del desperdicio</p>
            <p className="mt-1 font-display text-5xl font-semibold leading-none text-shell-fg">
              3,00 <span className="text-2xl text-shell-muted">m³</span>
            </p>
          </div>
          <span className="mb-1 rounded-md border border-shell-line px-2.5 py-1.5 text-xs text-shell-muted">
            5 × 4 × 0,15
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-shell-line pt-4">
          <span className="text-xs text-shell-muted">Cemento · Arena · Grava</span>
          <Link
            to="/calculators?tipo=concrete"
            className="inline-flex min-h-10 items-center gap-2 rounded text-sm font-semibold text-accent hover:underline"
          >
            Calcular mi losa <PiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <PublicHeader />
      <main id="contenido">
        <section className="home-hero relative overflow-hidden" aria-labelledby="portada-titulo">
          <div
            aria-hidden="true"
            className="blueprint pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_right,transparent,black)]"
          />
          <div className="site-container relative grid items-center gap-10 pb-10 pt-10 sm:gap-12 sm:pb-12 sm:pt-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 lg:pb-16 lg:pt-16">
            <div className="min-w-0 animate-rise">
              <p className="section-kicker">
                <PiMapPin aria-hidden="true" className="h-4 w-4" />
                Construye con claridad · Nariño
              </p>
              <h1 id="portada-titulo" className="hero-heading mt-6">
                Tu obra empieza
                <br className="hidden sm:block" /> con un buen{' '}
                <span className="hero-highlight">cálculo.</span>
              </h1>
              <p className="mt-6 max-w-[31rem] text-[1.0625rem] leading-relaxed text-ink-muted sm:text-lg">
                Calcula tus materiales, compara precios y organiza el presupuesto. Más claridad para
                cada etapa de tu obra.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to="/calculators"
                  size="lg"
                  iconRight={<PiArrowRight aria-hidden="true" />}
                >
                  Calcular materiales
                </ButtonLink>
                <ButtonLink
                  to="/providers"
                  size="lg"
                  variant="secondary"
                  icon={<PiStorefront aria-hidden="true" />}
                >
                  Explorar precios
                </ButtonLink>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-ink-muted">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text">
                  <PiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                Empieza a calcular sin crear una cuenta.
              </p>
              <div className="mt-8 hidden items-center gap-3 border-t border-line pt-5 text-xs text-ink-subtle lg:flex">
                <PiRuler aria-hidden="true" className="h-4 w-4 text-brand-text" />
                <span>Medidas claras.</span>
                <span aria-hidden="true">/</span>
                <span>Materiales organizados.</span>
                <span aria-hidden="true">/</span>
                <span>Mejores decisiones.</span>
              </div>
            </div>
            <ConstructionPreview />
          </div>
        </section>
        <section className="border-y border-line bg-surface" aria-label="Catálogo de ConstruApp">
          <div className="site-container">
            <CatalogSnapshot />
          </div>
        </section>
        <section
          className="site-container grid gap-7 py-10 md:grid-cols-3 lg:gap-10 lg:py-12"
          aria-label="Herramientas para tu obra"
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <span className="feature-icon">{feature.icon}</span>
              <div>
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{feature.text}</p>
              </div>
            </div>
          ))}
        </section>
        <section
          id="herramientas"
          className="border-y border-line bg-surface-muted"
          aria-labelledby="herramientas-titulo"
        >
          <div className="site-container section-space">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="section-kicker">01 / Herramientas de obra</p>
                <h2 id="herramientas-titulo" className="section-heading mt-3">
                  De los cimientos
                  <br className="sm:hidden" /> a los acabados.
                </h2>
                <p className="mt-3 max-w-xl text-ink-muted">
                  Cada etapa tiene su herramienta. Elige la tuya y empieza con las medidas que ya
                  tienes.
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted">
                {CALCULATOR_IDS.length} calculadoras disponibles
              </span>
            </div>
            <div className="mt-8 sm:mt-10">
              <CalculatorCatalog />
            </div>
          </div>
        </section>
        <section
          id="como-funciona"
          className="site-container section-space"
          aria-labelledby="pasos-titulo"
        >
          <div className="max-w-2xl">
            <p className="section-kicker">02 / Así funciona</p>
            <h2 id="pasos-titulo" className="section-heading mt-3">
              Menos vueltas.
              <br />
              Más claridad para tu obra.
            </h2>
          </div>
          <ol className="workflow-steps mt-9 grid gap-7 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative border-t border-line-strong pt-6">
                <span className="step-number">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="site-container pb-12 sm:pb-16" aria-labelledby="proyecto-titulo">
          <div className="project-callout relative overflow-hidden rounded-2xl bg-shell px-6 py-9 text-shell-fg sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="dark blueprint pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50 [mask-image:linear-gradient(to_right,transparent,black)]"
            />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Tu próxima obra, mejor organizada
                </p>
                <h2
                  id="proyecto-titulo"
                  className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl"
                >
                  Dale un lugar a cada proyecto.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-shell-muted sm:text-base">
                  Guarda tus cálculos, reúne tu lista de materiales y ten el presupuesto de tus
                  obras siempre a mano.
                </p>
              </div>
              <ButtonLink
                to="/register"
                size="lg"
                iconRight={<PiArrowUpRight aria-hidden="true" />}
                className="shrink-0 md:self-center"
              >
                Crear mi cuenta
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="site-container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              De las primeras medidas a la lista de materiales.
              <br />
              Hecha para construir en Nariño.
            </p>
          </div>
          <nav
            aria-label="Enlaces del pie de página"
            className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-ink-muted"
          >
            <Link to="/calculators" className="rounded hover:text-brand-text">
              Calculadoras
            </Link>
            <Link to="/providers" className="rounded hover:text-brand-text">
              Materiales y precios
            </Link>
            <Link to="/login" className="rounded hover:text-brand-text">
              Mi cuenta
            </Link>
          </nav>
          <div className="flex flex-col justify-between gap-4 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-xs leading-relaxed text-ink-subtle">
              Las cantidades y los costos son estimados. Confirma disponibilidad, impuestos y
              transporte con cada comercio antes de comprar.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
