import clsx from 'clsx';
import type { ReactNode } from 'react';

interface StatTileProps {
  label: string;
  /** Cifra principal, ya formateada (compacta si es grande). */
  value: ReactNode;
  /** Valor exacto, visible al pasar el cursor cuando `value` está abreviado. */
  title?: string;
  /** Línea de contexto bajo la cifra. */
  caption?: ReactNode;
  icon?: ReactNode;
  /** Contenido extra entre la cifra y el contexto (p. ej. un medidor). */
  children?: ReactNode;
  className?: string;
  /** Resumen compacto en móvil, con el detalle completo a partir de tablet. */
  compactOnMobile?: boolean;
}

/** Cifra de cabecera: etiqueta, valor y contexto. */
export default function StatTile({
  label,
  value,
  title,
  caption,
  icon,
  children,
  className,
  compactOnMobile = false,
}: StatTileProps) {
  return (
    <div
      className={clsx(
        'card flex min-w-0 flex-col border-t-2 border-t-brand/30',
        compactOnMobile ? 'p-3 sm:p-5' : 'p-4 sm:p-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={clsx(
            'font-medium text-ink-muted',
            compactOnMobile ? 'text-xs sm:text-sm' : 'text-sm'
          )}
        >
          {label}
        </p>
        {icon && (
          <span
            aria-hidden="true"
            className={clsx(
              'h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-brand-text [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]',
              compactOnMobile ? 'hidden sm:flex' : 'flex'
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {/* Cifras proporcionales: las tabulares se reservan para columnas */}
      <p
        className={clsx(
          'break-words font-display font-semibold leading-tight tracking-tight text-ink sm:text-[2.5rem]',
          compactOnMobile ? 'mt-auto pt-2 text-2xl sm:mt-4 sm:pt-0' : 'mt-4 text-[2rem]'
        )}
        title={title}
      >
        {value}
      </p>
      {children}
      {caption && (
        <p
          className={clsx(
            'mt-2 text-xs leading-relaxed text-ink-subtle',
            compactOnMobile && 'hidden sm:block'
          )}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
