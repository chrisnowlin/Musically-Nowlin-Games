# 100-Floor Progression Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the melody dungeon's difficulty system to use a 5-tier spiral curriculum across 100 floors, aligned with NC K-12 Music Standards, with 8 challenge types including a new timbre/instrument identification type.

**Architecture:** The floor zone system in `difficultyAdapter.ts` is the single source of truth — every other file calls into it. Types expand from 3-tier to 5-tier. All 8 challenge types are available from floor 1 (with frequency weighting for late-bloomers). Existing Philharmonia sample library and `usePhilharmoniaInstruments` hook power the new timbre challenge.

**Tech Stack:** React 19, TypeScript, Vitest, @testing-library/react, Web Audio API, Philharmonia sample library (13K+ MP3s already in project)

**Design Doc:** `docs/plans/2026-03-01-100-floor-progression-design.md`

---

## Task 1: Foundation Types + Floor Zone System

Expand the type system and rewrite the difficulty engine.

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts`
- Modify: `client/src/games/melody-dungeon/logic/difficultyAdapter.ts`
- Modify: `client/src/games/melody-dungeon/__tests__/challengeHelpers.test.ts`

**Step 1: Update `dungeonTypes.ts` types**

Change `Tier` from `1 | 2 | 3` to `1 | 2 | 3 | 4 | 5`.

Add `'timbre'` to the `ChallengeType` union:
```typescript
export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval' | 'dynamics' | 'tempo' | 'symbols' | 'terms' | 'timbre';
```

Add `'siren'` to the `EnemySubtype` union:
```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin' | 'slime' | 'bat' | 'wraith' | 'spider' | 'shade' | 'siren';
```

**Step 2: Rewrite `difficultyAdapter.ts`**

Replace the entire file. The new version has:

1. **Floor zone table** — defines the 9 zones (T1 pure, T1→T2 transition, T2 pure, etc.)
2. **`getFloorZone(floor)`** — returns `{ lowTier, highTier, progress }` for any floor 1-100
3. **`rollTier(floor)`** — returns a single tier via weighted random from the zone
4. **`getEnemyLevel(floor)`** — returns enemy level 1-5 based on zone
5. **`getChallengeTypeWeight(type, floor)`** — returns 0.15-1.0 frequency weight
6. **`rollChallengeType(floor)`** — weighted random type selection from all 8 types
7. **`getChallengeTypesForFloor(floor)`** — returns all 8 types (replaces old unlock-based version)

Core zone logic:

```typescript
import type { ChallengeType, Tier } from './dungeonTypes';

interface FloorZone {
  lowTier: Tier;
  highTier: Tier;
  /** 0 = 100% lowTier, 1 = 100% highTier */
  progress: number;
}

interface ZoneBoundary {
  start: number;
  end: number;
  lowTier: Tier;
  highTier: Tier;
}

const TRANSITIONS: ZoneBoundary[] = [
  { start: 13, end: 18, lowTier: 1, highTier: 2 },
  { start: 36, end: 42, lowTier: 2, highTier: 3 },
  { start: 69, end: 75, lowTier: 3, highTier: 4 },
  { start: 89, end: 94, lowTier: 4, highTier: 5 },
];

export function getFloorZone(floor: number): FloorZone {
  // Check transition zones first
  for (const t of TRANSITIONS) {
    if (floor >= t.start && floor <= t.end) {
      const progress = (floor - t.start) / (t.end - t.start);
      return { lowTier: t.lowTier, highTier: t.highTier, progress };
    }
  }
  // Pure zones
  if (floor <= 12) return { lowTier: 1, highTier: 1, progress: 0 };
  if (floor <= 35) return { lowTier: 2, highTier: 2, progress: 0 };
  if (floor <= 68) return { lowTier: 3, highTier: 3, progress: 0 };
  if (floor <= 88) return { lowTier: 4, highTier: 4, progress: 0 };
  return { lowTier: 5, highTier: 5, progress: 0 };
}

