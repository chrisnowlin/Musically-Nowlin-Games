import type { DifficultyLevel } from './dungeonTypes';

const HISTORY_SIZE = 10;

export interface DifficultyState {
  history: boolean[];
  level: DifficultyLevel;
}

export function createDifficultyState(): DifficultyState {
  return { history: [], level: 'easy' };
}

export function recordResult(state: DifficultyState, correct: boolean): DifficultyState {
  const history = [...state.history, correct].slice(-HISTORY_SIZE);
  const accuracy = history.length > 0
    ? history.filter(Boolean).length / history.length
    : 0;

  let level: DifficultyLevel;
  if (accuracy >= 0.75) {
    level = 'hard';
  } else if (accuracy >= 0.5) {
    level = 'medium';
  } else {
    level = 'easy';
  }

  return { history, level };
}

export function getAccuracy(state: DifficultyState): number {
  if (state.history.length === 0) return 0;
  return state.history.filter(Boolean).length / state.history.length;
}

/** Note-reading difficulty by staff position (treble clef) */
export type NoteReadingMode = 'space' | 'line' | 'both' | 'ledger';

/** Space notes only: F4, A4, C5, E5 */
const SPACE_NOTES = ['F4', 'A4', 'C5', 'E5'];
/** Line notes only: E4, G4, B4, D5, F5 */
const LINE_NOTES = ['E4', 'G4', 'B4', 'D5', 'F5'];
/** Both space and line notes within the staff */
const BOTH_STAFF_NOTES = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
/** Ledger-line notes outside the staff: C4, D4, G5, A5 */
const LEDGER_NOTES = ['C4', 'D4', 'G5', 'A5'];

export interface NoteReadingParams {
  notes: string[];
  useBassClef: boolean;
  mode: NoteReadingMode;
}

/** Get note-reading params from floor number (1–100). Mode advances every 25 floors. */
export function getNoteReadingParamsForFloor(floorNumber: number): NoteReadingParams {
  let mode: NoteReadingMode;
  if (floorNumber <= 25) mode = 'space';
  else if (floorNumber <= 50) mode = 'line';
  else if (floorNumber <= 75) mode = 'both';
  else mode = 'ledger';

  const notes = mode === 'space' ? SPACE_NOTES
    : mode === 'line' ? LINE_NOTES
    : mode === 'both' ? BOTH_STAFF_NOTES
    : LEDGER_NOTES;

  return {
    notes: [...notes],
    useBassClef: false,
    mode,
  };
}

/** @deprecated Use getNoteReadingParamsForFloor for floor-based progression. */
export function getNoteReadingParams(level: DifficultyLevel): NoteReadingParams {
  const mode: NoteReadingMode = level === 'easy' ? 'space' : level === 'medium' ? 'line' : 'both';
  const notes = mode === 'space' ? SPACE_NOTES : mode === 'line' ? LINE_NOTES : BOTH_STAFF_NOTES;
  return {
    notes: [...notes],
    useBassClef: false,
    mode,
  };
}

export interface RhythmParams {
  patternLength: number;
  subdivisions: ('quarter' | 'eighth' | 'half' | 'sixteenth')[];
  bpm: number;
  toleranceMs: number;
}

export function getRhythmParams(level: DifficultyLevel): RhythmParams {
  switch (level) {
    case 'easy':
      return {
        patternLength: 4,
        subdivisions: ['quarter', 'half'],
        bpm: 80,
        toleranceMs: 300,
      };
    case 'medium':
      return {
        patternLength: 4,
        subdivisions: ['quarter', 'half', 'eighth'],
        bpm: 100,
        toleranceMs: 200,
      };
    case 'hard':
      return {
        patternLength: 6,
        subdivisions: ['quarter', 'eighth', 'sixteenth'],
        bpm: 120,
        toleranceMs: 150,
      };
  }
}

export interface IntervalParams {
  intervals: { name: string; semitones: number }[];
}

export function getIntervalParams(level: DifficultyLevel): IntervalParams {
  switch (level) {
    case 'easy':
      return {
        intervals: [
          { name: 'Unison', semitones: 0 },
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
        ],
      };
    case 'medium':
      return {
        intervals: [
          { name: '2nd', semitones: 2 },
          { name: '3rd', semitones: 4 },
          { name: '4th', semitones: 5 },
          { name: '5th', semitones: 7 },
        ],
      };
    case 'hard':
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

export interface DynamicsParams {
  levels: string[];
  includeChanges: boolean;
}

export function getDynamicsParams(level: DifficultyLevel): DynamicsParams {
  switch (level) {
    case 'easy':
      return { levels: ['piano', 'forte'], includeChanges: false };
    case 'medium':
      return { levels: ['piano', 'mezzo-piano', 'mezzo-forte', 'forte'], includeChanges: false };
    case 'hard':
      return {
        levels: ['pianissimo', 'piano', 'mezzo-piano', 'mezzo-forte', 'forte', 'fortissimo'],
        includeChanges: true,
      };
  }
}
