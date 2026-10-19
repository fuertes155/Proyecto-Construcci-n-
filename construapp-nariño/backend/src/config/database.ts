import path from 'path';
import { Sequelize, type Options } from 'sequelize';
import logger from './logger.js';

/**
 * Dialecto de base de datos (variable `DB_DIALECT`):
 * - `postgres` (por defecto): usa docker-compose (`docker compose up -d postgres`).
 * - `sqlite`: base de datos en archivo, sin infraestructura, para desarrollo rápido.
 */
const requested = process.env.DB_DIALECT ?? 'postgres';
if (requested !== 'postgres' && requested !== 'sqlite') {
  throw new Error(
    `DB_DIALECT no válido: "${requested}". Valores admitidos: "postgres" | "sqlite".`
  );
}
const dialect: 'postgres' | 'sqlite' = requested;

const common: Options = {
  dialect,
  // SQL en el log solo si DB_LOGGING=true (por defecto, silencioso).
  logging: process.env.DB_LOGGING === 'true' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    freezeTableName: false,
  },
};

const sequelize =
  dialect === 'sqlite'
    ? new Sequelize({
        ...common,
        storage:
          process.env.DB_STORAGE ?? path.resolve(process.cwd(), 'data/construapp.sqlite'),
      })
    : new Sequelize(
        process.env.DB_NAME ?? 'construapp_narino',
        process.env.DB_USER ?? 'construapp_user',
        process.env.DB_PASSWORD ?? 'construapp_password',
        {
          ...common,
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5433', 10),
          pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
          // Un solo reintento rápido: el servidor no debe quedarse colgado
          // 30 s en el arranque si la base no está.
          retry: { max: 1 },
        }
      );

let connected = false;

/**
 * Intenta autenticar contra la base de datos.
 * No lanza: si falla, el servidor sigue arrancando y `isDatabaseConnected()`
 * devuelve `false` (visible en `GET /api/status`).
 */
export async function connectDatabase(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    connected = true;
    logger.info(`🗄️  Base de datos conectada (${dialect})`);
  } catch (error) {
    connected = false;
    // Sequelize suele poner la causa real (ECONNREFUSED, auth, etc.) en `.original`.
    const err = error as Error & { original?: Error; parent?: Error };
    const detail =
      err.original?.message ||
      err.parent?.message ||
      err.message ||
      err.name ||
      'sin detalle';
    logger.error(
      `No se pudo conectar a la base de datos (${dialect}). ` +
        `El servidor sigue en marcha; revisa DB_* en backend/.env o ejecuta ` +
        `"docker compose up -d postgres". Detalle: ${detail}`
    );
  }
  return connected;
}

/** Cierra el pool de conexiones (usado en el apagado ordenado). */
export async function disconnectDatabase(): Promise<void> {
  try {
    await sequelize.close();
  } catch {
    /* nada que hacer al apagar */
  } finally {
    connected = false;
  }
}

export function isDatabaseConnected(): boolean {
  return connected;
}

export { sequelize, dialect };
export default sequelize;
