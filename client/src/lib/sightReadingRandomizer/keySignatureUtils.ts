/**
 * Key Signature Utilities for Sight Reading Randomizer
 * Functions for working with key signatures, scales, and accidentals
 */

import type { KeySignature, PitchRange } from './types';
import { getAllPitchesInRange } from './pitchUtils';

// ============================================
// KEY SIGNATURE DATA
// ============================================

interface KeySignatureData {
  tonic: string; // Root note
  mode: 'major' | 'minor';
  sharps: string[]; // Notes that are sharp in this key
  flats: string[]; // Notes that are flat in this key
  accidentalCount: number; // Number of sharps (positive) or flats (negative)
  vexflowKey: string; // VexFlow key signature format
}

export const KEY_SIGNATURES: Record<KeySignature, KeySignatureData> = {
  // Major keys
  'C': {
    tonic: 'C',
    mode: 'major',
    sharps: [],
    flats: [],
    accidentalCount: 0,
    vexflowKey: 'C'
  },
  'G': {
    tonic: 'G',
    mode: 'major',
    sharps: ['F'],
    flats: [],
    accidentalCount: 1,
    vexflowKey: 'G'
  },
  'D': {
    tonic: 'D',
    mode: 'major',
    sharps: ['F', 'C'],
    flats: [],
    accidentalCount: 2,
    vexflowKey: 'D'
  },
  'A': {
    tonic: 'A',
    mode: 'major',
    sharps: ['F', 'C', 'G'],
    flats: [],
    accidentalCount: 3,
    vexflowKey: 'A'
  },
  'E': {
    tonic: 'E',
    mode: 'major',
    sharps: ['F', 'C', 'G', 'D'],
    flats: [],
    accidentalCount: 4,
    vexflowKey: 'E'
  },
  'B': {
    tonic: 'B',
    mode: 'major',
    sharps: ['F', 'C', 'G', 'D', 'A'],
    flats: [],
    accidentalCount: 5,
    vexflowKey: 'B'
  },
  'F#': {
    tonic: 'F#',
    mode: 'major',
    sharps: ['F', 'C', 'G', 'D', 'A', 'E'],
    flats: [],
    accidentalCount: 6,
    vexflowKey: 'F#'
  },
  'Cb': {
    tonic: 'Cb',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G', 'C', 'F'],
    accidentalCount: -7,
    vexflowKey: 'Cb'
  },
  'F': {
    tonic: 'F',
    mode: 'major',
    sharps: [],
    flats: ['B'],
    accidentalCount: -1,
    vexflowKey: 'F'
  },
  'Bb': {
    tonic: 'Bb',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E'],
    accidentalCount: -2,
    vexflowKey: 'Bb'
  },
  'Eb': {
    tonic: 'Eb',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E', 'A'],
    accidentalCount: -3,
    vexflowKey: 'Eb'
  },
  'Ab': {
    tonic: 'Ab',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E', 'A', 'D'],
    accidentalCount: -4,
    vexflowKey: 'Ab'
  },
  'Db': {
    tonic: 'Db',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G'],
    accidentalCount: -5,
    vexflowKey: 'Db'
  },
  'Gb': {
    tonic: 'Gb',
    mode: 'major',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G', 'C'],
    accidentalCount: -6,
    vexflowKey: 'Gb'
  },

  // Minor keys (natural minor)
  'Am': {
    tonic: 'A',
    mode: 'minor',
    sharps: [],
    flats: [],
    accidentalCount: 0,
    vexflowKey: 'Am'
  },
  'Em': {
    tonic: 'E',
    mode: 'minor',
    sharps: ['F'],
    flats: [],
    accidentalCount: 1,
    vexflowKey: 'Em'
  },
  'Bm': {
    tonic: 'B',
    mode: 'minor',
    sharps: ['F', 'C'],
    flats: [],
    accidentalCount: 2,
    vexflowKey: 'Bm'
  },
  'F#m': {
    tonic: 'F#',
    mode: 'minor',
    sharps: ['F', 'C', 'G'],
    flats: [],
    accidentalCount: 3,
    vexflowKey: 'F#m'
  },
  'C#m': {
    tonic: 'C#',
    mode: 'minor',
    sharps: ['F', 'C', 'G', 'D'],
    flats: [],
    accidentalCount: 4,
    vexflowKey: 'C#m'
  },
  'G#m': {
    tonic: 'G#',
    mode: 'minor',
    sharps: ['F', 'C', 'G', 'D', 'A'],
    flats: [],
    accidentalCount: 5,
    vexflowKey: 'G#m'
  },
  'D#m': {
    tonic: 'D#',
    mode: 'minor',
    sharps: ['F', 'C', 'G', 'D', 'A', 'E'],
    flats: [],
    accidentalCount: 6,
    vexflowKey: 'D#m'
  },
  'Abm': {
    tonic: 'Ab',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G', 'C', 'F'],
    accidentalCount: -7,
    vexflowKey: 'Abm'
  },
  'Dm': {
    tonic: 'D',
    mode: 'minor',
    sharps: [],
    flats: ['B'],
    accidentalCount: -1,
    vexflowKey: 'Dm'
  },
  'Gm': {
    tonic: 'G',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E'],
    accidentalCount: -2,
    vexflowKey: 'Gm'
  },
  'Cm': {
    tonic: 'C',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E', 'A'],
    accidentalCount: -3,
    vexflowKey: 'Cm'
  },
  'Fm': {
    tonic: 'F',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E', 'A', 'D'],
    accidentalCount: -4,
    vexflowKey: 'Fm'
  },
  'Bbm': {
    tonic: 'Bb',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G'],
    accidentalCount: -5,
    vexflowKey: 'Bbm'
  },
  'Ebm': {
    tonic: 'Eb',
    mode: 'minor',
    sharps: [],
    flats: ['B', 'E', 'A', 'D', 'G', 'C'],
    accidentalCount: -6,
    vexflowKey: 'Ebm'
  }
};

