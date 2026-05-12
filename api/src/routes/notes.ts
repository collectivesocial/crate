/**
 * Notes CRUD — wraps the user's PDS via `agent.com.atproto.repo.*` to read/write
 * `social.crate.note` records, plus a public endpoint for reading any user's
 * notes by DID.
 *
 * Authoring path: getSessionAgent → validate → createRecord/putRecord/deleteRecord.
 * Public read path: unauthenticated Agent against the user's PDS (resolved by DID).
 */
import { Agent } from '@atproto/api';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { validateMain } from '../lexicon/types/social/crate/note';
import { getSessionAgent } from '../oauth/session';

const COLLECTION = 'social.crate.note';

// rkey grammar (ATProto): 1-512 chars, alphanum + `_-:.~`. We're a little
// stricter than that since these are user-supplied URL segments.
const rkeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._:~-]{0,63}$/i, 'invalid rkey');

const noteInputSchema = z.object({
  title: z.string().min(1).max(3000),
  slug: z.string().min(1).max(1000),
  body: z.string().min(0).max(1_000_000),
  tags: z.array(z.string().min(1).max(640)).max(30).optional(),
  parent: z.string().startsWith('at://').max(512).optional(),
  draft: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

type NoteInput = z.infer<typeof noteInputSchema>;

function buildRecord(input: NoteInput, opts: { updatedAt?: string; createdAt: string }) {
  const record: Record<string, unknown> = {
    $type: COLLECTION,
    title: input.title,
    slug: input.slug,
    body: input.body,
    publishedAt: input.publishedAt ?? opts.createdAt,
    createdAt: opts.createdAt,
  };
  if (input.tags && input.tags.length > 0) record.tags = input.tags;
  if (input.parent) record.parent = input.parent;
  if (input.draft) record.draft = true;
  if (opts.updatedAt) record.updatedAt = opts.updatedAt;
  return record;
}

/**
 * Resolve a DID to a usable read-only Agent. Reads the DID document from the
 * PLC directory (or did:web) to find the user's PDS service endpoint.
 */
async function resolvePublicAgent(did: string, ctx: AppContext): Promise<Agent> {
  // NodeOAuthClient exposes the identity resolver via `.didResolver` at
  // runtime, but the public type doesn't include it. Cast for access.
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

export function createNotesRouter(ctx: AppContext) {
  const router = express.Router();

  // GET /api/notes — list the authenticated user's notes (newest first).
  router.get(
    '/notes',
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
          notes: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list notes failed');
        return res.status(500).json({ error: 'Failed to list notes' });
      }
    })
  );

  // GET /api/notes/:rkey — fetch a single note from the authed user's repo.
  router.get(
    '/notes/:rkey',
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
        ctx.logger.error({ err }, 'get note failed');
        return res.status(500).json({ error: 'Failed to fetch note' });
      }
    })
  );

  // POST /api/notes — create a new note in the authed user's repo.
  // PDS assigns the rkey (TID). Slug is a record property, not the rkey.
  router.post(
    '/notes',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const parsed = noteInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid note', details: parsed.error.flatten() });
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
        return res.status(201).json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'create note failed');
        return res.status(500).json({ error: 'Failed to create note' });
      }
    })
  );

  // PUT /api/notes/:rkey — overwrite a note. Bumps updatedAt; preserves createdAt
  // if the existing record can be fetched.
  router.put(
    '/notes/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }

      const parsed = noteInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid note', details: parsed.error.flatten() });
      }

      // Preserve original createdAt if the record already exists.
      let createdAt: string = new Date().toISOString();
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: COLLECTION,
          rkey: rkeyResult.data,
        });
        const existingValue = existing.data.value as { createdAt?: string };
        if (existingValue?.createdAt) createdAt = existingValue.createdAt;
      } catch {
        // Note doesn't exist yet — putRecord will create it. Keep new createdAt.
      }

      const updatedAt = new Date().toISOString();
      const record = buildRecord(parsed.data, { createdAt, updatedAt });

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
        ctx.logger.error({ err }, 'put note failed');
        return res.status(500).json({ error: 'Failed to update note' });
      }
    })
  );

  // DELETE /api/notes/:rkey — remove a note from the authed user's repo.
  router.delete(
    '/notes/:rkey',
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
        ctx.logger.error({ err }, 'delete note failed');
        return res.status(500).json({ error: 'Failed to delete note' });
      }
    })
  );

  // GET /api/notes/by-did/:did — public read of any user's notes.
  // No session required; used for rendering on personal sites.
  router.get(
    '/notes/by-did/:did',
    handler(async (req: Request, res: Response) => {
      const didParam = req.params.did;
      const did = Array.isArray(didParam) ? didParam[0] : didParam;
      if (!did?.startsWith('did:')) {
        return res.status(400).json({ error: 'Invalid DID' });
      }

      const limit = Math.min(
        Math.max(parseInt((req.query.limit as string) ?? '50', 10) || 50, 1),
        100
      );
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

      try {
        const agent = await resolvePublicAgent(did, ctx);
        const response = await agent.com.atproto.repo.listRecords({
          repo: did,
          collection: COLLECTION,
          limit,
          cursor,
        });
        res.setHeader('cache-control', 'public, max-age=60');
        return res.json({
          notes: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err, did }, 'public list notes failed');
        return res.status(500).json({ error: 'Failed to list notes' });
      }
    })
  );

  return router;
}
