# Orchestration Log: Kaylee — crate-web Extraction

**Batch:** 2026-05-09T11:53:14-07:00  
**Agent:** Kaylee (Web App)  
**Mode:** Background  
**Model:** Sonnet  

---

## Why Chosen

Brittany's three-repo split decision requires extraction of `crate/web/` to independent `crate-web/` repo before first functional commit. Kaylee owns web app. Parallel execution with Inara (landing) and Wash (cleanup) to finish extraction within this batch.

---

## Mode Rationale

Background: Extraction is independent work. Kaylee runs in parallel with Inara and Wash; all three complete within the batch and feed into Scribe's inbox merge.

---

## Outcome

**Status:** Done — crate-web repo created, git init, first commit.

**Deliverable:** `.squad/decisions/inbox/kaylee-crate-web-extraction.md` (done status)

**Summary:**
- **Source:** `/Users/brittanyellich/Documents/Code/Collective/crate/web/` (26 files)
- **Destination:** `/Users/brittanyellich/Documents/Code/Collective/crate-web/`
- **Copy method:** `rsync -a --exclude node_modules`
- **Edits applied:**
  - `package.json`: Removed `lexgen` stub, added `lexgen:local` script, added `@atproto/lex-cli@^0.9.7` to devDependencies
  - `.env.example`: Changed `VITE_BASE_PATH=/` → `/crate-web/` for GH Pages subpath
  - `public/404.html`: **Proactive fix** — corrected `pathSegmentsToKeep: 0` → `1` (Mal's plan was correct about no postbuild copy, but value needed adjustment for GH Pages subpath routing)
- **New files:** `scripts/lexgen-local.sh`, `.github/workflows/deploy.yml`, README.md
- **Git state:** `git init -b main`, commit 4685d29 (26 files, 6058 insertions)
- **Deviations:** One proactive correctness fix (pathSegmentsToKeep) not flagged in Mal's plan

**Critical details:**
- lexgen-local.sh reads from sibling `../crate/lexicons/social/crate/` — errors clearly if crate not cloned as sibling
- Deploy workflow defaults to `/crate-web/` base path, overridable via repo var
- Repo NOT pushed — Brittany decides timing
