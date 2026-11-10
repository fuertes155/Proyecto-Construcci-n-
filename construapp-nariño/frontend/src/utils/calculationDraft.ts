import { z } from 'zod';
import type { CalculationResult, CalculatorId } from '../services/calculators';

const valuesSchema = z.record(z.union([z.number().finite(), z.string()]));
const nullableText = z.string().nullable().optional();
const resultSchema = z.object({
  calculatorType: z.enum([
    'concrete',
    'brick',
    'mortar',
    'block',
    'rebar',
    'paint',
    'tile',
    'footing',
    'roof',
  ]),
  quantity: z.number().finite(),
  unit: z.string(),
  wastePct: z.number().finite(),
  totalCost: z.number().finite(),
  currency: z.literal('COP'),
  missingPrices: z.array(z.string()),
  timestamp: z.string().datetime(),
  materials: z.array(
    z.object({
      id: z.string().nullable(),
      role: z.string(),
      name: z.string(),
      unit: z.string(),
      quantity: z.number().finite(),
      pricePerUnit: z.number().finite().nullable(),
      totalPrice: z.number().finite().nullable(),
      currency: z.literal('COP'),
      provider: z.object({ id: z.string(), name: z.string() }).nullable(),
      sourceUrl: nullableText,
      sourceProduct: nullableText,
      sourceNotes: nullableText,
      checkedAt: nullableText,
    })
  ),
  explanation: z
    .object({ formula: z.string(), steps: z.array(z.string()), assumptions: z.array(z.string()) })
    .optional(),
});
const draftSchema = z.object({
  version: z.literal(1),
  savedAt: z.number(),
  values: valuesSchema,
  lastInputs: valuesSchema.nullable(),
  result: resultSchema.nullable(),
});
const key = (id: CalculatorId) => `construapp:calculation-draft:v1:${id}`;

export function readCalculationDraft(id: CalculatorId) {
  try {
    const draft = draftSchema.parse(JSON.parse(sessionStorage.getItem(key(id)) ?? 'null'));
    if (Date.now() - draft.savedAt > 12 * 60 * 60 * 1000 || draft.savedAt > Date.now()) return null;
    if (draft.result && (draft.result.calculatorType !== id || !draft.lastInputs)) return null;
    return draft;
  } catch {
    return null;
  }
}

export function writeCalculationDraft(
  id: CalculatorId,
  values: Record<string, unknown>,
  lastInputs: Record<string, number | string> | null,
  result: CalculationResult | null
) {
  try {
    sessionStorage.setItem(
      key(id),
      JSON.stringify({ version: 1, savedAt: Date.now(), values, lastInputs, result })
    );
  } catch {
    /* El cálculo funciona aunque el navegador no permita guardar borradores. */
  }
}
