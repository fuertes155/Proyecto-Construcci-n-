import Joi from 'joi';

export const materialsQuerySchema = Joi.object({
  q: Joi.string().trim().max(80).allow(''),
  category: Joi.string().trim().max(60).allow(''),
});

export const providersQuerySchema = Joi.object({
  material: Joi.string().uuid(),
  category: Joi.string().trim().max(60).allow(''),
  location: Joi.string().trim().max(80).allow(''),
  rating: Joi.number().min(0).max(5),
});

export const providerIdSchema = Joi.object({
  providerId: Joi.string().uuid().required(),
});
