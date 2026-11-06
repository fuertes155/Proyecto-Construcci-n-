import type { CSSProperties, ReactNode } from 'react';
import { PiArrowLeft, PiCalculator, PiFolders, PiStorefront } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import CalculatorSketch from './calculators/CalculatorSketch';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const HIGHLIGHTS = [
  {
    icon: <PiCalculator aria-hidden="true" />,
    title: 'Calcula con medidas reales',
    text: 'Hormigón, acero, muros, pisos y pintura con el desperdicio incluido.',
  },
  {
    icon: <PiStorefront aria-hidden="true" />,
    title: 'Consulta antes de comprar',
    text: 'Costos con precios publicados por comercios de Pasto y Colombia.',
  },
  {
    icon: <PiFolders aria-hidden="true" />,
    title: 'Organiza cada etapa',
    text: 'Proyectos para seguir cada obra frente a su presupuesto.',
  },
];

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  /** Enlaces bajo el formulario (p. ej. "¿No tienes cuenta?"). */
  footer?: ReactNode;
  children: ReactNode;
}

/** Marco de las pantallas de acceso: panel de marca a la izquierda y formulario a la derecha. */
export default function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="workspace-shell grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* `dark` fija aquí los tokens oscuros: el panel es oscuro en ambos temas. */}
      <aside className="dark blueprint relative hidden flex-col justify-between gap-8 overflow-hidden border-r border-shell-line bg-shell p-10 text-ink lg:flex xl:p-12">
        <Logo to="/" tone="inverse" />

        <div>
          <div
            className="max-w-md rounded-2xl border border-shell-line bg-shell/70 p-5"
            style={{ '--sketch-halo': 'rgb(var(--shell))' } as CSSProperties}
          >
            <CalculatorSketch type="concrete" />
          </div>
          <p className="section-kicker mt-8 text-accent">De la idea a la obra</p>
          <p className="mt-3 max-w-md font-display text-[clamp(2.5rem,3.6vw,3.5rem)] font-semibold leading-[1.04] tracking-tight">
            Más claridad para construir.
          </p>
          <ul className="mt-8 max-w-md space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-shell-line bg-shell-raised text-accent [&>svg]:h-5 [&>svg]:w-5">
                  {item.icon}
                </span>
                <div>
                  <p className="font-semibold text-shell-fg">{item.title}</p>
                  <p className="mt-1 leading-relaxed">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-ink-subtle">Materiales de construcción · Nariño, Colombia</p>
      </aside>

      <main className="flex min-w-0 flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Logo to="/" className="lg:hidden" />
          <Link
            to="/"
            className="hidden min-h-11 items-center gap-2 rounded text-sm font-semibold text-ink-muted hover:text-brand-text lg:inline-flex"
          >
            <PiArrowLeft aria-hidden="true" />
            Volver al inicio
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="auth-card animate-rise">
            <p className="section-kicker mb-3">Tu espacio de obra</p>
            <h1 className="title-page">{title}</h1>
            {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && (
              <div className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-muted">
                {footer}
              </div>
            )}
          </div>
        </div>
        <Link
          to="/calculators"
          className="mx-auto mb-2 inline-flex min-h-11 items-center gap-2 rounded text-center text-sm font-semibold text-ink-muted hover:text-brand-text"
        >
          <PiCalculator aria-hidden="true" className="shrink-0" />
          Explorar calculadoras sin iniciar sesión
        </Link>
      </main>
    </div>
  );
}
