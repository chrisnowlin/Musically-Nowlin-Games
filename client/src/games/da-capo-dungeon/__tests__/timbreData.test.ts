import { describe, it, expect } from 'vitest';
import { getTimbrePool, getTimbreChoices } from '../logic/timbreData';
import type { Tier } from '../logic/dungeonTypes';
import { instrumentLibrary } from '@/common/instruments/instrumentLibrary';

const TIERS: Tier[] = [1, 2, 3, 4, 5];

describe('getTimbrePool', () => {
  it('each tier has at least 4 entries in the pool', () => {
    for (const tier of TIERS) {
      const pool = getTimbrePool(tier);
      expect(pool.length, `tier ${tier} pool too small`).toBeGreaterThanOrEqual(4);
    }
  });

  it('T1 entries have no instrumentName', () => {
    const pool = getTimbrePool(1);
    for (const entry of pool) {
      expect(entry.instrumentName, `T1 entry "${entry.id}" should not have instrumentName`).toBeUndefined();
    }
  });

  it('T2 entries have family field set', () => {
    const pool = getTimbrePool(2);
    for (const entry of pool) {
      expect(entry.family, `T2 entry "${entry.id}" should have family`).toBeDefined();
    }
  });

  it('T3 entries have instrumentName matching instrumentLibrary keys', () => {
    const pool = getTimbrePool(3);
    for (const entry of pool) {
      expect(entry.instrumentName, `T3 entry "${entry.id}" should have instrumentName`).toBeDefined();
      const instrument = instrumentLibrary.getInstrument(entry.instrumentName!);
      expect(instrument, `T3 instrument "${entry.instrumentName}" not found in library`).toBeDefined();
    }
  });

  it('T4 entries have instrumentName matching instrumentLibrary keys', () => {
    const pool = getTimbrePool(4);
    for (const entry of pool) {
      expect(entry.instrumentName, `T4 entry "${entry.id}" should have instrumentName`).toBeDefined();
      const instrument = instrumentLibrary.getInstrument(entry.instrumentName!);
      expect(instrument, `T4 instrument "${entry.instrumentName}" not found in library`).toBeDefined();
    }
  });

  it('T5 entries have instrumentName matching instrumentLibrary keys', () => {
    const pool = getTimbrePool(5);
    for (const entry of pool) {
      expect(entry.instrumentName, `T5 entry "${entry.id}" should have instrumentName`).toBeDefined();
      const instrument = instrumentLibrary.getInstrument(entry.instrumentName!);
      expect(instrument, `T5 instrument "${entry.instrumentName}" not found in library`).toBeDefined();
    }
  });

  it('no duplicate IDs within a tier', () => {
    for (const tier of TIERS) {
      const pool = getTimbrePool(tier);
      const ids = pool.map(e => e.id);
      const unique = new Set(ids);
      expect(unique.size, `duplicate ID in tier ${tier}`).toBe(ids.length);
    }
  });
});

describe('getTimbreChoices', () => {
  it('returns exactly 4 options for each tier', () => {
    for (const tier of TIERS) {
      const { options } = getTimbreChoices(tier);
      expect(options.length, `tier ${tier} should return 4 options`).toBe(4);
    }
  });

  it('includes the correct answer in the options', () => {
    for (const tier of TIERS) {
      const { correct, options } = getTimbreChoices(tier);
      const found = options.some(o => o.id === correct.id);
      expect(found, `tier ${tier} correct answer not in options`).toBe(true);
    }
  });

  it('T5: correct and at least one distractor share a family (subtle pair)', () => {
    // Run multiple times since it is random-based
    let sharedFamilyFound = false;
    for (let i = 0; i < 20; i++) {
      const { correct, options } = getTimbreChoices(5);
      const distractors = options.filter(o => o.id !== correct.id);
      const sameFamily = distractors.some(d => d.family === correct.family);
      if (sameFamily) {
        sharedFamilyFound = true;
        break;
      }
    }
    expect(sharedFamilyFound, 'T5 should produce at least one subtle pair distractor').toBe(true);
  });

  it('options have no duplicate IDs', () => {
    for (const tier of TIERS) {
      for (let i = 0; i < 5; i++) {
        const { options } = getTimbreChoices(tier);
        const ids = options.map(o => o.id);
        const unique = new Set(ids);
        expect(unique.size, `duplicate option ID in tier ${tier}`).toBe(ids.length);
      }
    }
  });
});
