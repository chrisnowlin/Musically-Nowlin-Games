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

export interface NoteReadingParams {
  notes: string[];
  useBassClef: boolean;
  useLedgerLines: boolean;
}

export function getNoteReadingParams(level: DifficultyLevel): NoteReadingParams {
  switch (level) {
    case 'easy':
      return {
        notes: ['C4', 'D4', 'E4', 'F4', 'G4'],
        useBassClef: false,
        useLedgerLines: false,
      };
    case 'medium':
      return {
        notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
        useBassClef: false,
        useLedgerLines: false,
      };
    case 'hard':
      return {
        notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
        useBassClef: false,
        useLedgerLines: true,
      };
  }
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
