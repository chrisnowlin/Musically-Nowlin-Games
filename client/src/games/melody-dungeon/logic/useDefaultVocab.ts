import { useState, useEffect } from 'react';
import { getDefaults, type VocabEntryApi } from '../teacher/api';
import { getVocabEntries as getHardcodedEntries, getAllVocabEntries as getAllHardcodedEntries, type VocabEntry, type VocabCategory } from '../logic/vocabData';
import type { Tier } from '../logic/dungeonTypes';

let cachedDefaults: VocabEntry[] | null = null;
let fetchPromise: Promise<VocabEntry[]> | null = null;

function apiEntryToVocabEntry(entry: VocabEntryApi): VocabEntry {
  return {
    term: entry.term,
    definition: entry.definition,
    symbol: entry.symbol ?? undefined,
    tier: entry.tier as Tier,
    category: entry.category as VocabCategory,
    format: (entry.format as VocabEntry['format']) ?? undefined,
  };
}

async function fetchDefaults(): Promise<VocabEntry[]> {
  if (cachedDefaults) return cachedDefaults;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const response = await getDefaults();
      if (response?.vocabEntries?.length) {
        cachedDefaults = response.vocabEntries.map(apiEntryToVocabEntry);
        return cachedDefaults;
      }
      return [];
    } catch {
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function useDefaultVocab() {
  const [defaults, setDefaults] = useState<VocabEntry[]>(() => cachedDefaults ?? []);

  useEffect(() => {
    if (cachedDefaults) return;
    fetchDefaults().then(setDefaults);
  }, []);

  return defaults;
}

export function getDefaultVocabEntriesSync(category: VocabCategory, tier: Tier): VocabEntry[] {
  if (cachedDefaults) {
    return cachedDefaults.filter((e) => e.category === category && e.tier <= tier);
  }
  return getHardcodedEntries(category, tier);
}

export function getAllDefaultVocabEntriesSync(): VocabEntry[] {
  if (cachedDefaults) {
    return cachedDefaults;
  }
  return getAllHardcodedEntries();
}

export { fetchDefaults };
