/**
 * Postgres-backed OAuth state and session stores.
 *
 * Shape mirrors open-social/src/auth/storage.ts exactly —
 * key/value pairs where the value is a JSON-serialized ATProto object.
 *
 * TODO (work item #3): wire getSessionAgent here once the full OAuth flow
 * is implemented.
 * See: open-social/src/auth/storage.ts for the complete reference.
 */
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node';
import type { Kysely } from 'kysely';
import type { Database } from '../lib/db';

export class StateStore implements NodeSavedStateStore {
  constructor(private db: Kysely<Database>) {}

  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = await this.db
      .selectFrom('auth_state')
      .selectAll()
      .where('key', '=', key)
      .executeTakeFirst();
    if (!result) return undefined;
    return JSON.parse(result.state) as NodeSavedState;
  }

  async set(key: string, val: NodeSavedState): Promise<void> {
    const state = JSON.stringify(val);
    await this.db
      .insertInto('auth_state')
      .values({ key, state })
      .onConflict((oc) => oc.column('key').doUpdateSet({ state }))
      .execute();
  }

  async del(key: string): Promise<void> {
    await this.db.deleteFrom('auth_state').where('key', '=', key).execute();
  }
}

export class SessionStore implements NodeSavedSessionStore {
  constructor(private db: Kysely<Database>) {}

  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = await this.db
      .selectFrom('auth_session')
      .selectAll()
      .where('key', '=', key)
      .executeTakeFirst();
    if (!result) return undefined;
    return JSON.parse(result.session) as NodeSavedSession;
  }

  async set(key: string, val: NodeSavedSession): Promise<void> {
    const session = JSON.stringify(val);
    await this.db
      .insertInto('auth_session')
      .values({ key, session })
      .onConflict((oc) => oc.column('key').doUpdateSet({ session }))
      .execute();
  }

  async del(key: string): Promise<void> {
    await this.db.deleteFrom('auth_session').where('key', '=', key).execute();
  }
}

// ── Placeholder exports for future OAuth session agent ───────────────────

/**
 * TODO (work item #3): implement getSessionAgent.
 * Returns an authenticated @atproto/api Agent for the given session DID.
 * See: open-social/src/services/atproto.ts for reference implementation.
 */
export async function getSessionAgent(_did: string): Promise<never> {
  throw new Error('getSessionAgent not yet implemented — see work item #3');
}

/**
 * TODO (work item #3): SESSION_OPTIONS for iron-session.
 * See: collective-social-api/src/lib/session.ts for reference implementation.
 */
export const SESSION_OPTIONS = {
  // cookieName: 'crate_session',
  // password: config.COOKIE_SECRET,
  // cookieOptions: { secure: config.NODE_ENV === 'production' },
} as const;
