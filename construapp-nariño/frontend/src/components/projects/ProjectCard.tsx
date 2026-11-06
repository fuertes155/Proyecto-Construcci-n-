import { PiArrowUpRight, PiCalculator, PiFolderOpen, PiMapPin } from 'react-icons/pi';
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
      <div className="flex items-center justify-between gap-3">
        <span className="feature-icon">
          <PiFolderOpen aria-hidden="true" />
        </span>
        <StatusBadge status={project.status} />
      </div>
      <div className="min-w-0">
        <Title className="line-clamp-2 break-words font-display text-2xl font-semibold leading-tight text-ink group-hover:text-brand-text">
          {project.name}
        </Title>
        {project.location && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
            <PiMapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate">{project.location}</span>
          </p>
        )}
      </div>

      <div className="rounded-lg bg-surface-muted p-4">
        <BudgetSummary summary={project.summary} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-sm text-ink-subtle">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium text-ink-muted">
            <PiCalculator aria-hidden="true" className="h-4 w-4 shrink-0" />
            {count} cálculo{count === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs">Actualizado {formatDate(project.updatedAt)}</p>
        </div>
        <PiArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text"
        />
      </div>
    </Link>
  );
}
