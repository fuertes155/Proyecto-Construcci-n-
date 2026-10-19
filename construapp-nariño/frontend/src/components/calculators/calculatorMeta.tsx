import type { ReactNode } from 'react';
import {
  PiCube,
  PiGridNine,
  PiHash,
  PiHouseLine,
  PiMountains,
  PiPaintRoller,
  PiSquaresFour,
  PiStack,
  PiWall,
} from 'react-icons/pi';
import type { CalculatorId } from '../../services/calculators';

export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Dato que pide una calculadora: una medida numérica o, si trae `options`, la
 * elección de un material (tipo de bloque, diámetro de varilla…).
 */
export interface NumberField {
  name: string;
  label: string;
  /** Unidad de la medida (no aplica a las elecciones). */
  unit: string;
  placeholder?: string;
  /** Nombre corto para la cota del croquis y los resúmenes (por defecto, `label`). */
  short?: string;
  /** Valor con el que arranca el campo. */
  defaultValue?: number | string;
  /** Límites admitidos (si no hay `min`, el valor debe ser mayor que 0). */
  min?: number;
  max?: number;
  integer?: boolean;
  hint?: string;
  /** Opciones de material: convierte el campo en un selector. */
  options?: FieldOption[];
}

export interface CalculatorMeta {
  label: string;
  /** Qué se obtiene, para frases como "3,15 m³ de hormigón". */
  noun: string;
  description: string;
  icon: ReactNode;
  fields: NumberField[];
}

/** Selector de material; la primera opción es la que usa el backend por defecto. */
function choice(name: string, label: string, options: FieldOption[], hint?: string): NumberField {
  return { name, label, unit: '', options, defaultValue: options[0].value, hint };
}

