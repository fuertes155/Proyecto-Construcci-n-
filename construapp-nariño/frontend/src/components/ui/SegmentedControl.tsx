import { Radio, RadioGroup } from '@headlessui/react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  /** Nombre accesible del grupo. */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  disabled?: boolean;
  /** Solo iconos: la etiqueta queda como nombre accesible y tooltip. */
  iconOnly?: boolean;
  /** `shell` para paneles oscuros (barra lateral). */
  tone?: 'default' | 'shell';
  className?: string;
}

/** Selector de una opción entre pocas, todas a la vista (grupo de radios). */
export default function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  iconOnly = false,
  tone = 'default',
  className,
}: SegmentedControlProps<T>) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      aria-label={label}
      disabled={disabled}
      className={clsx(
        'inline-flex gap-1 rounded-md p-1',
        tone === 'shell' ? 'bg-shell-raised' : 'bg-surface-strong',
        disabled && 'opacity-60',
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          aria-label={iconOnly ? option.label : undefined}
          title={iconOnly ? option.label : undefined}
          className={clsx(
            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded font-semibold transition data-[disabled]:cursor-not-allowed [&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]',
            // Con texto, algo más compacto en móvil para que tres opciones quepan en 320 px
            iconOnly ? 'h-8 w-9' : 'min-h-[2.25rem] px-2 text-[0.8125rem] sm:px-3 sm:text-sm',
            tone === 'shell'
              ? 'text-shell-muted hover:text-shell-fg data-[checked]:bg-shell-active data-[checked]:text-shell-fg'
              : 'text-ink-muted hover:text-ink data-[checked]:bg-surface data-[checked]:text-ink data-[checked]:shadow-card'
          )}
        >
          {option.icon}
          {!iconOnly && option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
