import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';

const root = fileURLToPath(new URL('../', import.meta.url));
const backend = path.join(root, 'backend');
const local = process.argv.includes('--local');
const demo = local || process.argv.includes('--demo');
const prepareOnly = process.argv.includes('--prepare-only');
const children = new Set();
let stopping = false;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let config = {};
try {
  config = dotenv.parse(await readFile(path.join(backend, '.env')));
} catch {
  /* valores predeterminados de desarrollo */
}
const env = { ...process.env, ...config, NODE_ENV: 'development' };
env.JWT_SECRET ||= randomBytes(32).toString('hex');
env.PORT = '5000';
env.HOST = '127.0.0.1';
env.CORS_ORIGIN = 'http://localhost:3000,http://127.0.0.1:3000';
if (local) {
  env.DB_DIALECT = 'sqlite';
  env.DB_STORAGE = path.join(backend, 'data', 'entrega-demo.sqlite');
  env.REDIS_ENABLED = 'false';
  await mkdir(path.dirname(env.DB_STORAGE), { recursive: true });
}
const tsArgs = ['--disable-warning=DEP0180', '--import', './scripts/register-ts-node.js'];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      windowsHide: true,
      stdio: 'inherit',
      ...options,
    });
    children.add(child);
    child.once('error', reject);
    child.once('exit', (code) => {
      children.delete(child);
      code === 0
        ? resolve()
        : reject(new Error(`${path.basename(command)} terminó con código ${code}.`));
    });
  });
}
async function dockerReady() {
  try {
    await run('docker', ['info', '--format', '{{.ServerVersion}}'], {
      stdio: 'ignore',
      timeout: 12000,
    });
    return true;
  } catch {
    return false;
  }
}
function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, () => server.close(() => resolve(true)));
  });
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  await pause(500);
  process.exit(code);
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

try {
  if (!prepareOnly && (!(await portFree(3000)) || !(await portFree(5000)))) {
    throw new Error(
      'Los puertos 3000 o 5000 ya están ocupados. Cierra el arranque anterior antes de iniciar otro.'
    );
  }
  if (
    !local &&
    (env.DB_DIALECT ?? 'postgres') === 'postgres' &&
    ['localhost', '127.0.0.1'].includes(env.DB_HOST ?? 'localhost')
  ) {
    if (!(await dockerReady())) {
      console.log('Iniciando Docker Desktop…');
      await run('docker', ['desktop', 'start', '--detach']);
      let ready = false;
      for (let attempt = 0; attempt < 18; attempt++) {
        if (await dockerReady()) {
          ready = true;
          break;
        }
        await pause(2500);
      }
      if (!ready)
        throw new Error(
          'Docker no inició. Puedes presentar con npm run demo:local (base SQLite independiente).'
        );
    }
    await run(
      'docker',
      ['compose', 'up', '-d', '--wait', '--wait-timeout', '60', 'postgres', 'redis'],
      {
        env: {
          ...env,
          DB_HOST_PORT: env.DB_PORT ?? '5433',
          REDIS_HOST_PORT: env.REDIS_PORT ?? '6380',
        },
      }
    );
  }
  if (demo) await run(process.execPath, [...tsArgs, 'src/seeds/prepare-demo.ts'], { cwd: backend });
  if (prepareOnly) process.exit(0);
  const apiTask = run(process.execPath, [...tsArgs, 'src/index.ts'], { cwd: backend });
  // Captura de inmediato los fallos del proceso para no dejar promesas sin manejar.
  apiTask.catch((error) => {
    console.error(error.message);
    void stop(1);
  });
  let ready = false;
  for (let attempt = 0; attempt < 45; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/status', {
        signal: AbortSignal.timeout(2000),
      });
      const status = await response.json();
      if (status.database === 'connected') {
        ready = true;
        break;
      }
      throw new Error('La API inició sin base de datos. Revisa DB_* en backend/.env.');
    } catch (error) {
      if (error.message.startsWith('La API')) throw error;
    }
    await pause(1000);
  }
  if (!ready)
    throw new Error('El servidor no estuvo listo a tiempo. Revisa el mensaje de arranque.');
  console.log(
    `\nConstruApp lista. ${local ? 'Modo local de respaldo (SQLite).' : 'Base de datos conectada.'}`
  );
  console.log('Web: http://localhost:3000\nCierra con Ctrl+C.');
  await Promise.race([
    apiTask,
    run(
      process.execPath,
      [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--strictPort'],
      { cwd: path.join(root, 'frontend') }
    ),
  ]);
  await stop();
} catch (error) {
  console.error(`\nNo se pudo iniciar: ${error.message}`);
  await stop(1);
}
