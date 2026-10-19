import request from 'supertest';
import { app } from '../index.js';

/**
 * HU-00.2 — Conexión a PostgreSQL / Redis desde `.env`.
 *
 * Criterio de aceptación verificado aquí: la app arranca y responde aunque
 * la base de datos y la caché no estén disponibles; `/api/status` refleja el
 * estado real. En el entorno de test no se llama a `connectDatabase()`, así que
 * ambos deben aparecer como "disconnected".
 */
describe('GET /api/health', () => {
  it('responde 200 con el estado ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', version: expect.any(String) });
  });
});

describe('GET /api/status', () => {
  it('responde 200 y reporta el estado de servidor, BD y caché', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      server: 'running',
      database: expect.stringMatching(/^(connected|disconnected)$/),
      cache: expect.stringMatching(/^(connected|disconnected)$/),
      uptime: expect.any(Number),
    });
  });

  it('sin haber conectado a la BD, la app sigue respondiendo y marca disconnected', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('disconnected');
    expect(res.body.cache).toBe('disconnected');
  });
});

describe('rutas desconocidas', () => {
  it('devuelven 404 con el detalle de la ruta', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Ruta no encontrada', path: '/api/no-existe' });
  });
});
