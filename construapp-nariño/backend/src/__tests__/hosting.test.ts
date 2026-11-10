import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import type { Express } from 'express';
import type { Sequelize } from 'sequelize';

const directory = mkdtempSync(path.join(tmpdir(), 'construapp-hosting-'));
writeFileSync(
  path.join(directory, 'index.html'),
  '<!doctype html><title>ConstruApp</title><div id="root"></div>'
);
writeFileSync(path.join(directory, 'app.js'), 'window.example = true;');
process.env.SERVE_FRONTEND = 'true';
process.env.FRONTEND_DIST = directory;
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.TRUST_PROXY = '1';

let app: Express;
let sequelize: Sequelize;
beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  ({ app } = await import('../index.js'));
});
afterAll(async () => {
  await sequelize.close();
  rmSync(directory, { recursive: true, force: true });
});

it('sirve la portada y las rutas profundas de React desde el mismo servidor', async () => {
  for (const route of ['/', '/login', '/projects/example']) {
    const response = await request(app).get(route).accept('html');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('<div id="root">');
    expect(response.headers['cache-control']).toBe('no-cache');
  }
});

it('sirve recursos reales y conserva los errores JSON de la API', async () => {
  expect((await request(app).get('/app.js')).status).toBe(200);
  expect((await request(app).get('/missing.js')).status).toBe(404);
  const missingApi = await request(app).get('/api/missing').accept('html');
  expect(missingApi.status).toBe(404);
  expect(missingApi.type).toBe('application/json');
  expect(missingApi.body.error).toBe('Ruta no encontrada');
});

it('el healthcheck detecta una caída actual de la base de datos', async () => {
  expect((await request(app).get('/api/ready')).status).toBe(200);
  const failed = jest
    .spyOn(sequelize, 'authenticate')
    .mockRejectedValueOnce(new Error('database unavailable'));
  const response = await request(app).get('/api/ready');
  expect(response.status).toBe(503);
  expect(response.body.database).toBe('disconnected');
  failed.mockRestore();
});
