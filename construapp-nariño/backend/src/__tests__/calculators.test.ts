import type { Express } from 'express';
import request from 'supertest';

/**
 * EP-02 — Calculadoras (hormigón, ladrillo, mortero, bloque, acero, pintura,
 * enchape y cimiento ciclópeo) con desglose y costo
 * en precios locales. Corre contra SQLite en memoria + el seed de Nariño.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  const { up } = await import('../migrations/0001-initial.migration.js');
  await up();
  const { seed } = await import('../seeds/0001-catalogo-narino.seed.js');
  await seed();
  ({ app } = await import('../index.js'));
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/calculators/types', () => {
  it('lista las 9 calculadoras con sus campos', async () => {
    const res = await request(app).get('/api/calculators/types');
    expect(res.status).toBe(200);
    const ids = res.body.calculators.map((c: { id: string }) => c.id).sort();
    expect(ids).toEqual([
      'block',
      'brick',
      'concrete',
      'footing',
      'mortar',
      'paint',
      'rebar',
      'roof',
      'tile',
    ]);
    const concrete = res.body.calculators.find((c: { id: string }) => c.id === 'concrete');
    expect(Array.isArray(concrete.fields)).toBe(true);
    expect(concrete.fields.length).toBeGreaterThan(0);
  });
});

describe('POST /api/calculators/concrete', () => {
  it('calcula volumen y desglose de cemento, arena y grava con precios locales', async () => {
    const res = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 5, width: 4, height: 0.15 });

    expect(res.status).toBe(200);
    expect(res.body.calculatorType).toBe('concrete');
    expect(res.body.quantity).toBeCloseTo(3, 5); // 5 * 4 * 0.15
    expect(res.body.unit).toBe('m³');

    const roles = res.body.materials.map((m: { role: string }) => m.role).sort();
    expect(roles).toEqual(['cement', 'gravel', 'sand']);

    for (const m of res.body.materials) {
      expect(m.quantity).toBeGreaterThan(0);
      expect(m.pricePerUnit).toBeGreaterThan(0);
      expect(m.totalPrice).toBeCloseTo(m.pricePerUnit * m.quantity, 0);
      expect(m.provider).toMatchObject({ id: expect.any(String), name: expect.any(String) });
      expect(m.currency).toBe('COP');
    }

    const sum = res.body.materials.reduce(
      (s: number, m: { totalPrice: number }) => s + m.totalPrice,
      0
    );
    expect(res.body.totalCost).toBeCloseTo(sum, 0);
    expect(res.body.missingPrices).toEqual([]);
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('elige el proveedor más barato para cada material', async () => {
    const res = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 1, width: 1, height: 1 });
    const cement = res.body.materials.find((m: { role: string }) => m.role === 'cement');
    // En el seed, "Ferretería La Roca (demo)" tiene el cemento más barato (34200).
    expect(cement.pricePerUnit).toBe(34200);
    expect(cement.provider.name).toContain('La Roca');
  });

  it('un % de desperdicio mayor aumenta las cantidades', async () => {
    const base = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 3, width: 3, height: 0.2, wastePct: 0 });
    const more = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 3, width: 3, height: 0.2, wastePct: 15 });
    const sand = (r: typeof base) =>
      r.body.materials.find((m: { role: string }) => m.role === 'sand').quantity;
    expect(sand(more)).toBeGreaterThan(sand(base));
  });

  it('rechaza dimensiones no positivas con 400 y detalle por campo', async () => {
    const res = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 5, width: -4, height: 0.15 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('width');
  });

  it('rechaza un campo faltante con 400', async () => {
    const res = await request(app)
      .post('/api/calculators/concrete')
      .send({ length: 5, width: 4 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('height');
  });
});

describe('POST /api/calculators/brick', () => {
  it('devuelve unidades de ladrillo y mortero con precio', async () => {
    const res = await request(app)
      .post('/api/calculators/brick')
      .send({ width: 5, height: 2.5 });
    expect(res.status).toBe(200);
    const roles = res.body.materials.map((m: { role: string }) => m.role).sort();
    expect(roles).toEqual(['brick', 'mortarMix']);
    const brick = res.body.materials.find((m: { role: string }) => m.role === 'brick');
    expect(Number.isInteger(brick.quantity)).toBe(true);
    expect(brick.quantity).toBeGreaterThan(0);
    expect(res.body.totalCost).toBeGreaterThan(0);
  });
});

describe('POST /api/calculators/mortar', () => {
  it('devuelve cemento y arena para el volumen de mortero', async () => {
    const res = await request(app)
      .post('/api/calculators/mortar')
      .send({ area: 20, thickness: 2 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBeCloseTo(0.4, 5); // 20 * 0.02
    const roles = res.body.materials.map((m: { role: string }) => m.role).sort();
    expect(roles).toEqual(['cement', 'sand']);
  });
});

/** Cantidad de un material del resultado por su rol. */
const qty = (body: { materials: { role: string; quantity: number }[] }, role: string) =>
  body.materials.find((m) => m.role === role)?.quantity;

