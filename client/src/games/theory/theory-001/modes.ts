export const THEORY_001_MODES = [
  "clefs",
  "grand-staff",
  "accidentals",
  "advanced",
] as const;

export type Theory001Mode = typeof THEORY_001_MODES[number];

export const MODE_DESCRIPTIONS = {
  clefs: "Read notes in different clefs: treble, bass, alto, and tenor",
  "grand-staff": "Read notes across both treble and bass clefs, including ledger lines",
  accidentals: "Identify accidentals: sharps, flats, naturals, and enharmonic equivalents",
  advanced: "Master advanced notation: octaves, rhythms, clef changes, and ornaments",
};
