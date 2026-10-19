/** Augmenta Express: `req.user` lo establece `middleware/auth.ts`. */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

export {};
