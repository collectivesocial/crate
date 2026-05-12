/**
 * Session inspection endpoint. The web app polls `GET /api/session` after
 * mount to figure out whether to render the login button or the signed-in UI.
 */
import { Agent } from '@atproto/api';
import express, { Request, Response } from 'express';
import type { AppContext } from '../context';
import { config } from '../config';
import { handler } from '../lib/http';
import { getSessionAgent } from '../oauth/session';

// Public Bluesky AppView — used for profile reads. Avoids depending on the
// OAuth scope set covering app.bsky.actor.getProfile through the user's PDS
// proxy. Matches the pattern used by collective-social-api/src/routes/user.ts.
const publicAgent = new Agent({ service: 'https://public.api.bsky.app' });

interface DidDocument {
  alsoKnownAs?: string[];
}

/**
 * Resolve a DID to its handle by reading the DID document directly. Used as a
 * fallback when the public Bluesky AppView's getProfile() is unreachable
 * (outbound network blocked, rate limit, transient failure). Returns `null`
 * if the DID document can't be fetched or doesn't contain an at:// aka.
 */
async function resolveHandleFromDidDocument(
  did: string,
  ctx: AppContext
): Promise<string | null> {
  try {
    let url: string;
    if (did.startsWith('did:plc:')) {
      url = `${config.PLC_URL}/${did}`;
    } else if (did.startsWith('did:web:')) {
      // did:web:example.com → https://example.com/.well-known/did.json
      // did:web:example.com:user:alice → https://example.com/user/alice/did.json
      const rest = did.slice('did:web:'.length).split(':');
      const host = decodeURIComponent(rest[0]);
      const path =
        rest.length === 1
          ? '/.well-known/did.json'
          : '/' + rest.slice(1).map(decodeURIComponent).join('/') + '/did.json';
      url = `https://${host}${path}`;
    } else {
      return null;
    }

    const res = await fetch(url, {
      headers: { accept: 'application/did+ld+json, application/json' },
      // Hard cap — we don't want a slow DID directory to wedge /api/session.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      ctx.logger.warn(
        { did, status: res.status, url },
        'DID document fetch failed'
      );
      return null;
    }
    const doc = (await res.json()) as DidDocument;
    const aka = doc.alsoKnownAs?.find((s) => s.startsWith('at://'));
    return aka ? aka.slice('at://'.length) : null;
  } catch (err) {
    ctx.logger.warn({ err, did }, 'DID document resolution failed');
    return null;
  }
}

export function createSessionRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/session — returns the authed user's DID + handle + profile bits, or 401.
  router.get(
    '/session',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Preferred path: the public AppView has the full profile (handle,
      // display name, avatar URL).
      try {
        const profile = await publicAgent.getProfile({ actor: agent.did });
        return res.json({
          did: profile.data.did,
          handle: profile.data.handle,
          displayName: profile.data.displayName ?? null,
          avatar: profile.data.avatar ?? null,
        });
      } catch (err) {
        // Log enough detail to actually diagnose this from production logs.
        // The previous version warned with no payload context, which made
        // "I have no handle in prod" effectively undebuggable.
        ctx.logger.warn(
          { err, did: agent.did },
          'getProfile failed; falling back to DID document resolution'
        );
      }

      // Fallback path: resolve at least the handle from the DID document so
      // the UI has something to display instead of a bare DID. Avatar stays
      // null — there is no avatar without the AppView.
      const handle = await resolveHandleFromDidDocument(agent.did, ctx);

      return res.json({
        did: agent.did,
        handle,
        displayName: null,
        avatar: null,
      });
    })
  );

  return router;
}
