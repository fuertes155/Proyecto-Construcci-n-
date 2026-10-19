import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createMaterialSchema,
  createProviderSchema,
  idParamSchema,
  listUsersQuerySchema,
  priceQuerySchema,
  setUserStatusSchema,
  updateMaterialSchema,
  updateProviderSchema,
  upsertPriceSchema,
} from '../schemas/adminSchemas.js';

// Todo el back-office es solo para el rol `admin`.
const router = Router();
router.use(requireAuth, requireRole('admin'));

/* Materiales (HU-12.1) */
router.get('/materials', asyncHandler(adminController.listMaterials));
router.post('/materials', validate(createMaterialSchema), asyncHandler(adminController.createMaterial));
router.patch(
  '/materials/:id',
  validate(idParamSchema, 'params'),
  validate(updateMaterialSchema),
  asyncHandler(adminController.updateMaterial)
);
router.delete(
  '/materials/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(adminController.deactivateMaterial)
);

/* Proveedores */
router.get('/providers', asyncHandler(adminController.listProviders));
router.post('/providers', validate(createProviderSchema), asyncHandler(adminController.createProvider));
router.patch(
  '/providers/:id',
  validate(idParamSchema, 'params'),
  validate(updateProviderSchema),
  asyncHandler(adminController.updateProvider)
);

/* Precios por proveedor (HU-12.2) */
router.get('/prices', validate(priceQuerySchema, 'query'), asyncHandler(adminController.listPrices));
router.put('/prices', validate(upsertPriceSchema), asyncHandler(adminController.upsertPrice));
router.delete(
  '/prices/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(adminController.deletePrice)
);

/* Moderación de usuarios (HU-12.3) */
router.get('/users', validate(listUsersQuerySchema, 'query'), asyncHandler(adminController.listUsers));
router.patch(
  '/users/:id/status',
  validate(idParamSchema, 'params'),
  validate(setUserStatusSchema),
  asyncHandler(adminController.setUserStatus)
);

export default router;
