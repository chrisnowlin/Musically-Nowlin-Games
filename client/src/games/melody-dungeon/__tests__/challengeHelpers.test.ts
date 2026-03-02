import { describe, it, expect } from 'vitest';
import {
  generateBigBossSequence,
  getSubtypeChallengePool,
  getEnemySubtypesForFloor,
  getChallengeTypesForFloor,
  getFloorZone,
  rollTier,
  getEnemyLevel,
  getChallengeTypeWeight,
  rollChallengeType,
} from '../challengeHelpers';

// ── getFloorZone ─────────────────────────────────────────────

describe('getFloorZone', () => {
  it('returns T1 pure for floors 1-12', () => {
    const zone1 = getFloorZone(1);
    expect(zone1.lowTier).toBe(1);
    expect(zone1.highTier).toBe(1);
    expect(zone1.progress).toBeCloseTo(0, 5);

    const zone12 = getFloorZone(12);
    expect(zone12.lowTier).toBe(1);
    expect(zone12.highTier).toBe(1);
    expect(zone12.progress).toBeCloseTo(1, 5);
  });

  it('returns T1->T2 transition for floors 13-18', () => {
    const zone13 = getFloorZone(13);
    expect(zone13.lowTier).toBe(1);
    expect(zone13.highTier).toBe(2);
    expect(zone13.progress).toBeCloseTo(0, 5);

    const zone18 = getFloorZone(18);
    expect(zone18.lowTier).toBe(1);
    expect(zone18.highTier).toBe(2);
    expect(zone18.progress).toBeCloseTo(1, 5);
  });

  it('returns T2 pure for floors 19-35', () => {
    const zone19 = getFloorZone(19);
    expect(zone19.lowTier).toBe(2);
    expect(zone19.highTier).toBe(2);

    const zone35 = getFloorZone(35);
    expect(zone35.lowTier).toBe(2);
    expect(zone35.highTier).toBe(2);
  });

  it('returns T3 pure for floors 43-68', () => {
    const zone43 = getFloorZone(43);
    expect(zone43.lowTier).toBe(3);
    expect(zone43.highTier).toBe(3);

    const zone68 = getFloorZone(68);
    expect(zone68.lowTier).toBe(3);
    expect(zone68.highTier).toBe(3);
  });

  it('returns T2->T3 transition for floors 36-42', () => {
    const zone36 = getFloorZone(36);
    expect(zone36.lowTier).toBe(2);
    expect(zone36.highTier).toBe(3);
    expect(zone36.progress).toBeGreaterThanOrEqual(0);
    expect(zone36.progress).toBeLessThanOrEqual(1);
    expect(zone36.progress).toBeCloseTo(0, 5);

    const zone42 = getFloorZone(42);
    expect(zone42.lowTier).toBe(2);
    expect(zone42.highTier).toBe(3);
    expect(zone42.progress).toBeCloseTo(1, 5);
  });

  it('returns T3->T4 transition for floors 69-75', () => {
    const zone69 = getFloorZone(69);
    expect(zone69.lowTier).toBe(3);
    expect(zone69.highTier).toBe(4);
    expect(zone69.progress).toBeGreaterThanOrEqual(0);
    expect(zone69.progress).toBeLessThanOrEqual(1);
    expect(zone69.progress).toBeCloseTo(0, 5);

    const zone75 = getFloorZone(75);
    expect(zone75.lowTier).toBe(3);
    expect(zone75.highTier).toBe(4);
    expect(zone75.progress).toBeCloseTo(1, 5);
  });

  it('returns T4 pure for floors 76-88', () => {
    const zone76 = getFloorZone(76);
    expect(zone76.lowTier).toBe(4);
    expect(zone76.highTier).toBe(4);

    const zone88 = getFloorZone(88);
    expect(zone88.lowTier).toBe(4);
    expect(zone88.highTier).toBe(4);
  });

  it('returns T4->T5 transition for floors 89-94', () => {
    const zone89 = getFloorZone(89);
    expect(zone89.lowTier).toBe(4);
    expect(zone89.highTier).toBe(5);
    expect(zone89.progress).toBeGreaterThanOrEqual(0);
    expect(zone89.progress).toBeLessThanOrEqual(1);
    expect(zone89.progress).toBeCloseTo(0, 5);

    const zone94 = getFloorZone(94);
    expect(zone94.lowTier).toBe(4);
    expect(zone94.highTier).toBe(5);
    expect(zone94.progress).toBeCloseTo(1, 5);
  });

  it('returns T5 pure for floors 95-100', () => {
    const zone95 = getFloorZone(95);
    expect(zone95.lowTier).toBe(5);
    expect(zone95.highTier).toBe(5);

    const zone100 = getFloorZone(100);
    expect(zone100.lowTier).toBe(5);
    expect(zone100.highTier).toBe(5);
  });

  it('handles floors above 100 as T5 pure', () => {
    const zone = getFloorZone(150);
    expect(zone.lowTier).toBe(5);
    expect(zone.highTier).toBe(5);
  });

  it('clamps floor 0 and negative floors to T1 pure', () => {
    const zone0 = getFloorZone(0);
    expect(zone0.lowTier).toBe(1);
    expect(zone0.highTier).toBe(1);

    const zoneNeg = getFloorZone(-5);
    expect(zoneNeg.lowTier).toBe(1);
    expect(zoneNeg.highTier).toBe(1);
  });
});

