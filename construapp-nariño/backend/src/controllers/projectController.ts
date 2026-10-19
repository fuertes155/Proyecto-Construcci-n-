import type { Request, Response } from 'express';
import { projectService } from '../services/projectService.js';

export const projectController = {
  async create(req: Request, res: Response) {
    const project = await projectService.create(req.user!.id, req.body);
    res.status(201).json(project);
  },

  async list(req: Request, res: Response) {
    res.json(await projectService.listForUser(req.user!));
  },

  async detail(req: Request, res: Response) {
    res.json(await projectService.getById(req.user!, req.params.projectId));
  },

  async update(req: Request, res: Response) {
    res.json(await projectService.update(req.user!, req.params.projectId, req.body));
  },

  async remove(req: Request, res: Response) {
    await projectService.remove(req.user!, req.params.projectId);
    res.status(204).send();
  },

  async addCalculation(req: Request, res: Response) {
    const result = await projectService.addCalculation(
      req.user!,
      req.params.projectId,
      req.body
    );
    res.status(201).json(result);
  },

  async removeCalculation(req: Request, res: Response) {
    const result = await projectService.removeCalculation(
      req.user!,
      req.params.projectId,
      req.params.calculationId
    );
    res.json(result);
  },
};

export default projectController;
