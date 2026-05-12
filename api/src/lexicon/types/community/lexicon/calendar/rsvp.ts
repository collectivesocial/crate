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
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'community.lexicon.calendar.rsvp'

export interface Main {
  $type: 'community.lexicon.calendar.rsvp'
  subject: ComAtprotoRepoStrongRef.Main
  /** Whether the author is going, interested, or not going. */
  status:
    | 'community.lexicon.calendar.rsvp#going'
    | 'community.lexicon.calendar.rsvp#interested'
    | 'community.lexicon.calendar.rsvp#notgoing'
    | (string & {})
  /** Timestamp when this RSVP record was created. */
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
