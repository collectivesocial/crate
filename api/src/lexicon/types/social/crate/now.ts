/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'social.crate.now'

export interface Main {
  $type: 'social.crate.now'
  /** Optional headline markdown shown above any structured sections. Use this for a single unstructured statement, or leave it empty and supply sections instead. */
  body?: string
  /** Optional named sections (e.g. 'Professional', 'Personal') for organizing the now page beyond a single body. Order is preserved. */
  sections?: Section[]
  /** Optional plain-text location (e.g., 'Vancouver, WA'). */
  location?: string
  /** Optional one-line summary for previews and feeds. */
  summary?: string
  /** Timestamp when this now entry was written. The latest by this field is the current now page. */
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

/** A titled section of the now page. Body is markdown. */
export interface Section {
  $type?: 'social.crate.now#section'
  /** Section heading (e.g. 'Professional', 'Personal', 'Reading'). */
  title: string
  /** Section content in markdown. */
  body: string
}

const hashSection = 'section'

export function isSection<V>(v: V) {
  return is$typed(v, id, hashSection)
}

export function validateSection<V>(v: V) {
  return validate<Section & V>(v, id, hashSection)
}
