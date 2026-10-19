import { CalculatorType } from '../models/index.js';
import { calculatorSchemas, type CalculatorId } from '../schemas/calculatorSchemas.js';
import { ApiError } from '../utils/ApiError.js';
import {
  BRICK_UNITS,
  CONCRETE_BLOCKS,
  CONCRETE_MIXES,
  CONCRETE_PER_M3,
  DEFAULT_PAINT_COATS,
  DEFAULT_STONE_PCT,
  DEFAULT_VARIANT,
  DEFAULT_WASTE_PCT,
  GROUT_BAG_KG,
  MORTAR_MIXES,
  MORTAR_SACK_KG,
  PAINT_TYPES,
  REBAR,
  REBAR_DIAMETERS,
  ROOF_HOOK_MATERIAL,
  ROOF_SHEETS,
  TILE_ADHESIVE_SACK_KG,
  TILE_TYPES,
  round,
  wasteFactor,
} from '../utils/dosifications.js';
import { joiDetails } from '../utils/joiDetails.js';
import { priceItems, type Item, type PricedResult } from './priceService.js';

export type { CalculatorId };

export interface ConcreteInput {
  length: number;
  width: number;
  height: number;
  strength?: keyof typeof CONCRETE_MIXES;
  wastePct?: number;
}
export interface BrickInput {
  width: number;
  height: number;
  brickUnit?: keyof typeof BRICK_UNITS;
  wastePct?: number;
}
export interface MortarInput {
  area: number;
  thickness: number; // cm
  mix?: keyof typeof MORTAR_MIXES;
  wastePct?: number;
}
export interface BlockInput {
  width: number;
  height: number;
  blockSize?: keyof typeof CONCRETE_BLOCKS;
  wastePct?: number;
}
export interface RebarInput {
  length: number;
  width: number;
  spacing: number; // cm entre varillas, en ambos sentidos
  diameter?: keyof typeof REBAR_DIAMETERS;
  wastePct?: number;
}
export interface PaintInput {
  area: number;
  coats?: number;
  paintType?: keyof typeof PAINT_TYPES;
  wastePct?: number;
}
export interface TileInput {
  area: number;
  tileType?: keyof typeof TILE_TYPES;
  wastePct?: number;
}
export interface RoofInput {
  area: number;
  sheet?: keyof typeof ROOF_SHEETS;
  wastePct?: number;
}
export interface FootingInput {
  length: number;
  width: number;
  height: number;
  stonePct?: number;
  wastePct?: number;
}

export interface CalculationResult extends PricedResult {
  calculatorType: CalculatorId;
  /** Magnitud principal calculada (volumen o área). */
  quantity: number;
  unit: string;
  wastePct: number;
  timestamp: string;
}

function build(
  type: CalculatorId,
  quantity: number,
  unit: string,
  wastePct: number,
  priced: PricedResult
): CalculationResult {
  return {
    calculatorType: type,
    quantity: round(quantity, 3),
    unit,
    wastePct,
    ...priced,
    timestamp: new Date().toISOString(),
  };
}

/** Piezas que caben en un largo (con margen para el error de coma flotante): 3 / 0,1 → 30. */
function fit(totalM: number, stepM: number): number {
  return Math.floor(totalM / stepM + 1e-9);
}

/** Metros de varilla para un tramo recto, sumando un traslapo por cada empalme. */
function runWithLaps(lengthM: number, lapM: number): number {
  const { barLengthM } = REBAR;
  if (lengthM <= barLengthM) return lengthM;
  const splices = Math.ceil((lengthM - barLengthM) / (barLengthM - lapM));
  return lengthM + splices * lapM;
}

