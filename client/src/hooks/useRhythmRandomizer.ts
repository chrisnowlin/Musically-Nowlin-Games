/**
 * Hook for Rhythm Randomizer state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioService } from './useAudioService';
import { useGameCleanup } from './useGameCleanup';
import {
  RhythmSettings,
  RhythmPattern,
  PlaybackState,
  EnsemblePattern,
  DifficultyPreset,
  DEFAULT_SETTINGS,
  DIFFICULTY_PRESETS,
  INITIAL_PLAYBACK_STATE,
} from '@/lib/rhythmRandomizer/types';
import { generateRhythmPattern, getPatternDurationMs } from '@/lib/rhythmRandomizer/rhythmGenerator';
import {
  generateEnsemblePattern,
  regeneratePart,
  togglePartMute,
  togglePartSolo,
} from '@/lib/rhythmRandomizer/ensembleGenerator';

interface UseRhythmRandomizerReturn {
  // State
  settings: RhythmSettings;
  pattern: RhythmPattern | null;
  ensemblePattern: EnsemblePattern | null;
  playbackState: PlaybackState;
  isReady: boolean;
  volume: number;

  // Actions
  generate: () => void;
  play: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;

  // Ensemble Actions
  regenerateEnsemblePart: (partIndex: number) => void;
  toggleEnsemblePartMute: (partIndex: number) => void;
  toggleEnsemblePartSolo: (partIndex: number) => void;

  // Settings
  updateSetting: <K extends keyof RhythmSettings>(key: K, value: RhythmSettings[K]) => void;
  updateSettings: (updates: Partial<RhythmSettings>) => void;
  applyPreset: (preset: DifficultyPreset) => void;
  resetSettings: () => void;
}

export function useRhythmRandomizer(): UseRhythmRandomizerReturn {
  // Core state
  const [settings, setSettings] = useState<RhythmSettings>(DEFAULT_SETTINGS);
  const [pattern, setPattern] = useState<RhythmPattern | null>(null);
  const [ensemblePattern, setEnsemblePattern] = useState<EnsemblePattern | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(INITIAL_PLAYBACK_STATE);
  const [volume, setVolumeState] = useState<number>(0.7);

  // Refs for playback timing
  const playbackTimeoutRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);

  // Audio and cleanup hooks
  const { audio, isReady, initialize } = useAudioService();
  const { setTimeout: safeSetTimeout, clearAll } = useGameCleanup();

  // Generate new pattern (single or ensemble)
  const generate = useCallback(() => {
    try {
      // Reset playback state when generating new pattern
      setPlaybackState(INITIAL_PLAYBACK_STATE);

      if (settings.ensembleMode === 'single') {
        // Generate single pattern
        const newPattern = generateRhythmPattern(settings);
        setPattern(newPattern);
        setEnsemblePattern(null);
      } else {
        // Generate ensemble pattern
        const newEnsemble = generateEnsemblePattern(
          settings,
          settings.ensembleMode,
          settings.partCount
        );
        setEnsemblePattern(newEnsemble);
        // Also set the first part as the main pattern for fallback
        if (newEnsemble && newEnsemble.parts.length > 0) {
          setPattern(newEnsemble.parts[0].pattern);
        }
      }
    } catch (error) {
      console.error('Failed to generate rhythm pattern:', error);
    }
  }, [settings]);

  // Play the pattern
  const play = useCallback(async () => {
    if (!pattern || !isReady) return;

    try {
      await initialize();

      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        currentMeasure: 0,
        currentBeat: 0,
        currentEventIndex: 0,
      }));

      playbackStartTimeRef.current = Date.now();

      // Calculate timing for each event
      const msPerBeat = 60000 / settings.tempo;
      let currentTime = 0;

      // Count-in
      if (settings.countInMeasures > 0) {
        const countInBeats = settings.countInMeasures * 4; // Assuming 4/4 for simplicity
        for (let i = 0; i < countInBeats; i++) {
          const beatTime = currentTime;
          safeSetTimeout(() => {
            if (audio) {
              audio.playNote(800, 0.1); // Click sound
            }
          }, beatTime);
          currentTime += msPerBeat;
        }
      }

      // Schedule pattern events
      let eventIndex = 0;
      for (let m = 0; m < pattern.measures.length; m++) {
        const measure = pattern.measures[m];
        let beatInMeasure = 0;

        for (const event of measure.events) {
          const eventTime = currentTime;
          const currentEventIdx = eventIndex;
          const currentMeasureIdx = m;
          const currentBeatVal = beatInMeasure;

          safeSetTimeout(() => {
            // Update playback state
            setPlaybackState(prev => ({
              ...prev,
              currentMeasure: currentMeasureIdx,
              currentBeat: currentBeatVal,
              currentEventIndex: currentEventIdx,
            }));

            // Play sound for notes
            if (event.type === 'note' && audio) {
              const volume = event.isAccented ? 0.9 : 0.7;
              // Use a drum-like frequency
              audio.playNoteWithDynamics(200, event.duration * msPerBeat / 1000, volume);
            }
          }, eventTime);

          currentTime += event.duration * msPerBeat;
          beatInMeasure += event.duration;
          eventIndex++;
        }
      }

      // Schedule end of playback
      const totalDuration = getPatternDurationMs(pattern) +
        (settings.countInMeasures * 4 * msPerBeat);

      safeSetTimeout(() => {
        if (settings.loopEnabled) {
          // Restart playback
          play();
        } else {
          setPlaybackState(prev => ({
            ...prev,
            isPlaying: false,
            currentMeasure: 0,
            currentBeat: 0,
            currentEventIndex: 0,
          }));
        }
      }, totalDuration);

    } catch (error) {
      console.error('Playback error:', error);
      setPlaybackState(INITIAL_PLAYBACK_STATE);
    }
  }, [pattern, isReady, settings, audio, initialize, safeSetTimeout]);

  // Stop playback
  const stop = useCallback(() => {
    clearAll();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(INITIAL_PLAYBACK_STATE);
  }, [audio, clearAll]);

  // Pause playback
  const pause = useCallback(() => {
    clearAll();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
      elapsedTime: Date.now() - playbackStartTimeRef.current,
    }));
  }, [audio, clearAll]);

  // Resume playback (simplified - just restarts for now)
  const resume = useCallback(() => {
    if (playbackState.isPaused) {
      play();
    }
  }, [playbackState.isPaused, play]);

  // Update single setting
  const updateSetting = useCallback(<K extends keyof RhythmSettings>(
    key: K,
    value: RhythmSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((updates: Partial<RhythmSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Apply difficulty preset
  const applyPreset = useCallback((preset: DifficultyPreset) => {
    const presetSettings = DIFFICULTY_PRESETS[preset];
    setSettings(prev => ({ ...prev, ...presetSettings }));
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
    if (audio) {
      audio.setVolume(newVolume);
    }
  }, [audio]);

  // Ensemble: Regenerate a single part
  const regenerateEnsemblePart = useCallback((partIndex: number) => {
    if (!ensemblePattern) return;
    const updated = regeneratePart(ensemblePattern, partIndex);
    setEnsemblePattern(updated);
  }, [ensemblePattern]);

  // Ensemble: Toggle mute on a part
  const toggleEnsemblePartMute = useCallback((partIndex: number) => {
    if (!ensemblePattern) return;
    const updated = togglePartMute(ensemblePattern, partIndex);
    setEnsemblePattern(updated);
  }, [ensemblePattern]);

  // Ensemble: Toggle solo on a part
  const toggleEnsemblePartSolo = useCallback((partIndex: number) => {
    if (!ensemblePattern) return;
    const updated = togglePartSolo(ensemblePattern, partIndex);
    setEnsemblePattern(updated);
  }, [ensemblePattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    settings,
    pattern,
    ensemblePattern,
    playbackState,
    isReady,
    volume,
    generate,
    play,
    stop,
    pause,
    resume,
    setVolume,
    regenerateEnsemblePart,
    toggleEnsemblePartMute,
    toggleEnsemblePartSolo,
    updateSetting,
    updateSettings,
    applyPreset,
    resetSettings,
  };
}
