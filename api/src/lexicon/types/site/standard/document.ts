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
const id = 'site.standard.document'

export interface Main {
  $type: 'site.standard.document'
  /** Points to a publication record (at://) or a publication url (https://) for loose documents. Avoid trailing slashes. */
  site: string
  /** Combine with site or publication url to construct a canonical URL to the document. Prepend with a leading slash. */
  path?: string
  /** Title of the document. */
  title: string
  /** A brief description or excerpt from the document. */
  description?: string
  /** Image to use for thumbnail or cover image. */
  coverImage?: BlobRef
  /** Plaintext representation of the document's contents. Should not contain markdown or other formatting. */
  textContent?: string
  bskyPostRef?: ComAtprotoRepoStrongRef.Main
  /** Tags used to categorize the document. Avoid prepending tags with hashtags. */
  tags?: string[]
  /** Timestamp of the document's publish time. */
  publishedAt: string
  /** Timestamp of the document's last edit. */
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
