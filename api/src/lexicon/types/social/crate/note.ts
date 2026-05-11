/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'social.crate.note'

export interface Main {
  $type: 'social.crate.note'
  /** Note title. */
  title: string
  /** URL-safe identifier for the note, used for stable public URLs. Should be unique within the user's repo. */
  slug: string
  /** Note body in markdown. May contain [[wikilink]] syntax — resolved links are stored as separate social.crate.note.link records. */
  body: string
  /** Freeform tags for categorizing and filtering notes. */
  tags?: string[]
  /** The date this note is considered published. Controls public visibility ordering. */
  publishedAt: string
  /** Timestamp of the most recent edit to this note. */
  updatedAt?: string
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
