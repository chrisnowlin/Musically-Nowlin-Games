# LilyPond Phase 3: Rhythm Patterns — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a curated library of rhythm patterns as LilyPond SVGs and integrate them into Melody Dungeon's Rhythm Tap Challenge, replacing random generation with pedagogically sequenced patterns.

**Architecture:** Rhythm patterns are defined as arrays of `RhythmSubdivision` in a TypeScript catalog (`rhythmPatterns.ts`). Each pattern has a matching LilyPond `.ly` source file that compiles to an SVG. The `RhythmTapChallenge` selects a random curated pattern for the current tier, builds `PatternEvent[]` from its subdivision sequence, and displays the SVG above the tap interface.

**Tech Stack:** LilyPond 2.24.4, Bash build script (existing), React/TypeScript, Vitest.

---

### Task 1: Add RhythmicStaff Include for LilyPond

**Files:**
- Create: `lilypond/includes/rhythm-style.ily`

**Step 1: Write the rhythm-specific include**

This include extends the house style for rhythm-only notation (no pitch, no bar lines):

```lilypond
\version "2.24.4"
\include "musically-nowlin-style.ily"

%% Rhythm pattern style — single-line rhythmic staff, free time
\layout {
  \context {
    \Score
    \override SpacingSpanner.common-shortest-duration = \musicLength 8
  }
  \context {
    \RhythmicStaff
    \override StaffSymbol.line-count = #1
    fontSize = #-1
  }
}
```

**Step 2: Test it compiles**

Create a quick test file `lilypond/notation/test-rhythm.ly`:

```lilypond
\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  c4 c c c
}
```

Run: `lilypond --svg -dno-point-and-click -o /tmp/test-rhythm lilypond/notation/test-rhythm.ly`

Verify the SVG shows 4 quarter note stems on a single line. Then delete the test file.

**Step 3: Commit**

```bash
git add lilypond/includes/rhythm-style.ily
git commit -m "feat(lilypond): add rhythmic staff style for rhythm patterns"
```

---

### Task 2: Create Rhythm Pattern Catalog (TypeScript)

**Files:**
- Create: `client/src/games/melody-dungeon/logic/rhythmPatterns.ts`
- Test: `client/src/games/melody-dungeon/__tests__/rhythmPatterns.test.ts`

This is the central data structure that links patterns to their SVGs.

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { getCuratedPatterns, getRandomCuratedPattern } from '../logic/rhythmPatterns';
import type { Tier } from '../logic/dungeonTypes';

