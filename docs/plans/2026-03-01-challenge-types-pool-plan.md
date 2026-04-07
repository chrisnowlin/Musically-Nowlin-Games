# Challenge Types Pool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the melody dungeon with 4 vocabulary challenge types, replace adaptive difficulty with deterministic floor-based tiers, add new enemy subtypes, and smooth the difficulty curve.

**Architecture:** A new unified `VocabularyChallenge` component handles all 4 vocab types (dynamics, tempo, symbols, terms). A `vocabData.ts` data file holds all question entries organized by category and tier. The adaptive difficulty system is replaced with a pure floor-based tier calculator. New enemy subtypes map to the new challenge types.

**Tech Stack:** React, TypeScript, Tailwind CSS (existing stack)

---

### Task 1: Update Type Definitions

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts`

**Step 1: Add new ChallengeType values**

Replace line 17:
```typescript
export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval';
```
With:
```typescript
export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval' | 'dynamics' | 'tempo' | 'symbols' | 'terms';
```

**Step 2: Add new EnemySubtype values**

Replace line 21:
```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin';
```
With:
```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin' | 'slime' | 'bat' | 'wraith' | 'spider' | 'shade';
```

**Step 3: Add Tier type, remove DifficultyLevel**

Replace line 46:
```typescript
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
```
With:
```typescript
export type Tier = 1 | 2 | 3;

/** @deprecated Replaced by Tier. Kept temporarily for migration. */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
```

**Step 4: Update GameState interface**

In the `GameState` interface (line 150-158), replace `difficulty: DifficultyLevel` with removal (it will be derived from floor number, not stored as state). For now, keep it to avoid breaking everything at once — it will be removed in Task 9.

**Step 5: Verify build compiles**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors (existing references to DifficultyLevel still compile since we kept it)

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts
git commit -m "feat(melody-dungeon): add new ChallengeType, EnemySubtype, and Tier types"
```

---

### Task 2: Create Vocabulary Data File

**Files:**
- Create: `client/src/games/melody-dungeon/logic/vocabData.ts`

**Step 1: Create the vocab data file**

