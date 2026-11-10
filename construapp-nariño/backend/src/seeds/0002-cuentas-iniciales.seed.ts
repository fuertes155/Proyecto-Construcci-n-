/**
 * Seed de cuentas iniciales para desarrollo.
 *
 * - Administrador: solo si `ADMIN_EMAIL` y `ADMIN_PASSWORD` están en `.env`
 *   (crea la cuenta o promueve la existente a `admin`).
 * - Usuario demo: `demo@construapp.co` / `demo-12345678` (rol `user`).
 *   En producción requiere `DEMO_MODE=true` explícitamente.
 *
 * Idempotente.
 */
import logger from '../config/logger.js';
import { User } from '../models/index.js';

async function ensureAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    logger.info('  (sin ADMIN_EMAIL/ADMIN_PASSWORD, se omite el admin)');
    return;
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      logger.info(`  Usuario ${email} promovido a admin`);
    } else {
      logger.info(`  Admin ${email} ya existe`);
    }
    return;
  }
  await User.create({
    email,
    password,
    firstName: 'Administrador',
    userType: 'engineer',
    role: 'admin',
  });
  logger.info(`  Admin creado: ${email}`);
}

export async function ensureDemoUser(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') return;
  const email = 'demo@construapp.co';
  const [, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      email,
      password: 'demo-12345678', // el hook `beforeSave` la hashea
      firstName: 'Usuario',
      lastName: 'Demo',
      userType: 'contractor',
      role: 'user',
    },
  });
  logger.info(`  Usuario demo ${created ? 'creado' : 'ya existe'}: ${email}`);
}

export async function seed(): Promise<void> {
  await ensureAdmin();
  await ensureDemoUser();
}
