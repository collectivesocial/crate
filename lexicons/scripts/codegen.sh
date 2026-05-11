#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LEXICONS_DIR="$REPO_ROOT/lexicons"

echo "==> crate.social lexicon codegen"
echo "    repo root: $REPO_ROOT"
echo ""

# Collect all social.crate.* lexicon JSON files
LEXICON_FILES=()
while IFS= read -r -d '' f; do
  LEXICON_FILES+=("$f")
done < <(find "$LEXICONS_DIR/social/crate" -name "*.json" -print0 | sort -z)

if [[ ${#LEXICON_FILES[@]} -eq 0 ]]; then
  echo "ERROR: No lexicon files found under $LEXICONS_DIR/social/crate" >&2
  exit 1
fi

echo "    Found ${#LEXICON_FILES[@]} lexicon file(s):"
for f in "${LEXICON_FILES[@]}"; do
  echo "      ${f#"$REPO_ROOT/"}"
done
echo ""

API_LEXICON="$REPO_ROOT/api/src/lexicon"
IMPORTERS_LEXICON="$REPO_ROOT/importers/src/lexicon"

echo "==> Creating output directories..."
mkdir -p "$API_LEXICON" "$IMPORTERS_LEXICON"

# Run lex-cli from lexicons/ so npx resolves @atproto/lex-cli from its node_modules
cd "$LEXICONS_DIR"

echo "==> gen-server → api/src/lexicon/"
yes | npx @atproto/lex-cli gen-server "$API_LEXICON" "${LEXICON_FILES[@]}"

echo "==> gen-api    → importers/src/lexicon/"
yes | npx @atproto/lex-cli gen-api "$IMPORTERS_LEXICON" "${LEXICON_FILES[@]}"

echo ""
echo "✓ Lexicon codegen complete."
