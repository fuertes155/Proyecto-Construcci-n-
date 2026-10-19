import type { Express } from 'express';
import request from 'supertest';

/**
 * EP-03 — Crear proyectos, guardar cálculos y ver el presupuesto acumulado
 * frente al objetivo. SQLite en memoria + seed de Nariño.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;
let tokenA = '';
let tokenB = '';

async function registerAndLogin(email: string) {
  await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'clave-larga-1234', name: 'Persona' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'clave-larga-1234' });
  return res.body.token as string;
}

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  await (await import('../migrations/0001-initial.migration.js')).up();
  await (await import('../seeds/0001-catalogo-narino.seed.js')).seed();
  ({ app } = await import('../index.js'));
  tokenA = await registerAndLogin('a@obra.co');
  tokenB = await registerAndLogin('b@obra.co');
});

afterAll(async () => {
  await sequelize.close();
});

const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('proyectos: CRUD y aislamiento por usuario', () => {
  let projectId = '';

  it('POST /api/projects sin token → 401', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Casa' });
    expect(res.status).toBe(401);
  });

  it('crea un proyecto (201) con status planning y presupuesto', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(auth(tokenA))
      .send({ name: 'Casa en Pasto', location: 'Pasto, Nariño', budget: 2_000_000 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Casa en Pasto', status: 'planning' });
    expect(res.body.id).toEqual(expect.any(String));
    projectId = res.body.id;
  });

  it('valida la entrada: sin nombre → 400', async () => {
    const res = await request(app).post('/api/projects').set(auth(tokenA)).send({ budget: 10 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('name');
  });

  it('GET /api/projects lista los míos con summary (totalCost 0)', async () => {
    const res = await request(app).get('/api/projects').set(auth(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.projects[0].summary).toMatchObject({ totalCalculations: 0, totalCost: 0 });
  });

  it('otro usuario no ve ni accede al proyecto', async () => {
    const list = await request(app).get('/api/projects').set(auth(tokenB));
    expect(list.body.total).toBe(0);
    const detail = await request(app).get(`/api/projects/${projectId}`).set(auth(tokenB));
    expect(detail.status).toBe(403);
  });

  it('PATCH actualiza estado y presupuesto', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set(auth(tokenA))
      .send({ status: 'in-progress', budget: 1_000_000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'in-progress' });
  });
});

describe('guardar cálculos y presupuesto acumulado frente al objetivo', () => {
  let projectId = '';
  let calcId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(auth(tokenA))
      .send({ name: 'Ampliación', budget: 500_000 });
    projectId = res.body.id;
  });

  it('POST /calculations recalcula en el servidor y guarda el cálculo', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/calculations`)
      .set(auth(tokenA))
      .send({ calculatorType: 'concrete', inputs: { length: 5, width: 4, height: 0.15 } });
    expect(res.status).toBe(201);
    expect(res.body.calculation).toMatchObject({
      calculatorType: 'concrete',
      unit: 'm³',
      totalCost: expect.any(Number),
    });
    expect(res.body.summary.totalCalculations).toBe(1);
    calcId = res.body.calculation.id;
  });

  it('inputs inválidos → 400 con detalle por campo', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/calculations`)
      .set(auth(tokenA))
      .send({ calculatorType: 'concrete', inputs: { length: 5, width: -4, height: 0.15 } });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('width');
  });

  it('GET detalle: calculations[] + summary con % consumido y overBudget', async () => {
    const res = await request(app).get(`/api/projects/${projectId}`).set(auth(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.calculations).toHaveLength(1);
    const s = res.body.summary;
    expect(s.totalCost).toBeGreaterThan(0);
    expect(s.budget).toBe(500000);
    expect(s.budgetUsedPct).toBeGreaterThan(0);
    expect(s.budgetRemaining).toBe(500000 - s.totalCost);
    // La losa cuesta > 500.000 → se pasa del presupuesto.
    expect(s.overBudget).toBe(true);
  });

  it('DELETE de un cálculo actualiza el presupuesto', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/calculations/${calcId}`)
      .set(auth(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({ totalCalculations: 0, totalCost: 0, overBudget: false });
  });

  it('DELETE del proyecto → 204 y luego 404', async () => {
    expect((await request(app).delete(`/api/projects/${projectId}`).set(auth(tokenA))).status).toBe(
      204
    );
    expect((await request(app).get(`/api/projects/${projectId}`).set(auth(tokenA))).status).toBe(404);
  });
});

describe('fechas de inicio y fin del proyecto', () => {
  const originalTz = process.env.TZ;

  // El desfase solo aparece al oeste de UTC: se fija la zona de Colombia para
  // que la prueba detecte la regresión también en un servidor en UTC.
  beforeAll(() => {
    process.env.TZ = 'America/Bogota';
  });
  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it('guarda las fechas de calendario tal cual, sin correrlas un día', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Con fechas', startDate: '2026-09-01', endDate: '2027-02-28' });
    expect(created.status).toBe(201);

    const detail = await request(app).get(`/api/projects/${created.body.id}`).set(auth(tokenB));
    expect(detail.body).toMatchObject({ startDate: '2026-09-01', endDate: '2027-02-28' });

    const updated = await request(app)
      .patch(`/api/projects/${created.body.id}`)
      .set(auth(tokenB))
      .send({ endDate: '2027-03-15' });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ startDate: '2026-09-01', endDate: '2027-03-15' });
  });

  it('acepta una fecha de fin sin fecha de inicio', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Solo fin', endDate: '2027-02-28' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ startDate: null, endDate: '2027-02-28' });
  });

  it('rechaza un fin anterior al inicio y fechas con formato inválido → 400', async () => {
    const before = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Al revés', startDate: '2026-09-01', endDate: '2026-08-01' });
    expect(before.status).toBe(400);
    expect(before.body.details).toHaveProperty('endDate');

    const invalid = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Mal formato', startDate: 'mañana' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.details).toHaveProperty('startDate');
  });
});

describe('las calculadoras nuevas se pueden guardar en un proyecto', () => {
  it('guarda un cálculo de pintura recalculado en el servidor', async () => {
    const project = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Acabados' });
    const res = await request(app)
      .post(`/api/projects/${project.body.id}/calculations`)
      .set(auth(tokenB))
      .send({ calculatorType: 'paint', inputs: { area: 40, coats: 2 } });
    expect(res.status).toBe(201);
    expect(res.body.calculation).toMatchObject({ calculatorType: 'paint', unit: 'm²' });
    expect(res.body.summary.totalCost).toBeGreaterThan(0);
  });

  it('rechaza un tipo de calculadora desconocido', async () => {
    const project = await request(app)
      .post('/api/projects')
      .set(auth(tokenB))
      .send({ name: 'Otro' });
    const res = await request(app)
      .post(`/api/projects/${project.body.id}/calculations`)
      .set(auth(tokenB))
      .send({ calculatorType: 'roof', inputs: {} });
    expect(res.status).toBe(400);
  });
});
