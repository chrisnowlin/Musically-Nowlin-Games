import { describe, it, expect } from 'vitest';
import { getVocabEntries, getAllVocabEntries } from '../logic/vocabData';
import type { VocabCategory } from '../logic/vocabData';
import type { Tier } from '../logic/dungeonTypes';

const CATEGORIES: VocabCategory[] = ['dynamics', 'tempo', 'symbols', 'terms'];
const TIERS: Tier[] = [1, 2, 3, 4, 5];

describe('vocabData integrity', () => {
  it('every entry has a non-empty term and definition', () => {
    for (const entry of getAllVocabEntries()) {
      expect(entry.term.length, `empty term in ${entry.category}`).toBeGreaterThan(0);
      expect(entry.definition.length, `empty definition for "${entry.term}"`).toBeGreaterThan(0);
    }
  });

  it('no duplicate terms within the same category', () => {
    for (const cat of CATEGORIES) {
      const entries = getVocabEntries(cat, 5);
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

  it('every entry has a valid tier (1, 2, 3, 4, or 5)', () => {
    for (const entry of getAllVocabEntries()) {
      expect([1, 2, 3, 4, 5]).toContain(entry.tier);
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

  it('each tier within each category has at least 2 entries', () => {
    for (const cat of CATEGORIES) {
      for (const tier of TIERS) {
        const entries = getAllVocabEntries().filter((e) => e.category === cat && e.tier === tier);
        expect(entries.length, `${cat} tier ${tier} has fewer than 2 entries`).toBeGreaterThanOrEqual(2);
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

  it('tier 5 returns all entries for the category', () => {
    for (const cat of CATEGORIES) {
      const tier5 = getVocabEntries(cat, 5);
      const allInCat = getAllVocabEntries().filter((e) => e.category === cat);
      expect(tier5.length).toBe(allInCat.length);
    }
  });

  it('each category tier-1 has at least 2 entries (opposites format needs 2)', () => {
    for (const cat of CATEGORIES) {
      const entries = getVocabEntries(cat, 1);
      expect(entries.length, `${cat} tier 1 has fewer than 2 entries`).toBeGreaterThanOrEqual(2);
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

  it('returns at least 100 total entries', () => {
    expect(getAllVocabEntries().length).toBeGreaterThanOrEqual(100);
  });
});

describe('format field', () => {
  it('T1 dynamics entries include at least one with format opposites', () => {
    const entries = getAllVocabEntries().filter(
      (e) => e.category === 'dynamics' && e.tier === 1 && e.format === 'opposites'
    );
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('T3 dynamics entries include at least one with format ordering', () => {
    const entries = getAllVocabEntries().filter(
      (e) => e.category === 'dynamics' && e.tier === 3 && e.format === 'ordering'
    );
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('T1 tempo entries include at least one with format opposites', () => {
    const entries = getAllVocabEntries().filter(
      (e) => e.category === 'tempo' && e.tier === 1 && e.format === 'opposites'
    );
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('T3 tempo entries include at least one with format ordering', () => {
    const entries = getAllVocabEntries().filter(
      (e) => e.category === 'tempo' && e.tier === 3 && e.format === 'ordering'
    );
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('opposites format only appears in T1', () => {
    const opposites = getAllVocabEntries().filter((e) => e.format === 'opposites');
    for (const entry of opposites) {
      expect(entry.tier, `opposites format in tier ${entry.tier} for "${entry.term}"`).toBe(1);
    }
  });

  it('ordering format only appears in T3', () => {
    const ordering = getAllVocabEntries().filter((e) => e.format === 'ordering');
    for (const entry of ordering) {
      expect(entry.tier, `ordering format in tier ${entry.tier} for "${entry.term}"`).toBe(3);
    }
  });
});
