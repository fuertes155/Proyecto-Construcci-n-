import type { CSSProperties, ReactNode } from 'react';
import { PiCalculator, PiFolders, PiStorefront } from 'react-icons/pi';
import CalculatorSketch from './calculators/CalculatorSketch';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const HIGHLIGHTS = [
  {
    icon: <PiCalculator aria-hidden="true" />,
    text: 'Hormigón, acero, muros, pisos y pintura con el desperdicio incluido.',
  },
  {
    icon: <PiStorefront aria-hidden="true" />,
    text: 'Costos con precios de proveedores locales de Nariño.',
  },
  {
    icon: <PiFolders aria-hidden="true" />,
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
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* `dark` fija aquí los tokens oscuros: el panel es oscuro en ambos temas. */}
      <aside className="dark blueprint relative hidden flex-col justify-between gap-10 overflow-hidden bg-shell p-12 text-ink lg:flex">
        <Logo to="/" tone="inverse" />

        <div>
          <div
            className="max-w-md"
            style={{ '--sketch-halo': 'rgb(var(--shell))' } as CSSProperties}
          >
            <CalculatorSketch type="concrete" />
          </div>
          <p className="mt-8 max-w-md font-display text-5xl font-semibold leading-[1.02]">
            Calcula materiales con precisión.
          </p>
          <ul className="mt-8 max-w-md space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-ink-muted">
                <span className="mt-0.5 text-accent [&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-ink-subtle">Materiales de construcción · Nariño, Colombia</p>
      </aside>

      <main className="flex flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo to="/" className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem] animate-rise">
            <h1 className="title-page">{title}</h1>
            {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-8 border-t border-line pt-6 text-center text-sm text-ink-muted">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
