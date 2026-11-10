import {
  BLOCK_PER_M2,
  BRICK_UNITS,
  CONCRETE_BLOCKS,
  CONCRETE_MIXES,
  CONCRETE_PER_M3,
  DEFAULT_VARIANT,
  DEFAULT_WASTE_PCT,
  DEFAULT_PAINT_COATS,
  DEFAULT_STONE_PCT,
  GROUT_BAG_KG,
  MORTAR_MIXES,
  MORTAR_SACK_KG,
  PAINT_TYPES,
  REBAR,
  REBAR_DIAMETERS,
  ROOF_SHEETS,
  TILE_ADHESIVE_SACK_KG,
  TILE_TYPES,
} from './dosifications.js';
import type { CalculatorId } from '../services/calculatorService.js';

export interface CalculationExplanation {
  formula: string;
  steps: string[];
  assumptions: string[];
}
const n = (value: unknown) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(Number(value));

/** Documenta las mismas constantes del motor; no introduce una segunda dosificación. */
export function explainCalculation(
  type: CalculatorId,
  input: Record<string, unknown>
): CalculationExplanation {
  const waste = Number(input.wastePct ?? DEFAULT_WASTE_PCT);
  const factor = 1 + waste / 100;
  const steps = [
    `Desperdicio: ${n(waste)} %. Factor aplicado a los consumos: 1 + ${n(waste)} / 100 = ${n(factor)}.`,
  ];
  let formula = '';
  const assumptions = [
    'Estimación de materiales con los rendimientos de referencia del proyecto; no constituye un diseño estructural ni una resistencia garantizada.',
    'El costo suma cantidad × precio unitario, usando el menor precio registrado por material. Los materiales sin precio se identifican y no suman al total.',
    'Confirma disponibilidad, transporte, impuestos pendientes, pedidos mínimos y empaques con cada comercio. No incluye mano de obra.',
  ];
  switch (type) {
    case 'concrete': {
      const mix =
        CONCRETE_MIXES[(input.strength ?? DEFAULT_VARIANT.strength) as keyof typeof CONCRETE_MIXES];
      formula = `Volumen = largo × ancho × espesor = ${n(input.length)} × ${n(input.width)} × ${n(input.height)} m³.`;
      steps.push(
        `Por m³: ${n(mix.cementSacks)} sacos de cemento de 50 kg, ${n(mix.sandM3)} m³ de arena y ${n(mix.gravelM3)} m³ de grava.`,
        'Cada consumo se multiplica por el volumen y por el factor de desperdicio. Cemento: sacos completos hacia arriba; agregados: dos decimales.'
      );
      break;
    }
    case 'brick':
    case 'block': {
      const unit =
        type === 'brick'
          ? BRICK_UNITS[(input.brickUnit ?? DEFAULT_VARIANT.brickUnit) as keyof typeof BRICK_UNITS]
          : CONCRETE_BLOCKS[
              (input.blockSize ?? DEFAULT_VARIANT.blockSize) as keyof typeof CONCRETE_BLOCKS
            ];
      formula = `Área del muro = ancho × alto = ${n(input.width)} × ${n(input.height)} m².`;
      steps.push(
        `Rendimiento: ${n(unit.perM2 ?? BLOCK_PER_M2.blocks)} piezas y ${n(unit.mortarKg)} kg de mortero por m².`,
        `Piezas = área × rendimiento × ${n(factor)}. Mortero = área × ${n(unit.mortarKg)} × ${n(factor)} / ${MORTAR_SACK_KG} kg por saco. Ambos se redondean hacia arriba.`
      );
      assumptions.push(
        'Área bruta: descuenta los vanos de puertas y ventanas al preparar las medidas.'
      );
      break;
    }
    case 'mortar': {
      const mix = MORTAR_MIXES[(input.mix ?? DEFAULT_VARIANT.mix) as keyof typeof MORTAR_MIXES];
      formula = `Volumen = área × espesor / 100 = ${n(input.area)} × ${n(input.thickness)} / 100 m³ (espesor en cm).`;
      steps.push(
        `Por m³: ${n(mix.cementSacks)} sacos de cemento de 50 kg y ${n(mix.sandM3)} m³ de arena.`,
        'Multiplica por volumen y desperdicio. Cemento: sacos completos hacia arriba; arena: dos decimales.'
      );
      break;
    }
    case 'paint': {
      const paint =
        PAINT_TYPES[(input.paintType ?? DEFAULT_VARIANT.paintType) as keyof typeof PAINT_TYPES];
      formula = `Galones = área × manos × factor / rendimiento = ${n(input.area)} × ${n(input.coats ?? DEFAULT_PAINT_COATS)} × ${n(factor)} / ${n(paint.m2PerGallonCoat)}.`;
      steps.push(
        `Rendimiento utilizado: ${n(paint.m2PerGallonCoat)} m² por galón y por mano.`,
        'Se redondea al siguiente galón entero. El área principal corresponde a la superficie, sin multiplicar las manos.'
      );
      assumptions.push(
        'El consumo real depende del estado, absorción y preparación de la superficie.'
      );
      break;
    }
    case 'tile': {
      const tile =
        TILE_TYPES[(input.tileType ?? DEFAULT_VARIANT.tileType) as keyof typeof TILE_TYPES];
      formula = `Piso o enchape = área × factor = ${n(input.area)} × ${n(factor)} m².`;
      steps.push(
        `Pegante: área × ${n(tile.adhesiveKg)} kg/m² × factor / ${TILE_ADHESIVE_SACK_KG} kg por saco.`,
        `Boquilla: área × ${n(tile.groutKg)} kg/m² × factor / ${GROUT_BAG_KG} kg por bolsa.`,
        'Sacos y bolsas se redondean hacia arriba; piso a dos decimales. El redondeo a cajas comerciales se confirma con el proveedor.'
      );
      break;
    }
    case 'roof': {
      const sheet = ROOF_SHEETS[(input.sheet ?? DEFAULT_VARIANT.sheet) as keyof typeof ROOF_SHEETS];
      formula = `Tejas = área / área útil × factor = ${n(input.area)} / ${n(sheet.usefulM2)} × ${n(factor)}.`;
      steps.push(
        'La cantidad de tejas se redondea hacia arriba; el área útil ya contempla traslapos.',
        `Ganchos = tejas redondeadas × ${sheet.hooksPerSheet}.`
      );
      assumptions.push(
        'Ingresa el área de la superficie inclinada del techo, no solo su proyección horizontal.'
      );
      break;
    }
    case 'footing': {
      const stone = Number(input.stonePct ?? DEFAULT_STONE_PCT);
      formula = `Volumen = largo × ancho × alto = ${n(input.length)} × ${n(input.width)} × ${n(input.height)} m³.`;
      steps.push(
        `Piedra rajón: ${n(stone)} % del volumen. Hormigón: ${n(100 - stone)} %.`,
        `Por m³ de hormigón: ${n(CONCRETE_PER_M3.cementSacks)} sacos de 50 kg, ${n(CONCRETE_PER_M3.sandM3)} m³ de arena y ${n(CONCRETE_PER_M3.gravelM3)} m³ de grava.`,
        'Aplica desperdicio a cada consumo. Cemento: sacos hacia arriba; agregados y piedra: dos decimales.'
      );
      break;
    }
    case 'rebar': {
      const bar =
        REBAR_DIAMETERS[
          (input.diameter ?? DEFAULT_VARIANT.diameter) as keyof typeof REBAR_DIAMETERS
        ];
      formula = `Malla en dos sentidos; separación = ${n(input.spacing)} / 100 m. Área = ${n(input.length)} × ${n(input.width)} m².`;
      steps.push(
        'Barras paralelas al largo = parte entera(ancho / separación) + 1; barras paralelas al ancho = parte entera(largo / separación) + 1.',
        `Cada tramo mayor de ${REBAR.barLengthM} m incorpora ${n(bar.lapM)} m por empalme. Número de empalmes = redondeo superior((tramo − ${REBAR.barLengthM}) / (${REBAR.barLengthM} − ${n(bar.lapM)})).`,
        `Suma los metros de ambos sentidos con sus empalmes; multiplica por ${n(factor)}, divide por ${REBAR.barLengthM} m y redondea hacia arriba.`,
        `Alambre = barras × ${REBAR.barLengthM} m × ${n(bar.kgPerM)} kg/m × ${n(REBAR.tieWireKgPerKgSteel * 100)} %. Se redondea a kg completos, con mínimo 1 kg.`
      );
      assumptions.push(
        'Los diámetros, separaciones y traslapos deben proceder del diseño del profesional responsable.'
      );
      break;
    }
  }
  return { formula, steps, assumptions };
}
