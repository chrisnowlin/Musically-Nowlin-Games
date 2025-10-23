export const TIMBRE_003_MODES = [
  "string-techniques",
  "articulation",
] as const;

export type Timbre003Mode = typeof TIMBRE_003_MODES[number];

export const MODE_DESCRIPTIONS = {
  "string-techniques": "Identify string playing techniques like pizzicato, arco, and tremolo",
  "articulation": "Recognize articulations: staccato, legato, marcato, and more",
};
