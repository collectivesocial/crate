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

- 2026-05-09: Mal proposed initial scaffold (see decisions.md, decisions 1–6). Your work items: #1 — scaffold generators & directory structure; #6 — API setup & server layer.
- 2026-05-09: Authored all 9 `social.crate.*` lexicons (work item #1). Conventions adopted from `collective-social-api` siblings:
  - `"lexicon": 1` + `"id"` + `"defs": { "main": { "type": "record", "key": "tid", ... } }` on every record type.
  - `createdAt` (format: datetime) is required on every record — universal convention.
  - Timestamps: `"type": "string", "format": "datetime"`. AT-URIs: `"type": "string", "format": "at-uri"`. URLs: `"type": "string", "format": "uri"`. DIDs: `"type": "string", "format": "did"`.
  - Text fields carry both `maxGraphemes` (user-facing character limit) and `maxLength` (UTF-8 byte limit, ~10× graphemes) — sibling pattern from `app.collectivesocial.feed.review`.
  - Enum-like strings use `knownValues` (open, extensible) rather than a closed `enum`.
  - Blobs: `"type": "blob"` with `accept` array and `maxSize` in bytes; max 2 MB for images.
  - Arrays of inline objects: items carry their own `required` + `properties` — no separate `#def` needed for simple sub-objects.
  - `social.crate.note.link.target` is a flat object with optional `atUri` (format: at-uri) + optional `externalUrl` (format: uri), plus `title` and `description` for display without round-trips. Rationale: true ATProto union types require `$type` discriminator and separate `#def` entries; a flat object is simpler and captures the plan's intent without over-engineering. The constraint "exactly one of atUri/externalUrl must be set" is enforced at the application layer (lexicon can't express XOR).
  - `anchorText` added to `social.crate.note.link` beyond the plan spec — stores the `[[wikilink]]` phrase for display without parsing the source note body.
