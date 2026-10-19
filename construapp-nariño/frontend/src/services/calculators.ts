import { api } from './api';

export type CalculatorId =
  | 'concrete'
  | 'brick'
  | 'mortar'
  | 'block'
  | 'rebar'
  | 'paint'
  | 'tile'
  | 'footing'
  | 'roof';

export interface CalculatorField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

export interface CalculatorTypeInfo {
  id: CalculatorId;
  name: string;
  description: string;
  fields: CalculatorField[];
}

export interface PricedMaterial {
  id: string | null;
  role: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number | null;
  totalPrice: number | null;
  currency: 'COP';
  provider: { id: string; name: string } | null;
}

export interface CalculationResult {
  calculatorType: CalculatorId;
  quantity: number;
  unit: string;
  wastePct: number;
  materials: PricedMaterial[];
  totalCost: number;
  currency: 'COP';
  missingPrices: string[];
  timestamp: string;
}

export interface ConcreteInput {
  length: number;
  width: number;
  height: number;
  wastePct?: number;
}
export interface BrickInput {
  width: number;
  height: number;
  wastePct?: number;
}
export interface MortarInput {
  area: number;
  thickness: number;
  wastePct?: number;
}

export const calculatorsApi = {
  async listTypes(): Promise<CalculatorTypeInfo[]> {
    const { data } = await api.get<{ calculators: CalculatorTypeInfo[] }>('/calculators/types');
    return data.calculators;
  },
  async concrete(input: ConcreteInput): Promise<CalculationResult> {
    const { data } = await api.post<CalculationResult>('/calculators/concrete', input);
    return data;
  },
  async brick(input: BrickInput): Promise<CalculationResult> {
    const { data } = await api.post<CalculationResult>('/calculators/brick', input);
    return data;
  },
  async mortar(input: MortarInput): Promise<CalculationResult> {
    const { data } = await api.post<CalculationResult>('/calculators/mortar', input);
    return data;
  },
  /** Cualquier calculadora por su id (`POST /calculators/:id`); el backend valida los campos. */
  async run(id: CalculatorId, inputs: Record<string, number | string>): Promise<CalculationResult> {
    const { data } = await api.post<CalculationResult>(`/calculators/${id}`, inputs);
    return data;
  },
};

export default calculatorsApi;
