# Session Log: Three-Repo Split Complete

**Date:** 2026-05-09  
**Timestamp:** 2026-05-09T11:53:14-07:00  
**Team:** Mal, Kaylee, Inara, Wash, Simon, Scribe  

---

## Summary

Brittany announced architectural change to split crate into three independent repositories (crate, crate-web, crate-landing) to unblock GitHub Pages (one site per repo) and align with Collective sibling repo convention. Extraction happened before first functional commit to avoid history rewriting.

---

## Work Done

### Mal (Lead / Architect)
- Produced ADR: `ADR: Three-Repo Split — crate / crate-web / crate-landing`
- Decided codegen strategy: Manual per-repo + commit (option a)
- Decomposed tasks for remaining agents (Kaylee, Inara, Wash)

### Kaylee (Web App)
- Extracted `crate/web/` → `/Users/brittanyellich/Documents/Code/Collective/crate-web/`
- Applied edits: `package.json` (lexgen:local, lex-cli), `.env.example` (VITE_BASE_PATH), `public/404.html` (pathSegmentsToKeep fix)
- Created: `scripts/lexgen-local.sh` (sibling codegen), `.github/workflows/deploy.yml`, `README.md`
- Git init + commit 4685d29 (26 files, 6058 insertions)
- **Proactive fix:** Corrected `pathSegmentsToKeep: 0` → `1` for GH Pages subpath routing

### Inara (Landing Site)
- Extracted `crate/landing/` → `/Users/brittanyellich/Documents/Code/Collective/crate-landing/`
- Applied edits: `astro.config.mjs` (site, base), created `.github/workflows/deploy.yml`, `README.md`, `.gitignore`
- **Intentional skip:** ESLint config not added (no existing config file; can be added later by Brittany if desired)
- Git init + commit 5ef1c0d (10 files)

### Wash (Backend / API)
- Cleaned up `crate/` per three-repo-split ADR
- Deleted: `web/`, `landing/`, `deploy-*.yml`
- Updated: `package.json` (removed web/landing scripts), `codegen.sh` (removed WEB_LEXICON target)
- Created: `.github/workflows/test.yml` (CI workflow)
- **CI design:** Single job (Node 22 pinned), per-package lint/build/test with `--if-present`, no CI codegen (output committed — hermetic builds)
- Git commit 36d9056 (includes all cleanup + CI + existing .squad/ files from prior init)

### Simon (Lexicon Designer)
- Verified `crate-web/scripts/lexgen-local.sh` all 6 critical checks
- Clean pass — no decision file written

---

## Repos Initialized

| Repo | Commit | First commit | Status |
|------|--------|--------------|--------|
| `crate/` | 36d9056 | split: extract web and landing to sibling repos; add CI | Main branch, awaiting next task |
| `crate-web/` | 4685d29 | Initial crate-web repo | Main branch, NOT pushed |
| `crate-landing/` | 5ef1c0d | Initial crate-landing repo | Main branch, NOT pushed |

---

## Next Steps

1. Brittany decides when to push three repos to GitHub (`gh repo create`).
2. P1 importer strategies already accepted (auth via session-JSON from web app; idempotency via local `.import-state.json` + PDS query fallback) — no Zoe code action required yet; strategies guide future adapter work.
3. Likely next builds: First real API work, OAuth flow, or starting social.crate.note demo (Zettelkasten PKM backbone).

---

## Decision Merge

This session produced 4 decision inbox files (mal, kaylee, inara, wash) all dated 2026-05-09. Scribe will merge into decisions.md and delete inbox files (standard workflow).
