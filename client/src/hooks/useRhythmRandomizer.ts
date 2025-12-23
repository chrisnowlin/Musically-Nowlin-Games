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
// isSample: if true, uses audio samples instead of synthesized tones
const SOUND_PARAMS: Record<SoundOption, { note: number; accent: number; minDuration: number; isTonal: boolean; isSample?: boolean }> = {
  woodblock: { note: 800, accent: 1000, minDuration: 0.08, isTonal: false },
  drums: { note: 150, accent: 200, minDuration: 0.15, isTonal: false },
  claps: { note: 1200, accent: 1500, minDuration: 0.05, isTonal: false },
  piano: { note: 440, accent: 523, minDuration: 0.1, isTonal: true },
  metronome: { note: 2800, accent: 3200, minDuration: 0.02, isTonal: false }, // High metallic click
  snare: { note: 0, accent: 0, minDuration: 0.1, isTonal: false, isSample: true }, // Real snare drum samples
  clarinet: { note: 0, accent: 0, minDuration: 0.1, isTonal: true, isSample: true }, // Philharmonia clarinet samples
};

// Audio sample URLs for sample-based sounds
const SNARE_SAMPLES = {
  // Short hits for quarter notes and shorter
  normal: '/audio/philharmonia/percussion/snare drum/snare-drum__025_mezzo-forte_with-snares.mp3',
  accent: '/audio/philharmonia/percussion/snare drum/snare-drum__025_fortissimo_with-snares.mp3',
  // Rolls for half notes and longer
  rollNormal: '/audio/philharmonia/percussion/snare drum/snare-drum__long_mezzo-forte_roll.mp3',
  rollAccent: '/audio/philharmonia/percussion/snare drum/snare-drum__long_forte_roll.mp3',
};

