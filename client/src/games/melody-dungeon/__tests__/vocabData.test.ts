import { describe, it, expect } from 'vitest';
import { getVocabEntries, getAllVocabEntries } from '../logic/vocabData';
import type { VocabCategory, VocabEntry } from '../logic/vocabData';
import type { Tier } from '../logic/dungeonTypes';

const CATEGORIES: VocabCategory[] = ['dynamics', 'tempo', 'symbols', 'terms'];
const TIERS: Tier[] = [1, 2, 3];

describe('vocabData integrity', () => {
  it('every entry has a non-empty term and definition', () => {
    for (const entry of getAllVocabEntries()) {
      expect(entry.term.length, `empty term in ${entry.category}`).toBeGreaterThan(0);
      expect(entry.definition.length, `empty definition for "${entry.term}"`).toBeGreaterThan(0);
    }
  });

  it('no duplicate terms within the same category', () => {
    for (const cat of CATEGORIES) {
      const entries = getVocabEntries(cat, 3);
      const terms = entries.map((e) => e.term);
      const unique = new Set(terms);
      expect(unique.size, `duplicate term in ${cat}: ${terms.filter((t, i) => terms.indexOf(t) !== i)}`).toBe(terms.length);
    }
  });

  it('no duplicate terms across all categories', () => {
    const all = getAllVocabEntries();
    const terms = all.map((e) => e.term);
    const unique = new Set(terms);
    expect(unique.size, `cross-category duplicate: ${terms.filter((t, i) => terms.indexOf(t) !== i)}`).toBe(terms.length);
  });

  it('every entry has a valid tier (1, 2, or 3)', () => {
    for (const entry of getAllVocabEntries()) {
      expect([1, 2, 3]).toContain(entry.tier);
    }
  });

  it('every entry has a valid category', () => {
    for (const entry of getAllVocabEntries()) {
      expect(CATEGORIES).toContain(entry.category);
    }
  });

  it('each category has entries at every tier', () => {
    for (const cat of CATEGORIES) {
      for (const tier of TIERS) {
        const entries = getAllVocabEntries().filter((e) => e.category === cat && e.tier === tier);
        expect(entries.length, `${cat} tier ${tier} has no entries`).toBeGreaterThan(0);
      }
    }
  });
});

describe('getVocabEntries', () => {
  it('tier 1 returns only tier-1 entries', () => {
    const entries = getVocabEntries('dynamics', 1);
    for (const e of entries) {
      expect(e.tier).toBe(1);
      expect(e.category).toBe('dynamics');
    }
  });

  it('tier 2 returns tier 1 and 2 entries', () => {
    const entries = getVocabEntries('tempo', 2);
    for (const e of entries) {
      expect(e.tier).toBeLessThanOrEqual(2);
      expect(e.category).toBe('tempo');
    }
    expect(entries.some((e) => e.tier === 1)).toBe(true);
    expect(entries.some((e) => e.tier === 2)).toBe(true);
  });

  it('tier 3 returns all entries for the category', () => {
    for (const cat of CATEGORIES) {
      const tier3 = getVocabEntries(cat, 3);
      const allInCat = getAllVocabEntries().filter((e) => e.category === cat);
      expect(tier3.length).toBe(allInCat.length);
    }
  });

  it('each category tier-1 has at least 4 entries (for 4-button quiz)', () => {
    for (const cat of CATEGORIES) {
      const entries = getVocabEntries(cat, 1);
      expect(entries.length, `${cat} tier 1 has fewer than 4 entries`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('getAllVocabEntries', () => {
  it('returns entries from all four categories', () => {
    const all = getAllVocabEntries();
    for (const cat of CATEGORIES) {
      expect(all.some((e) => e.category === cat), `missing category ${cat}`).toBe(true);
    }
  });

  it('returns a non-trivial number of total entries', () => {
    expect(getAllVocabEntries().length).toBeGreaterThanOrEqual(40);
  });
});
