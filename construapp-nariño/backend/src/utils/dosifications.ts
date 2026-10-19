/**
 * Dosificaciones y rendimientos de materiales para las calculadoras.
 *
 * ⚠️  VALORES APROXIMADOS. Son referencias habituales de obra en Colombia para
 *     el MVP; deben ser revisados y ajustados por un ingeniero civil antes de
 *     usarse en presupuestos reales (ver `docs/HISTORIAS-DE-USUARIO.md` §7).
 *
 * Los "roles" de material (`cement`, `sand`, …) se mapean a materiales reales
 * del catálogo en `priceService.ts`.
 */

export type MaterialRole =
  | 'cement'
  | 'sand'
  | 'gravel'
  | 'brick'
  | 'mortarMix'
  | 'block'
  | 'rebar'
  | 'tieWire'
  | 'paint'
  | 'tile'
  | 'tileAdhesive'
  | 'grout'
  | 'stone'
  | 'roofSheet'
  | 'roofHook';

/** Desperdicio por defecto (%) y límites admitidos. */
export const DEFAULT_WASTE_PCT = 5;
export const MAX_WASTE_PCT = 30;

/**
 * Hormigón ~3000 psi (21 MPa), mezcla 1:2:3 aprox.
 * Cantidades por m³ de hormigón terminado.
 */
export const CONCRETE_PER_M3 = {
  cementSacks: 7, // sacos de 50 kg
  sandM3: 0.55,
  gravelM3: 0.8,
} as const;

/**
 * Mampostería en ladrillo tolete común (~24×12×6 cm), muro de soga (~12 cm),
 * junta de mortero de 1 cm. Por m² de muro.
 */
export const BRICK_PER_M2 = {
  bricks: 57,
  mortarKg: 25, // mortero seco premezclado
} as const;

/** Mortero de pega / revoque, dosificación 1:4. Cantidades por m³ de mortero. */
export const MORTAR_PER_M3 = {
  cementSacks: 7, // sacos de 50 kg
  sandM3: 1.05,
} as const;

/** Presentación del mortero seco premezclado (kg por saco). */
export const MORTAR_SACK_KG = 40;

/**
 * Muro en bloque de concreto n.º 4 (10×20×40 cm) con junta de 1 cm. Por m² de muro:
 * 1 / (0,41 × 0,21) ≈ 11,6 bloques, pegados con mortero seco premezclado.
 */
export const BLOCK_PER_M2 = {
  blocks: 11.6,
  mortarKg: 17,
} as const;

/**
 * Malla de acero para placa con varilla corrugada de 1/2" en barras de 6 m
 * (≈ 0,994 kg/m). Los tramos más largos que una barra se empalman con un
 * traslapo de ~0,6 m. Alambre negro de amarre ≈ 2 % del peso del acero.
 */
export const REBAR = {
  barLengthM: 6,
  lapM: 0.6,
  kgPerM: 0.994,
  tieWireKgPerKgSteel: 0.02,
} as const;

/** Pintura vinilo tipo 1: m² que cubre un galón en una mano sobre pañete o estuco. */
export const PAINT_M2_PER_GALLON_COAT = 25;
export const DEFAULT_PAINT_COATS = 2;

/**
 * Piso o enchape cerámico con llana dentada de 6 mm y junta de ~3 mm. Por m²:
 * pegante en sacos de 25 kg y boquilla en bolsas de 2 kg.
 */
export const TILE_PER_M2 = {
  adhesiveKg: 5,
  groutKg: 0.4,
} as const;
export const TILE_ADHESIVE_SACK_KG = 25;
export const GROUT_BAG_KG = 2;

/**
 * Cimiento ciclópeo: porcentaje del volumen que ocupa la piedra rajón; el resto es
 * hormigón con la misma mezcla de `CONCRETE_PER_M3`.
 */
export const DEFAULT_STONE_PCT = 40;
export const MAX_STONE_PCT = 60;

/** Factor multiplicador por desperdicio: `applyWaste(100, 5) === 105`. */
export function wasteFactor(wastePct: number): number {
  return 1 + wastePct / 100;
}

/** Redondeo a `n` decimales. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/* -------------------------------------------------------------- variantes --- */
/*
 * Opciones de material que se eligen en cada calculadora. `material` es el nombre
 * exacto en el catálogo (seed `0001-catalogo-narino.seed.ts`); si se renombra un
 * material, actualizarlo aquí. La opción por defecto está en `DEFAULT_VARIANT`.
 */

