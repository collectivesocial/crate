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

- 2026-05-09: Work item #6 — Lexicon codegen pipeline. Matched the `collective-social-api` sibling pattern: `@atproto/lex-cli ^0.9.7` (lockfile resolves to `0.9.8`) as a devDependency, invoked via `npx @atproto/lex-cli` from within the `lexicons/` directory so the local `node_modules` is used. The sibling uses a single npm script (`lex gen-server ./src/lexicon ./lexicons/*`) because it only has one output; crate needs three outputs (api, web, importers), so a Bash script (`lexicons/scripts/codegen.sh`) is the right escalation. `find … | sort` is used instead of a shell glob to handle nested lexicon subdirectories (`social/crate/note/`, `social/crate/making/`, etc.) portably under `set -euo pipefail`. `mapfile -t` collects the results into an array that is passed wholesale to `npx @atproto/lex-cli` as positional arguments. Root `npm run lexgen` delegates to `./lexicons/scripts/codegen.sh` (already wired by Wash).

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

- 2026-05-09: **Verified Collective NSIDs.** Brittany confirmed `app.collective.*` lexicons exist and asked Simon to verify their actual NSIDs from the collective-social-api repo. Finding: The Collective app uses **`app.collectivesocial.*`** namespace (not `app.collective.*`). Complete list of verified NSIDs verified from `/Users/brittanyellich/Documents/Code/Collective/collective-social-api/lexicons/`:
  - **Books/Lists (primary for note-to-book linking):** `app.collectivesocial.list` (record type, stores lists with `purpose: "book-club"`) and `app.collectivesocial.listitem` (record type, items in lists)
  - **Community/group variants:** `app.collectivesocial.group.list`, `app.collectivesocial.group.listitem`, `app.collectivesocial.group.listitem.status`, `app.collectivesocial.group.post`, `app.collectivesocial.group.postindex`, `app.collectivesocial.group.reaction`, `app.collectivesocial.group.segment`, `app.collectivesocial.group.segment.progress`
  - **Feed variants:** `app.collectivesocial.feed.list`, `app.collectivesocial.feed.listitem`, `app.collectivesocial.feed.comment`, `app.collectivesocial.feed.completion`, `app.collectivesocial.feed.goal`, `app.collectivesocial.feed.grouppost`, `app.collectivesocial.feed.react`, `app.collectivesocial.feed.review`, `app.collectivesocial.feed.reviewsegment`, `app.collectivesocial.feed.segmentprogress`, `app.collectivesocial.feed.useritem`
  - **User-scoped:** `app.collectivesocial.list`, `app.collectivesocial.listitem`
  - **Note:** `social.crate.note.link`'s flat `target` object (with optional `atUri` or `externalUrl`) is flexible enough to reference any of these records without schema changes. No updates to social.crate.* lexicon files needed.

- 2026-05-09: Reviewed crate-web's lexgen-local.sh. All checks passed: codegen subcommand is `gen-api` (correct for web client), source path reads from `../crate/lexicons/social/crate/`, output path is `src/lexicon/`, lex-cli version is ^0.9.7 (matches crate/lexicons), bash syntax valid, friendly error on missing sibling repo.
