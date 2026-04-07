/**
 * Types for Rhythm Randomizer Tool
 * A standalone rhythm generation tool for music educators
 */

// ============================================
// NOTE VALUE TYPES
// ============================================

export type NoteValue =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth'
  | 'tripletQuarter'
  | 'tripletEighth'
  // Beamed note groups
  | 'twoEighths'              // Two beamed eighth notes (1 beat total)
  | 'fourSixteenths'          // Four beamed sixteenth notes (1 beat total)
  | 'twoSixteenths'           // Two beamed sixteenth notes (0.5 beats total)
  // Mixed eighth + sixteenth beamed groups (1 beat total each)
  | 'eighthTwoSixteenths'     // Eighth + two sixteenths (1 beat)
  | 'twoSixteenthsEighth'     // Two sixteenths + eighth (1 beat)
  | 'sixteenthEighthSixteenth'; // Sixteenth + eighth + sixteenth (1 beat)

export type RestValue =
  | 'wholeRest'
  | 'halfRest'
  | 'quarterRest'
  | 'eighthRest'
  | 'sixteenthRest';

// ============================================
// RHYTHM EVENT TYPES
// ============================================

export interface RhythmEvent {
  type: 'note' | 'rest';
  value: NoteValue | RestValue;
  duration: number; // Duration in beats (quarter = 1, half = 2, etc.)
  isAccented?: boolean;
  isTriplet?: boolean;
  tieToNext?: boolean;
  syllable?: string; // Counting syllable (e.g., "ta", "ti-ti")
  pitch?: string; // e.g., 'C4', 'D#4', 'Eb5'
  vexflowKey?: string; // e.g., 'c/4', 'd#/4', 'eb/5'
  pitchSyllable?: string; // Pitch syllable (e.g., "Do", "Re", "1", "C")
}

export interface Measure {
  events: RhythmEvent[];
  measureNumber: number;
}

export interface RhythmPattern {
  id: string;
  measures: Measure[];
  totalDurationBeats: number;
  settings: RhythmSettings;
  createdAt: number;
}

// ============================================
// ENSEMBLE TYPES
// ============================================

export type EnsembleMode = 'single' | 'callResponse' | 'layered' | 'bodyPercussion';

export type BodyPercussionPart = 'stomp' | 'clap' | 'snap' | 'pat';

export interface EnsemblePart {
  id: string;
  label: string;
  pattern: RhythmPattern;
  bodyPart?: BodyPercussionPart;
  sound?: SoundOption; // Per-part sound selection for layered ensemble
  isMuted: boolean;
  isSoloed: boolean;
}

export interface EnsemblePattern {
  mode: EnsembleMode;
  parts: EnsemblePart[];
  settings: RhythmSettings;
}

// ============================================
// TIME SIGNATURE TYPES
// ============================================

export interface TimeSignature {
  numerator: number; // Beats per measure
  denominator: number; // Beat unit (4 = quarter, 8 = eighth)
  beatsPerMeasure: number;
  subdivision: 'simple' | 'compound';
  beatGrouping?: number[]; // For irregular meters (e.g., [3, 2] for 5/4)
}

export const TIME_SIGNATURES: Record<string, TimeSignature> = {
  '2/4': { numerator: 2, denominator: 4, beatsPerMeasure: 2, subdivision: 'simple' },
  '3/4': { numerator: 3, denominator: 4, beatsPerMeasure: 3, subdivision: 'simple' },
  '4/4': { numerator: 4, denominator: 4, beatsPerMeasure: 4, subdivision: 'simple' },
  '5/4': { numerator: 5, denominator: 4, beatsPerMeasure: 5, subdivision: 'simple', beatGrouping: [3, 2] },
  '6/8': { numerator: 6, denominator: 8, beatsPerMeasure: 2, subdivision: 'compound' },
  '7/8': { numerator: 7, denominator: 8, beatsPerMeasure: 7, subdivision: 'simple', beatGrouping: [2, 2, 3] },
  '9/8': { numerator: 9, denominator: 8, beatsPerMeasure: 3, subdivision: 'compound' },
  '12/8': { numerator: 12, denominator: 8, beatsPerMeasure: 4, subdivision: 'compound' },
};

// ============================================
// SETTINGS TYPES
// ============================================

export type CountingSystem = 'kodaly' | 'takadimi' | 'gordon' | 'numbers' | 'none';

export type SoundOption = 'drums' | 'woodblock' | 'claps' | 'piano' | 'metronome' | 'snare'
  | 'clarinet';

export type DifficultyPreset = 'beginner' | 'intermediate' | 'advanced' | 'custom';

export type NotationMode = 'staff' | 'grid';

export type StaffLineMode = 'single' | 'full';

export type StemDirection = 'up' | 'down';

export type ClefType = 'treble' | 'bass';

export type NoteDensity = 'sparse' | 'medium' | 'dense';

export interface RhythmSettings {
  // Core Parameters
  timeSignature: string;
  tempo: number; // 40-208 BPM
  measureCount: 1 | 2 | 4 | 8 | 12 | 16;

  // Note Value Selection
  allowedNoteValues: NoteValue[];
  allowedRestValues: RestValue[];
  includeTriplets: boolean;

  // Pattern Characteristics
  syncopationProbability: number; // 0-100
  noteDensity: NoteDensity;
  restProbability: number; // 0-100
  accentProbability: number; // 0-100
  tieProbability: number; // 0-100

