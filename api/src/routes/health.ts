import { Router } from 'express';
import { handler } from '../lib/handler';

export function createHealthRouter(): Router {
  const router = Router();

  router.get(
    '/health',
    handler(async (_req, res) => {
      res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        service: 'crate-api',
      });
    })
  );

  return router;
}
