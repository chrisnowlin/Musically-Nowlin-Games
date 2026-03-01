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
