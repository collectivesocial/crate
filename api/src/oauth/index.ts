/**
 * ATProto OAuth client factory.
 *
 * Mirrors open-social/src/auth/client.ts — createOAuthClient(db).
 *
 * TODO (work item #3): mount OAuth routes (/oauth/login, /oauth/callback,
 * /oauth/logout) and wire SESSION_OPTIONS once the full flow is implemented.
 */
import {
  Keyset,
  JoseKey,
  atprotoLoopbackClientMetadata,
  NodeOAuthClient,
  OAuthClientMetadataInput,
} from '@atproto/oauth-client-node';
import assert from 'node:assert';
import type { Kysely } from 'kysely';
import { config } from '../config';
import type { Database } from '../lib/db';
import { logger } from '../lib/logger';
import { StateStore, SessionStore } from './session';
import { buildClientMetadata, CRATE_SCOPES } from './client-metadata';

export { CRATE_SCOPES };

export async function createOAuthClient(
  db: Kysely<Database>
): Promise<NodeOAuthClient> {
  const privateKeys: unknown[] = config.PRIVATE_KEYS
    ? JSON.parse(config.PRIVATE_KEYS)
    : [];

  const keyset =
    config.SERVICE_URL && privateKeys.length > 0
      ? new Keyset(
          await Promise.all(
            privateKeys.map((jwk) =>
              JoseKey.fromJWK(jwk as Record<string, unknown>)
            )
          )
        )
      : undefined;

  assert(
    !config.SERVICE_URL || keyset?.size,
    'ATProto requires backend clients to be confidential in production. Set PRIVATE_KEYS.'
  );

  const pk = keyset?.findPrivateKey({ usage: 'sign' });

  const clientMetadata: OAuthClientMetadataInput = config.SERVICE_URL
    ? {
        ...buildClientMetadata(config.SERVICE_URL),
        token_endpoint_auth_method: pk ? 'private_key_jwt' : 'none',
        token_endpoint_auth_signing_alg: pk ? pk.alg : undefined,
      }
    : atprotoLoopbackClientMetadata(
        `http://localhost?${new URLSearchParams([
          ['redirect_uri', `http://127.0.0.1:${config.PORT}/oauth/callback`],
          ['scope', CRATE_SCOPES],
        ])}`
      );

  logger.info(
    { mode: config.SERVICE_URL ? 'confidential' : 'loopback' },
    'Creating OAuth client'
  );

  return new NodeOAuthClient({
    keyset,
    clientMetadata,
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
    plcDirectoryUrl: config.PLC_URL,
    allowHttp: config.NODE_ENV === 'development',
  });
}
