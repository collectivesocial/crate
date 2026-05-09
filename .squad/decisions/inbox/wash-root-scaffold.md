# ADR: Root Scaffold Non-Obvious Calls

**Date:** 2026-05-09
**Author:** Wash (Backend / API / OAuth)
**Status:** Accepted

---

## `.prettierrc` — chose `collective-social-api` over `open-social`

`open-social` has no `.prettierrc` at all. `collective-social-api` has a complete config (`semi: true, trailingComma: es5, singleQuote: true, printWidth: 80, tabWidth: 2, useTabs: false`). Used `collective-social-api` as canonical with no modifications. If `open-social` ever adds one and it differs, this is the decision point to revisit.

---

## `engines.node` set to `>=22` despite siblings not setting it

Neither `collective-social-api` nor `open-social` sets `engines.node` in their `package.json`. Added it here (`"node": ">=22"`) because:
1. We're deliberately departing from siblings' Node 20 CI — having an explicit engine constraint makes that visible to tools (npm, Volta, CI) without requiring everyone to read the docs.
2. Cost is zero; benefit is early error on misconfigured environments.

---

## `.gitignore` — merged and expanded both siblings

`collective-social-api` has a minimal three-liner; `open-social` is more complete. Used `open-social`'s as the base (more comprehensive is better for a new repo), added:
- `**/node_modules/` alongside `node_modules/` to catch sub-package installs
- `.astro/` for the landing package's Astro build cache
- `.next/` forward-compat (unlikely but cheap)
- `.env.local` and `.env.*.local` (Vite convention for local overrides not covered by siblings)

Explicitly confirmed `.squad/` is NOT excluded — team memory must be committed.

---

## Root `package.json` — no `npm run` for `importers` dev

No `dev:importers` script added because importers are batch/CLI tools, not a dev server. Only `test` delegates to importers (consistent with how sibling one-off scripts work).

---

## Acknowledged (no action taken): deployment and OAuth constraints for api/ work item #2

Per `.squad/decisions/inbox/` files read during this session:
- `api/` shares server/Postgres with `collective-social-api` and `open-social`
- `web/` is static (GH Pages) — all auth in `api/`
- OAuth scopes: write `social.crate.*`, read `site.standard.*` / `community.lexicon.calendar.*` / `app.collective.*` / `app.bsky.feed.post`

These constrain the api/ scaffold (work item #2) but required no action here.
