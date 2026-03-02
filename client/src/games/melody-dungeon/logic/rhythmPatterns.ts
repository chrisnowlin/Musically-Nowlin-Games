import type { RhythmSubdivision } from './difficultyAdapter';
import type { Tier } from './dungeonTypes';

export interface CuratedRhythmPattern {
  /** Unique ID like "t1-01" */
  id: string;
  /** Sequence of subdivisions that defines this pattern */
  subdivisions: RhythmSubdivision[];
  /** Asset key for notation lookup: "rhythm-patterns/t1-01" */
  assetKey: string;
}

// ── Tier 1: quarter + half, 4 events ─────────────────
const T1_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't1-01', subdivisions: ['quarter', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-01' },
  { id: 't1-02', subdivisions: ['half', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-02' },
  { id: 't1-03', subdivisions: ['quarter', 'half', 'quarter'], assetKey: 'rhythm-patterns/t1-03' },
  { id: 't1-04', subdivisions: ['quarter', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-04' },
  { id: 't1-05', subdivisions: ['half', 'half'], assetKey: 'rhythm-patterns/t1-05' },
  { id: 't1-06', subdivisions: ['half', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-06' },
  { id: 't1-07', subdivisions: ['quarter', 'half', 'half'], assetKey: 'rhythm-patterns/t1-07' },
  { id: 't1-08', subdivisions: ['half', 'half', 'quarter'], assetKey: 'rhythm-patterns/t1-08' },
  { id: 't1-09', subdivisions: ['quarter', 'quarter', 'quarter', 'half'], assetKey: 'rhythm-patterns/t1-09' },
  { id: 't1-10', subdivisions: ['half', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t1-10' },
];

// ── Tier 2: + quarter-rest + eighth, 4 events ───────
const T2_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't2-01', subdivisions: ['quarter', 'quarter', 'quarter-rest', 'quarter'], assetKey: 'rhythm-patterns/t2-01' },
  { id: 't2-02', subdivisions: ['eighth', 'eighth', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-02' },
  { id: 't2-03', subdivisions: ['quarter', 'eighth', 'eighth', 'half'], assetKey: 'rhythm-patterns/t2-03' },
  { id: 't2-04', subdivisions: ['half', 'quarter-rest', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-04' },
  { id: 't2-05', subdivisions: ['quarter', 'quarter', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-05' },
  { id: 't2-06', subdivisions: ['eighth', 'eighth', 'quarter-rest', 'half'], assetKey: 'rhythm-patterns/t2-06' },
  { id: 't2-07', subdivisions: ['quarter-rest', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t2-07' },
  { id: 't2-08', subdivisions: ['quarter', 'eighth', 'eighth', 'quarter-rest'], assetKey: 'rhythm-patterns/t2-08' },
  { id: 't2-09', subdivisions: ['eighth', 'eighth', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-09' },
  { id: 't2-10', subdivisions: ['half', 'eighth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t2-10' },
  { id: 't2-11', subdivisions: ['quarter', 'quarter-rest', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t2-11' },
  { id: 't2-12', subdivisions: ['quarter-rest', 'half', 'quarter', 'quarter-rest'], assetKey: 'rhythm-patterns/t2-12' },
];

// ── Tier 3: + dotted-quarter + sixteenth, 5 events ──
const T3_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't3-01', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t3-01' },
  { id: 't3-02', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-02' },
  { id: 't3-03', subdivisions: ['eighth', 'dotted-quarter', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-03' },
  { id: 't3-04', subdivisions: ['quarter', 'quarter', 'dotted-quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t3-04' },
  { id: 't3-05', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'dotted-quarter'], assetKey: 'rhythm-patterns/t3-05' },
  { id: 't3-06', subdivisions: ['quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t3-06' },
  { id: 't3-07', subdivisions: ['dotted-quarter', 'dotted-quarter', 'quarter', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t3-07' },
  { id: 't3-08', subdivisions: ['eighth', 'eighth', 'quarter', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t3-08' },
  { id: 't3-09', subdivisions: ['quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'], assetKey: 'rhythm-patterns/t3-09' },
  { id: 't3-10', subdivisions: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t3-10' },
];

// ── Tier 4: + triplet, 6 events ─────────────────────
const T4_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't4-01', subdivisions: ['quarter', 'triplet', 'eighth', 'eighth', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t4-01' },
  { id: 't4-02', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t4-02' },
  { id: 't4-03', subdivisions: ['triplet', 'quarter', 'eighth', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t4-03' },
  { id: 't4-04', subdivisions: ['quarter', 'sixteenth', 'sixteenth', 'triplet', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t4-04' },
  { id: 't4-05', subdivisions: ['eighth', 'triplet', 'quarter', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t4-05' },
  { id: 't4-06', subdivisions: ['quarter', 'quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth'], assetKey: 'rhythm-patterns/t4-06' },
  { id: 't4-07', subdivisions: ['triplet', 'triplet', 'quarter', 'eighth', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t4-07' },
  { id: 't4-08', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'triplet', 'quarter', 'quarter'], assetKey: 'rhythm-patterns/t4-08' },
];

// ── Tier 5: all subdivisions, 8 events ──────────────
const T5_PATTERNS: CuratedRhythmPattern[] = [
  { id: 't5-01', subdivisions: ['quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet', 'quarter'], assetKey: 'rhythm-patterns/t5-01' },
  { id: 't5-02', subdivisions: ['triplet', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t5-02' },
  { id: 't5-03', subdivisions: ['eighth', 'eighth', 'triplet', 'quarter', 'dotted-quarter', 'sixteenth', 'sixteenth', 'eighth'], assetKey: 'rhythm-patterns/t5-03' },
  { id: 't5-04', subdivisions: ['dotted-quarter', 'eighth', 'quarter', 'triplet', 'sixteenth', 'sixteenth', 'eighth', 'eighth'], assetKey: 'rhythm-patterns/t5-04' },
  { id: 't5-05', subdivisions: ['quarter', 'triplet', 'eighth', 'sixteenth', 'sixteenth', 'dotted-quarter', 'eighth', 'quarter'], assetKey: 'rhythm-patterns/t5-05' },
  { id: 't5-06', subdivisions: ['sixteenth', 'sixteenth', 'eighth', 'eighth', 'triplet', 'dotted-quarter', 'quarter', 'eighth'], assetKey: 'rhythm-patterns/t5-06' },
  { id: 't5-07', subdivisions: ['eighth', 'dotted-quarter', 'triplet', 'quarter', 'eighth', 'sixteenth', 'sixteenth', 'quarter'], assetKey: 'rhythm-patterns/t5-07' },
  { id: 't5-08', subdivisions: ['triplet', 'quarter', 'eighth', 'eighth', 'dotted-quarter', 'sixteenth', 'sixteenth', 'triplet'], assetKey: 'rhythm-patterns/t5-08' },
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
