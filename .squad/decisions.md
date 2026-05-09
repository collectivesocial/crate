# Decisions — crate.social

Append-only log of team-relevant decisions. Most recent at the bottom.

---

### 2026-05-09T09:58:10-07:00: Squad cast
**By:** Brittany Ellich (via Squad)
**What:** Hired initial team — Mal (Lead), Simon (Lexicon Designer), Wash (Backend/API/OAuth), Zoe (Importers), Kaylee (Web), Inara (Landing) — plus Scribe and Ralph. Universe: Firefly / Serenity.
**Why:** Project scope (lexicons + API + importers + Zettelkasten web app + Astro landing + OAuth) maps cleanly to six specialist roles. Lexicons split out from API because they're the contract everything else depends on; importers split out because adapters multiply over time.

### 2026-05-09T09:58:10-07:00: Repo layout per plan.md
**By:** Brittany Ellich
**What:** Project lives at `/Users/brittanyellich/Documents/Code/Collective/crate`. Top-level folders: `api/`, `web/`, `landing/`, `lexicons/`, `importers/`. Squad config in `.squad/`.
**Why:** Confirmed at squad creation. Mirrors the structure described in `plan.md`.

### 2026-05-09T09:58:10-07:00: Conventions inherited from sibling repos
**By:** Brittany Ellich
**What:** Carry forward conventions from `collective-social-*` and `open-social-*`: TS end-to-end; Kysely + Postgres + sequential migration keys; `getSessionAgent`, `SESSION_OPTIONS`, `handler()` wrapper; Pino via `ctx.logger` (never `console.*`); named exports; Chakra v3 component names (`Dialog`/`open`/`colorPalette`); `credentials: 'include'` on fetches; teal primary; `react-icons/lu`.
**Why:** Consistency across the Collective ecosystem; avoids re-deciding solved problems.
# ADR: Initial Scaffold for crate.social

**Date:** 2026-05-09
**Author:** Mal (Lead / Architect)
**Status:** Proposed

---

## Decision 1: Package manager — npm (not pnpm/yarn workspaces)

**Decision:** Use npm with `package-lock.json`, no monorepo workspace tooling.

**Rationale:** All six sibling repos (`collective-social-api`, `collective-social-web`, `open-social`, `open-social-web`, `collective-landing`, `open-landing`) use plain npm with `package-lock.json`. None use pnpm, yarn, turbo, or nx. None are monorepos — they are all single-package repos. Crate has multiple top-level folders, but they are loosely coupled (no shared build step, no cross-package imports at build time). Workspace tooling adds indirection for no proven benefit here. Each folder gets its own `package.json` and `node_modules`. A root `package.json` with convenience scripts delegates to sub-folders.

---

## Decision 2: Package boundaries — five independent packages, no workspace linking

**Decision:** `api/`, `web/`, `landing/`, `lexicons/`, and `importers/` each have their own `package.json`. They are NOT npm workspace packages — they install independently. `lexicons/` is a build-time dependency consumed via a codegen step (generates TS types into a `packages/generated/` output that api, web, and importers copy or reference). Importers are a single package with sub-modules, not individual sub-packages.

**Rationale:** Sibling repos don't cross-link. `collective-social-api` and `collective-social-web` are separate repos with no shared package. The lexicon JSON → TS codegen step (using `@atproto/lex-cli`) already exists in `collective-social-api`. Keep the same pattern: codegen outputs live in each consumer's `src/lexicon/` directory, generated from the shared `lexicons/` folder.

---

## Decision 3: Shared code strategy — codegen, not a shared package

**Decision:** No `packages/shared/` workspace package. Shared types come from lexicon codegen (`lex gen-server` and `lex gen-api`). Shared utilities (auth helpers, PDS client wrapper) live in `api/src/lib/` and are not shared to `web/` — the web app talks to the API, not to the PDS directly.

**Rationale:** Siblings don't share code between api and web repos. The only shared artifact is the lexicon schema, and ATProto's lex-cli handles that via codegen. Adding a shared workspace package is premature complexity.

---

## Decision 4: Root tooling

