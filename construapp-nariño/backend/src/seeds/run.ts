/**
 * Runner de seeds (datos de ejemplo).
 *
 * Ejecuta, en orden alfabético, cada archivo `*.seed.ts` ubicado en esta carpeta.
 * Cada seed debe exportar una función `seed`:
 *
 *   export async function seed(): Promise<void> { ... }
 *
 * Uso:  npm run seed
 */
import 'dotenv/config'; // primero: carga .env antes que config/database.js

import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import logger from '../config/logger.js';
import { sequelize, connectDatabase } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Seed {
  seed: () => Promise<void>;
}

async function run(): Promise<void> {
  const entries = await readdir(__dirname);
  const seedFiles = entries.filter((file) => /\.seed\.(ts|js)$/.test(file)).sort();

  if (seedFiles.length === 0) {
    logger.info('No hay seeds definidos. Nada que cargar.');
    return;
  }

  const ok = await connectDatabase();
  if (!ok) throw new Error('Sin conexión a la base de datos.');

  for (const file of seedFiles) {
    logger.info(`Ejecutando seed: ${file}`);
    const mod = (await import(pathToFileURL(path.join(__dirname, file)).href)) as Seed;
    await mod.seed();
    logger.info(`Seed completado: ${file}`);
  }

  logger.info(`Seeds completados (${seedFiles.length}).`);
}

run()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n✖ Error ejecutando seeds:\n', error);
    logger.error(`Error ejecutando seeds: ${(error as Error).message}`);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
