/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type Auth,
  type Options as XrpcOptions,
  Server as XrpcServer,
  type StreamConfigOrHandler,
  type MethodConfigOrHandler,
  createServer as createXrpcServer,
} from '@atproto/xrpc-server'
import { schemas } from './lexicons.js'

export function createServer(options?: XrpcOptions): Server {
  return new Server(options)
}

export class Server {
  xrpc: XrpcServer
  com: ComNS
  community: CommunityNS
  site: SiteNS
  social: SocialNS

  constructor(options?: XrpcOptions) {
    this.xrpc = createXrpcServer(schemas, options)
    this.com = new ComNS(this)
    this.community = new CommunityNS(this)
    this.site = new SiteNS(this)
    this.social = new SocialNS(this)
  }
}

export class ComNS {
  _server: Server
  atproto: ComAtprotoNS

  constructor(server: Server) {
    this._server = server
    this.atproto = new ComAtprotoNS(server)
  }
}

export class ComAtprotoNS {
  _server: Server
  repo: ComAtprotoRepoNS

  constructor(server: Server) {
    this._server = server
    this.repo = new ComAtprotoRepoNS(server)
  }
}

export class ComAtprotoRepoNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class CommunityNS {
  _server: Server
  lexicon: CommunityLexiconNS

  constructor(server: Server) {
    this._server = server
    this.lexicon = new CommunityLexiconNS(server)
  }
}

export class CommunityLexiconNS {
  _server: Server
  calendar: CommunityLexiconCalendarNS

  constructor(server: Server) {
    this._server = server
    this.calendar = new CommunityLexiconCalendarNS(server)
  }
}

export class CommunityLexiconCalendarNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class SiteNS {
  _server: Server
  standard: SiteStandardNS

  constructor(server: Server) {
    this._server = server
    this.standard = new SiteStandardNS(server)
  }
}

export class SiteStandardNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class SocialNS {
  _server: Server
  crate: SocialCrateNS

  constructor(server: Server) {
    this._server = server
    this.crate = new SocialCrateNS(server)
  }
}

export class SocialCrateNS {
  _server: Server
  making: SocialCrateMakingNS
  note: SocialCrateNoteNS
  rss: SocialCrateRssNS

  constructor(server: Server) {
    this._server = server
    this.making = new SocialCrateMakingNS(server)
    this.note = new SocialCrateNoteNS(server)
    this.rss = new SocialCrateRssNS(server)
  }
}

export class SocialCrateMakingNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class SocialCrateNoteNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class SocialCrateRssNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}