// ── rollTier ─────────────────────────────────────────────────

describe('rollTier', () => {
  it('always returns T1 for floors 1-12', () => {
    for (let i = 0; i < 20; i++) {
      expect(rollTier(5)).toBe(1);
    }
  });

  it('returns T1 or T2 for floors 13-18', () => {
    const tiers = new Set<number>();
    for (let i = 0; i < 200; i++) {
      tiers.add(rollTier(15));
    }
    // Should only contain 1 and/or 2
    for (const t of tiers) {
      expect([1, 2]).toContain(t);
    }
  });

  it('always returns T5 for floors 95-100', () => {
    for (let i = 0; i < 20; i++) {
      expect(rollTier(97)).toBe(5);
    }
  });
});

// ── getEnemyLevel ────────────────────────────────────────────

describe('getEnemyLevel', () => {
  it('returns level 1 for T1 pure zone', () => {
    expect(getEnemyLevel(5)).toBe(1);
  });

  it('returns level 1 or 2 for T1->T2 transition (uniform random)', () => {
    const levels = new Set<number>();
    for (let i = 0; i < 200; i++) {
      levels.add(getEnemyLevel(15));
    }
    // Should only contain 1 and/or 2
    for (const l of levels) {
      expect([1, 2]).toContain(l);
    }
    // With 200 iterations, both values should appear
    expect(levels.size).toBe(2);
  });

  it('returns level 3 for T3 pure zone', () => {
    expect(getEnemyLevel(50)).toBe(3);
  });

  it('returns level 5 for T5 pure zone', () => {
    expect(getEnemyLevel(97)).toBe(5);
  });
});

// ── getChallengeTypeWeight ───────────────────────────────────

describe('getChallengeTypeWeight', () => {
  it('returns 1.0 for non-late-bloomer types on any floor', () => {
    expect(getChallengeTypeWeight('noteReading', 1)).toBe(1.0);
    expect(getChallengeTypeWeight('rhythmTap', 50)).toBe(1.0);
    expect(getChallengeTypeWeight('dynamics', 1)).toBe(1.0);
    expect(getChallengeTypeWeight('timbre', 1)).toBe(1.0);
  });

  it('returns 0.15 for late-bloomers on floors 1-12', () => {
    expect(getChallengeTypeWeight('interval', 1)).toBe(0.15);
    expect(getChallengeTypeWeight('terms', 12)).toBe(0.15);
  });

  it('returns 0.5 for late-bloomers on floors 13-24', () => {
    expect(getChallengeTypeWeight('interval', 13)).toBe(0.5);
    expect(getChallengeTypeWeight('terms', 24)).toBe(0.5);
  });

  it('returns 1.0 for late-bloomers on floors 25+', () => {
    expect(getChallengeTypeWeight('interval', 25)).toBe(1.0);
    expect(getChallengeTypeWeight('terms', 100)).toBe(1.0);
  });
});

// ── rollChallengeType ───────────────────────────────────────

