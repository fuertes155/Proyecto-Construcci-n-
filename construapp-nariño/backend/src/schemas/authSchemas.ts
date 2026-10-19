import Joi from 'joi';
import { USER_TYPES } from '../models/index.js';

const email = Joi.string().email().max(160).lowercase().trim().required();
const password = Joi.string().min(8).max(128).required();
const name = Joi.string().trim().min(2).max(120).required();

export const registerSchema = Joi.object({
  email,
  password,
  name,
  userType: Joi.string()
    .valid(...USER_TYPES)
    .default('contractor'),
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  userType: Joi.string().valid(...USER_TYPES),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
});

export const forgotPasswordSchema = Joi.object({
  email,
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  newPassword: password,
});
