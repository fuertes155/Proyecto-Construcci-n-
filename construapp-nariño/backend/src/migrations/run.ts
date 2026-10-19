/**
 * Runner de migraciones de base de datos.
 *
 * Ejecuta, en orden alfabético, cada archivo `*.migration.ts` ubicado en esta
 * carpeta. Cada migración debe exportar una función `up` (y opcionalmente `down`):
 *
 *   export async function up(): Promise<void> { ... }
 *   export async function down(): Promise<void> { ... }
 *
 * Uso:  npm run migrate            (aplica las migraciones pendientes)
 */
import 'dotenv/config'; // primero: carga .env antes que config/database.js

import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import logger from '../config/logger.js';
import { sequelize, connectDatabase } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Migration {
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

async function run(): Promise<void> {
  const entries = await readdir(__dirname);
  const migrationFiles = entries
    .filter((file) => /\.migration\.(ts|js)$/.test(file))
    .sort();

  if (migrationFiles.length === 0) {
    logger.info('No hay migraciones pendientes. Nada que aplicar.');
    return;
  }

  const ok = await connectDatabase();
  if (!ok) throw new Error('Sin conexión a la base de datos.');

  for (const file of migrationFiles) {
    logger.info(`Aplicando migración: ${file}`);
    const migration = (await import(
      pathToFileURL(path.join(__dirname, file)).href
    )) as Migration;
    await migration.up();
    logger.info(`Migración aplicada: ${file}`);
  }

  logger.info(`Migraciones completadas (${migrationFiles.length}).`);
}

run()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    // console.error además del logger: garantiza que el error se vea aunque
    // el transporte de archivo de Winston no alcance a vaciarse antes de salir.
    console.error('\n✖ Error ejecutando migraciones:\n', error);
    logger.error(`Error ejecutando migraciones: ${(error as Error).message}`);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
