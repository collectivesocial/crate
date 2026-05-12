/**
 * Idempotency / deduplication for one-time imports.
 *
 * Goal: never write the same source item twice, even if the import is re-run.
 *
 * TODO — two candidate strategies, decision deferred:
 *
 * Option A — Local sidecar file (.import-state.json):
 *   A JSON file in the working directory (gitignored) that maps
 *   { [contentHash]: { atUri, importedAt } }. The hash is computed from
 *   the source item's stable identifier (GUID for RSS, file path + mtime for
 *   markdown). Fast, zero-network, no PDS dependency. Risk: lost if you change
 *   machines or delete the file.
 *
 * Option B — Query the user's PDS:
 *   Before writing a record, list existing records of that lexicon and check
 *   for a matching source identifier field (e.g. `guid` on podcast.episode,
 *   `slug` on note). Source-of-truth dedup, survives machine changes. Cost:
 *   one extra XRPC list call per import run. Preferred long-term.
 *
 * Both options can coexist: use Option A as a fast-path cache, fall back to
 * Option B on cache miss.
 *
 * For now: placeholder — all functions are no-ops that return "not seen".
 */

export type ContentHash = string;

export async function hasBeenImported(_hash: ContentHash): Promise<boolean> {
  // TODO: check .import-state.json or query PDS
  return false;
}

export async function markImported(
  _hash: ContentHash,
  _atUri: string
): Promise<void> {
  // TODO: write to .import-state.json or record on PDS
}

/**
 * Compute a stable hash for a source item.
 * For RSS: use the item's <guid> or (fallback) the item URL.
 * For markdown: use the file path + frontmatter slug.
 */
export function computeHash(sourceId: string): ContentHash {
  // TODO: replace with a real crypto hash (e.g. sha256 via node:crypto)
  return sourceId;
}
