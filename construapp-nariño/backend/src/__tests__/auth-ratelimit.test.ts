import type { Express } from 'express';
import request from 'supertest';

/**
 * HU-01.2 — límite de intentos por IP en `/api/auth/login`.
 * Reactiva el rate-limit (que la suite general desactiva) con un tope bajo.
 */
process.env.AUTH_RATE_LIMIT_DISABLED = 'false';
process.env.AUTH_RATE_LIMIT_MAX = '3';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  await (await import('../migrations/0001-initial.migration.js')).up();
  const { User } = await import('../models/index.js');
  await User.create({
    email: 'rl@obra.co',
    password: 'clave-correcta-123',
    firstName: 'Rate',
  });
  ({ app } = await import('../index.js'));
});

afterAll(async () => {
  await sequelize.close();
});

describe('rate limit de login', () => {
  it('tras superar el tope de intentos por IP responde 429', async () => {
    const codes: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rl@obra.co', password: 'MALA' });
      codes.push(res.status);
    }
    // Tope = 3 fallos → los 3 primeros son 401, el resto 429.
    expect(codes.slice(0, 3)).toEqual([401, 401, 401]);
    expect(codes.slice(3)).toEqual([429, 429]);

    const blocked = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rl@obra.co', password: 'MALA' });
    expect(blocked.body).toMatchObject({ status: 429 });
  });
});
