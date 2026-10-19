import { Router } from 'express';
import { projectController } from '../controllers/projectController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  calculationParamsSchema,
  createProjectSchema,
  projectIdSchema,
  saveCalculationSchema,
  updateProjectSchema,
} from '../schemas/projectSchemas.js';

// Todas las rutas de proyectos requieren sesión.
const router = Router();
router.use(requireAuth);

router.post('/', validate(createProjectSchema), asyncHandler(projectController.create));
router.get('/', asyncHandler(projectController.list));

router.get(
  '/:projectId',
  validate(projectIdSchema, 'params'),
  asyncHandler(projectController.detail)
);
router.patch(
  '/:projectId',
  validate(projectIdSchema, 'params'),
  validate(updateProjectSchema),
  asyncHandler(projectController.update)
);
router.delete(
  '/:projectId',
  validate(projectIdSchema, 'params'),
  asyncHandler(projectController.remove)
);

router.post(
  '/:projectId/calculations',
  validate(projectIdSchema, 'params'),
  validate(saveCalculationSchema),
  asyncHandler(projectController.addCalculation)
);
router.delete(
  '/:projectId/calculations/:calculationId',
  validate(calculationParamsSchema, 'params'),
  asyncHandler(projectController.removeCalculation)
);

export default router;
