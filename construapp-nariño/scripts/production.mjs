import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const backend = path.join(root, 'backend');
const env = {
  ...process.env,
  NODE_ENV: 'production',
  SERVE_FRONTEND: 'true',
  FRONTEND_DIST: path.join(root, 'frontend', 'dist'),
};

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error('Configura JWT_SECRET con al menos 32 caracteres aleatorios en el hosting.');
}
if (!env.DATABASE_URL && !env.DB_HOST) {
  throw new Error('Configura DATABASE_URL o DB_HOST antes de iniciar producción.');
}
if (env.DB_DIALECT && env.DB_DIALECT !== 'postgres') {
  throw new Error('Este despliegue necesita PostgreSQL persistente.');
}

let active;
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true;
    active?.kill(signal);
  });
}

async function run(script) {
  if (stopping) throw new Error('Arranque cancelado.');
  await new Promise((resolve, reject) => {
    active = spawn(process.execPath, [script], { cwd: backend, env, stdio: 'inherit' });
    active.once('error', reject);
    active.once('exit', (code, signal) => {
      active = undefined;
      if (code === 0 || stopping) resolve();
      else reject(new Error(`${script} terminó con código ${code ?? signal}.`));
    });
  });
}

try {
  if (env.DEMO_MODE === 'true') {
    // Crea esquema, catálogo y una cuenta de ejemplo sin permisos de administrador.
    await run('dist/seeds/prepare-demo.js');
  } else {
    await run('dist/migrations/run.js');
    await run('dist/seeds/catalog.js');
  }
  await run('dist/index.js');
} catch (error) {
  if (!stopping) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
