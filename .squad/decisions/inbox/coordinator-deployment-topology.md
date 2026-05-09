### 2026-05-09T10:26:27-07:00: Deployment topology
**By:** Brittany Ellich (via Squad)
**What:** Each project deploys separately.
- `api/` deploys to the **same server as the rest of the Collective apps** (alongside `collective-social-api` and `open-social`). Must share the OAuth/Postgres setup there. Wash mirrors `collective-social-api` and `open-social` deploy/db/OAuth conventions — same connection patterns, same env var conventions, same migration runner shape.
- `web/` deploys to **GitHub Pages** as a fully static SPA. Vite base path, GH Actions workflow, SPA routing fallback (404.html trick or hash routing) all required. Because web is fully static, **all dynamic concerns (sessions, OAuth callback handling) live in `api/`**. Web talks to api over HTTPS with `credentials: 'include'`.
- `landing/` deploys separately (Astro static). Target TBD by Inara — likely GH Pages or similar.
**Why:** Aligns with how Brittany already deploys the Collective ecosystem; lets crate.social piggyback on existing shared infrastructure.