describe('rollChallengeType', () => {
  it('returns a valid ChallengeType', () => {
    const validTypes = [
      'noteReading', 'rhythmTap', 'interval', 'dynamics',
      'tempo', 'symbols', 'terms', 'timbre',
    ];
    for (let i = 0; i < 50; i++) {
      const result = rollChallengeType(50);
      expect(validTypes).toContain(result);
    }
  });

  it('late-bloomer types appear less frequently on early floors', () => {
    const iterations = 2000;
    const earlyFloor = 1;
    const lateFloor = 50;

    let earlyLateBloomerCount = 0;
    let lateLateBloomerCount = 0;

    for (let i = 0; i < iterations; i++) {
      const earlyResult = rollChallengeType(earlyFloor);
      if (earlyResult === 'interval' || earlyResult === 'terms') {
        earlyLateBloomerCount++;
      }
      const lateResult = rollChallengeType(lateFloor);
      if (lateResult === 'interval' || lateResult === 'terms') {
        lateLateBloomerCount++;
      }
    }

    // Late-bloomers should appear significantly less on early floors
    const earlyRatio = earlyLateBloomerCount / iterations;
    const lateRatio = lateLateBloomerCount / iterations;
    expect(earlyRatio).toBeLessThan(lateRatio);
  });
});

// ── getChallengeTypesForFloor ────────────────────────────────

describe('getChallengeTypesForFloor', () => {
  it('returns all 8 types for floor 1', () => {
    const types = getChallengeTypesForFloor(1);
    expect(types).toHaveLength(8);
    expect(types).toContain('noteReading');
    expect(types).toContain('rhythmTap');
    expect(types).toContain('interval');
    expect(types).toContain('dynamics');
    expect(types).toContain('tempo');
    expect(types).toContain('symbols');
    expect(types).toContain('terms');
    expect(types).toContain('timbre');
  });

  it('returns all 8 types for floor 50', () => {
    const types = getChallengeTypesForFloor(50);
    expect(types).toHaveLength(8);
  });

  it('returns all 8 types for floor 100', () => {
    const types = getChallengeTypesForFloor(100);
    expect(types).toHaveLength(8);
  });
});

// ── generateBigBossSequence ──────────────────────────────────

describe('generateBigBossSequence', () => {
  it('produces exactly 8 rounds', () => {
    const seq = generateBigBossSequence(10);
    expect(seq.length).toBe(8);
  });

  it('all rounds have a type from the floor challenge pool', () => {
    const types = getChallengeTypesForFloor(10);
    const seq = generateBigBossSequence(10);
    for (const round of seq) {
      expect(types).toContain(round.type);
    }
  });

  it('all rounds have a numeric tier', () => {
    const seq = generateBigBossSequence(10);
    for (const round of seq) {
      expect([1, 2, 3, 4, 5]).toContain(round.tier);
    }
  });

  it('includes each of the 8 types at least once', () => {
    const seq = generateBigBossSequence(50);
    const usedTypes = new Set(seq.map(r => r.type));
    expect(usedTypes.size).toBe(8);
  });
});

// ── getSubtypeChallengePool ──────────────────────────────────

describe('getSubtypeChallengePool', () => {
  it('slime prefers noteReading when available', () => {
    const pool = getSubtypeChallengePool('slime', ['noteReading', 'dynamics']);
    expect(pool).toEqual(['noteReading']);
  });

  it('slime falls back to full pool when noteReading is not available', () => {
    const pool = getSubtypeChallengePool('slime', ['dynamics', 'tempo']);
    expect(pool).toEqual(['dynamics', 'tempo']);
  });

  it('ghost uses full pool', () => {
    const allTypes = getChallengeTypesForFloor(26);
    const pool = getSubtypeChallengePool('ghost', allTypes);
    expect(pool).toEqual(allTypes);
  });

  it('dragon uses full pool', () => {
    const allTypes = getChallengeTypesForFloor(10);
    const pool = getSubtypeChallengePool('dragon', allTypes);
    expect(pool).toEqual(allTypes);
  });

  it('siren prefers timbre when available', () => {
    const pool = getSubtypeChallengePool('siren', ['noteReading', 'timbre']);
    expect(pool).toEqual(['timbre']);
  });
});

// ── getEnemySubtypesForFloor ─────────────────────────────────

describe('getEnemySubtypesForFloor', () => {
  it('always includes ghost', () => {
    expect(getEnemySubtypesForFloor(1)).toContain('ghost');
    expect(getEnemySubtypesForFloor(50)).toContain('ghost');
  });

  it('includes all subtypes since all types are unlocked from floor 1', () => {
    const subtypes = getEnemySubtypesForFloor(1);
    expect(subtypes).toContain('ghost');
    expect(subtypes).toContain('slime');
    expect(subtypes).toContain('bat');
    expect(subtypes).toContain('wraith');
    expect(subtypes).toContain('spider');
    expect(subtypes).toContain('skeleton');
    expect(subtypes).toContain('shade');
    expect(subtypes).toContain('goblin');
    expect(subtypes).toContain('siren');
  });
});
