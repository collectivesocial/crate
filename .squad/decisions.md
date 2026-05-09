# Decisions — crate.social

Append-only log of team-relevant decisions. Most recent at the bottom.

---

### 2026-05-09T09:58:10-07:00: Squad cast
**By:** Brittany Ellich (via Squad)
**What:** Hired initial team — Mal (Lead), Simon (Lexicon Designer), Wash (Backend/API/OAuth), Zoe (Importers), Kaylee (Web), Inara (Landing) — plus Scribe and Ralph. Universe: Firefly / Serenity.
**Why:** Project scope (lexicons + API + importers + Zettelkasten web app + Astro landing + OAuth) maps cleanly to six specialist roles. Lexicons split out from API because they're the contract everything else depends on; importers split out because adapters multiply over time.

### 2026-05-09T09:58:10-07:00: Repo layout per plan.md
**By:** Brittany Ellich
**What:** Project lives at `/Users/brittanyellich/Documents/Code/Collective/crate`. Top-level folders: `api/`, `web/`, `landing/`, `lexicons/`, `importers/`. Squad config in `.squad/`.
**Why:** Confirmed at squad creation. Mirrors the structure described in `plan.md`.

### 2026-05-09T09:58:10-07:00: Conventions inherited from sibling repos
**By:** Brittany Ellich
**What:** Carry forward conventions from `collective-social-*` and `open-social-*`: TS end-to-end; Kysely + Postgres + sequential migration keys; `getSessionAgent`, `SESSION_OPTIONS`, `handler()` wrapper; Pino via `ctx.logger` (never `console.*`); named exports; Chakra v3 component names (`Dialog`/`open`/`colorPalette`); `credentials: 'include'` on fetches; teal primary; `react-icons/lu`.
**Why:** Consistency across the Collective ecosystem; avoids re-deciding solved problems.
# ADR: Initial Scaffold for crate.social

**Date:** 2026-05-09
**Author:** Mal (Lead / Architect)
**Status:** Proposed

---

## Decision 1: Package manager — npm (not pnpm/yarn workspaces)

**Decision:** Use npm with `package-lock.json`, no monorepo workspace tooling.

**Rationale:** All six sibling repos (`collective-social-api`, `collective-social-web`, `open-social`, `open-social-web`, `collective-landing`, `open-landing`) use plain npm with `package-lock.json`. None use pnpm, yarn, turbo, or nx. None are monorepos — they are all single-package repos. Crate has multiple top-level folders, but they are loosely coupled (no shared build step, no cross-package imports at build time). Workspace tooling adds indirection for no proven benefit here. Each folder gets its own `package.json` and `node_modules`. A root `package.json` with convenience scripts delegates to sub-folders.

---

## Decision 2: Package boundaries — five independent packages, no workspace linking

**Decision:** `api/`, `web/`, `landing/`, `lexicons/`, and `importers/` each have their own `package.json`. They are NOT npm workspace packages — they install independently. `lexicons/` is a build-time dependency consumed via a codegen step (generates TS types into a `packages/generated/` output that api, web, and importers copy or reference). Importers are a single package with sub-modules, not individual sub-packages.

**Rationale:** Sibling repos don't cross-link. `collective-social-api` and `collective-social-web` are separate repos with no shared package. The lexicon JSON → TS codegen step (using `@atproto/lex-cli`) already exists in `collective-social-api`. Keep the same pattern: codegen outputs live in each consumer's `src/lexicon/` directory, generated from the shared `lexicons/` folder.

---

## Decision 3: Shared code strategy — codegen, not a shared package

**Decision:** No `packages/shared/` workspace package. Shared types come from lexicon codegen (`lex gen-server` and `lex gen-api`). Shared utilities (auth helpers, PDS client wrapper) live in `api/src/lib/` and are not shared to `web/` — the web app talks to the API, not to the PDS directly.

**Rationale:** Siblings don't share code between api and web repos. The only shared artifact is the lexicon schema, and ATProto's lex-cli handles that via codegen. Adding a shared workspace package is premature complexity.

---

## Decision 4: Root tooling

**Decision:**
- **TypeScript:** Per-package `tsconfig.json`. API targets ES2022/commonjs (matching `open-social`). Web uses Vite's bundler resolution with project references. Landing uses Astro's built-in TS.
- **Lint:** ESLint 9 flat config per package. Web/landing use `typescript-eslint` + `react-hooks` + `react-refresh`. API uses `typescript-eslint` only.
- **Format:** Prettier 3 (matching all siblings).
- **Test:** Vitest 4 everywhere. API: `environment: 'node'`. Web: `environment: 'jsdom'` with `@testing-library/react`.
- **Node:** 22.x (current LTS; CI in siblings pins 20, but that's a year old — we go 22).
- **Package manager:** npm 10+.

**Rationale:** Direct match to sibling patterns. Node 22 is the one intentional upgrade from siblings' CI (which pins 20) — 22 is current LTS and we're starting fresh.

---

## Decision 5: Migration & env tooling

**Decision:**
- **Migrations:** Kysely `FileMigrationProvider` with sequential numeric prefixes (`001_`, `002_`, ...). Custom `scripts/migrate.ts` using tsx (matching `open-social` exactly).
- **Env validation:** `envalid` for required env vars, `dotenv` for loading. Matching both `collective-social-api` and `open-social`.
- **Logger:** Pino (matching `open-social`). Never `console.*`.

**Rationale:** Direct match to `open-social/scripts/migrate.ts` and `open-social/kysely.config.ts`. Sequential numeric keys already decided in `decisions.md`.

---

## Decision 6: CI strategy

**Decision:** GitHub Actions. One workflow per concern: `test.yml` (lint + unit tests), `deploy.yml` (build + deploy). Postgres service container for API integration tests (matching `open-social/.github/workflows/test.yml`).

**Rationale:** All siblings use GitHub Actions with the same pattern.
