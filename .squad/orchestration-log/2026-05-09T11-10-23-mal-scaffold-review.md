# Mal — Scaffold Review

**Timestamp:** 2026-05-09T11:10:23-07:00  
**Agent:** Mal (Lead / Architect)  
**Mode:** Background (sonnet)  
**Status:** Complete

## Scope

Light cross-cutting review of all six scaffolds (`lexicons/`, `api/`, `web/`, `landing/`, `importers/`, root config). Identify blocking issues, approve what's solid, flag non-blocking concerns.

## Verdict

**APPROVE WITH FIXES** — 4 blocking flags must be resolved before feature work can begin.

## Blocking Issues

1. **Dev port mismatch** — Vite proxy targets 3002; api runs on 3000. (Kaylee + Wash)
2. **CORS dev whitelist mismatch** — Hardcoded port 5173; Vite runs on 5175. (Wash)
3. **@atproto/api version gap** — `importers/` is `^0.13.35` vs api's `^0.18.3`. (Zoe)
4. **GitHub Pages collision** — Both `deploy-web.yml` and `deploy-landing.yml` target same environment. Brittany decides topology.

## Approved Areas

- Lexicon codegen: solid
- API scaffold: correct per decisions (Express 5, Kysely, Pino, iron-session)
- Web scaffold: correct (static SPA, `credentials: 'include'`, Chakra v3)
- Landing: correct (Astro 5, Tailwind 4, static output)
- Importers: correct structure (ESM, Commander, session-file auth)
- Root config: npm 10, Node 22, Prettier 3 — all correct

## Non-Blocking Notes

- `api/package.json` has a vestigial `lexgen` script
- `importers/` uses Vitest ^2.1.8 (rest use 4)
- `deploy-landing.yml` missing cache optimization flag

## Files Written

- `.squad/decisions/inbox/mal-scaffold-review.md` — Full review with line refs and approval rationale

## Next Downstream

- Scribe: Merge decision into `decisions.md`
- Kaylee: Fix port mismatch (#1)
- Wash: Fix CORS mismatch (#2)
- Zoe: Bump @atproto/api version (#3)
- Brittany: Decide GH Pages topology (#4)
