# SKILL: Authoring ATProto Lexicons for `social.crate.*`

**Confidence:** low
**Author:** Simon (Lexicon Designer)
**Date:** 2026-05-09

---

## Pattern

Every `social.crate.*` record lexicon follows this skeleton:

```json
{
  "lexicon": 1,
  "id": "social.crate.<nsid>",
  "defs": {
    "main": {
      "type": "record",
      "description": "<one sentence>",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["<req fields>", "createdAt"],
        "properties": {
          "createdAt": { "type": "string", "format": "datetime", "description": "..." }
        }
      }
    }
  }
}
```

## Field type cheatsheet

| Semantic | Lexicon type |
|---|---|
| Timestamp | `"type": "string", "format": "datetime"` |
| AT-URI cross-ref | `"type": "string", "format": "at-uri"` |
| External URL | `"type": "string", "format": "uri"` |
| DID | `"type": "string", "format": "did"` |
| Short text | `"type": "string", "maxGraphemes": 300, "maxLength": 3000` |
| Long markdown | `"type": "string", "maxGraphemes": 10000, "maxLength": 100000` |
| Enum-like | `"type": "string", "knownValues": [...]` (open, not closed enum) |
| Image blob | `"type": "blob", "accept": ["image/jpeg", "image/png", "image/webp"], "maxSize": 2000000` |
| Array of objects | `"type": "array", "maxLength": N, "items": { "type": "object", "required": [...], "properties": {...} }` |

## Rules

1. `createdAt` (format: datetime) is **required** on every record.
2. `maxLength` (bytes) ≈ 10× `maxGraphemes` (grapheme clusters). Always set both on text fields.
3. Use `knownValues` (not a closed `enum`) so new variants don't require a lexicon version bump.
4. For "XOR union" fields (like `note.link.target`): use a flat object with both fields optional and enforce the constraint at the application layer — ATProto's `union` type requires `$type` and is heavy for simple cases.
5. Blob `maxSize` is in bytes. 2 MB = 2000000.
6. Validate with: `node -e "JSON.parse(require('fs').readFileSync('path/to/file.json','utf8'))"`.
7. Deep structural validation runs at codegen time via `@atproto/lex-cli`.

## Gotchas

- `"required"` at the record level belongs inside `"record": { "required": [...] }`, NOT at the `"main"` level.
- Array `"maxLength"` is item count (not byte length) — confusingly named.
- `format: "at-uri"` is the cross-record reference type; `format: "uri"` is for external URLs. Don't mix them.
- Sibling repos (`collective-social-api`) keep lexicons as flat files in `lexicons/` (not nested by namespace). `social.crate.*` uses directory nesting matching the NSID path — either works, but be consistent.
