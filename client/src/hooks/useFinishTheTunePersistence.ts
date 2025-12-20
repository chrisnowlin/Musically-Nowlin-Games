import { useEffect, useCallback, useRef } from 'react';
import type { FinishTheTuneState, PersistedState } from '@/components/finish-the-tune/types';

const STORAGE_KEY = 'finish-the-tune-progress';
const SAVE_DEBOUNCE_MS = 1000;

/**
 * Hook for persisting Finish the Tune game progress to localStorage
 */
export function useFinishTheTunePersistence(
  state: FinishTheTuneState,
  onLoadSavedState: (savedState: Partial<PersistedState>) => void
) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState: PersistedState = JSON.parse(saved);
        onLoadSavedState(parsedState);
      }
    } catch (error) {
      console.warn('Failed to load saved game state:', error);
    }
  }, [onLoadSavedState]);

  // Save state when relevant fields change (debounced)
  const saveState = useCallback(() => {
    const stateToSave: PersistedState = {
      highScore: state.highScore,
      bestStreak: state.bestStreak,
      achievements: state.achievements,
      completedMelodies: Array.from(state.completedMelodies),
      settings: {
        difficulty: state.difficulty,
        playbackSpeed: state.playbackSpeed,
        autoPlay: state.autoPlay,
        volume: state.volume,
        loopMelody: state.loopMelody,
        showNoteNames: state.showNoteNames,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }, [
    state.highScore,
    state.bestStreak,
    state.achievements,
    state.completedMelodies,
    state.difficulty,
    state.playbackSpeed,
    state.autoPlay,
    state.volume,
    state.loopMelody,
    state.showNoteNames,
  ]);

  // Debounced save effect
  useEffect(() => {
    // Skip initial save
    if (!hasLoadedRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule save
    saveTimeoutRef.current = setTimeout(saveState, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveState]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Immediate save on unmount
      saveState();
    };
  }, [saveState]);

  return {
    saveState,
    clearSavedState: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear saved game state:', error);
      }
    },
  };
}

export default useFinishTheTunePersistence;
