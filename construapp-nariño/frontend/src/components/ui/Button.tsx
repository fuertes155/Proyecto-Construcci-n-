import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import Spinner from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-ghost'
  | 'on-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Nombres completos (no interpolados) para que Tailwind detecte las clases.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  'danger-ghost': 'btn-danger-ghost',
  'on-dark': 'btn-on-dark',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Icono inicial. */
  icon?: ReactNode;
  /** Icono final. */
  iconRight?: ReactNode;
}

function buttonClasses(
  { variant = 'primary', size = 'md', fullWidth }: ButtonStyleProps,
  className?: string
) {
  return clsx('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  /** Muestra un indicador de actividad y bloquea el botón. */
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    fullWidth,
    icon,
    iconRight,
    loading = false,
    disabled,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export default Button;

/** Enlace de navegación con apariencia de botón. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: LinkProps & ButtonStyleProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth }, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /** Nombre accesible; también se muestra como tooltip. */
  label: string;
  tone?: 'neutral' | 'danger';
  children: ReactNode;
}

/** Botón de solo icono. Siempre lleva nombre accesible. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, tone = 'neutral', type = 'button', className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={clsx('icon-btn', tone === 'danger' && 'icon-btn-danger', className)}
      {...rest}
    >
      {children}
    </button>
  );
});
