/**
 * ATProto OAuth client metadata for crate.social.
 *
 * Scope philosophy: ask for the minimum needed to do crate's job.
 *
 * - `atproto` (required) — base OAuth grant.
 *
 * - `repo:<NSID>` — one per lexicon crate WRITES to the user's PDS. Granular
 *   scopes are preferred over `transition:generic` so users see exactly what
 *   crate can write and so a compromised crate token can't touch unrelated
 *   collections (e.g. app.bsky.feed.post).
 *
 * - `blob:<mime>` — required for `com.atproto.repo.uploadBlob`. Each blob
 *   scope is granular to a mime type / pattern. We grant the image types
 *   declared as `accept` in our lexicons (content.image, document.coverImage,
 *   making.project.coverImage).
 *
 * Reads:
 *   - Profile (handle, avatar, displayName) is fetched from the unauthenticated
 *     public Bluesky AppView (https://public.api.bsky.app) — no scope needed.
 *     See src/routes/session.ts.
 *   - Reading anyone's public ATProto records (site.standard.*, app.bsky.*,
 *     app.collectivesocial.*, community.lexicon.*, social.crate.* from other
 *     users) is unauthenticated — no scope needed.
 *
 * Adding a new lexicon to crate? Add its repo:<NSID> here. Adding a new
 * accepted image mime type? Add a matching blob:<mime> below.
 *
 * Reference: open-social/src/middleware/auth.ts — OPENSOCIAL_SCOPES.
 */
export const CRATE_SCOPES = [
  'atproto',
  // social.crate.* — crate's own lexicons
  'repo:social.crate.rss.feed',
  'repo:social.crate.content',
  'repo:social.crate.making.project',
  'repo:social.crate.making.update',
  'repo:social.crate.note',
  'repo:social.crate.note.link',
  'repo:social.crate.now',
  // External lexicons crate WRITES on the user's behalf
  'repo:community.lexicon.calendar.event',
  'repo:site.standard.document',
  'repo:site.standard.publication',
  // Blob uploads — image mime types accepted by our lexicons.
  'blob:image/jpeg',
  'blob:image/png',
  'blob:image/webp',
  'blob:image/gif',
  'blob:image/svg+xml',
].join(' ');

/**
 * Build ATProto OAuth client metadata for a given service URL.
 * Called by src/oauth/index.ts when constructing NodeOAuthClient.
 */
export function buildClientMetadata(serviceUrl: string) {
  return {
    client_name: 'crate.social',
    client_id: `${serviceUrl}/oauth-client-metadata.json`,
    jwks_uri: `${serviceUrl}/.well-known/jwks.json`,
    redirect_uris: [`${serviceUrl}/oauth/callback`] as [string, ...string[]],
    scope: CRATE_SCOPES,
    grant_types: ['authorization_code', 'refresh_token'] as ['authorization_code', 'refresh_token'],
    response_types: ['code'] as ['code'],
    application_type: 'web' as const,
    // token_endpoint_auth_method set dynamically in oauth/index.ts
    // based on whether a private keyset is configured.
    dpop_bound_access_tokens: true,
  };
}
