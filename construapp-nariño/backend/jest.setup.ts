// Se ejecuta antes de cada suite. Desactiva el rate-limit de credenciales por
// defecto (las suites hacen muchos logins); el test dedicado lo reactiva.
process.env.AUTH_RATE_LIMIT_DISABLED = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
