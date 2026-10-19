import { PiArrowLeft, PiCalculator } from 'react-icons/pi';
import Logo from '../components/Logo';
import { ButtonLink } from '../components/ui/Button';

/** Ruta desconocida: en vez de una pantalla en blanco, un camino de vuelta. */
export default function NotFound() {
  return (
    <div className="blueprint flex min-h-dvh flex-col bg-canvas px-4 py-5 text-ink sm:px-8">
      <Logo to="/" />
      <main className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <p className="font-display text-8xl font-bold leading-none text-brand-text">404</p>
        <h1 className="title-page mt-4">Esta página no existe</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          Puede que el enlace esté incompleto o que la página se haya movido.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/" icon={<PiArrowLeft aria-hidden="true" />}>
            Volver al inicio
          </ButtonLink>
          <ButtonLink
            to="/calculators"
            variant="secondary"
            icon={<PiCalculator aria-hidden="true" />}
          >
            Ir a las calculadoras
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
