import { describe, it, expect } from 'vitest';
import {
  generateBigBossSequence,
  getSubtypeChallengePool,
  getEnemySubtypesForFloor,
  getChallengeTypesForFloor,
  getTierForChallenge,
} from '../challengeHelpers';

describe('getChallengeTypesForFloor', () => {
  it('unlocks noteReading and dynamics on floor 1', () => {
    const types = getChallengeTypesForFloor(1);
    expect(types).toContain('noteReading');
    expect(types).toContain('dynamics');
    expect(types).not.toContain('tempo');
  });

  it('unlocks tempo on floor 6', () => {
    const types = getChallengeTypesForFloor(6);
    expect(types).toContain('tempo');
    expect(types).not.toContain('symbols');
  });

  it('unlocks all types by floor 26', () => {
    const types = getChallengeTypesForFloor(26);
    expect(types).toContain('noteReading');
    expect(types).toContain('dynamics');
    expect(types).toContain('tempo');
    expect(types).toContain('symbols');
    expect(types).toContain('rhythmTap');
    expect(types).toContain('terms');
    expect(types).toContain('interval');
  });
});

describe('getTierForChallenge', () => {
  it('returns tier 1 for a newly unlocked type', () => {
    expect(getTierForChallenge(1, 'noteReading')).toBe(1);
  });

  it('returns tier 2 after 10 floors active', () => {
    expect(getTierForChallenge(11, 'noteReading')).toBe(2);
  });

  it('returns tier 3 after 25 floors active', () => {
    expect(getTierForChallenge(26, 'noteReading')).toBe(3);
  });
});

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
      expect([1, 2, 3]).toContain(round.tier);
    }
  });
});

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
});

describe('getEnemySubtypesForFloor', () => {
  it('always includes ghost', () => {
    expect(getEnemySubtypesForFloor(1)).toContain('ghost');
    expect(getEnemySubtypesForFloor(50)).toContain('ghost');
  });

  it('includes slime and bat on floor 1 (noteReading + dynamics unlocked)', () => {
    const subtypes = getEnemySubtypesForFloor(1);
    expect(subtypes).toContain('slime');
    expect(subtypes).toContain('bat');
  });

  it('includes wraith on floor 6 (tempo unlocked)', () => {
    const subtypes = getEnemySubtypesForFloor(6);
    expect(subtypes).toContain('wraith');
  });

  it('includes all subtypes by floor 26', () => {
    const subtypes = getEnemySubtypesForFloor(26);
    expect(subtypes).toContain('ghost');
    expect(subtypes).toContain('slime');
    expect(subtypes).toContain('bat');
    expect(subtypes).toContain('wraith');
    expect(subtypes).toContain('spider');
    expect(subtypes).toContain('skeleton');
    expect(subtypes).toContain('shade');
    expect(subtypes).toContain('goblin');
  });
});
