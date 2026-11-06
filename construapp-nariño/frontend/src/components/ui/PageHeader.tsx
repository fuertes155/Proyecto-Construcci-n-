import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Rótulo corto sobre el título (sección o contexto). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Acciones principales de la página. */
  actions?: ReactNode;
}

/** Encabezado común de página: rótulo, título, descripción y acciones. */
export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="section-kicker mb-2.5">{eyebrow}</p>}
        <h1 className="title-page">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
