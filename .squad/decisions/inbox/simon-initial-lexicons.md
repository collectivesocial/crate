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
