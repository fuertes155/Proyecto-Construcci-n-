/**
 * Seed inicial: catálogo base para el mercado de Nariño.
 *
 * - Tipos de calculadora (hormigón, mampostería, mortero, bloque, acero,
 *   pintura, enchape, cimiento ciclópeo y cubierta) según `docs/API.md`.
 * - Materiales de construcción con su unidad.
 * - Proveedores locales (datos de demostración) y sus precios en COP
 *   (también de demostración: referencias aproximadas, no cotizaciones reales).
 *
 * Idempotente: usa `findOrCreate` / `upsert`, se puede ejecutar varias veces.
 */
import logger from '../config/logger.js';
import {
  CalculatorType,
  Material,
  MaterialPrice,
  Provider,
} from '../models/index.js';

const calculatorTypes = [
  {
    id: 'concrete',
    name: 'Calculadora de Hormigón',
    description: 'Calcula el volumen de hormigón y el cemento, arena y grava necesarios.',
    fields: [
      { name: 'length', label: 'Largo (m)', type: 'number', required: true },
      { name: 'width', label: 'Ancho (m)', type: 'number', required: true },
      { name: 'height', label: 'Espesor (m)', type: 'number', required: true },
      { name: 'strength', label: 'Resistencia (2500, 3000 o 3500 psi)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'brick',
    name: 'Calculadora de Mampostería',
    description: 'Calcula la cantidad de ladrillos y el mortero de pega de un muro.',
    fields: [
      { name: 'width', label: 'Ancho del muro (m)', type: 'number', required: true },
      { name: 'height', label: 'Alto del muro (m)', type: 'number', required: true },
      { name: 'brickUnit', label: 'Pieza (tolete o bloque de arcilla n.º 4)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'mortar',
    name: 'Calculadora de Mortero',
    description: 'Calcula el mortero de pega o revoque y su dosificación de cemento y arena.',
    fields: [
      { name: 'area', label: 'Área (m²)', type: 'number', required: true },
      { name: 'thickness', label: 'Espesor (cm)', type: 'number', required: true },
      { name: 'mix', label: 'Proporción (1:3, 1:4 o 1:5)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'block',
    name: 'Calculadora de Muro en Bloque',
    description: 'Calcula los bloques de concreto n.º 4 y el mortero de pega de un muro.',
    fields: [
      { name: 'width', label: 'Ancho del muro (m)', type: 'number', required: true },
      { name: 'height', label: 'Alto del muro (m)', type: 'number', required: true },
      { name: 'blockSize', label: 'Bloque (n.º 4 o n.º 6)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'rebar',
    name: 'Calculadora de Acero de Refuerzo',
    description: 'Calcula las varillas de 1/2" y el alambre de amarre de la malla de una placa.',
    fields: [
      { name: 'length', label: 'Largo de la placa (m)', type: 'number', required: true },
      { name: 'width', label: 'Ancho de la placa (m)', type: 'number', required: true },
      { name: 'spacing', label: 'Separación entre varillas (cm)', type: 'number', required: true },
      { name: 'diameter', label: 'Diámetro (3/8", 1/2" o 5/8")', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'paint',
    name: 'Calculadora de Pintura',
    description: 'Calcula los galones de pintura vinilo según el área y el número de manos.',
    fields: [
      { name: 'area', label: 'Área a pintar (m²)', type: 'number', required: true },
      { name: 'coats', label: 'Número de manos', type: 'number', required: false },
      { name: 'paintType', label: 'Pintura (vinilo tipo 1, tipo 2 o exteriores)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'tile',
    name: 'Calculadora de Piso y Enchape',
    description: 'Calcula la baldosa cerámica, el pegante y la boquilla para un área.',
    fields: [
      { name: 'area', label: 'Área a enchapar (m²)', type: 'number', required: true },
      { name: 'tileType', label: 'Piso (cerámica o porcelanato)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'footing',
    name: 'Calculadora de Cimiento Ciclópeo',
    description: 'Calcula el hormigón y la piedra rajón de un cimiento corrido.',
    fields: [
      { name: 'length', label: 'Largo (m)', type: 'number', required: true },
      { name: 'width', label: 'Ancho (m)', type: 'number', required: true },
      { name: 'height', label: 'Alto (m)', type: 'number', required: true },
      { name: 'stonePct', label: 'Piedra (%)', type: 'number', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
  {
    id: 'roof',
    name: 'Calculadora de Cubierta',
    description: 'Calcula las tejas y los ganchos de amarre para el área de una cubierta.',
    fields: [
      { name: 'area', label: 'Área de cubierta (m²)', type: 'number', required: true },
      { name: 'sheet', label: 'Teja (fibrocemento n.º 6 o zinc)', type: 'select', required: false },
      { name: 'wastePct', label: 'Desperdicio (%)', type: 'number', required: false },
    ],
  },
];

const materials = [
  { key: 'cemento', name: 'Cemento gris', unit: 'saco 50 kg', category: 'aglomerante' },
  { key: 'arena', name: 'Arena de río', unit: 'm³', category: 'agregado' },
  { key: 'grava', name: 'Grava / triturado', unit: 'm³', category: 'agregado' },
  { key: 'ladrillo', name: 'Ladrillo tolete común', unit: 'unidad', category: 'mampostería' },
  { key: 'bloque', name: 'Bloque de concreto n.º 4', unit: 'unidad', category: 'mampostería' },
  { key: 'mortero', name: 'Mortero seco premezclado', unit: 'saco 40 kg', category: 'aglomerante' },
  { key: 'varilla', name: 'Varilla corrugada 1/2" x 6 m', unit: 'unidad', category: 'acero' },
  { key: 'pintura', name: 'Pintura vinilo tipo 1', unit: 'galón', category: 'acabados' },
  { key: 'alambre', name: 'Alambre negro calibre 18', unit: 'kg', category: 'acero' },
  { key: 'baldosa', name: 'Baldosa cerámica para piso', unit: 'm²', category: 'acabados' },
  { key: 'pegante', name: 'Pegante cerámico', unit: 'saco 25 kg', category: 'acabados' },
  { key: 'boquilla', name: 'Boquilla para juntas', unit: 'bolsa 2 kg', category: 'acabados' },
  { key: 'piedra', name: 'Piedra rajón', unit: 'm³', category: 'agregado' },
  { key: 'arenaPena', name: 'Arena de peña', unit: 'm³', category: 'agregado' },
  { key: 'cal', name: 'Cal hidratada', unit: 'bulto 25 kg', category: 'aglomerante' },
  { key: 'bloqueArcilla', name: 'Bloque de arcilla n.º 4', unit: 'unidad', category: 'mampostería' },
  { key: 'bloque6', name: 'Bloque de concreto n.º 6', unit: 'unidad', category: 'mampostería' },
  { key: 'varilla38', name: 'Varilla corrugada 3/8" x 6 m', unit: 'unidad', category: 'acero' },
  { key: 'varilla58', name: 'Varilla corrugada 5/8" x 6 m', unit: 'unidad', category: 'acero' },
  { key: 'malla', name: 'Malla electrosoldada 15 x 15 cm (2,35 x 6 m)', unit: 'unidad', category: 'acero' },
  { key: 'pintura2', name: 'Pintura vinilo tipo 2', unit: 'galón', category: 'acabados' },
  { key: 'pinturaExt', name: 'Pintura para exteriores', unit: 'galón', category: 'acabados' },
  { key: 'estuco', name: 'Estuco en polvo', unit: 'bulto 25 kg', category: 'acabados' },
  { key: 'porcelanato', name: 'Porcelanato para piso', unit: 'm²', category: 'acabados' },
  { key: 'pegantePorc', name: 'Pegante para porcelanato', unit: 'saco 25 kg', category: 'acabados' },
  { key: 'tejaFibro', name: 'Teja de fibrocemento n.º 6', unit: 'unidad', category: 'cubierta' },
  { key: 'tejaZinc', name: 'Teja de zinc ondulada 3,05 m', unit: 'unidad', category: 'cubierta' },
  { key: 'gancho', name: 'Gancho para teja', unit: 'unidad', category: 'cubierta' },
  { key: 'impermeabilizante', name: 'Impermeabilizante para cubiertas', unit: 'galón', category: 'cubierta' },
  { key: 'pvcSanitario', name: 'Tubo PVC sanitario 4" x 6 m', unit: 'unidad', category: 'hidráulica' },
  { key: 'pvcPresion', name: 'Tubo PVC presión 1/2" x 6 m', unit: 'unidad', category: 'hidráulica' },
  { key: 'puntilla', name: 'Puntilla con cabeza 2"', unit: 'libra', category: 'ferretería' },
  { key: 'formaleta', name: 'Tabla para formaleta 3 m', unit: 'unidad', category: 'madera' },
];

// Proveedores de demostración (no representan empresas reales).
const providers = [
  {
    key: 'constructor',
    name: 'Depósito El Constructor (demo)',
    location: 'Pasto, Nariño',
    phone: '+57 310 000 0001',
    email: 'ventas@elconstructor.demo',
    rating: 4.6,
    deliveryTime: '24 h',
    prices: {
      cemento: 35000, arena: 90000, grava: 96000, ladrillo: 1400,
      bloque: 2800, mortero: 22000, varilla: 38000, pintura: 76000,
      alambre: 9500, baldosa: 34900, pegante: 24000, boquilla: 6500, piedra: 78000,
      arenaPena: 65000, cal: 15000, bloqueArcilla: 1150, bloque6: 3700, varilla38: 21500,
      varilla58: 59000, malla: 152000, pintura2: 49000, pinturaExt: 99000, estuco: 29000,
      porcelanato: 64900, pegantePorc: 44000, tejaFibro: 46000, tejaZinc: 39000, gancho: 1000,
      impermeabilizante: 61000, pvcSanitario: 64000, pvcPresion: 10200, puntilla: 4500,
      formaleta: 10000,
    },
  },
  {
    key: 'laroca',
    name: 'Ferretería La Roca (demo)',
    location: 'Pasto, Nariño',
    phone: '+57 310 000 0002',
    email: 'info@laroca.demo',
    rating: 4.3,
    deliveryTime: '48 h',
    prices: {
      cemento: 34200, arena: 88000, grava: 94000, ladrillo: 1350,
      bloque: 2750, mortero: 23000, varilla: 37500, pintura: 79000,
      alambre: 9200, baldosa: 33500, pegante: 23500, boquilla: 6900, piedra: 75000,
      arenaPena: 62000, cal: 14500, bloqueArcilla: 1100, bloque6: 3600, varilla38: 21000,
      varilla58: 58200, malla: 148000, pintura2: 51000, pinturaExt: 104000, estuco: 30500,
      porcelanato: 62500, pegantePorc: 42500, tejaFibro: 44500, tejaZinc: 40500, gancho: 950,
      impermeabilizante: 59500, pvcSanitario: 62000, pvcPresion: 9800, puntilla: 4300,
      formaleta: 9500,
    },
  },
  {
    key: 'galeras',
    name: 'Materiales Galeras (demo)',
    location: 'Ipiales, Nariño',
    phone: '+57 310 000 0003',
    email: 'contacto@galeras.demo',
    rating: 4.1,
    deliveryTime: '72 h',
    prices: {
      cemento: 36000, arena: 85000, grava: 92000, ladrillo: 1450,
      bloque: 2900, mortero: 21500, varilla: 39000, pintura: 74000,
      alambre: 9800, baldosa: 36000, pegante: 25000, boquilla: 6200, piedra: 72000,
      arenaPena: 60000, cal: 15800, bloqueArcilla: 1250, bloque6: 3850, varilla38: 22300,
      varilla58: 60500, malla: 158000, pintura2: 47500, pinturaExt: 97000, estuco: 28500,
      porcelanato: 67000, pegantePorc: 45500, tejaFibro: 47500, tejaZinc: 38000, gancho: 1100,
      impermeabilizante: 63000, pvcSanitario: 66500, pvcPresion: 10900, puntilla: 4700,
      formaleta: 10800,
    },
  },
];

export async function seed(): Promise<void> {
  for (const ct of calculatorTypes) {
    await CalculatorType.upsert(ct);
  }
  logger.info(`  Tipos de calculadora: ${calculatorTypes.length}`);

  const materialIds: Record<string, string> = {};
  for (const m of materials) {
    const [row] = await Material.findOrCreate({
      where: { name: m.name },
      defaults: { name: m.name, unit: m.unit, category: m.category },
    });
    materialIds[m.key] = row.id;
  }
  logger.info(`  Materiales: ${materials.length}`);

  let priceCount = 0;
  for (const p of providers) {
    const [provider] = await Provider.findOrCreate({
      where: { name: p.name },
      defaults: {
        name: p.name,
        location: p.location,
        phone: p.phone,
        email: p.email,
        rating: p.rating,
        deliveryTime: p.deliveryTime,
      },
    });

    for (const [key, price] of Object.entries(p.prices)) {
      const materialId = materialIds[key];
      if (!materialId) continue;
      const [row, created] = await MaterialPrice.findOrCreate({
        where: { materialId, providerId: provider.id },
        defaults: { materialId, providerId: provider.id, price, currency: 'COP' },
      });
      if (!created) {
        row.price = price;
        await row.save();
      }
      priceCount += 1;
    }
  }
  logger.info(`  Proveedores: ${providers.length} · Precios: ${priceCount}`);
}
