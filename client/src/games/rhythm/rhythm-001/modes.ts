export const RHYTHM_001_MODES = [
  "patterns",
  "transformations",
  "analysis",
] as const;

export type Rhythm001Mode = typeof RHYTHM_001_MODES[number];

export const MODE_DESCRIPTIONS = {
  patterns: "Identify rhythmic patterns like syncopation, dotted rhythms, and triplets",
  transformations: "Recognize rhythm transformations: augmentation, diminution, retrograde",
  analysis: "Analyze time signatures and beat patterns",
};
