import 'dotenv/config'; // debe ir primero: carga .env antes que el resto de módulos

import type { Server } from 'node:http';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from './config/database.js';
import { connectRedis, disconnectRedis, isRedisConnected } from './config/redis.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const isTest = process.env.NODE_ENV === 'test';

// Crear aplicación Express
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware de rate limiting (se omite en test)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: 'Demasiadas solicitudes, por favor intente más tarde.', status: 429 },
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'ConstruApp Nariño Backend está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    server: 'running',
    environment: process.env.NODE_ENV || 'development',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    cache: isRedisConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
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
      projects: '/api/projects'
    }
  });
});

// Rutas de la API
app.use('/api', apiRoutes);

// Manejo de rutas no encontradas y de errores (siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
let server: Server | undefined;

async function start(): Promise<void> {
  // La conexión a BD y caché no bloquea el arranque: si fallan, el servidor
  // igual responde y `/api/status` refleja el estado real.
  await Promise.allSettled([connectDatabase(), connectRedis()]);

  server = app.listen(PORT, () => {
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
