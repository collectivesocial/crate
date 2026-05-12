/**
 * Now page CRUD — wraps the user's PDS for `social.crate.now` (append-only)
 * and `social.crate.now.config` (singleton at rkey='self'). Also exposes a
 * generic public-read endpoint used by the now page's "live feed" panels.
 */
import { Agent } from '@atproto/api';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { validateMain as validateNow } from '../lexicon/types/social/crate/now';
import { validateMain as validateConfig } from '../lexicon/types/social/crate/now/config';
import { getSessionAgent } from '../oauth/session';

const NOW_COLLECTION = 'social.crate.now';
const CONFIG_COLLECTION = 'social.crate.now.config';

const sectionSchema = z.object({
  title: z.string().min(1).max(1000),
  body: z.string().min(0).max(100_000),
});

const nowInputSchema = z
  .object({
    body: z.string().max(100_000).optional(),
    sections: z.array(sectionSchema).max(20).optional(),
    location: z.string().max(3000).optional(),
    summary: z.string().max(3000).optional(),
  })
  .refine(
    (v) => Boolean(v.body?.trim()) || (v.sections && v.sections.length > 0),
    { message: 'Either body or at least one section is required' }
  );

type NowInput = z.infer<typeof nowInputSchema>;

const liveFeedSchema = z.object({
  title: z.string().min(1).max(2000),
  did: z.string().startsWith('did:').max(512).optional(),
  collection: z.string().min(1).max(512),
  limit: z.number().int().min(1).max(50).optional(),
  filter: z
    .enum([
      'social.crate.now.config#topLevelPosts',
      'social.crate.now.config#noReplies',
      'social.crate.now.config#noReposts',
    ])
    .optional(),
});

const configInputSchema = z.object({
  liveFeeds: z.array(liveFeedSchema).max(20).optional(),
});

function buildNowRecord(input: NowInput, createdAt: string) {
  const record: Record<string, unknown> = {
    $type: NOW_COLLECTION,
    createdAt,
  };
  if (input.body && input.body.trim()) record.body = input.body;
  if (input.sections && input.sections.length > 0)
    record.sections = input.sections;
  if (input.location) record.location = input.location;
  if (input.summary) record.summary = input.summary;
  return record;
}

/**
 * Resolve a DID to a usable read-only Agent. Used by the live-feed endpoint
 * so callers can pull records from any author's PDS.
 */
async function resolvePublicAgent(
  did: string,
  ctx: AppContext
): Promise<Agent> {
  const resolver = (
    ctx.oauthClient as unknown as {
      didResolver: { resolve(did: string): Promise<{ service?: unknown }> };
    }
  ).didResolver;

  const didDoc = await resolver.resolve(did);
  const services = (didDoc?.service ?? []) as Array<{
    id: string;
    type: string;
    serviceEndpoint: string | string[];
  }>;
  const pds = services.find(
    (s) => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer'
  );
  if (!pds) throw new Error(`No PDS endpoint in DID document for ${did}`);
  const endpoint = Array.isArray(pds.serviceEndpoint)
    ? pds.serviceEndpoint[0]
    : pds.serviceEndpoint;
  return new Agent(endpoint);
}

