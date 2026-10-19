import { Material, MaterialPrice, Provider } from '../models/index.js';
import type { MaterialRole } from '../utils/dosifications.js';
import { round } from '../utils/dosifications.js';

/**
 * Mapa rol de calculadora → nombre del material en el catálogo (ver seed
 * `0001-catalogo-narino.seed.ts`). Si se renombra un material, actualizar aquí.
 */
const MATERIAL_NAME_BY_ROLE: Record<MaterialRole, string> = {
  cement: 'Cemento gris',
  sand: 'Arena de río',
  gravel: 'Grava / triturado',
  brick: 'Ladrillo tolete común',
  mortarMix: 'Mortero seco premezclado',
  block: 'Bloque de concreto n.º 4',
  rebar: 'Varilla corrugada 1/2" x 6 m',
  tieWire: 'Alambre negro calibre 18',
  paint: 'Pintura vinilo tipo 1',
  tile: 'Baldosa cerámica para piso',
  tileAdhesive: 'Pegante cerámico',
  grout: 'Boquilla para juntas',
  stone: 'Piedra rajón',
  roofSheet: 'Teja de fibrocemento n.º 6',
  roofHook: 'Gancho para teja',
};

export interface PricedMaterial {
  id: string | null;
  role: MaterialRole;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number | null;
  totalPrice: number | null;
  currency: 'COP';
  provider: { id: string; name: string } | null;
}

export interface PricedResult {
  materials: PricedMaterial[];
  totalCost: number;
  currency: 'COP';
  /** Roles sin precio disponible en el catálogo (no rompen el cálculo). */
  missingPrices: MaterialRole[];
}

export interface Item {
  role: MaterialRole;
  quantity: number;
  /** Nombre del material en el catálogo cuando la calculadora deja elegir (p. ej. el diámetro de la varilla). */
  material?: string;
}

const materialName = (item: Item) => item.material ?? MATERIAL_NAME_BY_ROLE[item.role];

/**
 * Toma una lista de `{ role, quantity }` y devuelve el desglose con el precio
 * más barato disponible por material y su proveedor. Un material sin precio se
 * incluye con `pricePerUnit: null` (no se interrumpe el cálculo — HU-02.5).
 */
export async function priceItems(items: Item[]): Promise<PricedResult> {
  const names = items.map(materialName);

  const materials = await Material.findAll({
    where: { name: names },
    include: [
      {
        model: MaterialPrice,
        as: 'prices',
        required: false,
        include: [{ model: Provider, as: 'provider' }],
      },
    ],
  });

  const byName = new Map(materials.map((m) => [m.name, m]));
  const missingPrices: MaterialRole[] = [];

  const priced: PricedMaterial[] = items.map((item) => {
    const name = materialName(item);
    const material = byName.get(name);

    if (!material) {
      missingPrices.push(item.role);
      return {
        id: null,
        role: item.role,
        name,
        quantity: item.quantity,
        unit: '',
        pricePerUnit: null,
        totalPrice: null,
        currency: 'COP',
        provider: null,
      };
    }

    const prices = (material.get('prices') as MaterialPrice[] | undefined) ?? [];
    const cheapest = prices
      .map((p) => ({ price: Number(p.price), row: p }))
      .sort((a, b) => a.price - b.price)[0];

    if (!cheapest) missingPrices.push(item.role);

    const provider = cheapest?.row.get('provider') as Provider | undefined;

    return {
      id: material.id,
      role: item.role,
      name: material.name,
      quantity: item.quantity,
      unit: material.unit,
      pricePerUnit: cheapest ? cheapest.price : null,
      totalPrice: cheapest ? round(cheapest.price * item.quantity) : null,
      currency: 'COP',
      provider: provider ? { id: provider.id, name: provider.name } : null,
    };
  });

  const totalCost = round(
    priced.reduce((sum, m) => sum + (m.totalPrice ?? 0), 0)
  );

  return { materials: priced, totalCost, currency: 'COP', missingPrices };
}
