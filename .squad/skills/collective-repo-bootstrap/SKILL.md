# Skill: Collective Repo Bootstrap

**Confidence:** low
**Author:** Mal
**Date:** 2026-05-09

## What this captures

Pattern for bootstrapping a new repo in the Collective ecosystem (collective-social-api, open-social, collective-social-web, open-social-web, collective-landing, open-landing, crate).

## Stack choices (verified 2026-05-09)

| Concern | Choice |
|---------|--------|
| Package manager | npm + package-lock.json |
| Monorepo tooling | None — each folder/repo is independent |
| Node version | 22.x LTS (CI may pin 20) |
| TypeScript | ~5.9, per-package tsconfig |
| API framework | Express 5 |
| ORM / query builder | Kysely 0.28 + pg |
| Migrations | Sequential numeric (`001_*.ts`), custom `scripts/migrate.ts` with Kysely FileMigrationProvider + tsx |
| Env validation | envalid + dotenv |
| Logger | Pino (never console.*) |
| Auth | @atproto/oauth-client-node + iron-session |
| Web framework | React 19 + Vite 7 + Chakra UI v3 |
| Landing framework | Astro 5 + Tailwind 4 |
| Test | Vitest 4 (node env for api, jsdom for web) |
| Lint | ESLint 9 flat config + typescript-eslint |
| Format | Prettier 3 |
| CI | GitHub Actions, Postgres service container for integration tests |

## Bootstrap steps

1. Create `package.json` with name, scripts (dev, build, test, lint, format)
2. Create `tsconfig.json` matching target (commonjs for APIs, bundler for web)
3. Create `eslint.config.js` (flat config)
4. Add `.prettierrc` or inline in package.json
5. Add `Dockerfile` and `docker-compose.yml` for API repos
6. Add `.github/workflows/test.yml` and `deploy.yml`
7. Add `scripts/migrate.ts` for API repos with Postgres

## Notes

- No shared packages between api and web — they communicate via HTTP
- Lexicon types shared via `@atproto/lex-cli` codegen, output committed to each consumer's `src/lexicon/`
- All repos use named exports, never default exports
