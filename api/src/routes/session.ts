/**
 * Session inspection endpoint. The web app polls `GET /api/session` after
 * mount to figure out whether to render the login button or the signed-in UI.
 */
import express, { Request, Response } from 'express';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { getSessionAgent } from '../oauth/session';

export function createSessionRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/session — returns the authed user's DID + handle, or 401.
  router.get(
    '/session',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      try {
        const profile = await agent.getProfile({ actor: agent.did });
        return res.json({
          did: profile.data.did,
          handle: profile.data.handle,
          displayName: profile.data.displayName ?? null,
          avatar: profile.data.avatar ?? null,
        });
      } catch (err) {
        ctx.logger.warn({ err }, 'getProfile failed; returning bare DID');
        return res.json({ did: agent.did, handle: null });
      }
    })
  );

  return router;
}
