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
const id = 'social.crate.note.link'

export interface Main {
  $type: 'social.crate.note.link'
  /** AT-URI of the social.crate.note that contains this link. */
  source: string
  target: Target
  /** The surrounding sentence, paragraph, or annotation that contains this link in the source note. Used for rich backlink previews. */
  context?: string
  /** The visible link text or [[wikilink]] phrase as it appeared in the source note. */
  anchorText?: string
  /** Timestamp when this link record was created. */
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

/** Link destination. Exactly one of atUri or externalUrl should be set. atUri is preferred for federated records (notes, books, episodes, talks). externalUrl is used for external web resources or unresolved [[wikilinks]]. */
export interface Target {
  $type?: 'social.crate.note.link#target'
  /** AT-URI of the target record when the link resolves to an ATProto resource. */
  atUri?: string
  /** External URL when the target is outside the AT network (or the [[wikilink]] has not yet been resolved to a record). */
  externalUrl?: string
  /** Human-readable title of the link target, stored for display without requiring a round-trip. */
  title?: string
  /** Optional short description or excerpt of the link target. */
  description?: string
}

const hashTarget = 'target'

export function isTarget<V>(v: V) {
  return is$typed(v, id, hashTarget)
}

export function validateTarget<V>(v: V) {
  return validate<Target & V>(v, id, hashTarget)
}
