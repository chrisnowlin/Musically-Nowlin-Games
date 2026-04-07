# Challenge Types Pool Design

**Date:** 2026-03-01
**Goal:** Expand the melody dungeon challenge pool with vocabulary-based question types, smooth the difficulty curve by introducing basics earlier, and replace the adaptive difficulty system with deterministic floor-based tier progression.

## Core Principle

**The dungeon IS the difficulty curve.** No adaptive system. Floor number alone determines what types of questions appear and how hard they are. The player descends until their music knowledge runs out.

## Challenge Type Unlock Schedule

Each challenge type unlocks at a specific floor and starts at Tier 1.

| Floor | New Type Unlocked     |
|-------|-----------------------|
| 1     | Note Reading          |
| 1     | Dynamics Vocab        |
| 6     | Tempo Markings Vocab  |
| 11    | Musical Symbols Vocab |
| 16    | Rhythm Tap            |
| 21    | General Music Terms   |
| 26    | Interval Recognition  |

## Tier Progression

Each type advances based on floors since its unlock — not global floor number. Every type follows the same growth curve relative to when it appeared.

| Floors Since Unlock | Tier                  |
|---------------------|-----------------------|
| 0–9                 | Tier 1 (Basics)       |
| 10–24               | Tier 2 (Intermediate) |
| 25+                 | Tier 3 (Advanced)     |

### Tier Calculation

```typescript
const UNLOCK_FLOORS: Record<ChallengeType, number> = {
  noteReading: 1,
  dynamics: 1,
  tempo: 6,
  symbols: 11,
  rhythmTap: 16,
  terms: 21,
  interval: 26,
};

function getChallengeTypesForFloor(floor: number): ChallengeType[] {
  return Object.entries(UNLOCK_FLOORS)
    .filter(([_, unlockFloor]) => floor >= unlockFloor)
    .map(([type]) => type as ChallengeType);
}

function getTierForChallenge(floor: number, type: ChallengeType): 1 | 2 | 3 {
  const floorsActive = floor - UNLOCK_FLOORS[type];
  if (floorsActive >= 25) return 3;
  if (floorsActive >= 10) return 2;
  return 1;
}
```

## Vocabulary Challenge Content by Tier

All vocabulary questions go **both directions**: show term and pick meaning, or show meaning and pick term. Four answer buttons, one correct, three distractors.

### Dynamics Vocab (Unlocks Floor 1)

| Tier | Content |
|------|---------|
| 1    | p, f, mf, mp |
| 2    | Adds pp, ff, sfz, fp |
| 3    | Adds crescendo, decrescendo, diminuendo, morendo, context questions |

### Tempo Markings Vocab (Unlocks Floor 6)

| Tier | Content |
|------|---------|
| 1    | Allegro, Adagio, Andante, Moderato |
| 2    | Adds Presto, Largo, Vivace, Allegretto, ritardando, accelerando |
| 3    | Adds Grave, Lento, Prestissimo, tempo primo, a tempo, rubato |

### Musical Symbols Vocab (Unlocks Floor 11)

| Tier | Content |
|------|---------|
| 1    | Fermata, repeat sign, whole/half/quarter rest, sharp, flat |
| 2    | Adds natural, double bar, dal segno, coda sign, tie, slur, dot |
| 3    | Adds trill, mordent, turn, grace note, 8va, 8vb, tremolo |

### General Music Terms (Unlocks Floor 21)

| Tier | Content |
|------|---------|
| 1    | Staccato, legato, solo, duet, chord, melody, harmony |
| 2    | Adds da capo, unison, fine, ostinato, arpeggio, glissando, pizzicato |
| 3    | Adds con brio, cantabile, dolce, espressivo, maestoso, sotto voce, tutti |

## Existing Challenge Types — Revised Tiers

### Note Reading (Unlocks Floor 1)

| Tier | Notes Pool |
|------|------------|
| 1    | Space notes only: F4, A4, C5, E5 |
| 2    | All treble staff notes: E4–F5 (spaces + lines) |
| 3    | Adds ledger lines: C4, D4, G5, A5 |

### Rhythm Tap (Unlocks Floor 16)

| Tier | Beats | Subdivisions              | BPM | Tolerance |
|------|-------|---------------------------|-----|-----------|
| 1    | 4     | Quarter, half             | 80  | 300ms     |
| 2    | 4     | Quarter, half, eighth     | 100 | 200ms     |
| 3    | 6     | Quarter, eighth, sixteenth| 120 | 150ms     |

### Interval Recognition (Unlocks Floor 26)