export const calculatorService = {
  /** HU-02.1 — tipos de calculadora disponibles con sus campos. */
  async listTypes() {
    const rows = await CalculatorType.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'fields'],
    });
    return rows.map((r) => r.toJSON());
  },

  /** HU-02.2 — hormigón de una losa / zapata. */
  async concrete(input: ConcreteInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const volume = input.length * input.width * input.height;
    if (volume <= 0) throw ApiError.badRequest('Las dimensiones deben ser mayores a cero');

    const mix = CONCRETE_MIXES[input.strength ?? DEFAULT_VARIANT.strength];
    const items: Item[] = [
      { role: 'cement', quantity: Math.ceil(volume * mix.cementSacks * f) },
      { role: 'sand', quantity: round(volume * mix.sandM3 * f) },
      { role: 'gravel', quantity: round(volume * mix.gravelM3 * f) },
    ];
    return build('concrete', volume, 'm³', waste, await priceItems(items));
  },

  /** HU-02.3 — ladrillos y mortero de pega de un muro. */
  async brick(input: BrickInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const area = input.width * input.height;
    if (area <= 0) throw ApiError.badRequest('Las dimensiones deben ser mayores a cero');

    const unit = BRICK_UNITS[input.brickUnit ?? DEFAULT_VARIANT.brickUnit];
    const items: Item[] = [
      { role: 'brick', material: unit.material, quantity: Math.ceil(area * unit.perM2 * f) },
      { role: 'mortarMix', quantity: Math.ceil((area * unit.mortarKg * f) / MORTAR_SACK_KG) },
    ];
    return build('brick', area, 'm²', waste, await priceItems(items));
  },

  /** HU-02.4 — mortero de pega o revoque. */
  async mortar(input: MortarInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const volume = input.area * (input.thickness / 100);
    if (volume <= 0) throw ApiError.badRequest('El área y el espesor deben ser mayores a cero');

    const mix = MORTAR_MIXES[input.mix ?? DEFAULT_VARIANT.mix];
    const items: Item[] = [
      { role: 'cement', quantity: Math.ceil(volume * mix.cementSacks * f) },
      { role: 'sand', quantity: round(volume * mix.sandM3 * f) },
    ];
    return build('mortar', volume, 'm³', waste, await priceItems(items));
  },

  /** Muro en bloque de concreto n.º 4 y su mortero de pega. */
  async block(input: BlockInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const area = input.width * input.height;
    if (area <= 0) throw ApiError.badRequest('Las dimensiones deben ser mayores a cero');

    const block = CONCRETE_BLOCKS[input.blockSize ?? DEFAULT_VARIANT.blockSize];
    const items: Item[] = [
      { role: 'block', material: block.material, quantity: Math.ceil(area * block.perM2 * f) },
      { role: 'mortarMix', quantity: Math.ceil((area * block.mortarKg * f) / MORTAR_SACK_KG) },
    ];
    return build('block', area, 'm²', waste, await priceItems(items));
  },

  /** Malla de varilla para una placa (losa o contrapiso) y el alambre de amarre. */
  async rebar(input: RebarInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const area = input.length * input.width;
    if (area <= 0) throw ApiError.badRequest('Las dimensiones deben ser mayores a cero');

    const bar = REBAR_DIAMETERS[input.diameter ?? DEFAULT_VARIANT.diameter];
    const spacingM = input.spacing / 100;
    // Varillas paralelas al largo (repartidas a lo ancho) y paralelas al ancho.
    const barsAlongLength = fit(input.width, spacingM) + 1;
    const barsAlongWidth = fit(input.length, spacingM) + 1;
    const totalM =
      barsAlongLength * runWithLaps(input.length, bar.lapM) +
      barsAlongWidth * runWithLaps(input.width, bar.lapM);

    const bars = Math.ceil((totalM * f) / REBAR.barLengthM);
    const steelKg = bars * REBAR.barLengthM * bar.kgPerM;
    const items: Item[] = [
      { role: 'rebar', material: bar.material, quantity: bars },
      { role: 'tieWire', quantity: Math.max(1, Math.ceil(steelKg * REBAR.tieWireKgPerKgSteel)) },
    ];
    return build('rebar', area, 'm²', waste, await priceItems(items));
  },

  /** Pintura vinilo para un área dada y un número de manos. */
  async paint(input: PaintInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const coats = input.coats ?? DEFAULT_PAINT_COATS;
    if (input.area <= 0) throw ApiError.badRequest('El área debe ser mayor a cero');

    const paint = PAINT_TYPES[input.paintType ?? DEFAULT_VARIANT.paintType];
    const items: Item[] = [
      {
        role: 'paint',
        material: paint.material,
        quantity: Math.ceil((input.area * coats * f) / paint.m2PerGallonCoat),
      },
    ];
    return build('paint', input.area, 'm²', waste, await priceItems(items));
  },

  /** Piso o enchape cerámico: baldosa, pegante y boquilla. */
  async tile(input: TileInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    if (input.area <= 0) throw ApiError.badRequest('El área debe ser mayor a cero');

    const tile = TILE_TYPES[input.tileType ?? DEFAULT_VARIANT.tileType];
    const items: Item[] = [
      { role: 'tile', material: tile.material, quantity: round(input.area * f) },
      {
        role: 'tileAdhesive',
        material: tile.adhesive,
        quantity: Math.ceil((input.area * tile.adhesiveKg * f) / TILE_ADHESIVE_SACK_KG),
      },
      {
        role: 'grout',
        quantity: Math.ceil((input.area * tile.groutKg * f) / GROUT_BAG_KG),
      },
    ];
    return build('tile', input.area, 'm²', waste, await priceItems(items));
  },

  /** Cimiento ciclópeo: hormigón y piedra rajón. */
  async footing(input: FootingInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    const volume = input.length * input.width * input.height;
    if (volume <= 0) throw ApiError.badRequest('Las dimensiones deben ser mayores a cero');

    const stoneShare = (input.stonePct ?? DEFAULT_STONE_PCT) / 100;
    const concreteVolume = volume * (1 - stoneShare);
    const items: Item[] = [
      { role: 'cement', quantity: Math.ceil(concreteVolume * CONCRETE_PER_M3.cementSacks * f) },
      { role: 'sand', quantity: round(concreteVolume * CONCRETE_PER_M3.sandM3 * f) },
      { role: 'gravel', quantity: round(concreteVolume * CONCRETE_PER_M3.gravelM3 * f) },
    ];
    if (stoneShare > 0) items.push({ role: 'stone', quantity: round(volume * stoneShare * f) });
    return build('footing', volume, 'm³', waste, await priceItems(items));
  },

  /** Cubierta en teja: tejas según su área útil (con traslapos) y ganchos de amarre. */
  async roof(input: RoofInput): Promise<CalculationResult> {
    const waste = input.wastePct ?? DEFAULT_WASTE_PCT;
    const f = wasteFactor(waste);
    if (input.area <= 0) throw ApiError.badRequest('El área debe ser mayor a cero');

    const sheet = ROOF_SHEETS[input.sheet ?? DEFAULT_VARIANT.sheet];
    const sheets = Math.ceil((input.area / sheet.usefulM2) * f);
    const items: Item[] = [
      { role: 'roofSheet', material: sheet.material, quantity: sheets },
      { role: 'roofHook', material: ROOF_HOOK_MATERIAL, quantity: sheets * sheet.hooksPerSheet },
    ];
    return build('roof', input.area, 'm²', waste, await priceItems(items));
  },

  /**
   * Ejecuta una calculadora por su id validando la entrada. Lo usa el guardado
   * de cálculos en un proyecto (HU-02.8) para no confiar en el resultado del
   * cliente y usar siempre precios actuales.
   */
  async run(type: CalculatorId, rawInputs: unknown): Promise<CalculationResult> {
    const schema = calculatorSchemas[type];
    if (!schema) throw ApiError.badRequest('Tipo de calculadora no válido');
    const { error, value } = schema.validate(rawInputs ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) throw new ApiError(400, 'Datos del cálculo inválidos', joiDetails(error));
    return this[type](value);
  },
};

export default calculatorService;
