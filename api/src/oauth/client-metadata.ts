/**
 * ATProto OAuth client metadata for crate.social.
 *
 * Scope string mirrors the open-social pattern:
 *   'atproto repo:<collection> ...'
 *
 * WRITE scopes — all nine social.crate.* record types:
 *   repo:social.crate.rss.feed, repo:social.crate.podcast.episode,
 *   repo:social.crate.making.project, repo:social.crate.making.update,
 *   repo:social.crate.talk, repo:social.crate.illustration,
 *   repo:social.crate.note, repo:social.crate.note.link, repo:social.crate.now
 *
 * READ scopes — external lexicons (public records; ATProto does not require
 * OAuth for reading other users' public repos, so these are not listed here.
 * If crate ever needs to read the *authed user's* records in these namespaces
 * via the PDS's authenticated XRPC, add them as additional repo: scopes):
 *   site.standard.*, community.lexicon.calendar.*,
 *   app.collective.*, app.bsky.feed.post
 *
 * See: open-social/src/middleware/auth.ts — OPENSOCIAL_SCOPES
 */
export const CRATE_SCOPES = [
  'atproto',
  'repo:social.crate.rss.feed',
  'repo:social.crate.podcast.episode',
  'repo:social.crate.making.project',
  'repo:social.crate.making.update',
  'repo:social.crate.talk',
  'repo:social.crate.illustration',
  'repo:social.crate.note',
  'repo:social.crate.note.link',
  'repo:social.crate.now',
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
