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

errors=0

# Process substitution keeps the loop in the main shell (not a subshell)
while read -r ly_file; do
  # Derive output subdirectory from relative path
  rel_path="${ly_file#$LILYPOND_DIR/}"
  out_subdir="$OUTPUT_DIR/$(dirname "$rel_path")"
  base_name="$(basename "$ly_file" .ly)"

  mkdir -p "$out_subdir"

  # Only rebuild if .ly is newer than .svg
  svg_file="$out_subdir/$base_name.svg"
  if [ "$ly_file" -nt "$svg_file" ] 2>/dev/null; then
    echo "  Compiling: $rel_path"
    if ! lilypond --svg -dno-point-and-click \
      -o "$out_subdir/$base_name" "$ly_file" 2>/tmp/lilypond-err.log; then
      echo "  FAILED: $rel_path" >&2
      cat /tmp/lilypond-err.log >&2
      errors=$((errors + 1))
    fi
  fi
done < <(find "$LILYPOND_DIR" -name '*.ly' -not -path '*/includes/*' | sort)

# Count generated files
if [ -d "$OUTPUT_DIR" ]; then
  count=$(find "$OUTPUT_DIR" -name '*.svg' | wc -l | tr -d ' ')
else
  count=0
fi

if [ "$errors" -gt 0 ]; then
  echo "Done with $errors error(s). $count SVG assets in $OUTPUT_DIR" >&2
  exit 1
fi

echo "Done. $count SVG assets in $OUTPUT_DIR"
