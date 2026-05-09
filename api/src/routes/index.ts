import { Application } from 'express';
import { createHealthRouter } from './health';

/**
 * Mount all API routes onto the Express app.
 * Add new routers here as they are implemented.
 */
export function mountRoutes(app: Application): void {
  app.use(createHealthRouter());

  // TODO (work item #3): mount OAuth routes
  // app.use(createOAuthRouter(oauthClient));

  // TODO (future work items): mount record XRPC routes
  // app.use('/xrpc', createXrpcRouter(ctx));
}
