/**
 * Hook for Sight Reading Randomizer state management
 * Extends useRhythmRandomizer with pitch generation for sight reading exercises
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRhythmRandomizer } from './useRhythmRandomizer';
import { useAudioService } from './useAudioService';
import { RhythmSettings, RhythmPattern, SoundOption } from '@/lib/rhythmRandomizer/types';
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

// Pitched instruments that use Philharmonia samples
const PITCHED_INSTRUMENTS: SoundOption[] = ['clarinet'];

// Sample paths for pitched instruments
const INSTRUMENT_SAMPLE_PATHS: Record<string, string> = {
  clarinet: '/audio/philharmonia/woodwinds/clarinet',
};

/**
 * Convert pitch to Philharmonia note format
 */
function pitchToPhilharmoniaNote(pitch: string): string {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 'C4';
  const [, note, accidental, octave] = match;
  if (accidental === '#') return `${note}s${octave}`;
  if (accidental === 'b') {
    const flatToSharp: Record<string, string> = {
      'Db': 'Cs', 'Eb': 'Ds', 'Gb': 'Fs', 'Ab': 'Gs', 'Bb': 'As',
      'Fb': 'E', 'Cb': 'B'
    };
    const converted = flatToSharp[`${note}b`];
    return converted ? `${converted}${octave}` : `${note}${octave}`;
  }
  return `${note}${octave}`;
}

/**
 * Get instrument dynamic based on instrument type
 */
function getInstrumentDynamic(instrument: SoundOption): string {
  if (instrument === 'clarinet') return 'forte';
  return 'mezzo-forte';
}

/**
 * Build sample URLs for preloading
 */
function buildSampleUrlsForPreload(instrument: SoundOption, pitches: string[]): string[] {
  const basePath = INSTRUMENT_SAMPLE_PATHS[instrument];
  if (!basePath) return [];

  const dynamic = getInstrumentDynamic(instrument);
  const durations = ['025', '05', '1'];

  const urls: string[] = [];
  for (const pitch of pitches) {
    const philNote = pitchToPhilharmoniaNote(pitch);
    for (const duration of durations) {
      urls.push(`${basePath}/${instrument}_${philNote}_${duration}_${dynamic}_normal.mp3`);
    }
  }
  return urls;
}

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
  const { audio } = useAudioService();
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

  // Preload samples when a pitched instrument is selected
  useEffect(() => {
    const sound = rhythmRandomizer.settings.sound;
    if (!audio || !PITCHED_INSTRUMENTS.includes(sound)) return;

    // Get pitches to preload - use allowed pitches or diatonic pitches in range
    const pitchesToPreload = sightReadingSettings.allowedPitches.length > 0
      ? sightReadingSettings.allowedPitches
      : getDiatonicPitchesInRange(sightReadingSettings.keySignature, sightReadingSettings.pitchRange);

    if (pitchesToPreload.length === 0) return;

    // Build sample URLs and preload them
    const sampleUrls = buildSampleUrlsForPreload(sound, pitchesToPreload);
    audio.preloadSamples(sampleUrls).catch(() => {
      // Preloading may fail before user gesture - that's okay
    });
  }, [rhythmRandomizer.settings.sound, sightReadingSettings.allowedPitches, sightReadingSettings.keySignature, audio]);

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
