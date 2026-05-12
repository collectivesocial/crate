/**
 * Documents CRUD — wraps the user's PDS via `agent.com.atproto.repo.*` to
 * read/write `site.standard.document` records, plus a helper for resolving a
 * Bluesky post URL/URI/rkey to a strongRef so users can attach a post to a
 * document as `bskyPostRef`.
 */
import { Agent } from '@atproto/api';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { validateMain } from '../lexicon/types/site/standard/document';
import { getSessionAgent } from '../oauth/session';

const COLLECTION = 'site.standard.document';
const BSKY_POST_COLLECTION = 'app.bsky.feed.post';

// Same rkey rules as notes — ATProto allows more but these constraints are
// what we accept from user input.
const rkeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._:~-]{0,63}$/i, 'invalid rkey');

const strongRefSchema = z.object({
  uri: z.string().startsWith('at://').max(512),
  cid: z.string().min(1).max(256),
});

const documentInputSchema = z.object({
  site: z.string().url().or(z.string().startsWith('at://')),
  path: z.string().max(2048).optional(),
  title: z.string().min(1).max(5000),
  description: z.string().max(30000).optional(),
  textContent: z.string().max(1_000_000).optional(),
  tags: z.array(z.string().min(1).max(1280)).max(50).optional(),
  bskyPostRef: strongRefSchema.optional(),
  publishedAt: z.string().datetime().optional(),
});

type DocumentInput = z.infer<typeof documentInputSchema>;

function buildRecord(
  input: DocumentInput,
  opts: { updatedAt?: string; publishedAt: string }
) {
  const record: Record<string, unknown> = {
    $type: COLLECTION,
    site: input.site,
    title: input.title,
    publishedAt: opts.publishedAt,
  };
  if (input.path) record.path = input.path;
  if (input.description) record.description = input.description;
  if (input.textContent) record.textContent = input.textContent;
  if (input.tags && input.tags.length > 0) record.tags = input.tags;
  if (input.bskyPostRef) record.bskyPostRef = input.bskyPostRef;
  if (opts.updatedAt) record.updatedAt = opts.updatedAt;
  return record;
}

/**
 * Accepts a Bluesky post URL, AT-URI, or bare rkey and returns the canonical
 * strongRef ({ uri, cid }) for the post in the authed user's repo.
 *
 * Supported inputs:
 *   - `https://bsky.app/profile/<handle-or-did>/post/<rkey>`
 *   - `at://<did>/app.bsky.feed.post/<rkey>`
 *   - bare `<rkey>` (resolved against the authed user's repo)
 */
async function resolveBskyPostRef(
  input: string,
  authedDid: string,
  agent: Agent
): Promise<{ uri: string; cid: string } | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let rkey: string | undefined;
  let repo: string = authedDid;

  // bsky.app URL
  const url = trimmed.match(/^https?:\/\/[^/]+\/profile\/([^/]+)\/post\/([^/?#]+)/i);
  if (url) {
    repo = url[1];
    rkey = url[2];
  } else if (trimmed.startsWith('at://')) {
    // at://did/app.bsky.feed.post/rkey
    const parts = trimmed.slice('at://'.length).split('/');
    if (parts.length >= 3 && parts[1] === BSKY_POST_COLLECTION) {
      repo = parts[0];
      rkey = parts[2];
    }
  } else if (/^[a-z0-9][a-z0-9._:~-]{0,63}$/i.test(trimmed)) {
    rkey = trimmed;
  }

  if (!rkey) return null;

  // If `repo` is a handle (from a bsky.app URL), resolve it to a DID first.
  if (!repo.startsWith('did:')) {
    try {
      const resolved = await agent.com.atproto.identity.resolveHandle({
        handle: repo,
      });
      repo = resolved.data.did;
    } catch {
      return null;
    }
  }

  try {
    const res = await agent.com.atproto.repo.getRecord({
      repo,
      collection: BSKY_POST_COLLECTION,
      rkey,
    });
    if (!res.data.cid) return null;
    return { uri: res.data.uri, cid: res.data.cid };
  } catch {
    return null;
  }
}

export function createDocumentsRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/documents — list the authenticated user's documents.
  router.get(
    '/documents',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '50', 10) || 50, 1),
        100
      );
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        return res.json({
          documents: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list documents failed');
        return res.status(500).json({ error: 'Failed to list documents' });
      }
    })
  );

  // GET /api/documents/:rkey
  router.get(
    '/documents/:rkey',
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
        const status = (err as { status?: number })?.status === 404 ? 404 : 500;
        if (status === 404) return res.status(404).json({ error: 'Not found' });
        ctx.logger.error({ err }, 'get document failed');
        return res.status(500).json({ error: 'Failed to fetch document' });
      }
    })
  );

  // POST /api/documents — create a new document.
  router.post(
    '/documents',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const parsed = documentInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid document', details: parsed.error.flatten() });
      }

      const now = new Date().toISOString();
      const record = buildRecord(parsed.data, {
        publishedAt: parsed.data.publishedAt ?? now,
      });

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
        ctx.logger.error({ err }, 'create document failed');
        return res.status(500).json({ error: 'Failed to create document' });
      }
    })
  );

  // PUT /api/documents/:rkey
  router.put(
    '/documents/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }

      const parsed = documentInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid document', details: parsed.error.flatten() });
      }

      // Preserve original publishedAt if the record already exists; bump updatedAt.
      let publishedAt: string = parsed.data.publishedAt ?? new Date().toISOString();
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        const v = existing.data.value as { publishedAt?: string };
        if (v?.publishedAt) publishedAt = v.publishedAt;
      } catch {
        // Doesn't exist yet — putRecord creates it. Keep the new timestamp.
      }

      const updatedAt = new Date().toISOString();
      const record = buildRecord(parsed.data, { publishedAt, updatedAt });

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
        ctx.logger.error({ err }, 'put document failed');
        return res.status(500).json({ error: 'Failed to update document' });
      }
    })
  );

  // DELETE /api/documents/:rkey
  router.delete(
    '/documents/:rkey',
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
        ctx.logger.error({ err }, 'delete document failed');
        return res.status(500).json({ error: 'Failed to delete document' });
      }
    })
  );

  // POST /api/bsky/resolve-post — resolve a Bluesky post URL/URI/rkey to a
  // strongRef. Used by the documents editor to attach a `bskyPostRef`.
  router.post(
    '/bsky/resolve-post',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const input = typeof req.body?.input === 'string' ? req.body.input : '';
      const ref = await resolveBskyPostRef(input, agent.did, agent);
      if (!ref) {
        return res.status(404).json({ error: 'Could not resolve post' });
      }
      return res.json({ ref });
    })
  );

  // GET /api/bsky/my-posts — list the authed user's most recent Bluesky posts.
  // Returns minimal data (uri, cid, text, createdAt) for picking one as a ref.
  router.get(
    '/bsky/my-posts',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '25', 10) || 25, 1),
        100
      );
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: BSKY_POST_COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        const posts = response.data.records.map((r) => ({
          uri: r.uri,
          cid: r.cid,
          text: (r.value as { text?: string })?.text ?? '',
          createdAt: (r.value as { createdAt?: string })?.createdAt ?? '',
        }));
        return res.json({ posts, cursor: response.data.cursor ?? null });
      } catch (err) {
        ctx.logger.error({ err }, 'list bsky posts failed');
        return res.status(500).json({ error: 'Failed to list Bluesky posts' });
      }
    })
  );

  return router;
}
