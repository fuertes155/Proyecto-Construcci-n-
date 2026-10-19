import clsx from 'clsx';
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { PiEye, PiEyeSlash, PiWarningCircleFill } from 'react-icons/pi';

interface FieldMeta {
  /** `id` del control; enlaza la etiqueta, la ayuda y el error. */
  id: string;
  label: ReactNode;
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: ReactNode;
  /** Mensaje de validación. */
  error?: string;
  /** Marca el campo como opcional junto a la etiqueta. */
  optional?: boolean;
  /** Clases del contenedor (p. ej. `sm:col-span-2`). */
  wrapperClassName?: string;
}

/** ids de la ayuda/error para `aria-describedby`. */
function describedBy(id: string, hint: ReactNode, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  wrapperClassName,
  srSuffix,
  children,
}: FieldMeta & { srSuffix?: string; children: ReactNode }) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="label">
        {label}
        {srSuffix && <span className="sr-only"> ({srSuffix})</span>}
        {optional && <span className="ml-1.5 font-normal text-ink-subtle">Opcional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          <PiWarningCircleFill aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ texto --- */

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>,
    FieldMeta {
  /** Icono decorativo al inicio. */
  icon?: ReactNode;
  /** Unidad o sufijo dentro del campo: m, cm, %, COP… */
  suffix?: string;
  /** Control interactivo al final (p. ej. mostrar/ocultar contraseña). */
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, hint, error, optional, wrapperClassName, icon, suffix, trailing, className, ...rest },
  ref
) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      wrapperClassName={wrapperClassName}
      srSuffix={suffix}
    >
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-ink-subtle [&>svg]:h-5 [&>svg]:w-5"
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx('input', icon && 'pl-10', (suffix || trailing) && 'pr-12', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-semibold text-ink-subtle"
          >
            {suffix}
          </span>
        )}
        {trailing && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-0.5">{trailing}</span>
        )}
      </div>
    </FieldShell>
  );
});

/* ------------------------------------------------------------- contraseña --- */

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'type' | 'trailing'>>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            className="icon-btn"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <PiEyeSlash aria-hidden="true" /> : <PiEye aria-hidden="true" />}
          </button>
        }
        {...props}
      />
    );
  }
);

/* ----------------------------------------------------------------- select --- */

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>,
    FieldMeta {}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { id, label, hint, error, optional, wrapperClassName, className, children, ...rest },
  ref
) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      wrapperClassName={wrapperClassName}
    >
      <select
        ref={ref}
        id={id}
        className={clsx('input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});

/* --------------------------------------------------------------- textarea --- */

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>,
    FieldMeta {}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField(
    { id, label, hint, error, optional, wrapperClassName, className, ...rest },
    ref
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        wrapperClassName={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={id}
          className={clsx('input', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        />
      </FieldShell>
    );
  }
);
