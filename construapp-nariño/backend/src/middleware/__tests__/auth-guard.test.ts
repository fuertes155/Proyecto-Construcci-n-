import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { requireAuth, requireRole } from '../auth.js';
import { errorHandler } from '../errorHandler.js';

/**
 * HU-01.4 — rutas protegidas: sin `Authorization: Bearer` válido → 401.
 */
process.env.JWT_SECRET = 'test-secret';

function buildApp() {
  const app = express();
  app.get('/privada', requireAuth, (req, res) => res.json({ userId: req.user!.id }));
  app.get('/solo-admin', requireAuth, requireRole('admin'), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

const token = (payload: object) => jwt.sign(payload, 'test-secret', { expiresIn: '5m' });

describe('requireAuth', () => {
  const app = buildApp();

  it.each([
    ['sin cabecera', {}],
    ['esquema incorrecto', { Authorization: 'Token abc' }],
    ['token vacío', { Authorization: 'Bearer ' }],
    ['token con basura', { Authorization: 'Bearer no-es-un-jwt' }],
    ['firma inválida', { Authorization: `Bearer ${jwt.sign({ sub: 'x' }, 'otro-secreto')}` }],
  ])('responde 401 %s', async (_label, headers) => {
    const res = await request(app).get('/privada').set(headers as Record<string, string>);
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ status: 401, error: expect.any(String) });
  });

  it('token expirado → 401', async () => {
    const expired = jwt.sign({ sub: 'x', role: 'user', email: 'a@b.co' }, 'test-secret', {
      expiresIn: -10,
    });
    const res = await request(app).get('/privada').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('token válido → deja pasar y expone req.user', async () => {
    const res = await request(app)
      .get('/privada')
      .set('Authorization', `Bearer ${token({ sub: 'u-42', role: 'user', email: 'a@b.co' })}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('u-42');
  });
});

describe('requireRole', () => {
  const app = buildApp();

  it('rol insuficiente → 403', async () => {
    const res = await request(app)
      .get('/solo-admin')
      .set('Authorization', `Bearer ${token({ sub: 'u', role: 'user', email: 'a@b.co' })}`);
    expect(res.status).toBe(403);
  });

  it('rol correcto → 200', async () => {
    const res = await request(app)
      .get('/solo-admin')
      .set('Authorization', `Bearer ${token({ sub: 'u', role: 'admin', email: 'a@b.co' })}`);
    expect(res.status).toBe(200);
  });
});
