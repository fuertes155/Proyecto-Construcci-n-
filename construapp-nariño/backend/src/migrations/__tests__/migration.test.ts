import type { Sequelize } from 'sequelize';

/**
 * HU-00.3 — modelos Sequelize + migración inicial.
 * Se ejecuta contra SQLite en memoria (sin infraestructura).
 */
const EXPECTED_TABLES = [
  'users',
  'refresh_tokens',
  'providers',
  'materials',
  'material_prices',
  'projects',
  'project_calculations',
  'calculator_types',
];

let sequelize: Sequelize;
let up: () => Promise<void>;
let down: () => Promise<void>;

beforeAll(async () => {
  process.env.DB_DIALECT = 'sqlite';
  process.env.DB_STORAGE = ':memory:';
  ({ sequelize } = await import('../../config/database.js'));
  ({ up, down } = await import('../0001-initial.migration.js'));
});

afterAll(async () => {
  await sequelize.close();
});

describe('migración 0001-initial', () => {
  it('crea las 7 tablas del esquema base', async () => {
    await up();
    const tables = (await sequelize.getQueryInterface().showAllTables()).map((t) =>
      String(t).toLowerCase()
    );
    for (const t of EXPECTED_TABLES) expect(tables).toContain(t);
  });

  it('es idempotente: aplicarla de nuevo no falla', async () => {
    await expect(up()).resolves.not.toThrow();
  });

  it('las asociaciones quedan registradas (Project → calculations, User)', async () => {
    const { Project } = await import('../../models/index.js');
    expect(Object.keys(Project.associations).sort()).toEqual(['calculations', 'user']);
  });

  it('down() elimina las tablas', async () => {
    await down();
    const tables = (await sequelize.getQueryInterface().showAllTables()).map((t) =>
      String(t).toLowerCase()
    );
    expect(tables.filter((t) => EXPECTED_TABLES.includes(t))).toHaveLength(0);
  });
});
