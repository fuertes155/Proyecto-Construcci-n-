import clsx from 'clsx';
import type { ReactNode } from 'react';
import { PiCheckCircleFill, PiInfoFill, PiWarningFill, PiXCircleFill } from 'react-icons/pi';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONE: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: 'bg-info-soft text-info-text', icon: <PiInfoFill aria-hidden="true" /> },
  success: {
    box: 'bg-success-soft text-success-text',
    icon: <PiCheckCircleFill aria-hidden="true" />,
  },
  warning: {
    box: 'bg-warning-soft text-warning-text',
    icon: <PiWarningFill aria-hidden="true" />,
  },
  danger: { box: 'bg-danger-soft text-danger-text', icon: <PiXCircleFill aria-hidden="true" /> },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  /** Acción asociada (p. ej. "Reintentar"). */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** Mensaje en línea con icono: avisos, errores de carga y confirmaciones. */
export default function Alert({ tone = 'info', title, action, className, children }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-3 rounded-lg px-4 py-3 text-sm',
        TONE[tone].box,
        className
      )}
    >
      <span className="mt-0.5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{TONE[tone].icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'mt-0.5')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
