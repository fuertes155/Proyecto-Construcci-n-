import { Router } from 'express';
import adminRoutes from './admin.js';
import authRoutes from './auth.js';
import calculatorRoutes from './calculators.js';
import catalogRoutes from './catalog.js';
import projectRoutes from './projects.js';

/** Router principal de la API. Se monta en `/api`. */
const api = Router();

api.use('/auth', authRoutes);
api.use('/calculators', calculatorRoutes);
api.use(catalogRoutes); // /materials y /providers (públicas)
api.use('/projects', projectRoutes);
api.use('/admin', adminRoutes);

export default api;
