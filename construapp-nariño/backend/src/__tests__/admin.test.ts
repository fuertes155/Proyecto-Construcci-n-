import type { Express } from 'express';
import request from 'supertest';

/**
 * EP-12 — Back-office: catálogo de materiales, precios por proveedor y
 * moderación de usuarios. SQLite en memoria + seed de Nariño.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;
let adminToken = '';
let userToken = '';
let userId = '';

const login = async (email: string, password: string) =>
  (await request(app).post('/api/auth/login').send({ email, password })).body.token as string;

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  await (await import('../migrations/0001-initial.migration.js')).up();
  await (await import('../seeds/0001-catalogo-narino.seed.js')).seed();
  const { User } = await import('../models/index.js');
  ({ app } = await import('../index.js'));

  await User.create({
    email: 'admin@obra.co',
    password: 'clave-admin-1234',
    firstName: 'Admin',
    role: 'admin',
  });
  adminToken = await login('admin@obra.co', 'clave-admin-1234');

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@obra.co', password: 'clave-user-1234', name: 'Usuaria' });
  const l = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@obra.co', password: 'clave-user-1234' });
  userToken = l.body.token;
  userId = l.body.user.id;
});

afterAll(async () => {
  await sequelize.close();
});

const hdr = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('acceso: solo admin', () => {
  it('un usuario normal recibe 403', async () => {
    const res = await request(app).get('/api/admin/materials').set(hdr(userToken));
    expect(res.status).toBe(403);
  });
  it('sin token recibe 401', async () => {
    expect((await request(app).get('/api/admin/materials')).status).toBe(401);
  });
});

describe('catálogo de materiales (HU-12.1)', () => {
  let materialId = '';

  it('crea un material', async () => {
    const res = await request(app)
      .post('/api/admin/materials')
      .set(hdr(adminToken))
      .send({ name: 'Alambre negro', unit: 'kg', category: 'acero' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alambre negro', unit: 'kg', active: true });
    materialId = res.body.id;
  });

  it('lista incluye los del seed + el nuevo', async () => {
    const res = await request(app).get('/api/admin/materials').set(hdr(adminToken));
    expect(res.body.materials.length).toBeGreaterThanOrEqual(9);
  });

  it('edita y desactiva un material', async () => {
    const upd = await request(app)
      .patch(`/api/admin/materials/${materialId}`)
      .set(hdr(adminToken))
      .send({ category: 'ferretería' });
    expect(upd.body.category).toBe('ferretería');

    const del = await request(app)
      .delete(`/api/admin/materials/${materialId}`)
      .set(hdr(adminToken));
    expect(del.body.active).toBe(false);
  });

  it('validación: material sin unidad → 400', async () => {
    const res = await request(app)
      .post('/api/admin/materials')
      .set(hdr(adminToken))
      .send({ name: 'Sin unidad' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('unit');
  });
});

describe('precios por proveedor (HU-12.2)', () => {
  let materialId = '';
  let providerId = '';

  beforeAll(async () => {
    const m = await request(app)
      .post('/api/admin/materials')
      .set(hdr(adminToken))
      .send({ name: 'Teja de barro', unit: 'unidad' });
    materialId = m.body.id;
    const p = await request(app)
      .post('/api/admin/providers')
      .set(hdr(adminToken))
      .send({ name: 'Tejar de Nariño', location: 'Pasto' });
    providerId = p.body.id;
  });

  it('PUT /prices crea el precio (201) y luego lo actualiza (200)', async () => {
    const first = await request(app)
      .put('/api/admin/prices')
      .set(hdr(adminToken))
      .send({ materialId, providerId, price: 2500 });
    expect(first.status).toBe(201);
    expect(Number(first.body.price)).toBe(2500);

    const second = await request(app)
      .put('/api/admin/prices')
      .set(hdr(adminToken))
      .send({ materialId, providerId, price: 2800 });
    expect(second.status).toBe(200);
    expect(Number(second.body.price)).toBe(2800);
  });

  it('rechaza un material inexistente con 400', async () => {
    const res = await request(app)
      .put('/api/admin/prices')
      .set(hdr(adminToken))
      .send({
        materialId: '00000000-0000-0000-0000-000000000000',
        providerId,
        price: 100,
      });
    expect(res.status).toBe(400);
  });

  it('lista de precios filtrable por proveedor', async () => {
    const res = await request(app)
      .get(`/api/admin/prices?providerId=${providerId}`)
      .set(hdr(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.prices).toHaveLength(1);
    expect(res.body.prices[0].provider.name).toBe('Tejar de Nariño');
  });
});

describe('moderación de usuarios (HU-12.3)', () => {
  it('lista y filtra usuarios', async () => {
    const all = await request(app).get('/api/admin/users').set(hdr(adminToken));
    expect(all.body.total).toBeGreaterThanOrEqual(2);
    const suspended = await request(app)
      .get('/api/admin/users?status=suspended')
      .set(hdr(adminToken));
    expect(suspended.body.total).toBe(0);
  });

  it('suspende una cuenta: revoca sesiones y bloquea el login', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/status`)
      .set(hdr(adminToken))
      .send({ status: 'suspended' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('suspended');

    const relogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@obra.co', password: 'clave-user-1234' });
    expect(relogin.status).toBe(403);
  });

  it('reactiva la cuenta', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/status`)
      .set(hdr(adminToken))
      .send({ status: 'active' });
    expect(res.body.status).toBe('active');
    const relogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@obra.co', password: 'clave-user-1234' });
    expect(relogin.status).toBe(200);
  });

  it('el admin no puede cambiarse el estado a sí mismo → 400', async () => {
    const me = await request(app).get('/api/auth/me').set(hdr(adminToken));
    const res = await request(app)
      .patch(`/api/admin/users/${me.body.id}/status`)
      .set(hdr(adminToken))
      .send({ status: 'suspended' });
    expect(res.status).toBe(400);
  });
});
