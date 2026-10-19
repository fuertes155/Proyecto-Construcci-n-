/**
 * Migración inicial: crea todas las tablas del esquema base
 * (users, providers, materials, material_prices, projects,
 *  project_calculations, calculator_types) a partir de los modelos Sequelize.
 *
 * Para la primera migración de un proyecto nuevo, sincronizar los modelos es
 * suficiente y garantiza que el esquema coincida exactamente con el código.
 * Las migraciones siguientes deben ser DDL explícito (`queryInterface`).
 */
import { sequelize } from '../config/database.js';
import '../models/index.js';

export async function up(): Promise<void> {
  await sequelize.sync();
}

export async function down(): Promise<void> {
  await sequelize.drop();
}
