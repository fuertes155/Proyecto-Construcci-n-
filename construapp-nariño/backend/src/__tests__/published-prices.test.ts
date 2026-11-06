process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

import { sequelize } from '../config/database.js';
import { DataTypes, Op } from 'sequelize';
import { Material, MaterialPrice, Provider } from '../models/index.js';
import { up } from '../migrations/0002-price-sources.migration.js';
import { seed } from '../seeds/0001-catalogo-narino.seed.js';

beforeAll(async () => {
  await sequelize.sync();
  // Simula el esquema anterior sin las nuevas columnas, conservando el índice compuesto.
  const query = sequelize.getQueryInterface();
  await query.dropTable('material_prices');
  await query.createTable('material_prices', {
    id: { type: DataTypes.UUID, primaryKey: true },
    material_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'materials', key: 'id' } },
    provider_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'providers', key: 'id' } },
    price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'COP' },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });
  await query.addIndex('material_prices', ['material_id', 'provider_id'], { unique: true });
  await up();
  await up();
});
afterAll(async () => { await sequelize.close(); });

it('reemplaza el catálogo ficticio y conserva los proveedores particulares', async () => {
  const material = await Material.create({ name: 'Material particular', unit: 'unidad' });
  const legacy = await Provider.create({ name: 'Ferretería La Roca (demo)', email: 'info@laroca.demo', location: 'Pasto' });
  const custom = await Provider.create({ name: 'Proveedor particular', location: 'Pasto' });
  await MaterialPrice.create({ materialId: material.id, providerId: legacy.id, price: 123 });
  const customPrice = await MaterialPrice.create({ materialId: material.id, providerId: custom.id, price: 456 });
  await seed();
  expect(await Provider.findByPk(legacy.id)).toBeNull();
  expect(await MaterialPrice.count({ where: { providerId: legacy.id } })).toBe(0);
  expect(Number((await customPrice.reload()).price)).toBe(456);
  const imported = await MaterialPrice.findAll({ where: { currency: 'COP' } });
  expect(imported.filter(p => p.sourceUrl)).toHaveLength(34);
  const catalog = await Material.findAll({ where: { name: { [Op.ne]: 'Material particular' } } });
  expect(catalog).toHaveLength(33);
  for (const m of catalog) {
    const prices = imported.filter(p => p.materialId === m.id);
    expect(prices.length).toBeGreaterThan(0);
    for (const p of prices) {
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.sourceProduct).toBeTruthy();
      expect(p.sourceNotes).toBeTruthy();
      expect(p.checkedAt?.toISOString()).toMatch(/^2026-11-05/);
    }
  }
});

it('repetir la carga conserva una cotización editada y la fecha original de las otras', async () => {
  const price = await MaterialPrice.findOne({ where: { price: 32000 } });
  await price!.update({ price: 33000, sourceUrl: null, sourceProduct: null, sourceNotes: null, checkedAt: null });
  const before = await MaterialPrice.count();
  await seed();
  await seed();
  expect(await MaterialPrice.count()).toBe(before);
  expect(Number((await price!.reload()).price)).toBe(33000);
  expect(price!.checkedAt).toBeNull();
});
