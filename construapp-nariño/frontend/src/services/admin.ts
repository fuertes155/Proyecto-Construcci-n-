import { api } from './api';

export interface AdminMaterial {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialInput {
  name: string;
  unit: string;
  category?: string;
  description?: string;
}

export interface AdminProvider {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  email: string | null;
  rating: number;
  deliveryTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderInput {
  name: string;
  location?: string;
  phone?: string;
  email?: string;
  rating?: number;
  deliveryTime?: string;
}

export interface AdminPrice {
  id: string;
  materialId: string;
  providerId: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  material: { id: string; name: string; unit: string };
  provider: { id: string; name: string };
}

export interface UpsertPriceInput {
  materialId: string;
  providerId: string;
  price: number;
  currency?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  userType: string;
  role: 'admin' | 'provider' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  materials: {
    async list(): Promise<AdminMaterial[]> {
      const { data } = await api.get('/admin/materials');
      return data.materials;
    },
    async create(input: CreateMaterialInput): Promise<AdminMaterial> {
      const { data } = await api.post('/admin/materials', input);
      return data;
    },
    async update(id: string, changes: Partial<CreateMaterialInput>): Promise<AdminMaterial> {
      const { data } = await api.patch(`/admin/materials/${id}`, changes);
      return data;
    },
    async deactivate(id: string): Promise<AdminMaterial> {
      const { data } = await api.delete(`/admin/materials/${id}`);
      return data;
    },
    async reactivate(id: string): Promise<AdminMaterial> {
      const { data } = await api.patch(`/admin/materials/${id}`, { active: true });
      return data;
    },
  },

  providers: {
    async list(): Promise<AdminProvider[]> {
      const { data } = await api.get('/admin/providers');
      return data.providers;
    },
    async create(input: CreateProviderInput): Promise<AdminProvider> {
      const { data } = await api.post('/admin/providers', input);
      return data;
    },
    async update(id: string, changes: Partial<CreateProviderInput>): Promise<AdminProvider> {
      const { data } = await api.patch(`/admin/providers/${id}`, changes);
      return data;
    },
  },

  prices: {
    async list(filter?: { materialId?: string; providerId?: string }): Promise<AdminPrice[]> {
      const { data } = await api.get('/admin/prices', { params: filter });
      return data.prices;
    },
    async upsert(input: UpsertPriceInput): Promise<AdminPrice> {
      const { data } = await api.put('/admin/prices', input);
      return data;
    },
    async remove(id: string): Promise<void> {
      await api.delete(`/admin/prices/${id}`);
    },
  },

  users: {
    async list(filter?: { status?: string; role?: string; q?: string }): Promise<{ users: AdminUser[]; total: number }> {
      const { data } = await api.get('/admin/users', { params: filter });
      return data;
    },
    async setStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
      await api.patch(`/admin/users/${id}/status`, { status });
    },
  },
};

export default adminApi;
