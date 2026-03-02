# LilyPond Music Engraving Integration

**Date:** 2026-03-02
**Scope:** Melody Dungeon (first), expandable to all games
**Approach:** Hybrid — LilyPond build-time assets + VexFlow runtime rendering

## Problem

Melody Dungeon currently renders music notation using hand-drawn canvas lines and Unicode music symbols. This produces functional but visually crude notation that doesn't match the quality students would see in printed sheet music. Proper music engraving reinforces learning by exposing students to authentic notation.

## Solution Overview

Use **LilyPond** (the gold standard for music engraving) to pre-generate high-quality SVG notation assets at build time. Use **VexFlow** (already installed) for dynamic, interactive notation at runtime. The two systems serve complementary roles:

- **LilyPond** → static, beautiful reference images (symbols, rhythm patterns, intervals)
- **VexFlow** → dynamic, interactive rendering (random note reading, animated playback)

## Project Structure

```
lilypond/
├── includes/
│   ├── musically-nowlin-style.ily    # House style (sizing, layout, colors)
│   └── common-defs.ily              # Reusable musical definitions
├── notation/
│   ├── clefs/                       # Clef reference images
│   ├── notes/                       # Note/rest value reference images
│   ├── symbols/                     # Musical symbol reference images
│   └── dynamics/                    # Dynamic marking reference images
├── challenges/
│   ├── rhythm-patterns/             # Rhythm patterns by tier (T1-T5)
│   ├── intervals/                   # Interval visualizations on staff
│   └── scales/                      # Scale pattern reference images
└── scripts/
    └── build-notation.sh            # Compiles .ly → SVG

client/public/images/notation/        # Build output (git-ignored)
├── clefs/
├── notes/
├── symbols/
├── dynamics/
├── rhythm-patterns/
└── intervals/
```

## Asset Inventory

### A. Notation Reference Library (~50 SVGs)

For Symbol, Dynamics, and Vocabulary challenges:

| Category | Count | Contents |
|----------|-------|----------|
| Clefs | 3 | Treble, bass, alto clef on staff |
| Note Values | ~8 | Whole through sixteenth notes with beaming |
| Rest Values | ~6 | Whole through sixteenth rests |
| Dynamic Marks | ~12 | pp, p, mp, mf, f, ff, sfz, fp, crescendo/decrescendo hairpins |
| Time Signatures | ~5 | 4/4, 3/4, 2/4, 6/8, common time |
| Accidentals | ~4 | Sharp, flat, natural, key signatures |
| Articulations | ~6 | Fermata, staccato, accent, tenuto, slur, tie |
| Misc Symbols | ~5 | Repeat signs, D.C. al Fine, coda, segno |

### B. Rhythm Pattern Library (~85 SVGs)

For Rhythm Tap challenges, organized by tier:

| Tier | Patterns | Content |
|------|----------|---------|
| T1 | ~15 | Quarter + half notes, 4-beat patterns |
| T2 | ~20 | Add eighth notes + rests |
| T3 | ~20 | Dotted rhythms, sixteenths, 5-beat patterns |
| T4 | ~15 | Triplets, syncopation, 6-beat patterns |
| T5 | ~15 | Mixed subdivisions, 8-beat patterns |

### C. Interval Reference Cards (~28 SVGs)

For Interval challenges:

| Tier | Count | Intervals |
|------|-------|-----------|
| T3 | ~6 | Unison, 2nd, 3rd (ascending + descending) |
| T4 | ~8 | 2nd through 5th |
| T5 | ~14 | 2nd through Octave |

**Grand Total: ~163 pre-rendered SVGs** (~1 MB estimated)

## Build Pipeline

### Build Script (`lilypond/scripts/build-notation.sh`)

1. Find all `.ly` files under `lilypond/`
2. Run `lilypond --svg -o <output-path>` for each
3. Optionally optimize with `svgo`
4. Copy output to `client/public/images/notation/`

### npm Integration

```json
{
  "scripts": {
    "build:notation": "bash lilypond/scripts/build-notation.sh"
  }
}
```

### House Style (`musically-nowlin-style.ily`)

- Staff size: 16-18pt (optimized for game UI, not print)
- Fragment mode: no page numbers, no titles
- Transparent background
- Neutral color scheme (adaptable to game themes)

## In-Game Integration

### Static Assets (LilyPond SVGs)

**Vocabulary Challenges:** Replace Unicode symbol display with LilyPond-rendered SVGs.

```tsx
// Before:
<span className="text-6xl">{vocab.symbol}</span>

// After:
<img src={getNotationAsset('symbols', vocab.assetKey)}
     alt={vocab.term} className="h-20" />
```

**Rhythm Tap Challenges:** Display rhythmic notation above the tap interface.

**Interval Challenges:** Show the interval on a staff alongside the audio playback.

### Dynamic Rendering (VexFlow)

**Note Reading Challenges:** Upgrade from hand-drawn canvas to VexFlow.

```tsx
<StaffNotation clef="treble" notes={[{ key: "C/5", duration: "q" }]} />
```

Styled to visually match LilyPond output (consistent line weight, note head proportions).

### Asset Lookup

```typescript
// client/src/common/notation/notationAssets.ts
export function getNotationAsset(category: string, key: string): string {
  return `/images/notation/${category}/${key}.svg`;
}
```

## Implementation Phases

### Phase 1: Foundation
- Set up `lilypond/` directory + house style
- Create build script
- Generate ~10 proof-of-concept SVGs
- Verify visual quality at game UI scale
- Add `build:notation` npm script

### Phase 2: Notation Reference Library
- Generate all ~50 reference SVGs
- Integrate into Vocabulary Challenges (replace Unicode symbols)

### Phase 3: Rhythm Patterns
- Generate ~85 rhythm pattern SVGs (T1-T5)
- Integrate into Rhythm Tap Challenges

### Phase 4: Intervals + VexFlow Upgrade
- Generate ~28 interval SVGs
- Integrate into Interval Challenges
- Upgrade Note Reading to VexFlow (shared `<StaffNotation>` component)

### Phase 5: Polish & Expansion
- Match VexFlow style to LilyPond output
- Expand to other games
- Add assets as content grows

Each phase is independently shippable.

## Technical Notes

- **LilyPond version:** 2.24.4 (installed via Homebrew at `/opt/homebrew/bin/lilypond`)
- **SVG output:** Scales perfectly to any screen, ~2-10 KB per fragment
- **VexFlow 5.0:** Already installed in project, currently minimally used
- **Compatibility:** LilyPond SVGs are standard SVGs — no special viewer needed
