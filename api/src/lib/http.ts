import type { Request, Response, NextFunction } from 'express';
import type { ZodError } from 'zod';

/**
 * Render a `ZodError` as a short, human-readable string keyed by field path,
 * e.g. `bskyPostRef.cid: expected string, received undefined; title: required`.
 *
 * The route handlers previously returned `error.flatten()` (an object) as the
 * `details` field. The web client formats errors as `${error}: ${details}`,
 * so an object stringified to the useless `"[object Object]"`, hiding which
 * field actually failed. Returning a string keeps `details` informative on
 * the wire and in logs.
 */
export function zodErrorDetails(err: ZodError): string {
  return err.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
}

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
