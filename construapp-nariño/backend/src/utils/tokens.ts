import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import logger from '../config/logger.js';

const FALLBACK_SECRET = 'dev-insecure-secret-change-me';
const SECRET: string = process.env.JWT_SECRET || FALLBACK_SECRET;

if (SECRET === FALLBACK_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en producción.');
  }
  if (process.env.NODE_ENV !== 'test') {
    logger.warn('JWT_SECRET no definido: usando un secreto de desarrollo inseguro.');
  }
}

/** TTL del access token (formato de `jsonwebtoken`: "15m", "1h", "7d"…). */
const ACCESS_TTL = process.env.JWT_EXPIRE || '15m';
/** Vida del refresh token en días. */
const REFRESH_TTL_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS || '30', 10);

export interface AccessTokenPayload {
  sub: string; // user id
  role: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL } as SignOptions);
}

/** Verifica y decodifica un access token. Lanza si es inválido o expiró. */
export function verifyAccessToken(token: string): AccessTokenPayload & jwt.JwtPayload {
  return jwt.verify(token, SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

/** El valor legible que devolvemos al cliente como `expiresIn`. */
export const accessTokenTtl = ACCESS_TTL;

/** Genera un refresh token opaco: se devuelve el valor en claro y su hash. */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(40).toString('hex');
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function refreshTokenExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** Minutos de validez del enlace de recuperación de contraseña. */
export const PASSWORD_RESET_TTL_MIN = parseInt(
  process.env.PASSWORD_RESET_EXPIRE_MINUTES || '30',
  10
);

/** Token de recuperación: valor opaco + su hash (como el refresh token). */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
}

export function resetTokenExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + PASSWORD_RESET_TTL_MIN * 60 * 1000);
}
