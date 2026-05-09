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

- 2026-05-09: Mal proposed initial scaffold (see decisions.md, decisions 1–6). Your work item: #5 — lexicon codegen & schema validation.

- 2026-05-09: Mal review approved landing/ scaffold structure. GH Pages workflow flagged for collision with web/ — Brittany deciding deploy split. No blocking issues for landing/ itself; await Brittany's topology decision on the Pages collision before proceeding with deploy workflow fixes. See `mal-scaffold-review.md` issue #4 for the three topology options (A: landing on Pages + web elsewhere; B: shared Pages with subdirs; C: subdomain prefixes).

## Learnings

2026-05-09: Extraction of `landing/` into standalone `crate-landing/` repo completed cleanly via rsync (10 files, no node_modules). GH Pages `base` path defaults to `/crate-landing` in `astro.config.mjs`; `site` set to `brittanyellich.github.io`. Custom domain users are instructed in README.md to set `site` to their domain and remove `base`. No `lint` script was added because there is no eslint config file in the landing directory (eslint is in devDeps but unconfigured). `gh repo create` was intentionally deferred to Brittany.

## Work Item #4: Landing Scaffold (2026-05-09)

**Completed:** Full scaffolding of `landing/` directory.

**Astro version:** Astro 5.15.6 (matching collective-landing and open-landing siblings).

**Styling solution:** Tailwind CSS 4.1.8 with @tailwindcss/vite 4.1.8 (via vite plugin, matching collective-landing's approach).

**Deploy target:** GitHub Pages (via Actions). Pattern: `build` job runs `npm ci --prefix landing && npm --prefix landing run build`, uploads `landing/dist/` artifact, `deploy` job handles deployment.

**Structure created:**
- `landing/package.json` — Astro 5, Tailwind 4, ESLint with astro plugin
- `landing/tsconfig.json` — strict, Astro defaults
- `landing/astro.config.mjs` — site URL set to `https://crate.social`, Tailwind vite plugin configured
- `landing/.gitignore` — standard (dist, node_modules, .env, .astro, etc.)
- `landing/src/layouts/Base.astro` — HTML scaffold with OG meta tags, favicon link
- `landing/src/pages/index.astro` — placeholder marketing page: H1 "crate.social", tagline, one-paragraph pitch, "Coming soon" CTA, GitHub link
- `landing/public/favicon.svg` — placeholder C icon (Brittany may replace)
- `landing/src/components/.gitkeep` — empty for future component additions
- `.github/workflows/deploy-landing.yml` — GitHub Pages deploy action (node 22, mirrors collective-landing pattern)

**Key choices:**
- No Preact/Alpine/other frameworks in landing (stripped down vs. collective-landing for simplicity; just static content).
- Tailwind 4 via vite plugin (matches collective-landing).
- site URL placeholder: crate.social (no protocol, Astro adds https).
- OG image path: /og.png (Brittany to provide).
- Root scripts in package.json already reference `dev:landing` and `build:landing` — scripts delegate to this package.
- 2026-05-09: Lexicons exist at `lexicons/social/crate/` (9 records: rss.feed, podcast.episode, making.project, making.update, talk, illustration, note, note.link, now). Root configs + git init done. See `.squad/decisions.md` for deploy topology and OAuth scope directives — read before your scaffold work. Simon flagged 3 open questions (see `.squad/orchestration-log/2026-05-09T10-26-27-simon-item-1.md`).
