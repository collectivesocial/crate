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
const id = 'community.lexicon.calendar.event'

export interface Main {
  $type: 'community.lexicon.calendar.event'
  /** Human-readable event name. */
  name: string
  /** Optional event description or agenda. */
  description?: string
  /** Event start date and time. */
  startsAt?: string
  /** Event end date and time. */
  endsAt?: string
  /** Whether the event is virtual, in-person, or hybrid. */
  mode?:
    | 'community.lexicon.calendar.event#virtual'
    | 'community.lexicon.calendar.event#inperson'
    | 'community.lexicon.calendar.event#hybrid'
    | (string & {})
  /** Event status. */
  status?:
    | 'community.lexicon.calendar.event#scheduled'
    | 'community.lexicon.calendar.event#cancelled'
    | 'community.lexicon.calendar.event#postponed'
    | (string & {})
  /** Physical location(s) for in-person or hybrid events. */
  locations?: Location[]
  /** Virtual meeting links or related URLs. */
  uris?: Uri[]
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

/** Physical location for an event. */
export interface Location {
  $type?: 'community.lexicon.calendar.event#location'
  /** Location name (e.g. 'Downtown Library'). */
  name?: string
  /** City or locality. */
  locality?: string
  /** State or region. */
  region?: string
  /** Country. */
  country?: string
}

const hashLocation = 'location'

export function isLocation<V>(v: V) {
  return is$typed(v, id, hashLocation)
}

export function validateLocation<V>(v: V) {
  return validate<Location & V>(v, id, hashLocation)
}

/** A labeled URL associated with an event (e.g. a Zoom link, ticket page, or event website). */
export interface Uri {
  $type?: 'community.lexicon.calendar.event#uri'
  /** URL (e.g. Zoom link, Google Meet link, event page). */
  uri: string
  /** Label for the link (e.g. 'Zoom Meeting', 'Tickets', 'Event Page'). */
  name?: string
}

const hashUri = 'uri'

export function isUri<V>(v: V) {
  return is$typed(v, id, hashUri)
}

export function validateUri<V>(v: V) {
  return validate<Uri & V>(v, id, hashUri)
}