// ============================================
// SCALE PATTERNS
// ============================================

// Scale patterns in semitones (intervals from root)
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // W-H-W-W-H-W-W

// ============================================
// PUBLIC FUNCTIONS
// ============================================

/**
 * Get all scale notes for a given key signature (without octave)
 * @param key - Key signature
 * @returns Array of note names in the scale (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 */
export function getScaleNotes(key: KeySignature): string[] {
  const keyData = KEY_SIGNATURES[key];
  const tonic = keyData.tonic;
  const intervals = keyData.mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;

  const notes: string[] = [];
  const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Find the tonic index in the chromatic scale
  let tonicIndex = chromaticScale.indexOf(tonic);

  // Handle flat tonics
  if (tonicIndex === -1) {
    const flatToSharp: { [key: string]: string } = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
    };
    tonicIndex = chromaticScale.indexOf(flatToSharp[tonic] || tonic);
  }

  // Build scale from intervals
  for (const interval of intervals) {
    const noteIndex = (tonicIndex + interval) % 12;
    let note = chromaticScale[noteIndex];

    // Apply key signature accidentals for proper spelling
    note = applyKeySignatureSpelling(note, keyData);

    notes.push(note);
  }

  return notes;
}

/**
 * Get diatonic pitches within a specific range for a key
 * @param key - Key signature
 * @param range - Pitch range
 * @returns Array of diatonic pitches with octaves
 */
export function getDiatonicPitchesInRange(key: KeySignature, range: PitchRange): string[] {
  const scaleNotes = getScaleNotes(key);
  const allPitches = getAllPitchesInRange(range.lowest, range.highest);

  // Filter to only include notes in the scale
  return allPitches.filter(pitch => {
    const noteName = pitch.replace(/\d+$/, ''); // Remove octave number
    return scaleNotes.some(scaleNote => areEnharmonic(noteName, scaleNote));
  });
}

/**
 * Get VexFlow key signature string
 * @param key - Key signature
 * @returns VexFlow key signature format
 */
export function getVexFlowKeySignature(key: KeySignature): string {
  return KEY_SIGNATURES[key].vexflowKey;
}

/**
 * Get the number of accidentals for a key signature
 * @param key - Key signature
 * @returns Absolute number of accidentals (0-7)
 */
