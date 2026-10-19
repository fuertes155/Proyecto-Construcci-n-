import { PiCaretRight, PiMapPin } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import type { ProjectListItem } from '../../services/projects';
import { formatDate } from '../../utils/format';
import BudgetSummary from './BudgetSummary';
import StatusBadge from './StatusBadge';

interface ProjectCardProps {
  project: ProjectListItem;
  /** Nivel del título según dónde se use la tarjeta. */
  titleAs?: 'h2' | 'h3';
}

/** Tarjeta de un proyecto: estado, presupuesto y acceso al detalle. */
export default function ProjectCard({ project, titleAs: Title = 'h2' }: ProjectCardProps) {
  const count = project.summary.totalCalculations;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card card-interactive group flex min-w-0 flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Title className="truncate text-lg font-semibold text-ink">{project.name}</Title>
          {project.location && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
              <PiMapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.location}</span>
            </p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <BudgetSummary summary={project.summary} />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-sm text-ink-subtle">
        <span>
          {count} cálculo{count === 1 ? '' : 's'} · Actualizado {formatDate(project.updatedAt)}
        </span>
        <PiCaretRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text"
        />
      </div>
    </Link>
  );
}
