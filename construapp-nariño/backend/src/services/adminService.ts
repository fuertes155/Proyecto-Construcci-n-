import { Op, type WhereOptions } from 'sequelize';
import {
  Material,
  MaterialPrice,
  Provider,
  RefreshToken,
  User,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/* ----------------------------------------------------------- Materiales --- */

export const adminMaterials = {
  async list() {
    const rows = await Material.findAll({ order: [['name', 'ASC']] });
    return rows.map((r) => r.toJSON());
  },

  async create(data: Record<string, unknown>) {
    const row = await Material.create(data as never);
    return row.toJSON();
  },

  async update(id: string, changes: Record<string, unknown>) {
    const row = await Material.findByPk(id);
    if (!row) throw ApiError.notFound('Material no encontrado');
    row.set(changes);
    await row.save();
    return row.toJSON();
  },

  /** Baja lógica: no se borra para no romper cálculos/precios históricos. */
  async deactivate(id: string) {
    const row = await Material.findByPk(id);
    if (!row) throw ApiError.notFound('Material no encontrado');
    row.active = false;
    await row.save();
    return row.toJSON();
  },
};

/* ---------------------------------------------------------- Proveedores --- */

export const adminProviders = {
  async list() {
    const rows = await Provider.findAll({ order: [['name', 'ASC']] });
    return rows.map((r) => r.toJSON());
  },

  async create(data: Record<string, unknown>) {
    const row = await Provider.create(data as never);
    return row.toJSON();
  },

  async update(id: string, changes: Record<string, unknown>) {
    const row = await Provider.findByPk(id);
    if (!row) throw ApiError.notFound('Proveedor no encontrado');
    row.set(changes);
    await row.save();
    return row.toJSON();
  },
};

/* -------------------------------------------------------------- Precios --- */

export const adminPrices = {
  async list(filter: { materialId?: string; providerId?: string }) {
    const where: Record<string, unknown> = {};
    if (filter.materialId) where.materialId = filter.materialId;
    if (filter.providerId) where.providerId = filter.providerId;
    const rows = await MaterialPrice.findAll({
      where,
      include: [
        { model: Material, as: 'material', attributes: ['id', 'name', 'unit'] },
        { model: Provider, as: 'provider', attributes: ['id', 'name'] },
      ],
      order: [['updatedAt', 'DESC']],
    });
    return rows.map((r) => r.toJSON());
  },

  /** Crea o actualiza el precio de un material para un proveedor (HU-12.2). */
  async upsert(data: {
    materialId: string;
    providerId: string;
    price: number;
    currency: string;
  }) {
    const [material, provider] = await Promise.all([
      Material.findByPk(data.materialId),
      Provider.findByPk(data.providerId),
    ]);
    if (!material) throw ApiError.badRequest('El material indicado no existe');
    if (!provider) throw ApiError.badRequest('El proveedor indicado no existe');

    const [row, created] = await MaterialPrice.findOrCreate({
      where: { materialId: data.materialId, providerId: data.providerId },
      defaults: {
        materialId: data.materialId,
        providerId: data.providerId,
        price: data.price,
        currency: data.currency,
      },
    });
    if (!created) {
      row.price = data.price;
      row.currency = data.currency;
      await row.save();
    }
    return { price: row.toJSON(), created };
  },

  async remove(id: string) {
    const row = await MaterialPrice.findByPk(id);
    if (!row) throw ApiError.notFound('Precio no encontrado');
    await row.destroy();
  },
};

/* -------------------------------------------------------------- Usuarios --- */

export const adminUsers = {
  async list(filter: { status?: string; role?: string; q?: string }) {
    const where: WhereOptions = {};
    if (filter.status) Object.assign(where, { status: filter.status });
    if (filter.role) Object.assign(where, { role: filter.role });
    if (filter.q) {
      Object.assign(where, {
        [Op.or]: [
          { email: { [Op.like]: `%${filter.q.toLowerCase()}%` } },
          { firstName: { [Op.like]: `%${filter.q}%` } },
        ],
      });
    }
    const rows = await User.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });
    return { users: rows.map((r) => r.toJSON()), total: rows.length };
  },

  /** Suspende o reactiva una cuenta (HU-12.3). Suspender revoca sus sesiones. */
  async setStatus(actor: { id: string }, userId: string, status: 'active' | 'suspended') {
    if (userId === actor.id) {
      throw ApiError.badRequest('No puedes cambiar el estado de tu propia cuenta');
    }
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('Usuario no encontrado');
    user.status = status;
    await user.save();
    if (status === 'suspended') {
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId, revokedAt: null } }
      );
    }
    return user.toPublicJSON();
  },
};