describe('rhythmPatterns', () => {
  it('returns patterns for every tier', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      const patterns = getCuratedPatterns(tier);
      expect(patterns.length).toBeGreaterThan(0);
    }
  });

  it('each pattern has subdivisions matching its tier pool', () => {
    const patterns = getCuratedPatterns(1);
    for (const p of patterns) {
      for (const sub of p.subdivisions) {
        expect(['quarter', 'half']).toContain(sub);
      }
    }
  });

  it('each pattern has an assetKey', () => {
    const patterns = getCuratedPatterns(1);
    for (const p of patterns) {
      expect(p.assetKey).toMatch(/^rhythm-patterns\/t1-/);
    }
  });

  it('getRandomCuratedPattern returns a pattern for the given tier', () => {
    const pattern = getRandomCuratedPattern(1);
    expect(pattern).toBeDefined();
    expect(pattern.subdivisions.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test — expect failure**

**Step 3: Write the implementation**

```typescript
import type { RhythmSubdivision } from './difficultyAdapter';
import type { Tier } from './dungeonTypes';

export interface CuratedRhythmPattern {
  /** Unique ID like "t1-01" */
  id: string;
  /** Sequence of subdivisions that defines this pattern */
  subdivisions: RhythmSubdivision[];
  /** Asset key for notation lookup: "rhythm-patterns/t1-01" */
  assetKey: string;
}

// ── Tier 1: quarter + half, 4 events ─────────────────
const T1_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't1-01', subdivisions: ['quarter', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-01' },
  { id: 't1-02', subdivisions: ['half', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-02' },
  { id: 't1-03', subdivisions: ['quarter', 'half', 'quarter'], assetKey: 'rhythm-patterns/t1-03' },
  { id: 't1-04', subdivisions: ['quarter', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-04' },
  { id: 't1-05', subdivisions: ['half', 'half'], assetKey: 'rhythm-patterns/t1-05' },
  { id: 't1-06', subdivisions: ['half', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-06' },
  { id: 't1-07', subdivisions: ['quarter', 'half', 'half'], assetKey: 'rhythm-patterns/t1-07' },
  { id: 't1-08', subdivisions: ['half', 'half', 'quarter'], assetKey: 'rhythm-patterns/t1-08' },
  { id: 't1-09', subdivisions: ['quarter', 'quarter', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-09' },
  { id: 't1-10', subdivisions: ['half', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-10' },
];

// ── Tier 2: + quarter-rest + eighth, 4 events ───────
const T2_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't2-01', subdivisions: ['quarter', 'quarter', 'quarter-rest', 'quarter'], assetKey: 'rhythm-patterns/t2-01' },
  { id: 't2-02', subdivisions: ['eighth', 'eighth', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-02' },
  { id: 't2-03', subdivisions: ['quarter', 'eighth', 'eighth', 'half'], assetKey: 'rhythm-patterns/t2-03' },
  { id: 't2-04', subdivisions: ['half', 'quarter-rest', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-04' },
  { id: 't2-05', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-05' },
  { id: 't2-06', subdivisions: ['eighth', 'eighth', 'quarter-rest', 'half'], assetKey: 'rhythm-patterns/t2-06' },
  { id: 't2-07', subdivisions: ['quarter-rest', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-07' },
  { id: 't2-08', subdivisions: ['quarter', 'eighth', 'eighth', 'quarter-rest'], assetKey: 'rhythm-patterns/t2-08' },
  { id: 't2-09', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-09' },
  { id: 't2-10', subdivisions: ['half', 'eighth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t2-10' },
  { id: 't2-11', subdivisions: ['quarter', 'quarter-rest', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-11' },
  { id: 't2-12', subdivisions: ['quarter-rest', 'half', 'quarter', 'quarter-rest'], assetKey: 'rhythm-patterns/t2-12' },
];

// ── Tier 3: + dotted-quarter + sixteenth, 5 events ──
const T3_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't3-01', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t3-01' },
  { id: 't3-02', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-02' },
  { id: 't3-03', subdivisions: ['eighth', 'dotted-quarter', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-03' },
  { id: 't3-04', subdivisions: ['quarter', 'quarter', 'dotted-quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-04' },
  { id: 't3-05', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'dotted-quarter'], assetKey: 'rhythm-patterns/t3-05' },
  { id: 't3-06', subdivisions: ['quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t3-06' },
  { id: 't3-07', subdivisions: ['dotted-quarter', 'dotted-quarter', 'quarter', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t3-07' },
  { id: 't3-08', subdivisions: ['eighth', 'eighth', 'quarter', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t3-08' },
  { id: 't3-09', subdivisions: ['quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'], assetKey: 'rhythm-patterns/t3-09' },
  { id: 't3-10', subdivisions: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t3-10' },
];

// ── Tier 4: + triplet, 6 events ─────────────────────
const T4_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't4-01', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t4-01' },
  { id: 't4-02', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t4-02' },
  { id: 't4-03', subdivisions: ['triplet', 'quarter', 'eighth', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t4-03' },
  { id: 't4-04', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'triplet', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t4-04' },
  { id: 't4-05', subdivisions: ['eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t4-05' },
  { id: 't4-06', subdivisions: ['quarter', 'quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t4-06' },
  { id: 't4-07', subdivisions: ['triplet', 'triplet', 'quarter', 'eighth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t4-07' },
  { id: 't4-08', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'triplet', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t4-08' },
];

// ── Tier 5: all subdivisions, 8 events ──────────────
const T5_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't5-01', subdivisions: ['quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet', 'quarter'], assetKey: 'rhythm-patterns/t5-01' },
  { id: 't5-02', subdivisions: ['triplet', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t5-02' },
  { id: 't5-03', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'], assetKey: 'rhythm-patterns/t5-03' },
  { id: 't5-04', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'triplet', 'sixteenth', 'sixteenth', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t5-04' },
  { id: 't5-05', subdivisions: ['quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth', 'dotted-quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t5-05' },
  { id: 't5-06', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'eighth', 'triplet', 'dotted-quarter', 'quarter', 'eighth'], assetKey: 'rhythm-patterns/t5-06' },
  { id: 't5-07', subdivisions: ['eighth', 'dotted-quarter', 'triplet', 'quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t5-07' },
  { id: 't5-08', subdivisions: ['triplet', 'quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet'], assetKey: 'rhythm-patterns/t5-08' },
];

const PATTERNS_BY_TIER: Record<Tier, CuratedRhythmPattern[]> = {
  1: T1_PATTERNS,
  2: T2_PATTERNS,
  3: T3_PATTERNS,
  4: T4_PATTERNS,
  5: T5_PATTERNS,
};

export function getCuratedPatterns(tier: Tier): CuratedRhythmPattern[] {
  return PATTERNS_BY_TIER[tier];
}

export function getRandomCuratedPattern(tier: Tier): CuratedRhythmPattern {
  const patterns = PATTERNS_BY_TIER[tier];
  return patterns[Math.floor(Math.random() * patterns.length)];
}
```

**Step 4: Run tests — expect pass**

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/logic/rhythmPatterns.ts client/src/games/melody-dungeon/__tests__/rhythmPatterns.test.ts
git commit -m "feat(melody-dungeon): add curated rhythm pattern catalog"
```

---

### Task 3: Generate LilyPond Source Files for All Rhythm Patterns

**Files:**
- Create: `lilypond/challenges/rhythm-patterns/t1-01.ly` through `t5-08.ly` (48 files)

Each `.ly` file renders the pattern's subdivision sequence on a `RhythmicStaff`.

**Subdivision-to-LilyPond mapping:**

| RhythmSubdivision | LilyPond notation |
|---|---|
| `quarter` | `c4` |
| `half` | `c2` |
| `eighth` | `c8` |
| `sixteenth` | `c16` |
| `quarter-rest` | `r4` |
| `dotted-quarter` | `c4.` |
| `triplet` | `\tuplet 3/2 { c8 c c }` |

**Template for each file:**

```lilypond
\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  [subdivision sequence here]
}
```

**Example — t1-01.ly (q q q q):**

```lilypond
\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  c4 c c c
}
```

**Example — t2-03.ly (q e e h):**

```lilypond
\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  c4 c8 c c2
}
```

**Example — t4-01.ly (q triplet e e q q):**

```lilypond
\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  c4 \tuplet 3/2 { c8 c c } c8 c c4 c
}
```

Create all 48 .ly files following this mapping. The subdivision sequences are defined in `rhythmPatterns.ts` (Task 2).

**Build and verify:**

```bash
bun run build:notation
```

Expected: 47 (existing) + 48 (new) = 95 SVGs.

**Commit:**

```bash
git add lilypond/challenges/rhythm-patterns/
git commit -m "feat(lilypond): add rhythm pattern notation source files (48 patterns)"
```

---

### Task 4: Integrate Curated Patterns into RhythmTapChallenge

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx`

