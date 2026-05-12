/**
 * Iron-session config + Postgres-backed OAuth state/session stores +
 * authenticated session agent helper.
 *
 * Shape mirrors collective-social-api/src/auth/{session,agent}.ts and
 * open-social/src/auth/storage.ts.
 */
import { Agent } from '@atproto/api';
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node';
import type { Request, Response } from 'express';
import { getIronSession } from 'iron-session';
import type { Kysely } from 'kysely';
import { config } from '../config';
import type { AppContext } from '../context';
import type { Database } from '../lib/db';

// Iron-session configuration

export const SESSION_OPTIONS = {
  cookieName: 'crate_session',
  password: config.COOKIE_SECRET,
  cookieOptions: {
    secure: config.NODE_ENV === 'production',
    // In production the web app is on a different origin (GH Pages or a
    // separate apex domain) from the API. Cross-site `fetch()` calls don't
    // carry SameSite=Lax cookies, so the session cookie is silently dropped
    // and every /api/* request returns 401. Use `none` in production so the
    // cookie is sent on cross-site XHRs; this requires `secure: true`, which
    // is already enabled above. In development we stay on `lax` to keep the
    // local cookie behavior simple.
    sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as
      | 'none'
      | 'lax',
    httpOnly: true,
    path: '/',
  },
} as const;

export type Session = { did?: string };

// ATProto OAuth state/session stores

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

// Authenticated session helpers

/**
 * Returns an authenticated @atproto/api Agent for the current session,
 * or null if the user is not logged in or the session can't be restored.
 *
 * Always sets Vary: Cookie; sets cache-control: private, no-store when
 * a valid session is restored.
 */
export async function getSessionAgent(
  req: Request,
  res: Response,
  ctx: AppContext
): Promise<Agent | null> {
  res.setHeader('Vary', 'Cookie');

  const session = await getIronSession<Session>(req, res, SESSION_OPTIONS);
  if (!session.did) return null;

  res.setHeader('cache-control', 'private, no-store');

  try {
    const oauthSession = await ctx.oauthClient.restore(session.did);
    return oauthSession ? new Agent(oauthSession) : null;
  } catch (err) {
    ctx.logger.warn({ err }, 'oauth session restore failed');
    await session.destroy();
    return null;
  }
}
