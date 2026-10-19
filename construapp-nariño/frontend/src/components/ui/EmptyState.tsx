import clsx from 'clsx';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Siguiente paso sugerido (botón o enlace). */
  action?: ReactNode;
  /** Sin tarjeta propia, para usarlo dentro de otra tarjeta. */
  bare?: boolean;
  className?: string;
}

/** Estado vacío: explica qué va aquí y cuál es el siguiente paso. */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  bare = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center px-6 py-12 text-center',
        !bare && 'card blueprint',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-surface text-brand-text shadow-card [&>svg]:h-7 [&>svg]:w-7"
      >
        {icon}
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-md text-ink-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
