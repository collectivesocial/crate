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
const id = 'social.crate.making.project'

export interface Main {
  $type: 'social.crate.making.project'
  /** Project title. */
  title: string
  /** Project category. Determines which kind-specific metadata block is relevant. */
  kind:
    | 'fiber'
    | 'code'
    | 'site'
    | 'garden'
    | 'illustration-set'
    | 'other'
    | (string & {})
  /** Current status of the project. */
  status:
    | 'planning'
    | 'in-progress'
    | 'finished'
    | 'paused'
    | 'abandoned'
    | (string & {})
  /** Project description in markdown. */
  description: string
  /** When work on the project began. */
  startedAt?: string
  /** When the project was completed or abandoned. */
  finishedAt?: string
  /** External links associated with the project. */
  links?: Link[]
  /** Optional cover image for the project. */
  coverImage?: BlobRef
  fiber?: Fiber
  code?: Code
  site?: Site
  garden?: Garden
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

/** An external link associated with a project. */
export interface Link {
  $type?: 'social.crate.making.project#link'
  /** Human-readable label for the link. */
  label?: string
  /** URL of the linked resource. */
  url: string
}

const hashLink = 'link'

export function isLink<V>(v: V) {
  return is$typed(v, id, hashLink)
}

export function validateLink<V>(v: V) {
  return validate<Link & V>(v, id, hashLink)
}

/** Fiber arts metadata. */
export interface Fiber {
  $type?: 'social.crate.making.project#fiber'
  /** Pattern name or identifier. */
  pattern?: string
  /** Yarn name and colorway. */
  yarn?: string
  /** Hook or needle size (e.g. '4.0mm', 'US G/6'). */
  hookSize?: string
  /** URL of the project on Ravelry. */
  ravelryUrl?: string
}

const hashFiber = 'fiber'

export function isFiber<V>(v: V) {
  return is$typed(v, id, hashFiber)
}

export function validateFiber<V>(v: V) {
  return validate<Fiber & V>(v, id, hashFiber)
}

/** Software project metadata. */
export interface Code {
  $type?: 'social.crate.making.project#code'
  /** URL of the source code repository. */
  repo?: string
  /** Primary programming language. */
  language?: string
  /** URL of the live deployed project. */
  deployedUrl?: string
}

const hashCode = 'code'

export function isCode<V>(v: V) {
  return is$typed(v, id, hashCode)
}

export function validateCode<V>(v: V) {
  return validate<Code & V>(v, id, hashCode)
}

/** Website project metadata. */
export interface Site {
  $type?: 'social.crate.making.project#site'
  /** Live URL of the site. */
  url?: string
  /** Your role on the project (e.g. 'designer', 'developer', 'owner'). */
  role?: string
}

const hashSite = 'site'

export function isSite<V>(v: V) {
  return is$typed(v, id, hashSite)
}

export function validateSite<V>(v: V) {
  return validate<Site & V>(v, id, hashSite)
}

/** Garden project metadata. */
export interface Garden {
  $type?: 'social.crate.making.project#garden'
  /** Bed or plot identifier. */
  bedNumber?: string
  /** List of plants in this bed or project. */
  plants?: string[]
  /** USDA hardiness zone (e.g. '7b'). */
  zone?: string
}

const hashGarden = 'garden'

export function isGarden<V>(v: V) {
  return is$typed(v, id, hashGarden)
}

export function validateGarden<V>(v: V) {
  return validate<Garden & V>(v, id, hashGarden)
}
