# Routing — crate.social

Maps work signals to the right specialist. When in doubt, pick the most likely owner and go.

## By keyword

| Signal | Owner | Notes |
|--------|-------|-------|
| architecture, scope, decision, review, "team", cross-cutting | Mal | Lead — also the reviewer for major work |
| lexicon, schema, record type, NSID, `social.crate.*`, validation, `@atproto/lexicon` | Simon | Owns `lexicons/` |
| api, endpoint, route, handler, kysely, migration, postgres, sql, indexer, firehose, jetstream | Wash | Owns `api/` |
| oauth, session, auth, dpop, PDS write, `@atproto/api` agent | Wash | OAuth lives with the API |
| import, importer, rss, atom, markdown, frontmatter, csv, pocket, goodreads, letterboxd, adapter | Zoe | Owns `importers/` |
| react, vite, chakra, component, page, route, editor, wikilink, backlink, graph, visualization | Kaylee | Owns `web/` |
| astro, landing, marketing, copy, docs site, seo | Inara | Owns `landing/` |
| log, decision merge, session summary, history | Scribe | Always background, fire-and-forget |
| backlog, board, monitor, queue, "keep working" | Ralph | Work monitor |

## By folder

| Path | Owner |
|------|-------|
| `api/**` | Wash |
| `web/**` | Kaylee |
| `landing/**` | Inara |
| `lexicons/**` | Simon |
| `importers/**` | Zoe |
| `.squad/**` | Scribe (logs/decisions), Mal (team-level) |
| Root configs (`package.json`, `tsconfig`, workspace, CI) | Mal |

## Multi-agent patterns

- **New record type end-to-end**: Simon (lexicon) → Wash (API + Kysely indexing) → Kaylee (UI). Fan out after Simon's draft is approved.
- **New importer**: Simon (verify target lexicon fits) + Zoe (build adapter) in parallel; Wash adds endpoint if needed.
- **OAuth / auth changes**: Wash leads, Kaylee adapts the web client. Mal reviews.
- **Notes/Zettelkasten editor**: Kaylee owns; coordinates with Simon on link-record shape and Wash on backlinks query endpoint.
- **"Build feature X"**: Mal decomposes first (sync), then fan out.

## Reviewer

Mal is the default reviewer for cross-cutting or architecturally significant work. Simon reviews lexicon changes. Apply the strict reviewer rejection lockout — if Mal rejects, a different agent revises.
