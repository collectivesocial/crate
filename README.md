# crate.social

crate.social is a custom-lexicon publishing service for [ATProto](https://atproto.com). It defines structured record types (`social.crate.*`) for the things you make — notes, podcast episodes, projects, talks, illustrations — imports from any source (RSS, markdown, manual entry), publishes records to your PDS, and exposes a read API so any frontend can query them.

For the full vision, architecture decisions, and lexicon catalog, see [plan.md](./plan.md).

## Repo layout

```
crate/
├── api/          # backend service (Express, Postgres/Kysely, ATProto OAuth)
├── lexicons/     # social.crate.* lexicon JSON definitions
├── importers/    # source adapters (RSS, markdown)
└── landing/      # marketing site (Astro + Tailwind) — hibernating until ready to ship
```

> **Sibling repos:** The web app has been extracted into a separate repository — [`crate-web`](../crate-web) (React 19 + Vite + Chakra UI) — so it can deploy independently to GitHub Pages. `crate-web` reads lexicon types from `../crate/lexicons/` via a local `lexgen:local` script. The landing site remains in this repo at `landing/` until it's ready to ship.

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