```typescript
import type { Tier } from './dungeonTypes';

export type VocabCategory = 'dynamics' | 'tempo' | 'symbols' | 'terms';

export interface VocabEntry {
  term: string;
  definition: string;
  symbol?: string;
  tier: Tier;
  category: VocabCategory;
}

const DYNAMICS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'p', definition: 'Soft', symbol: '𝆏', tier: 1, category: 'dynamics' },
  { term: 'f', definition: 'Loud', symbol: '𝆑', tier: 1, category: 'dynamics' },
  { term: 'mf', definition: 'Moderately loud', symbol: 'mf', tier: 1, category: 'dynamics' },
  { term: 'mp', definition: 'Moderately soft', symbol: 'mp', tier: 1, category: 'dynamics' },
  // Tier 2
  { term: 'pp', definition: 'Very soft', symbol: 'pp', tier: 2, category: 'dynamics' },
  { term: 'ff', definition: 'Very loud', symbol: 'ff', tier: 2, category: 'dynamics' },
  { term: 'sfz', definition: 'Sudden strong accent', symbol: 'sfz', tier: 2, category: 'dynamics' },
  { term: 'fp', definition: 'Loud then immediately soft', symbol: 'fp', tier: 2, category: 'dynamics' },
  // Tier 3
  { term: 'crescendo', definition: 'Gradually getting louder', symbol: 'cresc.', tier: 3, category: 'dynamics' },
  { term: 'decrescendo', definition: 'Gradually getting softer', symbol: 'decresc.', tier: 3, category: 'dynamics' },
  { term: 'diminuendo', definition: 'Gradually getting softer', symbol: 'dim.', tier: 3, category: 'dynamics' },
  { term: 'morendo', definition: 'Dying away', symbol: 'morendo', tier: 3, category: 'dynamics' },
];

const TEMPO_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Allegro', definition: 'Fast and lively', tier: 1, category: 'tempo' },
  { term: 'Adagio', definition: 'Slow and stately', tier: 1, category: 'tempo' },
  { term: 'Andante', definition: 'Walking pace', tier: 1, category: 'tempo' },
  { term: 'Moderato', definition: 'Moderate speed', tier: 1, category: 'tempo' },
  // Tier 2
  { term: 'Presto', definition: 'Very fast', tier: 2, category: 'tempo' },
  { term: 'Largo', definition: 'Very slow and broad', tier: 2, category: 'tempo' },
  { term: 'Vivace', definition: 'Lively and fast', tier: 2, category: 'tempo' },
  { term: 'Allegretto', definition: 'Moderately fast', tier: 2, category: 'tempo' },
  { term: 'ritardando', definition: 'Gradually slowing down', tier: 2, category: 'tempo' },
  { term: 'accelerando', definition: 'Gradually speeding up', tier: 2, category: 'tempo' },
  // Tier 3
  { term: 'Grave', definition: 'Very slow and solemn', tier: 3, category: 'tempo' },
  { term: 'Lento', definition: 'Slow', tier: 3, category: 'tempo' },
  { term: 'Prestissimo', definition: 'As fast as possible', tier: 3, category: 'tempo' },
  { term: 'tempo primo', definition: 'Return to the original tempo', tier: 3, category: 'tempo' },
  { term: 'a tempo', definition: 'Return to the previous tempo', tier: 3, category: 'tempo' },
  { term: 'rubato', definition: 'Flexible tempo for expression', tier: 3, category: 'tempo' },
];

const SYMBOLS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Fermata', definition: 'Hold the note longer than its value', symbol: '𝄐', tier: 1, category: 'symbols' },
  { term: 'Repeat sign', definition: 'Go back and play the section again', symbol: '𝄇', tier: 1, category: 'symbols' },
  { term: 'Whole rest', definition: 'Rest for a whole measure', symbol: '𝄻', tier: 1, category: 'symbols' },
  { term: 'Half rest', definition: 'Rest for two beats', symbol: '𝄼', tier: 1, category: 'symbols' },
  { term: 'Quarter rest', definition: 'Rest for one beat', symbol: '𝄽', tier: 1, category: 'symbols' },
  { term: 'Sharp', definition: 'Raise the pitch by a half step', symbol: '♯', tier: 1, category: 'symbols' },
  { term: 'Flat', definition: 'Lower the pitch by a half step', symbol: '♭', tier: 1, category: 'symbols' },
  // Tier 2
  { term: 'Natural', definition: 'Cancel a sharp or flat', symbol: '♮', tier: 2, category: 'symbols' },
  { term: 'Double bar line', definition: 'Marks the end of a section', symbol: '𝄁', tier: 2, category: 'symbols' },
  { term: 'Dal Segno', definition: 'Go back to the segno sign', symbol: 'D.S.', tier: 2, category: 'symbols' },
  { term: 'Coda', definition: 'Jump to the ending section', symbol: '𝄌', tier: 2, category: 'symbols' },
  { term: 'Tie', definition: 'Connect two notes of the same pitch', tier: 2, category: 'symbols' },
  { term: 'Slur', definition: 'Play notes smoothly connected', tier: 2, category: 'symbols' },
  { term: 'Dotted note', definition: 'Adds half the note\'s value', tier: 2, category: 'symbols' },
  // Tier 3
  { term: 'Trill', definition: 'Rapidly alternate between two adjacent notes', symbol: 'tr', tier: 3, category: 'symbols' },
  { term: 'Mordent', definition: 'Quick alternation with the note below', tier: 3, category: 'symbols' },
  { term: 'Turn', definition: 'Ornament playing notes above and below', symbol: '~', tier: 3, category: 'symbols' },
  { term: 'Grace note', definition: 'A quick ornamental note before the main note', tier: 3, category: 'symbols' },
  { term: '8va', definition: 'Play one octave higher', symbol: '8va', tier: 3, category: 'symbols' },
  { term: '8vb', definition: 'Play one octave lower', symbol: '8vb', tier: 3, category: 'symbols' },
  { term: 'Tremolo', definition: 'Rapid repetition of a note', tier: 3, category: 'symbols' },
];

const TERMS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Staccato', definition: 'Play notes short and detached', tier: 1, category: 'terms' },
  { term: 'Legato', definition: 'Play notes smooth and connected', tier: 1, category: 'terms' },
  { term: 'Solo', definition: 'A piece or passage for one performer', tier: 1, category: 'terms' },
  { term: 'Duet', definition: 'A piece for two performers', tier: 1, category: 'terms' },
  { term: 'Chord', definition: 'Three or more notes played together', tier: 1, category: 'terms' },
  { term: 'Melody', definition: 'A sequence of single notes forming a tune', tier: 1, category: 'terms' },
  { term: 'Harmony', definition: 'Notes combined to support the melody', tier: 1, category: 'terms' },
  // Tier 2
  { term: 'Da Capo', definition: 'Go back to the beginning', symbol: 'D.C.', tier: 2, category: 'terms' },
  { term: 'Dal Segno', definition: 'Go back to the sign', symbol: 'D.S.', tier: 2, category: 'terms' },
  { term: 'Fine', definition: 'The end of the piece', tier: 2, category: 'terms' },
  { term: 'Ostinato', definition: 'A repeated musical pattern', tier: 2, category: 'terms' },
  { term: 'Arpeggio', definition: 'A broken chord played one note at a time', tier: 2, category: 'terms' },
  { term: 'Glissando', definition: 'A slide between two notes', tier: 2, category: 'terms' },
  { term: 'Pizzicato', definition: 'Pluck the strings instead of bowing', tier: 2, category: 'terms' },
  // Tier 3
  { term: 'Con brio', definition: 'With spirit and vigor', tier: 3, category: 'terms' },
  { term: 'Cantabile', definition: 'In a singing style', tier: 3, category: 'terms' },
  { term: 'Dolce', definition: 'Sweetly and softly', tier: 3, category: 'terms' },
  { term: 'Espressivo', definition: 'With expression', tier: 3, category: 'terms' },
  { term: 'Maestoso', definition: 'Majestic and stately', tier: 3, category: 'terms' },
  { term: 'Sotto voce', definition: 'In a soft, quiet voice', tier: 3, category: 'terms' },
  { term: 'Tutti', definition: 'All performers play together', tier: 3, category: 'terms' },
];

const ALL_ENTRIES: VocabEntry[] = [
  ...DYNAMICS_ENTRIES,
  ...TEMPO_ENTRIES,
  ...SYMBOLS_ENTRIES,
  ...TERMS_ENTRIES,
];

/** Get all vocab entries for a given category up to (and including) the specified tier. */
export function getVocabEntries(category: VocabCategory, tier: Tier): VocabEntry[] {
  return ALL_ENTRIES.filter((e) => e.category === category && e.tier <= tier);
}

/** Get all vocab entries across all categories (used for generating distractors). */
export function getAllVocabEntries(): VocabEntry[] {
  return ALL_ENTRIES;
}
```

