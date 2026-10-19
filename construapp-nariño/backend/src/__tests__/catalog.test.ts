import type { Express } from 'express';
import request from 'supertest';

/**
 * EP-04 — Catálogo público: materiales con precios por proveedor y directorio
 * de proveedores con filtros. SQLite en memoria + seed de Nariño.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  await (await import('../migrations/0001-initial.migration.js')).up();
  await (await import('../seeds/0001-catalogo-narino.seed.js')).seed();
  ({ app } = await import('../index.js'));
});

afterAll(async () => {
  await sequelize.close();
});

interface CatalogMaterial {
  id: string;
  name: string;
  category: string;
  bestPrice: { price: number; providerName: string } | null;
  prices: { price: number }[];
}

describe('GET /api/materials (público)', () => {
  it('lista el catálogo con el precio más bajo primero', async () => {
    const res = await request(app).get('/api/materials');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(33);
    expect(res.body.categories).toEqual(expect.arrayContaining(['acero', 'cubierta', 'hidráulica']));

    const cement = res.body.materials.find((m: CatalogMaterial) => m.name === 'Cemento gris');
    expect(cement.prices).toHaveLength(3);
    expect(cement.bestPrice).toMatchObject({ price: 34200 });
    expect(cement.bestPrice.providerName).toContain('La Roca');
    const prices = cement.prices.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('busca sin importar tildes ni mayúsculas', async () => {
    const res = await request(app).get('/api/materials').query({ q: 'PIEDRA RAJON' });
    expect(res.body.materials.map((m: CatalogMaterial) => m.name)).toEqual(['Piedra rajón']);
  });

  it('filtra por categoría', async () => {
    const res = await request(app).get('/api/materials').query({ category: 'cubierta' });
    expect(res.body.total).toBeGreaterThan(0);
    for (const m of res.body.materials) expect(m.category).toBe('cubierta');
  });
});

describe('GET /api/providers (público)', () => {
  it('lista los proveedores con lo que ofrecen (HU-04.1)', async () => {
    const res = await request(app).get('/api/providers');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.providers[0]).toMatchObject({
      name: expect.any(String),
      location: expect.any(String),
      rating: expect.any(Number),
      materialsOffered: 33,
    });
    // Ordenados por calificación, de mayor a menor
    const ratings = res.body.providers.map((p: { rating: number }) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    expect(res.body.locations).toEqual(['Ipiales, Nariño', 'Pasto, Nariño']);
  });

  it('filtra por ubicación y calificación mínima (HU-04.2)', async () => {
    const pasto = await request(app).get('/api/providers').query({ location: 'pasto' });
    expect(pasto.body.total).toBe(2);
    const top = await request(app).get('/api/providers').query({ location: 'Pasto', rating: 4.5 });
    expect(top.body.providers.map((p: { name: string }) => p.name)).toEqual([
      'Depósito El Constructor (demo)',
    ]);
  });

  it('filtra por material y por categoría de material', async () => {
    const materials = await request(app).get('/api/materials').query({ q: 'teja de zinc' });
    const zinc = materials.body.materials[0];
    const byMaterial = await request(app).get('/api/providers').query({ material: zinc.id });
    expect(byMaterial.body.total).toBe(3);
    const byCategory = await request(app).get('/api/providers').query({ category: 'madera' });
    expect(byCategory.body.total).toBe(3);
    const none = await request(app).get('/api/providers').query({ category: 'inexistente' });
    expect(none.body.total).toBe(0);
  });

  it('no lista proveedores sin ningún precio registrado', async () => {
    const { Provider } = await import('../models/index.js');
    await Provider.create({ name: 'Proveedor sin precios', location: 'Pasto, Nariño' });
    const res = await request(app).get('/api/providers');
    expect(res.body.providers.map((p: { name: string }) => p.name)).not.toContain(
      'Proveedor sin precios'
    );
    expect(res.body.total).toBe(3);
  });

  it('rechaza filtros inválidos con 400', async () => {
    const res = await request(app).get('/api/providers').query({ rating: 9 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('rating');
  });
});

describe('GET /api/providers/:id (público)', () => {
  it('devuelve la ficha con precios y su fecha de actualización (HU-04.3, HU-04.4)', async () => {
    const list = await request(app).get('/api/providers');
    const { id } = list.body.providers[0];
    const res = await request(app).get(`/api/providers/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, phone: expect.any(String), email: expect.any(String) });
    expect(res.body.prices).toHaveLength(33);
    expect(res.body.prices[0]).toMatchObject({
      name: expect.any(String),
      unit: expect.any(String),
      price: expect.any(Number),
      updatedAt: expect.any(String),
    });
  });

  it('id inexistente → 404 y id mal formado → 400', async () => {
    const missing = await request(app).get('/api/providers/00000000-0000-4000-8000-000000000000');
    expect(missing.status).toBe(404);
    const bad = await request(app).get('/api/providers/no-es-uuid');
    expect(bad.status).toBe(400);
  });
});
