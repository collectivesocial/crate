# ADR: Three-Repo Split — crate / crate-web / crate-landing

**Date:** 2026-05-09
**Author:** Mal (Lead / Architect)
**Status:** Proposed

---

## Decision

Split `crate` into three independent repositories:

| Repo | Contents | Deploy target |
|------|----------|---------------|
| `crate/` (this repo) | `lexicons/`, `api/`, `importers/`, root config | Collective server |
| `crate-web/` (new) | React/Vite/Chakra SPA | GitHub Pages |
| `crate-landing/` (new) | Astro static site | GitHub Pages |

Extract **now** — before first functional commit — so no history rewriting is needed. Each new repo gets `git init` locally; `gh repo create` happens later at Brittany's discretion.

---

## Rationale

1. **GitHub Pages limitation:** One Pages site per repo. The current monorepo has two static sites (`web/`, `landing/`) competing for the same `github-pages` environment. This was already flagged as a blocking issue during scaffold review.
2. **Deploy-separately directive:** Brittany's deployment topology (decision 2026-05-09) says each project deploys independently. Separate repos make that the default, not something enforced by workflow path filters.
3. **Sibling repo convention:** Every other project in the Collective ecosystem (`collective-social-api`, `collective-social-web`, `open-social`, `open-social-web`, etc.) is a standalone repo. This split aligns crate with that pattern.
4. **Timing:** Extracting before first functional commit means zero history complexity — it's a clean copy, not a `git filter-repo` operation.

---

## Codegen Strategy

**Choice: Manual codegen + commit (option a).**

Each new repo has a `lexgen:local` npm script that:
- Reads lexicon JSON from `../crate/lexicons/social/crate/`
- Runs `@atproto/lex-cli gen-api` to produce `src/lexicon/`
- Commits the generated output to the repo

The `crate/` repo's `codegen.sh` drops the `web/src/lexicon/` target (web is no longer local). API and importers targets remain.

**Why manual codegen + commit:**
- Simplest to implement. No npm package publishing pipeline needed.
- Generated code is version-controlled, so builds are hermetic (no cross-repo fetch at build time).
- Matches the existing pattern in sibling repos where codegen output lives in-tree.

**Tradeoff accepted:** When a lexicon schema changes, the developer must run `lexgen` in `crate/`, then run `lexgen:local` in `crate-web/` and commit the result. This is manual but infrequent — lexicon schemas change rarely after initial design, and the friction is a useful forcing function to think about backward compatibility.

**Future option:** If sync burden becomes annoying, publish `@crate/lexicon` as an npm package. The codegen output is already self-contained, so this is additive — no architecture change required.

---

## What Changes in `crate/`

1. **Deleted:** `web/`, `landing/`, `.github/workflows/deploy-web.yml`, `.github/workflows/deploy-landing.yml`
2. **Root `package.json`:** Remove `dev:web`, `dev:landing`, `build:web`, `build:landing` scripts. Remove `web` and `landing` from `test` script.
3. **`lexicons/scripts/codegen.sh`:** Remove the `WEB_LEXICON` target and its `gen-api → web/src/lexicon/` step. Keep `API_LEXICON` and `IMPORTERS_LEXICON`.
