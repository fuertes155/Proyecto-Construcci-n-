import clsx from 'clsx';

export type MeterTone = 'info' | 'warning' | 'danger';

// El relleno lleva la severidad y la pista es un paso claro de la misma rampa,
// de modo que el estado se lee en toda la barra.
const TONE_CLASS: Record<MeterTone, { track: string; fill: string }> = {
  info: { track: 'bg-info-soft', fill: 'bg-info' },
  warning: { track: 'bg-warning-soft', fill: 'bg-warning' },
  danger: { track: 'bg-danger-soft', fill: 'bg-danger' },
};

interface MeterProps {
  /** Porcentaje 0–100 (se recorta si se pasa). */
  value: number;
  tone?: MeterTone;
  /** Qué mide: nombre accesible. */
  label: string;
  /** Lectura en palabras para lectores de pantalla (p. ej. "42% del presupuesto"). */
  valueText?: string;
  className?: string;
}

/** Medidor de una proporción frente a un límite (p. ej. costo sobre presupuesto). */
export default function Meter({ value, tone = 'info', label, valueText, className }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-valuetext={valueText}
      className={clsx('h-2 w-full overflow-hidden rounded-full', TONE_CLASS[tone].track, className)}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-[width] duration-500 ease-out',
          TONE_CLASS[tone].fill
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