/** Nombre, icono y datos de cada calculadora, compartidos entre páginas. */
export const CALCULATOR_META: Record<CalculatorId, CalculatorMeta> = {
  concrete: {
    label: 'Hormigón',
    noun: 'hormigón',
    description: 'Volumen de una losa o zapata y el cemento, arena y grava necesarios.',
    icon: <PiCube aria-hidden="true" />,
    fields: [
      choice('strength', 'Resistencia', [
        { value: '3000', label: '3000 psi · mezcla 1:2:3 (losas, vigas, columnas)' },
        { value: '2500', label: '2500 psi · mezcla 1:2:4 (contrapisos, andenes)' },
        { value: '3500', label: '3500 psi · mezcla 1:2:2 (elementos más exigidos)' },
      ]),
      { name: 'length', label: 'Largo', unit: 'm' },
      { name: 'width', label: 'Ancho', unit: 'm' },
      { name: 'height', label: 'Espesor', unit: 'm', placeholder: '0.15' },
    ],
  },
  footing: {
    label: 'Cimiento ciclópeo',
    noun: 'cimiento ciclópeo',
    description: 'Hormigón y piedra rajón para un cimiento corrido.',
    icon: <PiMountains aria-hidden="true" />,
    fields: [
      { name: 'length', label: 'Largo', unit: 'm' },
      { name: 'width', label: 'Ancho', unit: 'm', placeholder: '0.4' },
      { name: 'height', label: 'Alto', unit: 'm', placeholder: '0.6' },
      {
        name: 'stonePct',
        label: 'Piedra rajón',
        short: 'Piedra',
        unit: '%',
        defaultValue: 40,
        min: 0,
        max: 60,
        hint: 'Parte del volumen que ocupa la piedra.',
      },
    ],
  },
  rebar: {
    label: 'Acero de refuerzo',
    noun: 'malla de acero',
    description: 'Varillas y alambre de amarre para la malla de una placa.',
    icon: <PiHash aria-hidden="true" />,
    fields: [
      choice('diameter', 'Varilla', [
        { value: '1/2', label: 'Varilla corrugada de 1/2"' },
        { value: '3/8', label: 'Varilla corrugada de 3/8"' },
        { value: '5/8', label: 'Varilla corrugada de 5/8"' },
      ]),
      { name: 'length', label: 'Largo de la placa', short: 'Largo', unit: 'm' },
      { name: 'width', label: 'Ancho de la placa', short: 'Ancho', unit: 'm' },
      {
        name: 'spacing',
        label: 'Separación',
        unit: 'cm',
        defaultValue: 20,
        min: 5,
        max: 50,
        hint: 'Distancia entre varillas, en ambos sentidos.',
      },
    ],
  },
  brick: {
    label: 'Mampostería',
    noun: 'muro',
    description: 'Ladrillos o bloques de arcilla y mortero de pega para un muro.',
    icon: <PiWall aria-hidden="true" />,
    fields: [
      choice('brickUnit', 'Pieza', [
        { value: 'tolete', label: 'Ladrillo tolete común (24 × 12 × 6 cm)' },
        { value: 'arcilla4', label: 'Bloque de arcilla n.º 4 (10 × 20 × 30 cm)' },
      ]),
      { name: 'width', label: 'Ancho del muro', short: 'Ancho', unit: 'm' },
      { name: 'height', label: 'Alto del muro', short: 'Alto', unit: 'm' },
    ],
  },
  block: {
    label: 'Muro en bloque',
    noun: 'muro en bloque',
    description: 'Bloques de concreto y mortero de pega para un muro.',
    icon: <PiSquaresFour aria-hidden="true" />,
    fields: [
      choice('blockSize', 'Bloque', [
        { value: 'n4', label: 'Bloque de concreto n.º 4 (10 cm de espesor)' },
        { value: 'n6', label: 'Bloque de concreto n.º 6 (15 cm de espesor)' },
      ]),
      { name: 'width', label: 'Ancho del muro', short: 'Ancho', unit: 'm' },
      { name: 'height', label: 'Alto del muro', short: 'Alto', unit: 'm' },
    ],
  },
  mortar: {
    label: 'Mortero',
    noun: 'mortero',
    description: 'Mortero de pega o revoque: cemento y arena.',
    icon: <PiStack aria-hidden="true" />,
    fields: [
      choice('mix', 'Proporción', [
        { value: '1:4', label: '1:4 · pañete y pega de uso general' },
        { value: '1:3', label: '1:3 · más resistente (zonas húmedas, fachadas)' },
        { value: '1:5', label: '1:5 · pañete interior' },
      ]),
      { name: 'area', label: 'Área', unit: 'm²' },
      { name: 'thickness', label: 'Espesor', unit: 'cm', placeholder: '2' },
    ],
  },
  tile: {
    label: 'Piso y enchape',
    noun: 'piso o enchape',
    description: 'Baldosa o porcelanato, pegante y boquilla para un área.',
    icon: <PiGridNine aria-hidden="true" />,
    fields: [
      choice('tileType', 'Material', [
        { value: 'ceramica', label: 'Baldosa cerámica' },
        { value: 'porcelanato', label: 'Porcelanato (con su pegante especial)' },
      ]),
      { name: 'area', label: 'Área a enchapar', short: 'Área', unit: 'm²' },
    ],
  },
  paint: {
    label: 'Pintura',
    noun: 'superficie a pintar',
    description: 'Galones de pintura según el área, el tipo y las manos.',
    icon: <PiPaintRoller aria-hidden="true" />,
    fields: [
      choice('paintType', 'Pintura', [
        { value: 'vinilo1', label: 'Vinilo tipo 1 (interiores, más rendidor)' },
        { value: 'vinilo2', label: 'Vinilo tipo 2 (económico)' },
        { value: 'exterior', label: 'Pintura para exteriores (fachadas)' },
      ]),
      { name: 'area', label: 'Área a pintar', short: 'Área', unit: 'm²' },
      {
        name: 'coats',
        label: 'Manos',
        unit: 'manos',
        defaultValue: 2,
        min: 1,
        max: 5,
        integer: true,
        hint: 'Capas de pintura (lo usual son 2).',
      },
    ],
  },
  roof: {
    label: 'Cubierta',
    noun: 'cubierta',
    description: 'Tejas y ganchos de amarre para el área de un techo.',
    icon: <PiHouseLine aria-hidden="true" />,
    fields: [
      choice(
        'sheet',
        'Teja',
        [
          { value: 'fibrocemento', label: 'Teja de fibrocemento n.º 6 (0,92 × 1,83 m)' },
          { value: 'zinc', label: 'Teja de zinc ondulada (0,80 × 3,05 m)' },
        ],
        'Ya se descuentan los traslapos entre tejas.'
      ),
      {
        name: 'area',
        label: 'Área de cubierta',
        short: 'Área',
        unit: 'm²',
        hint: 'Mídela sobre la pendiente del techo.',
      },
    ],
  },
};

/** Calculadoras agrupadas por etapa de la obra, en el orden en que se muestran. */
export const CALCULATOR_GROUPS: { label: string; ids: CalculatorId[] }[] = [
  { label: 'Estructura', ids: ['concrete', 'footing', 'rebar'] },
  { label: 'Muros', ids: ['brick', 'block', 'mortar'] },
  { label: 'Acabados y cubierta', ids: ['tile', 'paint', 'roof'] },
];

export const CALCULATOR_IDS: CalculatorId[] = CALCULATOR_GROUPS.flatMap((g) => g.ids);

/** Enlace a una calculadora concreta (la activa viaja en `?tipo=`). */
export function calculatorPath(id: CalculatorId): string {
  return id === CALCULATOR_IDS[0] ? '/calculators' : `/calculators?tipo=${id}`;
}
