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

---

# ADR: Lexicon Codegen Pipeline

**Date:** 2026-05-09
**Author:** Simon (Lexicon Designer)
**Status:** Accepted

---

## Decision: One Bash script, not npm scripts in lexicons/package.json

**What:** Codegen lives in `lexicons/scripts/codegen.sh` (executable). The `lexicons/package.json` exists only to declare `@atproto/lex-cli` as a devDependency so `npx` resolves the local install. No `scripts` field is present in `lexicons/package.json`; the root delegates via `"lexgen": "./lexicons/scripts/codegen.sh"`.

**Why a .sh and not npm scripts:** The sibling `collective-social-api` handles lexgen with a single npm script (`lex gen-server ./src/lexicon ./lexicons/*`) because it has one output directory. Crate needs three separate invocations (gen-server → `api/src/lexicon/`, gen-api → `web/src/lexicon/`, gen-api → `importers/src/lexicon/`). A Bash script keeps all three invocations in one place, provides friendly stdout, and avoids chaining three npm scripts with `&&`. Matches the `set -euo pipefail` convention seen in sibling shell scripts (`open-social/scripts/reset-db.sh`, `open-social/scripts/start-test-env.sh`).

---

## lex-cli version: `^0.9.7`

**Source:** `collective-social-api/package.json` devDependencies. Lockfile resolves to `0.9.8`. Used `^0.9.7` (same constraint as sibling) for forward compatibility within the minor series. `open-social` has no lex-cli dependency (no lexicons of its own).

---

## Why generated outputs are committed

**Decision:** Generated `api/src/lexicon/`, `web/src/lexicon/`, and `importers/src/lexicon/` directories are committed to the repo.

**Rationale:** Mal's explicit call (see decisions.md, Decision 3). Committing generated types means consumers can import from their local `src/lexicon/` without a build step and CI can detect drift (if lexicons change but codegen isn't re-run, the diff is visible). The sibling `collective-social-api` also commits its `src/lexicon/` output.

---

## Non-obvious implementation calls

- **`find … | sort` + `mapfile -t`** instead of a shell glob: Lexicons live in nested subdirectories (`social/crate/note/link.json`, `social/crate/making/project.json`, etc.). A bare `social/crate/**/*.json` glob requires `shopt -s globstar` and is not portable under `set -euo pipefail` when a pattern matches nothing. `find` + `sort` + `mapfile` is explicit, safe, and produces a stable argument order.
- **`cd "$LEXICONS_DIR"` before `npx`**: `npx @atproto/lex-cli` resolves the package from the nearest `node_modules` in the directory hierarchy. Running from `lexicons/` ensures it picks up `lexicons/node_modules/@atproto/lex-cli` after `npm install` there, without any `--prefix` magic.
- **Output dirs as absolute paths**: Because the script `cd`s to `lexicons/`, all output directory arguments are computed as absolute paths from `$REPO_ROOT` before the `cd`, preventing any relative-path confusion.
- **`mkdir -p` before codegen**: `api/`, `web/`, `importers/` are being scaffolded in parallel (Wash, Kaylee, Zoe). The script creates `src/lexicon/` inside each if it doesn't exist, so it is runnable on a fresh clone once those packages are present.
- **Coordination note for parallel scaffolders**: Each of `api/`, `web/`, `importers/` should include `src/lexicon/` in their file tree (perhaps with a `.gitkeep`) so the empty dir survives in git until first codegen run. Do NOT add it to `.gitignore` — outputs are committed per Mal's decision.

---

### 2026-05-09T10:46:32-07:00: api/ scaffold — Wash work item #2
**By:** Wash (Backend / API / OAuth)
**Status:** Done

---

## Primary sibling mirrored: `open-social`

