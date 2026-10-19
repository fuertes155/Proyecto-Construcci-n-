import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

/**
 * Exige un access token válido en `Authorization: Bearer <token>`.
 * Deja el usuario en `req.user`. En caso contrario responde 401.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Falta el token de autenticación'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized('Token inválido o expirado'));
  }
};

/** Restringe la ruta a determinados roles (RBAC). Usar después de `requireAuth`. */
export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('No tienes permiso para esta acción'));
    }
    next();
  };

export default requireAuth;
