#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LILYPOND_DIR="$ROOT_DIR/lilypond"
OUTPUT_DIR="$ROOT_DIR/client/public/images/notation"

# Check lilypond is available
if ! command -v lilypond &>/dev/null; then
  echo "Error: lilypond not found. Install with: brew install lilypond" >&2
  exit 1
fi

echo "Building LilyPond notation assets..."

# Find all .ly files (excluding includes directory)
find "$LILYPOND_DIR" -name '*.ly' -not -path '*/includes/*' | while read -r ly_file; do
  # Derive output subdirectory from relative path
  rel_path="${ly_file#$LILYPOND_DIR/}"
  out_subdir="$OUTPUT_DIR/$(dirname "$rel_path")"
  base_name="$(basename "$ly_file" .ly)"

  mkdir -p "$out_subdir"

  # Only rebuild if .ly is newer than .svg
  svg_file="$out_subdir/$base_name.svg"
  if [ "$ly_file" -nt "$svg_file" ] 2>/dev/null; then
    echo "  Compiling: $rel_path"
    lilypond --svg -dno-point-and-click -dbackend=svg \
      -o "$out_subdir/$base_name" "$ly_file" 2>/dev/null
  fi
done || true

# Count generated files
if [ -d "$OUTPUT_DIR" ]; then
  count=$(find "$OUTPUT_DIR" -name '*.svg' | wc -l | tr -d ' ')
else
  count=0
fi
echo "Done. $count SVG assets in $OUTPUT_DIR"
