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

**2026-05-09 — Sibling repo survey results:** All six sibling repos use plain npm (no pnpm/yarn/workspaces/turbo). Package manager is npm with `package-lock.json`. Test framework is Vitest 4 (node env for APIs, jsdom for web). Lint is ESLint 9 flat config + `typescript-eslint`. Formatter is Prettier 3. APIs use Express 5, Kysely 0.28 + Postgres, Pino logger, `envalid` + `dotenv` for env, `iron-session` for sessions, `@atproto/oauth-client-node` for OAuth. Migrations are sequential numeric (`001_*.ts`) with Kysely `FileMigrationProvider` via a custom `scripts/migrate.ts` using tsx. Web apps use React 19 + Vite 7 + Chakra UI v3 + react-router-dom 7. Landing sites use Astro 5 + Tailwind 4. CI is GitHub Actions with Postgres service containers. No monorepo tooling exists anywhere in the ecosystem. Node version in CI is 20, but local is 22.