export function rollTier(floor: number): Tier {
  const zone = getFloorZone(floor);
  if (zone.lowTier === zone.highTier) return zone.lowTier;
  return Math.random() < zone.progress ? zone.highTier : zone.lowTier;
}

export function getEnemyLevel(floor: number): number {
  const zone = getFloorZone(floor);
  const baseLow = zone.lowTier;
  const baseHigh = zone.highTier;
  if (baseLow === baseHigh) return baseLow;
  // Uniform random between the two zone levels
  return Math.random() < 0.5 ? baseLow : baseHigh;
}

const ALL_TYPES: ChallengeType[] = [
  'noteReading', 'dynamics', 'tempo', 'symbols',
  'rhythmTap', 'timbre', 'interval', 'terms',
];

const LATE_BLOOMERS: ChallengeType[] = ['interval', 'terms'];

export function getChallengeTypeWeight(type: ChallengeType, floor: number): number {
  if (!LATE_BLOOMERS.includes(type)) return 1.0;
  if (floor >= 25) return 1.0;
  if (floor >= 13) return 0.5;
  return 0.15;
}

export function getChallengeTypesForFloor(_floor: number): ChallengeType[] {
  return [...ALL_TYPES];
}

export function rollChallengeType(floor: number): ChallengeType {
  const weights = ALL_TYPES.map((t) => getChallengeTypeWeight(t, floor));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < ALL_TYPES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return ALL_TYPES[i];
  }
  return ALL_TYPES[ALL_TYPES.length - 1];
}
```

Keep the existing param functions (`getNoteReadingParams`, `getRhythmParams`, `getIntervalParams`) but expand them to handle tiers 4-5 with placeholder content for now (subsequent tasks will fill in the real content). This avoids TypeScript errors from the Tier type change.

```typescript
// Placeholder expansions — filled in by later tasks
export function getNoteReadingParams(tier: Tier): NoteReadingParams {
  switch (tier) {
    case 1: return { notes: [...SPACE_NOTES], useBassClef: false, mode: 'space' };
    case 2: return { notes: [...BOTH_STAFF_NOTES], useBassClef: false, mode: 'both' };
    case 3: return { notes: [...LEDGER_NOTES], useBassClef: false, mode: 'ledger' };
    case 4: return { notes: [...LEDGER_NOTES], useBassClef: false, mode: 'ledger' }; // TODO: bass clef
    case 5: return { notes: [...LEDGER_NOTES], useBassClef: false, mode: 'ledger' }; // TODO: mixed clef
  }
}

export function getRhythmParams(tier: Tier): RhythmParams {
  switch (tier) {
    case 1: return { patternLength: 4, subdivisions: ['quarter', 'half'], bpm: 72, toleranceMs: 350 };
    case 2: return { patternLength: 4, subdivisions: ['quarter', 'half', 'eighth'], bpm: 80, toleranceMs: 300 };
    case 3: return { patternLength: 4, subdivisions: ['quarter', 'eighth', 'sixteenth'], bpm: 95, toleranceMs: 225 };
    case 4: return { patternLength: 6, subdivisions: ['quarter', 'eighth', 'sixteenth'], bpm: 110, toleranceMs: 175 };
    case 5: return { patternLength: 8, subdivisions: ['quarter', 'eighth', 'sixteenth'], bpm: 120, toleranceMs: 150 };
  }
}