export function createNowRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/now — latest now entry for the authed user.
  // Returns { entry } or { entry: null } when none exists yet.
  router.get(
    '/now',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: NOW_COLLECTION,
          limit: 1,
          reverse: false,
        });
        const record = response.data.records[0];
        return res.json({
          entry: record
            ? { uri: record.uri, cid: record.cid, value: record.value }
            : null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list now failed');
        return res.status(500).json({ error: 'Failed to load now page' });
      }
    })
  );

  // GET /api/now/history — paginated history of now entries.
  router.get(
    '/now/history',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '25', 10) || 25, 1),
        100
      );
      const cursor =
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: NOW_COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        return res.json({
          entries: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list now history failed');
        return res.status(500).json({ error: 'Failed to load history' });
      }
    })
  );

  // POST /api/now — create a new now entry (append-only).
  router.post(
    '/now',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const parsed = nowInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid now entry',
          details: parsed.error.flatten(),
        });
      }
      const now = new Date().toISOString();
      const record = buildNowRecord(parsed.data, now);

      const validation = validateNow(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }

      try {
        const response = await agent.com.atproto.repo.createRecord({
          repo: agent.did,
          collection: NOW_COLLECTION,
          record: record as Record<string, unknown>,
        });
        return res.status(201).json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'create now failed');
        return res.status(500).json({ error: 'Failed to create now entry' });
      }
    })
  );

  // GET /api/now/config — singleton at rkey='self'. Returns null when missing.
  router.get(
    '/now/config',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      try {
        const response = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: CONFIG_COLLECTION,
          rkey: 'self',
        });
        return res.json({
          config: {
            uri: response.data.uri,
            cid: response.data.cid,
            value: response.data.value,
          },
        });
      } catch (err) {
        if ((err as { status?: number })?.status === 404) {
          return res.json({ config: null });
        }
        ctx.logger.error({ err }, 'get now.config failed');
        return res.status(500).json({ error: 'Failed to load config' });
      }
    })
  );

  // PUT /api/now/config — upsert the singleton config record.
  router.put(
    '/now/config',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const parsed = configInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid config', details: parsed.error.flatten() });
      }

      // Preserve createdAt across edits.
      let createdAt: string = new Date().toISOString();
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: CONFIG_COLLECTION,
          rkey: 'self',
        });
        const v = existing.data.value as { createdAt?: string };
        if (v?.createdAt) createdAt = v.createdAt;
      } catch {
        // Doesn't exist yet — putRecord creates it.
      }

      const updatedAt = new Date().toISOString();
      const record: Record<string, unknown> = {
        $type: CONFIG_COLLECTION,
        createdAt,
        updatedAt,
      };
      if (parsed.data.liveFeeds && parsed.data.liveFeeds.length > 0) {
        record.liveFeeds = parsed.data.liveFeeds;
      }

      const validation = validateConfig(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }

      try {
        const response = await agent.com.atproto.repo.putRecord({
          repo: agent.did,
          collection: CONFIG_COLLECTION,
          rkey: 'self',
          record: record as Record<string, unknown>,
        });
        return res.json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'put now.config failed');
        return res.status(500).json({ error: 'Failed to save config' });
      }
    })
  );

  // GET /api/now/live-feed — public-read helper used by the now viewer to
  // render configured "recent items" panels. Reads any author's collection
  // through their PDS via the resolver. No auth required.
  router.get(
    '/now/live-feed',
    handler(async (req: Request, res: Response) => {
      const did = typeof req.query.did === 'string' ? req.query.did : '';
      const collection =
        typeof req.query.collection === 'string' ? req.query.collection : '';
      const filter =
        typeof req.query.filter === 'string' ? req.query.filter : '';
      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '5', 10) || 5, 1),
        50
      );
      if (!did.startsWith('did:') || !collection) {
        return res
          .status(400)
          .json({ error: 'did and collection are required' });
      }
      try {
        const publicAgent = await resolvePublicAgent(did, ctx);
        // Over-fetch when filtering so we still return up to `limit` rows.
        const fetchLimit = filter ? Math.min(limit * 4, 100) : limit;
        const response = await publicAgent.com.atproto.repo.listRecords({
          repo: did,
          collection,
          limit: fetchLimit,
          reverse: false,
        });
        let records = response.data.records.map((r) => ({
          uri: r.uri,
          cid: r.cid,
          value: r.value,
        }));

        if (
          filter === 'social.crate.now.config#topLevelPosts' ||
          filter === 'social.crate.now.config#noReplies'
        ) {
          records = records.filter(
            (r) => !(r.value as { reply?: unknown }).reply
          );
        }
        if (filter === 'social.crate.now.config#noReposts') {
          // app.bsky.feed.repost is a separate collection. For posts that
          // embed a record (quote posts) we keep them; this filter just
          // drops explicit repost records when listing app.bsky.feed.repost.
          records = records.filter((r) => {
            const v = r.value as { $type?: string };
            return v.$type !== 'app.bsky.feed.repost';
          });
        }

        records = records.slice(0, limit);
        return res.json({ records });
      } catch (err) {
        ctx.logger.error({ err, did, collection }, 'live-feed fetch failed');
        return res.status(500).json({ error: 'Failed to fetch live feed' });
      }
    })
  );

  return router;
}