**Why open-social over collective-social-api:**
- `open-social` uses Pino (collective does not)
- `open-social` has `migrations/` + `FileMigrationProvider` (collective uses a different schema management approach)
- `open-social` uses `tsx watch` for dev (collective uses `ts-node` + nodemon)
- `open-social` targets ES2022 (collective targets ES2020; decisions.md #4 mandates ES2022)
- `open-social` has a cleaner `auth/client.ts` + `auth/storage.ts` pattern for `@atproto/oauth-client-node`
- Both are equivalent for Express 5, Kysely, pg, iron-session, envalid, cors, helmet

---

## OAuth scope string (verbatim)

```
atproto repo:social.crate.rss.feed repo:social.crate.podcast.episode repo:social.crate.making.project repo:social.crate.making.update repo:social.crate.talk repo:social.crate.illustration repo:social.crate.note repo:social.crate.note.link repo:social.crate.now
```

**Pattern source:** `open-social/src/middleware/auth.ts`
```ts
export const OPENSOCIAL_SCOPES = 'atproto repo:community.opensocial.membership';
```

**Read-only external collections** (`site.standard.*`, `community.lexicon.calendar.*`, `app.collective.*`, `app.bsky.feed.post`) are NOT in the scope string. Public ATProto records are readable without OAuth. If crate needs to read the *authed user's own* records in those namespaces via authenticated PDS XRPC, add them as additional `repo:` scopes at that time.

---

## Env var names chosen (matching siblings exactly)

| Var | Purpose | Source |
|-----|---------|--------|
| `DATABASE_URL` | Postgres connection string | both siblings |
| `PORT` | HTTP server port | both siblings |
| `NODE_ENV` | development / production | both siblings |
| `LOG_LEVEL` | Pino log level | open-social |
| `SERVICE_URL` | API's public URL (OAuth client_id base) | both siblings |
| `PLC_URL` | ATProto PLC directory URL | both siblings |
| `PDS_URL` | Default PDS for handle resolution | both siblings |
| `PRIVATE_KEYS` | JSON array of JWK private keys | both siblings |
| `COOKIE_SECRET` | iron-session cookie secret | both siblings |
| `CORS_ORIGIN` | Allowed web origin (GH Pages in prod) | both siblings |

---

## Key dependency versions

| Package | Version | Source |
|---------|---------|--------|
| `express` | ^5.2.1 | open-social |
| `@atproto/api` | ^0.18.3 | collective-social-api (newer) |
| `@atproto/oauth-client-node` | ^0.3.13 | open-social |
| `kysely` | ^0.28.8 | both |
| `pg` | ^8.16.3 | both |
| `pino` | ^9.5.0 | open-social |
| `pino-pretty` | ^11.3.0 | open-social |
| `iron-session` | ^8.0.4 | both |
| `envalid` | ^8.1.1 | collective-social-api |
| `helmet` | ^8.1.0 | collective-social-api |
| `tsx` | ^4.21.0 | open-social |
| `typescript` | ^5.9.3 | both |
| `vitest` | ^4.0.18 | both |
| `node` (Docker) | 22-alpine | open-social |
| `postgres` (Docker) | 16 | open-social |

---

## Flags for Brittany / Mal to review

1. **`@atproto/api` version mismatch:** open-social uses `^0.13.35`, collective-social-api uses `^0.18.3`. Chose collective's newer version. Verify no breaking changes before installing.

2. **Read scopes not in OAuth metadata:** The external read collections (`site.standard.*`, `community.lexicon.calendar.*`, `app.collective.*`, `app.bsky.feed.post`) are not listed as `repo:` scopes since ATProto public records don't require OAuth. If crate needs authenticated PDS access to those collections for the authed user, we'll need to add them.

3. **`app.collective.*` NSID unverified:** plan.md flags this as "verify". The scope string uses only the 9 confirmed `social.crate.*` NSIDs. Once the Collective NSID is confirmed, consider adding `repo:app.collective.<record>` if crate writes RSVP-style records there.

4. **eslint.config.js:** Neither sibling ships an `eslint.config.js` flat config. Created a minimal `typescript-eslint` config; add `eslint` and `typescript-eslint` to devDependencies when installing.

---

# ADR: web/ Scaffold Decisions

**Date:** 2026-05-09
**Author:** Kaylee (Web App)
**Status:** Accepted

---

## Primary sibling pattern chosen: `collective-social-web`

`collective-social-web` is the richer reference: it has the full Chakra v3 provider stack (ChakraProvider + ColorModeProvider + next-themes), detailed semantic token naming, named exports throughout, and a vitest + testing-library setup. `open-social-web` was consulted for its API client shape (`api.get / post / put / del`) and its standalone `vitest.config.ts`. Both use identical GH Pages deploy workflows.

---

## Chakra v3 setup

- `src/theme.ts` exports `system = createSystem(defaultConfig, customConfig)` where `customConfig = defineConfig({...})`.
- `colorPalette: 'teal'` throughout (Chakra v3 `colorPalette`, NOT `colorScheme`).
- Provider stack in `main.tsx`: `<ChakraProvider value={system}> → <ColorModeProvider> → <RouterProvider>`.
- `ColorModeProvider` wraps next-themes `<ThemeProvider attribute="class" disableTransitionOnChange>`.
- Semantic tokens follow the `bg.*` / `fg.*` / `accent.*` / `border.*` pattern from siblings, tinted teal instead of terracotta/amber.
- Global CSS in `defineConfig({ globalCss: {...} })`.

---

## API client shape

Exported as `apiFetch` from `src/lib/api.ts`:

```ts
export const apiFetch = {
  get:   <T>(path: string) => request<T>(path),
  post:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', ... }),
  put:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', ... }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', ... }),
  del:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', ... }),
}
```

Conventions:
- Base: `import.meta.env.VITE_API_URL` (empty in dev → Vite proxy).
- Every request: `credentials: 'include'`.
- Non-2xx: parse JSON body, surface `error + details`, throw `new Error(message)`.
- `patch` added vs. open-social-web's `api` shape (useful for partial record updates).

---

## Base path strategy

- Env var: `VITE_BASE_PATH` (string, e.g. `/crate/` or `/`).
- Read in `vite.config.ts` via `process.env.VITE_BASE_PATH ?? '/'`.
- Passed to Vite `base` option → available as `import.meta.env.BASE_URL` at runtime.
- `createBrowserRouter` receives `basename: import.meta.env.BASE_URL` so React Router prefixes all links correctly.
- Set `VITE_BASE_PATH=/crate/` in the GitHub Actions repository variable when deploying to `brittanyellich.github.io/crate`.
- Leave as `/` once the custom domain `crate.social` is pointed at GitHub Pages.

---

## SPA routing fallback

Chose the full **spa-github-pages redirect trick** (rafgraph) rather than the sibling `cp dist/index.html dist/404.html` shortcut, because the path-encoding approach handles the configurable base path more robustly.

- `public/404.html`: encodes current URL as query-string and redirects to `index.html`.
  - `pathSegmentsToKeep = 0` for custom domain; set to `1` for repo subdirectory.
- `index.html`: decoder script runs before React boots, restores the URL via `history.replaceState`.

---

## Deploy workflow

File: `.github/workflows/deploy-web.yml`

- Trigger: `push` to `main` with `paths: web/**`, plus `workflow_dispatch`.
- Concurrency: `cancel-in-progress: true` (pages group).
- Node 22 (upgrade from siblings' Node 20, per Decision 4 in decisions.md).
- `npm ci --prefix web` + `npm run build --prefix web`.
- `VITE_BASE_PATH` and `VITE_API_URL` injected from GitHub repository variables (`vars.*`) with sensible defaults.
- `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` — identical to both sibling workflows.

---

# Decision: Landing Site Scaffold — Astro 5, Tailwind 4, GitHub Pages

**Date:** 2026-05-09
**By:** Inara (Landing Site)
**Status:** Implemented
**Work Item:** #4 — Scaffold landing/

---

## Decision: Deploy target is GitHub Pages

**What:** The `landing/` directory deploys to GitHub Pages via GitHub Actions. Workflow file at `.github/workflows/deploy-landing.yml`.

**Rationale:**
- Both sibling repos (`collective-landing`, `open-landing`) use GitHub Pages for landing sites.
- Matches the pattern established in the Collective ecosystem.
- Minimal setup — no 3rd party account needed.
- Static Astro output (no backend required) is a perfect fit for GH Pages.

**Implementation:**
- Workflow triggers on push to `main` and on workflow dispatch.
- Builds `landing/dist` artifact.
- Actions: `actions/checkout@v4`, `actions/setup-node@v4` (node 22), `npm ci --prefix landing`, `npm --prefix landing run build`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- Node 22 (consistent with root decisions.md Decision 4).

---

## Related: Astro 5 + Tailwind 4 stack

**Astro version:** 5.15.6 (matching siblings).

**Styling:** Tailwind CSS 4.1.8 with @tailwindcss/vite plugin (matching collective-landing's approach, not separate postcss + tailwind plugin — vite plugin is the newer pattern).

**Why Tailwind 4 vite plugin over classic tailwindcss?**
- Astro 5 + Tailwind 4 recommends the vite plugin approach for better bundling and DX.
- Smaller output, faster build.
- Consistent with collective-landing's current setup.

---

## Site URL and metadata

**Site URL:** `https://crate.social` (placeholder; Brittany to confirm domain).

**OG image:** `/og.png` placeholder in meta tags. Brittany to upload actual image to `landing/public/og.png`.

---

## Open questions for Brittany

1. **Domain name:** Is crate.social final, or should we update the site URL in `astro.config.mjs`?
2. **Marketing copy tone:** The placeholder is technical and confident. Should it be more approachable? More "product-y"?
3. **Additional pages:** Does the landing need docs, pricing, features breakdown beyond the homepage? (Can be added incrementally.)
4. **Favicon:** The placeholder is a simple "C" in blue. Preferred branding?
5. **OG image:** Should we create a simple graphic, or leave it for Brittany to provide?

---

# ADR: importers/ harness scaffold

**Date:** 2026-05-09
**Author:** Zoe (Import Adapters)
**Status:** Accepted — harness only; adapters pending
**Work Item:** #5

---

## What was built

`importers/` — a standalone CLI package (independent `package.json`, no workspace linking per Decision 2) providing a Commander-based harness for one-time content imports into crate.social. No adapters implemented; each subcommand is a stub.

---

## Decision: CLI framework — commander v12

**Chosen:** `commander` (^12.1.0)

**Alternatives considered:**
- `yargs` — more feature-rich but heavier; API is more verbose for this use case.
- Plain argv parsing — inappropriate given multiple subcommands with per-command flags.

**Rationale:** No sibling repo uses either framework in scripts (they use plain `tsx` for one-off scripts). Commander was chosen for its TypeScript-first API, minimal overhead, and industry adoption. Revisit if we add many nested subcommands (yargs shines there).

---

## Decision: Package type — ESM (`"type": "module"`)

`importers/` uses `"type": "module"` to align with modern Node 22 conventions. The `api/` package will likely use CommonJS (matching `open-social`). These are independent packages — no conflict.

---

## Decision: Logger — Pino (duplicated from open-social)

Pino `^9.5.0` + `pino-pretty ^11.3.0`, mirroring `open-social/src/lib/logger.ts` exactly. Not imported from `api/` — packages are independent per Decision 2. `console.*` is prohibited per team convention.

---

## Open question #1 — Authentication strategy (NEEDS DECISION before first real adapter)

**The question:** How does the CLI obtain a write-capable ATProto session?

**Option A — Token file** (`~/.crate/session.json`):
User exports a session JSON from the crate.social web app. Importer reads it, calls `agent.resumeSession()`. Simple, zero CLI dependencies. **Risk:** access tokens expire (typically 2h); user must re-export. Refresh tokens last longer but require `agent.resumeSession` + auto-refresh plumbing.

**Option B — Interactive ATProto OAuth from CLI**:
Use `@atproto/oauth-client-node` to initiate a DPoP-based OAuth flow directly from the terminal (opens browser, waits for callback, stores tokens in `~/.crate/tokens.json`). Tokens auto-refresh. **Risk:** more setup complexity; requires a registered OAuth client for the CLI (different `client_id` from the web app).

**Recommendation:** Start with Option A (token file). It unblocks the first adapter immediately. Upgrade to Option B once the web OAuth flow is stable and a CLI client ID is registered.

**Brittany's decision needed:** Which option for v1? Should the token file live at `~/.crate/session.json` or in the working directory?

---

## Open question #2 — Idempotency strategy (NEEDS DECISION before first real adapter)

**The question:** How do we prevent re-importing the same item if the CLI is run twice?

**Option A — Local sidecar file** (`.import-state.json` in working dir):
Hash the source item's stable ID (RSS GUID, markdown file path + slug), store `{ hash → atUri }` in a gitignored JSON file. **Fast, offline, zero-network.** Risk: machine-local; lost if you change machines or wipe the directory.

**Option B — Query the user's PDS**:
Before writing, list existing records of the target lexicon and check for a matching source identifier (e.g. `guid` field on `social.crate.podcast.episode`). **Authoritative, survives machine changes.** Cost: one extra `com.atproto.repo.listRecords` call per import run.

**Recommendation:** Use both: Option A as a fast-path cache, Option B on cache miss. But for v1, Option A alone is sufficient.

**Brittany's decision needed:** Is a machine-local state file acceptable for v1? Which directory should it live in?

---

## Key dependency versions

| Package | Version | Purpose |
|---|---|---|
| `commander` | ^12.1.0 | CLI framework |
| `@atproto/api` | ^0.13.35 | PDS writes (matched open-social) |
| `pino` | ^9.5.0 | Logging (matched open-social) |
| `pino-pretty` | ^11.3.0 | Dev log formatting |
| `zod` | ^4.3.6 | Record validation (matched open-social) |
| `tsx` | ^4.19.2 | Dev runner (matched open-social scripts) |
| `vitest` | ^2.1.8 | Tests (matched team Decision 4) |

---

## api/ vs importers/ split

`importers/` = one-time CLI runs. `api/workers/` = background polling (Wash's). Adapter parsing logic may eventually be shared, but the execution contexts are fundamentally different (CLI process vs. long-lived server). Shared adapter library should wait until both sides exist and the common interface is clear.
### 2026-05-09T11:10:23-07:00: Namespace correction — Collective lexicons
**By:** Simon (verified) → Brittany Ellich (via Squad)
**What:** The Collective ecosystem's lexicons live under `app.collectivesocial.*`, NOT `app.collective.*` as previously written in plan.md and earlier directives.
- Source: `/Users/brittanyellich/Documents/Code/Collective/collective-social-api/lexicons/`
- The "book" lexicon Brittany asked about: **`app.collectivesocial.list`** with `purpose: "book-club"` (paired with `app.collectivesocial.listitem` for entries). It's a generic list with a purpose discriminator, not a dedicated book record.
- 21 total NSIDs in the namespace (catalogued in plan.md footnote and `simon-collective-nsids-verified.md`).
**Why:** Verified by Simon during the P0 NSID audit. plan.md updated with the verified catalog and a footnote pointer. No `social.crate.*` updates needed — the `social.crate.note.link.target` flat shape can reference any AT-URI, including `app.collectivesocial.list` records.
**Note:** Same approach (look in `/Users/brittanyellich/Documents/Code/Collective/open-social/lexicons/`) for open-social cross-references when they come up.
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
### 2026-05-09T11:10:23-07:00: Importer auth + idempotency strategy (P1)
**By:** Brittany Ellich (via Squad)
**What:** Zoe's recommendations accepted for v1 of the import CLI:
- **Auth:** User exports a session JSON from the web app to `~/.crate/session.json`; CLI reads it. Tokens expire ~2h; user re-exports as needed. Upgrade to interactive OAuth via `@atproto/oauth-client-node` once web OAuth flow is stable.
- **Idempotency:** Local `.import-state.json` sidecar — hash of source URL + content → atUri. Zero-network. PDS `listRecords` query as fallback on cache miss for cross-machine recovery.
**Why:** Both v1 strategies are simple, ship-able, and have clear upgrade paths. Defer the more robust options until the simple version reveals real friction.
### 2026-05-09T10:26:27-07:00: OAuth scopes — mirror sibling pattern
**By:** Brittany Ellich (via Squad)
**What:** Wash uses **explicit scoped OAuth** matching how `collective-social-api` and `open-social` already do it. Mirror their scope strings, client metadata shape, and OAuth client config. Required scopes for crate.social:
- Write access for all `social.crate.*` record types to the user's PDS.
- Read access for external lexicons used in the catalog: `site.standard.*`, `community.lexicon.calendar.*`, `app.collective.*`, `app.bsky.feed.post`.
**Why:** Consistency with sibling Collective apps; explicit scopes are the right ATProto OAuth pattern; piggybacks on a config approach Brittany has already validated.
### 2026-05-09T11:10:23-07:00: P0 resolutions accepted
**By:** Brittany Ellich (via Squad)
**What:** Three P0 questions resolved:
1. Wash's choice to mirror `open-social` (Pino, FileMigrationProvider, ES2022) over `collective-social-api` is accepted. Open-social has the closer ATProto-OAuth pattern.
2. Write-only OAuth scopes are accepted. Public ATProto reads don't require explicit scopes; keep the current scope string (9 `repo:social.crate.*` write scopes).
3. `app.collective.*` lexicons are real — defined in `collective-social-api/lexicons/`. Simon will verify the actual NSIDs from that repo and update plan.md's catalog footnote with the verified values. Same approach for open-social cross-references when they show up.
**Why:** Brittany confirmed Wash's calls were defensible; surfaced where the Collective lexicons actually live.
# Mal Scaffold Review — 2026-05-09

**Verdict:** APPROVE WITH FIXES

4 blocking flags. Fix these before functional feature work begins.

---

## 🚩 Blocking Flags

### 1. Dev port mismatch: Vite proxy → 3002, api runs on 3000
**Owner:** Kaylee (primary) + Wash (verify api port)
**Files:** `web/vite.config.ts` lines 23–27, `api/src/config.ts` line 18
**Issue:** `vite.config.ts` proxies `/oauth`, `/login`, `/logout`, `/.well-known`, `/xrpc` to `http://127.0.0.1:3002`. The api's `PORT` default is `3000`. Local dev proxy hits nothing.
**Fix:** Change proxy target in `web/vite.config.ts` to `http://127.0.0.1:3000`, OR change api default `PORT` to `3002` and update config docs. Pick one and be consistent.

---

### 2. CORS dev whitelist hardcodes port 5173; Vite dev server is on port 5175
**Owner:** Wash
**Files:** `api/src/index.ts` line 23, `web/vite.config.ts` line 21
**Issue:** `api/src/index.ts` allows CORS from `http://127.0.0.1:5173` / `http://localhost:5173`. Vite dev server binds to port `5175`. All credentialed requests from web → api will be CORS-rejected in local dev.
**Fix:** Change the two dev CORS origins in `api/src/index.ts` to port `5175`, OR drive the allowed origin from an env var (`CORS_ORIGIN` already exists in config) and document the dev default.

---

### 3. `importers/@atproto/api` version gap: `^0.13.35` vs api's `^0.18.3`
**Owner:** Zoe
**File:** `importers/package.json` line 18
**Issue:** Five minor versions behind. `@atproto/lex-cli gen-api` output is generated against the installed `@atproto/api` type surface. If the codegen emits types that reference APIs added in 0.14–0.18, the TypeScript build fails. Also inconsistent with the rest of the ecosystem.
**Fix:** Bump to `"@atproto/api": "^0.18.3"` to match api. Run `npm install` in `importers/` after.

---

### 4. Both deploy workflows target the same `github-pages` environment
**Owner:** Kaylee + Inara
**Files:** `.github/workflows/deploy-web.yml`, `.github/workflows/deploy-landing.yml`
**Issue:** Both use `actions/deploy-pages@v4` against the `github-pages` environment. GitHub Pages hosts one site per repo. Whichever workflow runs second overwrites the first deployment. Landing and web app cannot coexist this way.
**Fix:** Decide topology. Options:
  - (A) Landing stays on GitHub Pages (`crate.social`); web app deploys elsewhere (Railway, Fly, Render, separate repo + Pages).
  - (B) Merge into one Pages deployment: Astro builds into a subdirectory, Vite builds into another. One workflow, one upload.
  - (C) Use GitHub Pages path prefixes (landing at `/`, web at `/app/`) with `VITE_BASE_PATH=/app/`.
  Brittany decides. Coordinator should surface this as a topology question before CI work proceeds.

---

## ✅ Approved (no action needed)

- **lexicons/scripts/codegen.sh + lexicons/package.json (Simon):** Clean. Output paths match all three consumers. Error handling correct.
- **api/ scaffold (Wash):** Express 5, Kysely, Pino, iron-session, envalid — all correct per decisions.md. OAuth client metadata, scope string (9 write scopes), CORS `credentials: true` all good. Boot path solid. ES2022/commonjs tsconfig matches open-social.
- **web/src/lib/api.ts (Kaylee):** `credentials: 'include'` on every request ✅. `VITE_API_URL` env wiring ✅. No SSR/Node APIs in web/src ✅. Fully static via Vite.
- **web/ tsconfig + package.json (Kaylee):** Internally consistent. Vitest 4, React 19, Chakra v3 ✅.
- **landing/ (Inara):** Astro 5 + Tailwind 4, `output` defaults to `static` ✅, `site: https://crate.social` set.
- **importers/ structure (Zoe):** ESM module, tsx CLI, session-file auth strategy per coordinator decision ✅. Lexicon dir at `src/lexicon/` matches codegen output path.
- **Root package.json + .nvmrc + .prettierrc (Wash):** npm 10, Node 22, convenience scripts correct. Prettier 3.

---

## 🟡 Non-Blocking Notes

1. **`api/package.json` `lexgen` script** (`"lex gen-server ./src/lexicon ./lexicons/*"`) — `./lexicons/` doesn't exist relative to `api/`. This script would fail if run in isolation. The root `npm run lexgen` → `codegen.sh` is the correct path; the api-level script is vestigial. (Wash — low priority cleanup)
2. **`importers` vitest `^2.1.8`** — rest of the project uses Vitest 4. Won't break builds but inconsistent. (Zoe — bump when convenient)
3. **`deploy-landing.yml` missing `cache-dependency-path: landing/package-lock.json`** — cache will be a no-op for the landing build. Minor CI perf issue. (Inara)
# Collective NSIDs Verified

**Date:** 2026-05-09  
**By:** Simon (Lexicon Designer)  
**Status:** Verified and documented  

## Summary

Brittany asked Simon to verify the actual NSIDs of Collective's lexicons (specifically the "book" NSID) from the `collective-social-api` repository. All `app.collectivesocial.*` NSIDs have been cataloged and verified.

**Key finding:** The Collective app uses **`app.collectivesocial.*`** namespace, NOT `app.collective.*`. There is no separate `app.collective.book` NSID; instead, books are represented as Collective *lists* with `purpose: "book-club"`.

## Verified NSIDs for note-to-Collective linking

| NSID | Type | Purpose |
|------|------|---------|
| `app.collectivesocial.list` | record | Shared lists (including book clubs); has `purpose: "book-club"` enum value |
| `app.collectivesocial.listitem` | record | Items within lists |

The `app.collectivesocial.list` record is the primary target for notes that reference Collective books/lists.

## Complete NSID Catalog

All verified NSIDs extracted from `/Users/brittanyellich/Documents/Code/Collective/collective-social-api/lexicons/`:

### User-scoped (personal lists & items)
- `app.collectivesocial.list` — user's personal lists
- `app.collectivesocial.listitem` — items in user's lists

### Group/Community lists & activity
- `app.collectivesocial.group.list` — shared list owned by a group
- `app.collectivesocial.group.listitem` — item in a group list
- `app.collectivesocial.group.listitem.status` — status updates for group list items
- `app.collectivesocial.group.post` — group post
- `app.collectivesocial.group.postindex` — group post index
- `app.collectivesocial.group.reaction` — reaction to group posts
- `app.collectivesocial.group.segment` — reading/watching segments (chapters, pages, etc.)
- `app.collectivesocial.group.segment.progress` — progress tracking for segments

### Feed-scoped activity (activity feed events)
- `app.collectivesocial.feed.list` — activity event: list created/updated
- `app.collectivesocial.feed.listitem` — activity event: item added to list
- `app.collectivesocial.feed.comment` — comment on a list item
- `app.collectivesocial.feed.completion` — activity event: user completed a list/item
- `app.collectivesocial.feed.goal` — activity event: reading/watching goal set
- `app.collectivesocial.feed.grouppost` — activity event: group post made
- `app.collectivesocial.feed.react` — activity event: user reacted to something
- `app.collectivesocial.feed.review` — activity event: user posted a review
- `app.collectivesocial.feed.reviewsegment` — review tied to a specific segment
- `app.collectivesocial.feed.segmentprogress` — activity event: progress on segment reported
- `app.collectivesocial.feed.useritem` — activity event: user action on list item

## Social.crate.* Impact

**Cross-reference check:** Do any `social.crate.*` lexicons need updates due to this discovery?

**Answer:** NO. The `social.crate.note.link` record's `target` object is flexible enough to reference Collective records without schema changes:

```json
"target": {
  "type": "object",
  "properties": {
    "atUri": {
      "type": "string",
      "format": "at-uri",
      "description": "AT-URI of the target record when the link resolves to an ATProto resource."
    },
    "externalUrl": {
      "type": "string",
      "format": "uri",
      "description": "External URL when the target is outside the AT network..."
    },
    "title": { ... },
    "description": { ... }
  }
}
```

Notes can link to Collective lists via `target.atUri` set to an AT-URI of an `app.collectivesocial.list` record. The design is intentionally flexible for exactly this use case.

## Plan.md Updates

**Updated:** `plan.md` now documents the verified NSIDs:
1. Removed "(verify)" placeholder from the external lexicons table
2. Added specific entries for `app.collectivesocial.list` and `app.collectivesocial.listitem`
3. Added footnote [1] documenting the complete verified NSID catalog and source path

## Future reference

When implementing note-to-book linking or Collective integrations:
- **Primary target NSID:** `app.collectivesocial.list` (book clubs are lists with `purpose: "book-club"`)
- **Source:** `/Users/brittanyellich/Documents/Code/Collective/collective-social-api/lexicons/`
- **Note:** The `app.collectivesocial.group.list` is for group/community-owned lists; `app.collectivesocial.list` is for user-owned lists.

## Namespace clarification

It is easy to confuse:
- `app.collectivesocial.*` ✅ (the ACTUAL namespace used in collective-social-api)
- `app.collective.*` ❌ (NOT used; this was Brittany's original placeholder question)
- `pub.collective.*` ❌ (not found)

The `app.collectivesocial` namespace mirrors Bluesky's `app.bsky.*` pattern and is the authoritative location for all Collective lexicons.
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