describe('POST /api/calculators/block', () => {
  it('calcula bloques n.º 4 y sacos de mortero de pega', async () => {
    const res = await request(app).post('/api/calculators/block').send({ width: 5, height: 2.5 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBeCloseTo(12.5, 5);
    expect(res.body.unit).toBe('m²');
    // 12,5 m² × 11,6 bloques × 1,05 = 152,25 → 153; 12,5 × 17 kg × 1,05 / 40 = 5,58 → 6 sacos
    expect(qty(res.body, 'block')).toBe(153);
    expect(qty(res.body, 'mortarMix')).toBe(6);
    expect(res.body.missingPrices).toEqual([]);
  });
});

describe('POST /api/calculators/rebar', () => {
  it('cuenta varillas de 6 m y alambre para una malla de placa', async () => {
    const res = await request(app)
      .post('/api/calculators/rebar')
      .send({ length: 4, width: 3, spacing: 20, wastePct: 0 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBeCloseTo(12, 5);
    // 16 varillas de 4 m + 21 de 3 m = 127 m → 22 barras; 22 × 6 × 0,994 kg × 2 % → 3 kg
    expect(qty(res.body, 'rebar')).toBe(22);
    expect(qty(res.body, 'tieWire')).toBe(3);
  });

  it('suma traslapos cuando un tramo es más largo que una barra', async () => {
    const short = await request(app)
      .post('/api/calculators/rebar')
      .send({ length: 6, width: 1, spacing: 50, wastePct: 0 });
    const long = await request(app)
      .post('/api/calculators/rebar')
      .send({ length: 10, width: 1, spacing: 50, wastePct: 0 });
    // 3 varillas de 10 m: cada una lleva un empalme de 0,6 m → 31,8 m en vez de 30 m
    expect(qty(long.body, 'rebar')).toBeGreaterThan(qty(short.body, 'rebar')!);
    expect(qty(long.body, 'rebar')).toBe(Math.ceil((3 * 10.6 + 21 * 1) / 6));
  });

  it('rechaza una separación fuera de rango con 400', async () => {
    const res = await request(app)
      .post('/api/calculators/rebar')
      .send({ length: 4, width: 3, spacing: 2 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('spacing');
  });
});

describe('POST /api/calculators/paint', () => {
  it('calcula galones según área y manos', async () => {
    const res = await request(app)
      .post('/api/calculators/paint')
      .send({ area: 40, coats: 2, wastePct: 0 });
    expect(res.status).toBe(200);
    // 40 m² × 2 manos / 25 m² por galón = 3,2 → 4 galones
    expect(qty(res.body, 'paint')).toBe(4);
  });

  it('usa 2 manos por defecto y rechaza 0 manos', async () => {
    const byDefault = await request(app).post('/api/calculators/paint').send({ area: 40, wastePct: 0 });
    expect(qty(byDefault.body, 'paint')).toBe(4);
    const zero = await request(app).post('/api/calculators/paint').send({ area: 40, coats: 0 });
    expect(zero.status).toBe(400);
    expect(zero.body.details).toHaveProperty('coats');
  });
});

describe('POST /api/calculators/tile', () => {
  it('calcula baldosa, pegante y boquilla', async () => {
    const res = await request(app).post('/api/calculators/tile').send({ area: 20, wastePct: 10 });
    expect(res.status).toBe(200);
    expect(qty(res.body, 'tile')).toBeCloseTo(22, 5); // 20 m² + 10 %
    expect(qty(res.body, 'tileAdhesive')).toBe(5); // 20 × 5 kg × 1,1 / 25 = 4,4 → 5 sacos
    expect(qty(res.body, 'grout')).toBe(5); // 20 × 0,4 kg × 1,1 / 2 = 4,4 → 5 bolsas
    expect(res.body.missingPrices).toEqual([]);
  });
});

describe('POST /api/calculators/footing', () => {
  it('reparte el volumen entre hormigón y piedra rajón', async () => {
    const res = await request(app)
      .post('/api/calculators/footing')
      .send({ length: 10, width: 0.4, height: 0.6, wastePct: 0 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBeCloseTo(2.4, 5);
    expect(res.body.unit).toBe('m³');
    // 60 % de hormigón (1,44 m³) y 40 % de piedra (0,96 m³)
    expect(qty(res.body, 'cement')).toBe(11); // 1,44 × 7 = 10,08 → 11 sacos
    expect(qty(res.body, 'sand')).toBeCloseTo(0.79, 5);
    expect(qty(res.body, 'gravel')).toBeCloseTo(1.15, 5);
    expect(qty(res.body, 'stone')).toBeCloseTo(0.96, 5);
  });

  it('sin piedra no incluye piedra rajón', async () => {
    const res = await request(app)
      .post('/api/calculators/footing')
      .send({ length: 2, width: 1, height: 1, stonePct: 0 });
    expect(res.status).toBe(200);
    expect(qty(res.body, 'stone')).toBeUndefined();
  });
});

/** Nombre del material que se cotizó para un rol. */
const nameOf = (body: { materials: { role: string; name: string }[] }, role: string) =>
  body.materials.find((m) => m.role === role)?.name;

describe('opciones de material en las calculadoras', () => {
  it('hormigón: la resistencia cambia la dosificación', async () => {
    const base = { length: 1, width: 1, height: 1, wastePct: 0 };
    const r2500 = await request(app).post('/api/calculators/concrete').send({ ...base, strength: '2500' });
    const r3000 = await request(app).post('/api/calculators/concrete').send(base);
    const r3500 = await request(app).post('/api/calculators/concrete').send({ ...base, strength: '3500' });
    expect(qty(r2500.body, 'cement')).toBe(6);
    expect(qty(r3000.body, 'cement')).toBe(7); // por defecto, 3000 psi
    expect(qty(r3500.body, 'cement')).toBe(9); // 8,4 sacos → 9
    const bad = await request(app).post('/api/calculators/concrete').send({ ...base, strength: '9000' });
    expect(bad.status).toBe(400);
    expect(bad.body.details).toHaveProperty('strength');
  });

  it('mampostería y bloque: cotizan la pieza elegida', async () => {
    const clay = await request(app)
      .post('/api/calculators/brick')
      .send({ width: 5, height: 2, brickUnit: 'arcilla4', wastePct: 0 });
    expect(nameOf(clay.body, 'brick')).toBe('Bloque de arcilla n.º 4');
    expect(qty(clay.body, 'brick')).toBe(154); // 10 m² × 15,4
    const n6 = await request(app)
      .post('/api/calculators/block')
      .send({ width: 5, height: 2, blockSize: 'n6', wastePct: 0 });
    expect(nameOf(n6.body, 'block')).toBe('Bloque de concreto n.º 6');
    expect(qty(n6.body, 'mortarMix')).toBe(7); // 10 m² × 25 kg / 40 = 6,25 → 7
  });

  it('acero: el diámetro cambia la varilla y el peso del alambre', async () => {
    const base = { length: 4, width: 3, spacing: 20, wastePct: 0 };
    const thin = await request(app).post('/api/calculators/rebar').send({ ...base, diameter: '3/8' });
    const thick = await request(app).post('/api/calculators/rebar').send({ ...base, diameter: '5/8' });
    expect(nameOf(thin.body, 'rebar')).toBe('Varilla corrugada 3/8" x 6 m');
    expect(nameOf(thick.body, 'rebar')).toBe('Varilla corrugada 5/8" x 6 m');
    expect(qty(thin.body, 'rebar')).toBe(22);
    expect(qty(thick.body, 'tieWire')).toBeGreaterThan(qty(thin.body, 'tieWire')!);
    expect(thin.body.missingPrices).toEqual([]);
  });

  it('pintura y piso: cotizan el producto elegido', async () => {
    const paint = await request(app)
      .post('/api/calculators/paint')
      .send({ area: 40, coats: 2, paintType: 'vinilo2', wastePct: 0 });
    expect(nameOf(paint.body, 'paint')).toBe('Pintura vinilo tipo 2');
    expect(qty(paint.body, 'paint')).toBe(4); // 80 / 20
    const tile = await request(app)
      .post('/api/calculators/tile')
      .send({ area: 20, tileType: 'porcelanato', wastePct: 0 });
    expect(nameOf(tile.body, 'tile')).toBe('Porcelanato para piso');
    expect(nameOf(tile.body, 'tileAdhesive')).toBe('Pegante para porcelanato');
    expect(qty(tile.body, 'tileAdhesive')).toBe(5); // 20 × 6 / 25 = 4,8 → 5
  });

  it('mortero: la proporción cambia el cemento', async () => {
    const rich = await request(app)
      .post('/api/calculators/mortar')
      .send({ area: 10, thickness: 10, mix: '1:3', wastePct: 0 });
    expect(qty(rich.body, 'cement')).toBe(9); // 1 m³ × 9 sacos
  });
});

describe('POST /api/calculators/roof', () => {
  it('calcula tejas de fibrocemento y ganchos por defecto', async () => {
    const res = await request(app).post('/api/calculators/roof').send({ area: 30, wastePct: 0 });
    expect(res.status).toBe(200);
    expect(res.body.unit).toBe('m²');
    // 30 m² / 1,47 m² útiles = 20,4 → 21 tejas; 3 ganchos por teja
    expect(nameOf(res.body, 'roofSheet')).toBe('Teja de fibrocemento n.º 6');
    expect(qty(res.body, 'roofSheet')).toBe(21);
    expect(qty(res.body, 'roofHook')).toBe(63);
    expect(res.body.missingPrices).toEqual([]);
  });

  it('teja de zinc: menos tejas por su mayor área útil', async () => {
    const res = await request(app)
      .post('/api/calculators/roof')
      .send({ area: 30, sheet: 'zinc', wastePct: 0 });
    expect(nameOf(res.body, 'roofSheet')).toBe('Teja de zinc ondulada 3,05 m');
    expect(qty(res.body, 'roofSheet')).toBe(15); // 30 / 2,09 = 14,4 → 15
    expect(qty(res.body, 'roofHook')).toBe(60);
  });
});