  // Playback Options
  countInMeasures: 0 | 1 | 2;
  loopEnabled: boolean;
  metronomeEnabled: boolean;
  swingAmount: number; // 0-100
  sound: SoundOption;

  // Display Options
  notationMode: NotationMode;
  staffLineMode: StaffLineMode;
  stemDirection: StemDirection;
  clef: ClefType;
  countingSystem: CountingSystem;
  showSyllables: boolean;

  // Ensemble Options
  ensembleMode: EnsembleMode;
  partCount: 2 | 3 | 4;

  // Advanced Options
  pickupMeasure: boolean;
}

export const DEFAULT_SETTINGS: RhythmSettings = {
  timeSignature: '4/4',
  tempo: 80,
  measureCount: 4,
  allowedNoteValues: ['quarter', 'twoEighths'],
  allowedRestValues: ['quarterRest'],
  includeTriplets: false,
  syncopationProbability: 20,
  noteDensity: 'medium',
  restProbability: 15,
  accentProbability: 0,
  tieProbability: 0,
  countInMeasures: 1,
  loopEnabled: false,
  metronomeEnabled: true,
  swingAmount: 0,
  sound: 'snare',
  notationMode: 'staff',
  staffLineMode: 'single',
  stemDirection: 'up',
  clef: 'treble',
  countingSystem: 'takadimi',
  showSyllables: true,
  ensembleMode: 'single',
  partCount: 2,
  pickupMeasure: false,
};

// ============================================
// DIFFICULTY PRESETS
// ============================================

export const DIFFICULTY_PRESETS: Record<DifficultyPreset, Partial<RhythmSettings>> = {
  beginner: {
    timeSignature: '4/4',
    measureCount: 2,
    allowedNoteValues: ['quarter', 'half'],
    allowedRestValues: ['quarterRest'],
    includeTriplets: false,
    syncopationProbability: 0,
    noteDensity: 'sparse',
    restProbability: 10,
    swingAmount: 0,
  },
  intermediate: {
    timeSignature: '4/4',
    measureCount: 4,
    allowedNoteValues: ['quarter', 'half', 'eighth', 'twoEighths'],
    allowedRestValues: ['quarterRest', 'eighthRest'],
    includeTriplets: false,
    syncopationProbability: 25,
    noteDensity: 'medium',
    restProbability: 15,
    swingAmount: 0,
  },
  advanced: {
    timeSignature: '4/4',
    measureCount: 4,
    allowedNoteValues: ['quarter', 'half', 'eighth', 'sixteenth', 'twoEighths', 'fourSixteenths'],
    allowedRestValues: ['quarterRest', 'eighthRest', 'sixteenthRest'],
    includeTriplets: true,
    syncopationProbability: 40,
    noteDensity: 'dense',
    restProbability: 20,
    accentProbability: 30,
    tieProbability: 15,
    swingAmount: 0,
  },
  custom: {},
};

// ============================================
// PLAYBACK STATE
// ============================================

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isMetronomePlaying: boolean; // Standalone metronome (separate from pattern playback)
  currentMeasure: number;
  currentBeat: number;
  currentEventIndex: number;
  currentPartIndex: number; // For ensemble playback: which part is currently playing
  elapsedTime: number;
}

export const INITIAL_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  isPaused: false,
  isMetronomePlaying: false,
  currentMeasure: 0,
  currentBeat: 0,
  currentEventIndex: 0,
  currentPartIndex: -1, // -1 = single mode or no part active
  elapsedTime: 0,
};

// ============================================
// NOTE VALUE DURATIONS (in beats, where quarter = 1)
// ============================================

export const NOTE_DURATIONS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  tripletQuarter: 2 / 3,
  tripletEighth: 1 / 3,
  // Beamed note groups
  twoEighths: 1,       // Two eighth notes = 1 beat
  fourSixteenths: 1,   // Four sixteenth notes = 1 beat
  twoSixteenths: 0.5,  // Two sixteenth notes = 0.5 beats
  // Mixed eighth + sixteenth beamed groups
  eighthTwoSixteenths: 1,       // Eighth + two sixteenths = 1 beat
  twoSixteenthsEighth: 1,       // Two sixteenths + eighth = 1 beat
  sixteenthEighthSixteenth: 1,  // Sixteenth + eighth + sixteenth = 1 beat
};

export const REST_DURATIONS: Record<RestValue, number> = {
  wholeRest: 4,
  halfRest: 2,
  quarterRest: 1,
  eighthRest: 0.5,
  sixteenthRest: 0.25,
};

// ============================================
// WORKSHEET TYPES
// ============================================

export type WorksheetFormat = 'standard' | 'blankCompletion' | 'quiz';

export interface WorksheetSettings {
  format: WorksheetFormat;
  includeAnswerKey: boolean;
  includeSyllables: boolean;
  title: string;
  includeNameField: boolean;
  includeDateField: boolean;
  difficultyVariants: 1 | 2 | 3 | 4 | 6 | 8; // Number of exercises
}

export const DEFAULT_WORKSHEET_SETTINGS: WorksheetSettings = {
  format: 'standard',
  includeAnswerKey: true,
  includeSyllables: true,
  title: 'Rhythm Practice',
  includeNameField: true,
  includeDateField: true,
  difficultyVariants: 1,
};