export function getAccidentalCount(key: KeySignature): number {
  return Math.abs(KEY_SIGNATURES[key].accidentalCount);
}

/**
 * Get the accidental count from a VexFlow key signature string
 * @param vexflowKey - VexFlow key signature string (e.g., 'G', 'Bb', 'Am')
 * @returns Absolute number of accidentals (0-7), or 0 if not found
 */
export function getAccidentalCountFromVexFlow(vexflowKey: string): number {
  // Find the key signature that matches this VexFlow key
  for (const key of Object.keys(KEY_SIGNATURES) as KeySignature[]) {
    if (KEY_SIGNATURES[key].vexflowKey === vexflowKey) {
      return Math.abs(KEY_SIGNATURES[key].accidentalCount);
    }
  }
  return 0; // Default to 0 if not found
}

/**
 * Check if a note is in the key signature
 * @param note - Note name (without octave)
 * @param key - Key signature
 * @returns True if the note is diatonic to the key
 */
export function isNoteInKey(note: string, key: KeySignature): boolean {
  const scaleNotes = getScaleNotes(key);
  return scaleNotes.some(scaleNote => areEnharmonic(note, scaleNote));
}

/**
 * Get the tonic note name for a key signature
 * @param key - Key signature
 * @returns Tonic note name (without octave)
 */
export function getTonicNote(key: KeySignature): string {
  return KEY_SIGNATURES[key].tonic;
}

/**
 * Check if a pitch is a tonic (any octave) for the given key
 * @param pitch - Full pitch string (e.g., 'C4')
 * @param key - Key signature
 * @returns True if the pitch is a tonic
 */
export function isTonicPitch(pitch: string, key: KeySignature): boolean {
  const noteName = pitch.replace(/\d+$/, ''); // Remove octave number
  const tonic = KEY_SIGNATURES[key].tonic;
  return areEnharmonic(noteName, tonic);
}

/**
 * Get the scale degree distance from tonic (0-6)
 * @param pitch - Full pitch string
 * @param key - Key signature
 * @returns Scale degree distance (0 = tonic, 1 = 2nd, etc.) or -1 if not in scale
 */
export function getScaleDegreeFromTonic(pitch: string, key: KeySignature): number {
  const noteName = pitch.replace(/\d+$/, ''); // Remove octave number
  const scaleNotes = getScaleNotes(key);

  for (let i = 0; i < scaleNotes.length; i++) {
    if (areEnharmonic(noteName, scaleNotes[i])) {
      return i; // 0 = tonic, 1 = 2nd, 2 = 3rd, etc.
    }
  }

  return -1; // Not in scale
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Apply key signature spelling to a note
 * @param note - Note name
 * @param keyData - Key signature data
 * @returns Properly spelled note name
 */
function applyKeySignatureSpelling(note: string, keyData: KeySignatureData): string {
  // If the key uses flats, convert sharps to flats for proper spelling
  if (keyData.flats.length > 0) {
    const sharpToFlat: { [key: string]: string } = {
      'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
    };

    if (sharpToFlat[note]) {
      // Check if this note should be flat in this key
      const baseNote = note[0];
      if (keyData.flats.includes(baseNote)) {
        return sharpToFlat[note];
      }
    }
  }

  // If the key uses sharps, keep sharps
  if (keyData.sharps.length > 0) {
    const baseNote = note[0];
    if (keyData.sharps.includes(baseNote)) {
      return note;
    }
  }

  return note;
}

/**
 * Check if two notes are enharmonic (same pitch, different spelling)
 * @param note1 - First note
 * @param note2 - Second note
 * @returns True if notes are enharmonic
 */
function areEnharmonic(note1: string, note2: string): boolean {
  if (note1 === note2) return true;

  const enharmonicPairs: { [key: string]: string } = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
    'B': 'Cb', 'Cb': 'B',
    'E': 'Fb', 'Fb': 'E',
    'E#': 'F', 'F': 'E#'
  };

  return enharmonicPairs[note1] === note2 || enharmonicPairs[note2] === note1;
}
