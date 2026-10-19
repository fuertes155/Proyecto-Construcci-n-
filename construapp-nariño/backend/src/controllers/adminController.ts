import type { Request, Response } from 'express';
import {
  adminMaterials,
  adminPrices,
  adminProviders,
  adminUsers,
} from '../services/adminService.js';

export const adminController = {
  // Materiales
  async listMaterials(_req: Request, res: Response) {
    res.json({ materials: await adminMaterials.list() });
  },
  async createMaterial(req: Request, res: Response) {
    res.status(201).json(await adminMaterials.create(req.body));
  },
  async updateMaterial(req: Request, res: Response) {
    res.json(await adminMaterials.update(req.params.id, req.body));
  },
  async deactivateMaterial(req: Request, res: Response) {
    res.json(await adminMaterials.deactivate(req.params.id));
  },

  // Proveedores
  async listProviders(_req: Request, res: Response) {
    res.json({ providers: await adminProviders.list() });
  },
  async createProvider(req: Request, res: Response) {
    res.status(201).json(await adminProviders.create(req.body));
  },
  async updateProvider(req: Request, res: Response) {
    res.json(await adminProviders.update(req.params.id, req.body));
  },

  // Precios
  async listPrices(req: Request, res: Response) {
    res.json({ prices: await adminPrices.list(req.query) });
  },
  async upsertPrice(req: Request, res: Response) {
    const { price, created } = await adminPrices.upsert(req.body);
    res.status(created ? 201 : 200).json(price);
  },
  async deletePrice(req: Request, res: Response) {
    await adminPrices.remove(req.params.id);
    res.status(204).send();
  },

  // Usuarios
  async listUsers(req: Request, res: Response) {
    res.json(await adminUsers.list(req.query));
  },
  async setUserStatus(req: Request, res: Response) {
    res.json(await adminUsers.setStatus(req.user!, req.params.id, req.body.status));
  },
};

export default adminController;