**Step 2: Verify build compiles**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/logic/vocabData.ts
git commit -m "feat(melody-dungeon): add vocabulary data file with all entries by category and tier"
```

---

### Task 3: Rewrite Difficulty Adapter to Tier-Based System

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/difficultyAdapter.ts`

**Step 1: Replace the entire file contents**

The new file removes adaptive difficulty (DifficultyState, recordResult, getAccuracy) and replaces the difficulty-level parameter functions with tier-based versions. It keeps `getNoteReadingParamsForFloor` since Note Reading already used floor-based logic, but adjusts it to use the tier thresholds from our design.

```typescript
import type { ChallengeType, Tier } from './dungeonTypes';

/** Floor at which each challenge type first appears. */
export const UNLOCK_FLOORS: Record<ChallengeType, number> = {
  noteReading: 1,
  dynamics: 1,
  tempo: 6,
  symbols: 11,
  rhythmTap: 16,
  terms: 21,
  interval: 26,
};

/** Get all challenge types available on a given floor. */
export function getChallengeTypesForFloor(floorNumber: number): ChallengeType[] {
  return (Object.entries(UNLOCK_FLOORS) as [ChallengeType, number][])
    .filter(([, unlockFloor]) => floorNumber >= unlockFloor)
    .map(([type]) => type);
}

/** Get the tier for a challenge type on a given floor. */
export function getTierForChallenge(floorNumber: number, type: ChallengeType): Tier {
  const floorsActive = floorNumber - UNLOCK_FLOORS[type];
  if (floorsActive >= 25) return 3;
  if (floorsActive >= 10) return 2;
  return 1;
}

// ── Note Reading ──────────────────────────────────────────

export type NoteReadingMode = 'space' | 'line' | 'both' | 'ledger';

const SPACE_NOTES = ['F4', 'A4', 'C5', 'E5'];
const LINE_NOTES = ['E4', 'G4', 'B4', 'D5', 'F5'];
const BOTH_STAFF_NOTES = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
const LEDGER_NOTES = [...BOTH_STAFF_NOTES, 'C4', 'D4', 'G5', 'A5'];

export interface NoteReadingParams {
  notes: string[];
  useBassClef: boolean;
  mode: NoteReadingMode;
}

/** Note reading params based on tier. */
export function getNoteReadingParams(tier: Tier): NoteReadingParams {
  const mode: NoteReadingMode = tier === 1 ? 'space' : tier === 2 ? 'both' : 'ledger';
  const notes = mode === 'space' ? SPACE_NOTES
    : mode === 'both' ? BOTH_STAFF_NOTES
    : LEDGER_NOTES;
  return { notes: [...notes], useBassClef: false, mode };
}

// ── Rhythm ────────────────────────────────────────────────

export interface RhythmParams {
  patternLength: number;
  subdivisions: ('quarter' | 'eighth' | 'half' | 'sixteenth')[];
  bpm: number;
  toleranceMs: number;
}

export function getRhythmParams(tier: Tier): RhythmParams {
  switch (tier) {
    case 1:
      return { patternLength: 4, subdivisions: ['quarter', 'half'], bpm: 80, toleranceMs: 300 };
    case 2:
      return { patternLength: 4, subdivisions: ['quarter', 'half', 'eighth'], bpm: 100, toleranceMs: 200 };
    case 3:
      return { patternLength: 6, subdivisions: ['quarter', 'eighth', 'sixteenth'], bpm: 120, toleranceMs: 150 };
  }
}

// ── Interval ──────────────────────────────────────────────

export interface IntervalParams {
  intervals: { name: string; semitones: number }[];
}

export function getIntervalParams(tier: Tier): IntervalParams {
  switch (tier) {
    case 1:
      return {
        intervals: [
          { name: 'Unison', semitones: 0 },
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
        ],
      };
    case 2:
      return {
        intervals: [
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
          { name: '4th', semitones: 5 },
          { name: '5th', semitones: 7 },
        ],
      };
    case 3:
      return {
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

**Step 2: Verify build — expect errors from consumers**

Run: `cd client && npx tsc --noEmit 2>&1 | head -40`
Expected: Errors in files that still import old exports (createDifficultyState, recordResult, DifficultyState, getNoteReadingParamsForFloor, getDynamicsParams). This is fine — we fix them in later tasks.

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/logic/difficultyAdapter.ts
git commit -m "feat(melody-dungeon): replace adaptive difficulty with floor-based tier system"
```

---

### Task 4: Update Challenge Helpers

**Files:**
- Modify: `client/src/games/melody-dungeon/challengeHelpers.ts`

**Step 1: Replace the entire file contents**

The new file uses the tier system, updates enemy affinities, and fixes boss sequence generation.

