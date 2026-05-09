# Squad — crate.social

## Project Context

**What we're building:** crate.social — a custom-lexicon publishing service for ATProto. Define structured record types for the things you make (notes, articles, bookmarks, recipes, etc.), import from any source (RSS, markdown, manual entry), publish to your PDS, query from anywhere.

**The user:** Brittany Ellich (@brittanyellich)

**Tech stack:**
- TypeScript end-to-end
- API: Hono/Express/Fastify + Postgres + Kysely
- Web: React 19 + Vite + Chakra UI v3
- Landing: Astro
- ATProto: `@atproto/api`, `@atproto/lexicon`
- OAuth via ATProto OAuth flow

**Repo layout** (per plan.md):
- `api/` — backend service, OAuth, PDS writes, Kysely indexing
- `web/` — React app, notes editor, backlinks visualization, query UI
- `landing/` — Astro marketing site
- `lexicons/` — `social.crate.*` lexicon JSON definitions (9 planned)
- `importers/` — RSS, markdown frontmatter, future adapter packages

**Sibling repos in the workspace** (conventions to mirror):
`collective-social-api`, `collective-social-web`, `open-social`, `open-social-web`, `collective-landing`, `open-landing`, `collective-social-docs`, `atproto-devnet`.

**Key conventions to carry over:**
- `getSessionAgent`, `SESSION_OPTIONS`, `handler()` async wrapper
- `ctx.logger` (Pino) — never `console.*`
- Kysely typed queries, sequential migration keys
- Named exports (no default exports)
- Chakra UI v3: `Dialog` not `Modal`, `open` not `isOpen`, `colorPalette` not `colorScheme`
- `credentials: 'include'` on all fetches
- Teal primary color, `react-icons/lu`

**Show-day demo:** Zettelkasten-style notes app — `social.crate.note` records with bidirectional `[[wikilinks]]` and a backlinks visualization, all stored on the user's PDS.

## Members

| Agent | Role | Pronouns | Badge |
|-------|------|----------|-------|
| Mal | Lead / Architect | — | 🏗️ Lead |
| Simon | Lexicon Designer | — | 🧬 Schemas |
| Wash | Backend / API / OAuth | — | 🔧 Backend |
| Zoe | Import Adapters | — | 📥 Importers |
| Kaylee | Web App (React + Chakra) | — | ⚛️ Frontend |
| Inara | Landing Site (Astro) | — | 🌐 Landing |
| Scribe | Session Logger | — | 📋 Scribe |
| Ralph | Work Monitor | — | 🔄 Monitor |

<!-- copilot-auto-assign: false -->
