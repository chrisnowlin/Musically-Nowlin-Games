/**
 * Pitch Utilities for Sight Reading Randomizer
 * Functions for pitch manipulation, conversion, and frequency calculations
 */

import type { PitchRange } from './types';

// ============================================
// NOTE FREQUENCIES (A4 = 440Hz)
// ============================================

export const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78,
  'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83,
  'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,

  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65,
  'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,

  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30,
  'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,

  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61,
  'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,

  'C6': 1046.50, 'C#6': 1108.73, 'Db6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'Eb6': 1244.51,
  'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'Gb6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22,
  'Ab6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'Bb6': 1864.66, 'B6': 1975.53
};

// ============================================
// CHROMATIC SCALE ORDERING
// ============================================

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// PITCH CONVERSION FUNCTIONS
// ============================================

/**
 * Convert scientific pitch notation to VexFlow format
 * @param pitch - Scientific notation (e.g., 'C4', 'D#4', 'Eb5')
 * @returns VexFlow format (e.g., 'c/4', 'd#/4', 'eb/5')
 */
export function pitchToVexFlow(pitch: string): string {
  // Match note name (with optional accidental) and octave
  const match = pitch.match(/^([A-G][#b]?)(\d)$/);

  if (!match) {
    throw new Error(`Invalid pitch format: ${pitch}`);
  }

  const [, note, octave] = match;

  // Convert to lowercase and format as note/octave
  return `${note.toLowerCase()}/${octave}`;
}

/**
 * Convert pitch to frequency in Hz
 * @param pitch - Scientific notation (e.g., 'C4', 'A4')
 * @returns Frequency in Hz
 */
export function pitchToFrequency(pitch: string): number {
  const frequency = NOTE_FREQUENCIES[pitch];

  if (frequency === undefined) {
    throw new Error(`Unknown pitch: ${pitch}`);
  }

  return frequency;
}

/**
 * Get all chromatic pitches within a range (inclusive)
 * @param lowest - Lowest pitch in range
 * @param highest - Highest pitch in range
 * @returns Array of all chromatic pitches in range
 */
export function getAllPitchesInRange(lowest: string, highest: string): string[] {
  const lowestIndex = getPitchIndex(lowest);
  const highestIndex = getPitchIndex(highest);

  if (lowestIndex === -1 || highestIndex === -1) {
    throw new Error(`Invalid pitch range: ${lowest} to ${highest}`);
  }

  if (lowestIndex > highestIndex) {
    throw new Error(`Invalid range: ${lowest} is higher than ${highest}`);
  }

  const allPitches = Object.keys(NOTE_FREQUENCIES);
  const result: string[] = [];

  for (const pitch of allPitches) {
    const pitchIndex = getPitchIndex(pitch);
    if (pitchIndex >= lowestIndex && pitchIndex <= highestIndex) {
      // Only include sharps, not flats (to avoid duplicates)
      if (!pitch.includes('b')) {
        result.push(pitch);
      }
    }
  }

  // Sort by pitch index
  return result.sort((a, b) => getPitchIndex(a) - getPitchIndex(b));
}

/**
 * Get diatonic pitches (scale notes only) within a range
 * Note: This is a placeholder - use getDiatonicPitchesInRange from keySignatureUtils.ts
 * @param key - Key signature
 * @param range - Pitch range
 * @returns Array of diatonic pitches
 */
export function getDiatonicPitches(key: string, range: PitchRange): string[] {
  // Import getDiatonicPitchesInRange from keySignatureUtils.ts for full implementation
  return getAllPitchesInRange(range.lowest, range.highest);
}

/**
 * Calculate interval between two pitches in semitones
 * @param from - Starting pitch
 * @param to - Ending pitch
 * @returns Interval in semitones (positive = up, negative = down)
 */
export function getInterval(from: string, to: string): number {
  const fromIndex = getPitchIndex(from);
  const toIndex = getPitchIndex(to);

  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`Invalid pitches: ${from} to ${to}`);
  }

  return toIndex - fromIndex;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse pitch into note name and octave
 * @param pitch - Scientific notation pitch
 * @returns Object with note and octave
 */
function parsePitch(pitch: string): { note: string; octave: number } {
  const match = pitch.match(/^([A-G][#b]?)(\d)$/);

  if (!match) {
    throw new Error(`Invalid pitch format: ${pitch}`);
  }

  return {
    note: match[1],
    octave: parseInt(match[2], 10)
  };
}

/**
 * Get chromatic index for a pitch (for comparison)
 * @param pitch - Scientific notation pitch
 * @returns Index in chromatic scale (0 = C0)
 */
function getPitchIndex(pitch: string): number {
  const { note, octave } = parsePitch(pitch);

  // Normalize enharmonic spellings
  let normalizedNote = note;
  const enharmonicMap: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };

  if (enharmonicMap[note]) {
    normalizedNote = enharmonicMap[note];
  }

  const noteIndex = CHROMATIC_NOTES.indexOf(normalizedNote);

  if (noteIndex === -1) {
    return -1;
  }

  return octave * 12 + noteIndex;
}

/**
 * Get pitch from chromatic index
 * @param index - Chromatic index
 * @returns Scientific notation pitch
 */
export function pitchFromIndex(index: number): string {
  const octave = Math.floor(index / 12);
  const noteIndex = index % 12;
  const note = CHROMATIC_NOTES[noteIndex];

  return `${note}${octave}`;
}