export function getIntervalParams(tier: Tier): IntervalParams {
  switch (tier) {
    case 1: return { intervals: [{ name: 'Unison', semitones: 0 }, { name: '2nd', semitones: 2 }, { name: '3rd', semitones: 4 }] };
    case 2: return { intervals: [{ name: 'Unison', semitones: 0 }, { name: '2nd', semitones: 2 }, { name: '3rd', semitones: 4 }] };
    case 3: return { intervals: [{ name: 'Unison', semitones: 0 }, { name: '2nd', semitones: 2 }, { name: '3rd', semitones: 4 }] };
    case 4: return { intervals: [{ name: '2nd', semitones: 2 }, { name: '3rd', semitones: 4 }, { name: '4th', semitones: 5 }, { name: '5th', semitones: 7 }] };
    case 5: return { intervals: [{ name: '2nd', semitones: 2 }, { name: '3rd', semitones: 4 }, { name: '4th', semitones: 5 }, { name: '5th', semitones: 7 }, { name: '6th', semitones: 9 }, { name: 'Octave', semitones: 12 }] };
  }
}
```

**Step 3: Write tests for the new zone system**

Update `challengeHelpers.test.ts`. Replace the old unlock/tier tests with zone-based tests:

```typescript
describe('getFloorZone', () => {
  it('returns T1 pure for floors 1-12', () => {
    for (const floor of [1, 6, 12]) {
      const zone = getFloorZone(floor);
      expect(zone.lowTier).toBe(1);
      expect(zone.highTier).toBe(1);
    }
  });

  it('returns T1→T2 transition for floors 13-18', () => {
    const zone = getFloorZone(15);
    expect(zone.lowTier).toBe(1);
    expect(zone.highTier).toBe(2);
    expect(zone.progress).toBeGreaterThan(0);
    expect(zone.progress).toBeLessThan(1);
  });

  it('returns T2 pure for floors 19-35', () => {
    const zone = getFloorZone(25);
    expect(zone.lowTier).toBe(2);
    expect(zone.highTier).toBe(2);
  });

  it('returns T3 pure for floors 43-68', () => {
    const zone = getFloorZone(50);
    expect(zone.lowTier).toBe(3);
    expect(zone.highTier).toBe(3);
  });

  it('returns T5 pure for floors 95-100', () => {
    const zone = getFloorZone(100);
    expect(zone.lowTier).toBe(5);
    expect(zone.highTier).toBe(5);
  });
});

describe('rollTier', () => {
  it('always returns T1 for floors 1-12', () => {
    for (let i = 0; i < 20; i++) {
      expect(rollTier(5)).toBe(1);
    }
  });

  it('returns T1 or T2 for transition floors 13-18', () => {
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) results.add(rollTier(15));
    expect(results.has(1) || results.has(2)).toBe(true);
  });
});

describe('getEnemyLevel', () => {
  it('returns 1 for T1 zone', () => {
    expect(getEnemyLevel(5)).toBe(1);
  });

  it('returns 3 for T3 zone', () => {
    expect(getEnemyLevel(50)).toBe(3);
  });

  it('returns 5 for T5 zone', () => {
    expect(getEnemyLevel(99)).toBe(5);
  });
});

describe('getChallengeTypeWeight', () => {
  it('returns 1.0 for non-late-bloomers on any floor', () => {
    expect(getChallengeTypeWeight('noteReading', 1)).toBe(1.0);
    expect(getChallengeTypeWeight('dynamics', 50)).toBe(1.0);
    expect(getChallengeTypeWeight('timbre', 1)).toBe(1.0);
  });

  it('returns 0.15 for intervals on early floors', () => {
    expect(getChallengeTypeWeight('interval', 5)).toBe(0.15);
  });

  it('returns 0.5 for terms on mid-early floors', () => {
    expect(getChallengeTypeWeight('terms', 15)).toBe(0.5);
  });

  it('returns 1.0 for late-bloomers on floor 25+', () => {
    expect(getChallengeTypeWeight('interval', 25)).toBe(1.0);
    expect(getChallengeTypeWeight('terms', 50)).toBe(1.0);
  });
});

describe('getChallengeTypesForFloor', () => {
  it('returns all 8 types for any floor', () => {
    const types = getChallengeTypesForFloor(1);
    expect(types).toHaveLength(8);
    expect(types).toContain('timbre');
    expect(types).toContain('interval');
  });
});
```

**Step 4: Run tests**

Run: `cd client && npx vitest run src/games/melody-dungeon`
Expected: All melody-dungeon tests pass.

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/logic/difficultyAdapter.ts client/src/games/melody-dungeon/__tests__/challengeHelpers.test.ts
git commit -m "feat(melody-dungeon): 5-tier floor zone system with 8 challenge types"
```

---