**Decision:**
- **TypeScript:** Per-package `tsconfig.json`. API targets ES2022/commonjs (matching `open-social`). Web uses Vite's bundler resolution with project references. Landing uses Astro's built-in TS.
- **Lint:** ESLint 9 flat config per package. Web/landing use `typescript-eslint` + `react-hooks` + `react-refresh`. API uses `typescript-eslint` only.
- **Format:** Prettier 3 (matching all siblings).
- **Test:** Vitest 4 everywhere. API: `environment: 'node'`. Web: `environment: 'jsdom'` with `@testing-library/react`.
- **Node:** 22.x (current LTS; CI in siblings pins 20, but that's a year old — we go 22).
- **Package manager:** npm 10+.

**Rationale:** Direct match to sibling patterns. Node 22 is the one intentional upgrade from siblings' CI (which pins 20) — 22 is current LTS and we're starting fresh.

---

## Decision 5: Migration & env tooling

**Decision:**
- **Migrations:** Kysely `FileMigrationProvider` with sequential numeric prefixes (`001_`, `002_`, ...). Custom `scripts/migrate.ts` using tsx (matching `open-social` exactly).
- **Env validation:** `envalid` for required env vars, `dotenv` for loading. Matching both `collective-social-api` and `open-social`.
- **Logger:** Pino (matching `open-social`). Never `console.*`.

**Rationale:** Direct match to `open-social/scripts/migrate.ts` and `open-social/kysely.config.ts`. Sequential numeric keys already decided in `decisions.md`.

---

## Decision 6: CI strategy

**Decision:** GitHub Actions. One workflow per concern: `test.yml` (lint + unit tests), `deploy.yml` (build + deploy). Postgres service container for API integration tests (matching `open-social/.github/workflows/test.yml`).

**Rationale:** All siblings use GitHub Actions with the same pattern.

---

### 2026-05-09T10:26:27-07:00: Deployment topology
**By:** Brittany Ellich (via Squad)
**What:** Each project deploys separately.
- `api/` deploys to the **same server as the rest of the Collective apps** (alongside `collective-social-api` and `open-social`). Must share the OAuth/Postgres setup there. Wash mirrors `collective-social-api` and `open-social` deploy/db/OAuth conventions — same connection patterns, same env var conventions, same migration runner shape.
- `web/` deploys to **GitHub Pages** as a fully static SPA. Vite base path, GH Actions workflow, SPA routing fallback (404.html trick or hash routing) all required. Because web is fully static, **all dynamic concerns (sessions, OAuth callback handling) live in `api/`**. Web talks to api over HTTPS with `credentials: 'include'`.
- `landing/` deploys separately (Astro static). Target TBD by Inara — likely GH Pages or similar.
**Why:** Aligns with how Brittany already deploys the Collective ecosystem; lets crate.social piggyback on existing shared infrastructure.

### 2026-05-09T10:26:27-07:00: Git init bundled into work item #7
**By:** Brittany Ellich (via Squad)
**What:** Work item #7 (root config files) now also includes `git init` of the crate repo, initial commit of all current files (`plan.md`, `.squad/`, `.gitattributes`, the new root configs).
**Why:** Repo isn't initialized yet. Doing it as part of the scaffold keeps the first real commit clean and lets Scribe start committing memory updates from session two onward.

### 2026-05-09T10:26:27-07:00: OAuth scopes — mirror sibling pattern
**By:** Brittany Ellich (via Squad)
**What:** Wash uses **explicit scoped OAuth** matching how `collective-social-api` and `open-social` already do it. Mirror their scope strings, client metadata shape, and OAuth client config. Required scopes for crate.social:
- Write access for all `social.crate.*` record types to the user's PDS.
- Read access for external lexicons used in the catalog: `site.standard.*`, `community.lexicon.calendar.*`, `app.collective.*`, `app.bsky.feed.post`.
**Why:** Consistency with sibling Collective apps; explicit scopes are the right ATProto OAuth pattern; piggybacks on a config approach Brittany has already validated.

---

# ADR: Initial `social.crate.*` Lexicons

**Date:** 2026-05-09
**Author:** Simon (Lexicon Designer)
**Status:** Implemented — all 9 files authored and JSON-validated.

---

## Lexicon Inventory

### 1. `social.crate.rss.feed`
**Purpose:** A subscribed RSS/Atom feed with a configured destination lexicon for imported entries.
**Key fields:** `url` (uri, req), `title` (req), `destination` (NSID, req), `active` (bool), `lastPolledAt`, `lastEntryGuid`, `createdAt` (req).
**Shape calls:** `destination` uses `knownValues` rather than a closed enum so new target NSIDs can be added without a lexicon version bump. `lastEntryGuid` is a plain string (not typed) because RSS GUIDs are heterogeneous.

---

### 2. `social.crate.podcast.episode`
**Purpose:** An individual podcast episode, typically imported from an RSS feed.
**Key fields:** `title` (req), `audioUrl` (uri, req), `showName` (req), `publishedAt` (datetime, req), `feedRef` (at-uri), `guid`, `createdAt` (req).
**Shape calls:** Added `episodeUrl` (not in plan draft) for the canonical web page — feeds frequently include this and it's useful for deduplication and display. `duration` is integer seconds (not a formatted string) for easy arithmetic.

---

### 3. `social.crate.making.project`
**Purpose:** A unified making/build project record (fiber, code, site, garden, illustration-set, other).
**Key fields:** `title` (req), `kind` (knownValues, req), `status` (knownValues, req), `description` (markdown, req), `coverImage` (blob), `createdAt` (req).
**Shape calls:** Kind-specific metadata (`fiber`, `code`, `site`, `garden`) are optional nested objects rather than a union. This avoids requiring `$type` on each variant and keeps the record self-describing. The AppView filters by `kind` to decide which block to render. `links` array items only require `url` — `label` is optional to match real-world data where labels aren't always present.

---

### 4. `social.crate.making.update`
**Purpose:** A progress update or journal entry attached to a making project.
**Key fields:** `project` (at-uri, req), `body` (markdown, req), `photos` (array of blobs, max 10), `createdAt` (req).
**Shape calls:** Minimal by design — updates are sub-documents; the project record holds all metadata. Photos are blobs (not URLs) so they're owned by the user's PDS.

---

### 5. `social.crate.talk`
**Purpose:** A conference talk or presentation.
**Key fields:** `title` (req), `eventName` (req), `givenAt` (datetime, req), `eventRef` (at-uri, optional), `slidesUrl`, `videoUrl`, `coPresenters`, `createdAt` (req).
**Shape calls:** `coPresenters` items require `name` but make `did` optional — co-presenters may not be ATProto users. `eventRef` is an AT-URI to `community.lexicon.calendar.event`; this is a soft link (no verification), consistent with ATProto's approach to cross-lexicon references.

---

### 6. `social.crate.illustration`
**Purpose:** A stick-figure illustration or piece of artwork.
**Key fields:** `caption` (req — doubles as alt text), `image` (blob, req), `title` (optional), `topic`, `sourcePost` (at-uri), `createdAt` (req).
**Shape calls:** `caption` is required (not `title`) because it also serves as alt text for accessibility. `title` is optional since many illustrations are captioned but untitled. `image` accepts SVG in addition to raster formats.

---

### 7. `social.crate.note`
**Purpose:** A Zettelkasten-style PKM note; the backbone of the show-day demo.
**Key fields:** `title` (req), `slug` (req), `body` (markdown, req), `publishedAt` (datetime, req), `tags` (array), `updatedAt`, `createdAt` (req).
**Shape calls:** `slug` is required (not in all sibling lexicons) because stable URL routing on the personal site depends on it. `body` has a large cap (100k graphemes / 1 MB) to accommodate long-form Zettelkasten notes. `[[wikilink]]` syntax is stored raw in `body`; resolved links live as separate `social.crate.note.link` records — clean separation of content and graph.

---

### 8. `social.crate.note.link`
**Purpose:** A directed link from one note to any ATProto record or external URL — powers Zettelkasten backlinks and cross-lexicon connections.
**Key fields:** `source` (at-uri, req), `target` (object, req), `context` (surrounding sentence), `anchorText`, `createdAt` (req).
**Shape calls:**
- **`target` is a flat object, not an ATProto union.** A true union would require `$type` on every target record and a separate `#def` for each variant — over-engineered for a link that resolves at read time. The flat object (`{ atUri?, externalUrl?, title?, description? }`) matches the plan's intent and is simpler for the importer to produce. Constraint: exactly one of `atUri` / `externalUrl` must be set; enforced at the application layer.
- **`anchorText` added (not in plan).** Stores the raw `[[wikilink]]` phrase or visible link text so the AppView can render backlink previews without re-parsing the source note body.
- **`context` retained** (from plan) for rich backlink previews — the surrounding sentence gives readers enough signal to decide whether to click through.
- **Backlinks are computed, not stored.** To find all notes linking to a given target, the AppView queries all `social.crate.note.link` records across the firehose where `target.atUri` matches. This is federated by design — anyone on any PDS can create a link pointing at your note.

---

### 9. `social.crate.now`
**Purpose:** A "now" page entry describing current focus. Append-only stream — latest by `createdAt` is the live now page.
**Key fields:** `body` (markdown, req), `createdAt` (req).
**Shape calls:** Intentionally minimal — the append-only stream pattern means older records are archived automatically. No `updatedAt` because edits should be new records (preserves the history).

---

## Open Questions for Brittany / Mal

1. **`social.crate.rss.feed.destination` knownValues** — currently lists `social.crate.podcast.episode` and `site.standard.document`. Confirm the newsletter destination (Offprint's actual lexicon NSID) before the RSS importer ships.
2. **`social.crate.note` slug uniqueness** — the lexicon can't enforce uniqueness; that's an AppView concern. Wash needs a unique index on `(did, slug)` in Postgres.
3. **`social.crate.note.link` backlink federation** — the demo requires the AppView to subscribe to the firehose and index incoming link records. Confirm with Wash that the indexer will track `social.crate.note.link` records across all DIDs, not just the authenticated user's.
4. **`social.crate.making.project.coverImage` maxSize** — set to 2 MB matching sibling pattern. Fiber project photos can be larger; increase to 5 MB if needed.
5. **`social.crate.illustration.image` SVG acceptance** — SVG is included but some ATProto clients may not handle it. Flag for Kaylee to confirm the web renderer handles SVGs safely.

---

# ADR: Root Scaffold Non-Obvious Calls

**Date:** 2026-05-09
**Author:** Wash (Backend / API / OAuth)
**Status:** Accepted

---

## `.prettierrc` — chose `collective-social-api` over `open-social`

`open-social` has no `.prettierrc` at all. `collective-social-api` has a complete config (`semi: true, trailingComma: es5, singleQuote: true, printWidth: 80, tabWidth: 2, useTabs: false`). Used `collective-social-api` as canonical with no modifications. If `open-social` ever adds one and it differs, this is the decision point to revisit.

---

## `engines.node` set to `>=22` despite siblings not setting it

Neither `collective-social-api` nor `open-social` sets `engines.node` in their `package.json`. Added it here (`"node": ">=22"`) because:
1. We're deliberately departing from siblings' Node 20 CI — having an explicit engine constraint makes that visible to tools (npm, Volta, CI) without requiring everyone to read the docs.
2. Cost is zero; benefit is early error on misconfigured environments.

---

## `.gitignore` — merged and expanded both siblings

`collective-social-api` has a minimal three-liner; `open-social` is more complete. Used `open-social`'s as the base (more comprehensive is better for a new repo), added:
- `**/node_modules/` alongside `node_modules/` to catch sub-package installs
- `.astro/` for the landing package's Astro build cache
- `.next/` forward-compat (unlikely but cheap)
- `.env.local` and `.env.*.local` (Vite convention for local overrides not covered by siblings)

Explicitly confirmed `.squad/` is NOT excluded — team memory must be committed.

---

## Root `package.json` — no `npm run` for `importers` dev

No `dev:importers` script added because importers are batch/CLI tools, not a dev server. Only `test` delegates to importers (consistent with how sibling one-off scripts work).

---

## Acknowledged (no action taken): deployment and OAuth constraints for api/ work item #2

Per `.squad/decisions/inbox/` files read during this session:
- `api/` shares server/Postgres with `collective-social-api` and `open-social`
- `web/` is static (GH Pages) — all auth in `api/`
- OAuth scopes: write `social.crate.*`, read `site.standard.*` / `community.lexicon.calendar.*` / `app.collective.*` / `app.bsky.feed.post`

These constrain the api/ scaffold (work item #2) but required no action here.
