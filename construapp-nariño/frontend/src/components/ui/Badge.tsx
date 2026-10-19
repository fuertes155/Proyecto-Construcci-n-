import clsx from 'clsx';
import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-surface-strong text-ink-muted',
  info: 'bg-info-soft text-info-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
  brand: 'bg-brand-soft text-brand-text',
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Icono inicial: un estado nunca se comunica solo con color. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none [&>svg]:h-3.5 [&>svg]:w-3.5',
        TONE_CLASS[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
