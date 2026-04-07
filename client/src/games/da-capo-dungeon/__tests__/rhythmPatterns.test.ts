import { describe, it, expect } from 'vitest';
import {
  getCuratedPatterns,
  getRandomCuratedPattern,
  getAllSubdivisions,
  getPatternMeter,
  isMixedMeterPattern,
  BEAT_VALUES,
  METER_BEAT_TOTALS,
} from '../logic/rhythmPatterns';
import type { Meter, CuratedRhythmPattern } from '../logic/rhythmPatterns';
import type { Tier } from '../logic/dungeonTypes';

/** Sum quarter-note beats for a flat subdivision array. */
function sumBeats(subdivisions: string[]): number {
  return subdivisions.reduce((sum, s) => sum + (BEAT_VALUES[s] ?? 0), 0);
}

describe('rhythmPatterns', () => {
  it('returns patterns for every tier', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      const patterns = getCuratedPatterns(tier);
      expect(patterns.length).toBeGreaterThan(0);
    }
  });

  it('tier 1 patterns only use quarter, half, and eighth', () => {
    const patterns = getCuratedPatterns(1);
    for (const p of patterns) {
      for (const sub of p.subdivisions!) {
        expect(['quarter', 'half', 'eighth']).toContain(sub);
      }
    }
  });

  it('each pattern ID starts with its tier number', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      const patterns = getCuratedPatterns(tier);
      for (const p of patterns) {
        expect(p.id).toMatch(new RegExp(`^t${tier}-`));
      }
    }
  });

  it('getRandomCuratedPattern returns a valid pattern', () => {
    const pattern = getRandomCuratedPattern(1);
    expect(pattern).toBeDefined();
    expect(getAllSubdivisions(pattern).length).toBeGreaterThan(0);
    expect(pattern.id).toBeDefined();
  });

  it('pattern IDs are unique across all tiers', () => {
    const allIds = new Set<string>();
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        expect(allIds.has(p.id)).toBe(false);
        allIds.add(p.id);
      }
    }
  });

  // ── Time-signature validation ──────────────────────────────

  it('every simple pattern declares an explicit meter', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        if (isMixedMeterPattern(p)) continue;
        expect(p.meter).toBeDefined();
        expect(Object.keys(METER_BEAT_TOTALS)).toContain(p.meter);
      }
    }
  });

  it('every simple pattern sums to the correct beat total for its meter', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        if (isMixedMeterPattern(p)) continue;
        const expected = METER_BEAT_TOTALS[p.meter as Meter];
        const actual = sumBeats(p.subdivisions!);
        expect(actual).toBeCloseTo(expected, 10);
      }
    }
  });

  it('every mixed-meter section sums to the correct beat total for its meter', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        if (!isMixedMeterPattern(p)) continue;
        for (const section of p.sections!) {
          const expected = METER_BEAT_TOTALS[section.meter];
          const actual = sumBeats(section.subdivisions);
          expect(actual).toBeCloseTo(expected, 10);
        }
      }
    }
  });

  it('Tier 1-2 patterns are exclusively 4/4', () => {
    for (const tier of [1, 2] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        expect(p.meter).toBe('4/4');
      }
    }
  });

  it('Tier 3+ introduces meters beyond 4/4', () => {
    const metersUsed = new Set<string>();
    for (const tier of [3, 4, 5] as Tier[]) {
      for (const p of getCuratedPatterns(tier)) {
        if (p.meter) metersUsed.add(p.meter);
        if (p.sections) p.sections.forEach(s => metersUsed.add(s.meter));
      }
    }
    // Should include at least 3/4 and 6/8 beyond the base 4/4
    expect(metersUsed.has('3/4')).toBe(true);
    expect(metersUsed.has('6/8')).toBe(true);
  });

  it('getPatternMeter returns explicit meter or "mixed"', () => {
    // Simple pattern
    const simple: CuratedRhythmPattern = { id: 'test', meter: '3/4', subdivisions: ['quarter', 'quarter', 'quarter'] };
    expect(getPatternMeter(simple)).toBe('3/4');

    // Mixed pattern
    const mixed: CuratedRhythmPattern = {
      id: 'test-mixed',
      sections: [
        { meter: '2/4', beats: 2, subdivisions: ['quarter', 'quarter'] },
        { meter: '3/4', beats: 3, subdivisions: ['quarter', 'quarter', 'quarter'] },
      ],
    };
    expect(getPatternMeter(mixed)).toBe('mixed');

    // Pattern without explicit meter falls back to 4/4
    const noMeter: CuratedRhythmPattern = { id: 'test-none', subdivisions: ['quarter', 'quarter', 'quarter', 'quarter'] };
    expect(getPatternMeter(noMeter)).toBe('4/4');
  });
});
