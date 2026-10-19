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
}: StatTileProps) {
  return (
    <div className={clsx('card flex min-w-0 flex-col p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {icon && (
          <span aria-hidden="true" className="text-ink-subtle [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        )}
      </div>
      {/* Cifras proporcionales: las tabulares se reservan para columnas */}
      <p className="mt-3 text-2xl font-semibold leading-none text-ink sm:text-[2rem]" title={title}>
        {value}
      </p>
      {children}
      {caption && <p className="mt-2 text-sm text-ink-subtle">{caption}</p>}
    </div>
  );
}
