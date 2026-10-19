import { api } from './api';

/** Catálogo público (EP-04): materiales con precios por proveedor y directorio. */

export interface CatalogPrice {
  providerId: string;
  providerName: string;
  location: string;
  price: number;
  updatedAt: string;
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
  updatedAt: string;
}

export interface ProviderDetail extends Omit<CatalogProvider, 'materialsOffered' | 'categories'> {
  prices: ProviderPrice[];
}

export const catalogApi = {
  async materials(filter?: { q?: string; category?: string }): Promise<{
    materials: CatalogMaterial[];
    categories: string[];
    total: number;
  }> {
    const { data } = await api.get('/materials', { params: filter });
    return data;
  },
  async providers(filter?: {
    material?: string;
    category?: string;
    location?: string;
    rating?: number;
  }): Promise<{ providers: CatalogProvider[]; locations: string[]; total: number }> {
    const { data } = await api.get('/providers', { params: filter });
    return data;
  },
  async provider(id: string): Promise<ProviderDetail> {
    const { data } = await api.get(`/providers/${id}`);
    return data;
  },
};

export default catalogApi;
