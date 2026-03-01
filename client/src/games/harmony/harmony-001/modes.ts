export const HARMONY_001_MODES = [
  "all-intervals",
  "qualities",
] as const;

export type Harmony001Mode = typeof HARMONY_001_MODES[number];

export const MODE_DESCRIPTIONS = {
  "all-intervals": "Identify all musical intervals from unison to octave",
  "qualities": "Recognize interval qualities: perfect, major, minor, augmented, diminished",
};
