/**
 * Content CRUD — wraps the user's PDS via `agent.com.atproto.repo.*` to
 * read/write `social.crate.content` records. Also exposes a blob upload
 * endpoint so the editor can attach a cover image without proxying the raw
 * bytes through the user's browser to the PDS twice.
 */
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { validateMain } from '../lexicon/types/social/crate/content';
import { getSessionAgent } from '../oauth/session';

const COLLECTION = 'social.crate.content';

const rkeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._:~-]{0,63}$/i, 'invalid rkey');

const kindSchema = z.enum([
  'illustration',
  'article',
  'video',
  'talk',
  'newsletter',
  'podcast',
  'other',
]);

// Mirrors the `BlobRef` JSON shape the AT Protocol uses on the wire. We let
// the lexicon validator do the real checking; this just keeps zod happy.
const blobRefSchema = z
  .object({
    $type: z.literal('blob').optional(),
    ref: z.union([z.object({ $link: z.string() }), z.string()]).optional(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    cid: z.string().optional(),
    original: z.unknown().optional(),
  })
  .passthrough();

const strongRefSchema = z.object({
  uri: z.string().startsWith('at://').max(512),
  cid: z.string().min(1).max(256),
});

const contentInputSchema = z.object({
  kind: kindSchema,
  kindLabel: z.string().max(1000).optional(),
  title: z.string().min(1).max(3000),
  description: z.string().max(50_000).optional(),
  body: z.string().max(1_000_000).optional(),
  publishedAt: z.string().datetime().optional(),
  canonicalUrl: z.string().url().max(8192).optional(),
  image: blobRefSchema.optional(),
  imageAlt: z.string().max(20_000).optional(),
  tags: z.array(z.string().min(1).max(640)).max(30).optional(),
  bskyPostRef: strongRefSchema.optional(),
});

type ContentInput = z.infer<typeof contentInputSchema>;

function buildRecord(
  input: ContentInput,
  opts: { createdAt: string; publishedAt: string }
) {
  const record: Record<string, unknown> = {
    $type: COLLECTION,
    kind: input.kind,
    title: input.title,
    publishedAt: opts.publishedAt,
    createdAt: opts.createdAt,
  };
  if (input.kindLabel) record.kindLabel = input.kindLabel;
  if (input.description) record.description = input.description;
  if (input.body) record.body = input.body;
  if (input.canonicalUrl) record.canonicalUrl = input.canonicalUrl;
  if (input.image) record.image = input.image;
  if (input.imageAlt) record.imageAlt = input.imageAlt;
  if (input.tags && input.tags.length > 0) record.tags = input.tags;
  if (input.bskyPostRef) record.bskyPostRef = input.bskyPostRef;
  return record;
}

// Accept the image mime types declared in the lexicon. Keep in sync with
// `lexicons/social/crate/content.json`.
const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);
const MAX_BLOB_BYTES = 2_000_000; // matches lexicon `maxSize`

export function createContentRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/content — list the authenticated user's content records.
  // Optional `?kind=` filters client-side (PDS doesn't filter by record field).
  router.get(
    '/content',
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
      const kindFilter =
        typeof req.query.kind === 'string' ? req.query.kind : undefined;

      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        const records = response.data.records
          .map((r) => ({ uri: r.uri, cid: r.cid, value: r.value }))
          .filter((r) =>
            kindFilter
              ? (r.value as { kind?: string }).kind === kindFilter
              : true
          );
        return res.json({
          content: records,
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list content failed');
        return res.status(500).json({ error: 'Failed to list content' });
      }
    })
  );

  // GET /api/content/:rkey
  router.get(
    '/content/:rkey',
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
        ctx.logger.error({ err }, 'get content failed');
        return res.status(500).json({ error: 'Failed to fetch content' });
      }
    })
  );

  // POST /api/content — create a new content record.
  router.post(
    '/content',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const parsed = contentInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid content', details: parsed.error.flatten() });
      }

      const now = new Date().toISOString();
      const record = buildRecord(parsed.data, {
        createdAt: now,
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
        return res.status(201).json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'create content failed');
        return res.status(500).json({ error: 'Failed to create content' });
      }
    })
  );

  // PUT /api/content/:rkey
  router.put(
    '/content/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }

      const parsed = contentInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid content', details: parsed.error.flatten() });
      }

      // Preserve original createdAt / publishedAt if the record already exists.
      let createdAt: string = new Date().toISOString();
      let publishedAt: string = parsed.data.publishedAt ?? createdAt;
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        const v = existing.data.value as {
          createdAt?: string;
          publishedAt?: string;
        };
        if (v?.createdAt) createdAt = v.createdAt;
        // If the editor passed a new publishedAt, honor it; otherwise keep
        // whatever was previously stored.
        if (!parsed.data.publishedAt && v?.publishedAt)
          publishedAt = v.publishedAt;
      } catch {
        // Doesn't exist yet — putRecord creates it. Keep the new timestamps.
      }

      const record = buildRecord(parsed.data, { createdAt, publishedAt });

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
        ctx.logger.error({ err }, 'put content failed');
        return res.status(500).json({ error: 'Failed to update content' });
      }
    })
  );

  // DELETE /api/content/:rkey
  router.delete(
    '/content/:rkey',
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
        ctx.logger.error({ err }, 'delete content failed');
        return res.status(500).json({ error: 'Failed to delete content' });
      }
    })
  );

  // POST /api/content/upload-image — upload a cover image to the user's PDS
  // and return the resulting BlobRef. The editor then embeds this ref in the
  // content record. Raw body in, JSON out.
  //
  // Content-Type must be one of the lexicon's allowed image mime types.
  router.post(
    '/content/upload-image',
    express.raw({
      type: (req) => {
        const ct = req.headers['content-type']?.toString().split(';')[0].trim();
        return Boolean(ct && ALLOWED_IMAGE_MIME.has(ct));
      },
      limit: MAX_BLOB_BYTES,
    }),
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const mime = req.headers['content-type']?.toString().split(';')[0].trim();
      if (!mime || !ALLOWED_IMAGE_MIME.has(mime)) {
        return res.status(415).json({
          error: 'Unsupported image type. Use jpeg, png, webp, gif, or svg.',
        });
      }

      const body = req.body as Buffer | undefined;
      if (!body || body.length === 0) {
        return res.status(400).json({ error: 'Empty upload' });
      }
      if (body.length > MAX_BLOB_BYTES) {
        return res.status(413).json({ error: 'Image too large (2MB max)' });
      }

      try {
        const upload = await agent.com.atproto.repo.uploadBlob(body, {
          encoding: mime,
        });
        return res.json({ blob: upload.data.blob });
      } catch (err) {
        ctx.logger.error({ err }, 'upload blob failed');
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    })
  );

  return router;
}
