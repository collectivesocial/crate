# Decision: crate-web Extraction

**Date:** 2026-05-09
**Author:** Kaylee (Web App agent)
**Status:** Done
**Triggered by:** mal-three-repo-split.md

---

## Source and Destination

| | Path |
|-|------|
| Source | `/Users/brittanyellich/Documents/Code/Collective/crate/web/` |
| Destination | `/Users/brittanyellich/Documents/Code/Collective/crate-web/` |

Copied via `rsync -a --exclude node_modules`. Source untouched — Wash handles `crate/` cleanup.

---

## Key Edits Applied

### `package.json`
- Removed `"lexgen"` stub script
- Added `"lexgen:local": "bash ./scripts/lexgen-local.sh"`
- Added `"@atproto/lex-cli": "^0.9.7"` to `devDependencies`

**lex-cli version pinned:** `^0.9.7` — matched from `crate/lexicons/package.json`

### `.env.example`
- Changed `VITE_BASE_PATH=/` → `VITE_BASE_PATH=/crate-web/`
- `VITE_API_URL` unchanged

### `public/404.html`
- Changed `pathSegmentsToKeep` from `0` → `1`
- **Deviation from Mal's plan:** Mal noted "404.html is fine — no postbuild copy needed", which is correct about the copy. However, the original value `0` was set for a custom domain (crate.social). Since crate-web deploys to `brittanyellich.github.io/crate-web`, the correct value is `1` to preserve the `/crate-web` path prefix during SPA redirects. Fixed proactively.

---

## New Files Created

| File | Purpose |
|------|---------|
| `scripts/lexgen-local.sh` | Sibling-repo codegen — reads `../crate/lexicons/social/crate/*.json`, runs `lex-cli gen-api`, writes to `src/lexicon/`. Errors clearly if crate not cloned as sibling. |
| `.github/workflows/deploy.yml` | GH Pages deploy on push to main. `VITE_BASE_PATH` defaults to `/crate-web/`, `VITE_API_URL` defaults to `https://api.crate.social`. Both overridable via repo vars. |
| `README.md` | Setup, lexgen:local workflow, deploy notes. |

---

## SPA Routing

Uses spa-github-pages redirect trick in `public/404.html` (already present in `crate/web/`). No `postbuild` copy script needed — the redirect approach handles all deep-link navigation correctly.

---

## Git State

- `git init -b main` + initial commit in `crate-web/`
- Commit hash: `4685d29`
- 26 files, 6058 insertions
- NOT pushed — Brittany decides when to `gh repo create` and push.

---

## Base Path Default

`/crate-web/` is the default in both `.env.example` and the deploy workflow. If Brittany sets up a custom domain, override `VITE_BASE_PATH` to `/` via the `VITE_BASE_PATH` repo variable.

---

## Deviations from Mal's Plan

1. **`public/404.html` `pathSegmentsToKeep`:** Updated `0` → `1` (see above). Mal's plan didn't flag this; it's a correctness fix.
2. All other steps followed exactly.
