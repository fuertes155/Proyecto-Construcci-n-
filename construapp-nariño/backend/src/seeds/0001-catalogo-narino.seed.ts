/**
 * Seed inicial: catálogo base para el mercado de Nariño.
 *
 * - Tipos de calculadora (hormigón, mampostería, mortero, bloque, acero,
 *   pintura, enchape, cimiento ciclópeo y cubierta) según `docs/API.md`.
 * - Materiales de construcción con su unidad.
 * - Proveedores reales y precios publicados en COP con fuente y fecha de consulta.
 *   Ver publishedPrices.ts para las condiciones de cada oferta.
 *
 * Idempotente: usa `findOrCreate` / `upsert`, se puede ejecutar varias veces.
 */
import logger from '../config/logger.js';
import { sequelize } from '../config/database.js';
import { checkedAt, publishedPrices, publishedProviders } from './publishedPrices.js';
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
  { key: 'malla', name: 'Malla electrosoldada 4 mm (2,35 x 6 m)', unit: 'unidad', category: 'acero' },
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

// Solo se retiran los registros exactos del catálogo ficticio anterior.
const legacyProviders = [
  { name: 'Depósito El Constructor (demo)', email: 'ventas@elconstructor.demo' },
  { name: 'Ferretería La Roca (demo)', email: 'info@laroca.demo' },
  { name: 'Materiales Galeras (demo)', email: 'contacto@galeras.demo' },
];

export async function seed(): Promise<void> {
  await sequelize.transaction(async (transaction) => {
    for (const ct of calculatorTypes) await CalculatorType.upsert(ct, { transaction });
    const materialIds: Record<string, string> = {};
    // Mantiene el id del material anterior sin atribuir una cuadrícula no publicada.
    const previousMesh = await Material.findOne({ where: { name: 'Malla electrosoldada 15 x 15 cm (2,35 x 6 m)' }, transaction });
    const currentMesh = await Material.findOne({ where: { name: 'Malla electrosoldada 4 mm (2,35 x 6 m)' }, transaction });
    if (previousMesh && !currentMesh) await previousMesh.update({ name: 'Malla electrosoldada 4 mm (2,35 x 6 m)' }, { transaction });
    for (const m of materials) {
      const [row] = await Material.findOrCreate({
        where: { name: m.name },
        defaults: { name: m.name, unit: m.unit, category: m.category },
        transaction,
      });
      materialIds[m.key] = row.id;
    }
    for (const legacy of legacyProviders) {
      const rows = await Provider.findAll({ where: legacy, transaction });
      for (const row of rows) {
        await MaterialPrice.destroy({ where: { providerId: row.id }, transaction });
        await row.destroy({ transaction });
      }
    }
    const providerIds: Record<string, string> = {};
    for (const p of publishedProviders) {
      const [row] = await Provider.findOrCreate({
        where: { name: p.name },
        defaults: { name: p.name, location: p.location, phone: p.phone, email: p.email },
        transaction,
      });
      providerIds[p.key] = row.id;
    }
    for (const p of publishedPrices) {
      const materialId = materialIds[p.materialKey];
      const providerId = providerIds[p.providerKey];
      if (!materialId || !providerId) throw new Error('Referencia de precio sin material o proveedor');
      const values = {
        materialId, providerId, price: p.price, currency: 'COP',
        sourceUrl: p.sourceUrl, sourceProduct: p.sourceProduct,
        sourceNotes: p.sourceNotes, checkedAt,
      };
      const [row, created] = await MaterialPrice.findOrCreate({
        where: { materialId, providerId }, defaults: values, transaction,
      });
      // Repetir el seed no cambia la fecha de consulta ni pisa cotizaciones posteriores.
      if (!created && row.checkedAt && row.checkedAt.getTime() < checkedAt.getTime()) {
        await row.update(values, { transaction });
      }
    }
  });
  logger.info(`  Materiales: ${materials.length} · Proveedores reales: ${publishedProviders.length} · Precios publicados: ${publishedPrices.length}`);
}
