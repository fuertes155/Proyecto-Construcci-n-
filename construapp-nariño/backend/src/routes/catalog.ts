import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { validate } from '../middleware/validate.js';
import {
  materialsQuerySchema,
  providerIdSchema,
  providersQuerySchema,
} from '../schemas/catalogSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Catálogo público (EP-04): se puede consultar sin sesión.
const router = Router();

router.get(
  '/materials',
  validate(materialsQuerySchema, 'query'),
  asyncHandler(catalogController.materials)
);
router.get(
  '/providers',
  validate(providersQuerySchema, 'query'),
  asyncHandler(catalogController.providers)
);
router.get(
  '/providers/:providerId',
  validate(providerIdSchema, 'params'),
  asyncHandler(catalogController.provider)
);

export default router;
