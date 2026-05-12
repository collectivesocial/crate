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
const id = 'social.crate.now.config'

export interface Main {
  $type: 'social.crate.now.config'
  /** Ordered list of live feed panels to render alongside the now page. Each entry points at an ATProto collection on some author's PDS and pulls the most recent N records. */
  liveFeeds?: LiveFeed[]
  /** Timestamp when this config was first created. */
  createdAt: string
  /** Timestamp of the most recent edit to this config. */
  updatedAt?: string
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

/** A single live feed panel on the now page. */
export interface LiveFeed {
  $type?: 'social.crate.now.config#liveFeed'
  /** Display title for the panel (e.g. 'Recent Bluesky posts', 'In progress on Collective'). */
  title: string
  /** Author DID to query. Defaults to the now page owner's own DID when omitted. */
  did?: string
  /** Collection NSID to read (e.g. 'app.bsky.feed.post', 'app.collectivesocial.feed.useritem', 'social.crate.content'). */
  collection: string
  /** Number of most recent records to fetch (default 5). */
  limit?: number
  /** Optional renderer-side filter. 'topLevelPosts' (alias 'noReplies') drops app.bsky.feed.post records that have a reply field. 'noReposts' drops repost records when present. */
  filter?:
    | 'social.crate.now.config#topLevelPosts'
    | 'social.crate.now.config#noReplies'
    | 'social.crate.now.config#noReposts'
    | (string & {})
}

const hashLiveFeed = 'liveFeed'

export function isLiveFeed<V>(v: V) {
  return is$typed(v, id, hashLiveFeed)
}

export function validateLiveFeed<V>(v: V) {
  return validate<LiveFeed & V>(v, id, hashLiveFeed)
}
