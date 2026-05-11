/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  SocialCrateIllustration: {
    lexicon: 1,
    id: 'social.crate.illustration',
    defs: {
      main: {
        type: 'record',
        description: 'A stick-figure illustration or piece of artwork.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['caption', 'image', 'createdAt'],
          properties: {
            title: {
              type: 'string',
              maxGraphemes: 200,
              maxLength: 2000,
              description: 'Optional title for the illustration.',
            },
            caption: {
              type: 'string',
              maxGraphemes: 1000,
              maxLength: 10000,
              description: 'Caption or alt text describing the illustration.',
            },
            image: {
              type: 'blob',
              description: 'The illustration image file.',
              accept: [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'image/svg+xml',
              ],
              maxSize: 2000000,
            },
            topic: {
              type: 'string',
              maxGraphemes: 200,
              maxLength: 2000,
              description: 'Subject or topic the illustration depicts.',
            },
            sourcePost: {
              type: 'string',
              format: 'at-uri',
              description:
                'AT-URI of the post or note this illustration was originally created for, if any.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this record was created.',
            },
          },
        },
      },
    },
  },
  SocialCrateMakingUpdate: {
    lexicon: 1,
    id: 'social.crate.making.update',
    defs: {
      main: {
        type: 'record',
        description:
          'A progress update or journal entry attached to a making project.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['project', 'body', 'createdAt'],
          properties: {
            project: {
              type: 'string',
              format: 'at-uri',
              description:
                'AT-URI of the social.crate.making.project this update belongs to.',
            },
            body: {
              type: 'string',
              maxGraphemes: 10000,
              maxLength: 100000,
              description: 'Update body text in markdown.',
            },
            photos: {
              type: 'array',
              description: 'Optional photos attached to this update.',
              maxLength: 10,
              items: {
                type: 'blob',
                accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                maxSize: 2000000,
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this update was created.',
            },
          },
        },
      },
    },
  },
  SocialCrateNote: {
    lexicon: 1,
    id: 'social.crate.note',
    defs: {
      main: {
        type: 'record',
        description:
          'A Zettelkasten-style PKM note. Links to other notes via social.crate.note.link records.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['title', 'slug', 'body', 'publishedAt', 'createdAt'],
          properties: {
            title: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description: 'Note title.',
            },
            slug: {
              type: 'string',
              maxGraphemes: 100,
              maxLength: 1000,
              description:
                "URL-safe identifier for the note, used for stable public URLs. Should be unique within the user's repo.",
            },
            body: {
              type: 'string',
              maxGraphemes: 100000,
              maxLength: 1000000,
              description:
                'Note body in markdown. May contain [[wikilink]] syntax — resolved links are stored as separate social.crate.note.link records.',
            },
            tags: {
              type: 'array',
              description:
                'Freeform tags for categorizing and filtering notes.',
              maxLength: 30,
              items: {
                type: 'string',
                maxGraphemes: 64,
                maxLength: 640,
              },
            },
            publishedAt: {
              type: 'string',
              format: 'datetime',
              description:
                'The date this note is considered published. Controls public visibility ordering.',
            },
            updatedAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of the most recent edit to this note.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                "Timestamp when this record was first created in the user's PDS.",
            },
          },
        },
      },
    },
  },
  SocialCrateNow: {
    lexicon: 1,
    id: 'social.crate.now',
    defs: {
      main: {
        type: 'record',
        description:
          "A 'now' page entry describing what the author is currently focused on. Append-only stream — the most recent record by createdAt is the current now page.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['body', 'createdAt'],
          properties: {
            body: {
              type: 'string',
              maxGraphemes: 10000,
              maxLength: 100000,
              description:
                'Now page content in markdown. Describes what the author is currently doing, making, reading, or focused on.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Timestamp when this now entry was written. The latest by this field is the current now page.',
            },
          },
        },
      },
    },
  },
  SocialCratePodcastEpisode: {
    lexicon: 1,
    id: 'social.crate.podcast.episode',
    defs: {
      main: {
        type: 'record',
        description:
          'An individual podcast episode, typically imported from an RSS feed.',
        key: 'tid',
        record: {
          type: 'object',
          required: [
            'title',
            'description',
            'audioUrl',
            'showName',
            'publishedAt',
            'createdAt',
          ],
          properties: {
            title: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description: 'Episode title.',
            },
            description: {
              type: 'string',
              maxGraphemes: 10000,
              maxLength: 100000,
              description:
                'Episode description or show notes. May contain HTML or markdown depending on feed source.',
            },
            audioUrl: {
              type: 'string',
              format: 'uri',
              description: 'Direct URL to the episode audio file.',
            },
            showName: {
              type: 'string',
              maxGraphemes: 200,
              maxLength: 2000,
              description: 'Name of the podcast show this episode belongs to.',
            },
            publishedAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Original publication date of the episode as declared in the feed.',
            },
            duration: {
              type: 'integer',
              description: 'Episode duration in seconds.',
              minimum: 0,
            },
            episodeNumber: {
              type: 'integer',
              description: 'Episode number within the season or show.',
              minimum: 0,
            },
            season: {
              type: 'integer',
              description: 'Season number.',
              minimum: 1,
            },
            guid: {
              type: 'string',
              maxLength: 2048,
              description:
                'Globally unique identifier from the RSS feed, used for deduplication.',
            },
            feedRef: {
              type: 'string',
              format: 'at-uri',
              description:
                'AT-URI of the social.crate.rss.feed record this episode was imported from.',
            },
            episodeUrl: {
              type: 'string',
              format: 'uri',
              description:
                'Canonical web page URL for the episode, if provided by the feed.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                "Timestamp when this record was created in the user's PDS.",
            },
          },
        },
      },
    },
  },
  SocialCrateRssFeed: {
    lexicon: 1,
    id: 'social.crate.rss.feed',
    defs: {
      main: {
        type: 'record',
        description:
          'A subscribed RSS or Atom feed with a configured destination lexicon for imported entries.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['url', 'title', 'destination', 'createdAt'],
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              description: 'The URL of the RSS or Atom feed.',
            },
            title: {
              type: 'string',
              maxGraphemes: 200,
              maxLength: 2000,
              description:
                'Human-readable display name for this feed subscription.',
            },
            destination: {
              type: 'string',
              maxLength: 128,
              description:
                'NSID of the target lexicon for imported entries (e.g. social.crate.podcast.episode).',
              knownValues: [
                'social.crate.podcast.episode',
                'site.standard.document',
              ],
            },
            active: {
              type: 'boolean',
              description:
                'Whether the poller should actively fetch this feed. Defaults to true.',
              default: true,
            },
            lastPolledAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of the most recent successful poll.',
            },
            lastEntryGuid: {
              type: 'string',
              maxLength: 2048,
              description:
                'GUID of the last imported entry, used for deduplication on subsequent polls.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this feed subscription was created.',
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  SocialCrateIllustration: 'social.crate.illustration',
  SocialCrateMakingUpdate: 'social.crate.making.update',
  SocialCrateNote: 'social.crate.note',
  SocialCrateNow: 'social.crate.now',
  SocialCratePodcastEpisode: 'social.crate.podcast.episode',
  SocialCrateRssFeed: 'social.crate.rss.feed',
} as const
