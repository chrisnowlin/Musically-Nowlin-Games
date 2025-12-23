/**
 * Hook for Sight Reading Randomizer state management
 * Extends useRhythmRandomizer with pitch generation for sight reading exercises
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRhythmRandomizer } from './useRhythmRandomizer';
import { RhythmSettings, RhythmPattern } from '@/lib/rhythmRandomizer/types';
import { generateRhythmPattern } from '@/lib/rhythmRandomizer/rhythmGenerator';
import {
  SightReadingSettings,
  DEFAULT_SIGHT_READING_SETTINGS,
  TREBLE_CLEF_RANGE,
  BASS_CLEF_RANGE,
  assignPitchesToPattern,
  getDiatonicPitchesInRange,
  getVexFlowKeySignature,
} from '@/lib/sightReadingRandomizer';

// Sight reading specific default overrides for rhythm settings
const SIGHT_READING_RHYTHM_DEFAULTS: Partial<RhythmSettings> = {
  staffLineMode: 'full',
  clef: 'treble',
  sound: 'piano',
};

export interface UseSightReadingRandomizerReturn {
  settings: RhythmSettings;
  pattern: RhythmPattern | null;
  ensemblePattern: ReturnType<typeof useRhythmRandomizer>['ensemblePattern'];
  playbackState: ReturnType<typeof useRhythmRandomizer>['playbackState'];
  isReady: boolean;
  volume: number;
  startMeasure: number;

  generate: () => void;
  play: (startFromMeasure?: number) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  setStartMeasure: (measure: number) => void;
  playMetronome: () => Promise<void>;
  stopMetronome: () => void;

  regenerateEnsemblePart: (partIndex: number) => void;
  toggleEnsemblePartMute: (partIndex: number) => void;
  toggleEnsemblePartSolo: (partIndex: number) => void;
  updateEnsemblePartSound: ReturnType<typeof useRhythmRandomizer>['updateEnsemblePartSound'];

  updateSetting: <K extends keyof RhythmSettings>(key: K, value: RhythmSettings[K]) => void;
  updateSettings: (updates: Partial<RhythmSettings>) => void;
  applyPreset: ReturnType<typeof useRhythmRandomizer>['applyPreset'];

  sightReadingSettings: SightReadingSettings;
  updateSightReadingSetting: <K extends keyof SightReadingSettings>(key: K, value: SightReadingSettings[K]) => void;
  vexflowKeySignature: string;
}

export function useSightReadingRandomizer(): UseSightReadingRandomizerReturn {
  const rhythmRandomizer = useRhythmRandomizer();
  const hasInitialized = useRef(false);

  // Sight reading specific settings
  const [sightReadingSettings, setSightReadingSettings] = useState<SightReadingSettings>(
    DEFAULT_SIGHT_READING_SETTINGS
  );

  // The pitched pattern - this is the single source of truth for display AND playback
  const [pitchedPattern, setPitchedPattern] = useState<RhythmPattern | null>(null);

  // Ref for synchronous access during playback
  const pitchedPatternRef = useRef<RhythmPattern | null>(null);

  // Apply sight reading defaults on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      rhythmRandomizer.updateSettings(SIGHT_READING_RHYTHM_DEFAULTS);
    }
  }, []);

  // Update pitch range when clef changes
  useEffect(() => {
    const newRange = rhythmRandomizer.settings.clef === 'bass' ? BASS_CLEF_RANGE : TREBLE_CLEF_RANGE;
    setSightReadingSettings(prev => ({
      ...prev,
      pitchRange: newRange,
      allowedPitches: getDiatonicPitchesInRange(prev.keySignature, newRange),
    }));
  }, [rhythmRandomizer.settings.clef]);

  // Get VexFlow-formatted key signature
  const vexflowKeySignature = useMemo(() => {
    return getVexFlowKeySignature(sightReadingSettings.keySignature);
  }, [sightReadingSettings.keySignature]);

  // Helper to apply pitches - uses current state directly
  const createPitchedPattern = useCallback((basePattern: RhythmPattern, settings: SightReadingSettings): RhythmPattern => {
    const mergedSettings: SightReadingSettings = {
      ...settings,
      allowedPitches: settings.allowedPitches.length > 0
        ? settings.allowedPitches
        : getDiatonicPitchesInRange(settings.keySignature, settings.pitchRange),
    };
    return assignPitchesToPattern(basePattern, mergedSettings);
  }, []);

  // Generate new pattern with pitches applied immediately
  const generate = useCallback(() => {
    try {
      // Generate base rhythm pattern directly (not via rhythmRandomizer.generate)
      const basePattern = generateRhythmPattern(rhythmRandomizer.settings);

      // Apply pitches immediately
      const patternWithPitches = createPitchedPattern(basePattern, sightReadingSettings);

      // Update both state and ref synchronously
      pitchedPatternRef.current = patternWithPitches;
      setPitchedPattern(patternWithPitches);

      // Also set in rhythmRandomizer for compatibility
      rhythmRandomizer.setPattern(patternWithPitches);
    } catch (error) {
      console.error('Failed to generate pattern:', error);
    }
  }, [rhythmRandomizer.settings, sightReadingSettings, createPitchedPattern, rhythmRandomizer]);

  // Update sight reading setting
  const updateSightReadingSetting = useCallback(<K extends keyof SightReadingSettings>(
    key: K,
    value: SightReadingSettings[K]
  ) => {
    setSightReadingSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Re-apply pitches when sight reading settings change (key, difficulty, notes)
  useEffect(() => {
    if (!pitchedPattern) return;

    // Strip existing pitches and re-apply with new settings
    const basePattern: RhythmPattern = {
      ...pitchedPattern,
      measures: pitchedPattern.measures.map(m => ({
        ...m,
        events: m.events.map(e => {
          if (e.type === 'note') {
            const { pitch, vexflowKey, ...rest } = e;
            return rest as typeof e;
          }
          return e;
        })
      }))
    };

    try {
      const newPitchedPattern = createPitchedPattern(basePattern, sightReadingSettings);
      pitchedPatternRef.current = newPitchedPattern;
      setPitchedPattern(newPitchedPattern);
      rhythmRandomizer.setPattern(newPitchedPattern);
    } catch (error) {
      console.error('Failed to re-apply pitches:', error);
    }
  }, [sightReadingSettings.keySignature, sightReadingSettings.melodicDifficulty, sightReadingSettings.allowedPitches, sightReadingSettings.tonicGravity]);

  // Play using the pitched pattern from ref (always up-to-date)
  const play = useCallback(async (startFromMeasure?: number) => {
    const patternToPlay = pitchedPatternRef.current;
    if (patternToPlay) {
      await rhythmRandomizer.play(startFromMeasure, patternToPlay);
    }
  }, [rhythmRandomizer]);

  return {
    settings: rhythmRandomizer.settings,
    pattern: pitchedPattern,
    ensemblePattern: rhythmRandomizer.ensemblePattern,
    playbackState: rhythmRandomizer.playbackState,
    isReady: rhythmRandomizer.isReady,
    volume: rhythmRandomizer.volume,
    startMeasure: rhythmRandomizer.startMeasure,

    generate,
    play,
    stop: rhythmRandomizer.stop,
    pause: rhythmRandomizer.pause,
    resume: rhythmRandomizer.resume,
    setVolume: rhythmRandomizer.setVolume,
    setStartMeasure: rhythmRandomizer.setStartMeasure,
    playMetronome: rhythmRandomizer.playMetronome,
    stopMetronome: rhythmRandomizer.stopMetronome,

    regenerateEnsemblePart: rhythmRandomizer.regenerateEnsemblePart,
    toggleEnsemblePartMute: rhythmRandomizer.toggleEnsemblePartMute,
    toggleEnsemblePartSolo: rhythmRandomizer.toggleEnsemblePartSolo,
    updateEnsemblePartSound: rhythmRandomizer.updateEnsemblePartSound,

    updateSetting: rhythmRandomizer.updateSetting,
    updateSettings: rhythmRandomizer.updateSettings,
    applyPreset: rhythmRandomizer.applyPreset,

    sightReadingSettings,
    updateSightReadingSetting,
    vexflowKeySignature,
  };
}
