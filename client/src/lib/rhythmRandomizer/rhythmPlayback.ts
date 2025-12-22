/**
 * Rhythm Playback Engine
 * Handles audio scheduling and playback for rhythm patterns
 */

import {
  RhythmPattern,
  RhythmEvent,
  SoundOption,
  TimeSignature,
  TIME_SIGNATURES,
} from './types';

// Sound frequency mappings for different instruments
const SOUND_FREQUENCIES: Record<SoundOption, { note: number; accent: number }> = {
  woodblock: { note: 800, accent: 1000 },
  drums: { note: 200, accent: 250 },
  claps: { note: 1200, accent: 1500 },
  piano: { note: 440, accent: 440 }, // A4
  metronome: { note: 1000, accent: 1200 },
};

// Sound durations (in seconds)
const SOUND_DURATIONS: Record<SoundOption, number> = {
  woodblock: 0.08,
  drums: 0.15,
  claps: 0.05,
  piano: 0.3,
  metronome: 0.05,
};

export interface PlaybackOptions {
  tempo: number;
  sound: SoundOption;
  countInMeasures: 0 | 1 | 2;
  loopEnabled: boolean;
  metronomeEnabled: boolean;
  swingAmount: number;
  volume: number;
  timeSignature: string;
}

export interface ScheduledEvent {
  time: number; // Time in milliseconds from start
  type: 'note' | 'rest' | 'metronome' | 'countIn';
  isAccented: boolean;
  measureIndex: number;
  beatIndex: number;
  eventIndex: number;
}

/**
 * Calculate milliseconds per beat based on tempo
 */
export function getMsPerBeat(tempo: number): number {
  return 60000 / tempo;
}

/**
 * Get beats per measure for a time signature
 */
function getBeatsPerMeasure(timeSignature: TimeSignature): number {
  if (timeSignature.subdivision === 'compound') {
    return (timeSignature.numerator / timeSignature.denominator) * 4;
  }
  return (timeSignature.numerator / timeSignature.denominator) * 4;
}

/**
 * Schedule all events in a pattern
 */
export function schedulePattern(
  pattern: RhythmPattern,
  options: PlaybackOptions
): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const msPerBeat = getMsPerBeat(options.tempo);
  const timeSignature = TIME_SIGNATURES[options.timeSignature];
  const beatsPerMeasure = getBeatsPerMeasure(timeSignature);

  let currentTime = 0;
  let globalEventIndex = 0;

  // Add count-in events
  if (options.countInMeasures > 0) {
    const countInBeats = options.countInMeasures * beatsPerMeasure;
    for (let i = 0; i < countInBeats; i++) {
      events.push({
        time: currentTime,
        type: 'countIn',
        isAccented: i % beatsPerMeasure === 0, // Accent first beat of measure
        measureIndex: -1,
        beatIndex: i,
        eventIndex: -1,
      });
      currentTime += msPerBeat;
    }
  }

  // Schedule pattern events
  for (let m = 0; m < pattern.measures.length; m++) {
    const measure = pattern.measures[m];
    let beatInMeasure = 0;

    for (const event of measure.events) {
      if (event.type === 'note') {
        events.push({
          time: currentTime,
          type: 'note',
          isAccented: event.isAccented || false,
          measureIndex: m,
          beatIndex: beatInMeasure,
          eventIndex: globalEventIndex,
        });
      } else {
        events.push({
          time: currentTime,
          type: 'rest',
          isAccented: false,
          measureIndex: m,
          beatIndex: beatInMeasure,
          eventIndex: globalEventIndex,
        });
      }

      // Add metronome clicks on each beat if enabled
      if (options.metronomeEnabled && beatInMeasure % 1 === 0) {
        // Only add if we're on an exact beat
        const isOnBeat = Math.abs(beatInMeasure - Math.round(beatInMeasure)) < 0.01;
        if (isOnBeat) {
          events.push({
            time: currentTime,
            type: 'metronome',
            isAccented: beatInMeasure === 0, // Accent first beat
            measureIndex: m,
            beatIndex: beatInMeasure,
            eventIndex: -1,
          });
        }
      }

      currentTime += event.duration * msPerBeat;
      beatInMeasure += event.duration;
      globalEventIndex++;
    }
  }

  // Sort by time (metronome clicks should be slightly before notes)
  events.sort((a, b) => {
    if (Math.abs(a.time - b.time) < 1) {
      // Same time - metronome first
      if (a.type === 'metronome') return -1;
      if (b.type === 'metronome') return 1;
    }
    return a.time - b.time;
  });

  return events;
}

/**
 * Apply swing timing to events
 */
export function applySwing(events: ScheduledEvent[], swingAmount: number, msPerBeat: number): ScheduledEvent[] {
  if (swingAmount === 0) return events;

  const swingFactor = swingAmount / 100;
  const swingDelay = msPerBeat * 0.5 * swingFactor * 0.33; // Max 33% swing

  return events.map((event) => {
    // Apply swing to off-beats (events on the "and")
    const beatPosition = (event.beatIndex * 2) % 2;
    if (beatPosition === 1) {
      return {
        ...event,
        time: event.time + swingDelay,
      };
    }
    return event;
  });
}

/**
 * Get total duration of a pattern with count-in
 */
export function getTotalDuration(pattern: RhythmPattern, options: PlaybackOptions): number {
  const msPerBeat = getMsPerBeat(options.tempo);
  const timeSignature = TIME_SIGNATURES[options.timeSignature];
  const beatsPerMeasure = getBeatsPerMeasure(timeSignature);

  const countInDuration = options.countInMeasures * beatsPerMeasure * msPerBeat;
  const patternDuration = pattern.totalDurationBeats * msPerBeat;

  return countInDuration + patternDuration;
}

/**
 * Play a single sound event using the audio service
 */
export function playSoundEvent(
  audioService: { playNote: (freq: number, duration: number) => void; playNoteWithDynamics?: (freq: number, duration: number, volume: number) => void },
  event: ScheduledEvent,
  options: PlaybackOptions
): void {
  if (event.type === 'rest') return;

  let sound: SoundOption;
  if (event.type === 'countIn' || event.type === 'metronome') {
    sound = 'metronome';
  } else {
    sound = options.sound;
  }

  const frequencies = SOUND_FREQUENCIES[sound];
  const frequency = event.isAccented ? frequencies.accent : frequencies.note;
  const duration = SOUND_DURATIONS[sound];
  const volume = event.type === 'metronome' ? options.volume * 0.5 : options.volume;

  if (audioService.playNoteWithDynamics) {
    audioService.playNoteWithDynamics(frequency, duration, volume);
  } else {
    audioService.playNote(frequency, duration);
  }
}

/**
 * Create index file for exports
 */
export function getEventAtTime(
  events: ScheduledEvent[],
  currentTime: number
): ScheduledEvent | null {
  // Find the most recent non-rest event
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].time <= currentTime && events[i].type !== 'rest') {
      return events[i];
    }
  }
  return null;
}
