/**
 * RSS/Atom feed link CRUD — wraps the user's PDS via `agent.com.atproto.repo.*`
 * to read/write `social.crate.rss.feed` records.
 *
 * Records are intentionally simple: a URL plus a display title. Renderers
 * (your personal site, etc.) can read these and list "feeds I follow" or
 * "feeds I publish" without any background poller running.
 */
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler, isRecordNotFoundError } from '../lib/http';
import { validateMain } from '../lexicon/types/social/crate/rss/feed';
import { getSessionAgent } from '../oauth/session';

const COLLECTION = 'social.crate.rss.feed';

const rkeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._:~-]{0,63}$/i, 'invalid rkey');

const feedInputSchema = z.object({
  url: z.string().url().max(8192),
  title: z.string().min(1).max(2000),
  description: z.string().max(20_000).optional(),
  siteUrl: z.string().url().max(8192).optional(),
  destination: z.string().max(128).optional(),
  active: z.boolean().optional(),
});

type FeedInput = z.infer<typeof feedInputSchema>;

function buildRecord(input: FeedInput, opts: { createdAt: string }) {
  const record: Record<string, unknown> = {
    $type: COLLECTION,
    url: input.url,
    title: input.title,
    createdAt: opts.createdAt,
  };
  if (input.description) record.description = input.description;
  if (input.siteUrl) record.siteUrl = input.siteUrl;
  if (input.destination) record.destination = input.destination;
  if (typeof input.active === 'boolean') record.active = input.active;
  return record;
}

export function createFeedsRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/feeds — list the authenticated user's feed records.
  router.get(
    '/feeds',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '50', 10) || 50, 1),
        100
      );
      const cursor =
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        return res.json({
          feeds: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list feeds failed');
        return res.status(500).json({ error: 'Failed to list feeds' });
      }
    })
  );

  // GET /api/feeds/:rkey
  router.get(
    '/feeds/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }
      try {
        const response = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        return res.json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: response.data.value,
        });
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          return res.status(404).json({ error: 'Not found' });
        }
        ctx.logger.error({ err }, 'get feed failed');
        return res.status(500).json({ error: 'Failed to fetch feed' });
      }
    })
  );

  // POST /api/feeds — create a new feed link.
  router.post(
    '/feeds',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const parsed = feedInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid feed', details: parsed.error.flatten() });
      }
      const now = new Date().toISOString();
      const record = buildRecord(parsed.data, { createdAt: now });

      const validation = validateMain(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }
      try {
        const response = await agent.com.atproto.repo.createRecord({
          repo: agent.did,
          collection: COLLECTION,
          record: record as Record<string, unknown>,
        });
        return res
          .status(201)
          .json({ uri: response.data.uri, cid: response.data.cid, value: record });
      } catch (err) {
        ctx.logger.error({ err }, 'create feed failed');
        return res.status(500).json({ error: 'Failed to create feed' });
      }
    })
  );

  // PUT /api/feeds/:rkey — preserves createdAt across edits.
  router.put(
    '/feeds/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }
      const parsed = feedInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid feed', details: parsed.error.flatten() });
      }

      let createdAt: string = new Date().toISOString();
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        const v = existing.data.value as { createdAt?: string };
        if (v?.createdAt) createdAt = v.createdAt;
      } catch {
        // doesn't exist yet — putRecord creates
      }

      const record = buildRecord(parsed.data, { createdAt });
      const validation = validateMain(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }
      try {
        const response = await agent.com.atproto.repo.putRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
          record: record as Record<string, unknown>,
        });
        return res.json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'put feed failed');
        return res.status(500).json({ error: 'Failed to update feed' });
      }
    })
  );

  // DELETE /api/feeds/:rkey
  router.delete(
    '/feeds/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }
      try {
        await agent.com.atproto.repo.deleteRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        return res.status(204).end();
      } catch (err) {
        ctx.logger.error({ err }, 'delete feed failed');
        return res.status(500).json({ error: 'Failed to delete feed' });
      }
    })
  );

  return router;
}
