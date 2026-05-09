# Now — crate.social

**Focus:** Scaffold review complete (2026-05-09). All five packages approved with 4 blocking fixes. P0 questions resolved. 3 simple fixes in-flight. Awaiting Brittany's GitHub Pages topology decision before commit + CI.

**Status:**
- ✅ All five top-level packages have working skeletons (`api/`, `web/`, `landing/`, `lexicons/`, `importers/`)
- ✅ P0 questions resolved: backend mirror choice (open-social), OAuth scopes (write-only), Collective namespace (app.collectivesocial.*)
- ✅ Mal's scaffold review complete: APPROVE WITH FIXES
- ⏳ 3 blocking fixes in-flight (Kaylee port, Wash CORS, Zoe deps)
- ⏳ 1 blocking decision pending (GH Pages topology — Brittany)

**Blocking issues to fix (before commit + CI):**
1. **Dev port mismatch** (Kaylee) — Vite proxy: 3002 vs api: 3000. Pick one, be consistent.
2. **CORS dev whitelist** (Wash) — Hardcoded port 5173 vs Vite: 5175. Update whitelist or use env var.
3. **@atproto/api version** (Zoe) — importers/ ^0.13.35 vs api's ^0.18.3. Bump to ^0.18.3, run npm install.
4. **GitHub Pages collision** (Brittany) — Both deploy-web.yml + deploy-landing.yml target same environment. Decide topology (A/B/C in `mal-scaffold-review.md`).

**Next actions:**
1. Kaylee: Fix port mismatch.
2. Wash: Fix CORS mismatch.
3. Zoe: Bump @atproto/api.
4. Brittany: Decide GH Pages topology.
5. Scribe: Once #4 decided, stage & commit all fixed files.
6. CI work begins (Work Item #8).

**Awaiting:** Brittany's decision, fixes to merge, then CI setup.
