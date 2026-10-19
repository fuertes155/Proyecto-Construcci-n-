import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { joiDetails } from '../utils/joiDetails.js';

type Source = 'body' | 'query' | 'params';

/**
 * Middleware de validación con Joi.
 *
 *   router.post('/projects', validate(createProjectSchema), controller.create);
 *
 * - `abortEarly: false` → devuelve TODOS los errores de una vez.
 * - `stripUnknown: true` → descarta campos no declarados en el esquema.
 * - `convert: true` → castea tipos ("5" → 5). El valor saneado reemplaza al original.
 *
 * Si falla, pasa un `ApiError` 400 con `details` (un mensaje por campo) al
 * `errorHandler`.
 */
export function validate(schema: ObjectSchema, source: Source = 'body'): RequestHandler {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(new ApiError(400, 'Validación fallida', joiDetails(error)));
    }

    // Reemplaza con el valor saneado/convertido (para `query`/`params` se hace
    // in-place: en Express 5 son de solo lectura).
    if (source === 'body') {
      req.body = value;
    } else {
      Object.keys(req[source]).forEach((k) => delete (req[source] as Record<string, unknown>)[k]);
      Object.assign(req[source], value);
    }
    next();
  };
}

export default validate;
