export const THEORY_004_MODES = [
  "major",
  "minor",
  "analysis",
  "modulation",
] as const;

export type Theory004Mode = typeof THEORY_004_MODES[number];

export const MODE_DESCRIPTIONS = {
  major: "Identify major key signatures by counting sharps and flats",
  minor: "Identify minor key signatures and their relationships",
  analysis: "Analyze pieces to determine their key",
  modulation: "Understand key changes and relationships between keys",
};
