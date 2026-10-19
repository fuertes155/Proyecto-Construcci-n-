import { Material, MaterialPrice, Provider } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/** Comparación sin tildes ni mayúsculas: "Tuquerres" encuentra "Túquerres". */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const byText = (a: string, b: string) => a.localeCompare(b, 'es');

export interface CatalogPrice {
  providerId: string;
  providerName: string;
  location: string;
  price: number;
  updatedAt: Date;
}

export interface CatalogMaterial {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  description: string | null;
  bestPrice: CatalogPrice | null;
  prices: CatalogPrice[];
}

export interface CatalogProvider {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  email: string | null;
  rating: number;
  deliveryTime: string | null;
  materialsOffered: number;
  categories: string[];
}

export interface ProviderPrice {
  materialId: string;
  name: string;
  unit: string;
  category: string | null;
  price: number;
  updatedAt: Date;
}

interface MaterialFilter {
  q?: string;
  category?: string;
}

interface ProviderFilter {
  /** id de un material que el proveedor debe vender. */
  material?: string;
  /** Categoría de material que el proveedor debe vender (HU-04.2 `materialType`). */
  category?: string;
  location?: string;
  /** Calificación mínima (0–5). */
  rating?: number;
}

/** Catálogo público (EP-04): materiales con sus precios y directorio de proveedores. */
export const catalogService = {
  /** Materiales activos con el precio de cada proveedor, del más barato al más caro. */
  async materials(
    filter: MaterialFilter
  ): Promise<{ materials: CatalogMaterial[]; categories: string[]; total: number }> {
    const rows = await Material.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
      include: [
        {
          model: MaterialPrice,
          as: 'prices',
          required: false,
          include: [{ model: Provider, as: 'provider', attributes: ['id', 'name', 'location'] }],
        },
      ],
    });

    const all = rows.map((m): CatalogMaterial => {
      const prices: CatalogPrice[] = ((m.get('prices') as MaterialPrice[] | undefined) ?? [])
        .map((p) => {
          const provider = p.get('provider') as Provider | undefined;
          return {
            providerId: p.providerId as string,
            providerName: provider?.name ?? '',
            location: provider?.location ?? '',
            price: Number(p.price),
            updatedAt: p.updatedAt,
          };
        })
        .sort((a, b) => a.price - b.price);
      return {
        id: m.id,
        name: m.name,
        unit: m.unit,
        category: m.category,
        description: m.description,
        bestPrice: prices[0] ?? null,
        prices,
      };
    });

    const categories = [
      ...new Set(all.map((m) => m.category).filter((c): c is string => !!c)),
    ].sort(byText);

    let list = all;
    if (filter.category) list = list.filter((m) => m.category === filter.category);
    if (filter.q) {
      const q = normalize(filter.q);
      list = list.filter(
        (m) => normalize(m.name).includes(q) || normalize(m.category ?? '').includes(q)
      );
    }
    return { materials: list, categories, total: list.length };
  },

  /** HU-04.1 / HU-04.2 — proveedores, con filtros por material, ubicación y calificación. */
  async providers(
    filter: ProviderFilter
  ): Promise<{ providers: CatalogProvider[]; locations: string[]; total: number }> {
    const rows = await Provider.findAll({
      order: [
        ['rating', 'DESC'],
        ['name', 'ASC'],
      ],
      include: [
        {
          model: MaterialPrice,
          as: 'prices',
          required: false,
          attributes: ['id', 'materialId'],
          include: [{ model: Material, as: 'material', attributes: ['id', 'category', 'active'] }],
        },
      ],
    });

    const all = rows
      .map((p): { provider: CatalogProvider; materialIds: string[] } => {
        const offered = ((p.get('prices') as MaterialPrice[] | undefined) ?? [])
          .map((price) => price.get('material') as Material | undefined)
          .filter((m): m is Material => !!m && m.active);
        return {
          provider: {
            id: p.id,
            name: p.name,
            location: p.location,
            phone: p.phone,
            email: p.email,
            rating: Number(p.rating),
            deliveryTime: p.deliveryTime,
            materialsOffered: offered.length,
            categories: [
              ...new Set(offered.map((m) => m.category).filter((c): c is string => !!c)),
            ].sort(byText),
          },
          materialIds: offered.map((m) => m.id),
        };
      })
      // Un proveedor sin precios registrados no le sirve a quien busca a quién comprar.
      .filter((p) => p.provider.materialsOffered > 0);

    const locations = [...new Set(all.map((p) => p.provider.location).filter(Boolean))].sort(
      byText
    );

    const { material, category, location, rating } = filter;
    let list = all;
    if (material) list = list.filter((p) => p.materialIds.includes(material));
    if (category) list = list.filter((p) => p.provider.categories.includes(category));
    if (location) {
      const wanted = normalize(location);
      list = list.filter((p) => normalize(p.provider.location).includes(wanted));
    }
    if (rating !== undefined) list = list.filter((p) => p.provider.rating >= rating);

    const providers = list.map((p) => p.provider);
    return { providers, locations, total: providers.length };
  },

  /** HU-04.3 / HU-04.4 — ficha de un proveedor con sus precios vigentes y su fecha. */
  async provider(id: string): Promise<Omit<CatalogProvider, 'materialsOffered' | 'categories'> & { prices: ProviderPrice[] }> {
    const provider = await Provider.findByPk(id, {
      include: [
        {
          model: MaterialPrice,
          as: 'prices',
          required: false,
          include: [{ model: Material, as: 'material' }],
        },
      ],
    });
    if (!provider) throw ApiError.notFound('Proveedor no encontrado');

    const prices: ProviderPrice[] = ((provider.get('prices') as MaterialPrice[] | undefined) ?? [])
      .flatMap((price) => {
        const material = price.get('material') as Material | undefined;
        if (!material?.active) return [];
        return [
          {
            materialId: material.id,
            name: material.name,
            unit: material.unit,
            category: material.category,
            price: Number(price.price),
            updatedAt: price.updatedAt,
          },
        ];
      })
      .sort((a, b) => byText(a.category ?? '', b.category ?? '') || byText(a.name, b.name));

    return {
      id: provider.id,
      name: provider.name,
      location: provider.location,
      phone: provider.phone,
      email: provider.email,
      rating: Number(provider.rating),
      deliveryTime: provider.deliveryTime,
      prices,
    };
  },
};

export default catalogService;
