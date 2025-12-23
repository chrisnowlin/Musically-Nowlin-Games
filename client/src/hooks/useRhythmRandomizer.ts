/**
 * Hook for Rhythm Randomizer state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioService } from './useAudioService';
import {
  RhythmSettings,
  RhythmPattern,
  PlaybackState,
  EnsemblePattern,
  EnsemblePart,
  DifficultyPreset,
  SoundOption,
  BodyPercussionPart,
  DEFAULT_SETTINGS,
  DIFFICULTY_PRESETS,
  INITIAL_PLAYBACK_STATE,
} from '@/lib/rhythmRandomizer/types';

// Sound parameters for different instrument options
// isTonal: if true, sound duration matches note length; if false, uses short percussion hit
const SOUND_PARAMS: Record<SoundOption, { note: number; accent: number; minDuration: number; isTonal: boolean }> = {
  woodblock: { note: 800, accent: 1000, minDuration: 0.08, isTonal: false },
  drums: { note: 150, accent: 200, minDuration: 0.15, isTonal: false },
  claps: { note: 1200, accent: 1500, minDuration: 0.05, isTonal: false },
  piano: { note: 440, accent: 523, minDuration: 0.1, isTonal: true },
  metronome: { note: 1000, accent: 1200, minDuration: 0.05, isTonal: false },
};

// Body percussion sound parameters - distinct frequencies for each body part
const BODY_PERCUSSION_SOUNDS: Record<BodyPercussionPart, { note: number; accent: number; minDuration: number }> = {
  stomp: { note: 80, accent: 100, minDuration: 0.2 },    // Low bass thump
  pat: { note: 200, accent: 250, minDuration: 0.12 },     // Low-mid thigh pat
  clap: { note: 1000, accent: 1200, minDuration: 0.08 },  // High sharp clap
  snap: { note: 2000, accent: 2400, minDuration: 0.05 },  // Very high crisp snap
};

function getSoundParams(
  sound: SoundOption,
  noteDurationSeconds: number,
  isAccented?: boolean
): { frequency: number; duration: number } {
  const params = SOUND_PARAMS[sound] || SOUND_PARAMS.woodblock;

  // For tonal sounds (piano), use the full note duration
  // For percussion sounds, use the minimum duration (short hit)
  const duration = params.isTonal
    ? Math.max(params.minDuration, noteDurationSeconds * 0.9) // 90% of note length to avoid overlap
    : params.minDuration;

  return {
    frequency: isAccented ? params.accent : params.note,
    duration,
  };
}

function getBodyPercussionSoundParams(
  bodyPart: BodyPercussionPart,
  isAccented?: boolean
): { frequency: number; duration: number } {
  const params = BODY_PERCUSSION_SOUNDS[bodyPart];
  return {
    frequency: isAccented ? params.accent : params.note,
    duration: params.minDuration,
  };
}
import { generateRhythmPattern, getPatternDurationMs } from '@/lib/rhythmRandomizer/rhythmGenerator';
import { expandBeamedGroups } from '@/lib/rhythmRandomizer/rhythmNotation';
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
  const playbackTimeoutsRef = useRef<Set<number>>(new Set());
  const playbackStartTimeRef = useRef<number>(0);

  // Audio hook
  const { audio, isReady, initialize } = useAudioService();

  // Helper to schedule a timeout and track it for cleanup
  const scheduleTimeout = useCallback((callback: () => void, delay: number): number => {
    const id = window.setTimeout(() => {
      playbackTimeoutsRef.current.delete(id);
      callback();
    }, delay);
    playbackTimeoutsRef.current.add(id);
    return id;
  }, []);

  // Clear all playback timeouts
  const clearPlaybackTimeouts = useCallback(() => {
    playbackTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    playbackTimeoutsRef.current.clear();
  }, []);

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

  /**
   * Schedule playback for a single pattern
   * Returns the end time in ms
   */
  const schedulePatternPlayback = useCallback((
    patternToPlay: RhythmPattern,
    startTimeMs: number,
    msPerBeat: number,
    soundToUse: SoundOption,
    partIndex: number = -1,
    bodyPart?: BodyPercussionPart
  ): number => {
    let currentTime = startTimeMs;
    let eventIndex = 0;

    for (let m = 0; m < patternToPlay.measures.length; m++) {
      const measure = patternToPlay.measures[m];
      let beatInMeasure = 0;

      // Expand beamed groups into individual notes for playback
      const expandedEvents = expandBeamedGroups(measure.events);

      for (const event of expandedEvents) {
        const eventTime = currentTime;
        const currentEventIdx = eventIndex;
        const currentMeasureIdx = m;
        const currentBeatVal = beatInMeasure;
        const partIdx = partIndex;

        // Copy values to avoid closure issues
        const eventCopy = { ...event };
        const bodyPartCopy = bodyPart;
        const sound = soundToUse;
        // Calculate note duration in seconds for sound generation
        const noteDurationSeconds = (event.duration * msPerBeat) / 1000;

        scheduleTimeout(() => {
          // Update playback state
          setPlaybackState(prev => ({
            ...prev,
            currentMeasure: currentMeasureIdx,
            currentBeat: currentBeatVal,
            currentEventIndex: currentEventIdx,
            currentPartIndex: partIdx,
          }));

          // Play sound for notes
          if (eventCopy.type === 'note' && audio) {
            const vol = eventCopy.isAccented ? 0.9 : 0.7;

            // Use body percussion sound if specified, otherwise use selected sound
            const soundParams = bodyPartCopy
              ? getBodyPercussionSoundParams(bodyPartCopy, eventCopy.isAccented)
              : getSoundParams(sound, noteDurationSeconds, eventCopy.isAccented);

            audio.playNoteWithDynamics(soundParams.frequency, soundParams.duration, vol);
          }
        }, eventTime);

        currentTime += event.duration * msPerBeat;
        beatInMeasure += event.duration;
        eventIndex++;
      }
    }

    return currentTime;
  }, [audio, scheduleTimeout]);

  /**
   * Check if a part should be audible based on mute/solo states
   */
  const isPartAudible = useCallback((part: EnsemblePart, allParts: EnsemblePart[]): boolean => {
    // If part is muted, it's not audible
    if (part.isMuted) return false;

    // If any part is soloed, only soloed parts are audible
    const hasSoloedPart = allParts.some(p => p.isSoloed);
    if (hasSoloedPart) {
      return part.isSoloed;
    }

    // Otherwise, part is audible
    return true;
  }, []);

  // Play the pattern (single or ensemble)
  const play = useCallback(async () => {
    // For ensemble mode, we need ensemblePattern; for single mode, we need pattern
    const isEnsembleMode = settings.ensembleMode !== 'single' && ensemblePattern;

    if (!isEnsembleMode && !pattern) return;
    if (isEnsembleMode && (!ensemblePattern || ensemblePattern.parts.length === 0)) return;

    try {
      // Clear any existing timeouts
      clearPlaybackTimeouts();

      await initialize();

      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        currentMeasure: 0,
        currentBeat: 0,
        currentEventIndex: 0,
        currentPartIndex: -1,
      }));

      playbackStartTimeRef.current = Date.now();

      // Calculate timing
      const msPerBeat = 60000 / settings.tempo;
      let currentTime = 0;

      // Count-in
      if (settings.countInMeasures > 0) {
        const countInBeats = settings.countInMeasures * 4; // Assuming 4/4 for simplicity
        const countInBeatDurationSeconds = msPerBeat / 1000;
        for (let i = 0; i < countInBeats; i++) {
          const beatTime = currentTime;
          const isFirstBeat = i % 4 === 0; // Accent first beat of measure
          scheduleTimeout(() => {
            if (audio) {
              // Use metronome sound for count-in
              const clickParams = getSoundParams('metronome', countInBeatDurationSeconds, isFirstBeat);
              audio.playNoteWithDynamics(clickParams.frequency, clickParams.duration, 0.6);
            }
          }, beatTime);
          currentTime += msPerBeat;
        }
      }

      let totalDuration = currentTime;

      if (isEnsembleMode && ensemblePattern) {
        // ENSEMBLE PLAYBACK
        const mode = ensemblePattern.mode;
        const parts = ensemblePattern.parts;

        if (mode === 'callResponse') {
          // CALL & RESPONSE: Parts play sequentially
          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex];

            if (isPartAudible(part, parts)) {
              totalDuration = schedulePatternPlayback(
                part.pattern,
                totalDuration,
                msPerBeat,
                settings.sound,
                partIndex,
                part.bodyPart
              );
            } else {
              // Even if muted, advance time for the part duration
              totalDuration += part.pattern.totalDurationBeats * msPerBeat;
            }

            // For call & response, update part index at start of each part
            const startTime = partIndex === 0 ? currentTime : totalDuration - (part.pattern.totalDurationBeats * msPerBeat);
            const pIdx = partIndex;
            scheduleTimeout(() => {
              setPlaybackState(prev => ({
                ...prev,
                currentPartIndex: pIdx,
              }));
            }, startTime);
          }
        } else {
          // LAYERED / BODY PERCUSSION: All parts play simultaneously
          let maxEndTime = currentTime;

          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex];

            if (isPartAudible(part, parts)) {
              const endTime = schedulePatternPlayback(
                part.pattern,
                currentTime,
                msPerBeat,
                settings.sound,
                partIndex,
                part.bodyPart
              );
              maxEndTime = Math.max(maxEndTime, endTime);
            }
          }

          // For simultaneous playback, show all parts as active (-1 means "all")
          // We'll set currentPartIndex to 0 but the UI should show all parts as playing
          scheduleTimeout(() => {
            setPlaybackState(prev => ({
              ...prev,
              currentPartIndex: 0,
            }));
          }, currentTime);

          totalDuration = maxEndTime;
        }
      } else if (pattern) {
        // SINGLE PATTERN PLAYBACK
        totalDuration = schedulePatternPlayback(
          pattern,
          currentTime,
          msPerBeat,
          settings.sound,
          -1
        );
      }

      // Schedule end of playback
      const shouldLoop = settings.loopEnabled;

      scheduleTimeout(() => {
        if (shouldLoop) {
          // Restart playback
          play();
        } else {
          setPlaybackState(INITIAL_PLAYBACK_STATE);
        }
      }, totalDuration);

    } catch (error) {
      console.error('Playback error:', error);
      setPlaybackState(INITIAL_PLAYBACK_STATE);
    }
  }, [pattern, ensemblePattern, settings, audio, initialize, scheduleTimeout, clearPlaybackTimeouts, schedulePatternPlayback, isPartAudible]);

  // Stop playback
  const stop = useCallback(() => {
    clearPlaybackTimeouts();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(INITIAL_PLAYBACK_STATE);
  }, [audio, clearPlaybackTimeouts]);

  // Pause playback
  const pause = useCallback(() => {
    clearPlaybackTimeouts();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
      elapsedTime: Date.now() - playbackStartTimeRef.current,
    }));
  }, [audio, clearPlaybackTimeouts]);

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
      clearPlaybackTimeouts();
      if (audio) {
        audio.stopAll();
      }
    };
  }, [clearPlaybackTimeouts, audio]);

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
