/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'social.crate.rss.feed'

export interface Main {
  $type: 'social.crate.rss.feed'
  /** The URL of the RSS or Atom feed. */
  url: string
  /** Human-readable display name for this feed. */
  title: string
  /** Optional short description of the feed. */
  description?: string
  /** Optional URL of the human-readable home page that publishes this feed (e.g. the blog or podcast homepage). */
  siteUrl?: string
  /** Optional NSID of the target lexicon for imported entries (used by importer pipelines, e.g. social.crate.content). Leave unset for plain feed links you just want to reference. */
  destination?: string
  /** Whether an importer should actively fetch this feed. Defaults to false so adding a feed link doesn't accidentally enable polling. */
  active: boolean
  /** Timestamp of the most recent successful poll (importer bookkeeping). */
  lastPolledAt?: string
  /** GUID of the last imported entry, used by importers for deduplication. */
  lastEntryGuid?: string
  /** Timestamp when this feed record was created. */
  createdAt: string
  [k: string]: unknown
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true)
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
}
