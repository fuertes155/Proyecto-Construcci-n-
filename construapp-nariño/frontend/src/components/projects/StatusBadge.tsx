import type { ReactNode } from 'react';
import { PiCheckCircleFill, PiCompassToolFill, PiHammerFill } from 'react-icons/pi';
import type { ProjectStatus } from '../../services/projects';
import Badge, { type BadgeTone } from '../ui/Badge';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: 'Planificación',
  'in-progress': 'En progreso',
  finished: 'Finalizado',
};

const STATUS_STYLE: Record<ProjectStatus, { tone: BadgeTone; icon: ReactNode }> = {
  planning: { tone: 'neutral', icon: <PiCompassToolFill aria-hidden="true" /> },
  'in-progress': { tone: 'info', icon: <PiHammerFill aria-hidden="true" /> },
  finished: { tone: 'success', icon: <PiCheckCircleFill aria-hidden="true" /> },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const { tone, icon } = STATUS_STYLE[status];
  return (
    <Badge tone={tone} icon={icon}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
