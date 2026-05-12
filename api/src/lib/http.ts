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

/**
 * Detect ATProto "record not found" errors from `com.atproto.repo.getRecord`.
 *
 * The PDS returns HTTP 400 with `{ error: 'RecordNotFound' }` (not 404), so
 * relying on `status === 404` alone misses the common case. This helper
 * normalizes both shapes.
 */
export function isRecordNotFoundError(err: unknown): boolean {
  const e = err as { status?: number; error?: string } | null | undefined;
  if (!e) return false;
  if (e.status === 404) return true;
  if (e.status === 400 && e.error === 'RecordNotFound') return true;
  return false;
}

