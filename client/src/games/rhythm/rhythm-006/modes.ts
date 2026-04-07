export const RHYTHM_006_MODES = [
  "steady-beat",
  "beat-tapping",
  "internal-pulse",
  "subdivisions",
  "tempo-stability",
] as const;

export type Rhythm006Mode = typeof RHYTHM_006_MODES[number];

