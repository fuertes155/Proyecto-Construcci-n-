import type { Request, Response } from 'express';
import type { CalculatorId } from '../schemas/calculatorSchemas.js';
import { calculatorService } from '../services/calculatorService.js';

/** Ejecuta la calculadora indicada; el cuerpo ya viene validado por su esquema. */
const runner = (id: CalculatorId) => async (req: Request, res: Response) => {
  res.json(await calculatorService[id](req.body));
};

export const calculatorController = {
  async types(_req: Request, res: Response) {
    res.json({ calculators: await calculatorService.listTypes() });
  },

  concrete: runner('concrete'),
  brick: runner('brick'),
  mortar: runner('mortar'),
  block: runner('block'),
  rebar: runner('rebar'),
  paint: runner('paint'),
  tile: runner('tile'),
  footing: runner('footing'),
  roof: runner('roof'),
};

export default calculatorController;
