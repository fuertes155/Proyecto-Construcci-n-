import clsx from 'clsx';
import { Link } from 'react-router-dom';

/** Isotipo: aparejo de ladrillo (mampostería a soga) dentro de un bloque. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-brand" />
      <g fill="#fff">
        <rect x="7" y="7" width="8" height="4.5" rx="1" />
        <rect x="17" y="7" width="8" height="4.5" rx="1" />
        <rect x="7" y="13.75" width="3" height="4.5" rx="1" />
        <rect x="12" y="13.75" width="8" height="4.5" rx="1" />
        <rect x="22" y="13.75" width="3" height="4.5" rx="1" />
        <rect x="7" y="20.5" width="8" height="4.5" rx="1" />
        <rect x="17" y="20.5" width="8" height="4.5" rx="1" />
      </g>
    </svg>
  );
}

interface LogoProps {
  /** Destino del enlace; sin él se renderiza como texto simple. */
  to?: string;
  /** `inverse` para fondos oscuros (barra lateral, portada). */
  tone?: 'default' | 'inverse';
  className?: string;
}

export default function Logo({ to, tone = 'default', className }: LogoProps) {
  const content = (
    <>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            'font-display text-[1.375rem] font-bold leading-none',
            tone === 'inverse' ? 'text-shell-fg' : 'text-ink'
          )}
        >
          Constru
          <span className={tone === 'inverse' ? 'text-accent' : 'text-brand-text'}>App</span>
        </span>
        <span
          className={clsx(
            'mt-1 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.22em]',
            tone === 'inverse' ? 'text-shell-muted' : 'text-ink-subtle'
          )}
        >
          Nariño
        </span>
      </span>
    </>
  );

  const classes = clsx('inline-flex items-center gap-2.5 rounded-md', className);

  if (!to) return <span className={classes}>{content}</span>;
  return (
    <Link to={to} className={classes} aria-label="ConstruApp Nariño, ir al inicio">
      {content}
    </Link>
  );
}
