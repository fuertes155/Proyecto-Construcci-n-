import 'dotenv/config'; // debe ir primero: carga .env antes que el resto de módulos

import type { Server } from 'node:http';
import path from 'node:path';
import { existsSync } from 'node:fs';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  sequelize,
} from './config/database.js';
import { connectRedis, disconnectRedis, isRedisConnected } from './config/redis.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const isTest = process.env.NODE_ENV === 'test';

// Crear aplicación Express
const app: Express = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const frontendDirectory =
  process.env.SERVE_FRONTEND === 'true'
    ? path.resolve(process.env.FRONTEND_DIST || '../frontend/dist')
    : undefined;
if (frontendDirectory && !existsSync(path.join(frontendDirectory, 'index.html'))) {
  throw new Error('Falta la compilación web. Ejecuta npm run build:deploy antes de iniciar.');
}
// Render termina HTTPS en su proxy y entrega la IP original en X-Forwarded-For.
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware de rate limiting (se omite en test)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTest || ['/health', '/status', '/ready'].includes(req.path),
  message: { error: 'Demasiadas solicitudes, por favor intente más tarde.', status: 429 },
});
app.use('/api', limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'ConstruApp Nariño Backend está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    server: 'running',
    environment: process.env.NODE_ENV || 'development',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    cache: isRedisConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// El hosting solo dirige tráfico cuando la base responde de verdad.
app.get('/api/ready', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

// Ruta raíz
app.get('/', (req, res, next) => {
  if (frontendDirectory) return next();
  res.json({
    name: 'ConstruApp Nariño',
    description: 'Aplicación de cálculo de materiales de construcción',
    version: '1.0.0',
    api_docs: '/api-docs',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      auth: '/api/auth',
      calculators: '/api/calculators',
      projects: '/api/projects',
    },
  });
});

// Rutas de la API
app.use('/api', apiRoutes);
// Un /api inexistente siempre devuelve JSON, nunca el index.html de React.
app.use('/api', notFoundHandler);

if (frontendDirectory) {
  app.use(express.static(frontendDirectory, { index: false }));
  app.get('*', (req, res, next) => {
    if (path.extname(req.path) || !req.accepts('html')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(frontendDirectory, 'index.html'));
  });
}

// Manejo de rutas no encontradas y de errores (siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
let server: Server | undefined;

async function start(): Promise<void> {
  // La conexión a BD y caché no bloquea el arranque: si fallan, el servidor
  // igual responde y `/api/status` refleja el estado real.
  await Promise.allSettled([connectDatabase(), connectRedis()]);

  server = app.listen(Number(PORT), HOST, () => {
    logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
    logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 URL: http://localhost:${PORT}`);
  });
}

// Apagado ordenado: cierra el servidor HTTP y las conexiones a BD y Redis.
let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`↩️  ${signal} recibido, cerrando…`);

  await new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
  });
  await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);

  logger.info('👋 Cierre completo.');
  process.exit(0);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => void shutdown(signal));
}
process.on('unhandledRejection', (reason) => {
  logger.error(`unhandledRejection: ${reason instanceof Error ? reason.stack : reason}`);
});

// Solo arranca el servidor cuando se ejecuta directamente (no al importarlo en tests).
if (process.env.NODE_ENV !== 'test') {
  void start();
}

export { app, start };
export default app;
