# Decision: crate-landing Extraction — Inara Notes

**Date:** 2026-05-09
**Author:** Inara (Landing Site owner)
**Status:** Done

---

## Summary

Extracted `crate/landing/` into `/Users/brittanyellich/Documents/Code/Collective/crate-landing/` per Mal's three-repo split ADR (`mal-three-repo-split.md`).

---

## Deviations from Mal's Plan

### 1. `lint` script NOT added to `package.json`

**Mal's instruction:** Add `"lint": "eslint ."` only if eslint is in devDeps AND there is an eslint config file.

**Outcome:** ESLint (`eslint@^9.22.0`, `eslint-plugin-astro@^1.3.1`) IS in devDependencies, but no eslint config file exists in `landing/` (`eslint.config.*`, `.eslintrc.*` — none found). Per the conditional, lint script was skipped.

**Flag for Brittany:** If you want ESLint wired up, add `eslint.config.mjs` to `crate-landing/` and add `"lint": "eslint ."` to `package.json` at that time.

### 2. No other deviations

- `astro.config.mjs`: `site` changed to `https://brittanyellich.github.io`, `base` added as `/crate-landing`. ✅
- `.github/workflows/deploy.yml`: Created with full build + deploy jobs. ✅
- `README.md`: Created with setup, deploy, and custom domain instructions. ✅
- `.gitignore`: Copied from source. ✅
- `git init -b main` + initial commit done. Hash: `5ef1c0d`. ✅
- `gh repo create` NOT called. ✅
- `crate/landing/` NOT deleted. ✅
- `crate-web/` NOT touched. ✅

---

## File Count

10 files committed:
- `.github/workflows/deploy.yml`
- `.gitignore`
- `README.md`
- `astro.config.mjs`
- `package.json`
- `public/favicon.svg`
- `src/components/.gitkeep`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `tsconfig.json`
