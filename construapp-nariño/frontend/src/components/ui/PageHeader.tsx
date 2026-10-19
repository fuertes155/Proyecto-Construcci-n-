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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="title-page">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
