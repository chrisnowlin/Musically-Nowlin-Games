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

// ── Beat-value reference ───────────────────────────────────
// quarter = 1, half = 2, eighth = 0.5, sixteenth = 0.25,
// quarter-rest = 1, dotted-quarter = 1.5, triplet = 1,
// tied-quarter-quarter = 2, tied-half-half = 4
//
// 4/4 = 4 beats, 3/4 = 3, 2/4 = 2, 6/8 = 3, 12/8 = 6, 3/8 = 1.5, 2/2 = 4

// ── Tier 1 (K-1): quarter + half + eighth — all 4/4 ───────
const T1_PATTERNS: CuratedRhythmPattern[] = [
  // quarter = 1, half = 2, eighth = 0.5
  { id: 't1-01', meter: '4/4', subdivisions: ['quarter', 'quarter', 'quarter', 'quarter'] },           // 1+1+1+1 = 4
  { id: 't1-02', meter: '4/4', subdivisions: ['half', 'quarter', 'quarter'] },                         // 2+1+1 = 4
  { id: 't1-03', meter: '4/4', subdivisions: ['quarter', 'half', 'quarter'] },                         // 1+2+1 = 4
  { id: 't1-04', meter: '4/4', subdivisions: ['quarter', 'quarter', 'half'] },                         // 1+1+2 = 4
  { id: 't1-05', meter: '4/4', subdivisions: ['half', 'half'] },                                       // 2+2 = 4
  { id: 't1-06', meter: '4/4', subdivisions: ['half', 'eighth', 'eighth', 'quarter'] },                // 2+0.5+0.5+1 = 4
  { id: 't1-07', meter: '4/4', subdivisions: ['quarter', 'half', 'eighth', 'eighth'] },                // 1+2+0.5+0.5 = 4
  { id: 't1-08', meter: '4/4', subdivisions: ['eighth', 'eighth', 'half', 'quarter'] },                // 0.5+0.5+2+1 = 4
  { id: 't1-09', meter: '4/4', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth', 'quarter'] },  // 1+1+0.5+0.5+1 = 4
  { id: 't1-10', meter: '4/4', subdivisions: ['half', 'quarter', 'eighth', 'eighth'] },                // 2+1+0.5+0.5 = 4
  { id: 't1-11', meter: '4/4', subdivisions: ['eighth', 'eighth', 'quarter', 'quarter', 'quarter'] },  // 0.5+0.5+1+1+1 = 4
  { id: 't1-12', meter: '4/4', subdivisions: ['quarter', 'eighth', 'eighth', 'half'] },                // 1+0.5+0.5+2 = 4
  { id: 't1-13', meter: '4/4', subdivisions: ['half', 'eighth', 'eighth', 'quarter'] },                // 2+0.5+0.5+1 = 4
  { id: 't1-14', meter: '4/4', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth', 'quarter'] },  // 1+1+0.5+0.5+1 = 4
  { id: 't1-15', meter: '4/4', subdivisions: ['eighth', 'eighth', 'quarter', 'half'] },                // 0.5+0.5+1+2 = 4
  { id: 't1-16', meter: '4/4', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth', 'half'] },       // 0.5+0.5+0.5+0.5+2 = 4
];

// ── Tier 2 (2-3): + quarter-rest + tied notes — all 4/4 ───
const T2_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't2-01', meter: '4/4', subdivisions: ['quarter', 'quarter', 'quarter-rest', 'quarter'] },               // 1+1+1+1 = 4
  { id: 't2-02', meter: '4/4', subdivisions: ['eighth', 'eighth', 'quarter', 'half'] },                         // 0.5+0.5+1+2 = 4
  { id: 't2-03', meter: '4/4', subdivisions: ['quarter', 'eighth', 'eighth', 'half'] },                         // 1+0.5+0.5+2 = 4
  { id: 't2-04', meter: '4/4', subdivisions: ['half', 'quarter-rest', 'quarter'] },                             // 2+1+1 = 4
  { id: 't2-05', meter: '4/4', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth', 'quarter'] },           // 1+1+0.5+0.5+1 = 4
  { id: 't2-06', meter: '4/4', subdivisions: ['eighth', 'eighth', 'quarter-rest', 'half'] },                    // 0.5+0.5+1+2 = 4
  { id: 't2-07', meter: '4/4', subdivisions: ['quarter-rest', 'quarter', 'quarter', 'quarter'] },               // 1+1+1+1 = 4
  { id: 't2-08', meter: '4/4', subdivisions: ['quarter', 'eighth', 'eighth', 'quarter-rest', 'quarter'] },      // 1+0.5+0.5+1+1 = 4
  { id: 't2-09', meter: '4/4', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth', 'half'] },                // 0.5+0.5+0.5+0.5+2 = 4
  { id: 't2-10', meter: '4/4', subdivisions: ['half', 'eighth', 'eighth', 'quarter'] },                         // 2+0.5+0.5+1 = 4
  { id: 't2-11', meter: '4/4', subdivisions: ['quarter', 'quarter-rest', 'eighth', 'eighth', 'quarter'] },      // 1+1+0.5+0.5+1 = 4
  { id: 't2-12', meter: '4/4', subdivisions: ['quarter-rest', 'half', 'quarter-rest'] },                        // 1+2+1 = 4
  { id: 't2-13', meter: '4/4', subdivisions: ['quarter', 'quarter', 'tied-quarter-quarter'] },                  // 1+1+2 = 4
  { id: 't2-14', meter: '4/4', subdivisions: ['tied-half-half'] },                                              // 4 = 4
  { id: 't2-15', meter: '4/4', subdivisions: ['half', 'tied-quarter-quarter'] },                                // 2+2 = 4
  { id: 't2-16', meter: '4/4', subdivisions: ['tied-quarter-quarter', 'quarter', 'quarter'] },                  // 2+1+1 = 4
];

// ── Tier 3 (4-5): + dotted-quarter + sixteenth — 4/4, 3/4, 6/8 ──
const T3_PATTERNS: CuratedRhythmPattern[] = [
  // 4/4 patterns (4 beats)
  { id: 't3-01', meter: '4/4', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'quarter'] },                      // 1.5+0.5+1+1 = 4
  { id: 't3-02', meter: '4/4', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'eighth', 'quarter', 'quarter'] },    // 1+0.25+0.25+0.5+1+1 = 4
  { id: 't3-03', meter: '4/4', subdivisions: ['eighth', 'dotted-quarter', 'quarter', 'eighth', 'eighth'] },             // 0.5+1.5+1+0.5+0.5 = 4
  { id: 't3-04', meter: '4/4', subdivisions: ['quarter', 'quarter', 'dotted-quarter', 'eighth'] },                      // 1+1+1.5+0.5 = 4
  { id: 't3-05', meter: '4/4', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'half'] },                 // 0.25+0.25+0.5+1+2 = 4
  { id: 't3-06', meter: '4/4', subdivisions: ['quarter', 'eighth', 'sixteenth', 'sixteenth', 'half'] },                 // 1+0.5+0.25+0.25+2 = 4
  { id: 't3-07', meter: '4/4', subdivisions: ['dotted-quarter', 'dotted-quarter', 'eighth', 'eighth'] },                // 1.5+1.5+0.5+0.5 = 4
  { id: 't3-08', meter: '4/4', subdivisions: ['eighth', 'eighth', 'quarter', 'sixteenth', 'sixteenth', 'eighth', 'quarter'] }, // 0.5+0.5+1+0.25+0.25+0.5+1 = 4
  // 3/4 patterns (3 beats) — introduce a new time signature
  { id: 't3-09', meter: '3/4', subdivisions: ['quarter', 'dotted-quarter', 'eighth'] },                                 // 1+1.5+0.5 = 3
  { id: 't3-10', meter: '3/4', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'quarter'] },              // 0.25+0.25+0.5+1+1 = 3
  // 6/8 compound meter patterns (6 eighth-note beats = 3 quarter-note beats)
  { id: 't3-068-01', meter: '6/8', subdivisions: ['dotted-quarter', 'dotted-quarter'] },                                // 1.5+1.5 = 3
  { id: 't3-068-02', meter: '6/8', subdivisions: ['dotted-quarter', 'eighth', 'eighth', 'eighth'] },                    // 1.5+0.5+0.5+0.5 = 3
  { id: 't3-068-03', meter: '6/8', subdivisions: ['eighth', 'eighth', 'eighth', 'dotted-quarter'] },                    // 0.5+0.5+0.5+1.5 = 3
  { id: 't3-068-04', meter: '6/8', subdivisions: ['quarter', 'eighth', 'quarter', 'eighth'] },                          // 1+0.5+1+0.5 = 3
];