/** Resistencia del hormigón → cantidades por m³ (tablas de dosificación habituales). */
export const CONCRETE_MIXES = {
  '2500': { cementSacks: 6, sandM3: 0.48, gravelM3: 0.96 }, // 1:2:4, ~17,5 MPa
  '3000': CONCRETE_PER_M3, // 1:2:3, ~21 MPa
  '3500': { cementSacks: 8.4, sandM3: 0.67, gravelM3: 0.67 }, // 1:2:2, ~24,5 MPa
} as const;

/** Proporción cemento:arena del mortero → cantidades por m³. */
export const MORTAR_MIXES = {
  '1:3': { cementSacks: 9, sandM3: 0.95 },
  '1:4': MORTAR_PER_M3,
  '1:5': { cementSacks: 6, sandM3: 1.1 },
} as const;

/** Pieza de mampostería de arcilla → piezas y kg de mortero seco por m² de muro. */
export const BRICK_UNITS = {
  // Ladrillo tolete común ~24×12×6 cm, muro de soga, junta de 1 cm
  tolete: { material: 'Ladrillo tolete común', perM2: BRICK_PER_M2.bricks, mortarKg: BRICK_PER_M2.mortarKg },
  // Bloque de arcilla n.º 4 ~10×20×30 cm: 1 / (0,31 × 0,21) ≈ 15,4
  arcilla4: { material: 'Bloque de arcilla n.º 4', perM2: 15.4, mortarKg: 12 },
} as const;

/** Bloque de concreto → piezas y kg de mortero seco por m² (más grueso, más mortero). */
export const CONCRETE_BLOCKS = {
  n4: { material: 'Bloque de concreto n.º 4', perM2: BLOCK_PER_M2.blocks, mortarKg: BLOCK_PER_M2.mortarKg }, // 10 cm
  n6: { material: 'Bloque de concreto n.º 6', perM2: BLOCK_PER_M2.blocks, mortarKg: 25 }, // 15 cm
} as const;

/** Diámetro de varilla → peso por metro y traslapo (~48 diámetros). */
export const REBAR_DIAMETERS = {
  '3/8': { material: 'Varilla corrugada 3/8" x 6 m', kgPerM: 0.56, lapM: 0.45 },
  '1/2': { material: 'Varilla corrugada 1/2" x 6 m', kgPerM: REBAR.kgPerM, lapM: REBAR.lapM },
  '5/8': { material: 'Varilla corrugada 5/8" x 6 m', kgPerM: 1.552, lapM: 0.75 },
} as const;

/** Tipo de pintura → m² por galón y por mano. */
export const PAINT_TYPES = {
  vinilo1: { material: 'Pintura vinilo tipo 1', m2PerGallonCoat: PAINT_M2_PER_GALLON_COAT },
  vinilo2: { material: 'Pintura vinilo tipo 2', m2PerGallonCoat: 20 },
  exterior: { material: 'Pintura para exteriores', m2PerGallonCoat: 22 },
} as const;

/** Tipo de piso → baldosa, pegante y consumos por m². */
export const TILE_TYPES = {
  ceramica: {
    material: 'Baldosa cerámica para piso',
    adhesive: 'Pegante cerámico',
    adhesiveKg: TILE_PER_M2.adhesiveKg,
    groutKg: TILE_PER_M2.groutKg,
  },
  porcelanato: {
    material: 'Porcelanato para piso',
    adhesive: 'Pegante para porcelanato',
    adhesiveKg: 6,
    groutKg: 0.3,
  },
} as const;

/**
 * Cubierta: teja → m² útiles que cubre cada una (ya descontados los traslapos)
 * y ganchos de amarre por teja.
 */
export const ROOF_SHEETS = {
  // Teja n.º 6: 0,92 × 1,83 m; útil ≈ 0,87 × 1,69
  fibrocemento: { material: 'Teja de fibrocemento n.º 6', usefulM2: 1.47, hooksPerSheet: 3 },
  // Teja ondulada 0,80 × 3,05 m; útil ≈ 0,72 × 2,90
  zinc: { material: 'Teja de zinc ondulada 3,05 m', usefulM2: 2.09, hooksPerSheet: 4 },
} as const;
export const ROOF_HOOK_MATERIAL = 'Gancho para teja';

/** Opción que se usa cuando la entrada no la indica (resultados iguales a los de antes). */
export const DEFAULT_VARIANT = {
  strength: '3000',
  mix: '1:4',
  brickUnit: 'tolete',
  blockSize: 'n4',
  diameter: '1/2',
  paintType: 'vinilo1',
  tileType: 'ceramica',
  sheet: 'fibrocemento',
} as const;
