import Joi from 'joi';

/* --- Materiales --- */

export const createMaterialSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  unit: Joi.string().trim().min(1).max(40).required(),
  category: Joi.string().trim().max(60).allow('', null),
  description: Joi.string().trim().max(1000).allow('', null),
  active: Joi.boolean().default(true),
});

export const updateMaterialSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160),
  unit: Joi.string().trim().min(1).max(40),
  category: Joi.string().trim().max(60).allow('', null),
  description: Joi.string().trim().max(1000).allow('', null),
  active: Joi.boolean(),
}).min(1);

/* --- Proveedores --- */

export const createProviderSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  location: Joi.string().trim().max(160).default('Pasto, Nariño'),
  phone: Joi.string().trim().max(40).allow('', null),
  email: Joi.string().email().max(160).allow('', null),
  rating: Joi.number().min(0).max(5).default(0),
  deliveryTime: Joi.string().trim().max(60).allow('', null),
});

export const updateProviderSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160),
  location: Joi.string().trim().max(160),
  phone: Joi.string().trim().max(40).allow('', null),
  email: Joi.string().email().max(160).allow('', null),
  rating: Joi.number().min(0).max(5),
  deliveryTime: Joi.string().trim().max(60).allow('', null),
}).min(1);

/* --- Precios --- */

export const upsertPriceSchema = Joi.object({
  materialId: Joi.string().uuid().required(),
  providerId: Joi.string().uuid().required(),
  price: Joi.number().positive().max(1e12).required(),
  currency: Joi.string().uppercase().length(3).default('COP'),
});

export const priceQuerySchema = Joi.object({
  materialId: Joi.string().uuid(),
  providerId: Joi.string().uuid(),
});

/* --- Usuarios --- */

export const listUsersQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'suspended'),
  role: Joi.string().valid('admin', 'provider', 'user'),
  q: Joi.string().trim().max(160),
});

export const setUserStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended').required(),
});

/* --- Params --- */

export const idParamSchema = Joi.object({ id: Joi.string().uuid().required() });
