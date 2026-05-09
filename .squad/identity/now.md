# Now — crate.social

**Focus:** Three-repo split complete (2026-05-09). crate, crate-web, crate-landing initialized with first commits. CI workflow added. Brittany ready to push when she chooses.

**Status:**
- ✅ Three-repo split completed (Mal planning, Kaylee + Inara extraction, Wash cleanup)
- ✅ crate-web/ and crate-landing/ repos initialized with `git init`, first commits
- ✅ crate/ repo cleaned up, no web/ or landing/ directories, no legacy deploy workflows
- ✅ CI workflow added: .github/workflows/test.yml (Node 22 pinned, per-package lint/build/test with --if-present)
- ✅ Codegen strategy: manual per-repo + commit (lexgen:local scripts in crate-web/ and crate-landing/)
- ✅ lexgen-local.sh verified by Simon (all 6 checks pass)
- ⏳ P1 importer strategies accepted (auth: session-JSON v1; idempotency: local .import-state.json sidecar + PDS fallback)

**Repo State:**
- `crate/` (main branch): Commit 36d9056 "split: extract web and landing to sibling repos; add CI" — first real commit after three-repo split
- `crate-web/` (main branch): Commit 4685d29, NOT pushed. Ready for `gh repo create` when Brittany chooses.
- `crate-landing/` (main branch): Commit 5ef1c0d, NOT pushed. Ready for `gh repo create` when Brittany chooses.

**Known flags:**
- Inara skipped eslint config in crate-landing/ (no existing eslint.config.* found, but eslint deps present). Can be added by Brittany later if desired.
- Kaylee made proactive fix: pathSegmentsToKeep in 404.html corrected (0 → 1) for GH Pages subpath routing.

**Next actions:**
1. Brittany decides when to push three repos to GitHub.
2. First real API work (Wash), OAuth flow, or start social.crate.note demo (Zettelkasten).
3. No new Zoe code yet — P1 strategies guide future importer adapters.

**Awaiting:** Brittany's choice on what to build next.
