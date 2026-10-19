import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/authSchemas.js';

const router = Router();

// Límite estricto para credenciales: frena la fuerza bruta por IP.
// - `AUTH_RATE_LIMIT_MAX`: intentos por ventana (por defecto 10).
// - `AUTH_RATE_LIMIT_DISABLED=true`: lo desactiva (lo usa la suite de tests,
//   salvo el test dedicado que lo reactiva).
// - Un login correcto no consume cupo (`skipSuccessfulRequests`).
const credentialsLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => process.env.AUTH_RATE_LIMIT_DISABLED === 'true',
  message: { error: 'Demasiados intentos, inténtalo de nuevo más tarde.', status: 429 },
});

router.post(
  '/register',
  credentialsLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);
router.post(
  '/login',
  credentialsLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));

// Recuperación de contraseña (HU-01.6)
router.post(
  '/forgot-password',
  credentialsLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);
router.post(
  '/reset-password',
  credentialsLimiter,
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

// Gestión de perfil (requiere sesión)
router.get('/me', requireAuth, asyncHandler(authController.me));
router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(authController.updateMe)
);
router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

export default router;
