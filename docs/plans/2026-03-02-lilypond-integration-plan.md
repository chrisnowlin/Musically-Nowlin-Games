# LilyPond Integration — Phase 1 & 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up a LilyPond build pipeline and generate ~50 notation reference SVGs, then integrate them into Melody Dungeon's Vocabulary Challenges.

**Architecture:** LilyPond `.ly` source files live in `lilypond/` at project root. A build script compiles them to SVGs in `client/public/images/notation/`. A TypeScript asset lookup module maps vocab terms to SVG paths. The VocabularyChallenge component renders `<img>` tags for entries that have a matching LilyPond asset, falling back to Unicode for entries without one.

**Tech Stack:** LilyPond 2.24.4 (already at `/opt/homebrew/bin/lilypond`), Bash build script, React/TypeScript, Vitest for tests.

---

### Task 1: Create LilyPond House Style

**Files:**
- Create: `lilypond/includes/musically-nowlin-style.ily`

**Step 1: Create directory structure**

```bash
mkdir -p lilypond/includes lilypond/notation/clefs lilypond/notation/notes lilypond/notation/dynamics lilypond/notation/symbols lilypond/scripts
```

**Step 2: Write house style include file**

Create `lilypond/includes/musically-nowlin-style.ily`:

```lilypond
\version "2.24.4"

%% Musically Nowlin Games — LilyPond house style
%% Include this in every .ly file for consistent output.

%% Fragment mode: no titles, headers, footers, or page numbers
\header {
  tagline = ##f
}

\paper {
  indent = 0
  ragged-right = ##t
  %% Tight cropping for web use
  #(set-paper-size "a10" 'landscape)
  top-margin = 2
  bottom-margin = 2
  left-margin = 2
  right-margin = 2
}

\layout {
  %% Compact staff size suitable for game UI (~16pt)
  #(layout-set-staff-size 18)

  \context {
    \Score
    %% Remove bar numbers for fragments
    \remove "Bar_number_engraver"
    %% Remove time signature for single-symbol fragments
    \override TimeSignature.stencil = ##f
  }
  \context {
    \Staff
    %% Transparent background (SVG default)
    \override StaffSymbol.color = #black
  }
}
```

**Step 3: Commit**

```bash
git add lilypond/
git commit -m "feat(lilypond): add directory structure and house style"
```

---

### Task 2: Create Build Script

**Files:**
- Create: `lilypond/scripts/build-notation.sh`
- Modify: `package.json:6-19` (scripts section)

**Step 1: Write the build script**

Create `lilypond/scripts/build-notation.sh`:

```bash
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
done

# Count generated files
count=$(find "$OUTPUT_DIR" -name '*.svg' 2>/dev/null | wc -l | tr -d ' ')
echo "Done. $count SVG assets in $OUTPUT_DIR"
```

**Step 2: Make it executable**

```bash
chmod +x lilypond/scripts/build-notation.sh
```

**Step 3: Add npm script to package.json**

Add to the `"scripts"` section of `package.json`:

```json
"build:notation": "bash lilypond/scripts/build-notation.sh"
```

**Step 4: Add output dir to .gitignore**

Append to `.gitignore`:

```
# LilyPond build output (generated from lilypond/ source)
client/public/images/notation/
```

**Step 5: Run the build script (should succeed with 0 files)**

```bash
bun run build:notation
```

Expected: `Done. 0 SVG assets in ...`

**Step 6: Commit**

```bash
git add lilypond/scripts/build-notation.sh package.json .gitignore
git commit -m "feat(lilypond): add build script and npm integration"
```

---

### Task 3: Proof-of-Concept — Clef SVGs

**Files:**
- Create: `lilypond/notation/clefs/treble-clef.ly`
- Create: `lilypond/notation/clefs/bass-clef.ly`
- Create: `lilypond/notation/clefs/alto-clef.ly`

**Step 1: Write treble clef LilyPond source**

Create `lilypond/notation/clefs/treble-clef.ly`:

```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  s1
}
```

> This renders a treble clef on an empty staff (`s1` = one bar of spacer rest).

**Step 2: Write bass clef source**

Create `lilypond/notation/clefs/bass-clef.ly`:

```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef bass
  s1
}
```

**Step 3: Write alto clef source**

Create `lilypond/notation/clefs/alto-clef.ly`:

```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef alto
  s1
}
```

**Step 4: Build and verify**

