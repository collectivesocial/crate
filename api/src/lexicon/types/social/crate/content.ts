/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'
import type * as ComAtprotoRepoStrongRef from '../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'social.crate.content'

export interface Main {
  $type: 'social.crate.content'
  /** Discriminator for the content variant. Closed enum in v1; adding new kinds requires a lexicon update. */
  kind:
    | 'illustration'
    | 'article'
    | 'video'
    | 'talk'
    | 'newsletter'
    | 'podcast'
    | 'other'
  /** Optional user-supplied label shown alongside the kind. Most useful when kind is 'other' to describe what the content actually is (e.g. 'zine', 'recipe', 'sticker pack'). Renderers should prefer this label when present and the kind is 'other'. */
  kindLabel?: string
  /** Plain-text title of the content. */
  title: string
  /** URL-safe identifier renderers can use to build stable, human-readable URLs for this content (e.g. `/illustrations/my-zine`). Optional; renderers should fall back to the rkey or another identifier when omitted. Useful when migrating existing content so old URLs don't break. */
  slug?: string
  /** Short markdown summary, abstract, or caption. Appropriate for previews and feeds. */
  description?: string
  /** Full markdown content when this record holds the content itself. Omit when the content lives elsewhere (use canonicalUrl). */
  body?: string
  /** When this piece of content was originally published. */
  publishedAt: string
  /** Canonical URL where the content originally lives (e.g., a YouTube video, a github.blog article, a podcast episode page). When set, renderers should link readers to this URL as the primary destination. */
  canonicalUrl?: string
  /** Cover image, illustration, or thumbnail. */
  image?: BlobRef
  /** Alt text describing the image for screen readers and renderers that need a text fallback. */
  imageAlt?: string
  /** Freeform tags shared across all content kinds. Enables cross-kind filtering. */
  tags?: string[]
  media?: Media
  event?: Event
  series?: Series
  bskyPostRef?: ComAtprotoRepoStrongRef.Main
  /** Timestamp when this record was first created in the user's PDS. */
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

/** Type-specific media URLs and duration. All fields optional; populate whichever apply to the content kind. */
export interface Media {
  $type?: 'social.crate.content#media'
  /** URL of an audio file (used by podcast). */
  audioUrl?: string
  /** URL of a video recording (used by video, talk). */
  videoUrl?: string
  /** URL of a slide deck (used by talk). */
  slidesUrl?: string
  /** Duration in seconds (used by video, podcast, talk). */
  duration?: number
}

const hashMedia = 'media'

export function isMedia<V>(v: V) {
  return is$typed(v, id, hashMedia)
}

export function validateMedia<V>(v: V) {
  return validate<Media & V>(v, id, hashMedia)
}

/** Event metadata for a talk. */
export interface Event {
  $type?: 'social.crate.content#event'
  /** Name of the conference or event. */
  name: string
  /** AT-URI of the community.lexicon.calendar.event record, if one exists. */
  eventRef?: string
  /** Human-readable event location (e.g., 'Seattle, WA'). */
  location?: string
  /** Event date and time. */
  date?: string
}

const hashEvent = 'event'

export function isEvent<V>(v: V) {
  return is$typed(v, id, hashEvent)
}

export function validateEvent<V>(v: V) {
  return validate<Event & V>(v, id, hashEvent)
}

/** Series metadata for a podcast or newsletter. */
export interface Series {
  $type?: 'social.crate.content#series'
  /** Name of the show or publication (e.g., 'Overcommitted', 'The Balanced Engineer'). */
  name: string
  /** Episode or issue number within the series. */
  episodeNumber?: number
  /** Season number, if the series uses seasons. */
  season?: number
  /** Canonical RSS or Atom feed URL for the series. */
  feedUrl?: string
}

const hashSeries = 'series'

export function isSeries<V>(v: V) {
  return is$typed(v, id, hashSeries)
}

export function validateSeries<V>(v: V) {
  return validate<Series & V>(v, id, hashSeries)
}
