# Simon — NSIDs Verified

**Timestamp:** 2026-05-09T11:10:23-07:00  
**Agent:** Simon (Lexicon Designer)  
**Mode:** Background (haiku)  
**Status:** Complete

## Scope

Verify the actual NSIDs of Collective's lexicons, specifically the "book" NSID referenced in plan.md. Respond with a catalog of all `app.collectivesocial.*` NSIDs found in the `collective-social-api` repository's lexicon directory.

## Output

- **Decision:** Namespace is `app.collectivesocial.*` (not `app.collective.*`)
- **Finding:** The "book" lexicon is `app.collectivesocial.list` with `purpose: "book-club"`
- **Catalog:** 21 verified NSIDs documented in `simon-collective-nsids-verified.md`
- **Impact:** No changes needed to `social.crate.*` schemas; target `atUri` field already supports any AT-URI.

## Files Written

- `.squad/decisions/inbox/simon-collective-nsids-verified.md` — Full NSID catalog and analysis

## Next Downstream

- Brittany / Scribe: Merge decision into `decisions.md`
- All: Use `app.collectivesocial.list` for book references going forward
