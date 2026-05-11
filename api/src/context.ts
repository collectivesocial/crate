import type { NodeOAuthClient } from '@atproto/oauth-client-node';
import type { Kysely } from 'kysely';
import type { Logger } from 'pino';
import type { Database } from './lib/db';

/**
 * Application context passed to routers and request handlers.
 * Mirrors collective-social-api/src/context.ts in shape.
 */
export interface AppContext {
  db: Kysely<Database>;
  logger: Logger;
  oauthClient: NodeOAuthClient;
}
