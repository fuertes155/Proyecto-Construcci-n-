import express from 'express';
import Joi from 'joi';
import request from 'supertest';
import { validate } from '../validate.js';
import { errorHandler, notFoundHandler } from '../errorHandler.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * HU-00.4 — middleware homogéneo de validación (Joi) y manejo de errores.
 */
function buildApp() {
  const app = express();
  app.use(express.json());

  const schema = Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    note: Joi.string().max(10).optional(),
  });

  app.post('/calc', validate(schema), (req, res) => res.json({ ok: true, data: req.body }));
  app.get('/boom', () => {
    throw ApiError.notFound('No existe eso');
  });
  app.get('/kaboom', () => {
    throw new Error('algo interno explotó');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('validate() (Joi)', () => {
  const app = buildApp();

  it('devuelve 400 con un detalle por cada campo inválido', async () => {
    const res = await request(app).post('/calc').send({ width: -3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validación fallida');
    expect(res.body.details).toMatchObject({
      length: expect.stringContaining('required'),
      width: expect.stringContaining('positive'),
    });
  });

  it('convierte tipos y descarta campos desconocidos', async () => {
    const res = await request(app)
      .post('/calc')
      .send({ length: '5', width: '4', extra: 'fuera' });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ length: 5, width: 4 });
  });

  it('acumula varios errores a la vez (abortEarly: false)', async () => {
    const res = await request(app).post('/calc').send({ note: 'demasiado largo de verdad' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details).sort()).toEqual(['length', 'note', 'width']);
  });
});

describe('errorHandler()', () => {
  const app = buildApp();

  it('traduce ApiError a su status y forma uniforme', async () => {
    const res = await request(app).get('/boom');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No existe eso', status: 404 });
  });

  it('cualquier error no controlado es un 500 con forma uniforme', async () => {
    const res = await request(app).get('/kaboom');
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ status: 500, error: expect.any(String) });
  });

  it('JSON malformado en el body devuelve 400', async () => {
    const res = await request(app)
      .post('/calc')
      .set('Content-Type', 'application/json')
      .send('{ mal json ');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('notFoundHandler()', () => {
  it('404 uniforme con la ruta y el método', async () => {
    const res = await request(buildApp()).get('/no/existe');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Ruta no encontrada', status: 404, method: 'GET' });
  });
});