## Task 2: Challenge Helpers + Dungeon Generator

Update enemy spawning and boss generation for 8 types and zone-based levels.

**Files:**
- Modify: `client/src/games/melody-dungeon/challengeHelpers.ts`
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts`
- Modify: `client/src/games/melody-dungeon/__tests__/challengeHelpers.test.ts`
- Modify: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`

**Step 1: Update `challengeHelpers.ts`**

Add siren to `getSubtypeChallengePool()`:
```typescript
case 'siren': return allFloorTypes.includes('timbre') ? ['timbre'] : allFloorTypes;
```

Update `getEnemySubtypesForFloor()` — all subtypes available from floor 1 (no unlock gating). Simplify to always return all subtypes:
```typescript
export function getEnemySubtypesForFloor(_floorNumber: number): EnemySubtype[] {
  return ['ghost', 'slime', 'bat', 'wraith', 'spider', 'skeleton', 'shade', 'goblin', 'siren'];
}
```

Update `generateBigBossSequence()` — pad to 8 rounds for 8 types.

**Step 2: Update `dungeonGenerator.ts`**

Replace `pickEnemyLevel()` to use the new `getEnemyLevel()` from `difficultyAdapter.ts`:
```typescript
import { getEnemyLevel } from './difficultyAdapter';
// ...
grid[pos.y][pos.x].enemyLevel = getEnemyLevel(floorNumber);
```

For dragons, use `Math.min(5, getEnemyLevel(floorNumber) + 1)` for the +1 level bonus.

Update the import to use `rollChallengeType` for random type selection on doors and treasure (instead of picking from the array randomly):
```typescript
import { getChallengeTypesForFloor, rollChallengeType, getEnemyLevel } from './difficultyAdapter';
// For doors/treasure:
grid[candidate.y][candidate.x].challengeType = rollChallengeType(floorNumber);
```

**Step 3: Update tests**

In `challengeHelpers.test.ts`:
- Update `getEnemySubtypesForFloor` tests: all subtypes available on floor 1
- Update `getSubtypeChallengePool` tests: add siren test case
- Update `generateBigBossSequence` tests: expect valid types from the full 8-type pool

In `dungeonGenerator.test.ts`:
- Update enemy subtype assertions to include siren
- Update enemy level assertions for the new zone-based scaling
- Dragon level should be `Math.min(5, zoneLevel + 1)` not always 3

**Step 4: Run tests**

Run: `cd client && npx vitest run src/games/melody-dungeon`
Expected: All pass.

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/challengeHelpers.ts client/src/games/melody-dungeon/logic/dungeonGenerator.ts client/src/games/melody-dungeon/__tests__/challengeHelpers.test.ts client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "feat(melody-dungeon): update helpers and generator for 8 types and zone-based levels"
```

---

## Task 3: Vocabulary Data Expansion

Reorganize all vocabulary entries into 5 tiers aligned with NC Standards. Add ~30-40 new entries.

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/vocabData.ts`
- Modify: `client/src/games/melody-dungeon/__tests__/vocabData.test.ts`

**Step 1: Update `VocabEntry` type**

Add a `format` field to support new question types:
```typescript
export interface VocabEntry {
  term: string;
  definition: string;
  symbol?: string;
  tier: 1 | 2 | 3 | 4 | 5;
  category: VocabCategory;
  /** Question format override. Defaults to 'standard' (4-choice MC). */
  format?: 'standard' | 'opposites' | 'ordering';
}
```

**Step 2: Reorganize all vocab entries**

Rewrite the data arrays to match the design doc tier assignments. This is the largest data change.

**Dynamics** — T1: opposites format (loud/soft, f/p, "dynamics" definition), T2: p/f/mf/mp + crescendo/decrescendo, T3: pp/ff/sfz/fp + ordering entries, T4: diminuendo/morendo + context, T5: subtle distinctions.

**Tempo** — T1: opposites format (fast/slow, Allegro/Adagio, "tempo" definition), T2: 4 core terms + rit/accel, T3: expanded terms + ordering, T4: rare terms + tempo primo/a tempo, T5: rubato/alla breve.

