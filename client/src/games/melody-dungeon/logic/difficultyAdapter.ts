import type { ChallengeType, Tier } from './dungeonTypes';

// ── Floor Zone System ────────────────────────────────────────
// 9 zones across 100 floors: 5 "pure" tiers + 4 transitions between them.

interface FloorZoneEntry {
  startFloor: number;
  endFloor: number;
  lowTier: Tier;
  highTier: Tier;
}

const FLOOR_ZONES: FloorZoneEntry[] = [
  { startFloor: 1,  endFloor: 12, lowTier: 1, highTier: 1 },  // T1 pure
  { startFloor: 13, endFloor: 18, lowTier: 1, highTier: 2 },  // T1→T2 transition
  { startFloor: 19, endFloor: 35, lowTier: 2, highTier: 2 },  // T2 pure
  { startFloor: 36, endFloor: 42, lowTier: 2, highTier: 3 },  // T2→T3 transition
  { startFloor: 43, endFloor: 68, lowTier: 3, highTier: 3 },  // T3 pure
  { startFloor: 69, endFloor: 75, lowTier: 3, highTier: 4 },  // T3→T4 transition
  { startFloor: 76, endFloor: 88, lowTier: 4, highTier: 4 },  // T4 pure
  { startFloor: 89, endFloor: 94, lowTier: 4, highTier: 5 },  // T4→T5 transition
  { startFloor: 95, endFloor: 100, lowTier: 5, highTier: 5 }, // T5 pure
];

export interface FloorZone {
  lowTier: Tier;
  highTier: Tier;
  /** 0-1 progress through this zone (0 = start, 1 = end) */
  progress: number;
}

/** Returns the zone info for a floor (1-100). Floors above 100 use the T5 pure zone. */
export function getFloorZone(floor: number): FloorZone {
  const clamped = Math.max(1, floor);
  for (const zone of FLOOR_ZONES) {
    if (clamped >= zone.startFloor && clamped <= zone.endFloor) {
      const span = zone.endFloor - zone.startFloor;
      const progress = span === 0 ? 1 : (clamped - zone.startFloor) / span;
      return { lowTier: zone.lowTier, highTier: zone.highTier, progress };
    }
  }
  // Above 100 — T5 pure
  return { lowTier: 5, highTier: 5, progress: 1 };
}

/** Weighted random tier for a floor. In transition zones, progress determines highTier probability. */
export function rollTier(floor: number): Tier {
  const zone = getFloorZone(floor);
  if (zone.lowTier === zone.highTier) return zone.lowTier;
  // In transition zones, progress is the probability of rolling the higher tier
  return Math.random() < zone.progress ? zone.highTier : zone.lowTier;
}

/** Enemy difficulty level 1-5 based on zone. Pure zones use their tier; transitions use uniform random. */
export function getEnemyLevel(floor: number): Tier {
  const zone = getFloorZone(floor);
  if (zone.lowTier === zone.highTier) return zone.lowTier;
  return Math.random() < 0.5 ? zone.lowTier : zone.highTier;
}

// ── Challenge Type Weights ───────────────────────────────────

const ALL_CHALLENGE_TYPES: ChallengeType[] = [
  'noteReading', 'rhythmTap', 'interval', 'dynamics', 'tempo', 'symbols', 'terms', 'timbre',
];

/** Late-bloomer types ramp up in weight over the first 25 floors. */
const LATE_BLOOMER_TYPES: ChallengeType[] = ['interval', 'terms'];

/** Get the frequency weight (0.15-1.0) for a challenge type on a given floor. */
export function getChallengeTypeWeight(type: ChallengeType, floor: number): number {
  if (!LATE_BLOOMER_TYPES.includes(type)) return 1.0;
  if (floor <= 12) return 0.15;
  if (floor <= 24) return 0.5;
  return 1.0;
}

/** Weighted random challenge type selection for a floor. */
export function rollChallengeType(floor: number): ChallengeType {
  const weights = ALL_CHALLENGE_TYPES.map(type => ({
    type,
    weight: getChallengeTypeWeight(type, floor),
  }));
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { type, weight } of weights) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return weights[weights.length - 1].type;
}

/** Returns all 8 challenge types — every type is available from floor 1. */
export function getChallengeTypesForFloor(_floorNumber: number): ChallengeType[] {
  return [...ALL_CHALLENGE_TYPES];
}

// ── Note Reading ──────────────────────────────────────────