```bash
bun run build:notation
```

Expected: `Done. 3 SVG assets in ...`

**Step 5: Visually verify the SVGs**

Open one in the browser to check sizing and quality:

```bash
open client/public/images/notation/notation/clefs/treble-clef.svg
```

If the sizing looks off (too large, too small, too much whitespace), adjust `musically-nowlin-style.ily` paper/layout settings and rebuild.

**Step 6: Commit**

```bash
git add lilypond/notation/clefs/
git commit -m "feat(lilypond): add clef notation source files (treble, bass, alto)"
```

---

### Task 4: Note Value SVGs

**Files:**
- Create: `lilypond/notation/notes/whole-note.ly`
- Create: `lilypond/notation/notes/half-note.ly`
- Create: `lilypond/notation/notes/quarter-note.ly`
- Create: `lilypond/notation/notes/eighth-note.ly`
- Create: `lilypond/notation/notes/sixteenth-note.ly`
- Create: `lilypond/notation/notes/beamed-eighths.ly`
- Create: `lilypond/notation/notes/dotted-half-note.ly`
- Create: `lilypond/notation/notes/dotted-quarter-note.ly`

**Step 1: Write LilyPond files for each note value**

Each file follows this pattern — a single note on a treble clef staff:

`lilypond/notation/notes/whole-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'1 }
```

`lilypond/notation/notes/half-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'2 s2 }
```

`lilypond/notation/notes/quarter-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4 s2. }
```

`lilypond/notation/notes/eighth-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'8 s2.. }
```

`lilypond/notation/notes/sixteenth-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'16 s2... }
```

`lilypond/notation/notes/beamed-eighths.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'8[ c'8] s2 }
```

`lilypond/notation/notes/dotted-half-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'2. s4 }
```

`lilypond/notation/notes/dotted-quarter-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4. s4. }
```

**Step 2: Build and verify**

```bash
bun run build:notation
```

Expected: 11 SVGs total (3 clefs + 8 notes).

**Step 3: Commit**

```bash
git add lilypond/notation/notes/
git commit -m "feat(lilypond): add note value notation source files"
```

---

### Task 5: Rest Value SVGs

**Files:**
- Create: `lilypond/notation/notes/whole-rest.ly`
- Create: `lilypond/notation/notes/half-rest.ly`
- Create: `lilypond/notation/notes/quarter-rest.ly`
- Create: `lilypond/notation/notes/eighth-rest.ly`
- Create: `lilypond/notation/notes/sixteenth-rest.ly`

**Step 1: Write LilyPond files for each rest**

`lilypond/notation/notes/whole-rest.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble r1 }
```

`lilypond/notation/notes/half-rest.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble r2 s2 }
```

`lilypond/notation/notes/quarter-rest.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble r4 s2. }
```

`lilypond/notation/notes/eighth-rest.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble r8 s2.. }
```

`lilypond/notation/notes/sixteenth-rest.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble r16 s2... }
```

**Step 2: Build and verify**

```bash
bun run build:notation
```

Expected: 16 SVGs total.

**Step 3: Commit**

```bash
git add lilypond/notation/notes/
git commit -m "feat(lilypond): add rest value notation source files"
```

---

### Task 6: Dynamic Marking SVGs

**Files:**
- Create: `lilypond/notation/dynamics/pp.ly`
- Create: `lilypond/notation/dynamics/p.ly`
- Create: `lilypond/notation/dynamics/mp.ly`
- Create: `lilypond/notation/dynamics/mf.ly`
- Create: `lilypond/notation/dynamics/f.ly`
- Create: `lilypond/notation/dynamics/ff.ly`
- Create: `lilypond/notation/dynamics/sfz.ly`
- Create: `lilypond/notation/dynamics/fp.ly`
- Create: `lilypond/notation/dynamics/ppp.ly`
- Create: `lilypond/notation/dynamics/fff.ly`
- Create: `lilypond/notation/dynamics/crescendo.ly`
- Create: `lilypond/notation/dynamics/decrescendo.ly`

**Step 1: Write dynamics LilyPond files**

Dynamic markings are placed beneath notes. Each file shows a note with the dynamic below it:

`lilypond/notation/dynamics/pp.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\pp s2. }
```

`lilypond/notation/dynamics/p.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\p s2. }
```

`lilypond/notation/dynamics/mp.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\mp s2. }
```

`lilypond/notation/dynamics/mf.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\mf s2. }
```

