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

- 2026-05-09: Mal proposed initial scaffold (see decisions.md, decisions 1–6). Your work items: #3 — CI/CD workflows & GitHub Actions; #8 — Docker & production deployment.
- 2026-05-09: Lexicons exist at `lexicons/social/crate/` (9 records: rss.feed, podcast.episode, making.project, making.update, talk, illustration, note, note.link, now). Root configs + git init done. See `.squad/decisions.md` for deploy topology and OAuth scope directives — read before your scaffold work. Simon flagged 3 open questions (see `.squad/orchestration-log/2026-05-09T10-26-27-simon-item-1.md`).
- 2026-05-09: Aligned vite dev proxy with api default port (3000).

## Learnings — web/ scaffold (2026-05-09)

### Chakra v3 setup pattern (from collective-social-web + open-social-web)
- Theme: `createSystem(defaultConfig, customConfig)` where `customConfig = defineConfig({...})`. Export named `system`.
- Provider: `<ChakraProvider value={system}>` wrapping `<ColorModeProvider>` (next-themes ThemeProvider with `attribute="class"`).
- No default exports — `export const system = ...`, `export function Provider(...)`.
- Semantic token keys: `bg.page`, `bg.card`, `fg.default`, `fg.muted`, `accent.default`, `accent.hover`, `border.card`, etc. All use `{ _light, _dark }` shape.
- Global CSS lives in `defineConfig({ globalCss: {...} })`, not in a separate CSS file.
- Component idioms to remember: `colorPalette` (not `colorScheme`), `open` prop (not `isOpen`), `Dialog` (not `Modal`).

### API client convention (from open-social-web/src/utils/api.ts)
- Named export `apiFetch` (crate) / `api` (open-social) with shape `{ get, post, put, patch, del }`.
- Every request: `credentials: 'include'`, JSON Content-Type auto-set for non-FormData bodies.
- On non-2xx: parse JSON body, surface `error + details` message, throw `new Error(message)`.
- Base URL: `import.meta.env.VITE_API_URL` concatenated as prefix (empty string in dev lets Vite proxy handle it).

### GH Pages base path strategy
- Env var: `VITE_BASE_PATH` (read in `vite.config.ts` via `process.env.VITE_BASE_PATH`). Defaults to `/`.
- Passed to Vite `base` option. React Router `createBrowserRouter` picks it up via `import.meta.env.BASE_URL`.
- Use `/crate/` if deploying to `brittanyellich.github.io/crate`; use `/` for custom domain `crate.social`.
- Siblings use simple `cp dist/index.html dist/404.html` in their deploy workflows. Crate uses the full spa-github-pages redirect trick in `public/404.html` + decoder script in `index.html` for cleaner path handling.

### GH Pages deploy workflow pattern
- `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` (matching both sibling deploy.yml files exactly).
- Node 22 (upgrade from siblings' Node 20, per Decision 4).
- `paths: web/**` filter so deploys only trigger on web/ changes.
- `VITE_BASE_PATH` and `VITE_API_URL` read from GitHub Actions repository variables (`vars.*`) with sane defaults.

- 2026-05-09: Mal review approved web/ scaffold structure. GH Pages workflow flagged for collision with landing/ — Brittany deciding deploy split. One blocking issue for you: Vite proxy in `web/vite.config.ts` points to api port 3002, but api defaults to 3000 — align one or the other. See `mal-scaffold-review.md` issue #1 for details.