export type NoteReadingMode = 'space' | 'both' | 'ledger' | 'bass' | 'mixed';

const SPACE_NOTES = ['F4', 'A4', 'C5', 'E5'];
const BOTH_STAFF_NOTES = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
const LEDGER_NOTES = [...BOTH_STAFF_NOTES, 'C4', 'D4', 'G5', 'A5'];
const BASS_STAFF_NOTES = ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'];
const BASS_LEDGER_NOTES = [...BASS_STAFF_NOTES, 'E2', 'F2', 'B3', 'C4'];

export interface NoteReadingParams {
  notes: string[];
  mode: NoteReadingMode;
}

/** Note reading params based on tier. */
export function getNoteReadingParams(tier: Tier): NoteReadingParams {
  switch (tier) {
    case 1:
      return { notes: [...SPACE_NOTES], mode: 'space' };
    case 2:
      return { notes: [...BOTH_STAFF_NOTES], mode: 'both' };
    case 3:
      return { notes: [...LEDGER_NOTES], mode: 'ledger' };
    case 4:
      return { notes: [...BASS_STAFF_NOTES], mode: 'bass' };
    case 5:
      return { notes: [...new Set([...LEDGER_NOTES, ...BASS_LEDGER_NOTES])], mode: 'mixed' };
  }
}

// ── Rhythm ────────────────────────────────────────────────

export type RhythmSubdivision = 'quarter' | 'eighth' | 'half' | 'sixteenth' | 'quarter-rest' | 'dotted-quarter' | 'triplet';

export interface RhythmParams {
  patternLength: number;
  subdivisions: RhythmSubdivision[];
  bpm: number;
  toleranceMs: number;
}

export function getRhythmParams(tier: Tier): RhythmParams {
  switch (tier) {
    case 1:
      return { patternLength: 4, subdivisions: ['quarter', 'half'], bpm: 72, toleranceMs: 350 };
    case 2:
      return { patternLength: 4, subdivisions: ['quarter', 'half', 'quarter-rest', 'eighth'], bpm: 80, toleranceMs: 300 };
    case 3:
      return { patternLength: 5, subdivisions: ['quarter', 'eighth', 'dotted-quarter', 'sixteenth'], bpm: 95, toleranceMs: 225 };
    case 4:
      return { patternLength: 6, subdivisions: ['quarter', 'eighth', 'sixteenth', 'triplet'], bpm: 110, toleranceMs: 175 };
    case 5:
      return { patternLength: 8, subdivisions: ['quarter', 'eighth', 'sixteenth', 'triplet', 'dotted-quarter'], bpm: 120, toleranceMs: 150 };
  }
}

// ── Interval ──────────────────────────────────────────────

export type IntervalMode = 'highLow' | 'stepSkip' | 'standard';

export interface IntervalParams {
  intervals: { name: string; semitones: number }[];
  mode: IntervalMode;
}

export function getIntervalParams(tier: Tier): IntervalParams {
  switch (tier) {
    case 1:
      return {
        mode: 'highLow',
        intervals: [
          { name: 'Same', semitones: 0 },
          { name: 'Higher', semitones: 2 },
          { name: 'Lower', semitones: -2 },
        ],
      };
    case 2:
      return {
        mode: 'stepSkip',
        intervals: [
          { name: 'Same', semitones: 0 },
          { name: 'Step', semitones: 2 },
          { name: 'Skip', semitones: 4 },
        ],
      };
    case 3:
      return {
        mode: 'standard',
        intervals: [
          { name: 'Unison', semitones: 0 },
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
        ],
      };
    case 4:
      return {
        mode: 'standard',
        intervals: [
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
          { name: '4th', semitones: 5 },
          { name: '5th', semitones: 7 },
        ],
      };
    case 5:
      return {
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

// ── Timbre ───────────────────────────────────────────────

export interface TimbreParams {
  playDuration: number;     // how long the sample plays (seconds)
  allowReplay: boolean;     // whether replay button is shown
}

export function getTimbreParams(tier: Tier): TimbreParams {
  switch (tier) {
    case 1:
      return { playDuration: 2.0, allowReplay: true };
    case 2:
      return { playDuration: 1.5, allowReplay: true };
    case 3:
      return { playDuration: 1.5, allowReplay: true };
    case 4:
      return { playDuration: 1.0, allowReplay: true };
    case 5:
      return { playDuration: 0.8, allowReplay: false };
  }
}
