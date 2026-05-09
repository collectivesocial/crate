# Session Log: Initial Scaffold Proposal (2026-05-09T10:11:50)

## Request
Brittany asked Mal to propose initial scaffold for crate.social — decompose the repository structure into scoped work items with clear ownership across the team.

## Delivery
Mal delivered a multi-part proposal:

1. **6 Architectural Decisions** (ADR format, in decisions.md):
   - Package manager: npm (not pnpm/yarn/monorepo tooling)
   - Package boundaries: api/, web/, landing/, lexicons/, importers/ as independent packages
   - Shared code: codegen strategy (lex-cli), not shared packages
   - Root tooling: TypeScript per-package, ESLint 9 flat config, Prettier 3, Vitest 4, Node 22.x, npm 10+
   - Migrations & env: Kysely with sequential numeric keys, envalid + dotenv, Pino logging
   - CI: GitHub Actions (test.yml, deploy.yml, Postgres service container)

2. **8 Work Items** with owner assignments:
   - Work 1 (Simon): Scaffold generators & directory structure
   - Work 2 (Wash): Web package setup & Vite integration
   - Work 3 (Kaylee): CI/CD workflows & GitHub Actions
   - Work 4 (Zoe): Migration & PDS integration layer
   - Work 5 (Inara): Lexicon codegen & schema validation
   - Work 6 (Simon): API setup & server layer
   - Work 7 (Wash): Landing package & Astro integration
   - Work 8 (Kaylee): Docker & production deployment

3. **4 Open Questions** for Brittany:
   - Rationale for each decision is in decisions.md

## Key Decisions
- Reject monorepo tooling (workspaces, pnpm, turbo, nx) — siblings use plain npm
- Codegen (lex-cli) instead of workspace package linking
- Node 22.x (upgrade from siblings' pinned 20.x)
- ATProto lexicon schema at repository root, consumed by codegen per-package

## Next Moves
- Brittany reviews decisions & answers 4 open questions
- Each owner (Simon, Wash, Kaylee, Zoe, Inara) begins their assigned work items in priority order
- History files updated with pointers to decisions.md