**Symbols** — T1: note values (quarter note, half note, whole note, quarter rest, treble clef), T2: rests/ties/dots/time sigs, T3: sharp/flat/natural/fermata/repeat/6:8, T4: D.S./coda/bass clef/key sig, T5: ornaments/8va/8vb.

**Terms** — T1: simple English (melody, rhythm, beat, loud, soft, fast, slow, high, low, song, singer, instrument), T2: unison/round/ostinato/solo/duet/chord/harmony/ensemble/AB/ABA, T3: staccato/legato/pentatonic/syncopation/arpeggio/phrasing/rondo/timbre, T4: Da Capo/fine/monophonic/homophonic/polyphonic/pizzicato/glissando, T5: Italian expression terms.

Each tier within each category must have at least 4 entries (for 4-button multiple choice). Opposites-format entries only appear at T1.

**Step 3: Update `getVocabEntries()`**

The function currently returns entries up to the given tier (tier 2 returns tier 1+2). Keep this behavior but update for 5 tiers.

**Step 4: Update tests**

In `vocabData.test.ts`:
- Update valid tier assertion: `[1, 2, 3, 4, 5]`
- Update each-category-has-all-tiers assertion for 5 tiers
- Update minimum entry count assertion (≥70 total, up from ≥40)
- Add test: T1 dynamics entries include at least one with `format: 'opposites'`
- Add test: T3 dynamics entries include at least one with `format: 'ordering'`
- Add test: each tier within each category has ≥ 4 entries

**Step 5: Run tests**

Run: `cd client && npx vitest run src/games/melody-dungeon/__tests__/vocabData.test.ts`
Expected: All pass.

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/logic/vocabData.ts client/src/games/melody-dungeon/__tests__/vocabData.test.ts
git commit -m "feat(melody-dungeon): expand vocab data to 5 tiers aligned with NC Standards"
```

---

## Task 4: VocabularyChallenge New Formats

Add opposites (binary choice) and ordering (rank sequence) question formats.

**Files:**
- Modify: `client/src/games/melody-dungeon/VocabularyChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx`

**Step 1: Add opposites format**

When the selected vocab entry has `format: 'opposites'`, render a binary choice instead of 4 buttons. The question shows two terms and asks which matches a property (e.g., "Which is louder?" with buttons "f" and "p"). One is correct, one is wrong.

**Step 2: Add ordering format**

When `format: 'ordering'`, render 4 items that the player must tap in sequence (e.g., softest→loudest: pp, p, mf, f). The items start unordered and the player taps them in correct order. Show numbered indicators as they tap.

**Step 3: Update tests**

- Test opposites format renders 2 buttons
- Test ordering format renders 4 tappable items
- Test correct ordering triggers success
- Test wrong ordering triggers failure

**Step 4: Run tests, commit**

```bash
git commit -m "feat(melody-dungeon): add opposites and ordering vocab question formats"
```

---

## Task 5: Note Reading — Bass Clef (T4-T5)

Add bass clef support to the note reading challenge.

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/difficultyAdapter.ts`
- Modify: `client/src/games/melody-dungeon/NoteReadingChallenge.tsx`

**Step 1: Update `difficultyAdapter.ts` note reading params**

```typescript
const BASS_STAFF_NOTES = ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'];
const BASS_LEDGER_NOTES = [...BASS_STAFF_NOTES, 'E2', 'F2', 'B3', 'C4'];

export type NoteReadingMode = 'space' | 'both' | 'ledger' | 'bass' | 'mixed';

export function getNoteReadingParams(tier: Tier): NoteReadingParams {
  switch (tier) {
    case 1: return { notes: [...SPACE_NOTES], useBassClef: false, mode: 'space' };
    case 2: return { notes: [...BOTH_STAFF_NOTES], useBassClef: false, mode: 'both' };
    case 3: return { notes: [...LEDGER_NOTES], useBassClef: false, mode: 'ledger' };
    case 4: return { notes: [...BASS_STAFF_NOTES], useBassClef: true, mode: 'bass' };
    case 5: return { notes: [...LEDGER_NOTES, ...BASS_LEDGER_NOTES], useBassClef: false, mode: 'mixed' };
  }
}
```

