import { createClient, type RedisClientType } from 'redis';
import logger from './logger.js';

const url =
  process.env.REDIS_URL ??
  `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? '6379'}`;

const redisClient: RedisClientType = createClient({
  url,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    // La caché es opcional: reintenta unas pocas veces y se rinde en vez de
    // reconectar para siempre inundando el log.
    reconnectStrategy: (retries) => (retries >= 5 ? false : Math.min(retries * 300, 2000)),
  },
});

let connected = false;
let loggedFailure = false;

redisClient.on('error', (err: Error & { errors?: Error[]; code?: string }) => {
  connected = false;
  // Registra el fallo una sola vez.
  if (!loggedFailure) {
    const detail =
      err.errors?.map((e) => e.message).join('; ') || err.code || err.message || 'sin detalle';
    logger.warn(`Redis no disponible, la caché queda deshabilitada: ${detail}`);
    loggedFailure = true;
  }
});
redisClient.on('ready', () => {
  connected = true;
  loggedFailure = false;
  logger.info('🔴 Redis conectado');
});

/**
 * Intenta conectar a Redis. No lanza: la caché es opcional en el MVP.
 * Devuelve `true` solo si la conexión quedó lista.
 */
export async function connectRedis(): Promise<boolean> {
  try {
    await redisClient.connect();
  } catch {
    // El handler `on('error')` ya registró el detalle.
    connected = false;
  }
  return connected;
}

/** Cierra la conexión a Redis (usado en el apagado ordenado). */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.isOpen) await redisClient.quit();
  } catch {
    /* nada que hacer al apagar */
  }
}

export function isRedisConnected(): boolean {
  return connected;
}

export { redisClient };
export default redisClient;
