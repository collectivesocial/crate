/**
 * Calendar events + RSVPs — wraps the user's PDS via `agent.com.atproto.repo.*`
 * to read/write `community.lexicon.calendar.event` and
 * `community.lexicon.calendar.rsvp` records. Compatible with Smoke Signal and
 * any other ATProto app that speaks the Lexicon Community calendar lexicons.
 */
import { Agent } from '@atproto/api';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { handler } from '../lib/http';
import { validateMain as validateEvent } from '../lexicon/types/community/lexicon/calendar/event';
import { validateMain as validateRsvp } from '../lexicon/types/community/lexicon/calendar/rsvp';
import { getSessionAgent } from '../oauth/session';

const EVENT_COLLECTION = 'community.lexicon.calendar.event';
const RSVP_COLLECTION = 'community.lexicon.calendar.rsvp';

const rkeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._:~-]{0,63}$/i, 'invalid rkey');

const locationSchema = z.object({
  name: z.string().max(256).optional(),
  locality: z.string().max(256).optional(),
  region: z.string().max(256).optional(),
  country: z.string().max(256).optional(),
});

const uriSchema = z.object({
  uri: z.string().url().max(2048),
  name: z.string().max(256).optional(),
});

const eventModeValues = [
  'community.lexicon.calendar.event#virtual',
  'community.lexicon.calendar.event#inperson',
  'community.lexicon.calendar.event#hybrid',
] as const;

const eventStatusValues = [
  'community.lexicon.calendar.event#scheduled',
  'community.lexicon.calendar.event#cancelled',
  'community.lexicon.calendar.event#postponed',
] as const;

const eventInputSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(2048).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  mode: z.enum(eventModeValues).optional(),
  status: z.enum(eventStatusValues).optional(),
  locations: z.array(locationSchema).max(10).optional(),
  uris: z.array(uriSchema).max(10).optional(),
});

type EventInput = z.infer<typeof eventInputSchema>;

const rsvpStatusValues = [
  'community.lexicon.calendar.rsvp#going',
  'community.lexicon.calendar.rsvp#interested',
  'community.lexicon.calendar.rsvp#notgoing',
] as const;

const rsvpInputSchema = z.object({
  subject: z.object({
    uri: z.string().startsWith('at://').max(512),
    cid: z.string().min(1).max(256),
  }),
  status: z.enum(rsvpStatusValues),
});

function buildEventRecord(input: EventInput, opts: { createdAt: string }) {
  const record: Record<string, unknown> = {
    $type: EVENT_COLLECTION,
    name: input.name,
    createdAt: opts.createdAt,
  };
  if (input.description) record.description = input.description;
  if (input.startsAt) record.startsAt = input.startsAt;
  if (input.endsAt) record.endsAt = input.endsAt;
  if (input.mode) record.mode = input.mode;
  if (input.status) record.status = input.status;
  if (input.locations && input.locations.length > 0) {
    // Drop entries where every field is blank.
    const locs = input.locations.filter((l) =>
      Object.values(l).some((v) => typeof v === 'string' && v.trim().length > 0)
    );
    if (locs.length > 0) record.locations = locs;
  }
  if (input.uris && input.uris.length > 0) record.uris = input.uris;
  return record;
}

