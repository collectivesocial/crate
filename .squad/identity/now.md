# Now — crate.social

**Focus:** Initial scaffold complete (2026-05-09). All five top-level packages now have working skeletons — `api/` (Express + Kysely + OAuth), `web/` (Vite + React 19 + Chakra v3 teal), `landing/` (Astro 5 + Tailwind 4), `lexicons/` (codegen pipeline ready), `importers/` (Commander CLI harness). Decisions locked in `.squad/decisions.md`. 

**Next actions (Brittany's call):**
1. Answer 5 open questions from Inara (landing) + 2 from Zoe (importers auth/idempotency).
2. Run `npm install` at root + each package level.
3. Run `npm run lexgen` to generate initial lexicon types.
4. Trigger Work Item #7 (root config files + git init + first commit) or proceed directly to CI setup (Work Item #8).

**Awaiting:** npm install to succeed, then codegen to run, then CI workflows (Work Item #8).