| Tier | Intervals Available |
|------|---------------------|
| 1    | Unison, 2nd, 3rd |
| 2    | 2nd, 3rd, 4th, 5th |
| 3    | 2nd, 3rd, 4th, 5th, 6th, Octave |

## Enemy Type Affinities

| Enemy Subtype | Challenge Affinity   | Thematic Reason |
|---------------|----------------------|-----------------|
| Slime (new)   | Note Reading         | Classic starter enemy for the most basic challenge |
| Skeleton      | Rhythm Tap           | Bones keep the beat |
| Goblin        | Interval Recognition | Goblins play tricks on your ears |
| Bat (new)     | Dynamics Vocab       | Bats are sensitive to volume |
| Wraith (new)  | Tempo Markings       | Wraiths move at eerie speeds |
| Spider (new)  | Musical Symbols      | Spiders weave symbol webs |
| Shade (new)   | General Music Terms  | Shades whisper obscure knowledge |
| Ghost         | **Random pool**      | Ghosts surprise you — any challenge type available on the floor |
| Dragon        | Any (full pool)      | Boss-tier, tests everything |

Doors, Treasure, and Chests continue to pull randomly from the floor's available challenge pool.

Enemy spawning is weighted toward subtypes relevant to the floor's unlocked challenges. Ghosts can appear on any floor as the wildcard.

## UI/Component Design

### VocabularyChallenge.tsx (New)

A single reusable component for all four vocabulary types. Receives `category` and `tier` as props.

- Randomly picks question direction (term → meaning or meaning → term)
- Renders 4 multiple-choice buttons (1 correct, 3 distractors from same category/tier)
- For symbol-based questions, renders SVG/unicode instead of text
- Uses the same `onResult` callback pattern as existing challenges

### Question Data Structure

```typescript
type VocabCategory = 'dynamics' | 'tempo' | 'symbols' | 'terms';

interface VocabEntry {
  term: string;
  definition: string;
  symbol?: string;       // Optional SVG/unicode for visual symbols
  tier: 1 | 2 | 3;
  category: VocabCategory;
}
```

All entries live in `logic/vocabData.ts`, organized by category and tier.

## ChallengeModal Orchestration

Challenge type selection flow:
1. Look up enemy subtype affinity (Slime → noteReading, Bat → dynamics, etc.)
2. Ghost/Dragon/Door/Treasure → random from `getChallengeTypesForFloor(floorNumber)`
3. Calculate tier: `getTierForChallenge(floorNumber, challengeType)`
4. Render the appropriate challenge component with tier prop

Component routing adds vocabulary types:
- `noteReading` → `<NoteReadingChallenge tier={tier} />`
- `rhythmTap` → `<RhythmTapChallenge tier={tier} />`
- `interval` → `<IntervalChallenge tier={tier} />`
- `dynamics | tempo | symbols | terms` → `<VocabularyChallenge category={type} tier={tier} />`

## What Gets Removed

- Rolling 10-challenge accuracy history
- `getDifficultyLevel()` function (adaptive easy/medium/hard)
- `DifficultyLevel` type and all references
- Adaptive difficulty state in `MelodyDungeonGame.tsx`
- `DynamicsChallenge.tsx` (replaced by VocabularyChallenge)

## Files Changed

| File | Change |
|------|--------|
| `dungeonTypes.ts` | Add new ChallengeType values, new EnemySubtype values, remove DifficultyLevel |
| `challengeHelpers.ts` | New unlock schedule, tier calculator, enemy affinity map |
| `difficultyAdapter.ts` | Remove adaptive system, replace with floor-based tier functions |
| `vocabData.ts` (new) | All vocabulary entries by category and tier |
| `VocabularyChallenge.tsx` (new) | Unified vocab challenge component |
| `DynamicsChallenge.tsx` | Delete (replaced by VocabularyChallenge) |
| `NoteReadingChallenge.tsx` | Change difficulty prop to tier prop |
| `RhythmTapChallenge.tsx` | Change difficulty prop to tier prop |
| `IntervalChallenge.tsx` | Change difficulty prop to tier prop |
| `ChallengeModal.tsx` | New routing for 7 types, tier calculation, remove adaptive logic |
| `dungeonGenerator.ts` | New enemy subtypes, floor-appropriate spawn weighting |
| `MelodyDungeonGame.tsx` | Remove adaptive difficulty state and accuracy tracking |
| `HUD.tsx` | Remove difficulty display if shown |
| `DirectionsModal.tsx` | Update help text for new challenge types and enemies |
