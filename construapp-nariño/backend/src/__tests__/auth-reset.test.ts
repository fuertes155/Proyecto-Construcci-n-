import type { Express } from 'express';
import request from 'supertest';

/**
 * HU-01.6 — recuperación de contraseña: enlace con token de un solo uso y
 * expiración, sin revelar si el correo existe.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

// Captura el enlace en vez de enviar correo.
const sentLinks: string[] = [];
jest.mock('../services/mailer.js', () => ({
  sendPasswordResetEmail: jest.fn(async (_to: string, url: string) => {
    sentLinks.push(url);
  }),
  sendMail: jest.fn(),
}));

let app: Express;
let sequelize: import('sequelize').Sequelize;

const tokenFromLastLink = () => new URL(sentLinks.at(-1)!).searchParams.get('token')!;

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  await (await import('../migrations/0001-initial.migration.js')).up();
  const { User } = await import('../models/index.js');
  await User.create({ email: 'u@obra.co', password: 'clave-vieja-123', firstName: 'U' });
  ({ app } = await import('../index.js'));
});

afterAll(async () => {
  await sequelize.close();
});
beforeEach(() => {
  sentLinks.length = 0;
});

describe('POST /api/auth/forgot-password', () => {
  it('correo existente → 204 y se genera un enlace con token', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'u@obra.co' });
    expect(res.status).toBe(204);
    expect(sentLinks).toHaveLength(1);
    expect(tokenFromLastLink()).toMatch(/^[a-f0-9]{64}$/);
  });

  it('correo inexistente → 204 idéntico y NO se genera enlace (no revela nada)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'no-existe@obra.co' });
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(sentLinks).toHaveLength(0);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('fija la nueva contraseña, revoca sesiones y el token queda usado', async () => {
    // sesión previa
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@obra.co', password: 'clave-vieja-123' });
    const oldRefresh = login.body.refreshToken;

    await request(app).post('/api/auth/forgot-password').send({ email: 'u@obra.co' });
    const token = tokenFromLastLink();

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'clave-nueva-456' });
    expect(reset.status).toBe(204);

    // nueva contraseña sirve, la vieja no
    expect(
      (await request(app).post('/api/auth/login').send({ email: 'u@obra.co', password: 'clave-nueva-456' }))
        .status
    ).toBe(200);
    expect(
      (await request(app).post('/api/auth/login').send({ email: 'u@obra.co', password: 'clave-vieja-123' }))
        .status
    ).toBe(401);

    // la sesión previa quedó revocada
    expect(
      (await request(app).post('/api/auth/refresh').send({ refreshToken: oldRefresh })).status
    ).toBe(401);

    // el token es de un solo uso
    const reuse = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'clave-otra-789' });
    expect(reuse.status).toBe(400);
  });

  it('token inexistente → 400', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'f'.repeat(64), newPassword: 'clave-cualquiera' });
    expect(res.status).toBe(400);
  });

  it('token expirado → 400', async () => {
    const { PasswordResetToken } = await import('../models/index.js');
    await request(app).post('/api/auth/forgot-password').send({ email: 'u@obra.co' });
    const token = tokenFromLastLink();

    // forzar la expiración del enlace recién emitido
    await PasswordResetToken.update(
      { expiresAt: new Date(Date.now() - 1000) },
      { where: { usedAt: null } }
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'clave-tras-expirar' });
    expect(res.status).toBe(400);
  });

  it('una nueva solicitud invalida el enlace anterior', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: 'u@obra.co' });
    const primero = tokenFromLastLink();
    await request(app).post('/api/auth/forgot-password').send({ email: 'u@obra.co' });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: primero, newPassword: 'clave-con-token-viejo' });
    expect(res.status).toBe(400);
  });
});
