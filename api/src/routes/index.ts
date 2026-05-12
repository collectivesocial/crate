import { Application } from 'express';
import type { AppContext } from '../context';
import { createContentRouter } from './content';
import { createDocumentsRouter } from './documents';
import { createEventsRouter } from './events';
import { createFeedsRouter } from './feeds';
import { createHealthRouter } from './health';
import { createNotesRouter } from './notes';
import { createNowRouter } from './now';
import { createOAuthRouter } from './oauth';
import { createSessionRouter } from './session';

/**
 * Mount all API routes onto the Express app.
 * Add new routers here as they are implemented.
 */
export function mountRoutes(app: Application, ctx: AppContext): void {
  app.use(createHealthRouter());

  // OAuth flow + well-known endpoints (mounted at root because of the
  // well-known paths and the OAuth-client-metadata.json contract).
  app.use(createOAuthRouter(ctx));

  // Session inspection + record CRUD, all under /api so they sit alongside
  // each other and don't collide with OAuth well-known paths.
  app.use('/api', createSessionRouter(ctx));
  app.use('/api', createNotesRouter(ctx));
  app.use('/api', createDocumentsRouter(ctx));
  app.use('/api', createContentRouter(ctx));
  app.use('/api', createNowRouter(ctx));
  app.use('/api', createEventsRouter(ctx));
  app.use('/api', createFeedsRouter(ctx));
}
