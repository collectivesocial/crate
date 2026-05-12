import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps an async route handler so that rejected promises are forwarded to
 * Express's error handler via next(err).
 *
 * Express 5 handles async errors natively, but this wrapper provides an
 * explicit, readable pattern that mirrors the sibling repos.
 *
 * See: collective-social-api/src/middleware/errorHandler.ts
 */
export function handler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
