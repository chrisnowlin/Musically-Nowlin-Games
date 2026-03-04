import React, { createContext, useContext, useState, useCallback } from 'react';
import type { VocabEntry } from './logic/vocabData';
import type { CustomQuestion } from './challenges/CustomChallenge';

interface PoolVocabEntry {
  id: number;
  term: string;
  definition: string;
  symbol: string | null;
  tier: number;
  category: string;
  format: string | null;
}

interface PoolData {
  id: number;
  name: string;
  useDefaults: boolean;
  vocabEntries: PoolVocabEntry[];
  customQuestions: CustomQuestion[];
}

interface TeacherPoolContextValue {
  pool: PoolData | null;
  loading: boolean;
  error: string | null;
  joinPool: (gameCode: string) => Promise<boolean>;
  leavePool: () => void;
}

const TeacherPoolContext = createContext<TeacherPoolContextValue>({
  pool: null,
  loading: false,
  error: null,
  joinPool: async () => false,
  leavePool: () => {},
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const TeacherPoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinPool = useCallback(async (gameCode: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/pools/join/${gameCode.toUpperCase()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Invalid game code' }));
        setError(err.error || 'Failed to join');
        setPool(null);
        return false;
      }
      const data = await res.json();
      setPool(data);
      return true;
    } catch {
      setError('Could not connect to server');
      setPool(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const leavePool = useCallback(() => {
    setPool(null);
    setError(null);
  }, []);

  return (
    <TeacherPoolContext.Provider value={{ pool, loading, error, joinPool, leavePool }}>
      {children}
    </TeacherPoolContext.Provider>
  );
};

export function useTeacherPool() {
  return useContext(TeacherPoolContext);
}

/** Convert pool vocab entries to the VocabEntry type used by VocabularyChallenge */
export function poolVocabToEntries(poolEntries: PoolVocabEntry[]): VocabEntry[] {
  return poolEntries.map((e) => ({
    term: e.term,
    definition: e.definition,
    symbol: e.symbol ?? undefined,
    tier: e.tier as 1 | 2 | 3 | 4 | 5,
    category: e.category as VocabEntry['category'],
    format: (e.format as VocabEntry['format']) ?? undefined,
  }));
}
