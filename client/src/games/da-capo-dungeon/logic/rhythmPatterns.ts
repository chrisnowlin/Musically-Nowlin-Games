import type { RhythmSubdivision } from './difficultyAdapter';
import type { Tier } from './dungeonTypes';

export type Meter = '2/4' | '3/4' | '4/4' | '6/8' | '12/8' | '3/8' | '2/2';

export interface MeterSection {
  /** The meter for this section */
  meter: Meter;
  /** Number of beats in this section */
  beats: number;
  /** Sequence of subdivisions for this section */
  subdivisions: RhythmSubdivision[];
}

export interface CuratedRhythmPattern {
  /** Unique ID like "t1-01" — also used to resolve the SVG asset path */
  id: string;
  /** Single meter for the entire pattern (use for simple patterns) */
  meter?: Meter;
  /** Sequence of subdivisions that defines this pattern (use for simple patterns) */
  subdivisions?: RhythmSubdivision[];
  /** Multiple meter sections for mixed meter patterns (use for mixed meter) */
  sections?: MeterSection[];
}

// ── Tier 1: quarter + half + eighth, 4 events ─────────────────
const T1_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't1-01', subdivisions: ['quarter', 'quarter', 'quarter', 'quarter'] },
  { id: 't1-02', subdivisions: ['half', 'quarter', 'quarter'] },
  { id: 't1-03', subdivisions: ['quarter', 'half', 'quarter'] },
  { id: 't1-04', subdivisions: ['quarter', 'quarter', 'half'] },
  { id: 't1-05', subdivisions: ['half', 'half'] },
  { id: 't1-06', subdivisions: ['half', 'quarter', 'half'] },
  { id: 't1-07', subdivisions: ['quarter', 'half', 'half'] },
  { id: 't1-08', subdivisions: ['half', 'half', 'quarter'] },
  { id: 't1-09', subdivisions: ['quarter', 'quarter', 'quarter', 'half'] },
  { id: 't1-10', subdivisions: ['half', 'quarter', 'quarter', 'quarter'] },
  { id: 't1-11', subdivisions: ['eighth', 'eighth', 'quarter', 'quarter'] },
  { id: 't1-12', subdivisions: ['quarter', 'eighth', 'eighth', 'half'] },
  { id: 't1-13', subdivisions: ['half', 'eighth', 'eighth', 'quarter'] },
  { id: 't1-14', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth'] },
  { id: 't1-15', subdivisions: ['eighth', 'eighth', 'half', 'quarter'] },
  { id: 't1-16', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth'] },
];

// ── Tier 2: + quarter-rest + eighth + tied, 4 events ───────
const T2_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't2-01', subdivisions: ['quarter', 'quarter', 'quarter-rest', 'quarter'] },
  { id: 't2-02', subdivisions: ['eighth', 'eighth', 'quarter', 'quarter'] },
  { id: 't2-03', subdivisions: ['quarter', 'eighth', 'eighth', 'half'] },
  { id: 't2-04', subdivisions: ['half', 'quarter-rest', 'quarter', 'quarter'] },
  { id: 't2-05', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth'] },
  { id: 't2-06', subdivisions: ['eighth', 'eighth', 'quarter-rest', 'half'] },
  { id: 't2-07', subdivisions: ['quarter-rest', 'quarter', 'quarter', 'quarter'] },
  { id: 't2-08', subdivisions: ['quarter', 'eighth', 'eighth', 'quarter-rest'] },
  { id: 't2-09', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth'] },
  { id: 't2-10', subdivisions: ['half', 'eighth', 'eighth', 'quarter'] },
  { id: 't2-11', subdivisions: ['quarter', 'quarter-rest', 'eighth', 'eighth'] },
  { id: 't2-12', subdivisions: ['quarter-rest', 'half', 'quarter', 'quarter-rest'] },
  { id: 't2-13', subdivisions: ['quarter', 'half', 'tied-quarter-quarter'] },
  { id: 't2-14', subdivisions: ['tied-half-half', 'quarter', 'quarter'] },
  { id: 't2-15', subdivisions: ['quarter', 'quarter', 'tied-quarter-quarter'] },
  { id: 't2-16', subdivisions: ['tied-quarter-quarter', 'half', 'quarter'] },
];

// ── Tier 3: + dotted-quarter + sixteenth + compound patterns, 5 events ──
const T3_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't3-01', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'quarter', 'quarter'] },
  { id: 't3-02', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'eighth', 'quarter'] },
  { id: 't3-03', subdivisions: ['eighth', 'dotted-quarter', 'quarter', 'eighth', 'quarter'] },
  { id: 't3-04', subdivisions: ['quarter', 'quarter', 'dotted-quarter', 'eighth', 'quarter'] },
  { id: 't3-05', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'dotted-quarter'] },
  { id: 't3-06', subdivisions: ['quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'] },
  { id: 't3-07', subdivisions: ['dotted-quarter', 'dotted-quarter', 'quarter', 'eighth', 'eighth'] },
  { id: 't3-08', subdivisions: ['eighth', 'eighth', 'quarter', 'sixteenth', 'sixteenth'] },
  { id: 't3-09', subdivisions: ['quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'] },
  { id: 't3-10', subdivisions: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'quarter'] },
  // 6/8 compound meter patterns (2 beats of dotted quarter)
  { id: 't3-068-01', subdivisions: ['dotted-quarter', 'eighth', 'dotted-quarter', 'eighth'] },
  { id: 't3-068-02', subdivisions: ['eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'eighth'] },
  { id: 't3-068-03', subdivisions: ['dotted-quarter', 'eighth', 'eighth', 'dotted-quarter'] },
  { id: 't3-068-04', subdivisions: ['quarter', 'eighth', 'dotted-quarter', 'dotted-quarter'] },
];

// ── Tier 4: + triplet + compound meters, 6 events ─────────────────────
const T4_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't4-01', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth', 'quarter', 'quarter'] },
  { id: 't4-02', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth'] },
  { id: 't4-03', subdivisions: ['triplet', 'quarter', 'eighth', 'quarter', 'eighth', 'quarter'] },
  { id: 't4-04', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'triplet', 'eighth', 'eighth'] },
  { id: 't4-05', subdivisions: ['eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth', 'quarter'] },
  { id: 't4-06', subdivisions: ['quarter', 'quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth'] },
  { id: 't4-07', subdivisions: ['triplet', 'triplet', 'quarter', 'eighth', 'eighth', 'quarter'] },
  { id: 't4-08', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'triplet', 'quarter', 'quarter'] },
  // 12/8 compound quadruple meter (4 beats of dotted quarter)
  { id: 't4-128-01', subdivisions: ['dotted-quarter', 'eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'eighth'] },
  { id: 't4-128-02', subdivisions: ['eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'eighth'] },
  { id: 't4-128-03', subdivisions: ['dotted-quarter', 'eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'dotted-quarter'] },
  { id: 't4-128-04', subdivisions: ['quarter', 'eighth', 'dotted-quarter', 'eighth', 'dotted-quarter', 'eighth'] },
  // 3/8 compound triple meter (1 beat of dotted quarter)
  { id: 't4-038-01', subdivisions: ['dotted-quarter', 'eighth'] },
  { id: 't4-038-02', subdivisions: ['eighth', 'dotted-quarter'] },
  { id: 't4-038-03', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'] },
  { id: 't4-038-04', subdivisions: ['quarter', 'eighth', 'eighth'] },
];

// ── Tier 5: all subdivisions, 8 events + mixed meter ──────────────
const T5_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't5-01', subdivisions: ['quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet', 'quarter'] },
  { id: 't5-02', subdivisions: ['triplet', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'quarter', 'eighth', 'quarter'] },
  { id: 't5-03', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'] },
  { id: 't5-04', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'triplet', 'sixteenth', 'sixteenth', 'eighth', 'eighth'] },
  { id: 't5-05', subdivisions: ['quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth', 'dotted-quarter', 'eighth', 'quarter'] },
  { id: 't5-06', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'eighth', 'triplet', 'dotted-quarter', 'quarter', 'eighth'] },
  { id: 't5-07', subdivisions: ['eighth', 'dotted-quarter', 'triplet', 'quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'] },
  { id: 't5-08', subdivisions: ['triplet', 'quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet'] },
  // Mixed meter patterns (Grade 7 standard: 7.PR.1.2)
  { id: 't5-mixed-01', sections: [
    { meter: '2/4', beats: 2, subdivisions: ['quarter', 'quarter'] },
    { meter: '3/4', beats: 3, subdivisions: ['quarter', 'quarter', 'quarter'] },
    { meter: '2/4', beats: 2, subdivisions: ['eighth', 'eighth', 'eighth', 'eighth'] },
  ]},
  { id: 't5-mixed-02', sections: [
    { meter: '4/4', beats: 4, subdivisions: ['half', 'quarter', 'quarter'] },
    { meter: '3/4', beats: 3, subdivisions: ['quarter', 'quarter', 'quarter'] },
    { meter: '2/4', beats: 2, subdivisions: ['quarter', 'quarter'] },
  ]},
  { id: 't5-mixed-03', sections: [
    { meter: '3/4', beats: 3, subdivisions: ['dotted-quarter', 'eighth', 'quarter'] },
    { meter: '2/4', beats: 2, subdivisions: ['quarter', 'eighth', 'eighth'] },
    { meter: '4/4', beats: 4, subdivisions: ['quarter', 'quarter', 'half'] },
  ]},
  { id: 't5-mixed-04', sections: [
    { meter: '2/4', beats: 2, subdivisions: ['quarter', 'quarter'] },
    { meter: '3/4', beats: 3, subdivisions: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'] },
    { meter: '2/4', beats: 2, subdivisions: ['half'] },
    { meter: '3/4', beats: 3, subdivisions: ['quarter', 'quarter', 'quarter'] },
  ]},
];

const PATTERNS_BY_TIER: Record<Tier, CuratedRhythmPattern[]> = {
  1: T1_PATTERNS,
  2: T2_PATTERNS,
  3: T3_PATTERNS,
  4: T4_PATTERNS,
  5: T5_PATTERNS,
};

export function getCuratedPatterns(tier: Tier): CuratedRhythmPattern[] {
  return PATTERNS_BY_TIER[tier];
}

export function getRandomCuratedPattern(tier: Tier): CuratedRhythmPattern {
  const patterns = PATTERNS_BY_TIER[tier];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function isMixedMeterPattern(pattern: CuratedRhythmPattern): boolean {
  return !!pattern.sections && pattern.sections.length > 1;
}

export function getAllSubdivisions(pattern: CuratedRhythmPattern): RhythmSubdivision[] {
  if (pattern.sections) {
    return pattern.sections.flatMap(s => s.subdivisions);
  }
  return pattern.subdivisions || [];
}

export function getPatternMeter(pattern: CuratedRhythmPattern): Meter | string | null {
  if (pattern.sections) {
    return 'mixed';
  }
  return pattern.meter || null;
}
