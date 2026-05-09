# P0 resolutions & scaffold review — 2026-05-09T11:10:23-07:00

**Batch:** 2  
**Status:** Batch complete; awaiting Brittany's GH Pages decision before committing  

## Session Summary

Brittany resolved three P0 questions. Simon verified Collective's NSID namespace. Mal reviewed all scaffolds and identified 4 blocking issues. Coordinator captured decisions and dispatched fixes.

## P0 Questions Resolved

1. **Backend framework:** Wash's choice to mirror `open-social` (Pino, FileMigrationProvider, ES2022) accepted. Open-social pattern closer to ATProto OAuth than collective-social-api.

2. **OAuth scopes:** Write-only scopes accepted (9 repo scopes). Public ATProto reads need no explicit scope permission.

3. **Collective lexicons:** Verified to live at `app.collectivesocial.*` (not `app.collective.*`). "Books" are `app.collectivesocial.list` with `purpose: "book-club"`.

## Key Findings

**Simon (NSIDs):** Cataloged 21 NSIDs. The namespace is definitely `app.collectivesocial.*` with a clear pattern. Source: `/Users/brittanyellich/Documents/Code/Collective/collective-social-api/lexicons/`. No schema changes needed to `social.crate.note.link` — the `target.atUri` field already supports arbitrary AT-URIs.

**Mal (Scaffold review):** APPROVE WITH FIXES. Found 4 blocking issues:
- Dev port mismatch (3002 vs 3000) — Kaylee + Wash
- CORS dev port mismatch (5173 vs 5175) — Wash
- @atproto/api version gap (0.13.35 vs 0.18.3) — Zoe
- GitHub Pages collision (both workflows target same environment) — Brittany decides

3 issues are simple fixes; 1 (GH Pages) requires topology decision.

**Coordinator:** Captured P0 resolutions. Captured Zoe's importer auth (session file → `~/.crate/session.json`) + idempotency (local state file `.import-state.json` with PDS fallback) decisions. All three fix issues are assigned and ready to dispatch.

## Learnings & Cross-team Notes

- **Simon → Wash:** NSIDs confirmed. No surprises for cross-Collective integrations going forward.
- **Simon → Kaylee + Inara:** If lexicon cross-references come up, the verified NSID catalog is in plan.md footnote + `simon-collective-nsids-verified.md`.
- **Mal → Wash:** API scaffold approved. OAuth client metadata, scope string, CORS all correct per decisions. Boot path solid.
- **Mal → Kaylee:** Web scaffold approved. API client integration correct. Fix the port mismatch #1 + decide on GH Pages topology #4.
- **Mal → Inara:** Landing scaffold approved. Static output, site URL set correctly. Fix GH Pages topology #4 with Kaylee.
- **Mal → Zoe:** Importer structure approved. Fix version gap #3 + bump Vitest when convenient.

## Next Steps

1. **Kaylee:** Fix Vite proxy target (3002 → 3000) or API PORT (3000 → 3002). Be consistent.
2. **Wash:** Fix CORS dev whitelist (5173 → 5175) or use `CORS_ORIGIN` env var.
3. **Zoe:** Bump `importers/@atproto/api` to `^0.18.3`. Run `npm install` in importers/.
4. **Brittany:** Decide GH Pages topology (A/B/C from Mal's review) before CI work.
5. **Scribe:** Once #4 is decided, stage and commit all fixed scaffolds with a single commit.

## Status

All agent work complete. Decisions merged into `decisions.md`. Orchestration logs written. 3 fixes in-flight. Waiting for Brittany's GH Pages decision before commit + CI.