**Step 1: Write the failing test**

Add to existing tests or create `client/src/games/melody-dungeon/__tests__/RhythmTapChallenge.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RhythmTapChallenge from '../challenges/RhythmTapChallenge';

describe('RhythmTapChallenge - notation', () => {
  it('renders a notation SVG image for the rhythm pattern', () => {
    const { container } = render(
      <RhythmTapChallenge tier={1} onResult={() => {}} />
    );
    const notationImages = container.querySelectorAll('img[src*="/images/notation/"]');
    expect(notationImages.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Modify RhythmTapChallenge**

Add imports:

```typescript
import { getRandomCuratedPattern } from '../logic/rhythmPatterns';
import { getNotationAsset } from '@/common/notation/notationAssets';
```

Replace the `generatePattern` call in the component with curated pattern selection.

Currently (around the useMemo that creates the pattern):

```typescript
const params = getRhythmParams(tier);
const pattern = useMemo(() => generatePattern(params), []);
```

Replace with:

```typescript
const params = getRhythmParams(tier);
const curatedPattern = useMemo(() => getRandomCuratedPattern(tier), [tier]);
const pattern = useMemo(() => {
  const beatDuration = 60000 / params.bpm;
  const events: PatternEvent[] = [];
  let currentTime = 0;
  for (const sub of curatedPattern.subdivisions) {
    const info = SUBDIVISION_INFO[sub];
    const dur = info.beats * beatDuration;
    events.push({ time: currentTime, duration: dur, taps: info.taps, subdivision: sub });
    currentTime += dur;
  }
  return events;
}, [curatedPattern, params.bpm]);
```

Add the notation image above the beat visuals:

```tsx
<h3 className="text-lg font-bold text-amber-200">Tap the Rhythm!</h3>

<img
  src={getNotationAsset('challenges/rhythm-patterns', curatedPattern.id)}
  alt="Rhythm pattern notation"
  className="h-12 mx-auto mb-2 invert"
  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
/>

<div className="flex gap-2 justify-center items-end">{beatVisuals}</div>
```

**Step 3: Run tests — expect pass**

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx client/src/games/melody-dungeon/__tests__/RhythmTapChallenge.test.tsx
git commit -m "feat(melody-dungeon): display rhythm notation in tap challenges"
```

---

### Task 5: Full Verification

**Step 1: Run full test suite for melody-dungeon**

```bash
bun run test -- client/src/games/melody-dungeon/ client/src/common/notation/
```

**Step 2: Build notation assets**

```bash
bun run build:notation
```

Expected: 95 SVGs total.

**Step 3: TypeScript check**

```bash
bun run check
```

**Step 4: Production build**

```bash
bun run build
```

**Step 5: Commit any fixes**

---

## Summary

| Task | Deliverable | Count |
|------|-------------|-------|
| 1 | Rhythm style include | 1 .ily file |
| 2 | Pattern catalog | rhythmPatterns.ts + tests |
| 3 | LilyPond source files | 48 .ly files |
| 4 | Challenge integration | Modified RhythmTapChallenge.tsx + tests |
| 5 | Verification | Full test pass |
