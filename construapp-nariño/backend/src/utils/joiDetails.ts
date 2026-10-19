import type { ValidationError } from 'joi';

/**
 * Convierte un error de Joi en `{ campo: mensaje }` (un mensaje por campo),
 * sin las comillas que Joi pone alrededor de los nombres.
 */
export function joiDetails(error: ValidationError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const d of error.details) {
    const key = d.path.join('.') || String(d.context?.key ?? 'valor');
    details[key] = d.message.replace(/"/g, '');
  }
  return details;
}

export default joiDetails;
