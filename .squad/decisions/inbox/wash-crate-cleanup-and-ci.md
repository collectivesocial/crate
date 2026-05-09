# ADR: crate Cleanup & CI (Work Item #8)

**Date:** 2026-05-09
**Author:** Wash (Backend / API)
**Status:** Done

---

## What Was Removed

| Item | Reason |
|------|--------|
| `web/` directory | Extracted to `crate-web` repo by Kaylee (commit 4685d29) |
| `landing/` directory | Extracted to `crate-landing` repo by Inara (commit 5ef1c0d) |
| `.github/workflows/deploy-web.yml` | No longer needed; web deploys from `crate-web` |
| `.github/workflows/deploy-landing.yml` | No longer needed; landing deploys from `crate-landing` |
| Root scripts: `dev:web`, `dev:landing`, `build:web`, `build:landing` | Packages are gone |
| `test` script web portion (`npm --prefix web test`) | Package is gone |
| `WEB_LEXICON` target in `codegen.sh` | `web/src/lexicon/` no longer exists in this repo |

---

## CI Workflow Approach

**File:** `.github/workflows/test.yml`
**Trigger:** `push` to main, `pull_request` against main
**Runner:** `ubuntu-latest`
**Node version:** 22 (pinned, no matrix)

**Single job** (not matrix): `collective-social-api` uses a node-version matrix (20.x + 22.x) but crate pins Node 22 by policy, so a matrix would only verify the one version we care about — no value. `open-social` uses a single job, which was the closer structural match.

**Step shape:**
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: '22'` and `cache: 'npm'`
3. `npm ci` at root (installs prettier)
4. `npm run format:check` (root prettier — catches all packages)
5. Per package (api, importers, lexicons): `npm ci --prefix <pkg>`
6. For api + importers: lint, build/typecheck, test — all `--if-present` so missing scripts don't fail CI
7. `lexicons/` gets only `npm ci` — no test or codegen step (codegen is dev-time; generated output is committed)

**`--if-present` rationale:** The repo is early stage. Most script slots will be filled incrementally. Forgiving CI means the workflow stays green during that growth phase; the team tightens scripts as they're added.

**Action versions mirrored from siblings:** `actions/checkout@v4`, `actions/setup-node@v4` — same as both `collective-social-api` and `open-social`.

---

## Non-Obvious Calls

1. **No codegen in CI.** `lexgen` (`codegen.sh`) requires `@atproto/lex-cli` from `lexicons/node_modules` and reads JSON from `lexicons/social/crate/`. Running it in CI would require `npm ci --prefix lexicons` to install lex-cli and the lexicon JSON to already be present (they are). However, the generated output (`api/src/lexicon/`, `importers/src/lexicon/`) is committed — builds are hermetic by design (Mal's decision in `mal-three-repo-split.md`). Adding a codegen verification step is deferred until there's a clear drift-detection need.

2. **`lexicons/` only gets `npm ci`.** There are no test or lint scripts in `lexicons/package.json`. Installing is still worth doing to surface broken lock files or missing dependencies before a developer hits them locally.

3. **Root `npm ci` before `format:check`.** Prettier is a root devDependency, so the root install must precede the format check. Package-level installs happen after.

4. **`npm run build --if-present` for type-check.** `api/` has a `build` script (`tsc`), which type-checks as a side effect of compilation. There's no separate `typecheck` script in api/. `importers/` has a dedicated `typecheck` script (`tsc --noEmit`), so both are covered.
