import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import logger from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

/** 404 uniforme para cualquier ruta no registrada. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    status: 404,
    path: req.originalUrl,
    method: req.method,
  });
};

/**
 * Manejador de errores global. Debe registrarse el **último**, después de las
 * rutas. Traduce cada tipo de error a una respuesta JSON con la misma forma:
 *   { error: string, status: number, details?: unknown }
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // 1. Errores de dominio (ApiError)
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error(`${req.method} ${req.originalUrl} → ${err.status}: ${err.message}`);
    }
    return res.status(err.status).json({
      error: err.message,
      status: err.status,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
  }

  // 2. Errores de validación de Sequelize (unique, notNull, isEmail, …)
  if (err instanceof SequelizeValidationError) {
    const details: Record<string, string> = {};
    for (const e of err.errors) details[e.path ?? 'campo'] = e.message;
    return res.status(400).json({ error: 'Validación fallida', status: 400, details });
  }

  // 3. JSON malformado en el cuerpo (lo lanza express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    return res
      .status(400)
      .json({ error: 'JSON inválido en el cuerpo de la petición', status: 400 });
  }

  // 4. Cualquier otra cosa: 500 uniforme, siempre registrado
  const e = err as Error;
  logger.error(`${req.method} ${req.originalUrl} → 500: ${e.stack ?? e.message ?? String(err)}`);
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : e.message || 'Error interno del servidor',
    status: 500,
  });
};

export default errorHandler;
