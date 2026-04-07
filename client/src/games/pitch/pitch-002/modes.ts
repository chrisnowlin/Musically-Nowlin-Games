export const PITCH_002_MODES = [
  "transformations",
  "patterns",
  "articulations",
] as const;

export type Pitch002Mode = typeof PITCH_002_MODES[number];

export const MODE_DESCRIPTIONS = {
  transformations: "Identify melodic transformations like repetition, sequence, inversion, and retrograde",
  patterns: "Recognize melodic patterns: stepwise motion, leaps, arpeggios, scales, and more",
  articulations: "Distinguish between articulation styles: legato, staccato, marcato, and others",
};
