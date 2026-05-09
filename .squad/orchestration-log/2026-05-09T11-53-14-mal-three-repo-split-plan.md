# Orchestration Log: Mal — Three-Repo Split Plan

**Batch:** 2026-05-09T11:53:14-07:00  
**Agent:** Mal (Lead / Architect)  
**Mode:** Sync  
**Model:** Opus  

---

## Why Chosen

Brittany announced architectural change: split crate into three independent repos (crate, crate-web, crate-landing) to unblock GitHub Pages (one Pages site per repo) and align with Collective sibling repo convention (all standalone, not monorepos). Extraction must happen before first functional commit to avoid history rewriting. Mal (Lead / Architect) owns architectural decisions and decomposition.

---

## Mode Rationale

Sync: Produces an ADR and decomposition document. Runs to completion immediately, feeds output into remaining agents' tasks.

---

## Outcome

**Status:** Done — ADR written and decisions extracted into spawn manifest.

**Deliverable:** `.squad/decisions/inbox/mal-three-repo-split.md` (proposed status)

**Summary:**
- **Decision:** Split into `crate/` (lexicons, api, importers), `crate-web/` (React/Vite/Chakra SPA), `crate-landing/` (Astro).
- **Codegen strategy:** Manual per-repo + commit (option a). Each new repo has `lexgen:local` reading from `../crate/lexicons/`. Simplest, matches sibling pattern.
- **Changes to `crate/`:** Delete `web/`, `landing/`, `deploy-*.yml`. Update `package.json` (remove dev/build scripts for web/landing), `codegen.sh` (drop WEB_LEXICON target).
- **Deviations:** None — decision is proposed, actionable for remaining agents.

**Critical downstream impacts:**
- Kaylee receives exact extraction scope for `crate/web/` → `crate-web/`
- Inara receives exact extraction scope for `crate/landing/` → `crate-landing/`
- Wash receives exact cleanup scope (files to delete, scripts to update)
- All three extractions must complete before first functional commit
