import type { Request, Response } from 'express';
import { catalogService } from '../services/catalogService.js';

/** Texto opcional de la query: la cadena vacía equivale a no filtrar. */
const text = (value: unknown) => (typeof value === 'string' && value !== '' ? value : undefined);

export const catalogController = {
  async materials(req: Request, res: Response) {
    res.json(
      await catalogService.materials({ q: text(req.query.q), category: text(req.query.category) })
    );
  },

  async providers(req: Request, res: Response) {
    // `validate` ya convirtió `rating` a número.
    const rating = req.query.rating as unknown as number | undefined;
    res.json(
      await catalogService.providers({
        material: text(req.query.material),
        category: text(req.query.category),
        location: text(req.query.location),
        rating,
      })
    );
  },

  async provider(req: Request, res: Response) {
    res.json(await catalogService.provider(req.params.providerId));
  },
};

export default catalogController;
