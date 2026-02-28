import { describe, it, expect } from 'vitest';
import { getBossChallengeConfig, generateBigBossSequence } from '../challengeHelpers';

describe('getBossChallengeConfig', () => {
  it('previews rhythmTap when only noteReading is available (floor <= 5)', () => {
    const config = getBossChallengeConfig(5);
    expect(config.standardTypes).toEqual(['noteReading']);
    expect(config.previewTypes).toEqual(['rhythmTap']);
    expect(config.previewDifficulty).toBe('easy');
  });

  it('previews interval when noteReading+rhythmTap are available (floor 6-10)', () => {
    const config = getBossChallengeConfig(10);
    expect(config.standardTypes).toEqual(['noteReading', 'rhythmTap']);
    expect(config.previewTypes).toEqual(['interval']);
    expect(config.previewDifficulty).toBe('easy');
  });

  it('uses hard difficulty when all types are unlocked (floor 11+)', () => {
    const config = getBossChallengeConfig(20);
    expect(config.standardTypes).toEqual(['noteReading', 'rhythmTap', 'interval']);
    expect(config.previewTypes).toEqual(['noteReading', 'rhythmTap', 'interval']);
    expect(config.previewDifficulty).toBe('hard');
  });
});

describe('generateBigBossSequence', () => {
  it('produces exactly 8 rounds', () => {
    const seq = generateBigBossSequence(10, 'easy');
    expect(seq.length).toBe(8);
  });

  it('contains 2 preview questions for floor 10', () => {
    const seq = generateBigBossSequence(10, 'easy');
    const previews = seq.filter(r => r.type === 'interval');
    expect(previews.length).toBe(2);
    expect(previews.every(r => r.difficulty === 'easy')).toBe(true);
  });

  it('contains 6 standard questions for floor 10', () => {
    const seq = generateBigBossSequence(10, 'medium');
    const standards = seq.filter(r => r.type !== 'interval');
    expect(standards.length).toBe(6);
    expect(standards.every(r => r.difficulty === 'medium')).toBe(true);
  });
});
