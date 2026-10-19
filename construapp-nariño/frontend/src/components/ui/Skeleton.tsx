import clsx from 'clsx';

/** Bloque de carga: reserva el espacio del contenido mientras llega. */
export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('skeleton', className)} />;
}

/** Filas de carga para tablas (dentro de una tarjeta). */
export function TableSkeleton({ rows = 5, label }: { rows?: number; label: string }) {
  return (
    <div className="card divide-y divide-line" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