For T5 `mixed` mode: randomly pick treble or bass per question. The component uses `useBassClef` for rendering and `mode: 'mixed'` to indicate random clef selection.

**Step 2: Update `NoteReadingChallenge.tsx`**

Add bass clef staff rendering. The treble clef SVG staff already exists — add a bass clef variant. For `mixed` mode, randomly select clef per question and filter the note pool accordingly.

The staff rendering needs:
- Bass clef symbol instead of treble clef
- Different line note mappings (bass clef lines: G-B-D-F-A vs treble clef lines: E-G-B-D-F)
- Ledger line logic for notes above/below the bass staff

**Step 3: Run tests, commit**

```bash
git commit -m "feat(melody-dungeon): add bass clef note reading for T4-T5"
```

---

## Task 6: Rhythm Tap — 5 Tiers

Add rests, dotted rhythms, triplets, and syncopation to rhythm patterns.

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/difficultyAdapter.ts`
- Modify: `client/src/games/melody-dungeon/RhythmTapChallenge.tsx`

**Step 1: Expand rhythm params**

Add new subdivision types:
```typescript
export type RhythmSubdivision = 'quarter' | 'eighth' | 'half' | 'sixteenth' | 'quarter-rest' | 'dotted-quarter' | 'triplet';

export function getRhythmParams(tier: Tier): RhythmParams {
  switch (tier) {
    case 1: return { patternLength: 4, subdivisions: ['quarter', 'half'], bpm: 72, toleranceMs: 350 };
    case 2: return { patternLength: 4, subdivisions: ['quarter', 'half', 'quarter-rest', 'eighth'], bpm: 80, toleranceMs: 300 };
    case 3: return { patternLength: 5, subdivisions: ['quarter', 'eighth', 'dotted-quarter', 'sixteenth'], bpm: 95, toleranceMs: 225 };
    case 4: return { patternLength: 6, subdivisions: ['quarter', 'eighth', 'sixteenth', 'triplet'], bpm: 110, toleranceMs: 175 };
    case 5: return { patternLength: 8, subdivisions: ['quarter', 'eighth', 'sixteenth', 'triplet', 'dotted-quarter'], bpm: 120, toleranceMs: 150 };
  }
}
```

**Step 2: Update pattern generation in `RhythmTapChallenge.tsx`**

The existing pattern generator picks subdivisions and fills beats. Update it to:
- Handle `'quarter-rest'` — a beat where the player should NOT tap. Show a rest symbol in the visual pattern. During evaluation, penalize tapping during a rest.
- Handle `'dotted-quarter'` — 1.5 beats. Tap on the downbeat, hold through the dot.
- Handle `'triplet'` — 3 equal subdivisions within 1 beat. Three taps evenly spaced.

**Step 3: Update visual pattern display**

Show rest symbols (𝄽) in the rhythm pattern where rests occur. Show dot after dotted notes. Show triplet bracket for triplet groups.

**Step 4: Run tests, commit**

```bash
git commit -m "feat(melody-dungeon): expand rhythm tap to 5 tiers with rests and triplets"
```

---

## Task 7: Intervals — Simplified T1-T2 Formats

Add "higher/lower" and "step/skip/same" formats for early tiers.

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/difficultyAdapter.ts`
- Modify: `client/src/games/melody-dungeon/IntervalChallenge.tsx`

**Step 1: Update interval params**

Add a `mode` field to distinguish simplified vs standard formats:

