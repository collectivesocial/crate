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
  /** Human-readable display name for this feed subscription. */
  title: string
  /** NSID of the target lexicon for imported entries (e.g. social.crate.podcast.episode). */
  destination:
    | 'social.crate.podcast.episode'
    | 'site.standard.document'
    | (string & {})
  /** Whether the poller should actively fetch this feed. Defaults to true. */
  active: boolean
  /** Timestamp of the most recent successful poll. */
  lastPolledAt?: string
  /** GUID of the last imported entry, used for deduplication on subsequent polls. */
  lastEntryGuid?: string
  /** Timestamp when this feed subscription was created. */
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
