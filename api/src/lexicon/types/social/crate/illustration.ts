/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'social.crate.illustration'

export interface Main {
  $type: 'social.crate.illustration'
  /** Optional title for the illustration. */
  title?: string
  /** Caption or alt text describing the illustration. */
  caption: string
  /** The illustration image file. */
  image: BlobRef
  /** Subject or topic the illustration depicts. */
  topic?: string
  /** AT-URI of the post or note this illustration was originally created for, if any. */
  sourcePost?: string
  /** Timestamp when this record was created. */
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
