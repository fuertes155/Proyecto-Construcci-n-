import type { RequestHandler } from 'express';

/**
 * Envuelve un handler asíncrono para que los errores (promesas rechazadas)
 * lleguen a `next()` y por tanto al `errorHandler`. Express 4 no lo hace solo.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