```typescript
import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import { getChallengeTypesForFloor, getTierForChallenge } from './logic/difficultyAdapter';

export { getChallengeTypesForFloor, getTierForChallenge };

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface BossRoundConfig {
  type: ChallengeType;
  tier: Tier;
}

/** Generate the 8-round BigBoss sequence. All rounds use the floor's tier for each type. */
export function generateBigBossSequence(floorNumber: number): BossRoundConfig[] {
  const types = getChallengeTypesForFloor(floorNumber);
  const sequence: BossRoundConfig[] = [];

  for (let i = 0; i < 8; i++) {
    const type = pickRandom(types);
    sequence.push({ type, tier: getTierForChallenge(floorNumber, type) });
  }

  return shuffle(sequence);
}

/** Enemy subtype → challenge affinity. Ghost and Dragon draw from the full floor pool. */
export function getSubtypeChallengePool(
  subtype: EnemySubtype | undefined,
  allFloorTypes: ChallengeType[]
): ChallengeType[] {
  switch (subtype) {
    case 'slime': return allFloorTypes.includes('noteReading') ? ['noteReading'] : allFloorTypes;
    case 'skeleton': return allFloorTypes.includes('rhythmTap') ? ['rhythmTap'] : allFloorTypes;
    case 'goblin': return allFloorTypes.includes('interval') ? ['interval'] : allFloorTypes;
    case 'bat': return allFloorTypes.includes('dynamics') ? ['dynamics'] : allFloorTypes;
    case 'wraith': return allFloorTypes.includes('tempo') ? ['tempo'] : allFloorTypes;
    case 'spider': return allFloorTypes.includes('symbols') ? ['symbols'] : allFloorTypes;
    case 'shade': return allFloorTypes.includes('terms') ? ['terms'] : allFloorTypes;
    case 'ghost': return allFloorTypes; // Wildcard — any type on the floor
    case 'dragon': return allFloorTypes;
    default: return allFloorTypes;
  }
}

/** Returns enemy subtypes that can patrol on a given floor based on unlocked challenge types. */
export function getEnemySubtypesForFloor(floorNumber: number): EnemySubtype[] {
  const types = getChallengeTypesForFloor(floorNumber);
  const subtypes: EnemySubtype[] = ['ghost']; // Ghost always available

  if (types.includes('noteReading')) subtypes.push('slime');
  if (types.includes('dynamics')) subtypes.push('bat');
  if (types.includes('tempo')) subtypes.push('wraith');
  if (types.includes('symbols')) subtypes.push('spider');
  if (types.includes('rhythmTap')) subtypes.push('skeleton');
  if (types.includes('terms')) subtypes.push('shade');
  if (types.includes('interval')) subtypes.push('goblin');

  return subtypes;
}
```

**Step 2: Verify build — remaining errors only in downstream consumers**

