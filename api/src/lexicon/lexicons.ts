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
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: 'com.atproto.repo.strongRef',
    description:
      'Vendored copy of com.atproto.repo.strongRef so other lexicons in this directory can reference it via `ref`. A strong ref binds a target record by both its AT-URI and CID.',
    defs: {
      main: {
        type: 'object',
        required: ['uri', 'cid'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
        },
      },
    },
  },
  CommunityLexiconCalendarEvent: {
    lexicon: 1,
    id: 'community.lexicon.calendar.event',
    defs: {
      main: {
        type: 'record',
        description:
          "A calendar event. Stored in the author's PDS repo. Compatible with the Lexicon Community calendar event lexicon used by Smoke Signal and other ATProto event apps.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: {
              type: 'string',
              maxLength: 256,
              description: 'Human-readable event name.',
            },
            description: {
              type: 'string',
              maxLength: 2048,
              description: 'Optional event description or agenda.',
            },
            startsAt: {
              type: 'string',
              format: 'datetime',
              description: 'Event start date and time.',
            },
            endsAt: {
              type: 'string',
              format: 'datetime',
              description: 'Event end date and time.',
            },
            mode: {
              type: 'string',
              knownValues: [
                'community.lexicon.calendar.event#virtual',
                'community.lexicon.calendar.event#inperson',
                'community.lexicon.calendar.event#hybrid',
              ],
              description:
                'Whether the event is virtual, in-person, or hybrid.',
            },
            status: {
              type: 'string',
              knownValues: [
                'community.lexicon.calendar.event#scheduled',
                'community.lexicon.calendar.event#cancelled',
                'community.lexicon.calendar.event#postponed',
              ],
              description: 'Event status.',
            },
            locations: {
              type: 'array',
              description:
                'Physical location(s) for in-person or hybrid events.',
              items: {
                type: 'ref',
                ref: 'lex:community.lexicon.calendar.event#location',
              },
            },
            uris: {
              type: 'array',
              description: 'Virtual meeting links or related URLs.',
              items: {
                type: 'ref',
                ref: 'lex:community.lexicon.calendar.event#uri',
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this record was created.',
            },
          },
        },
      },
      location: {
        type: 'object',
        description: 'Physical location for an event.',
        properties: {
          name: {
            type: 'string',
            maxLength: 256,
            description: "Location name (e.g. 'Downtown Library').",
          },
          locality: {
            type: 'string',
            maxLength: 256,
            description: 'City or locality.',
          },
          region: {
            type: 'string',
            maxLength: 256,
            description: 'State or region.',
          },
          country: {
            type: 'string',
            maxLength: 256,
            description: 'Country.',
          },
        },
      },
      uri: {
        type: 'object',
        description:
          'A labeled URL associated with an event (e.g. a Zoom link, ticket page, or event website).',
        required: ['uri'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
            description: 'URL (e.g. Zoom link, Google Meet link, event page).',
          },
          name: {
            type: 'string',
            maxLength: 256,
            description:
              "Label for the link (e.g. 'Zoom Meeting', 'Tickets', 'Event Page').",
          },
        },
      },
    },
  },
  SiteStandardDocument: {
    lexicon: 1,
    id: 'site.standard.document',
    defs: {
      main: {
        type: 'record',
        description:
          'Vendored copy of the site.standard.document lexicon. A long-form document published on the web; may be standalone or part of a publication. Compatible with Offprint, Leaflet, pckt.blog, and other standard.site implementations. Source: https://standard.site/docs/lexicons/document/',
        key: 'tid',
        record: {
          type: 'object',
          required: ['site', 'title', 'publishedAt'],
          properties: {
            site: {
              type: 'string',
              format: 'uri',
              description:
                'Points to a publication record (at://) or a publication url (https://) for loose documents. Avoid trailing slashes.',
            },
            path: {
              type: 'string',
              description:
                'Combine with site or publication url to construct a canonical URL to the document. Prepend with a leading slash.',
            },
            title: {
              type: 'string',
              maxLength: 5000,
              maxGraphemes: 500,
              description: 'Title of the document.',
            },
            description: {
              type: 'string',
              maxLength: 30000,
              maxGraphemes: 3000,
              description: 'A brief description or excerpt from the document.',
            },
            coverImage: {
              type: 'blob',
              description: 'Image to use for thumbnail or cover image.',
              accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
              maxSize: 1000000,
            },
            textContent: {
              type: 'string',
              description:
                "Plaintext representation of the document's contents. Should not contain markdown or other formatting.",
            },
            bskyPostRef: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'Strong reference to a Bluesky post. Useful to keep track of comments off-platform.',
            },
            tags: {
              type: 'array',
              description:
                'Tags used to categorize the document. Avoid prepending tags with hashtags.',
              items: {
                type: 'string',
                maxLength: 1280,
                maxGraphemes: 128,
              },
            },
            publishedAt: {
              type: 'string',
              format: 'datetime',
              description: "Timestamp of the document's publish time.",
            },
            updatedAt: {
              type: 'string',
              format: 'datetime',
              description: "Timestamp of the document's last edit.",
            },
          },
        },
      },
    },
  },
  SocialCrateContent: {
    lexicon: 1,
    id: 'social.crate.content',
    defs: {
      main: {
        type: 'record',
        description:
          'A unified record type for things the author has made: illustrations, articles, videos, talks, newsletters, podcasts. The kind field discriminates the variant; type-specific fields (media, event, series) are optional sub-objects. Long-form blog posts and newsletters whose body lives elsewhere (e.g., site.standard.document on Offprint) should use canonicalUrl rather than body.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['kind', 'title', 'publishedAt', 'createdAt'],
          properties: {
            kind: {
              type: 'string',
              enum: [
                'illustration',
                'article',
                'video',
                'talk',
                'newsletter',
                'podcast',
                'other',
              ],
              description:
                'Discriminator for the content variant. Closed enum in v1; adding new kinds requires a lexicon update.',
            },
            kindLabel: {
              type: 'string',
              maxGraphemes: 100,
              maxLength: 1000,
              description:
                "Optional user-supplied label shown alongside the kind. Most useful when kind is 'other' to describe what the content actually is (e.g. 'zine', 'recipe', 'sticker pack'). Renderers should prefer this label when present and the kind is 'other'.",
            },
            title: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description: 'Plain-text title of the content.',
            },
            description: {
              type: 'string',
              maxGraphemes: 5000,
              maxLength: 50000,
              description:
                'Short markdown summary, abstract, or caption. Appropriate for previews and feeds.',
            },
            body: {
              type: 'string',
              maxGraphemes: 100000,
              maxLength: 1000000,
              description:
                'Full markdown content when this record holds the content itself. Omit when the content lives elsewhere (use canonicalUrl).',
            },
            publishedAt: {
              type: 'string',
              format: 'datetime',
              description:
                'When this piece of content was originally published.',
            },
            canonicalUrl: {
              type: 'string',
              format: 'uri',
              description:
                'Canonical URL where the content originally lives (e.g., a YouTube video, a github.blog article, a podcast episode page). When set, renderers should link readers to this URL as the primary destination.',
            },
            image: {
              type: 'blob',
              description: 'Cover image, illustration, or thumbnail.',
              accept: [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'image/svg+xml',
              ],
              maxSize: 2000000,
            },
            imageAlt: {
              type: 'string',
              maxGraphemes: 2000,
              maxLength: 20000,
              description:
                'Alt text describing the image for screen readers and renderers that need a text fallback.',
            },
            tags: {
              type: 'array',
              description:
                'Freeform tags shared across all content kinds. Enables cross-kind filtering.',
              maxLength: 30,
              items: {
                type: 'string',
                maxGraphemes: 64,
                maxLength: 640,
              },
            },
            media: {
              type: 'ref',
              ref: 'lex:social.crate.content#media',
              description:
                'Type-specific media references (audio, video, slides, duration). Used by video, podcast, talk.',
            },
            event: {
              type: 'ref',
              ref: 'lex:social.crate.content#event',
              description: 'Event metadata. Used by talk.',
            },
            series: {
              type: 'ref',
              ref: 'lex:social.crate.content#series',
              description: 'Series metadata. Used by podcast, newsletter.',
            },
            bskyPostRef: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'Strong reference to a Bluesky post. Useful for off-platform comments, or to crosslink an illustration / article / video / talk to its announcement post.',
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
      media: {
        type: 'object',
        description:
          'Type-specific media URLs and duration. All fields optional; populate whichever apply to the content kind.',
        properties: {
          audioUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL of an audio file (used by podcast).',
          },
          videoUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL of a video recording (used by video, talk).',
          },
          slidesUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL of a slide deck (used by talk).',
          },
          duration: {
            type: 'integer',
            minimum: 0,
            description: 'Duration in seconds (used by video, podcast, talk).',
          },
        },
      },
      event: {
        type: 'object',
        description: 'Event metadata for a talk.',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
            description: 'Name of the conference or event.',
          },
          eventRef: {
            type: 'string',
            format: 'at-uri',
            description:
              'AT-URI of the community.lexicon.calendar.event record, if one exists.',
          },
          location: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
            description: "Human-readable event location (e.g., 'Seattle, WA').",
          },
          date: {
            type: 'string',
            format: 'datetime',
            description: 'Event date and time.',
          },
        },
      },
      series: {
        type: 'object',
        description: 'Series metadata for a podcast or newsletter.',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
            description:
              "Name of the show or publication (e.g., 'Overcommitted', 'The Balanced Engineer').",
          },
          episodeNumber: {
            type: 'integer',
            minimum: 0,
            description: 'Episode or issue number within the series.',
          },
          season: {
            type: 'integer',
            minimum: 0,
            description: 'Season number, if the series uses seasons.',
          },
          feedUrl: {
            type: 'string',
            format: 'uri',
            description: 'Canonical RSS or Atom feed URL for the series.',
          },
        },
      },
    },
  },
  SocialCrateMakingProject: {
    lexicon: 1,
    id: 'social.crate.making.project',
    defs: {
      main: {
        type: 'record',
        description:
          'A unified making/build project record covering fiber arts, code, site, garden, illustration sets, and other creative work.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['title', 'kind', 'status', 'description', 'createdAt'],
          properties: {
            title: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description: 'Project title.',
            },
            kind: {
              type: 'string',
              maxLength: 32,
              knownValues: [
                'fiber',
                'code',
                'site',
                'garden',
                'illustration-set',
                'other',
              ],
              description:
                'Project category. Determines which kind-specific metadata block is relevant.',
            },
            status: {
              type: 'string',
              maxLength: 32,
              knownValues: [
                'planning',
                'in-progress',
                'finished',
                'paused',
                'abandoned',
              ],
              description: 'Current status of the project.',
            },
            description: {
              type: 'string',
              maxGraphemes: 10000,
              maxLength: 100000,
              description: 'Project description in markdown.',
            },
            startedAt: {
              type: 'string',
              format: 'datetime',
              description: 'When work on the project began.',
            },
            finishedAt: {
              type: 'string',
              format: 'datetime',
              description: 'When the project was completed or abandoned.',
            },
            links: {
              type: 'array',
              description: 'External links associated with the project.',
              maxLength: 20,
              items: {
                type: 'ref',
                ref: 'lex:social.crate.making.project#link',
              },
            },
            coverImage: {
              type: 'blob',
              description: 'Optional cover image for the project.',
              accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
              maxSize: 2000000,
            },
            fiber: {
              type: 'ref',
              ref: 'lex:social.crate.making.project#fiber',
              description:
                "Fiber arts metadata. Only meaningful when kind is 'fiber'.",
            },
            code: {
              type: 'ref',
              ref: 'lex:social.crate.making.project#code',
              description:
                "Software project metadata. Only meaningful when kind is 'code'.",
            },
            site: {
              type: 'ref',
              ref: 'lex:social.crate.making.project#site',
              description:
                "Website project metadata. Only meaningful when kind is 'site'.",
            },
            garden: {
              type: 'ref',
              ref: 'lex:social.crate.making.project#garden',
              description:
                "Garden project metadata. Only meaningful when kind is 'garden'.",
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this record was created.',
            },
          },
        },
      },
      link: {
        type: 'object',
        description: 'An external link associated with a project.',
        required: ['url'],
        properties: {
          label: {
            type: 'string',
            maxGraphemes: 100,
            maxLength: 1000,
            description: 'Human-readable label for the link.',
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL of the linked resource.',
          },
        },
      },
      fiber: {
        type: 'object',
        description: 'Fiber arts metadata.',
        properties: {
          pattern: {
            type: 'string',
            maxGraphemes: 200,
            maxLength: 2000,
            description: 'Pattern name or identifier.',
          },
          yarn: {
            type: 'string',
            maxGraphemes: 200,
            maxLength: 2000,
            description: 'Yarn name and colorway.',
          },
          hookSize: {
            type: 'string',
            maxLength: 32,
            description: "Hook or needle size (e.g. '4.0mm', 'US G/6').",
          },
          ravelryUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL of the project on Ravelry.',
          },
        },
      },
      code: {
        type: 'object',
        description: 'Software project metadata.',
        properties: {
          repo: {
            type: 'string',
            format: 'uri',
            description: 'URL of the source code repository.',
          },
          language: {
            type: 'string',
            maxLength: 64,
            description: 'Primary programming language.',
          },
          deployedUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL of the live deployed project.',
          },
        },
      },
      site: {
        type: 'object',
        description: 'Website project metadata.',
        properties: {
          url: {
            type: 'string',
            format: 'uri',
            description: 'Live URL of the site.',
          },
          role: {
            type: 'string',
            maxGraphemes: 100,
            maxLength: 1000,
            description:
              "Your role on the project (e.g. 'designer', 'developer', 'owner').",
          },
        },
      },
      garden: {
        type: 'object',
        description: 'Garden project metadata.',
        properties: {
          bedNumber: {
            type: 'string',
            maxLength: 32,
            description: 'Bed or plot identifier.',
          },
          plants: {
            type: 'array',
            maxLength: 100,
            items: {
              type: 'string',
              maxGraphemes: 100,
              maxLength: 1000,
            },
            description: 'List of plants in this bed or project.',
          },
          zone: {
            type: 'string',
            maxLength: 16,
            description: "USDA hardiness zone (e.g. '7b').",
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
            parent: {
              type: 'string',
              format: 'at-uri',
              description:
                'Optional AT-URI of a parent social.crate.note. Used to build hierarchical note trees and breadcrumb navigation. A note without a parent is a root note.',
            },
            draft: {
              type: 'boolean',
              description:
                "When true, the note is a private draft and should not be rendered publicly. The record still lives on the user's PDS — drafts are not deletion or hiding from the network, just a signal to rendering apps to skip the note.",
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
  SocialCrateNoteLink: {
    lexicon: 1,
    id: 'social.crate.note.link',
    defs: {
      main: {
        type: 'record',
        description:
          'A directed link from one note to another ATProto record or external URL. Powers Zettelkasten backlinks and cross-lexicon connections. One record per link direction — the AppView computes the reverse for backlinks.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['source', 'target', 'createdAt'],
          properties: {
            source: {
              type: 'string',
              format: 'at-uri',
              description:
                'AT-URI of the social.crate.note that contains this link.',
            },
            target: {
              type: 'ref',
              ref: 'lex:social.crate.note.link#target',
              description: 'Link destination.',
            },
            context: {
              type: 'string',
              maxGraphemes: 1000,
              maxLength: 10000,
              description:
                'The surrounding sentence, paragraph, or annotation that contains this link in the source note. Used for rich backlink previews.',
            },
            anchorText: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description:
                'The visible link text or [[wikilink]] phrase as it appeared in the source note.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this link record was created.',
            },
          },
        },
      },
      target: {
        type: 'object',
        description:
          'Link destination. Exactly one of atUri or externalUrl should be set. atUri is preferred for federated records (notes, books, episodes, talks). externalUrl is used for external web resources or unresolved [[wikilinks]].',
        properties: {
          atUri: {
            type: 'string',
            format: 'at-uri',
            description:
              'AT-URI of the target record when the link resolves to an ATProto resource.',
          },
          externalUrl: {
            type: 'string',
            format: 'uri',
            description:
              'External URL when the target is outside the AT network (or the [[wikilink]] has not yet been resolved to a record).',
          },
          title: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
            description:
              'Human-readable title of the link target, stored for display without requiring a round-trip.',
          },
          description: {
            type: 'string',
            maxGraphemes: 1000,
            maxLength: 10000,
            description:
              'Optional short description or excerpt of the link target.',
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
          required: ['createdAt'],
          properties: {
            body: {
              type: 'string',
              maxGraphemes: 10000,
              maxLength: 100000,
              description:
                'Optional headline markdown shown above any structured sections. Use this for a single unstructured statement, or leave it empty and supply sections instead.',
            },
            sections: {
              type: 'array',
              maxLength: 20,
              description:
                "Optional named sections (e.g. 'Professional', 'Personal') for organizing the now page beyond a single body. Order is preserved.",
              items: {
                type: 'ref',
                ref: 'lex:social.crate.now#section',
              },
            },
            location: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description:
                "Optional plain-text location (e.g., 'Vancouver, WA').",
            },
            summary: {
              type: 'string',
              maxGraphemes: 300,
              maxLength: 3000,
              description: 'Optional one-line summary for previews and feeds.',
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
      section: {
        type: 'object',
        description: 'A titled section of the now page. Body is markdown.',
        required: ['title', 'body'],
        properties: {
          title: {
            type: 'string',
            maxGraphemes: 100,
            maxLength: 1000,
            description:
              "Section heading (e.g. 'Professional', 'Personal', 'Reading').",
          },
          body: {
            type: 'string',
            maxGraphemes: 10000,
            maxLength: 100000,
            description: 'Section content in markdown.',
          },
        },
      },
    },
  },
  SocialCrateNowConfig: {
    lexicon: 1,
    id: 'social.crate.now.config',
    defs: {
      main: {
        type: 'record',
        description:
          "Configuration for the author's now page. Singleton record with rkey 'self'. Configures which ATProto collections to query for 'recent items' panels alongside the latest social.crate.now entry.",
        key: 'literal:self',
        record: {
          type: 'object',
          required: ['createdAt'],
          properties: {
            liveFeeds: {
              type: 'array',
              maxLength: 20,
              description:
                "Ordered list of live feed panels to render alongside the now page. Each entry points at an ATProto collection on some author's PDS and pulls the most recent N records.",
              items: {
                type: 'ref',
                ref: 'lex:social.crate.now.config#liveFeed',
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this config was first created.',
            },
            updatedAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of the most recent edit to this config.',
            },
          },
        },
      },
      liveFeed: {
        type: 'object',
        description: 'A single live feed panel on the now page.',
        required: ['title', 'collection'],
        properties: {
          title: {
            type: 'string',
            maxGraphemes: 200,
            maxLength: 2000,
            description:
              "Display title for the panel (e.g. 'Recent Bluesky posts', 'In progress on Collective').",
          },
          did: {
            type: 'string',
            format: 'did',
            description:
              "Author DID to query. Defaults to the now page owner's own DID when omitted.",
          },
          collection: {
            type: 'string',
            format: 'nsid',
            description:
              "Collection NSID to read (e.g. 'app.bsky.feed.post', 'app.collectivesocial.feed.useritem', 'social.crate.content').",
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            description: 'Number of most recent records to fetch (default 5).',
          },
          filter: {
            type: 'string',
            knownValues: [
              'social.crate.now.config#topLevelPosts',
              'social.crate.now.config#noReplies',
              'social.crate.now.config#noReposts',
            ],
            description:
              "Optional renderer-side filter. 'topLevelPosts' (alias 'noReplies') drops app.bsky.feed.post records that have a reply field. 'noReposts' drops repost records when present.",
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
  ComAtprotoRepoStrongRef: 'com.atproto.repo.strongRef',
  CommunityLexiconCalendarEvent: 'community.lexicon.calendar.event',
  SiteStandardDocument: 'site.standard.document',
  SocialCrateContent: 'social.crate.content',
  SocialCrateMakingProject: 'social.crate.making.project',
  SocialCrateMakingUpdate: 'social.crate.making.update',
  SocialCrateNote: 'social.crate.note',
  SocialCrateNoteLink: 'social.crate.note.link',
  SocialCrateNow: 'social.crate.now',
  SocialCrateNowConfig: 'social.crate.now.config',
  SocialCrateRssFeed: 'social.crate.rss.feed',
} as const
