# crate.social

crate.social is a custom-lexicon publishing service for [ATProto](https://atproto.com). It defines structured record types (`social.crate.*`) for the things you make — notes, podcast episodes, projects, talks, illustrations — imports from any source (RSS, markdown, manual entry), publishes records to your PDS, and exposes a read API so any frontend can query them.

For the full vision, architecture decisions, and lexicon catalog, see [plan.md](./plan.md).

## Repo layout

```
crate/
├── api/          # backend service (Express, Postgres/Kysely, ATProto OAuth)
├── lexicons/     # social.crate.* lexicon JSON definitions
└── importers/    # source adapters (RSS, markdown)
```

> **Sibling repos:** The web app and landing page have been extracted into separate repositories — [`crate-web`](../crate-web) (React 19 + Vite + Chakra UI) and [`crate-landing`](../crate-landing) (Astro) — so each can deploy independently to GitHub Pages. Both sibling repos read lexicon types from `../crate/lexicons/` via a local `lexgen:local` script.

## Prerequisites

- Node 22 (see `.nvmrc`)
- Postgres (for `api/`)

## Setup (placeholder — packages not yet scaffolded)

```sh
nvm use
npm --prefix api install
```

Convenience scripts at the root:

```sh
npm run dev:api       # start api in watch mode
npm run format        # format all files with prettier
npm run lexgen        # regenerate TS types from lexicons/
```
