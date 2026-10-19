import { Router } from 'express';
import { calculatorController } from '../controllers/calculatorController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CALCULATOR_IDS, calculatorSchemas } from '../schemas/calculatorSchemas.js';

// Las calculadoras son públicas (HU-02.10: probar sin registrarse).
const router = Router();

router.get('/types', asyncHandler(calculatorController.types));

// POST /api/calculators/concrete, /brick, /mortar, /block, /rebar, /paint, /tile, /footing
for (const id of CALCULATOR_IDS) {
  router.post(`/${id}`, validate(calculatorSchemas[id]), asyncHandler(calculatorController[id]));
}

export default router;