// ── Tier 4 (6-8): + triplet — 4/4, 3/4, 6/8, 12/8, 3/8 ──
const T4_PATTERNS: CuratedRhythmPattern[] = [
  // 4/4 patterns (4 beats)
  { id: 't4-01', meter: '4/4', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth', 'quarter'] },                   // 1+1+0.5+0.5+1 = 4
  { id: 't4-02', meter: '4/4', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'quarter'] },                   // 0.5+0.5+1+1+1 = 4
  { id: 't4-03', meter: '4/4', subdivisions: ['triplet', 'quarter', 'eighth', 'eighth', 'quarter'] },                   // 1+1+0.5+0.5+1 = 4
  { id: 't4-04', meter: '4/4', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'eighth', 'triplet', 'quarter'] },    // 1+0.25+0.25+0.5+1+1 = 4
  { id: 't4-05', meter: '4/4', subdivisions: ['eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth', 'quarter'] },     // 0.5+1+1+0.25+0.25+1 = 4
  { id: 't4-06', meter: '4/4', subdivisions: ['quarter', 'quarter', 'triplet', 'quarter'] },                             // 1+1+1+1 = 4
  { id: 't4-07', meter: '4/4', subdivisions: ['triplet', 'triplet', 'quarter', 'quarter'] },                             // 1+1+1+1 = 4
  { id: 't4-08', meter: '4/4', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'triplet', 'quarter', 'quarter'] },    // 0.25+0.25+0.5+1+1+1 = 4
  // 3/4 patterns (3 beats)
  { id: 't4-09', meter: '3/4', subdivisions: ['triplet', 'quarter', 'quarter'] },                                        // 1+1+1 = 3
  { id: 't4-10', meter: '3/4', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth'] },                               // 1+1+0.5+0.5 = 3
  // 6/8 compound patterns (3 quarter-note beats)
  { id: 't4-068-01', meter: '6/8', subdivisions: ['dotted-quarter', 'quarter', 'eighth'] },                              // 1.5+1+0.5 = 3
  { id: 't4-068-02', meter: '6/8', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'] },         // 6 × 0.5 = 3
  // 12/8 compound quadruple meter (6 quarter-note beats)
  { id: 't4-128-01', meter: '12/8', subdivisions: ['dotted-quarter', 'dotted-quarter', 'dotted-quarter', 'dotted-quarter'] },                  // 4 × 1.5 = 6
  { id: 't4-128-02', meter: '12/8', subdivisions: ['dotted-quarter', 'eighth', 'eighth', 'eighth', 'dotted-quarter', 'dotted-quarter'] },      // 1.5+0.5+0.5+0.5+1.5+1.5 = 6
  // 3/8 patterns (1.5 quarter-note beats)
  { id: 't4-038-01', meter: '3/8', subdivisions: ['dotted-quarter'] },                                                   // 1.5 = 1.5
  { id: 't4-038-02', meter: '3/8', subdivisions: ['eighth', 'eighth', 'eighth'] },                                       // 0.5+0.5+0.5 = 1.5
];

// ── Tier 5 (HS): all subdivisions, all meters + mixed meter ──
const T5_PATTERNS: CuratedRhythmPattern[] = [
  // 4/4 patterns (4 beats)
  { id: 't5-01', meter: '4/4', subdivisions: ['quarter', 'eighth', 'eighth', 'dotted-quarter', 'eighth'] },                                      // 1+0.5+0.5+1.5+0.5 = 4
  { id: 't5-02', meter: '4/4', subdivisions: ['triplet', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'] },                     // 1+0.5+1.5+0.25+0.25+0.5 = 4
  { id: 't5-03', meter: '4/4', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'quarter'] },                                           // 0.5+0.5+1+1+1 = 4
  { id: 't5-04', meter: '4/4', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'triplet'] },                                              // 1.5+0.5+1+1 = 4
  // 3/4 patterns (3 beats)
  { id: 't5-05', meter: '3/4', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth'] },                                                      // 1+1+0.5+0.5 = 3
  { id: 't5-06', meter: '3/4', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'dotted-quarter', 'eighth'] },                                // 0.25+0.25+0.5+1.5+0.5 = 3
  // 2/2 (cut time) patterns (4 quarter-note beats, felt in 2 half-note beats)
  { id: 't5-07', meter: '2/2', subdivisions: ['half', 'quarter', 'eighth', 'eighth'] },                                                         // 2+1+0.5+0.5 = 4
  { id: 't5-08', meter: '2/2', subdivisions: ['quarter', 'quarter', 'half'] },                                                                  // 1+1+2 = 4
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
  return pattern.meter || '4/4';
}

/**
 * Beat-value map used for validation. Quarter-note beat values.
 * For compound meters (6/8, 12/8, 3/8) the total is still expressed in
 * quarter-note beats so the same arithmetic works everywhere.
 */
export const BEAT_VALUES: Record<string, number> = {
  quarter:              1,
  half:                 2,
  eighth:               0.5,
  sixteenth:            0.25,
  'quarter-rest':       1,
  'dotted-quarter':     1.5,
  triplet:              1,
  'tied-quarter-quarter': 2,
  'tied-half-half':     4,
};

/** Expected total quarter-note beats for each meter. */
export const METER_BEAT_TOTALS: Record<Meter, number> = {
  '2/4':  2,
  '3/4':  3,
  '4/4':  4,
  '2/2':  4,    // 2 half-note beats = 4 quarter-note beats
  '6/8':  3,    // 2 dotted-quarter groups = 3 quarter-note beats
  '12/8': 6,    // 4 dotted-quarter groups = 6 quarter-note beats
  '3/8':  1.5,  // 1 dotted-quarter group  = 1.5 quarter-note beats
};