// Philharmonia instrument sample base paths
const INSTRUMENT_SAMPLE_PATHS: Record<string, string> = {
  clarinet: '/audio/philharmonia/woodwinds/clarinet',
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

/**
 * Convert pitch notation (e.g., 'C4', 'D#4', 'Eb5') to frequency in Hz
 * Uses A4 = 440Hz as reference
 */
function pitchToFrequency(pitch: string): number {
  // Note frequencies mapping - middle octave (C4-B4) and extended range
  const NOTE_FREQUENCIES: Record<string, number> = {
    // Octave 2
    'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'Gb2': 92.50,
    'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83,
    'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54,
    'B2': 123.47,
    // Octave 3
    'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59,
    'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56,
    'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00,
    'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65,
    'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08,
    'B3': 246.94,
    // Octave 4 (middle C octave)
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18,
    'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
    'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30,
    'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16,
    'B4': 493.88,
    // Octave 5
    'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37,
    'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99,
    'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61,
    'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33,
    'B5': 987.77,
    // Octave 6
    'C6': 1046.50,
  };

  return NOTE_FREQUENCIES[pitch] || 440; // Default to A4 if pitch not found
}

/**
 * Convert pitch notation (e.g., 'C4', 'D#4') to Philharmonia sample filename format
 * @param pitch - Pitch string like 'C4', 'C#4', 'Db4'
 * @returns Note in format like 'C4', 'Cs4' for sharps (Philharmonia uses 's' suffix for sharps)
 */
function pitchToPhilharmoniaNote(pitch: string): string {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 'C4'; // fallback

  const [, note, accidental, octave] = match;

  // Philharmonia uses 's' for sharps, flats need enharmonic conversion
  if (accidental === '#') {
    return `${note}s${octave}`;
  }
  if (accidental === 'b') {
    // Convert flat to enharmonic sharp
    const flatToSharp: Record<string, string> = {
      'Db': 'Cs', 'Eb': 'Ds', 'Gb': 'Fs', 'Ab': 'Gs', 'Bb': 'As',
      'Fb': 'E', 'Cb': 'B'  // Edge cases
    };
    const converted = flatToSharp[`${note}b`];
    return converted ? `${converted}${octave}` : `${note}${octave}`;
  }

  return `${note}${octave}`;
}

/**
 * Get Philharmonia sample duration code based on note duration in beats
 * @param durationBeats - Duration in beats (quarter = 1, half = 2, whole = 4)
 * @returns Duration code: '025' (quarter/shorter), '05' (half), '1' (whole/longer)
 */
function getPhilharmoniaDuration(durationBeats: number): string {
  if (durationBeats >= 4) return '1';      // whole note or longer
  if (durationBeats >= 2) return '05';     // half note
  return '025';                             // quarter note or shorter
}

/**
 * Get the appropriate dynamic for an instrument
 * Different instruments have different available dynamics in Philharmonia samples
 */
function getInstrumentDynamic(instrument: SoundOption, isAccented?: boolean): string {
  // Trumpet and clarinet don't have mezzo-forte, use forte/fortissimo
  // Trombone and tuba have mezzo-forte available
  if (instrument === 'trumpet' || instrument === 'clarinet') {
    return isAccented ? 'fortissimo' : 'forte';
  }
  // Trombone and tuba have mezzo-forte
  return isAccented ? 'forte' : 'mezzo-forte';
}

/**
 * Build sample URL for a pitched instrument
 * @param instrument - The instrument type
 * @param pitch - Pitch string like 'C4', 'D#4'
 * @param durationBeats - Duration in beats for sample duration selection
 * @param isAccented - Whether to use louder dynamic
 */
function buildInstrumentSampleUrl(
  instrument: SoundOption,
  pitch: string,
  durationBeats: number,
  isAccented?: boolean
): string {
  const basePath = INSTRUMENT_SAMPLE_PATHS[instrument];
  if (!basePath) return '';

  const philNote = pitchToPhilharmoniaNote(pitch);
  const duration = getPhilharmoniaDuration(durationBeats);
  const dynamic = getInstrumentDynamic(instrument, isAccented);

  return `${basePath}/${instrument}_${philNote}_${duration}_${dynamic}_normal.mp3`;
}

import { generateRhythmPattern, getPatternDurationMs } from '@/lib/rhythmRandomizer/rhythmGenerator';
import { expandBeamedGroups } from '@/lib/rhythmRandomizer/rhythmNotation';
import {
  generateEnsemblePattern,
  regeneratePart,
  togglePartMute,
  togglePartSolo,
  updatePartSound,
} from '@/lib/rhythmRandomizer/ensembleGenerator';

interface UseRhythmRandomizerReturn {
  // State
  settings: RhythmSettings;
  pattern: RhythmPattern | null;
  ensemblePattern: EnsemblePattern | null;
  playbackState: PlaybackState;
  isReady: boolean;
  volume: number;
  startMeasure: number;

  // Actions
  generate: () => void;
  play: (startFromMeasure?: number, patternOverride?: RhythmPattern) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  setStartMeasure: (measure: number) => void;
  setPattern: (pattern: RhythmPattern | null) => void;

  // Metronome Actions
  playMetronome: () => Promise<void>;
  stopMetronome: () => void;

  // Ensemble Actions
  regenerateEnsemblePart: (partIndex: number) => void;
  toggleEnsemblePartMute: (partIndex: number) => void;
  toggleEnsemblePartSolo: (partIndex: number) => void;
  updateEnsemblePartSound: (partIndex: number, sound: SoundOption) => void;

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
  const [startMeasure, setStartMeasure] = useState<number>(1); // 1-indexed starting measure

  // Refs for playback timing
  const playbackTimeoutsRef = useRef<Set<number>>(new Set());
  const playbackStartTimeRef = useRef<number>(0);
  const pausedMeasureRef = useRef<number>(1); // 1-indexed measure where playback was paused

  // Refs for standalone metronome
  const metronomeTimeoutsRef = useRef<Set<number>>(new Set());
  const metronomeLoopRef = useRef<boolean>(false);

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

  // Helper to schedule a metronome timeout and track it for cleanup
  const scheduleMetronomeTimeout = useCallback((callback: () => void, delay: number): number => {
    const id = window.setTimeout(() => {
      metronomeTimeoutsRef.current.delete(id);
      callback();
    }, delay);
    metronomeTimeoutsRef.current.add(id);
    return id;
  }, []);

  // Clear all metronome timeouts
  const clearMetronomeTimeouts = useCallback(() => {
    metronomeTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    metronomeTimeoutsRef.current.clear();
    metronomeLoopRef.current = false;
  }, []);

  // Generate new pattern (single or ensemble)
  const generate = useCallback(() => {
    try {
      // Reset playback state when generating new pattern
      setPlaybackState(INITIAL_PLAYBACK_STATE);
      // Reset start measure to beginning
      setStartMeasure(1);

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
    bodyPart?: BodyPercussionPart,
    startFromMeasure: number = 0 // 0-indexed measure to start from
  ): number => {
    let currentTime = startTimeMs;
    let eventIndex = 0;

    for (let m = 0; m < patternToPlay.measures.length; m++) {
      const measure = patternToPlay.measures[m];

      // Skip measures before startFromMeasure
      if (m < startFromMeasure) {
        // Still count events for proper indexing
        const expandedEvents = expandBeamedGroups(measure.events);
        eventIndex += expandedEvents.length;
        continue;
      }

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

            // Check if this is a sample-based sound (like snare or pitched instruments)
            const soundConfig = SOUND_PARAMS[sound];
            if (soundConfig?.isSample && sound === 'snare') {
              // Use real audio samples for snare
              // Use rolls for half notes (2 beats) and longer, single hits for shorter
              const useRoll = eventCopy.duration >= 2;
              let sampleUrl: string;
              if (useRoll) {
                sampleUrl = eventCopy.isAccented ? SNARE_SAMPLES.rollAccent : SNARE_SAMPLES.rollNormal;
                // Play roll with duration limit to prevent overlap with next note
                // Subtract a small amount for clean cutoff
                const rollDuration = Math.max(0.2, noteDurationSeconds - 0.05);
                audio.playSampleWithDuration(sampleUrl, rollDuration);
              } else {
                sampleUrl = eventCopy.isAccented ? SNARE_SAMPLES.accent : SNARE_SAMPLES.normal;
                audio.playSample(sampleUrl);
              }
            } else if (soundConfig?.isSample && eventCopy.pitch && ['trumpet', 'clarinet', 'trombone', 'tuba'].includes(sound)) {
              // Pitched instrument samples with duration-aware sample selection
              const sampleUrl = buildInstrumentSampleUrl(
                sound,
                eventCopy.pitch,
                eventCopy.duration,
                eventCopy.isAccented
              );
              // Play sample from the beginning (no offset)
              audio.playSampleWithOffset(sampleUrl, 0.00);
            } else if (sound === 'piano' && eventCopy.pitch) {
              // Piano with pitched notes - calculate frequency from pitch
              const frequency = pitchToFrequency(eventCopy.pitch);
              const soundParams = getSoundParams(sound, noteDurationSeconds, eventCopy.isAccented);
              audio.playNoteWithDynamics(frequency, soundParams.duration, vol);
            } else {
              // Use body percussion sound if specified, otherwise use selected sound
              const soundParams = bodyPartCopy
                ? getBodyPercussionSoundParams(bodyPartCopy, eventCopy.isAccented)
                : getSoundParams(sound, noteDurationSeconds, eventCopy.isAccented);

              audio.playNoteWithDynamics(soundParams.frequency, soundParams.duration, vol);
            }
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
  // Optional startFromMeasure parameter allows resuming from a specific measure
  // Optional patternOverride allows passing a specific pattern (e.g., with pitch data)
  const play = useCallback(async (startFromMeasure?: number, patternOverride?: RhythmPattern) => {
    const effectiveStartMeasure = startFromMeasure ?? startMeasure;
    // Use pattern override if provided, otherwise use state
    const patternToUse = patternOverride ?? pattern;
    // For ensemble mode, we need ensemblePattern; for single mode, we need pattern
    const isEnsembleMode = settings.ensembleMode !== 'single' && ensemblePattern;

    if (!isEnsembleMode && !patternToUse) return;
    if (isEnsembleMode && (!ensemblePattern || ensemblePattern.parts.length === 0)) return;

    try {
      // Clear any existing timeouts
      clearPlaybackTimeouts();

      // Stop standalone metronome (pattern takes over)
      clearMetronomeTimeouts();

      await initialize();

      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        isMetronomePlaying: false, // Pattern takes over from standalone metronome
        currentMeasure: 0,
        currentBeat: 0,
        currentEventIndex: -1, // -1 means no note highlighted yet (e.g., during count-in)
        currentPartIndex: -1,
      }));

      playbackStartTimeRef.current = Date.now();

      // Calculate timing
      const msPerBeat = 60000 / settings.tempo;
      let currentTime = 0;

      // Get beats per measure from time signature
      const timeSigMatch = settings.timeSignature.match(/^(\d+)\/\d+$/);
      const beatsPerMeasure = timeSigMatch ? parseInt(timeSigMatch[1], 10) : 4;

      // Count-in
      if (settings.countInMeasures > 0) {
        const countInBeats = settings.countInMeasures * beatsPerMeasure;
        const countInBeatDurationSeconds = msPerBeat / 1000;
        for (let i = 0; i < countInBeats; i++) {
          const beatTime = currentTime;
          const isFirstBeat = i % beatsPerMeasure === 0; // Accent first beat of measure
          scheduleTimeout(() => {
            if (audio) {
              // Use metronome sound for count-in
              const clickParams = getSoundParams('metronome', countInBeatDurationSeconds, isFirstBeat);
              audio.playNoteWithDynamics(clickParams.frequency, clickParams.duration, 0.85);
            }
          }, beatTime);
          currentTime += msPerBeat;
        }
      }

      let totalDuration = currentTime;

      // Calculate pattern duration for metronome click scheduling
      // Only count beats for measures being played (from effectiveStartMeasure onwards)
      let patternDurationBeats = 0;
      const startMeasureIndex = effectiveStartMeasure - 1; // Convert to 0-indexed

      if (isEnsembleMode && ensemblePattern) {
        if (ensemblePattern.mode === 'callResponse') {
          // Sequential: sum of all parts, but only from startMeasure
          patternDurationBeats = ensemblePattern.parts.reduce((sum, p) => {
            const measuresPlayed = p.pattern.measures.slice(startMeasureIndex);
            const beatsPlayed = measuresPlayed.reduce((beatSum, m) =>
              beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
            return sum + beatsPlayed;
          }, 0);
        } else {
          // Simultaneous: max duration from startMeasure
          patternDurationBeats = Math.max(...ensemblePattern.parts.map(p => {
            const measuresPlayed = p.pattern.measures.slice(startMeasureIndex);
            return measuresPlayed.reduce((beatSum, m) =>
              beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
          }));
        }
      } else if (patternToUse) {
        // Only count beats from startMeasure onwards
        const measuresPlayed = patternToUse.measures.slice(startMeasureIndex);
        patternDurationBeats = measuresPlayed.reduce((beatSum, m) =>
          beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
      }

      // Schedule metronome clicks during playback (if enabled)
      if (settings.metronomeEnabled && patternDurationBeats > 0) {
        const totalClicks = Math.ceil(patternDurationBeats);
        const beatDurationSeconds = msPerBeat / 1000;

        for (let beat = 0; beat < totalClicks; beat++) {
          const beatTime = currentTime + beat * msPerBeat;
          const isFirstBeatOfMeasure = beat % beatsPerMeasure === 0;

          scheduleTimeout(() => {
            if (audio) {
              const clickParams = getSoundParams('metronome', beatDurationSeconds, isFirstBeatOfMeasure);
              // Lower volume so it doesn't overpower the pattern
              audio.playNoteWithDynamics(clickParams.frequency, clickParams.duration, 0.7);
            }
          }, beatTime);
        }
      }

      if (isEnsembleMode && ensemblePattern) {
        // ENSEMBLE PLAYBACK
        const mode = ensemblePattern.mode;
        const parts = ensemblePattern.parts;

        if (mode === 'callResponse') {
          // CALL & RESPONSE: Parts play sequentially
          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex];
            // Use per-part sound if defined, otherwise fall back to global setting
            const partSound = part.sound ?? settings.sound;

            if (isPartAudible(part, parts)) {
              totalDuration = schedulePatternPlayback(
                part.pattern,
                totalDuration,
                msPerBeat,
                partSound,
                partIndex,
                part.bodyPart,
                effectiveStartMeasure - 1 // Convert 1-indexed to 0-indexed
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
            // Use per-part sound if defined, otherwise fall back to global setting
            const partSound = part.sound ?? settings.sound;

            if (isPartAudible(part, parts)) {
              const endTime = schedulePatternPlayback(
                part.pattern,
                currentTime,
                msPerBeat,
                partSound,
                partIndex,
                part.bodyPart,
                effectiveStartMeasure - 1 // Convert 1-indexed to 0-indexed
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
      } else if (patternToUse) {
        // SINGLE PATTERN PLAYBACK
        totalDuration = schedulePatternPlayback(
          patternToUse,
          currentTime,
          msPerBeat,
          settings.sound,
          -1,
          undefined,
          effectiveStartMeasure - 1 // Convert 1-indexed to 0-indexed
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
  }, [pattern, ensemblePattern, settings, audio, initialize, scheduleTimeout, clearPlaybackTimeouts, clearMetronomeTimeouts, schedulePatternPlayback, isPartAudible, startMeasure]);

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
    setPlaybackState(prev => {
      // Store the current measure (1-indexed) for resuming
      pausedMeasureRef.current = prev.currentMeasure + 1;
      return {
        ...prev,
        isPlaying: false,
        isPaused: true,
        elapsedTime: Date.now() - playbackStartTimeRef.current,
      };
    });
  }, [audio, clearPlaybackTimeouts]);

  // Resume playback from paused position
  const resume = useCallback(() => {
    if (playbackState.isPaused) {
      // Play from the measure where we paused
      play(pausedMeasureRef.current);
    }
  }, [playbackState.isPaused, play]);

  // Stop standalone metronome
  const stopMetronome = useCallback(() => {
    clearMetronomeTimeouts();
    setPlaybackState(prev => ({
      ...prev,
      isMetronomePlaying: false,
    }));
  }, [clearMetronomeTimeouts]);

  // Play standalone metronome (loops until stopped)
  const playMetronome = useCallback(async () => {
    try {
      await initialize();

      // Mark metronome as playing
      setPlaybackState(prev => ({
        ...prev,
        isMetronomePlaying: true,
      }));

      metronomeLoopRef.current = true;
      const msPerBeat = 60000 / settings.tempo;

      // Get beats per measure from time signature
      const timeSigMatch = settings.timeSignature.match(/^(\d+)\/\d+$/);
      const beatsPerMeasure = timeSigMatch ? parseInt(timeSigMatch[1], 10) : 4;

      // Schedule one measure of clicks, then schedule next measure
      const scheduleMeasure = (startTime: number) => {
        if (!metronomeLoopRef.current) return;

        for (let beat = 0; beat < beatsPerMeasure; beat++) {
          const beatTime = startTime + beat * msPerBeat;
          const isFirstBeat = beat === 0;

          scheduleMetronomeTimeout(() => {
            if (!metronomeLoopRef.current) return;
            if (audio) {
              const clickParams = getSoundParams('metronome', msPerBeat / 1000, isFirstBeat);
              audio.playNoteWithDynamics(clickParams.frequency, clickParams.duration, 0.85);
            }
          }, beatTime);
        }

        // Schedule next measure
        const nextMeasureTime = startTime + beatsPerMeasure * msPerBeat;
        scheduleMetronomeTimeout(() => {
          if (metronomeLoopRef.current) {
            scheduleMeasure(0); // Start from 0 since this is a new timeout chain
          }
        }, nextMeasureTime);
      };

      // Start the first measure
      scheduleMeasure(0);

    } catch (error) {
      console.error('Metronome error:', error);
      stopMetronome();
    }
  }, [settings.tempo, settings.timeSignature, audio, initialize, scheduleMetronomeTimeout, stopMetronome]);

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

  // Ensemble: Update sound for a part
  const updateEnsemblePartSound = useCallback((partIndex: number, sound: SoundOption) => {
    if (!ensemblePattern) return;
    const updated = updatePartSound(ensemblePattern, partIndex, sound);
    setEnsemblePattern(updated);
  }, [ensemblePattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPlaybackTimeouts();
      clearMetronomeTimeouts();
      if (audio) {
        audio.stopAll();
      }
    };
  }, [clearPlaybackTimeouts, clearMetronomeTimeouts, audio]);

  return {
    settings,
    pattern,
    ensemblePattern,
    playbackState,
    isReady,
    volume,
    startMeasure,
    generate,
    play,
    stop,
    pause,
    resume,
    setVolume,
    setStartMeasure,
    setPattern,
    playMetronome,
    stopMetronome,
    regenerateEnsemblePart,
    toggleEnsemblePartMute,
    toggleEnsemblePartSolo,
    updateEnsemblePartSound,
    updateSetting,
    updateSettings,
    applyPreset,
    resetSettings,
  };
}
