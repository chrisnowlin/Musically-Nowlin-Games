import { describe, it, expect } from 'vitest';
import { getCuratedPatterns, getRandomCuratedPattern } from '../logic/rhythmPatterns';
import type { Tier } from '../logic/dungeonTypes';

describe('rhythmPatterns', () => {
  it('returns patterns for every tier', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      const patterns = getCuratedPatterns(tier);
      expect(patterns.length).toBeGreaterThan(0);
    }
  });

  it('tier 1 patterns only use quarter and half', () => {
    const patterns = getCuratedPatterns(1);
    for (const p of patterns) {
      for (const sub of p.subdivisions) {
        expect(['quarter', 'half']).toContain(sub);
      }
    }
  });

  it('each pattern ID encodes its tier', () => {
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) {
      const patterns = getCuratedPatterns(tier);
      for (const p of patterns) {
        expect(p.id).toMatch(new RegExp(`^t${tier}-\\d{2}$`));
      }
    }
  });

  it('getRandomCuratedPattern returns a valid pattern', () => {
    const pattern = getRandomCuratedPattern(1);
    expect(pattern).toBeDefined();
    expect(pattern.subdivisions.length).toBeGreaterThan(0);
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
});
