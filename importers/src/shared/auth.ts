import type { AtpAgent } from '@atproto/api';

/**
 * Returns a write-capable ATProto session agent for the importing user.
 *
 * TODO — two candidate strategies, decision deferred:
 *
 * Option A — Token file (simplest for v1):
 *   The user generates a session token via the crate.social web app (OAuth flow)
 *   and saves it to a local file (e.g. ~/.crate/session.json). This file contains
 *   { did, handle, accessJwt, refreshJwt, pdsUrl }. The importer reads it, constructs
 *   an AtpAgent, and resumes the session. Risk: tokens expire; user must re-export.
 *
 * Option B — Interactive ATProto OAuth from CLI (more robust, more complex):
 *   Use @atproto/oauth-client-node to initiate a DPoP-based OAuth flow from the
 *   terminal (open browser → callback → store tokens in ~/.crate/tokens.json).
 *   More complex to set up but tokens auto-refresh. Reference: open-social's
 *   @atproto/oauth-client-node usage.
 *
 * For now: reads a session JSON from CRATE_SESSION_FILE env var (defaults to
 * ~/.crate/session.json). Throws if the file doesn't exist.
 */
export async function getSessionAgent(): Promise<AtpAgent> {
  throw new Error(
    'getSessionAgent is not yet implemented. ' +
      'Set CRATE_SESSION_FILE to a session JSON exported from the web app, ' +
      'or implement interactive OAuth via @atproto/oauth-client-node.'
  );
}
