import type { Express } from 'express';
import request from 'supertest';

/**
 * EP-01 — Autenticación. Flujo completo contra SQLite en memoria.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

let app: Express;
let sequelize: import('sequelize').Sequelize;

const NEW_USER = {
  email: 'Ana@Obra.co',
  password: 'contraseña-fuerte',
  name: 'Ana Pérez',
  userType: 'engineer',
};

beforeAll(async () => {
  ({ sequelize } = await import('../config/database.js'));
  const { up } = await import('../migrations/0001-initial.migration.js');
  await up();
  ({ app } = await import('../index.js'));
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  it('crea la cuenta (201), normaliza el correo y no devuelve la contraseña', async () => {
    const res = await request(app).post('/api/auth/register').send(NEW_USER);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: 'ana@obra.co',
      name: 'Ana Pérez',
      userType: 'engineer',
      role: 'user',
    });
    expect(res.body.password).toBeUndefined();
  });

  it('guarda la contraseña como hash bcrypt, no en texto plano', async () => {
    const { User } = await import('../models/index.js');
    const row = await User.findOne({ where: { email: 'ana@obra.co' } });
    expect(row?.password).toMatch(/^\$2[aby]\$\d{2}\$/); // prefijo bcrypt
    expect(row?.password).not.toBe(NEW_USER.password);
    expect(await row!.checkPassword(NEW_USER.password)).toBe(true);
  });

  it('rechaza un correo ya registrado con 400 (aunque cambie la capitalización)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...NEW_USER, email: NEW_USER.email.toUpperCase() });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/correo/i);
  });

  it('valida la fortaleza de la contraseña (< 8) con 400 y detalle por campo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@y.co', password: '123', name: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('password');
  });

  it('rechaza un tipo de perfil no válido con 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'z@y.co', password: 'clave-valida-123', name: 'Zeta', userType: 'jefe' });
    expect(res.status).toBe(400);
    expect(res.body.details.userType).toMatch(/owner|contractor|engineer|provider/);
  });
});

describe('POST /api/auth/login', () => {
  it('devuelve token (JWT), refreshToken (opaco) y los datos del usuario', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: NEW_USER.password });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      token: expect.stringMatching(/^eyJ/), // JWT
      refreshToken: expect.stringMatching(/^[a-f0-9]{40,}$/), // opaco, no JWT
      expiresIn: expect.any(String),
      user: {
        id: expect.any(String),
        email: 'ana@obra.co',
        name: 'Ana Pérez',
        role: 'user',
      },
    });
    expect(res.body.user.password).toBeUndefined();
  });

  it('contraseña incorrecta → 401 genérico (no revela qué campo falló)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'mala' });
    expect(res.status).toBe(401);
    expect(res.body.error).not.toMatch(/contraseña|correo/i);
  });

  it('correo inexistente → misma respuesta 401 que la contraseña incorrecta', async () => {
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-existe@obra.co', password: 'cualquier-cosa' });
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'otra-mala' });
    expect(bad.status).toBe(401);
    expect(bad.body).toEqual(wrongPass.body); // indistinguibles
  });
});

describe('rutas protegidas y gestión de perfil', () => {
  let token: string;
  let refreshToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: NEW_USER.password });
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('GET /api/auth/me sin token → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me con token → 200', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('ana@obra.co');
  });

  it('PATCH /api/auth/me actualiza el perfil', async () => {
    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ana P. Ingeniera', userType: 'owner' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Ana P. Ingeniera', userType: 'owner' });
  });

  it('cada refresh entrega tokens nuevos y el nuevo access token sirve', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.token).toMatch(/^eyJ/); // JWT nuevo
    expect(res.body.refreshToken).not.toBe(refreshToken); // opaco nuevo
    expect(res.body.expiresIn).toBe('15m');

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(me.status).toBe(200);

    // dejamos la sesión rotada para el siguiente test
    refreshToken = res.body.refreshToken;
  });

  it('una cadena legítima de rotaciones no dispara falsos positivos', async () => {
    for (let i = 0; i < 3; i += 1) {
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(200);
      refreshToken = res.body.refreshToken;
    }
  });

  it('reutilizar un token ya rotado invalida TODA la familia de la sesión', async () => {
    const usado = refreshToken;
    const rotado = (await request(app).post('/api/auth/refresh').send({ refreshToken: usado }))
      .body.refreshToken as string;

    // 1) reusar el token ya consumido → 401
    const reuse = await request(app).post('/api/auth/refresh').send({ refreshToken: usado });
    expect(reuse.status).toBe(401);
    expect(reuse.body.error).toMatch(/reutiliz/i);

    // 2) el token que ERA válido (rotado) también deja de servir
    const victima = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: rotado });
    expect(victima.status).toBe(401);
  });

  it('change-password exige la contraseña actual y revoca las sesiones', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: NEW_USER.password });
    const t = login.body.token;
    const rt = login.body.refreshToken;

    const wrong = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${t}`)
      .send({ currentPassword: 'incorrecta', newPassword: 'otra-clave-larga' });
    expect(wrong.status).toBe(401);

    const ok = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${t}`)
      .send({ currentPassword: NEW_USER.password, newPassword: 'otra-clave-larga' });
    expect(ok.status).toBe(204);

    // el refresh token anterior ya no sirve
    const refresh = await request(app).post('/api/auth/refresh').send({ refreshToken: rt });
    expect(refresh.status).toBe(401);

    // y se puede iniciar sesión con la nueva contraseña
    const relogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'otra-clave-larga' });
    expect(relogin.status).toBe(200);
  });

  it('logout: 204, invalida el refresh token y es idempotente', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'otra-clave-larga' });
    const rt = login.body.refreshToken;

    const out = await request(app).post('/api/auth/logout').send({ refreshToken: rt });
    expect(out.status).toBe(204);
    expect(out.body).toEqual({});

    // el refresh token ya no sirve
    const refresh = await request(app).post('/api/auth/refresh').send({ refreshToken: rt });
    expect(refresh.status).toBe(401);

    // volver a cerrar sesión con el mismo token no da error
    const again = await request(app).post('/api/auth/logout').send({ refreshToken: rt });
    expect(again.status).toBe(204);

    // cerrar sesión con un token inexistente tampoco
    const nada = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: 'a'.repeat(80) });
    expect(nada.status).toBe(204);
  });

  it('cerrar sesión en un dispositivo no afecta a otra sesión del mismo usuario', async () => {
    const a = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'otra-clave-larga' });
    const b = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@obra.co', password: 'otra-clave-larga' });

    await request(app).post('/api/auth/logout').send({ refreshToken: a.body.refreshToken });

    // la sesión B sigue viva
    const refreshB = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: b.body.refreshToken });
    expect(refreshB.status).toBe(200);
  });
});