`lilypond/notation/dynamics/f.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\f s2. }
```

`lilypond/notation/dynamics/ff.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\ff s2. }
```

`lilypond/notation/dynamics/sfz.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\sfz s2. }
```

`lilypond/notation/dynamics/fp.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\fp s2. }
```

`lilypond/notation/dynamics/ppp.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\ppp s2. }
```

`lilypond/notation/dynamics/fff.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\fff s2. }
```

`lilypond/notation/dynamics/crescendo.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\< c' c' c'\! }
```

`lilypond/notation/dynamics/decrescendo.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\> c' c' c'\! }
```

**Step 2: Build and verify**

```bash
bun run build:notation
```

Expected: 28 SVGs total.

**Step 3: Commit**

```bash
git add lilypond/notation/dynamics/
git commit -m "feat(lilypond): add dynamic marking notation source files"
```

---

### Task 7: Symbol SVGs (Time Signatures, Accidentals, Articulations, Misc)

**Files:**
- Create: `lilypond/notation/symbols/time-sig-4-4.ly`
- Create: `lilypond/notation/symbols/time-sig-3-4.ly`
- Create: `lilypond/notation/symbols/time-sig-2-4.ly`
- Create: `lilypond/notation/symbols/time-sig-6-8.ly`
- Create: `lilypond/notation/symbols/common-time.ly`
- Create: `lilypond/notation/symbols/sharp.ly`
- Create: `lilypond/notation/symbols/flat.ly`
- Create: `lilypond/notation/symbols/natural.ly`
- Create: `lilypond/notation/symbols/fermata.ly`
- Create: `lilypond/notation/symbols/staccato.ly`
- Create: `lilypond/notation/symbols/accent.ly`
- Create: `lilypond/notation/symbols/tenuto.ly`
- Create: `lilypond/notation/symbols/slur.ly`
- Create: `lilypond/notation/symbols/tie.ly`
- Create: `lilypond/notation/symbols/repeat-sign.ly`
- Create: `lilypond/notation/symbols/trill.ly`
- Create: `lilypond/notation/symbols/grace-note.ly`
- Create: `lilypond/notation/symbols/triplet.ly`
- Create: `lilypond/notation/symbols/double-bar.ly`

**Step 1: Write symbol LilyPond files**

Time signatures — these override the house style to show the time sig:

`lilypond/notation/symbols/time-sig-4-4.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 4/4
  s1
}
```

`lilypond/notation/symbols/time-sig-3-4.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 3/4
  s2.
}
```

`lilypond/notation/symbols/time-sig-2-4.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 2/4
  s2
}
```

`lilypond/notation/symbols/time-sig-6-8.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 6/8
  s2.
}
```

`lilypond/notation/symbols/common-time.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 4/4
  s1
}
```

Accidentals:

`lilypond/notation/symbols/sharp.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble fis'4 s2. }
```

`lilypond/notation/symbols/flat.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble bes'4 s2. }
```

`lilypond/notation/symbols/natural.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \key g \major
  fis'4 f'!4 s2
}
```

Articulations:

`lilypond/notation/symbols/fermata.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4\fermata s2. }
```

`lilypond/notation/symbols/staccato.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4-. c'-. c'-. c'-. }
```

`lilypond/notation/symbols/accent.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4-> s2. }
```

`lilypond/notation/symbols/tenuto.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4-- s2. }
```

`lilypond/notation/symbols/slur.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4( d' e' f') }
```

`lilypond/notation/symbols/tie.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4~ c' s2 }
```

`lilypond/notation/symbols/repeat-sign.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble \repeat volta 2 { c'4 d' e' f' } }
```

`lilypond/notation/symbols/trill.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'2\trill s2 }
```

`lilypond/notation/symbols/grace-note.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble \grace { d'16 } c'4 s2. }
```

`lilypond/notation/symbols/triplet.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble \tuplet 3/2 { c'4 d' e' } s2 }
```

`lilypond/notation/symbols/double-bar.ly`:
```lilypond
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{ \clef treble c'4 d' e' f' \bar "|." }
```

**Step 2: Build and verify**

```bash
bun run build:notation
```

Expected: 47 SVGs total.

**Step 3: Commit**

```bash
git add lilypond/notation/symbols/
git commit -m "feat(lilypond): add symbol notation source files (time sigs, accidentals, articulations)"
```

---

### Task 8: Write the Notation Asset Lookup Module

