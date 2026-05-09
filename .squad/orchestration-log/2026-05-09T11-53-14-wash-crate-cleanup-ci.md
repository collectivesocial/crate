# Orchestration Log: Wash — crate Cleanup & CI Workflow

**Batch:** 2026-05-09T11:53:14-07:00  
**Agent:** Wash (Backend / API)  
**Mode:** Background  
**Model:** Sonnet  

---

## Why Chosen

Brittany's three-repo split requires cleanup of `crate/` after Kaylee and Inara extract web and landing. Wash owns backend/API and CI. Executes in parallel with Kaylee + Inara; all three complete before Scribe merge.

---

## Mode Rationale

Background: Cleanup is independent of extractions (only depends on their completion, which is signaled in the manifest). Wash runs in parallel; work completes within the batch.

---

## Outcome

**Status:** Done — crate cleanup complete, CI workflow added, repo committed.

**Deliverable:** `.squad/decisions/inbox/wash-crate-cleanup-and-ci.md` (done status)

**Summary:**

**Deletions:**
- `web/`, `landing/` directories (extracted by Kaylee + Inara)
- `.github/workflows/deploy-web.yml`, `.github/workflows/deploy-landing.yml` (no longer needed)
- Root scripts `dev:web`, `dev:landing`, `build:web`, `build:landing` from `package.json`
- `test` script's web portion (`npm --prefix web test`) from `package.json`
- `WEB_LEXICON` target in `codegen.sh` (web/src/lexicon no longer exists in repo)

**CI Workflow Added:**
- **File:** `.github/workflows/test.yml`
- **Trigger:** `push` to main, `pull_request` against main
- **Node version:** 22 (pinned, no matrix — aligns with crate policy; `collective-social-api` uses matrix but crate pins 22 only)
- **Jobs:** Single job (not matrix)
- **Steps:**
  1. Checkout (actions/checkout@v4)
  2. Setup Node 22 with npm cache (actions/setup-node@v4)
  3. Root `npm ci` (prettier, etc.)
  4. Root format check (`npm run format:check`)
  5. Per-package (`api`, `importers`, `lexicons`): `npm ci --prefix <pkg>`
  6. Per-package lint/build/test with `--if-present` (forgiving for early-stage repo)
- **`lexicons/` special:** Only gets install; no test or codegen step (codegen is dev-time, output is committed — hermetic builds by design)
- **No codegen in CI:** Generated code is version-controlled; builds are hermetic. Codegen drift detection deferred until needed.

**Git state:** Commit 36d9056 includes all cleanup + CI (Wash used `git add -A` for wholesale repo cleanup, so commit also includes existing `.squad/` files already committed by prior scaffold init)

**Deviations:** None — all tasks completed per Mal's three-repo-split ADR

**Critical details:**
- Commit 36d9056 is the first real crate commit after three-repo split
- `.squad/` files already present in commit (part of wholesale add)
- `--if-present` forgiving CI approach supports incremental script growth
