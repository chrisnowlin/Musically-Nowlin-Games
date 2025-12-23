/**
 * Types for Sight Reading Randomizer
 * Pitch and melodic generation for sight reading exercises
 */

// ============================================
// KEY SIGNATURE TYPES
// ============================================

export type KeySignature =
  // Major keys
  | 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Cb'
  | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb'
  // Minor keys
  | 'Am' | 'Em' | 'Bm' | 'F#m' | 'C#m' | 'G#m' | 'D#m' | 'Abm'
  | 'Dm' | 'Gm' | 'Cm' | 'Fm' | 'Bbm' | 'Ebm';

// ============================================
// MELODIC DIFFICULTY TYPES
// ============================================

export type MelodicDifficulty = 'easy' | 'medium' | 'hard';

// ============================================
// PITCH RANGE TYPES
// ============================================

export interface PitchRange {
  lowest: string;  // e.g., 'C4'
  highest: string; // e.g., 'A5'
}

// Standard clef ranges
export const TREBLE_CLEF_RANGE: PitchRange = {
  lowest: 'C4',
  highest: 'A5'
};

export const BASS_CLEF_RANGE: PitchRange = {
  lowest: 'E2',
  highest: 'C4'
};

// ============================================
// SIGHT READING SETTINGS
// ============================================

export interface SightReadingSettings {
  // Key and pitch settings
  keySignature: KeySignature;
  allowedPitches: string[]; // Array of pitch strings like ['C4', 'D4', 'E4']
  melodicDifficulty: MelodicDifficulty;
  pitchRange: PitchRange;

  // Melodic constraints
  useDiatonicOnly: boolean; // Only use notes from the scale
  allowLeaps: boolean; // Allow intervals larger than a 3rd
  maxInterval: number; // Maximum interval in semitones (e.g., 7 for a 5th)

  // Direction tendencies
  stepwiseBias: number; // 0-100, higher = more stepwise motion
  contourVariety: number; // 0-100, higher = more varied contour
  tonicGravity: number; // 0-100, higher = stronger tendency to return to tonic
}

export const DEFAULT_SIGHT_READING_SETTINGS: SightReadingSettings = {
  keySignature: 'C',
  allowedPitches: [],
  melodicDifficulty: 'easy',
  pitchRange: TREBLE_CLEF_RANGE,
  useDiatonicOnly: true,
  allowLeaps: false,
  maxInterval: 4, // Major 3rd
  stepwiseBias: 80,
  contourVariety: 50,
  tonicGravity: 50, // Moderate tendency toward tonic
};