**Files:**
- Create: `client/src/common/notation/notationAssets.ts`
- Test: `client/src/common/notation/__tests__/notationAssets.test.ts`

**Step 1: Write the failing test**

Create `client/src/common/notation/__tests__/notationAssets.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getNotationAsset, VOCAB_ASSET_MAP } from '../notationAssets';

describe('getNotationAsset', () => {
  it('returns the correct path for a known category and key', () => {
    expect(getNotationAsset('dynamics', 'f')).toBe('/images/notation/notation/dynamics/f.svg');
  });

  it('returns the correct path for symbols category', () => {
    expect(getNotationAsset('symbols', 'fermata')).toBe('/images/notation/notation/symbols/fermata.svg');
  });

  it('returns the correct path for clefs', () => {
    expect(getNotationAsset('clefs', 'treble-clef')).toBe('/images/notation/notation/clefs/treble-clef.svg');
  });
});

describe('VOCAB_ASSET_MAP', () => {
  it('maps "Quarter note" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['Quarter note']).toBe('notes/quarter-note');
  });

  it('maps "forte" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['forte']).toBe('dynamics/f');
  });

  it('maps "Treble clef" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['Treble clef']).toBe('clefs/treble-clef');
  });

  it('returns undefined for terms without notation assets', () => {
    expect(VOCAB_ASSET_MAP['Melody']).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- client/src/common/notation/__tests__/notationAssets.test.ts
```

Expected: FAIL — module does not exist yet.

**Step 3: Write the implementation**

Create `client/src/common/notation/notationAssets.ts`:

```typescript
/**
 * Maps vocabulary terms to their LilyPond-generated SVG notation assets.
 *
 * Keys are VocabEntry.term values from vocabData.ts.
 * Values are "{category}/{filename}" where the full path is
 * /images/notation/notation/{category}/{filename}.svg
 */
export const VOCAB_ASSET_MAP: Record<string, string> = {
  // ── Clefs ──────────────────────────────
  'Treble clef': 'clefs/treble-clef',
  'Bass clef': 'clefs/bass-clef',

  // ── Note Values ────────────────────────
  'Quarter note': 'notes/quarter-note',
  'Half note': 'notes/half-note',
  'Whole note': 'notes/whole-note',
  'Beamed eighth notes': 'notes/beamed-eighths',
  'Dotted half note': 'notes/dotted-half-note',
  'Dotted quarter note': 'notes/dotted-quarter-note',

  // ── Rests ──────────────────────────────
  'Quarter rest': 'notes/quarter-rest',
  'Half rest': 'notes/half-rest',
  'Whole rest': 'notes/whole-rest',

  // ── Dynamics ───────────────────────────
  'piano': 'dynamics/p',
  'forte': 'dynamics/f',
  'mf': 'dynamics/mf',
  'mp': 'dynamics/mp',
  'pp': 'dynamics/pp',
  'ff': 'dynamics/ff',
  'sfz': 'dynamics/sfz',
  'fp': 'dynamics/fp',
  'ppp': 'dynamics/ppp',
  'fff': 'dynamics/fff',
  'Crescendo': 'dynamics/crescendo',
  'Decrescendo': 'dynamics/decrescendo',
  'Diminuendo': 'dynamics/decrescendo',
  'Fortissimo': 'dynamics/ff',

  // ── Time Signatures ────────────────────
  'Time signature 4/4': 'symbols/time-sig-4-4',
  'Time signature 3/4': 'symbols/time-sig-3-4',
  'Time signature 6/8': 'symbols/time-sig-6-8',

  // ── Accidentals ────────────────────────
  'Sharp': 'symbols/sharp',
  'Flat': 'symbols/flat',
  'Natural': 'symbols/natural',

  // ── Articulations & Symbols ────────────
  'Fermata': 'symbols/fermata',
  'Staccato': 'symbols/staccato',
  'Repeat sign': 'symbols/repeat-sign',
  'Tied note': 'symbols/tie',
  'Triplet': 'symbols/triplet',
  'Trill': 'symbols/trill',
  'Grace note': 'symbols/grace-note',
  'Double bar line': 'symbols/double-bar',
};

/**
 * Get the public URL for a notation SVG asset.
 */
export function getNotationAsset(category: string, key: string): string {
  return `/images/notation/notation/${category}/${key}.svg`;
}

/**
 * Given a VocabEntry term, return the asset URL if one exists.
 * Returns undefined if no LilyPond asset is available for this term.
 */
export function getVocabNotationAsset(term: string): string | undefined {
  const assetKey = VOCAB_ASSET_MAP[term];
  if (!assetKey) return undefined;
  return `/images/notation/notation/${assetKey}.svg`;
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- client/src/common/notation/__tests__/notationAssets.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add client/src/common/notation/notationAssets.ts client/src/common/notation/__tests__/notationAssets.test.ts
git commit -m "feat(notation): add asset lookup module mapping vocab terms to LilyPond SVGs"
```

