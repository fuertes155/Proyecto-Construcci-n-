import { PiMagnifyingGlass, PiX } from 'react-icons/pi';

interface SearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Búsqueda con nombre accesible y acción para recuperar la colección completa. */
export default function SearchInput({
  label,
  value,
  onChange,
  placeholder = 'Buscar…',
  className,
}: SearchInputProps) {
  return (
    <div className={`relative min-w-0 ${className ?? ''}`}>
      <PiMagnifyingGlass
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input pl-11 pr-12 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label={`Limpiar: ${label}`}
          onClick={() => onChange('')}
          className="icon-btn absolute right-0.5 top-1/2 -translate-y-1/2"
        >
          <PiX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