```typescript
export type IntervalMode = 'highLow' | 'stepSkip' | 'standard';

export interface IntervalParams {
  intervals: { name: string; semitones: number }[];
  mode: IntervalMode;
}

export function getIntervalParams(tier: Tier): IntervalParams {
  switch (tier) {
    case 1: return {
      mode: 'highLow',
      intervals: [
        { name: 'Same', semitones: 0 },
        { name: 'Higher', semitones: 2 },
        { name: 'Lower', semitones: -2 },
      ],
    };
    case 2: return {
      mode: 'stepSkip',
      intervals: [
        { name: 'Same', semitones: 0 },
        { name: 'Step', semitones: 2 },
        { name: 'Skip', semitones: 4 },
      ],
    };
    case 3: return {
      mode: 'standard',
      intervals: [
        { name: 'Unison', semitones: 0 },
        { name: '2nd', semitones: 2 },
        { name: '3rd', semitones: 4 },
      ],
    };
    case 4: return {
      mode: 'standard',
      intervals: [
        { name: '2nd', semitones: 2 },
        { name: '3rd', semitones: 4 },
        { name: '4th', semitones: 5 },
        { name: '5th', semitones: 7 },
      ],
    };
    case 5: return {
      mode: 'standard',
      intervals: [
        { name: '2nd', semitones: 2 },
        { name: '3rd', semitones: 4 },
        { name: '4th', semitones: 5 },
        { name: '5th', semitones: 7 },
        { name: '6th', semitones: 9 },
        { name: 'Octave', semitones: 12 },
      ],
    };
  }
}
```

**Step 2: Update `IntervalChallenge.tsx`**

- `highLow` mode: Play two notes. Show 2 buttons: "Higher" / "Lower" (or "Same" if unison). Question: "Is the second note higher or lower?"
- `stepSkip` mode: Play two notes. Show 3 buttons: "Step" / "Skip" / "Same". Question: "Did the melody move by step, skip, or stay the same?"
- `standard` mode: Existing behavior (identify the interval name).

For `highLow` mode, the second note can be higher OR lower (random). For `stepSkip`, steps are 1-2 semitones, skips are 3+ semitones.

**Step 3: Run tests, commit**

```bash
git commit -m "feat(melody-dungeon): add simplified interval formats for T1-T2"
```

---

## Task 8: TimbreChallenge Component

New challenge type for instrument/voice identification using Philharmonia samples.

**Files:**
- Create: `client/src/games/melody-dungeon/TimbreChallenge.tsx`
- Create: `client/src/games/melody-dungeon/__tests__/TimbreChallenge.test.tsx`
- Create: `client/src/games/melody-dungeon/logic/timbreData.ts`

**Step 1: Create `timbreData.ts`**

Define instrument pools per tier:

```typescript
import type { Tier } from './dungeonTypes';

export interface TimbreEntry {
  id: string;
  displayName: string;
  tier: Tier;
  /** Path prefix within /audio/philharmonia/ or null for synthesis */
  philharmoniaPath: string | null;
  /** Instrument family for family-level questions */
  family?: string;
}

// T1: Voice types (no Philharmonia samples — use synthesis)
// T2: Families + classroom instruments
// T3: Specific orchestral + folk instruments
// T4: Expanded world instruments
// T5: Subtle pairs
```

Each tier's pool should have at least 4 entries for 4-choice questions.

Reference the existing `instrumentLibrary.ts` at `client/src/common/instruments/instrumentLibrary.ts` for instrument metadata and the `usePhilharmoniaInstruments` hook at `client/src/common/hooks/usePhilharmoniaInstruments.ts` for sample loading patterns.

**Step 2: Create `TimbreChallenge.tsx`**

Component structure:
1. On mount, pick a random instrument from the tier's pool
2. Pick 3 distractors from the same tier (prefer same-family distractors at higher tiers)
3. Load and play a sample using the existing audio service
4. Show 4 buttons with instrument names
5. "Replay" button to hear the sample again
6. On selection, call `onResult(correct: boolean)`

Use the `usePhilharmoniaInstruments` hook for sample playback (already handles loading, caching, volume normalization).

For T1 voice types (singing/speaking/whispering/shouting): use Web Audio synthesis since these aren't in the Philharmonia library. Reference `Timbre002Game.tsx` which synthesizes different sound qualities.

**Step 3: Write tests**

