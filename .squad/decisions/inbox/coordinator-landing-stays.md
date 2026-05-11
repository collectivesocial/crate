### 2026-05-09T12:21:46-07:00: Amendment — landing stays in crate for now
**By:** Brittany Ellich (via Squad)
**What:** Reverting the landing extraction. Only `web/` extracts to a separate repo (`crate-web/`). The Astro landing site stays in `crate/landing/` and hibernates until it's actually needed for shipping. The `/Users/brittanyellich/Documents/Code/Collective/crate-landing/` directory created by Inara is being removed; her landing scaffold remains intact inside `crate/landing/`.
**Why:** Landing is lower priority right now. No need to incur the multi-repo coordination cost until the marketing site actually needs to ship.
**Impact:**
- `crate/landing/` restored from commit 220025f (its pre-cleanup state)
- `crate-landing/` directory + its `.git` removed entirely
- Root `package.json` regains `dev:landing` and `build:landing` scripts
- `crate/.github/workflows/deploy-landing.yml` restored from 220025f
- README.md updated to reflect: only `web/` extracted; landing hibernates in this repo
- Mal's three-repo split ADR (in decisions.md) is now technically a TWO-repo split (crate + crate-web) until landing extracts later
