# crate.social — Build Plan

A custom-lexicon publishing service for ATProto. Define structured record types for the things you make, import from any source (RSS, markdown, manual entry), publish to your PDS, query from anywhere.

---

## Verified facts referenced in this plan

A few things I'm grounding decisions on, with sources so you can double-check before committing:

- **standard.site** defines three lexicons: `site.standard.publication`, `site.standard.document`, and `site.standard.graph.subscription`. The schema focuses on metadata; content format is left to each platform. Source: [standard.site](https://standard.site/) and the [Leaflet Lab Notes 021 announcement](https://lab.leaflet.pub/3md4qsktbms24).
- **community.lexicon.calendar.event** is the event lexicon stewarded by Lexicon Community and used by Smoke Signal. Confirmed NSID and example shape from [Lexicon Garden](https://lexicon.garden/help/lexicon-examples). The corresponding RSVP lexicon follows the same `community.lexicon.calendar.*` convention; verify the exact NSID at [Lexicon Community](https://github.com/lexicon-community) before you start building against it.
- **Standard.site site verification** uses a `/.well-known/site.standard.publication` endpoint that returns the AT-URI of your publication record, plus a `<link>` tag in document `<head>` pointing back to the AT-URI. Source: [standard.site](https://standard.site/). You'll need this if you want your migrated blog posts to be properly verified.
- **Smoke Signal is open source** under MIT and its core has been extracted into `atproto-*` Rust crates. Source: [One Year of Smoke Signal](https://blog.smokesignal.events/posts/3ltugo43gkl2a-one-year-of-smoke-signal). If you need to query events you've RSVP'd to, you may be able to query the firehose or your own PDS directly without going through Smoke Signal's AppView, but check Smoke Signal's docs before assuming.

Things I have not verified and you should check:

- Whether Offprint uses `pub.leaflet.*` or `site.standard.*` (or both) as its primary lexicons. The Leaflet announcement suggests Leaflet has migrated toward standard.site, but confirm before you commit your newsletter migration to a destination lexicon.
- Whether Semble publishes ATProto records you can reference, or is a closed bookmarking service. If the former, your note → bookmark links can be ATProto references; if the latter, they'll be plain URLs.
- Whether Collective's books are at `app.collective.book`, `app.collectivesocial.book`, or some other NSID — check your own Collective app's lexicon before wiring up note-to-book links.

---

## Vision

Every piece of content you make lives as an ATProto record on your PDS. Crate is the service that defines the lexicons, runs the importers, and exposes a read API. Your personal site is one rendering of those records; anyone else could build a different rendering.

Crate is generic enough to be useful to others. You're shipping it as a service, not just personal infrastructure.

---

## Lexicon catalog

All Crate-defined lexicons live under the `social.crate.*` namespace.

| NSID | Purpose |
|---|---|
| `social.crate.rss.feed` | A subscribed RSS feed with a configured destination lexicon |
| `social.crate.podcast.episode` | Individual podcast episode record |
| `social.crate.making.project` | Unified project record (fiber, code, site, garden, illustration-set, other) |
| `social.crate.making.update` | Sub-document attached to a project (progress logs, garden journal entries) |
| `social.crate.talk` | Conference talk |
| `social.crate.illustration` | Stick-figure illustration |
| `social.crate.note` | PKM/Zettelkasten markdown note |
| `social.crate.note.link` | Federated link/backlink between notes and any AT-URI or external URL |
| `social.crate.now` | Now-page update (append-only stream; latest is current) |

External lexicons Crate reads from or links to:

| NSID | Source |
|---|---|
| `site.standard.document` | Blog/newsletter content (verify Offprint's actual lexicon before committing) |
| `site.standard.publication` | The publication metadata for your blog/newsletter |
| `community.lexicon.calendar.event` | Events on the network |
| `community.lexicon.calendar.rsvp` | Your RSVPs (verify exact NSID) |
| `app.collective.*` (verify) | Books from Collective |
| `app.bsky.feed.post` | Bluesky posts |

---

## Lexicon shapes (drafts)

These are first-pass field lists. Each will need to become a proper Lexicon JSON file with types, validation, and string format constraints. Rough shapes only:

### `social.crate.rss.feed`

```json
{
  "url": "<feed url, required>",
  "title": "<display name, required>",
  "destination": "<NSID of target lexicon, required>",
  "active": "<boolean>",
  "lastPolledAt": "<datetime>",
  "lastEntryGuid": "<string, for dedupe>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.podcast.episode`

```json
{
  "title": "<required>",
  "description": "<required>",
  "audioUrl": "<required>",
  "duration": "<seconds, optional>",
  "publishedAt": "<datetime, required>",
  "episodeNumber": "<optional>",
  "season": "<optional>",
  "showName": "<required>",
  "guid": "<from RSS, for dedupe>",
  "feedRef": "<at-uri of social.crate.rss.feed>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.making.project`

```json
{
  "title": "<required>",
  "kind": "<required: 'fiber' | 'code' | 'site' | 'garden' | 'illustration-set' | 'other'>",
  "status": "<required: 'planning' | 'in-progress' | 'finished' | 'paused' | 'abandoned'>",
  "description": "<markdown, required>",
  "startedAt": "<datetime, optional>",
  "finishedAt": "<datetime, optional>",
  "links": "<array of {label, url}, optional>",
  "coverImage": "<blob ref, optional>",
  "fiber": "<optional object: pattern, yarn, hookSize, ravelryUrl>",
  "code": "<optional object: repo, language, deployedUrl>",
  "site": "<optional object: url, role>",
  "garden": "<optional object: bedNumber, plants[], zone>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.making.update`

```json
{
  "project": "<at-uri of social.crate.making.project, required>",
  "body": "<markdown, required>",
  "photos": "<array of blob refs, optional>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.talk`

```json
{
  "title": "<required>",
  "abstract": "<markdown, optional>",
  "eventName": "<required>",
  "eventRef": "<at-uri of community.lexicon.calendar.event, optional>",
  "givenAt": "<datetime, required>",
  "slidesUrl": "<optional>",
  "videoUrl": "<optional>",
  "coPresenters": "<array of {name, did?}, optional>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.illustration`

```json
{
  "title": "<optional>",
  "caption": "<required>",
  "image": "<blob ref, required>",
  "topic": "<optional>",
  "sourcePost": "<at-uri, optional>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.note`

```json
{
  "title": "<required>",
  "slug": "<required, used for stable URLs>",
  "body": "<markdown, required>",
  "tags": "<array of strings, optional>",
  "publishedAt": "<datetime, required>",
  "updatedAt": "<datetime, optional>",
  "createdAt": "<datetime, required>"
}
```

### `social.crate.note.link`

```json
{
  "source": "<at-uri of social.crate.note, required>",
  "target": "<object, required: { atUri?, externalUrl?, title?, description? }>",
  "context": "<optional, the surrounding sentence or annotation>",
  "createdAt": "<datetime, required>"
}
```

The `target` is a union — either an ATProto reference (preferred, federated) or an external URL. This is the single record type that connects notes to: other notes, Collective books, Semble bookmarks, podcast episodes, making projects, talks, and external articles.

### `social.crate.now`

```json
{
  "body": "<markdown, required>",
  "createdAt": "<datetime, required>"
}
```

Append-only. The latest record is "current."

---

## Architecture

Same shape as Collective and opensocial.community: three folders.

```
crate/
├── api/          # backend service
├── web/          # logged-in web app
├── landing/      # marketing/public landing page
└── lexicons/     # JSON lexicon definitions (shared)
```

### `api/` — the backend service

Responsibilities:

1. **Lexicon hosting and resolution.** Serve the `social.crate.*` lexicon JSON files at the right URLs for ATProto NSID resolution.
2. **OAuth / PDS authentication.** Users log in with their handle; Crate gets permission to write records to their PDS.
3. **Source adapters.** Pluggable modules that pull from external sources and publish ATProto records:
   - **RSS poller** (background worker) — reads `social.crate.rss.feed` records, fetches each feed on a schedule, creates target records for new entries
   - **Markdown folder importer** — accepts a tarball or git URL, parses markdown files, creates records (notes by default, configurable destination)
   - **Manual entry** — REST endpoints the web app calls
   - **Future: Ravelry, GitHub, etc.** as additional adapters
4. **Mapping layer.** For each `(source type, destination NSID)` pair, a transformer that converts source data into a valid record. Built-in mappings to start: `RSS → social.crate.podcast.episode`, `RSS → site.standard.document`, `markdown → social.crate.note`, `markdown → site.standard.document`.
5. **Read API.** XRPC endpoints for:
   - Listing a user's records by lexicon
   - Resolving cross-lexicon references (e.g. given a note, find its outgoing links and incoming backlinks)
   - Public read access (no auth needed for public records)
6. **Webhook / firehose listener (stretch).** Listen for new records relevant to a user — incoming `note.link` records pointing at their notes, RSVPs to events they're hosting, etc.

Tech: TypeScript, Node, Fastify or Hono, Postgres for indexing/cache (records of truth live on the user's PDS, but Crate maintains an index for fast queries).

### `web/` — the logged-in web app

A React/TypeScript app where you actually use Crate.

Routes:

- `/` — dashboard: recent activity, feed-poll status, draft notes
- `/feeds` — manage RSS feeds (add, configure destination, view ingest history)
- `/projects` — list/create/edit `making.project` records, attach `making.update` sub-docs
- `/talks` — list/create/edit talks
- `/illustrations` — list/upload illustrations
- `/notes` — Zettelkasten editor: list, create, edit notes; visualize backlinks
- `/notes/:slug/links` — manage outgoing links from a note
- `/now` — write a new now-page update, view history
- `/import` — drop a markdown folder or paste an RSS URL to bulk-import

The notes editor is where the digital-garden side project lives. This is the most demoable surface for show day.

### `landing/` — public landing page

Marketing site for crate.social. Static or near-static.

- What Crate is (one-sentence pitch)
- Why ATProto + custom lexicons
- The lexicon catalog
- Sign in with handle
- Link to docs and the GitHub repo

---

## Migration plan (pre-show)

Goal: by show day, every existing piece of your content lives as an ATProto record.

### Order of operations

1. **Define and publish all nine `social.crate.*` lexicons.** JSON files in `lexicons/`, served at the right NSIDs. This unblocks everything else.
2. **Stand up the API.** OAuth working, can read/write records to your own PDS.
3. **Markdown folder importer → `social.crate.note`.** Run it on your existing Zettelkasten files. This is the biggest content set.
4. **RSS adapter → `social.crate.podcast.episode`.** Point at the Overcommitted RSS feed; backfill all episodes.
5. **RSS adapter → `site.standard.document`.** Point at your current newsletter feed (or migrate to Offprint first, then point at Offprint's feed). Confirm destination lexicon before running.
6. **Manual entry / one-off scripts** for talks, projects, illustrations, current "now" status. These are low-volume enough that a one-time script per type is fine.

### Open-source angle

The migration script itself is the headline open-source artifact. Structure as a monorepo where each importer is a module that anyone could use:

```
crate-importers/
├── rss-to-podcast/
├── rss-to-standard-doc/
├── markdown-to-note/
├── markdown-to-standard-doc/
└── shared/  # auth, rate limiting, idempotency, dry-run
```

This lets people who don't want to use Crate-the-service still benefit from Crate-the-tooling.

---

## Show-day plan

What ships pre-show: lexicons defined, all your content migrated, the API running, basic web app for managing records.

What ships during the show:

1. **The digital garden experience.** Wire crate.social's notes editor to brittanyellich.com. Show writing a new note, the page appearing on the personal site, and a backlink visualization rendering across notes.
2. **Live RSS demo (optional, if time).** Add a new RSS feed to Crate, show the next entry getting auto-imported as a record.
3. **Show the federated dream.** Have someone (Jason, Jim, audience member) create a `social.crate.note.link` record on their own PDS pointing at one of your notes, and watch it appear as a backlink on your site.

That third point is the moment the demo works. It's the one thing only ATProto can do.

---

## Open questions for you to resolve

1. **Confirm the destination lexicon for the newsletter.** Is it `pub.leaflet.document` or `site.standard.document`? This changes the RSS mapping you need to write. Worth checking before any newsletter migration.
2. **One-time markdown import vs. live sync for notes.** Once a note exists as a record, where's the source of truth? Options: (a) Crate's web editor is the only way to edit; (b) markdown files stay canonical and Crate watches the folder; (c) records are canonical, edits in either place sync. (a) is simplest, (b) keeps your existing workflow intact, (c) is hard.
3. **Self-hosted PDS or Bluesky's?** More on-message to self-host, but adds operational work. The migration scripts work either way.
4. **Lexicon stewardship.** `social.crate.*` is your namespace. Are these "Brittany's lexicons" or "Crate's lexicons that anyone can use and propose changes to"? If the latter, set up a public process (GitHub repo with proposals/discussions) before show day so it's visible.
5. **Talks ↔ events linkage.** The talk lexicon has an optional `eventRef`. Will you manually link these post-hoc, or auto-link via name matching? Manual is fine for v1.
6. **RSVP and upcoming events display.** Querying your own RSVPs to show "events I'm registered for" needs either: (a) Smoke Signal's API, (b) querying your own PDS for RSVP records, or (c) firehose listening. (b) is the most independent. Confirm which is feasible.
7. **Naming for the digital-garden product.** Crate is the service. Is the digital-garden web app *part of* Crate (`crate.social/notes`), or its own thing (`yourgarden.example`) that uses Crate's lexicons? This is mostly a marketing question.

---

## Tech stack (matching Collective / opensocial.community)

- **Language:** TypeScript end-to-end
- **API framework:** whatever you used for the others (likely Fastify or Hono based on the ATProto ecosystem norm; use what you know)
- **Database:** Postgres for the index/cache layer
- **Frontend:** React + Vite (web app), Astro (landing page) — same as opensocial.community
- **ATProto libs:** `@atproto/api`, `@atproto/lexicon`, `@atproto/lex` (for codegen)
- **OAuth:** ATProto OAuth flow — there's a reference implementation worth borrowing from
- **Deployment:** whatever you used for the others (Vercel for web/landing, somewhere with persistent compute for the API since RSS polling is a long-running process)

---

## Suggested file layout

```
crate/
├── README.md
├── lexicons/
│   ├── social/crate/rss/feed.json
│   ├── social/crate/podcast/episode.json
│   ├── social/crate/making/project.json
│   ├── social/crate/making/update.json
│   ├── social/crate/talk.json
│   ├── social/crate/illustration.json
│   ├── social/crate/note.json
│   ├── social/crate/note/link.json
│   └── social/crate/now.json
├── api/
│   ├── src/
│   │   ├── routes/         # XRPC endpoints
│   │   ├── adapters/       # RSS, markdown, manual
│   │   ├── mappings/       # source-to-destination transformers
│   │   ├── workers/        # background poller
│   │   ├── pds/            # ATProto client wrapper
│   │   ├── oauth/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   ├── lib/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── landing/
│   ├── src/
│   ├── astro.config.mjs
│   └── package.json
└── importers/  # the open-source migration toolkit
    ├── rss-to-podcast/
    ├── rss-to-standard-doc/
    ├── markdown-to-note/
    └── shared/
```

---

## Suggested first week of work

- **Day 1–2:** Write all nine lexicon JSON files. Get them validating with `@atproto/lexicon`. Set up the repo skeleton.
- **Day 3:** API scaffolding, OAuth, can write a hardcoded note record to your own PDS.
- **Day 4:** Markdown-folder importer module; run it on your real Zettelkasten files.
- **Day 5:** RSS adapter + the two destination mappings (podcast, standard doc). Backfill Overcommitted episodes.
- **Day 6:** Web app scaffolding; notes editor enough to write and publish a new note.
- **Day 7:** Whatever's the weakest link.

The remaining lexicons (talks, projects, illustrations, now) get their own one-off import scripts and can have web UIs added incrementally — they're lower priority than getting the notes-and-podcast pipeline solid before show day.