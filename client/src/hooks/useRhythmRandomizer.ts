/**
 * Hook for Rhythm Randomizer state management
 * 
 * Uses Web Audio API scheduling for sample-accurate playback timing.
 * This ensures precise rhythm playback regardless of browser state or deployment environment.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioService } from './useAudioService';
import {
  RhythmSettings,
  RhythmPattern,
  RhythmEvent,
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
import {
  createWebAudioScheduler,
  WebAudioScheduler,
  ScheduledSound,
} from '@/lib/audio/webAudioScheduler';

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

import { generateRhythmPattern } from '@/lib/rhythmRandomizer/rhythmGenerator';
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

  // Refs for playback
  const pausedMeasureRef = useRef<number>(1); // 1-indexed measure where playback was paused
  const schedulerRef = useRef<WebAudioScheduler | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Refs for standalone metronome (still uses setTimeout for looping control)
  const metronomeSchedulerRef = useRef<WebAudioScheduler | null>(null);
  const metronomeLoopRef = useRef<boolean>(false);
  const metronomeTimeoutRef = useRef<number | null>(null);

  // Audio hook
  const { audio, isReady, initialize } = useAudioService();

  /**
   * Initialize Web Audio scheduler
   */
  const getScheduler = useCallback((): WebAudioScheduler | null => {
    if (schedulerRef.current) {
      return schedulerRef.current;
    }

    // Create AudioContext if needed
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }

    // Create master gain if needed
    if (!masterGainRef.current && audioContextRef.current) {
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = volume;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current && masterGainRef.current) {
      schedulerRef.current = createWebAudioScheduler(audioContextRef.current, masterGainRef.current);
      return schedulerRef.current;
    }

    return null;
  }, [volume]);

  /**
   * Build scheduled events from a pattern
   */
  const buildScheduledEvents = useCallback((
    patternToPlay: RhythmPattern,
    msPerBeat: number,
    soundToUse: SoundOption,
    partIndex: number = -1,
    bodyPart?: BodyPercussionPart,
    startFromMeasure: number = 0,
    timeOffset: number = 0
  ): { events: ScheduledSound[]; endTime: number } => {
    const events: ScheduledSound[] = [];
    let currentTime = timeOffset;
    let eventIndex = 0;

    for (let m = 0; m < patternToPlay.measures.length; m++) {
      const measure = patternToPlay.measures[m];

      // Skip measures before startFromMeasure
      if (m < startFromMeasure) {
        const expandedEvents = expandBeamedGroups(measure.events);
        eventIndex += expandedEvents.length;
        continue;
      }

      let beatInMeasure = 0;
      const expandedEvents = expandBeamedGroups(measure.events);

      for (const event of expandedEvents) {
        const eventTimeSeconds = currentTime / 1000;
        const noteDurationSeconds = (event.duration * msPerBeat) / 1000;

        if (event.type === 'note') {
          const vol = event.isAccented ? 0.9 : 0.7;
          const soundConfig = SOUND_PARAMS[soundToUse];

          let scheduledEvent: ScheduledSound;

          if (soundConfig?.isSample && soundToUse === 'snare') {
            // Snare drum samples
            const useRoll = event.duration >= 2;
            let sampleUrl: string;
            let duration: number;
            
            if (useRoll) {
              sampleUrl = event.isAccented ? SNARE_SAMPLES.rollAccent : SNARE_SAMPLES.rollNormal;
              duration = Math.max(0.2, noteDurationSeconds - 0.05);
            } else {
              sampleUrl = event.isAccented ? SNARE_SAMPLES.accent : SNARE_SAMPLES.normal;
              duration = noteDurationSeconds;
            }

            scheduledEvent = {
              time: eventTimeSeconds,
              sampleUrl,
              duration,
              volume: vol,
              isAccented: event.isAccented,
              measureIndex: m,
              beatIndex: beatInMeasure,
              eventIndex,
              partIndex,
            };
          } else if (soundConfig?.isSample && event.pitch && ['trumpet', 'clarinet', 'trombone', 'tuba'].includes(soundToUse)) {
            // Pitched instrument samples
            const sampleUrl = buildInstrumentSampleUrl(
              soundToUse,
              event.pitch,
              event.duration,
              event.isAccented
            );

            scheduledEvent = {
              time: eventTimeSeconds,
              sampleUrl,
              duration: noteDurationSeconds,
              volume: vol,
              isAccented: event.isAccented,
              measureIndex: m,
              beatIndex: beatInMeasure,
              eventIndex,
              partIndex,
            };
          } else if (soundToUse === 'piano' && event.pitch) {
            // Piano with pitched notes
            const frequency = pitchToFrequency(event.pitch);
            const soundParams = getSoundParams(soundToUse, noteDurationSeconds, event.isAccented);

            scheduledEvent = {
              time: eventTimeSeconds,
              frequency,
              duration: soundParams.duration,
              volume: vol,
              isAccented: event.isAccented,
              measureIndex: m,
              beatIndex: beatInMeasure,
              eventIndex,
              partIndex,
            };
          } else {
            // Synthesized sound (oscillator)
            const soundParams = bodyPart
              ? getBodyPercussionSoundParams(bodyPart, event.isAccented)
              : getSoundParams(soundToUse, noteDurationSeconds, event.isAccented);

            scheduledEvent = {
              time: eventTimeSeconds,
              frequency: soundParams.frequency,
              duration: soundParams.duration,
              volume: vol,
              isAccented: event.isAccented,
              measureIndex: m,
              beatIndex: beatInMeasure,
              eventIndex,
              partIndex,
            };
          }

          events.push(scheduledEvent);
        } else {
          // Rest - still add event for UI tracking but no sound
          events.push({
            time: eventTimeSeconds,
            duration: noteDurationSeconds,
            volume: 0,
            measureIndex: m,
            beatIndex: beatInMeasure,
            eventIndex,
            partIndex,
          });
        }

        currentTime += event.duration * msPerBeat;
        beatInMeasure += event.duration;
        eventIndex++;
      }
    }

    return { events, endTime: currentTime };
  }, []);

  /**
   * Build metronome click events
   */
  const buildMetronomeEvents = useCallback((
    startTimeMs: number,
    durationBeats: number,
    msPerBeat: number,
    beatsPerMeasure: number
  ): ScheduledSound[] => {
    const events: ScheduledSound[] = [];
    const totalClicks = Math.ceil(durationBeats);
    const beatDurationSeconds = msPerBeat / 1000;

    for (let beat = 0; beat < totalClicks; beat++) {
      const beatTimeSeconds = (startTimeMs + beat * msPerBeat) / 1000;
      const isFirstBeatOfMeasure = beat % beatsPerMeasure === 0;
      const clickParams = getSoundParams('metronome', beatDurationSeconds, isFirstBeatOfMeasure);

      events.push({
        time: beatTimeSeconds,
        frequency: clickParams.frequency,
        duration: clickParams.duration,
        volume: 0.7, // Lower volume for metronome during playback
        isAccented: isFirstBeatOfMeasure,
      });
    }

    return events;
  }, []);

  /**
   * Build count-in events
   */
  const buildCountInEvents = useCallback((
    countInMeasures: number,
    msPerBeat: number,
    beatsPerMeasure: number
  ): { events: ScheduledSound[]; endTime: number } => {
    if (countInMeasures === 0) {
      return { events: [], endTime: 0 };
    }

    const events: ScheduledSound[] = [];
    const countInBeats = countInMeasures * beatsPerMeasure;
    const beatDurationSeconds = msPerBeat / 1000;
    let currentTime = 0;

    for (let i = 0; i < countInBeats; i++) {
      const isFirstBeat = i % beatsPerMeasure === 0;
      const clickParams = getSoundParams('metronome', beatDurationSeconds, isFirstBeat);

      events.push({
        time: currentTime / 1000,
        frequency: clickParams.frequency,
        duration: clickParams.duration,
        volume: 0.85,
        isAccented: isFirstBeat,
      });

      currentTime += msPerBeat;
    }

    return { events, endTime: currentTime };
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
   * Check if a part should be audible based on mute/solo states
   */
  const isPartAudible = useCallback((part: EnsemblePart, allParts: EnsemblePart[]): boolean => {
    if (part.isMuted) return false;
    const hasSoloedPart = allParts.some(p => p.isSoloed);
    if (hasSoloedPart) {
      return part.isSoloed;
    }
    return true;
  }, []);

  // Play the pattern (single or ensemble) using Web Audio scheduling
  const play = useCallback(async (startFromMeasure?: number, patternOverride?: RhythmPattern) => {
    const effectiveStartMeasure = startFromMeasure ?? startMeasure;
    const patternToUse = patternOverride ?? pattern;
    const isEnsembleMode = settings.ensembleMode !== 'single' && ensemblePattern;

    if (!isEnsembleMode && !patternToUse) return;
    if (isEnsembleMode && (!ensemblePattern || ensemblePattern.parts.length === 0)) return;

    try {
      // Initialize audio service for iOS compatibility
      await initialize();

      // Get or create scheduler
      const scheduler = getScheduler();
      if (!scheduler) {
        console.error('Failed to create audio scheduler');
        return;
      }

      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Stop any existing playback
      scheduler.stop();

      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        isMetronomePlaying: false,
        currentMeasure: 0,
        currentBeat: 0,
        currentEventIndex: -1,
        currentPartIndex: -1,
      }));

      // Calculate timing
      const msPerBeat = 60000 / settings.tempo;
      const timeSigMatch = settings.timeSignature.match(/^(\d+)\/\d+$/);
      const beatsPerMeasure = timeSigMatch ? parseInt(timeSigMatch[1], 10) : 4;

      // Build all scheduled events
      let allEvents: ScheduledSound[] = [];
      let totalDuration = 0;

      // Count-in events
      const { events: countInEvents, endTime: countInEndTime } = buildCountInEvents(
        settings.countInMeasures,
        msPerBeat,
        beatsPerMeasure
      );
      allEvents.push(...countInEvents);
      totalDuration = countInEndTime;

      // Calculate pattern duration for metronome
      let patternDurationBeats = 0;
      const startMeasureIndex = effectiveStartMeasure - 1;

      if (isEnsembleMode && ensemblePattern) {
        if (ensemblePattern.mode === 'callResponse') {
          patternDurationBeats = ensemblePattern.parts.reduce((sum, p) => {
            const measuresPlayed = p.pattern.measures.slice(startMeasureIndex);
            const beatsPlayed = measuresPlayed.reduce((beatSum, m) =>
              beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
            return sum + beatsPlayed;
          }, 0);
        } else {
          patternDurationBeats = Math.max(...ensemblePattern.parts.map(p => {
            const measuresPlayed = p.pattern.measures.slice(startMeasureIndex);
            return measuresPlayed.reduce((beatSum, m) =>
              beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
          }));
        }
      } else if (patternToUse) {
        const measuresPlayed = patternToUse.measures.slice(startMeasureIndex);
        patternDurationBeats = measuresPlayed.reduce((beatSum, m) =>
          beatSum + m.events.reduce((eventSum, e) => eventSum + e.duration, 0), 0);
      }

      // Metronome events during playback
      if (settings.metronomeEnabled && patternDurationBeats > 0) {
        const metronomeEvents = buildMetronomeEvents(
          totalDuration,
          patternDurationBeats,
          msPerBeat,
          beatsPerMeasure
        );
        allEvents.push(...metronomeEvents);
      }

      // Pattern events
      if (isEnsembleMode && ensemblePattern) {
        const mode = ensemblePattern.mode;
        const parts = ensemblePattern.parts;

        if (mode === 'callResponse') {
          // Sequential playback
          let currentOffset = totalDuration;
          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex];
            const partSound = part.sound ?? settings.sound;

            if (isPartAudible(part, parts)) {
              const { events: partEvents, endTime } = buildScheduledEvents(
                part.pattern,
                msPerBeat,
                partSound,
                partIndex,
                part.bodyPart,
                effectiveStartMeasure - 1,
                currentOffset
              );
              allEvents.push(...partEvents);
              currentOffset = endTime;
            } else {
              currentOffset += part.pattern.totalDurationBeats * msPerBeat;
            }
          }
          totalDuration = currentOffset;
        } else {
          // Simultaneous playback
          let maxEndTime = totalDuration;
          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex];
            const partSound = part.sound ?? settings.sound;

            if (isPartAudible(part, parts)) {
              const { events: partEvents, endTime } = buildScheduledEvents(
                part.pattern,
                msPerBeat,
                partSound,
                partIndex,
                part.bodyPart,
                effectiveStartMeasure - 1,
                totalDuration
              );
              allEvents.push(...partEvents);
              maxEndTime = Math.max(maxEndTime, endTime);
            }
          }
          totalDuration = maxEndTime;
        }
      } else if (patternToUse) {
        // Single pattern playback
        const { events: patternEvents, endTime } = buildScheduledEvents(
          patternToUse,
          msPerBeat,
          settings.sound,
          -1,
          undefined,
          effectiveStartMeasure - 1,
          totalDuration
        );
        allEvents.push(...patternEvents);
        totalDuration = endTime;
      }

      // Schedule all events using Web Audio
      await scheduler.scheduleSequence(allEvents, {
        onEventStart: (event) => {
          // Update UI state when events fire
          if (event.measureIndex !== undefined) {
            setPlaybackState(prev => ({
              ...prev,
              currentMeasure: event.measureIndex!,
              currentBeat: event.beatIndex ?? prev.currentBeat,
              currentEventIndex: event.eventIndex ?? prev.currentEventIndex,
              currentPartIndex: event.partIndex ?? prev.currentPartIndex,
            }));
          }
        },
        onComplete: () => {
          if (settings.loopEnabled) {
            // Restart playback
            play();
          } else {
            setPlaybackState(INITIAL_PLAYBACK_STATE);
          }
        },
      });

    } catch (error) {
      console.error('Playback error:', error);
      setPlaybackState(INITIAL_PLAYBACK_STATE);
    }
  }, [pattern, ensemblePattern, settings, initialize, getScheduler, buildCountInEvents, buildMetronomeEvents, buildScheduledEvents, isPartAudible, startMeasure]);

  // Stop playback
  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(INITIAL_PLAYBACK_STATE);
  }, [audio]);

  // Pause playback
  const pause = useCallback(() => {
    schedulerRef.current?.pause();
    if (audio) {
      audio.stopAll();
    }
    setPlaybackState(prev => {
      pausedMeasureRef.current = prev.currentMeasure + 1;
      return {
        ...prev,
        isPlaying: false,
        isPaused: true,
      };
    });
  }, [audio]);

  // Resume playback from paused position
  const resume = useCallback(() => {
    if (playbackState.isPaused) {
      play(pausedMeasureRef.current);
    }
  }, [playbackState.isPaused, play]);

  // Stop standalone metronome
  const stopMetronome = useCallback(() => {
    metronomeLoopRef.current = false;
    if (metronomeTimeoutRef.current) {
      window.clearTimeout(metronomeTimeoutRef.current);
      metronomeTimeoutRef.current = null;
    }
    metronomeSchedulerRef.current?.stop();
    setPlaybackState(prev => ({
      ...prev,
      isMetronomePlaying: false,
    }));
  }, []);

  // Play standalone metronome (loops until stopped)
  const playMetronome = useCallback(async () => {
    try {
      await initialize();

      // Create separate scheduler for metronome
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        audioContextRef.current = new AudioCtx();
      }

      if (!masterGainRef.current && audioContextRef.current) {
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.value = volume;
        masterGainRef.current.connect(audioContextRef.current.destination);
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!metronomeSchedulerRef.current && audioContextRef.current && masterGainRef.current) {
        metronomeSchedulerRef.current = createWebAudioScheduler(audioContextRef.current, masterGainRef.current);
      }

      setPlaybackState(prev => ({
        ...prev,
        isMetronomePlaying: true,
      }));

      metronomeLoopRef.current = true;
      const msPerBeat = 60000 / settings.tempo;
      const timeSigMatch = settings.timeSignature.match(/^(\d+)\/\d+$/);
      const beatsPerMeasure = timeSigMatch ? parseInt(timeSigMatch[1], 10) : 4;

      // Schedule one measure at a time using Web Audio
      const scheduleMeasure = async () => {
        if (!metronomeLoopRef.current || !metronomeSchedulerRef.current) return;

        const events = buildMetronomeEvents(0, beatsPerMeasure, msPerBeat, beatsPerMeasure);
        
        // Set volume higher for standalone metronome
        events.forEach(e => e.volume = 0.85);

        await metronomeSchedulerRef.current.scheduleSequence(events, {
          onComplete: () => {
            if (metronomeLoopRef.current) {
              // Schedule next measure
              metronomeTimeoutRef.current = window.setTimeout(scheduleMeasure, 0);
            }
          },
        });
      };

      scheduleMeasure();

    } catch (error) {
      console.error('Metronome error:', error);
      stopMetronome();
    }
  }, [settings.tempo, settings.timeSignature, volume, initialize, buildMetronomeEvents, stopMetronome]);

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
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audio) {
      audio.setVolume(clampedVolume);
    }
    // Also update master gain for Web Audio scheduler
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      masterGainRef.current.gain.linearRampToValueAtTime(clampedVolume, now + 0.05);
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
      schedulerRef.current?.stop();
      metronomeSchedulerRef.current?.stop();
      if (metronomeTimeoutRef.current) {
        window.clearTimeout(metronomeTimeoutRef.current);
      }
      if (audio) {
        audio.stopAll();
      }
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audio]);

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
