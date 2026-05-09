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

- 2026-05-09: Fixed CORS dev allowlist to include port 5175 (web's vite bind port). Also removed redundant lexgen script from api/package.json.

- 2026-05-09: Mal proposed initial scaffold (see decisions.md, decisions 1–6). Your work items: #2 — web package setup & Vite integration; #7 — landing package & Astro integration.

- 2026-05-09 (work item #7 — root scaffold): Surveyed both sibling repos for formatting and gitignore conventions. `collective-social-api` has a full `.prettierrc` (`semi: true, trailingComma: es5, singleQuote: true, printWidth: 80, tabWidth: 2, useTabs: false`); `open-social` has no prettier config at all. Chose `collective-social-api`'s config as the canonical one. For gitignore, `collective-social-api` has a minimal three-liner (`*node_modules*`, `.env`, `dist/`), while `open-social` is more comprehensive (`node_modules/`, `dist/`, `.env`, `*.log`, `.DS_Store`, `db-backups/`, `.vscode/`, `coverage/`). Merged both, adding monorepo-aware `**/node_modules/` glob and frontend build dirs (`.next/`, `.astro/`), and explicitly did NOT ignore `.squad/`. Neither sibling has an `.nvmrc` (both repos appear to use Node 20 based on decisions.md context); crate departs intentionally to Node 22 LTS per Mal's call. On deployment/OAuth context for future `api/` work: `api/` deploys alongside `collective-social-api` and `open-social` on the same server, sharing OAuth/Postgres setup; `web/` is fully static (GH Pages) so all dynamic auth lives in `api/`; OAuth uses explicit scopes mirroring siblings (write `social.crate.*`, read `site.standard.*` / `community.lexicon.calendar.*` / `app.collective.*` / `app.bsky.feed.post`). Do not act on these yet — they are constraints for work item #2 (api/ scaffold).

- 2026-05-09 (work item #2 — api/ scaffold): **Primary mirror: `open-social`.** Both siblings use Express 5 + Kysely + pg + Pino + `@atproto/oauth-client-node` + iron-session. Key patterns confirmed: (1) **OAuth scope string** — sibling uses `'atproto repo:<collection>'` space-separated NSIDs (see `open-social/src/middleware/auth.ts` → `OPENSOCIAL_SCOPES = 'atproto repo:community.opensocial.membership'`). Crate's scope covers all 9 `social.crate.*` write NSIDs with the same format. External read collections (site.standard.*, etc.) are public and don't require `repo:` OAuth scopes; public ATProto records are readable without OAuth. (2) **Migration runner** — `open-social/scripts/migrate.ts` uses Kysely `FileMigrationProvider` with `up/down/status` commands driven by `process.argv[2]`; migrations live in `migrations/` with `up(db)/down(db)` exports matching Kysely's `MigrationProvider` interface. (3) **Pino setup** — `pino()` with `pino-pretty` transport in dev (`colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname'`); in production, structured JSON with no transport. Logger is a module-level singleton; child loggers via `logger.child(context)`. (4) **Env var naming** — both siblings use `DATABASE_URL`, `PORT`, `NODE_ENV`, `LOG_LEVEL`, `SERVICE_URL` (OAuth public URL; not `OAUTH_PUBLIC_URL`), `CORS_ORIGIN` (not `WEB_ORIGIN`), `PLC_URL`, `PDS_URL`, `PRIVATE_KEYS`, `COOKIE_SECRET`. Crate mirrors all of these exactly. (5) **`collective-social-api` divergence** — does NOT use Pino (uses custom logger), does NOT have a `migrations/` folder (schema managed differently), uses `ts-node` for dev (not `tsx`), and targets ES2020 (not ES2022). `open-social` is the closer match for our stack and was chosen as primary reference.

- 2026-05-09: Mal review approved api/ scaffold. The choice to mirror open-social (not collective-social-api) was confirmed by Brittany. OAuth scope string approved as-is (write-only). Two blocking issues flagged by Mal: (1) Vite proxy points to 3002 but api defaults to 3000 — fix one or the other. (2) CORS dev whitelist hardcodes 5173 but Vite runs on 5175 — update CORS whitelist or use `CORS_ORIGIN` env var. See `mal-scaffold-review.md` for details.