/** Resolve a DID to a public, read-only Agent against its PDS. */
async function resolvePublicAgent(did: string, ctx: AppContext): Promise<Agent> {
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

/**
 * Parse an at-URI into { did, collection, rkey }. Returns null if it doesn't
 * have all three parts.
 */
function parseAtUri(
  uri: string
): { did: string; collection: string; rkey: string } | null {
  if (!uri.startsWith('at://')) return null;
  const parts = uri.slice('at://'.length).split('/');
  if (parts.length < 3) return null;
  return { did: parts[0], collection: parts[1], rkey: parts[2] };
}

export function createEventsRouter(ctx: AppContext) {
  const router = express.Router();

  // ─── Events ────────────────────────────────────────────────────────────

  // GET /api/events — list the authenticated user's events.
  router.get(
    '/events',
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
          collection: EVENT_COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        return res.json({
          events: response.data.records.map((r) => ({
            uri: r.uri,
            cid: r.cid,
            value: r.value,
          })),
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list events failed');
        return res.status(500).json({ error: 'Failed to list events' });
      }
    })
  );

  // GET /api/events/:rkey — fetch a single event from the authed user's repo.
  router.get(
    '/events/:rkey',
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
          collection: EVENT_COLLECTION,
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
        ctx.logger.error({ err }, 'get event failed');
        return res.status(500).json({ error: 'Failed to fetch event' });
      }
    })
  );

  // POST /api/events — create a new event.
  router.post(
    '/events',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const parsed = eventInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid event', details: parsed.error.flatten() });
      }
      const now = new Date().toISOString();
      const record = buildEventRecord(parsed.data, { createdAt: now });

      const validation = validateEvent(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }
      try {
        const response = await agent.com.atproto.repo.createRecord({
          repo: agent.did,
          collection: EVENT_COLLECTION,
          record: record as Record<string, unknown>,
        });
        return res
          .status(201)
          .json({ uri: response.data.uri, cid: response.data.cid, value: record });
      } catch (err) {
        ctx.logger.error({ err }, 'create event failed');
        return res.status(500).json({ error: 'Failed to create event' });
      }
    })
  );

  // PUT /api/events/:rkey — overwrite an event. Preserves createdAt.
  router.put(
    '/events/:rkey',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const rkeyResult = rkeySchema.safeParse(req.params.rkey);
      if (!rkeyResult.success) {
        return res.status(400).json({ error: 'Invalid rkey' });
      }
      const parsed = eventInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid event', details: parsed.error.flatten() });
      }

      let createdAt: string = new Date().toISOString();
      try {
        const existing = await agent.com.atproto.repo.getRecord({
          repo: agent.did,
          collection: EVENT_COLLECTION,
          rkey: rkeyResult.data,
        });
        const v = existing.data.value as { createdAt?: string };
        if (v?.createdAt) createdAt = v.createdAt;
      } catch {
        // doesn't exist yet — putRecord creates
      }

      const record = buildEventRecord(parsed.data, { createdAt });
      const validation = validateEvent(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }
      try {
        const response = await agent.com.atproto.repo.putRecord({
          repo: agent.did,
          collection: EVENT_COLLECTION,
          rkey: rkeyResult.data,
          record: record as Record<string, unknown>,
        });
        return res.json({
          uri: response.data.uri,
          cid: response.data.cid,
          value: record,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'put event failed');
        return res.status(500).json({ error: 'Failed to update event' });
      }
    })
  );

  // DELETE /api/events/:rkey
  router.delete(
    '/events/:rkey',
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
          collection: EVENT_COLLECTION,
          rkey: rkeyResult.data,
        });
        return res.status(204).end();
      } catch (err) {
        ctx.logger.error({ err }, 'delete event failed');
        return res.status(500).json({ error: 'Failed to delete event' });
      }
    })
  );

  // ─── RSVPs ─────────────────────────────────────────────────────────────

  // GET /api/rsvps — list the authenticated user's RSVPs. Optionally
  // hydrates each RSVP's `event` by fetching the referenced event record
  // from its owning PDS. Pass `?hydrate=false` to skip.
  router.get(
    '/rsvps',
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
      const hydrate = req.query.hydrate !== 'false';

      try {
        const response = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: RSVP_COLLECTION,
          limit,
          cursor,
          reverse: false,
        });
        const rsvps: Array<{
          uri: string;
          cid: string;
          value: unknown;
          event: { uri: string; cid: string; value: unknown } | null;
        }> = response.data.records.map((r) => ({
          uri: r.uri,
          cid: r.cid,
          value: r.value,
          event: null,
        }));

        if (hydrate) {
          // Cache resolved Agents by DID — many RSVPs may point at events
          // hosted on the same PDS.
          const agentByDid = new Map<string, Agent>();
          await Promise.all(
            rsvps.map(async (entry) => {
              const subjectUri = (entry.value as { subject?: { uri?: string } })
                ?.subject?.uri;
              if (!subjectUri) return;
              const parsed = parseAtUri(subjectUri);
              if (!parsed || parsed.collection !== EVENT_COLLECTION) return;
              try {
                let eventAgent = agentByDid.get(parsed.did);
                if (!eventAgent) {
                  eventAgent =
                    parsed.did === agent.did
                      ? agent
                      : await resolvePublicAgent(parsed.did, ctx);
                  agentByDid.set(parsed.did, eventAgent);
                }
                const ev = await eventAgent.com.atproto.repo.getRecord({
                  repo: parsed.did,
                  collection: EVENT_COLLECTION,
                  rkey: parsed.rkey,
                });
                entry.event = {
                  uri: ev.data.uri,
                  cid: ev.data.cid ?? '',
                  value: ev.data.value,
                };
              } catch {
                // event went missing or PDS unreachable — leave event=null
              }
            })
          );
        }

        return res.json({
          rsvps,
          cursor: response.data.cursor ?? null,
        });
      } catch (err) {
        ctx.logger.error({ err }, 'list rsvps failed');
        return res.status(500).json({ error: 'Failed to list RSVPs' });
      }
    })
  );

  // POST /api/rsvps — create a new RSVP (or overwrite an existing RSVP
  // for the same event by deleting the old one first). RSVP rkey is
  // PDS-assigned.
  router.post(
    '/rsvps',
    handler(async (req: Request, res: Response) => {
      const agent = await getSessionAgent(req, res, ctx);
      if (!agent || !agent.did) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const parsed = rsvpInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid RSVP', details: parsed.error.flatten() });
      }

      const now = new Date().toISOString();
      const record: Record<string, unknown> = {
        $type: RSVP_COLLECTION,
        subject: parsed.data.subject,
        status: parsed.data.status,
        createdAt: now,
      };
      const validation = validateRsvp(record);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Lexicon validation failed',
          details: validation.error?.message,
        });
      }

      // Delete any existing RSVPs we hold for this event so we don't end up
      // with duplicates. RSVP records use TID rkeys, not the subject URI, so
      // we have to scan.
      try {
        const existing = await agent.com.atproto.repo.listRecords({
          repo: agent.did,
          collection: RSVP_COLLECTION,
          limit: 100,
        });
        const dupes = existing.data.records.filter((r) => {
          const subjectUri = (r.value as { subject?: { uri?: string } })?.subject
            ?.uri;
          return subjectUri === parsed.data.subject.uri;
        });
        for (const d of dupes) {
          const parts = d.uri.split('/');
          const oldRkey = parts[parts.length - 1];
          await agent.com.atproto.repo.deleteRecord({
            repo: agent.did,
            collection: RSVP_COLLECTION,
            rkey: oldRkey,
          });
        }
      } catch (err) {
        ctx.logger.warn({ err }, 'rsvp dedupe pre-scan failed (continuing)');
      }

      try {
        const response = await agent.com.atproto.repo.createRecord({
          repo: agent.did,
          collection: RSVP_COLLECTION,
          record: record as Record<string, unknown>,
        });
        return res
          .status(201)
          .json({ uri: response.data.uri, cid: response.data.cid, value: record });
      } catch (err) {
        ctx.logger.error({ err }, 'create rsvp failed');
        return res.status(500).json({ error: 'Failed to create RSVP' });
      }
    })
  );

  // DELETE /api/rsvps/:rkey — withdraw an RSVP.
  router.delete(
    '/rsvps/:rkey',
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
          collection: RSVP_COLLECTION,
          rkey: rkeyResult.data,
        });
        return res.status(204).end();
      } catch (err) {
        ctx.logger.error({ err }, 'delete rsvp failed');
        return res.status(500).json({ error: 'Failed to delete RSVP' });
      }
    })
  );

  return router;
}
