/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from '@atproto/xrpc'
import { schemas } from './lexicons.js'
import { CID } from 'multiformats/cid'
import { type OmitKey, type Un$Typed } from './util.js'
import * as CommunityLexiconCalendarEvent from './types/community/lexicon/calendar/event.js'
import * as SocialCrateContent from './types/social/crate/content.js'
import * as SocialCrateMakingProject from './types/social/crate/making/project.js'
import * as SocialCrateMakingUpdate from './types/social/crate/making/update.js'
import * as SocialCrateNote from './types/social/crate/note.js'
import * as SocialCrateNoteLink from './types/social/crate/note/link.js'
import * as SocialCrateNow from './types/social/crate/now.js'
import * as SocialCrateRssFeed from './types/social/crate/rss/feed.js'

export * as CommunityLexiconCalendarEvent from './types/community/lexicon/calendar/event.js'
export * as SocialCrateContent from './types/social/crate/content.js'
export * as SocialCrateMakingProject from './types/social/crate/making/project.js'
export * as SocialCrateMakingUpdate from './types/social/crate/making/update.js'
export * as SocialCrateNote from './types/social/crate/note.js'
export * as SocialCrateNoteLink from './types/social/crate/note/link.js'
export * as SocialCrateNow from './types/social/crate/now.js'
export * as SocialCrateRssFeed from './types/social/crate/rss/feed.js'

export class AtpBaseClient extends XrpcClient {
  community: CommunityNS
  social: SocialNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.community = new CommunityNS(this)
    this.social = new SocialNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class CommunityNS {
  _client: XrpcClient
  lexicon: CommunityLexiconNS

  constructor(client: XrpcClient) {
    this._client = client
    this.lexicon = new CommunityLexiconNS(client)
  }
}

export class CommunityLexiconNS {
  _client: XrpcClient
  calendar: CommunityLexiconCalendarNS

  constructor(client: XrpcClient) {
    this._client = client
    this.calendar = new CommunityLexiconCalendarNS(client)
  }
}

export class CommunityLexiconCalendarNS {
  _client: XrpcClient
  event: CommunityLexiconCalendarEventRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.event = new CommunityLexiconCalendarEventRecord(client)
  }
}

export class CommunityLexiconCalendarEventRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: CommunityLexiconCalendarEvent.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'community.lexicon.calendar.event',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: CommunityLexiconCalendarEvent.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'community.lexicon.calendar.event',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<CommunityLexiconCalendarEvent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'community.lexicon.calendar.event'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<CommunityLexiconCalendarEvent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'community.lexicon.calendar.event'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'community.lexicon.calendar.event', ...params },
      { headers },
    )
  }
}

export class SocialNS {
  _client: XrpcClient
  crate: SocialCrateNS

  constructor(client: XrpcClient) {
    this._client = client
    this.crate = new SocialCrateNS(client)
  }
}

export class SocialCrateNS {
  _client: XrpcClient
  content: SocialCrateContentRecord
  note: SocialCrateNoteRecord
  now: SocialCrateNowRecord
  making: SocialCrateMakingNS
  note: SocialCrateNoteNS
  rss: SocialCrateRssNS

  constructor(client: XrpcClient) {
    this._client = client
    this.making = new SocialCrateMakingNS(client)
    this.note = new SocialCrateNoteNS(client)
    this.rss = new SocialCrateRssNS(client)
    this.content = new SocialCrateContentRecord(client)
    this.note = new SocialCrateNoteRecord(client)
    this.now = new SocialCrateNowRecord(client)
  }
}

export class SocialCrateMakingNS {
  _client: XrpcClient
  project: SocialCrateMakingProjectRecord
  update: SocialCrateMakingUpdateRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.project = new SocialCrateMakingProjectRecord(client)
    this.update = new SocialCrateMakingUpdateRecord(client)
  }
}

export class SocialCrateMakingProjectRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateMakingProject.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.making.project',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: SocialCrateMakingProject.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.making.project',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateMakingProject.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.making.project'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateMakingProject.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.making.project'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.making.project', ...params },
      { headers },
    )
  }
}

export class SocialCrateMakingUpdateRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateMakingUpdate.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.making.update',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: SocialCrateMakingUpdate.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.making.update',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateMakingUpdate.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.making.update'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateMakingUpdate.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.making.update'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.making.update', ...params },
      { headers },
    )
  }
}

export class SocialCrateNoteNS {
  _client: XrpcClient
  link: SocialCrateNoteLinkRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.link = new SocialCrateNoteLinkRecord(client)
  }
}

export class SocialCrateNoteLinkRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateNoteLink.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.note.link',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: SocialCrateNoteLink.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.note.link',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNoteLink.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.note.link'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNoteLink.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.note.link'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.note.link', ...params },
      { headers },
    )
  }
}

export class SocialCrateRssNS {
  _client: XrpcClient
  feed: SocialCrateRssFeedRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.feed = new SocialCrateRssFeedRecord(client)
  }
}

export class SocialCrateRssFeedRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateRssFeed.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.rss.feed',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: SocialCrateRssFeed.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.rss.feed',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateRssFeed.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.rss.feed'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateRssFeed.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.rss.feed'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.rss.feed', ...params },
      { headers },
    )
  }
}

export class SocialCrateContentRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateContent.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.content',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: SocialCrateContent.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.content',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateContent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.content'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateContent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.content'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.content', ...params },
      { headers },
    )
  }
}

export class SocialCrateNoteRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateNote.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.note',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: SocialCrateNote.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.note',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.note'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.note'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.note', ...params },
      { headers },
    )
  }
}

export class SocialCrateNowRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: SocialCrateNow.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'social.crate.now',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: SocialCrateNow.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'social.crate.now',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNow.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.now'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<SocialCrateNow.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'social.crate.now'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'social.crate.now', ...params },
      { headers },
    )
  }
}
