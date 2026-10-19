import type { Request, Response } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  },

  async login(req: Request, res: Response) {
    const session = await authService.login(req.body);
    res.json(session);
  },

  async refresh(req: Request, res: Response) {
    const session = await authService.refresh(req.body.refreshToken);
    res.json(session);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  },

  async me(req: Request, res: Response) {
    const user = await authService.getProfile(req.user!.id);
    res.json(user);
  },

  async updateMe(req: Request, res: Response) {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.json(user);
  },

  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.user!.id, req.body);
    res.status(204).send();
  },

  async forgotPassword(req: Request, res: Response) {
    const base = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    await authService.requestPasswordReset(
      req.body.email,
      (token) => `${base.replace(/\/$/, '')}/reset-password?token=${token}`
    );
    // Respuesta siempre igual: no se revela si el correo existe.
    res.status(204).send();
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.status(204).send();
  },
};

export default authController;