---

### Task 9: Integrate LilyPond SVGs into VocabularyChallenge

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx`

This is the key integration task. We add an `<img>` tag that displays the LilyPond SVG when a vocab entry has a matching notation asset. The image appears above the question text as a visual prompt.

**Step 1: Write the failing test**

Create or update `client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx` to add a test for notation asset display:

```typescript
// Add this test to the existing test file:
it('renders notation SVG when vocab entry has a matching LilyPond asset', () => {
  // The "symbols" category at tier 1 includes "Quarter note" which has an asset
  const { container } = render(
    <VocabularyChallenge category="symbols" tier={1} onResult={() => {}} />
  );
  // At least one img with notation asset source should be present
  const notationImages = container.querySelectorAll('img[src*="/images/notation/"]');
  expect(notationImages.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx
```

Expected: FAIL — no notation images rendered yet.

**Step 3: Integrate notation assets into VocabularyChallenge**

Modify `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx`:

**Add import** (at top of file, after existing imports):

```typescript
import { getVocabNotationAsset } from '@/common/notation/notationAssets';
```

**Create a small helper component** (before `StandardView`):

```typescript
/** Displays LilyPond-engraved notation if an asset exists for this term. */
function NotationImage({ term }: { term: string }) {
  const src = getVocabNotationAsset(term);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${term} notation`}
      className="h-16 mx-auto mb-2 invert"
    />
  );
}
```

> `invert` CSS filter makes the black-on-transparent SVG appear white-on-dark to match the game's dark theme.

**Insert `<NotationImage>` into StandardView** — add it above the question text (around line 149):

```tsx
<h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
<NotationImage term={challenge.target.term} />
<p className="text-gray-200 text-center text-sm px-2">{questionText}</p>
```

**Insert `<NotationImage>` into OppositesView** — add it above the question text (around line 201):

```tsx
<h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
<NotationImage term={challenge.correctEntry.term} />
<p className="text-gray-200 text-center text-base px-2 font-semibold">
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx
```

Expected: PASS

**Step 5: Manual verification**

```bash
bun run build:notation && bun run dev
```

Navigate to Melody Dungeon, encounter a symbols enemy, and verify the LilyPond SVG appears above the question. Check:
- SVG renders at appropriate size
- Colors look right with the `invert` filter
- No layout shift or overflow

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx
git commit -m "feat(melody-dungeon): display LilyPond notation assets in vocabulary challenges"
```

---

### Task 10: Full Test Suite Pass & Final Verification

**Step 1: Run full test suite**

```bash
bun run test
```

Expected: All tests pass.

**Step 2: Run TypeScript type check**

```bash
bun run check
```

Expected: No errors.

**Step 3: Verify build succeeds**

```bash
bun run build
```

Expected: Build completes without errors.

**Step 4: Commit any fixes if needed**

If any test or build issues arose from integration, fix and commit.

---

## Summary of Deliverables

| Task | Deliverable | Files |
|------|-------------|-------|
| 1 | House style | `lilypond/includes/musically-nowlin-style.ily` |
| 2 | Build script | `lilypond/scripts/build-notation.sh`, `package.json` |
| 3 | Clef SVGs | 3 `.ly` files in `lilypond/notation/clefs/` |
| 4 | Note SVGs | 8 `.ly` files in `lilypond/notation/notes/` |
| 5 | Rest SVGs | 5 `.ly` files in `lilypond/notation/notes/` |
| 6 | Dynamic SVGs | 12 `.ly` files in `lilypond/notation/dynamics/` |
| 7 | Symbol SVGs | 19 `.ly` files in `lilypond/notation/symbols/` |
| 8 | Asset lookup | `notationAssets.ts` + tests |
| 9 | Challenge integration | Modified `VocabularyChallenge.tsx` + tests |
| 10 | Verification | Full test suite + build pass |
