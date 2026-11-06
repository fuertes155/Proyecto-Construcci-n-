import 'dotenv/config';
import { sequelize, connectDatabase } from '../config/database.js';
import { seed } from './0001-catalogo-narino.seed.js';

try {
  if (!await connectDatabase()) throw new Error('Sin conexión a la base de datos.');
  await seed();
} catch (error) {
  console.error('No se pudo actualizar el catálogo:', (error as Error).message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
