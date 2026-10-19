import Joi from 'joi';
import { CALCULATOR_IDS } from './calculatorSchemas.js';

const PROJECT_STATUS = ['planning', 'in-progress', 'finished'] as const;

/**
 * Fecha de calendario (`YYYY-MM-DD`). `.raw()` valida como fecha pero conserva el
 * texto tal como llegó: si Joi lo convierte a `Date` (medianoche UTC), Sequelize lo
 * guarda en `DATEONLY` con la hora local y, al oeste de UTC —como en Colombia—,
 * queda un día antes.
 */
const calendarDate = Joi.date().iso().raw().allow(null);

/** El fin solo se compara con el inicio cuando el inicio viene informado. */
const endDateAfterStart = calendarDate.when('startDate', {
  is: Joi.date().required(),
  then: Joi.date().min(Joi.ref('startDate')),
});

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  location: Joi.string().trim().max(160).allow('', null),
  budget: Joi.number().positive().max(1e15).allow(null),
  startDate: calendarDate,
  endDate: endDateAfterStart,
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160),
  description: Joi.string().trim().max(2000).allow('', null),
  location: Joi.string().trim().max(160).allow('', null),
  budget: Joi.number().positive().max(1e15).allow(null),
  status: Joi.string().valid(...PROJECT_STATUS),
  startDate: calendarDate,
  endDate: calendarDate,
}).min(1);

export const saveCalculationSchema = Joi.object({
  calculatorType: Joi.string()
    .valid(...CALCULATOR_IDS)
    .required(),
  inputs: Joi.object().required(),
});

export const projectIdSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
});

export const calculationParamsSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  calculationId: Joi.string().uuid().required(),
});
