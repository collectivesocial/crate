import type { Request, Response, NextFunction } from 'express';

export type Handler = (
  req: Request,
  res: Response
) => unknown | Promise<unknown>;

/**
 * Wraps an async route handler so rejections are forwarded to Express's
 * error middleware via `next(err)`. Mirrors collective-social-api/src/lib/http.ts.
 */
export function handler(fn: Handler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}
