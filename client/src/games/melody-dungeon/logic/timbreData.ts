import type { Tier } from './dungeonTypes';
import type { InstrumentFamily } from '@/common/instruments/instrumentLibrary';
import { shuffle } from '../challengeHelpers';

export interface TimbreEntry {
  id: string;           // unique identifier
  displayName: string;  // what the player sees as answer choice
  instrumentName?: string; // key for instrumentLibrary (e.g., 'violin'), undefined for T1
  family?: InstrumentFamily; // for T2 family-level challenges
}

// ── T1: Voice types (conceptual, no real instruments) ─────────────

const T1_POOL: TimbreEntry[] = [
  { id: 't1-singing', displayName: 'Singing Voice' },
  { id: 't1-speaking', displayName: 'Speaking Voice' },
  { id: 't1-high', displayName: 'High Sound' },
  { id: 't1-low', displayName: 'Low Sound' },
];

// ── T2: Instrument families ──────────────────────────────────────
// Each entry represents a family. A random instrument FROM that family is played.

const T2_POOL: TimbreEntry[] = [
  { id: 't2-strings', displayName: 'Strings', family: 'strings' },
  { id: 't2-woodwinds', displayName: 'Woodwinds', family: 'woodwinds' },
  { id: 't2-brass', displayName: 'Brass', family: 'brass' },
  { id: 't2-percussion', displayName: 'Percussion', family: 'percussion' },
];

// ── T3: Specific orchestral instruments (8 instruments) ──────────

const T3_POOL: TimbreEntry[] = [
  { id: 't3-violin', displayName: 'Violin', instrumentName: 'violin', family: 'strings' },
  { id: 't3-cello', displayName: 'Cello', instrumentName: 'cello', family: 'strings' },
  { id: 't3-flute', displayName: 'Flute', instrumentName: 'flute', family: 'woodwinds' },
  { id: 't3-clarinet', displayName: 'Clarinet', instrumentName: 'clarinet', family: 'woodwinds' },
  { id: 't3-trumpet', displayName: 'Trumpet', instrumentName: 'trumpet', family: 'brass' },
  { id: 't3-french-horn', displayName: 'French Horn', instrumentName: 'french-horn', family: 'brass' },
  { id: 't3-oboe', displayName: 'Oboe', instrumentName: 'oboe', family: 'woodwinds' },
  { id: 't3-bassoon', displayName: 'Bassoon', instrumentName: 'bassoon', family: 'woodwinds' },
];

// ── T4: Expanded + world instruments (all 16+ from library) ─────

const T4_POOL: TimbreEntry[] = [
  ...T3_POOL.map(e => ({ ...e, id: e.id.replace('t3-', 't4-') })),
  { id: 't4-viola', displayName: 'Viola', instrumentName: 'viola', family: 'strings' },
  { id: 't4-double-bass', displayName: 'Double Bass', instrumentName: 'double-bass', family: 'strings' },
  { id: 't4-trombone', displayName: 'Trombone', instrumentName: 'trombone', family: 'brass' },
  { id: 't4-tuba', displayName: 'Tuba', instrumentName: 'tuba', family: 'brass' },
  { id: 't4-saxophone', displayName: 'Saxophone', instrumentName: 'saxophone', family: 'woodwinds' },
  { id: 't4-timpani', displayName: 'Timpani', instrumentName: 'timpani', family: 'percussion' },
  { id: 't4-glockenspiel', displayName: 'Glockenspiel', instrumentName: 'glockenspiel', family: 'percussion' },
  { id: 't4-xylophone', displayName: 'Xylophone', instrumentName: 'xylophone', family: 'percussion' },
];

// ── T5: Subtle pairs (same family distinctions) ─────────────────
// Uses the same expanded pool as T4 but getTimbreChoices applies subtle-pair logic.

const T5_POOL: TimbreEntry[] = T4_POOL.map(e => ({ ...e, id: e.id.replace('t4-', 't5-') }));

// ── Families for subtle-pair logic ──────────────────────────────

const FAMILIES: InstrumentFamily[] = ['strings', 'woodwinds', 'brass', 'percussion'];

// ── Public API ──────────────────────────────────────────────────

/** Returns the pool of available choices for the tier. */
export function getTimbrePool(tier: Tier): TimbreEntry[] {
  switch (tier) {
    case 1: return [...T1_POOL];
    case 2: return [...T2_POOL];
    case 3: return [...T3_POOL];
    case 4: return [...T4_POOL];
    case 5: return [...T5_POOL];
  }
}

/** Picks a correct answer and 3 distractors (4 total), shuffled. */
export function getTimbreChoices(tier: Tier): { correct: TimbreEntry; options: TimbreEntry[] } {
  const pool = getTimbrePool(tier);

  if (tier === 5) {
    return buildSubtlePairChoices(pool);
  }

  // Standard: pick a random correct answer, fill 3 distractors from pool
  const shuffledPool = shuffle(pool);
  const correct = shuffledPool[0];
  const distractors = shuffledPool.filter(e => e.id !== correct.id).slice(0, 3);
  const options = shuffle([correct, ...distractors]);

  return { correct, options };
}

/** T5 subtle-pair mode: pick 2 from the same family + 2 from other families. */
function buildSubtlePairChoices(pool: TimbreEntry[]): { correct: TimbreEntry; options: TimbreEntry[] } {
  // Pick a random family that has at least 2 instruments in the pool
  const familiesWithMultiple = FAMILIES.filter(fam =>
    pool.filter(e => e.family === fam).length >= 2
  );

  if (familiesWithMultiple.length === 0) {
    // Fallback to standard selection if no family has 2+ members
    const shuffledPool = shuffle(pool);
    const correct = shuffledPool[0];
    const distractors = shuffledPool.slice(1, 4);
    return { correct, options: shuffle([correct, ...distractors]) };
  }

  const chosenFamily = familiesWithMultiple[Math.floor(Math.random() * familiesWithMultiple.length)];

  // Pick 2 from the chosen family
  const familyMembers = shuffle(pool.filter(e => e.family === chosenFamily));
  const correct = familyMembers[0];
  const sameFamilyDistractor = familyMembers[1];

  // Pick 2 from other families
  const otherFamilyPool = shuffle(pool.filter(e => e.family !== chosenFamily));
  const otherDistractors = otherFamilyPool.slice(0, 2);

  const options = shuffle([correct, sameFamilyDistractor, ...otherDistractors]);

  return { correct, options };
}
