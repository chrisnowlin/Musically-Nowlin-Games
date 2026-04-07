/**
 * Solfege Syllables Generator
 * Generates pitch syllables (Do Re Mi Fa Sol La Ti) based on moveable Do system
 */

import type { KeySignature, PitchSyllableSystem } from './types';
import { getScaleDegreeFromTonic, KEY_SIGNATURES } from './keySignatureUtils';

// ============================================
// SOLFEGE SYLLABLE MAPPINGS
// ============================================

/**
 * Major scale solfege syllables by scale degree (0-indexed)
 * 0 = tonic (Do), 1 = supertonic (Re), etc.
 */
const MAJOR_SOLFEGE: string[] = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

/**
 * Minor scale solfege syllables (La-based minor)
 * In this system, minor starts on La
 * The scale degrees relative to the minor tonic are:
 * 0 = tonic (La), 1 = (Ti), 2 = (Do), 3 = (Re), 4 = (Mi), 5 = (Fa), 6 = (Sol)
 */
const MINOR_SOLFEGE_LA_BASED: string[] = ['La', 'Ti', 'Do', 'Re', 'Mi', 'Fa', 'Sol'];

/**
 * Minor scale solfege syllables (Do-based minor)
 * In this system, minor tonic is still Do, but with altered syllables
 * Me = lowered 3rd, Le = lowered 6th, Te = lowered 7th
 */
const MINOR_SOLFEGE_DO_BASED: string[] = ['Do', 'Re', 'Me', 'Fa', 'Sol', 'Le', 'Te'];

/**
 * Scale degree numbers
 */
const SCALE_DEGREES: string[] = ['1', '2', '3', '4', '5', '6', '7'];

/**
 * Fixed Do solfege - maps note letter names to syllables
 * C = Do, D = Re, E = Mi, F = Fa, G = Sol, A = La, B = Ti
 * Accidentals use chromatic alterations
 */
const FIXED_DO_MAP: Record<string, string> = {
  'C': 'Do',
  'C#': 'Di', 'Db': 'Ra',
  'D': 'Re',
  'D#': 'Ri', 'Eb': 'Me',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fi', 'Gb': 'Se',
  'G': 'Sol',
  'G#': 'Si', 'Ab': 'Le',
  'A': 'La',
  'A#': 'Li', 'Bb': 'Te',
  'B': 'Ti',
};

// ============================================
// PUBLIC FUNCTIONS
// ============================================

/**
 * Get the pitch syllable for a note given the key signature and syllable system
 * @param pitch - The pitch string (e.g., 'C4', 'D#5')
 * @param keySignature - The current key signature
 * @param system - The pitch syllable system to use
 * @returns The syllable string (e.g., 'Do', 'Re', '1', 'C')
 */
export function getPitchSyllable(
  pitch: string | undefined,
  keySignature: KeySignature,
  system: PitchSyllableSystem
): string {
  if (!pitch || system === 'none') {
    return '';
  }

  // Extract note name without octave
  const noteName = pitch.replace(/\d+$/, '');

  switch (system) {
    case 'moveableDo':
      return getMoveableDoSyllable(pitch, keySignature);
    case 'fixedDo':
      return getFixedDoSyllable(pitch);
    case 'scaleDegrees':
      return getScaleDegreeSyllable(pitch, keySignature);
    case 'noteNames':
      return noteName;
    default:
      return '';
  }
}

/**
 * Get moveable Do solfege syllable for a pitch
 * @param pitch - The pitch string (e.g., 'C4')
 * @param keySignature - The current key signature
 * @returns Solfege syllable (Do, Re, Mi, etc.)
 */
export function getMoveableDoSyllable(
  pitch: string,
  keySignature: KeySignature
): string {
  const scaleDegree = getScaleDegreeFromTonic(pitch, keySignature);

  if (scaleDegree === -1) {
    // Note is not in the scale - return empty or chromatic syllable
    return getChromaticSyllable(pitch, keySignature);
  }

  // Determine if key is major or minor
  const keyData = KEY_SIGNATURES[keySignature];
  const isMinor = keyData.mode === 'minor';

  if (isMinor) {
    // Using La-based minor (more common in educational settings)
    return MINOR_SOLFEGE_LA_BASED[scaleDegree] || '';
  }

  return MAJOR_SOLFEGE[scaleDegree] || '';
}

/**
 * Get fixed Do solfege syllable for a pitch
 * In Fixed Do, C is always Do regardless of key
 * @param pitch - The pitch string (e.g., 'C4', 'F#5')
 * @returns Solfege syllable (Do, Re, Mi, etc.)
 */
export function getFixedDoSyllable(pitch: string): string {
  // Extract note name without octave
  const noteName = pitch.replace(/\d+$/, '');

  // Look up in the fixed Do map
  return FIXED_DO_MAP[noteName] || noteName;
}

/**
 * Get scale degree syllable for a pitch
 * @param pitch - The pitch string (e.g., 'C4')
 * @param keySignature - The current key signature
 * @returns Scale degree number (1-7)
 */
export function getScaleDegreeSyllable(
  pitch: string,
  keySignature: KeySignature
): string {
  const scaleDegree = getScaleDegreeFromTonic(pitch, keySignature);

  if (scaleDegree === -1) {
    // Note is not in the scale
    return '?';
  }

  return SCALE_DEGREES[scaleDegree] || '';
}

/**
 * Get chromatic solfege syllable for non-diatonic notes
 * Uses raised (di, ri, fi, si, li) and lowered (ra, me, se, le, te) syllables
 * @param pitch - The pitch string
 * @param keySignature - The current key signature
 * @returns Chromatic syllable or the note name as fallback
 */
function getChromaticSyllable(pitch: string, keySignature: KeySignature): string {
  // For now, return the note name for chromatic notes
  // A full implementation would analyze the exact chromatic alteration
  const noteName = pitch.replace(/\d+$/, '');
  return noteName;
}

/**
 * Get the display name for a syllable system
 */
export function getPitchSyllableSystemName(system: PitchSyllableSystem): string {
  switch (system) {
    // Pitch-based
    case 'moveableDo':
      return 'Moveable Do';
    case 'fixedDo':
      return 'Fixed Do';
    case 'scaleDegrees':
      return 'Scale Degrees';
    case 'noteNames':
      return 'Note Names';
    // Rhythm-based
    case 'kodaly':
      return 'Kodály';
    case 'takadimi':
      return 'Takadimi';
    case 'gordon':
      return 'Gordon';
    case 'numbers':
      return '1 e & a';
    case 'none':
      return 'None';
    default:
      return system;
  }
}

/**
 * Get a description for a syllable system
 */
export function getPitchSyllableSystemDescription(system: PitchSyllableSystem): string {
  switch (system) {
    // Pitch-based
    case 'moveableDo':
      return 'Do Re Mi Fa Sol La Ti (Do = tonic)';
    case 'fixedDo':
      return 'Do Re Mi Fa Sol La Ti (C = Do always)';
    case 'scaleDegrees':
      return '1 2 3 4 5 6 7 (scale degrees)';
    case 'noteNames':
      return 'C D E F G A B (actual pitches)';
    // Rhythm-based
    case 'kodaly':
      return 'ta, ti-ti, ta-a (Zoltán Kodály method)';
    case 'takadimi':
      return 'ta, di, ka, mi (beat-function based)';
    case 'gordon':
      return 'du, de, ta (Edwin Gordon method)';
    case 'numbers':
      return '1, e, &, a (traditional counting)';
    case 'none':
      return 'No syllables displayed';
    default:
      return '';
  }
}
