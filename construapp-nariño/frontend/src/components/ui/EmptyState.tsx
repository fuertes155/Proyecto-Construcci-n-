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
        'flex flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-14',
        !bare && 'card blueprint',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/15 bg-brand-soft text-brand-text shadow-card [&>svg]:h-8 [&>svg]:w-8"
      >
        {icon}
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink">{title}</h2>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