In `TimbreChallenge.test.tsx`:
- Renders 4 answer buttons
- Shows a "Play Sound" button
- Correct answer triggers onResult(true)
- Wrong answer triggers onResult(false)

Mock the audio service (already mocked in test setup).

**Step 4: Run tests, commit**

```bash
git commit -m "feat(melody-dungeon): add TimbreChallenge component for instrument identification"
```

---

## Task 9: ChallengeModal Routing + Integration

Wire the new tier system and timbre type into the challenge modal.

**Files:**
- Modify: `client/src/games/melody-dungeon/ChallengeModal.tsx`
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Update `ChallengeModal.tsx`**

Update the challenge type routing to include timbre:
```typescript
case 'timbre':
  return <TimbreChallenge tier={tier} onResult={handleResult} />;
```

Update tier calculation to use `rollTier(floorNumber)` instead of the old `getTierForChallenge()`:
```typescript
import { rollTier } from './logic/difficultyAdapter';
// ...
const tier = rollTier(floorNumber);
```

Update the BossBattle component's round generation to use the new system.

**Step 2: Update `MelodyDungeonGame.tsx`**

Update the enemy encounter logic to use `getEnemyLevel(floorNumber)` for question count. Currently an enemy fight is one challenge — now it should be `enemyLevel` challenges in sequence (or handled via the BossBattle component for multi-round fights).

If the current system handles multi-question enemies differently from bosses, align them. The simplest approach: for a level-N enemy, the player must answer N consecutive questions correctly to defeat it. Any wrong answer (without shield) costs 1 HP but the enemy is still defeated.

**Step 3: Update type imports**

Ensure all files importing from `difficultyAdapter.ts` use the new function names (`rollTier`, `rollChallengeType`, `getEnemyLevel` instead of the old ones).

**Step 4: Run full test suite**

Run: `cd client && npx vitest run src/games/melody-dungeon`
Expected: All tests pass.

**Step 5: Commit**

```bash
git commit -m "feat(melody-dungeon): wire 5-tier system and timbre type into challenge modal"
```

---

## Task 10: DirectionsModal + MerchantModal Updates

Update help text and owned-count helper for the new enemy and challenge type.

**Files:**
- Modify: `client/src/games/melody-dungeon/DirectionsModal.tsx`
- Modify: `client/src/games/melody-dungeon/MerchantModal.tsx` (if needed)

**Step 1: Update `DirectionsModal.tsx`**

Add siren enemy to the enemy descriptions. Add timbre challenge type to the challenge descriptions. Update any references to "7 challenge types" → "8 challenge types." Update tier descriptions if shown.

**Step 2: Verify MerchantModal**

The `getOwnedCount()` helper shouldn't need changes (it maps item IDs, not challenge types). Verify no references to the old tier system exist.

**Step 3: Run full test suite, commit**

```bash
git commit -m "feat(melody-dungeon): update directions for siren enemy and timbre challenges"
```

---

## Task 11: Final Integration Test + TypeScript Check

Verify everything compiles and all tests pass.

**Files:** None (verification only)

**Step 1: TypeScript check**

Run: `cd client && npx tsc --noEmit 2>&1 | grep melody-dungeon`
Expected: 0 errors in melody-dungeon files.

**Step 2: Full test suite**

Run: `cd client && npx vitest run src/games/melody-dungeon`
Expected: All tests pass.

**Step 3: Manual smoke test checklist**

Run the dev server (`cd client && npm run dev`) and verify:
- Floor 1: all challenge types can appear, T1 content only
- Floor 15 (transition): mix of T1 and T2 questions
- Floor 50 (T3 pure): grade 4-5 content, enemies ask 3 questions each
- Floor 100 (T5 pure): HS content, enemies ask 5 questions each
- Timbre challenge plays audio and shows 4 choices
- Opposites format shows 2 buttons for T1 dynamics/tempo
- Boss fights use the new tier system
- Siren enemy appears and gives timbre questions

**Step 4: Commit any fixes**

```bash
git commit -m "fix(melody-dungeon): integration fixes for 100-floor progression"
```
