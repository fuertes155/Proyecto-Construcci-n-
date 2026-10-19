const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Espacio de no separación: el mismo que pone el formato de moneda de es-CO tras el "$". */
const NBSP = String.fromCharCode(160);

/** Formatea un monto en pesos colombianos: 1165490 → "$ 1.165.490". */
export function formatCOP(value: number | null): string {
  if (value === null) return '—';
  return cop.format(value);
}

/**
 * Monto abreviado para cifras de cabecera: 1165490 → "$ 1,2 M" (millones).
 * Por debajo de un millón se muestra completo.
 */
export function formatCOPCompact(value: number): string {
  if (Math.abs(value) < 1_000_000) return cop.format(value);
  const millions = value / 1_000_000;
  const amount = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: Math.abs(millions) < 100 ? 1 : 0,
  }).format(millions);
  return ['$', amount, 'M'].join(NBSP);
}

/** Formatea una cantidad con hasta 2 decimales, sin ceros de más: 1.50 → "1.5". */
export function formatQty(value: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
}

/** Formatea un porcentaje con hasta 1 decimal: 41.67 → "41,7%". */
export function formatPct(value: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)}%`;
}

/** Fecha corta para tablas: "13/10/2026". */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('es-CO');
}

/** Fecha y hora: "13/10/2026, 10:00 a. m.". */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Fecha de calendario sin hora ("2026-10-13" → "13 de oct de 2026"). Se interpreta
 * en UTC para que no se corra un día por la zona horaria.
 */
export function formatDay(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
