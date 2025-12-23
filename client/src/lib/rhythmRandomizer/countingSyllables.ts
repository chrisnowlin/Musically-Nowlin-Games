/**
 * Counting Syllables Generator
 * Generates counting syllables for rhythm patterns in various systems
 */

import {
  RhythmPattern,
  RhythmEvent,
  CountingSystem,
  NoteValue,
  RestValue,
  NOTE_DURATIONS,
  REST_DURATIONS,
} from './types';

// ============================================
// KODALY SYLLABLES
// ============================================

const KODALY_NOTE_SYLLABLES: Partial<Record<NoteValue, string>> = {
  whole: 'ta-a-a-a',
  half: 'ta-a',
  quarter: 'ta',
  eighth: 'ti',
  sixteenth: 'ti-ka',
  tripletQuarter: 'tri-o-la',
  tripletEighth: 'tri',
};

const KODALY_REST_SYLLABLES: Record<RestValue, string> = {
  wholeRest: '(rest)',
  halfRest: '(rest)',
  quarterRest: 'sh',
  eighthRest: 'sh',
  sixteenthRest: 'sh',
};

// ============================================
// TAKADIMI SYLLABLES
// ============================================

// Takadimi uses beat-relative syllables
function getTakadimiSyllable(beatPosition: number, duration: number): string {
  // Normalize position within beat (0-1)
  const pos = beatPosition % 1;

  if (duration >= 1) {
    return 'ta';
  }

  if (duration === 0.5) {
    // Eighth notes
    if (pos < 0.01 || pos > 0.99) return 'ta';
    if (Math.abs(pos - 0.5) < 0.01) return 'di';
    return 'ta';
  }

  if (duration === 0.25) {
    // Sixteenth notes
    if (pos < 0.01 || pos > 0.99) return 'ta';
    if (Math.abs(pos - 0.25) < 0.01) return 'ka';
    if (Math.abs(pos - 0.5) < 0.01) return 'di';
    if (Math.abs(pos - 0.75) < 0.01) return 'mi';
    return 'ta';
  }

  // Triplets
  if (duration === 1/3 || duration === 2/3) {
    if (pos < 0.01 || pos > 0.99) return 'ta';
    if (Math.abs(pos - 0.33) < 0.05) return 'ki';
    if (Math.abs(pos - 0.67) < 0.05) return 'da';
    return 'ta';
  }

  return 'ta';
}

// ============================================
// GORDON SYLLABLES
// ============================================

function getGordonSyllable(beatPosition: number, duration: number): string {
  const pos = beatPosition % 1;

  if (duration >= 1) {
    return 'du';
  }

  if (duration === 0.5) {
    if (pos < 0.01 || pos > 0.99) return 'du';
    if (Math.abs(pos - 0.5) < 0.01) return 'de';
    return 'du';
  }

  if (duration === 0.25) {
    if (pos < 0.01 || pos > 0.99) return 'du';
    if (Math.abs(pos - 0.25) < 0.01) return 'ta';
    if (Math.abs(pos - 0.5) < 0.01) return 'de';
    if (Math.abs(pos - 0.75) < 0.01) return 'ta';
    return 'du';
  }

  // Triplets
  if (duration === 1/3 || duration === 2/3) {
    if (pos < 0.01 || pos > 0.99) return 'du';
    if (Math.abs(pos - 0.33) < 0.05) return 'da';
    if (Math.abs(pos - 0.67) < 0.05) return 'di';
    return 'du';
  }

  return 'du';
}

// ============================================
// NUMERIC SYLLABLES
// ============================================

function getNumericSyllable(beatPosition: number, duration: number, measureBeat: number): string {
  const pos = beatPosition % 1;
  const beatNum = Math.floor(measureBeat) + 1;

  if (duration >= 1 || pos < 0.01 || pos > 0.99) {
    return String(beatNum);
  }

  if (duration === 0.5) {
    if (Math.abs(pos - 0.5) < 0.01) return '&';
    return String(beatNum);
  }

  if (duration === 0.25) {
    if (Math.abs(pos - 0.25) < 0.01) return 'e';
    if (Math.abs(pos - 0.5) < 0.01) return '&';
    if (Math.abs(pos - 0.75) < 0.01) return 'a';
    return String(beatNum);
  }

  return String(beatNum);
}

// ============================================
// MAIN SYLLABLE GENERATOR
// ============================================

/**
 * Generate a syllable for a single rhythm event
 */
export function getSyllableForEvent(
  event: RhythmEvent,
  beatPosition: number,
  measureBeat: number,
  system: CountingSystem
): string {
  if (system === 'none') {
    return '';
  }

  const duration = event.type === 'note'
    ? NOTE_DURATIONS[event.value as NoteValue] || 1
    : REST_DURATIONS[event.value as RestValue] || 1;

  // Handle rests
  if (event.type === 'rest') {
    switch (system) {
      case 'kodaly':
        return KODALY_REST_SYLLABLES[event.value as RestValue] || 'sh';
      case 'takadimi':
      case 'gordon':
        return '(rest)';
      case 'numbers':
        return '—';
      default:
        return '';
    }
  }

  // Handle notes
  switch (system) {
    case 'kodaly':
      return KODALY_NOTE_SYLLABLES[event.value as NoteValue] || 'ta';
    case 'takadimi':
      return getTakadimiSyllable(beatPosition, duration);
    case 'gordon':
      return getGordonSyllable(beatPosition, duration);
    case 'numbers':
      return getNumericSyllable(beatPosition, duration, measureBeat);
    default:
      return '';
  }
}

/**
 * Generate syllables for an entire pattern
 */
export function generatePatternSyllables(
  pattern: RhythmPattern,
  system: CountingSystem
): string[][] {
  if (system === 'none') {
    return pattern.measures.map(m => m.events.map(() => ''));
  }

  return pattern.measures.map(measure => {
    let beatPosition = 0;

    return measure.events.map(event => {
      const duration = event.type === 'note'
        ? NOTE_DURATIONS[event.value as NoteValue] || 1
        : REST_DURATIONS[event.value as RestValue] || 1;

      const syllable = getSyllableForEvent(event, beatPosition, beatPosition, system);
      beatPosition += duration;

      return syllable;
    });
  });
}

/**
 * Add syllables to pattern events (mutates pattern)
 */
export function addSyllablesToPattern(
  pattern: RhythmPattern,
  system: CountingSystem
): RhythmPattern {
  const syllables = generatePatternSyllables(pattern, system);

  return {
    ...pattern,
    measures: pattern.measures.map((measure, mIdx) => ({
      ...measure,
      events: measure.events.map((event, eIdx) => ({
        ...event,
        syllable: syllables[mIdx]?.[eIdx] || '',
      })),
    })),
  };
}

/**
 * Get display name for counting system
 */
export function getCountingSystemName(system: CountingSystem): string {
  switch (system) {
    case 'kodaly':
      return 'Kodály';
    case 'takadimi':
      return 'Takadimi';
    case 'gordon':
      return 'Gordon';
    case 'numbers':
      return '1 e & a';
    case 'none':
      return 'None';
    default:
      return system;
  }
}

/**
 * Get description for counting system
 */
export function getCountingSystemDescription(system: CountingSystem): string {
  switch (system) {
    case 'kodaly':
      return 'ta, ti-ti, ta-a (Zoltán Kodály method)';
    case 'takadimi':
      return 'ta, di, ka, mi (beat-function based)';
    case 'gordon':
      return 'du, de, ta (Edwin Gordon method)';
    case 'numbers':
      return '1, e, &, a (traditional counting)';
    case 'none':
      return 'No syllables displayed';
    default:
      return '';
  }
}
