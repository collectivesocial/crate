# History

## Project seed (2026-05-09)

**Project:** crate.social — a custom-lexicon publishing service for ATProto.

**Vision:** Define structured record types (`social.crate.*` lexicons) for the things you make, import from any source (RSS, markdown, manual entry), publish to your PDS, query from anywhere.

**User:** Brittany Ellich (@brittanyellich)

**Repo:** `/Users/brittanyellich/Documents/Code/Collective/crate`

**Layout:** `api/`, `web/`, `landing/`, `lexicons/`, `importers/` — all top-level in this repo.

**Stack:**
- TypeScript end-to-end
- Backend: Hono/Express + Postgres + Kysely
- Web: React 19 + Vite + Chakra UI v3
- Landing: Astro
- ATProto: `@atproto/api`, `@atproto/lexicon`

**Sibling repos in the workspace** (mirror their conventions):
`collective-social-api`, `collective-social-web`, `open-social`, `open-social-web`, `collective-landing`, `open-landing`, `collective-social-docs`, `atproto-devnet`.

**Conventions to honor:**
- `getSessionAgent`, `SESSION_OPTIONS`, `handler()` async wrapper
- `ctx.logger` (Pino) — never `console.*`
- Kysely typed queries, sequential migration keys
- Named exports (no default exports)
- Chakra v3: `Dialog` (not `Modal`), `open` (not `isOpen`), `colorPalette` (not `colorScheme`)
- `credentials: 'include'` on all fetches
- Teal primary color, `react-icons/lu`

**Show-day demo:** Zettelkasten-style notes app — `social.crate.note` records with bidirectional `[[wikilinks]]` and a backlinks visualization, all stored on the user's PDS.

**Authoritative source:** `plan.md` at the repo root. Read it before starting real work.

## Learnings

- 2026-05-09: Mal proposed initial scaffold (see decisions.md, decisions 1–6). Your work item: #4 — migrations & PDS integration layer.
- 2026-05-09: Lexicons exist at `lexicons/social/crate/` (9 records: rss.feed, podcast.episode, making.project, making.update, talk, illustration, note, note.link, now). Root configs + git init done. See `.squad/decisions.md` for deploy topology and OAuth scope directives — read before your scaffold work. Simon flagged 3 open questions (see `.squad/orchestration-log/2026-05-09T10-26-27-simon-item-1.md`).
- 2026-05-09: Work item #5 complete — `importers/` harness scaffolded (see `.squad/decisions/inbox/zoe-importers-scaffold.md`).

## Learnings — Work Item #5 (importers/ harness)

**CLI framework chosen: `commander` v12.**
No sibling repo uses commander or yargs in their scripts (scripts are plain tsx files). Commander was chosen as the most widely-adopted Node CLI framework with strong TypeScript support. Yargs was the alternative; commander won on API clarity.

**Auth strategy punted.**
Two options on the table: (A) token file (`~/.crate/session.json`) exported from the web app — simple but expires; (B) interactive ATProto OAuth from CLI via `@atproto/oauth-client-node` — robust but complex. Decision deferred to Brittany. See `src/shared/auth.ts` for the full TODO.

**Idempotency strategy punted.**
Two options: (A) local sidecar `.import-state.json` keyed by content hash — fast, offline, but machine-local; (B) query the user's PDS for existing records before writing — authoritative, survives machine changes, costs one extra XRPC call per run. Decision deferred to Brittany. Both can coexist (A as cache, B as fallback). See `src/shared/idempotency.ts`.

**api/ vs importers/ split rationale.**
`importers/` is for one-time CLI imports (manual runs, bulk backfills). Continuous background polling (RSS every N minutes) lives in `api/workers/` (Wash's territory). Adapter logic (parsing RSS/markdown) may eventually be shared — but execution context differs fundamentally: CLI process vs. long-running server worker. Shared adapter code should wait until both sides exist.

## Learnings

- 2026-05-09: Bumped @atproto/api to ^0.18.3 and vitest to ^4.1.5 to match the rest of the repo.
