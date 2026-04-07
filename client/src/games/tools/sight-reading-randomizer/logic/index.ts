/**
 * Sight Reading Randomizer
 * Main export file for pitch and melodic generation utilities
 */

// Export types
export type {
  KeySignature,
  MelodicDifficulty,
  PitchRange,
  PitchSyllableSystem,
  SightReadingSettings
} from './types';

export {
  TREBLE_CLEF_RANGE,
  BASS_CLEF_RANGE,
  DEFAULT_SIGHT_READING_SETTINGS,
  isPitchSyllableSystem,
  isRhythmSyllableSystem
} from './types';

// Export pitch utilities
export {
  NOTE_FREQUENCIES,
  pitchToVexFlow,
  pitchToFrequency,
  getAllPitchesInRange,
  getDiatonicPitches,
  getInterval,
  pitchFromIndex
} from './pitchUtils';

// Export key signature utilities
export {
  KEY_SIGNATURES,
  getScaleNotes,
  getDiatonicPitchesInRange,
  getVexFlowKeySignature,
  getAccidentalCount,
  getAccidentalCountFromVexFlow,
  isNoteInKey,
  getTonicNote,
  isTonicPitch,
  getScaleDegreeFromTonic
} from './keySignatureUtils';

// Export pitch generator
export {
  selectNextPitch,
  assignPitchesToPattern,
  analyzeContour
} from './pitchGenerator';

// Export solfege syllables
export {
  getPitchSyllable,
  getMoveableDoSyllable,
  getFixedDoSyllable,
  getScaleDegreeSyllable,
  getPitchSyllableSystemName,
  getPitchSyllableSystemDescription
} from './solfegeSyllables';
