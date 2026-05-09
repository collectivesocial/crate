### 2026-05-09T10:26:27-07:00: OAuth scopes — mirror sibling pattern
**By:** Brittany Ellich (via Squad)
**What:** Wash uses **explicit scoped OAuth** matching how `collective-social-api` and `open-social` already do it. Mirror their scope strings, client metadata shape, and OAuth client config. Required scopes for crate.social:
- Write access for all `social.crate.*` record types to the user's PDS.
- Read access for external lexicons used in the catalog: `site.standard.*`, `community.lexicon.calendar.*`, `app.collective.*`, `app.bsky.feed.post`.
**Why:** Consistency with sibling Collective apps; explicit scopes are the right ATProto OAuth pattern; piggybacks on a config approach Brittany has already validated.
