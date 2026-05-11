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
const id = 'social.crate.podcast.episode'

export interface Main {
  $type: 'social.crate.podcast.episode'
  /** Episode title. */
  title: string
  /** Episode description or show notes. May contain HTML or markdown depending on feed source. */
  description: string
  /** Direct URL to the episode audio file. */
  audioUrl: string
  /** Name of the podcast show this episode belongs to. */
  showName: string
  /** Original publication date of the episode as declared in the feed. */
  publishedAt: string
  /** Episode duration in seconds. */
  duration?: number
  /** Episode number within the season or show. */
  episodeNumber?: number
  /** Season number. */
  season?: number
  /** Globally unique identifier from the RSS feed, used for deduplication. */
  guid?: string
  /** AT-URI of the social.crate.rss.feed record this episode was imported from. */
  feedRef?: string
  /** Canonical web page URL for the episode, if provided by the feed. */
  episodeUrl?: string
  /** Timestamp when this record was created in the user's PDS. */
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
