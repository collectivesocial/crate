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
  social: SocialNS

  constructor(options?: XrpcOptions) {
    this.xrpc = createXrpcServer(schemas, options)
    this.social = new SocialNS(this)
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
  podcast: SocialCratePodcastNS
  rss: SocialCrateRssNS

  constructor(server: Server) {
    this._server = server
    this.making = new SocialCrateMakingNS(server)
    this.podcast = new SocialCratePodcastNS(server)
    this.rss = new SocialCrateRssNS(server)
  }
}

export class SocialCrateMakingNS {
  _server: Server

  constructor(server: Server) {
    this._server = server
  }
}

export class SocialCratePodcastNS {
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
