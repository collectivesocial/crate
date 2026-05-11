/**
 * OAuth routes — ATProto OAuth login, callback, logout, and well-known
 * endpoints (client metadata + JWKS).
 *
 * Shape mirrors collective-social-api/src/routes/auth.ts. Uses `GET /oauth/login`
 * with a `?handle=` query string (vs. POST /login with a form) because crate-web
 * is a fully static SPA hitting the API cross-origin.
 */
import { OAuthResolverError } from '@atproto/oauth-client-node';
import express, { Request, Response } from 'express';
import { getIronSession } from 'iron-session';
import { config } from '../config';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { CRATE_SCOPES } from '../oauth/client-metadata';
import { SESSION_OPTIONS, Session } from '../oauth/session';

/**
 * Where to redirect the browser after a completed (or failed) OAuth flow.
 * In production, `CORS_ORIGIN` is the deployed web app URL.
 * In development, default to Vite's localhost.
 */
function getClientUrl(): string {
  if (config.CORS_ORIGIN) return config.CORS_ORIGIN;
  return 'http://127.0.0.1:5173';
}

export function createOAuthRouter(ctx: AppContext) {
  const router = express.Router();

  // OAuth client metadata — published at the URL used as `client_id`.
  router.get(
    '/oauth-client-metadata.json',
    handler((_req: Request, res: Response) => {
      res.setHeader('cache-control', 'public, max-age=300');
      res.json(ctx.oauthClient.clientMetadata);
    })
  );

  // JWKS — public keys used for `private_key_jwt` client authentication.
  router.get(
    '/.well-known/jwks.json',
    handler((_req: Request, res: Response) => {
      res.setHeader('cache-control', 'public, max-age=300');
      res.json(ctx.oauthClient.jwks);
    })
  );

  // Begin the OAuth flow. Accepts a handle, DID, or PDS URL via `?handle=`.
  router.get(
    '/oauth/login',
    handler(async (req: Request, res: Response) => {
      res.setHeader('cache-control', 'no-store');

      const input =
        typeof req.query.handle === 'string' ? req.query.handle.trim() : '';
      if (!input) {
        return res.status(400).json({ error: 'Missing handle' });
      }

      try {
        const url = await ctx.oauthClient.authorize(input, {
          scope: CRATE_SCOPES,
        });
        return res.redirect(url.toString());
      } catch (err) {
        ctx.logger.error({ err, input }, 'oauth authorize failed');
        const message =
          err instanceof OAuthResolverError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not initiate login';
        return res.status(400).json({ error: message });
      }
    })
  );

  // OAuth callback — completes the flow, persists session DID in the cookie,
  // and redirects back to the web app.
  router.get(
    '/oauth/callback',
    handler(async (req: Request, res: Response) => {
      res.setHeader('cache-control', 'no-store');

      const params = new URLSearchParams(req.originalUrl.split('?')[1] ?? '');
      try {
        const session = await getIronSession<Session>(
          req,
          res,
          SESSION_OPTIONS
        );

        // If a previous OAuth session is already attached to this cookie,
        // sign it out cleanly before replacing it.
        if (session.did) {
          try {
            const prev = await ctx.oauthClient.restore(session.did);
            if (prev) await prev.signOut();
          } catch (err) {
            ctx.logger.warn({ err }, 'oauth restore (pre-replace) failed');
          }
        }

        const { session: oauthSession } = await ctx.oauthClient.callback(params);
        session.did = oauthSession.did;
        await session.save();
      } catch (err) {
        ctx.logger.error({ err }, 'oauth callback failed');
      }

      return res.redirect(getClientUrl());
    })
  );

  // Logout — revoke credentials with the PDS and clear the cookie.
  router.post(
    '/oauth/logout',
    handler(async (req: Request, res: Response) => {
      res.setHeader('cache-control', 'no-store');

      const session = await getIronSession<Session>(req, res, SESSION_OPTIONS);

      if (session.did) {
        try {
          const oauthSession = await ctx.oauthClient.restore(session.did);
          if (oauthSession) await oauthSession.signOut();
        } catch (err) {
          ctx.logger.warn({ err }, 'oauth signOut failed');
        }
      }

      session.destroy();
      return res.json({ success: true });
    })
  );

  return router;
}
