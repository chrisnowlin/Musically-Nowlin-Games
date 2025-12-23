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
 * Mapping from note values to their corresponding rest values
 */
const NOTE_TO_REST_MAP: Partial<Record<NoteValue, RestValue>> = {
  whole: 'wholeRest',
  half: 'halfRest',
  quarter: 'quarterRest',
  eighth: 'eighthRest',
  sixteenth: 'sixteenthRest',
  tripletQuarter: 'quarterRest',
  tripletEighth: 'eighthRest',
  // Beamed note groups map to equivalent rest values
  twoEighths: 'quarterRest',      // 1 beat = quarter rest
  fourSixteenths: 'quarterRest',  // 1 beat = quarter rest
  twoSixteenths: 'eighthRest',    // 0.5 beat = eighth rest
  // Mixed eighth + sixteenth beamed groups
  eighthTwoSixteenths: 'quarterRest',       // 1 beat = quarter rest
  twoSixteenthsEighth: 'quarterRest',       // 1 beat = quarter rest
  sixteenthEighthSixteenth: 'quarterRest',  // 1 beat = quarter rest
};

/**
 * Derive rest values from allowed note values
 * This ensures rests match the note durations available
 */
function deriveRestValuesFromNotes(allowedNoteValues: NoteValue[]): RestValue[] {
  const restSet = new Set<RestValue>();

  for (const noteValue of allowedNoteValues) {
    const restValue = NOTE_TO_REST_MAP[noteValue];
    if (restValue) {
      restSet.add(restValue);
    }
  }

  // Always include at least quarter rest as fallback
  if (restSet.size === 0) {
    restSet.add('quarterRest');
  }

  return Array.from(restSet);
}

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
 * Select a rest value based on density preference
 * (mirrors note selection: sparse = longer rests, dense = shorter rests)
 */
function selectRestValueByDensity(
  availableRests: RestValue[],
  density: 'sparse' | 'medium' | 'dense'
): RestValue {
  // Sort by duration (longest first for sparse, shortest first for dense)
  const sorted = [...availableRests].sort((a, b) => {
    const diff = REST_DURATIONS[a] - REST_DURATIONS[b];
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
  timeSignature: TimeSignature,
  allowedRestValues: RestValue[]
): RhythmEvent {
  const shouldRest = Math.random() * 100 < settings.restProbability;

  if (shouldRest) {
    // Use user-selected rest values from settings
    const availableRests = getAvailableRestValues(remainingBeats, allowedRestValues);
    if (availableRests.length > 0) {
      // Select rest based on density (sparse = longer rests, dense = shorter rests)
      const restValue = selectRestValueByDensity(availableRests, settings.noteDensity);
      return {
        type: 'rest',
        value: restValue,
        duration: REST_DURATIONS[restValue],
      };
    }
  }

  const availableNotes = getAvailableNoteValues(remainingBeats, settings.allowedNoteValues, settings);

  if (availableNotes.length === 0) {
    // Fallback: use smallest available rest that fits from user-selected rest values
    const availableRests = getAvailableRestValues(remainingBeats, allowedRestValues);
    if (availableRests.length > 0) {
      // Sort by duration and pick smallest that fits
      const sortedRests = availableRests.sort((a, b) => REST_DURATIONS[a] - REST_DURATIONS[b]);
      return {
        type: 'rest',
        value: sortedRests[0],
        duration: REST_DURATIONS[sortedRests[0]],
      };
    }
    // Ultimate fallback - use quarter rest if available, otherwise create a rest that fits exactly
    if (allowedRestValues.includes('quarterRest')) {
      return {
        type: 'rest',
        value: 'quarterRest',
        duration: Math.min(1, remainingBeats),
      };
    }
    // If no rest values are selected, create a rest that fits exactly
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
 * Allows slight variations in measure length (±1 beat) to improve readability
 * when measures are densely packed. Dense measures can end slightly early,
 * sparse measures can extend slightly to fill space better.
 */
function generateMeasure(
  measureNumber: number,
  settings: RhythmSettings,
  timeSignature: TimeSignature,
  allowedRestValues: RestValue[]
): Measure {
  const targetBeats = getMeasureBeats(timeSignature);
  const events: RhythmEvent[] = [];
  let currentBeat = 0;
  
  // Allow measures to vary by up to 1 beat for readability
  const minBeats = Math.max(0.5, targetBeats - 1);
  const maxBeats = targetBeats + 1;
  
  // Track measure density (events per beat) to detect when a measure is getting too dense
  let eventCount = 0;
  const denseThreshold = 2.5; // More than 2.5 events per beat is considered dense

  while (currentBeat < maxBeats) {
    const remainingBeats = maxBeats - currentBeat;
    
    // Calculate current density
    const currentDensity = eventCount / Math.max(0.1, currentBeat);
    
    // If we're past minimum beats, check if we should end early for readability
    if (currentBeat >= minBeats) {
      // If measure is dense and we're close to target, end early to improve readability
      if (currentDensity > denseThreshold && currentBeat >= targetBeats - 0.5) {
        // End if we're within 0.25 beats of target (close enough)
        if (Math.abs(currentBeat - targetBeats) <= 0.25) {
          break;
        }
      }
      
      // If we've reached target beats, end the measure (allow slight overflow up to 0.5 beats)
      if (currentBeat >= targetBeats) {
        // End if we're within 0.5 beats of target (acceptable variation)
        if (currentBeat <= targetBeats + 0.5) {
          break;
        }
        // If we're over by more than 0.5 beats, only continue if there's significant space left
        if (remainingBeats < 0.5) {
          break;
        }
      }
    }
    
    const event = generateEvent(remainingBeats, currentBeat, settings, timeSignature, allowedRestValues);
    events.push(event);
    currentBeat += event.duration;
    eventCount++;
    
    // Safety check: prevent infinite loops
    if (events.length > 50) {
      break;
    }
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

  // Use user-selected rest values, but ensure at least one rest is available
  // If no rest values are selected, derive them from note values as a fallback
  let allowedRestValues = settings.allowedRestValues;
  if (allowedRestValues.length === 0) {
    // Fallback: derive rest values from allowed note values
    allowedRestValues = deriveRestValuesFromNotes(settings.allowedNoteValues);
  }

  const measures: Measure[] = [];

  for (let i = 0; i < settings.measureCount; i++) {
    measures.push(generateMeasure(i + 1, settings, timeSignature, allowedRestValues));
  }

  // Calculate total duration from actual measure lengths (allowing for variation)
  const totalDurationBeats = measures.reduce((sum, measure) => {
    return sum + measure.events.reduce((measureSum, event) => measureSum + event.duration, 0);
  }, 0);

  return {
    id: generateId(),
    measures,
    totalDurationBeats,
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
 * Allows for slight variations (±1 beat) for readability
 */
export function validatePattern(pattern: RhythmPattern): boolean {
  const timeSignature = TIME_SIGNATURES[pattern.settings.timeSignature];
  const expectedBeats = getMeasureBeats(timeSignature);
  const tolerance = 1.0; // Allow ±1 beat variation

  for (const measure of pattern.measures) {
    const totalBeats = measure.events.reduce((sum, e) => sum + e.duration, 0);
    const difference = Math.abs(totalBeats - expectedBeats);
    
    if (difference > tolerance) {
      console.warn(
        `Measure ${measure.measureNumber} has ${totalBeats} beats, expected ${expectedBeats} (±${tolerance})`
      );
      return false;
    }
  }

  return true;
}
