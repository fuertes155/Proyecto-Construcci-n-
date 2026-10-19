import fs from 'fs';
import path from 'path';
import winston from 'winston';

const isTest = process.env.NODE_ENV === 'test';

// Carpeta de logs, relativa a la raíz del paquete backend (CWD al ejecutar los
// scripts / tests). Se evita `import.meta.url` para que ts-jest (CJS) lo cargue.
const logsDir = path.resolve(process.env.LOG_DIR ?? process.cwd(), 'logs');
if (!isTest) fs.mkdirSync(logsDir, { recursive: true });

// Definir niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato de logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Transports. En test solo consola silenciada, sin archivos.
const transports: winston.transport[] = [
  new winston.transports.Console({
    silent: isTest,
    format: winston.format.combine(winston.format.colorize({ all: true }), format),
  }),
];
if (!isTest) {
  transports.push(
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error', format }),
    new winston.transports.File({ filename: path.join(logsDir, 'all.log'), format })
  );
}

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
  silent: isTest,
  exceptionHandlers: isTest
    ? []
    : [new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })],
  rejectionHandlers: isTest
    ? []
    : [new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })],
});

export default logger;
