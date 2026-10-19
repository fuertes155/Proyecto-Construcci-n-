import clsx from 'clsx';
import { PiCircleNotchBold } from 'react-icons/pi';

/** Indicador de actividad; decorativo: el texto de al lado dice qué se está cargando. */
export default function Spinner({ className }: { className?: string }) {
  return <PiCircleNotchBold aria-hidden="true" className={clsx('animate-spin', className)} />;
}

interface LoaderProps {
  label?: string;
  /** Ocupa toda la pantalla (fuera del marco de la app) en vez del área de contenido. */
  fullScreen?: boolean;
}

/** Estado de carga centrado: al restaurar la sesión o al abrir una ruta protegida. */
export function Loader({ label = 'Cargando…', fullScreen = false }: LoaderProps) {
  return (
    <div
      role="status"
      className={clsx(
        'flex items-center justify-center gap-3 text-ink-muted',
        fullScreen ? 'min-h-dvh bg-canvas' : 'min-h-[50vh]'
      )}
    >
      <Spinner className="h-5 w-5 text-brand-text" />
      <p className="font-medium">{label}</p>
    </div>
  );
}