Run: `cd client && npx tsc --noEmit 2>&1 | head -40`
Expected: Errors in ChallengeModal.tsx, MelodyDungeonGame.tsx (still using old APIs). No errors in this file.

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/challengeHelpers.ts
git commit -m "feat(melody-dungeon): update challenge helpers with tier system and new enemy affinities"
```

---

### Task 5: Create VocabularyChallenge Component

**Files:**
- Create: `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx`

**Step 1: Create the component**

```typescript
import React, { useState, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { type VocabCategory, type VocabEntry, getVocabEntries } from '../logic/vocabData';

interface Props {
  category: VocabCategory;
  tier: Tier;
  onResult: (correct: boolean) => void;
}

const CATEGORY_THEME: Record<VocabCategory, { title: string; color: string; hoverColor: string; activeColor: string }> = {
  dynamics: { title: 'Dynamics Quiz!', color: 'bg-rose-700', hoverColor: 'hover:bg-rose-600', activeColor: 'text-rose-200' },
  tempo: { title: 'Tempo Quiz!', color: 'bg-teal-700', hoverColor: 'hover:bg-teal-600', activeColor: 'text-teal-200' },
  symbols: { title: 'Symbol Quiz!', color: 'bg-indigo-700', hoverColor: 'hover:bg-indigo-600', activeColor: 'text-indigo-200' },
  terms: { title: 'Music Terms!', color: 'bg-amber-700', hoverColor: 'hover:bg-amber-600', activeColor: 'text-amber-200' },
};

function pickDistractors(correct: VocabEntry, pool: VocabEntry[], count: number): VocabEntry[] {
  const others = pool.filter((e) => e.term !== correct.term);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const VocabularyChallenge: React.FC<Props> = ({ category, tier, onResult }) => {
  const entries = useMemo(() => getVocabEntries(category, tier), [category, tier]);
  const theme = CATEGORY_THEME[category];

  const challenge = useMemo(() => {
    const target = entries[Math.floor(Math.random() * entries.length)];
    const showTermAskDef = Math.random() < 0.5;
    const distractors = pickDistractors(target, entries, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    return { target, showTermAskDef, options };
  }, [entries]);

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.target.term;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const questionText = challenge.showTermAskDef
    ? (challenge.target.symbol
        ? `What does "${challenge.target.symbol}" (${challenge.target.term}) mean?`
        : `What does "${challenge.target.term}" mean?`)
    : `Which term means "${challenge.target.definition}"?`;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      <p className="text-gray-200 text-center text-sm px-2">{questionText}</p>

      <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.target.term;
          const label = challenge.showTermAskDef ? opt.definition : (opt.symbol ? `${opt.symbol} (${opt.term})` : opt.term);

          return (
            <button
              key={opt.term}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm text-left transition-all
                ${feedback && isCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
                disabled:cursor-default
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was: ${challenge.target.term} — ${challenge.target.definition}`}
        </p>
      )}
    </div>
  );
};

export default VocabularyChallenge;
```

**Step 2: Verify build compiles (component in isolation)**

Run: `cd client && npx tsc --noEmit 2>&1 | grep VocabularyChallenge`
Expected: No errors in this file

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx
git commit -m "feat(melody-dungeon): add unified VocabularyChallenge component"
```

---

### Task 6: Update Existing Challenge Components to Use Tier

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/NoteReadingChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx`

**Step 1: Update NoteReadingChallenge**

NoteReadingChallenge currently uses `floorNumber` and calls `getNoteReadingParamsForFloor`. Change it to accept `tier` and call the new `getNoteReadingParams(tier)`.

In `NoteReadingChallenge.tsx`:
- Line 2: Change import from `getNoteReadingParamsForFloor` to `getNoteReadingParams`
- Lines 5-8: Change Props interface — replace `floorNumber: number` with `tier: Tier` (add `Tier` import from `../logic/dungeonTypes`)
- Line 65: Change component signature to `({ tier, onResult })`
- Line 66: Change `getNoteReadingParamsForFloor(floorNumber)` to `getNoteReadingParams(tier)` and update dependency array

Updated lines:
```typescript
// Line 1-3
import React, { useState, useEffect, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getNoteReadingParams } from '../logic/difficultyAdapter';
import { playNote, noteKeyToName } from '../dungeonAudio';

// Lines 5-8
interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
}

// Line 65
const NoteReadingChallenge: React.FC<Props> = ({ tier, onResult }) => {
// Line 66
  const params = useMemo(() => getNoteReadingParams(tier), [tier]);
```

**Step 2: Update RhythmTapChallenge**

In `RhythmTapChallenge.tsx`:
- Line 2: Change `DifficultyLevel` import to `Tier` import
- Line 3: `getRhythmParams` stays the same (it now accepts Tier)
- Lines 6-10: Change `difficulty: DifficultyLevel` to `tier: Tier`
- Line 34: Change `({ difficulty, onResult, slowMode })` to `({ tier, onResult, slowMode })`
- Line 36: Change `getRhythmParams(difficulty)` to `getRhythmParams(tier)`
- Line 38: Change `[difficulty, slowMode]` to `[tier, slowMode]`

Updated lines:
```typescript
// Line 2
import type { Tier } from '../logic/dungeonTypes';

// Lines 6-10
interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
}

// Line 34
const RhythmTapChallenge: React.FC<Props> = ({ tier, onResult, slowMode }) => {
// Lines 35-38
  const params = useMemo(() => {
    const p = getRhythmParams(tier);
    return slowMode ? { ...p, bpm: Math.round(p.bpm / 2) } : p;
  }, [tier, slowMode]);
```

**Step 3: Update IntervalChallenge**

In `IntervalChallenge.tsx`:
- Line 2: Change `DifficultyLevel` import to `Tier` import
- Lines 6-10: Change `difficulty: DifficultyLevel` to `tier: Tier`
- Line 12: Change `({ difficulty, onResult, showHint })` to `({ tier, onResult, showHint })`
- Line 13: Change `getIntervalParams(difficulty)` to `getIntervalParams(tier)` and update dependency

Updated lines:
```typescript
// Line 2
import type { Tier } from '../logic/dungeonTypes';

// Lines 6-10
interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}

// Line 12
const IntervalChallenge: React.FC<Props> = ({ tier, onResult, showHint }) => {
// Line 13
  const params = useMemo(() => getIntervalParams(tier), [tier]);
```

**Step 4: Verify build — expect errors only in ChallengeModal and MelodyDungeonGame**

Run: `cd client && npx tsc --noEmit 2>&1 | head -40`
Expected: Errors in ChallengeModal.tsx (still passes `difficulty` to these components). No errors in the challenge files themselves.

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/NoteReadingChallenge.tsx client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx
git commit -m "feat(melody-dungeon): update challenge components to use tier instead of difficulty"
```

---

### Task 7: Update ChallengeModal

**Files:**
- Modify: `client/src/games/melody-dungeon/ChallengeModal.tsx`

**Step 1: Replace the entire file**

The new ChallengeModal removes all `DifficultyLevel` references, imports VocabularyChallenge, routes to the new vocab types, and uses tier-based challenge rendering.

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import { TileType } from './logic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import VocabularyChallenge from './challenges/VocabularyChallenge';
import type { VocabCategory } from './logic/vocabData';
import { getChallengeTypesForFloor, getTierForChallenge, pickRandom, generateBigBossSequence, getSubtypeChallengePool } from './challengeHelpers';

export interface BossBattleMeta {
  damageDealt: number;
  shieldUsed: boolean;
  potionsUsed: number;
}

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  maxHealth?: number;
  shieldCharm?: number;
  potions?: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}

const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

const VOCAB_CATEGORIES: Record<string, VocabCategory> = {
  dynamics: 'dynamics',
  tempo: 'tempo',
  symbols: 'symbols',
  terms: 'terms',
};

function getBossHp(tileType: TileType, enemyLevel?: number): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  return enemyLevel ?? 1;
}

function getBossLabel(tileType: TileType, enemySubtype?: EnemySubtype): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  switch (enemySubtype) {
    case 'ghost': return 'Ghost';
    case 'skeleton': return 'Skeleton';
    case 'dragon': return 'Dragon';
    case 'goblin': return 'Goblin';
    case 'slime': return 'Slime';
    case 'bat': return 'Bat';
    case 'wraith': return 'Wraith';
    case 'spider': return 'Spider';
    case 'shade': return 'Shade';
    default: return 'Enemy';
  }
}

const TILE_THEME: Record<string, { title: string; borderColor: string; bgColor: string }> = {
  [TileType.Enemy]: {
    title: 'Enemy Encounter!',
    borderColor: 'border-red-500',
    bgColor: 'from-red-950/90 to-gray-900/95',
  },
  [TileType.Door]: {
    title: 'Locked Door!',
    borderColor: 'border-amber-500',
    bgColor: 'from-amber-950/90 to-gray-900/95',
  },
  [TileType.Treasure]: {
    title: 'Treasure Found!',
    borderColor: 'border-yellow-500',
    bgColor: 'from-yellow-950/90 to-gray-900/95',
  },
  [TileType.MiniBoss]: {
    title: 'Mini Boss!',
    borderColor: 'border-orange-500',
    bgColor: 'from-orange-950/90 to-gray-900/95',
  },
  [TileType.BigBoss]: {
    title: 'BOSS BATTLE!',
    borderColor: 'border-rose-500',
    bgColor: 'from-rose-950/90 to-gray-900/95',
  },
};

const DEFAULT_THEME = {
  title: 'Music Challenge!',
  borderColor: 'border-indigo-500',
  bgColor: 'from-indigo-950/90 to-gray-900/95',
};

function getEnemyTheme(enemySubtype?: EnemySubtype): { title: string; borderColor: string; bgColor: string } {
  switch (enemySubtype) {
    case 'dragon':
      return { title: 'Dragon Battle!', borderColor: 'border-purple-500', bgColor: 'from-purple-950/90 to-gray-900/95' };
    case 'skeleton':
      return { title: 'Skeleton Encounter!', borderColor: 'border-gray-400', bgColor: 'from-gray-950/90 to-gray-900/95' };
    case 'goblin':
      return { title: 'Goblin Encounter!', borderColor: 'border-green-500', bgColor: 'from-green-950/90 to-gray-900/95' };
    case 'slime':
      return { title: 'Slime Encounter!', borderColor: 'border-lime-500', bgColor: 'from-lime-950/90 to-gray-900/95' };
    case 'bat':
      return { title: 'Bat Encounter!', borderColor: 'border-rose-400', bgColor: 'from-rose-950/90 to-gray-900/95' };
    case 'wraith':
      return { title: 'Wraith Encounter!', borderColor: 'border-cyan-400', bgColor: 'from-cyan-950/90 to-gray-900/95' };
    case 'spider':
      return { title: 'Spider Encounter!', borderColor: 'border-indigo-400', bgColor: 'from-indigo-950/90 to-gray-900/95' };
    case 'shade':
      return { title: 'Shade Encounter!', borderColor: 'border-amber-400', bgColor: 'from-amber-950/90 to-gray-900/95' };
    default:
      return TILE_THEME[TileType.Enemy] ?? DEFAULT_THEME;
  }
}

function ChallengeRenderer({ type, tier, floorNumber, onResult, slowRhythm, showIntervalHint }: {
  type: ChallengeType;
  tier: Tier;
  floorNumber: number;
  onResult: (correct: boolean) => void;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
}) {
  const vocabCategory = VOCAB_CATEGORIES[type];
  if (vocabCategory) {
    return <VocabularyChallenge category={vocabCategory} tier={tier} onResult={onResult} />;
  }

  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge tier={tier} onResult={onResult} />;
    case 'rhythmTap':
      return <RhythmTapChallenge tier={tier} onResult={onResult} slowMode={slowRhythm} />;
    case 'interval':
      return <IntervalChallenge tier={tier} onResult={onResult} showHint={showIntervalHint} />;
    default:
      return <NoteReadingChallenge tier={tier} onResult={onResult} />;
  }
}

const BossBattle: React.FC<{
  tileType: TileType;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  maxHealth: number;
  shieldCharm: number;
  potions: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}> = ({ tileType, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel }) => {
  const maxBossHp = useMemo(
    () => Math.max(1, getBossHp(tileType, enemyLevel) - (dragonBane ? 1 : 0)),
    [tileType, enemyLevel, dragonBane]
  );
  const bossLabel = useMemo(() => getBossLabel(tileType, enemySubtype), [tileType, enemySubtype]);

  const floorChallengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);
  const challengeTypes = useMemo(
    () => tileType === TileType.Enemy
      ? getSubtypeChallengePool(enemySubtype, floorChallengeTypes)
      : floorChallengeTypes,
    [tileType, enemySubtype, floorChallengeTypes]
  );

  const bigBossSequence = useMemo(
    () => tileType === TileType.BigBoss ? generateBigBossSequence(floorNumber) : null,
    [tileType, floorNumber]
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [bossHp, setBossHp] = useState(() =>
    Math.max(1, getBossHp(tileType, enemyLevel) - (dragonBane ? 1 : 0))
  );
  const [effectiveHealth, setEffectiveHealth] = useState(playerHealth);
  const [shieldActive, setShieldActive] = useState(shieldCharm > 0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [potionsRemaining, setPotionsRemaining] = useState(potions);
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [roundTransition, setRoundTransition] = useState(false);
  const [showItemPhase, setShowItemPhase] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [showPrefight, setShowPrefight] = useState(
    playerHealth < maxHealth && potions > 0
  );

  const currentChallenge = useMemo(() => {
    if (bigBossSequence) {
      return bigBossSequence[currentRound % bigBossSequence.length];
    }
    const type = pickRandom(challengeTypes);
    return { type, tier: getTierForChallenge(floorNumber, type) };
  }, [bigBossSequence, challengeTypes, floorNumber, currentRound]);

  const handleUsePotion = useCallback(() => {
    if (potionsRemaining > 0 && effectiveHealth < maxHealth) {
      setPotionsRemaining((p) => p - 1);
      setPotionsUsed((p) => p + 1);
      setEffectiveHealth((h) => Math.min(h + 1, maxHealth));
    }
  }, [potionsRemaining, effectiveHealth, maxHealth]);

  const proceedToNextRound = useCallback(() => {
    setCurrentRound((r) => r + 1);
    setLastResult(null);
    setShowItemPhase(false);
    setRoundTransition(false);
  }, []);

  const handleRoundResult = useCallback((correct: boolean) => {
    setLastResult(correct);

    if (correct) {
      const newBossHp = bossHp - 1;
      setBossHp(newBossHp);
      if (newBossHp <= 0) {
        setRoundTransition(true);
        setTimeout(() => onResult(true, { damageDealt, shieldUsed, potionsUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    } else {
      let newHealth = effectiveHealth;
      let newShieldUsed = shieldUsed;
      if (shieldActive) {
        setShieldActive(false);
        newShieldUsed = true;
        setShieldUsed(true);
      } else {
        newHealth = effectiveHealth - 1;
        setEffectiveHealth(newHealth);
        setDamageDealt((d) => d + 1);
      }

      if (newHealth <= 0) {
        setRoundTransition(true);
        setTimeout(() => onResult(false, { damageDealt: damageDealt + 1, shieldUsed: newShieldUsed, potionsUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    }
  }, [bossHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, potionsUsed, onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[200px] space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{bossLabel} HP</span>
            <span>{bossHp}/{maxBossHp}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Your HP{shieldActive ? ' (shielded)' : ''}</span>
            <span>{effectiveHealth}/{maxHealth}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${(effectiveHealth / maxHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {showPrefight ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-lg font-bold text-amber-400">Prepare for Battle!</p>
          <p className="text-sm text-gray-400">You can use potions before the fight begins.</p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < maxHealth && (
              <button
                onClick={handleUsePotion}
                className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors"
              >
                Use Potion ({potionsRemaining})
              </button>
            )}
            <button
              onClick={() => setShowPrefight(false)}
              className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              {effectiveHealth < maxHealth && potionsRemaining > 0 ? 'Fight!' : 'Begin!'}
            </button>
          </div>
        </div>
      ) : showItemPhase ? (
        <div className="py-6 text-center space-y-3">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < maxHealth && (
              <button
                onClick={handleUsePotion}
                className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors"
              >
                Use Potion ({potionsRemaining})
              </button>
            )}
            <button
              onClick={proceedToNextRound}
              className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : !roundTransition ? (
        <ChallengeRenderer
          key={currentRound}
          type={currentChallenge.type}
          tier={currentChallenge.tier}
          floorNumber={floorNumber}
          onResult={handleRoundResult}
          slowRhythm={slowRhythm}
          showIntervalHint={showIntervalHint}
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Preparing...</p>
        </div>
      )}
    </div>
  );
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel = 1 }) => {
  const theme = tileType === TileType.Enemy
    ? getEnemyTheme(enemySubtype)
    : (TILE_THEME[tileType] || DEFAULT_THEME);
  const isMultiRound =
    (tileType === TileType.Enemy && enemyLevel > 1) ||
    tileType === TileType.MiniBoss ||
    tileType === TileType.BigBoss;

  const tier = getTierForChallenge(floorNumber, challengeType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-md rounded-2xl border-2 ${theme.borderColor}
          bg-gradient-to-b ${theme.bgColor} p-5 shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        <h2 className="text-center text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          {theme.title}
        </h2>

        {isMultiRound ? (
          <BossBattle
            tileType={tileType}
            floorNumber={floorNumber}
            onResult={onResult}
            playerHealth={playerHealth}
            maxHealth={maxHealth}
            shieldCharm={shieldCharm}
            potions={potions}
            dragonBane={dragonBane}
            slowRhythm={slowRhythm}
            showIntervalHint={showIntervalHint}
            enemySubtype={enemySubtype}
            enemyLevel={enemyLevel}
          />
        ) : (
          <ChallengeRenderer type={challengeType} tier={tier} floorNumber={floorNumber} onResult={onResult} slowRhythm={slowRhythm} showIntervalHint={showIntervalHint} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
```

**Step 2: Verify build — expect errors only in MelodyDungeonGame (passes `difficulty` prop)**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: Error about `difficulty` prop no longer accepted in ChallengeModal

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/ChallengeModal.tsx
git commit -m "feat(melody-dungeon): update ChallengeModal with tier system and vocabulary routing"
```

---

### Task 8: Update Dungeon Generator

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts`

**Step 1: Update imports**

Replace the import from challengeHelpers (line 12):
```typescript
import { getChallengeTypesForFloor, getSubtypeChallengePool } from '../challengeHelpers';
```
With:
```typescript
import { getChallengeTypesForFloor, getSubtypeChallengePool, getEnemySubtypesForFloor } from '../challengeHelpers';
```

**Step 2: Replace the `getEnemySubtypesForFloor` function**

Delete the local `getEnemySubtypesForFloor` function (lines 41-45) since it's now imported from challengeHelpers. The import from Step 1 provides it.

**Step 3: Verify build compiles**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: Errors only in MelodyDungeonGame.tsx (the last file to update)

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat(melody-dungeon): update dungeon generator to use new enemy subtypes from challengeHelpers"
```

---

### Task 9: Update MelodyDungeonGame (Remove Adaptive Difficulty)

**Files:**
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Remove adaptive difficulty imports**

Remove from line 24-28:
```typescript
import {
  createDifficultyState,
  recordResult,
  type DifficultyState,
} from './logic/difficultyAdapter';
```

Also remove `DifficultyLevel` from the type imports (line 18).

**Step 2: Remove adaptive difficulty state**

Delete line 115: `const [diffState, setDiffState] = useState<DifficultyState>(createDifficultyState);`
Delete line 143: `const difficulty: DifficultyLevel = diffState.level;`

**Step 3: Remove adaptive difficulty update in handleChallengeResult**

Delete lines 422-423:
```typescript
const newDiffState = recordResult(diffState, correct);
setDiffState(newDiffState);
```

**Step 4: Remove `difficulty` prop from ChallengeModal render**

In the `<ChallengeModal>` JSX (around line 1030-1046), remove the `difficulty={difficulty}` prop.

**Step 5: Remove `difficulty` prop from HUD render**

Find where `<HUD>` is rendered and remove the `difficulty={difficulty}` prop.

**Step 6: Verify build compiles**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: May have errors in HUD.tsx (still expects difficulty prop). Fix in next task.

**Step 7: Commit**

```bash
git add client/src/games/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat(melody-dungeon): remove adaptive difficulty from main game component"
```

---

### Task 10: Update HUD (Remove Difficulty Display)

**Files:**
- Modify: `client/src/games/melody-dungeon/HUD.tsx`

**Step 1: Remove difficulty from props and display**

Remove:
- `DifficultyLevel` import (line 2)
- `difficulty: DifficultyLevel` from `HUDProps` interface (line 7)
- `difficulty` from component destructuring (line 12)
- The `difficultyColors` object (lines 17-21)
- The difficulty display `<span>` (line 110-112)

Updated HUDProps:
```typescript
interface HUDProps {
  player: PlayerState;
  floorNumber: number;
  themeName?: string;
  onOpenBag?: () => void;
}
```

Updated component signature:
```typescript
const HUD: React.FC<HUDProps> = ({ player, floorNumber, themeName, onOpenBag }) => {
```

Remove the difficulty span from the render (lines 110-112).

**Step 2: Verify clean build**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors (or only errors in test files / DirectionsModal)

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/HUD.tsx
git commit -m "feat(melody-dungeon): remove difficulty display from HUD"
```

---

### Task 11: Delete DynamicsChallenge and Clean Up

**Files:**
- Delete: `client/src/games/melody-dungeon/challenges/DynamicsChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts` — remove deprecated DifficultyLevel type

**Step 1: Delete DynamicsChallenge.tsx**

```bash
rm client/src/games/melody-dungeon/challenges/DynamicsChallenge.tsx
```

**Step 2: Remove DifficultyLevel from dungeonTypes.ts**

Remove:
```typescript
/** @deprecated Replaced by Tier. Kept temporarily for migration. */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
```

Also remove `difficulty: DifficultyLevel` from the `GameState` interface if still present.

**Step 3: Search for any remaining references to DifficultyLevel or old adaptive functions**

Run: `cd client && grep -rn "DifficultyLevel\|createDifficultyState\|recordResult\|getAccuracy\|getDynamicsParams\|getNoteReadingParamsForFloor" src/games/melody-dungeon/ --include="*.ts" --include="*.tsx"`
Expected: No results. If any remain, fix them.

**Step 4: Verify clean build**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: Clean build, no errors

**Step 5: Commit**

```bash
git add -A client/src/games/melody-dungeon/
git commit -m "chore(melody-dungeon): delete DynamicsChallenge and remove deprecated DifficultyLevel"
```

---

### Task 12: Update DirectionsModal

**Files:**
- Modify: `client/src/games/melody-dungeon/DirectionsModal.tsx`

**Step 1: Update the enemy types section**

Update the enemy types documentation (around lines 115-125) to include all new enemy types and their challenge affinities:
- Slime — Note Reading
- Bat — Dynamics
- Wraith — Tempo
- Spider — Symbols
- Skeleton — Rhythm
- Shade — Terms
- Goblin — Intervals
- Ghost — Random (wildcard)
- Dragon — All types

**Step 2: Update challenge types section**

Add documentation for the 4 new vocabulary challenge types and explain the tier progression system.

**Step 3: Verify build compiles**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/DirectionsModal.tsx
git commit -m "docs(melody-dungeon): update directions modal with new challenge types and enemies"
```

---

### Task 13: Smoke Test and Final Verification

**Step 1: Run full type check**

Run: `cd client && npx tsc --noEmit`
Expected: Clean build, no errors

**Step 2: Run dev server**

Run: `cd client && npm run dev`
Expected: Dev server starts without errors

**Step 3: Run any existing tests**

Run: `cd client && npx vitest run src/games/melody-dungeon/ 2>&1 | tail -20`
Expected: All tests pass (update any tests that reference old difficulty system)

**Step 4: Manual testing checklist**

- [ ] Floor 1: Note Reading and Dynamics questions appear
- [ ] Floor 6: Tempo vocabulary questions begin appearing
- [ ] Floor 11: Musical Symbols vocabulary questions begin appearing
- [ ] Floor 16: Rhythm Tap challenges begin appearing
- [ ] Floor 21: General Music Terms begin appearing
- [ ] Floor 26: Interval challenges begin appearing
- [ ] Vocab questions show both directions (term→def and def→term)
- [ ] New enemy subtypes appear in dungeon (slime, bat, wraith, spider, shade)
- [ ] Ghosts give random challenge types
- [ ] Boss battles work with new challenge pool
- [ ] HUD no longer shows difficulty level
- [ ] Directions modal shows updated content

**Step 5: Final commit if any test fixes were needed**

```bash
git add -A
git commit -m "test(melody-dungeon): fix tests for new tier-based challenge system"
```
