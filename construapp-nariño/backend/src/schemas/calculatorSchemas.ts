import Joi from 'joi';
import {
  BRICK_UNITS,
  CONCRETE_BLOCKS,
  CONCRETE_MIXES,
  MAX_STONE_PCT,
  MAX_WASTE_PCT,
  MORTAR_MIXES,
  PAINT_TYPES,
  REBAR_DIAMETERS,
  ROOF_SHEETS,
  TILE_TYPES,
} from '../utils/dosifications.js';

/** Calculadoras disponibles (rutas `POST /api/calculators/:id`). */
export const CALCULATOR_IDS = [
  'concrete',
  'brick',
  'mortar',
  'block',
  'rebar',
  'paint',
  'tile',
  'footing',
  'roof',
] as const;
export type CalculatorId = (typeof CALCULATOR_IDS)[number];

const dimension = Joi.number().positive().max(1000);
const area = Joi.number().positive().max(100000);
const wastePct = Joi.number().min(0).max(MAX_WASTE_PCT).optional();
/** Una de las opciones de una tabla de variantes (`DEFAULT_VARIANT` si se omite). */
const oneOf = (table: object) => Joi.string().valid(...Object.keys(table)).optional();

export const concreteSchema = Joi.object({
  length: dimension.required(),
  width: dimension.required(),
  height: dimension.required(),
  strength: oneOf(CONCRETE_MIXES),
  wastePct,
});

export const brickSchema = Joi.object({
  width: dimension.required(),
  height: dimension.required(),
  brickUnit: oneOf(BRICK_UNITS),
  wastePct,
});

export const mortarSchema = Joi.object({
  area: area.required(),
  thickness: Joi.number().positive().max(50).required(), // cm
  mix: oneOf(MORTAR_MIXES),
  wastePct,
});

export const blockSchema = Joi.object({
  width: dimension.required(),
  height: dimension.required(),
  blockSize: oneOf(CONCRETE_BLOCKS),
  wastePct,
});

export const rebarSchema = Joi.object({
  length: dimension.required(),
  width: dimension.required(),
  spacing: Joi.number().min(5).max(50).required(), // cm entre varillas
  diameter: oneOf(REBAR_DIAMETERS),
  wastePct,
});

export const paintSchema = Joi.object({
  area: area.required(),
  coats: Joi.number().integer().min(1).max(5).optional(),
  paintType: oneOf(PAINT_TYPES),
  wastePct,
});

export const tileSchema = Joi.object({
  area: area.required(),
  tileType: oneOf(TILE_TYPES),
  wastePct,
});

export const footingSchema = Joi.object({
  length: dimension.required(),
  width: dimension.required(),
  height: dimension.required(),
  stonePct: Joi.number().min(0).max(MAX_STONE_PCT).optional(),
  wastePct,
});

export const roofSchema = Joi.object({
  area: area.required(), // m² de cubierta, medidos en la pendiente
  sheet: oneOf(ROOF_SHEETS),
  wastePct,
});

export const calculatorSchemas: Record<CalculatorId, Joi.ObjectSchema> = {
  concrete: concreteSchema,
  brick: brickSchema,
  mortar: mortarSchema,
  block: blockSchema,
  rebar: rebarSchema,
  paint: paintSchema,
  tile: tileSchema,
  footing: footingSchema,
  roof: roofSchema,
};
