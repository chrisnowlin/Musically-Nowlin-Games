/**
 * Rhythm Pattern Generator
 * Generates random rhythm patterns based on configurable parameters
 */

import {
  RhythmEvent,
  RhythmPattern,
  RhythmSettings,
  Measure,
  NoteValue,
  RestValue,
  TimeSignature,
  TIME_SIGNATURES,
  NOTE_DURATIONS,
  REST_DURATIONS,
} from './types';

/**
 * Generate a unique ID for patterns
 */
function generateId(): string {
  return `rhythm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the total beats in a measure for a given time signature
 */
function getMeasureBeats(timeSignature: TimeSignature): number {
  // For compound meters, calculate based on subdivision
  if (timeSignature.subdivision === 'compound') {
    // In compound time, the numerator is the number of subdivisions
    // Each group of 3 eighth notes = 1 beat in compound time
    // But we work in absolute beats where quarter = 1
    return (timeSignature.numerator / timeSignature.denominator) * 4;
  }
  // For simple meters, calculate beats based on denominator
  return (timeSignature.numerator / timeSignature.denominator) * 4;
}

/**
 * Get available note values that fit within remaining beats
 */
function getAvailableNoteValues(
  remainingBeats: number,
  allowedNoteValues: NoteValue[],
  settings: RhythmSettings
): NoteValue[] {
  return allowedNoteValues.filter((noteValue) => {
    const duration = NOTE_DURATIONS[noteValue];
    // Check if note fits and is allowed
    if (duration > remainingBeats) return false;
    // Skip triplets if not enabled
    if (!settings.includeTriplets && (noteValue === 'tripletQuarter' || noteValue === 'tripletEighth')) {
      return false;
    }
    return true;
  });
}

/**
 * Get available rest values that fit within remaining beats
 */
function getAvailableRestValues(
  remainingBeats: number,
  allowedRestValues: RestValue[]
): RestValue[] {
  return allowedRestValues.filter((restValue) => {
    const duration = REST_DURATIONS[restValue];
    return duration <= remainingBeats;
  });
}

/**
 * Determine if this beat position is syncopated (off-beat)
 */
function isOffBeat(currentBeat: number, timeSignature: TimeSignature): boolean {
  // Off-beat positions are non-integer beats
  const beatPosition = currentBeat % 1;
  return beatPosition !== 0;
}

/**
 * Select a note value based on density preference
 */
function selectNoteValueByDensity(
  availableNotes: NoteValue[],
  density: 'sparse' | 'medium' | 'dense'
): NoteValue {
  // Sort by duration (longest first for sparse, shortest first for dense)
  const sorted = [...availableNotes].sort((a, b) => {
    const diff = NOTE_DURATIONS[a] - NOTE_DURATIONS[b];
    return density === 'sparse' ? -diff : diff;
  });

  // Weight selection based on density
  const weights = density === 'medium'
    ? sorted.map(() => 1) // Equal weights for medium
    : sorted.map((_, i) => sorted.length - i); // Prefer first items

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < sorted.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return sorted[i];
    }
  }

  return sorted[0];
}

/**
 * Generate a single rhythm event
 */
function generateEvent(
  remainingBeats: number,
  currentBeat: number,
  settings: RhythmSettings,
  timeSignature: TimeSignature
): RhythmEvent {
  const shouldRest = Math.random() * 100 < settings.restProbability;

  if (shouldRest) {
    const availableRests = getAvailableRestValues(remainingBeats, settings.allowedRestValues);
    if (availableRests.length > 0) {
      const restValue = availableRests[Math.floor(Math.random() * availableRests.length)];
      return {
        type: 'rest',
        value: restValue,
        duration: REST_DURATIONS[restValue],
      };
    }
  }

  const availableNotes = getAvailableNoteValues(remainingBeats, settings.allowedNoteValues, settings);

  if (availableNotes.length === 0) {
    // Fallback: use quarter rest if nothing else fits
    const smallestRest = settings.allowedRestValues.find(r => REST_DURATIONS[r] <= remainingBeats);
    if (smallestRest) {
      return {
        type: 'rest',
        value: smallestRest,
        duration: REST_DURATIONS[smallestRest],
      };
    }
    // Ultimate fallback
    return {
      type: 'rest',
      value: 'quarterRest',
      duration: Math.min(1, remainingBeats),
    };
  }

  // Apply syncopation logic
  const isCurrentlyOffBeat = isOffBeat(currentBeat, timeSignature);
  const wantsSyncopation = Math.random() * 100 < settings.syncopationProbability;

  let selectedNote: NoteValue;

  if (wantsSyncopation && !isCurrentlyOffBeat) {
    // For syncopation on a strong beat, prefer shorter notes to get to off-beats
    const shorterNotes = availableNotes.filter(n => NOTE_DURATIONS[n] <= 0.5);
    if (shorterNotes.length > 0) {
      selectedNote = shorterNotes[Math.floor(Math.random() * shorterNotes.length)];
    } else {
      selectedNote = selectNoteValueByDensity(availableNotes, settings.noteDensity);
    }
  } else {
    selectedNote = selectNoteValueByDensity(availableNotes, settings.noteDensity);
  }

  const isAccented = Math.random() * 100 < settings.accentProbability;

  return {
    type: 'note',
    value: selectedNote,
    duration: NOTE_DURATIONS[selectedNote],
    isAccented,
    isTriplet: selectedNote === 'tripletQuarter' || selectedNote === 'tripletEighth',
  };
}

/**
 * Generate a single measure of rhythm
 */
function generateMeasure(
  measureNumber: number,
  settings: RhythmSettings,
  timeSignature: TimeSignature
): Measure {
  const totalBeats = getMeasureBeats(timeSignature);
  const events: RhythmEvent[] = [];
  let currentBeat = 0;

  while (currentBeat < totalBeats) {
    const remainingBeats = totalBeats - currentBeat;
    const event = generateEvent(remainingBeats, currentBeat, settings, timeSignature);
    events.push(event);
    currentBeat += event.duration;
  }

  return {
    events,
    measureNumber,
  };
}

/**
 * Generate a complete rhythm pattern
 */
export function generateRhythmPattern(settings: RhythmSettings): RhythmPattern {
  const timeSignature = TIME_SIGNATURES[settings.timeSignature];

  if (!timeSignature) {
    throw new Error(`Unknown time signature: ${settings.timeSignature}`);
  }

  const measures: Measure[] = [];
  const beatsPerMeasure = getMeasureBeats(timeSignature);

  for (let i = 0; i < settings.measureCount; i++) {
    measures.push(generateMeasure(i + 1, settings, timeSignature));
  }

  return {
    id: generateId(),
    measures,
    totalDurationBeats: beatsPerMeasure * settings.measureCount,
    settings,
    createdAt: Date.now(),
  };
}

/**
 * Calculate total duration of a pattern in milliseconds
 */
export function getPatternDurationMs(pattern: RhythmPattern): number {
  const beatsPerMinute = pattern.settings.tempo;
  const msPerBeat = 60000 / beatsPerMinute;
  return pattern.totalDurationBeats * msPerBeat;
}

/**
 * Get events flattened across all measures
 */
export function getFlattenedEvents(pattern: RhythmPattern): RhythmEvent[] {
  return pattern.measures.flatMap(m => m.events);
}

/**
 * Validate that a pattern correctly fills all measures
 */
export function validatePattern(pattern: RhythmPattern): boolean {
  const timeSignature = TIME_SIGNATURES[pattern.settings.timeSignature];
  const expectedBeats = getMeasureBeats(timeSignature);

  for (const measure of pattern.measures) {
    const totalBeats = measure.events.reduce((sum, e) => sum + e.duration, 0);
    if (Math.abs(totalBeats - expectedBeats) > 0.001) {
      console.warn(`Measure ${measure.measureNumber} has ${totalBeats} beats, expected ${expectedBeats}`);
      return false;
    }
  }

  return true;
}
