/**
 * HU-00.2 — configuración de la conexión a base de datos.
 */
describe('config/database', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('usa postgres por defecto y expone el dialecto', async () => {
    delete process.env.DB_DIALECT;
    const mod = await import('../database.js');
    expect(mod.dialect).toBe('postgres');
    expect(mod.isDatabaseConnected()).toBe(false);
  });

  it('acepta el dialecto sqlite', async () => {
    process.env.DB_DIALECT = 'sqlite';
    const mod = await import('../database.js');
    expect(mod.dialect).toBe('sqlite');
  });

  it('rechaza un dialecto no soportado', async () => {
    process.env.DB_DIALECT = 'mysql';
    await expect(import('../database.js')).rejects.toThrow(/DB_DIALECT no válido/);
  });

  it('lee host/puerto/credenciales desde variables de entorno', async () => {
    process.env.DB_DIALECT = 'postgres';
    process.env.DB_HOST = 'db.example.test';
    process.env.DB_PORT = '6000';
    process.env.DB_NAME = 'mi_db';
    process.env.DB_USER = 'mi_user';
    process.env.DB_PASSWORD = 'mi_pass';
    const { sequelize } = await import('../database.js');
    expect(sequelize.config.host).toBe('db.example.test');
    expect(sequelize.config.port).toBe(6000);
    expect(sequelize.config.database).toBe('mi_db');
    expect(sequelize.config.username).toBe('mi_user');
  });

  it('prioriza DATABASE_URL del hosting sobre los valores locales', async () => {
    process.env.DB_DIALECT = 'postgres';
    process.env.DATABASE_URL = 'postgres://cloud_user:example@cloud.example.test:5432/cloud_db';
    process.env.DB_HOST = 'localhost';
    const { sequelize } = await import('../database.js');
    expect(sequelize.config.host).toBe('cloud.example.test');
    expect(Number(sequelize.config.port)).toBe(5432);
    expect(sequelize.config.database).toBe('cloud_db');
    expect(sequelize.config.username).toBe('cloud_user');
    await sequelize.close();
  });

  it('verifica el certificado cuando se solicita TLS para PostgreSQL externo', async () => {
    process.env.DB_DIALECT = 'postgres';
    process.env.DB_SSL = 'true';
    const { sequelize } = await import('../database.js');
    expect(sequelize.options.dialectOptions.ssl).toEqual({
      require: true,
      rejectUnauthorized: true,
    });
    await sequelize.close();
  });

  it('usa el puerto estándar si la URL del hosting no especifica uno', async () => {
    process.env.DB_DIALECT = 'postgres';
    process.env.DATABASE_URL = 'postgres://cloud_user:example@cloud.example.test/cloud_db';
    process.env.DB_PORT = '5433';
    const { sequelize } = await import('../database.js');
    expect(Number(sequelize.config.port)).toBe(5432);
    await sequelize.close();
  });
});
