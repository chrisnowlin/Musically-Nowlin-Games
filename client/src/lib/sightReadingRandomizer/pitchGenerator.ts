/**
 * Pitch Generator for Sight Reading Randomizer
 * Functions for melodic pitch generation based on difficulty settings
 */

import type { RhythmPattern } from '../rhythmRandomizer/types';
import type { MelodicDifficulty, SightReadingSettings } from './types';
import { getInterval, pitchToVexFlow, pitchFromIndex } from './pitchUtils';
import { getDiatonicPitchesInRange, getScaleDegreeFromTonic } from './keySignatureUtils';
import { expandBeamedGroups } from '../rhythmRandomizer/rhythmNotation';

// ============================================
// INTERVAL WEIGHTING BY DIFFICULTY
// ============================================

interface IntervalWeight {
  minInterval: number; // Minimum interval in semitones
  maxInterval: number; // Maximum interval in semitones
  weight: number; // Probability weight
  description: string; // For debugging
}

/**
 * Interval weighting profiles by difficulty
 * Easy: 80% steps (2nds), 20% small leaps (3rds)
 * Medium: 50% steps, 30% small leaps, 20% larger leaps
 * Hard: Even distribution across all intervals
 */
const DIFFICULTY_WEIGHTS: Record<MelodicDifficulty, IntervalWeight[]> = {
  easy: [
    { minInterval: -2, maxInterval: 2, weight: 80, description: 'Steps (2nds)' },
    { minInterval: -4, maxInterval: 4, weight: 20, description: 'Small leaps (3rds)' }
  ],
  medium: [
    { minInterval: -2, maxInterval: 2, weight: 50, description: 'Steps (2nds)' },
    { minInterval: -4, maxInterval: 4, weight: 30, description: 'Small leaps (3rds)' },
    { minInterval: -7, maxInterval: 7, weight: 20, description: 'Larger leaps (4ths-5ths)' }
  ],
  hard: [
    { minInterval: -2, maxInterval: 2, weight: 30, description: 'Steps (2nds)' },
    { minInterval: -4, maxInterval: 4, weight: 25, description: 'Small leaps (3rds)' },
    { minInterval: -7, maxInterval: 7, weight: 25, description: 'Medium leaps (4ths-5ths)' },
    { minInterval: -12, maxInterval: 12, weight: 20, description: 'Large leaps (6ths-octave)' }
  ]
};

// ============================================
// PITCH SELECTION FUNCTIONS
// ============================================

/**
 * Select the next pitch based on current pitch, available pitches, and difficulty
 * @param currentPitch - The current pitch (or null for first note)
 * @param availablePitches - Array of allowed pitches
 * @param difficulty - Melodic difficulty level
 * @param settings - Sight reading settings for additional constraints
 * @returns Selected next pitch
 */
export function selectNextPitch(
  currentPitch: string | null,
  availablePitches: string[],
  difficulty: MelodicDifficulty,
  settings?: SightReadingSettings
): string {
  if (availablePitches.length === 0) {
    throw new Error('No available pitches to select from');
  }

  // If no current pitch, select a starting pitch (prefers tonic near middle of range)
  if (!currentPitch) {
    return selectStartingPitch(availablePitches, settings);
  }

  // Get difficulty-based interval weights
  const weights = DIFFICULTY_WEIGHTS[difficulty];

  // Build weighted candidate list
  const candidates: { pitch: string; weight: number }[] = [];

  for (const pitch of availablePitches) {
    const interval = getInterval(currentPitch, pitch);

    // Find matching weight category
    let weight = 0;
    for (const w of weights) {
      if (interval >= w.minInterval && interval <= w.maxInterval) {
        weight = w.weight;
        break;
      }
    }

    // Apply additional constraints from settings
    if (settings) {
      // Check max interval constraint
      if (Math.abs(interval) > settings.maxInterval) {
        weight = 0;
      }

      // Apply stepwise bias
      if (Math.abs(interval) <= 2 && settings.stepwiseBias > 50) {
        weight *= (1 + (settings.stepwiseBias - 50) / 100);
      }

      // Apply tonic gravity - weight pitches closer to tonic more heavily
      if (settings.tonicGravity > 0 && weight > 0) {
        const scaleDegree = getScaleDegreeFromTonic(pitch, settings.keySignature);
        if (scaleDegree >= 0) {
          // Calculate tonic weight multiplier based on scale degree
          // Scale degree 0 (tonic) = highest weight, degree 6 (7th) = lowest
          // tonicGravity 0 = no effect, 100 = maximum effect
          const gravityFactor = settings.tonicGravity / 100;

          // Use stronger multipliers at high gravity levels
          // At "Very Strong" (>=75), tonic should dominate but still allow melodic movement
          let degreeMultipliers: number[];
          if (settings.tonicGravity >= 75) {
            // Very Strong: tonic and 5th favored, others reduced
            degreeMultipliers = [4.0, 0.5, 0.9, 0.7, 2.0, 0.5, 0.4]; // Tonic, 2nd, 3rd, 4th, 5th, 6th, 7th
          } else if (settings.tonicGravity >= 50) {
            // Strong: tonic favored, moderate reduction to others
            degreeMultipliers = [3.5, 0.6, 1.0, 0.8, 1.8, 0.6, 0.5]; // Tonic, 2nd, 3rd, 4th, 5th, 6th, 7th
          } else {
            // Moderate: slight tonic preference
            degreeMultipliers = [3.0, 0.7, 1.0, 0.8, 1.5, 0.6, 0.5]; // Tonic, 2nd, 3rd, 4th, 5th, 6th, 7th
          }
          const baseMultiplier = degreeMultipliers[scaleDegree] || 1.0;

          // Interpolate between 1.0 (no gravity) and the degree multiplier (full gravity)
          const multiplier = 1.0 + (baseMultiplier - 1.0) * gravityFactor;
          weight *= multiplier;
        }
      }
    }

    if (weight > 0) {
      candidates.push({ pitch, weight });
    }
  }

  // If no candidates match the weights, fall back to any available pitch
  if (candidates.length === 0) {
    return availablePitches[Math.floor(Math.random() * availablePitches.length)];
  }

  // Select weighted random pitch
  return weightedRandomSelection(candidates);
}

/**
 * Assign pitches to all note events in a rhythm pattern
 * Expands beamed groups first so each individual note gets its own pitch
 * @param pattern - Rhythm pattern to assign pitches to
 * @param settings - Sight reading settings
 * @returns Modified pattern with pitches assigned (beamed groups expanded)
 */
export function assignPitchesToPattern(
  pattern: RhythmPattern,
  settings: SightReadingSettings
): RhythmPattern {
  // Get available pitches based on settings
  let availablePitches: string[];

  if (settings.useDiatonicOnly) {
    // Use only scale notes
    availablePitches = getDiatonicPitchesInRange(
      settings.keySignature,
      settings.pitchRange
    );
  } else {
    // Use all chromatic pitches in range
    availablePitches = settings.allowedPitches.length > 0
      ? settings.allowedPitches
      : getDiatonicPitchesInRange(settings.keySignature, settings.pitchRange);
  }

  if (availablePitches.length === 0) {
    throw new Error('No available pitches in the specified range');
  }

  // Find tonic pitches for ending (when tonicGravity is very strong)
  const tonicPitches = availablePitches.filter(pitch => {
    const scaleDegree = getScaleDegreeFromTonic(pitch, settings.keySignature);
    return scaleDegree === 0;
  });

  // Count total notes to know when we're at the last one
  let totalNotes = 0;
  for (const measure of pattern.measures) {
    const expandedEvents = expandBeamedGroups(measure.events);
    totalNotes += expandedEvents.filter(e => e.type === 'note').length;
  }

  // Track current pitch for melodic continuity
  let currentPitch: string | null = null;
  let noteIndex = 0;

  // Iterate through all measures
  // Expand beamed groups FIRST so each individual note gets its own pitch
  const modifiedPattern = { ...pattern };
  modifiedPattern.measures = pattern.measures.map(measure => {
    // Expand beamed groups into individual notes before pitch assignment
    const expandedEvents = expandBeamedGroups(measure.events);

    return {
      ...measure,
      events: expandedEvents.map(event => {
        // Only assign pitches to notes, not rests
        if (event.type !== 'note') {
          return event;
        }

        noteIndex++;
        const isLastNote = noteIndex === totalNotes;

        let selectedPitch: string;

        // Force tonic on last note when tonicGravity >= 75 ("Very Strong")
        if (isLastNote && settings.tonicGravity >= 75 && tonicPitches.length > 0) {
          // Pick the tonic closest to current pitch for smooth resolution
          if (currentPitch) {
            selectedPitch = findClosestPitch(currentPitch, tonicPitches, availablePitches);
          } else {
            // Fallback to middle tonic
            selectedPitch = tonicPitches[Math.floor(tonicPitches.length / 2)];
          }
        } else {
          // Normal pitch selection
          selectedPitch = selectNextPitch(
            currentPitch,
            availablePitches,
            settings.melodicDifficulty,
            settings
          );
        }

        // Update current pitch
        currentPitch = selectedPitch;

        // Return event with pitch data
        return {
          ...event,
          pitch: selectedPitch,
          vexflowKey: pitchToVexFlow(selectedPitch)
        };
      })
    };
  });

  return modifiedPattern;
}

/**
 * Find the closest pitch from a list of target pitches
 * @param currentPitch - Current pitch to measure from
 * @param targetPitches - Pitches to choose from
 * @param allPitches - Full list of pitches for index calculation
 * @returns Closest target pitch
 */
function findClosestPitch(currentPitch: string, targetPitches: string[], allPitches: string[]): string {
  const currentIndex = allPitches.indexOf(currentPitch);
  if (currentIndex === -1 || targetPitches.length === 0) {
    return targetPitches[0] || currentPitch;
  }

  let closest = targetPitches[0];
  let closestDistance = Math.abs(allPitches.indexOf(closest) - currentIndex);

  for (const target of targetPitches) {
    const targetIndex = allPitches.indexOf(target);
    const distance = Math.abs(targetIndex - currentIndex);
    if (distance < closestDistance) {
      closest = target;
      closestDistance = distance;
    }
  }

  return closest;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Select a starting pitch - randomly selects from chord tones near the middle of the range
 * Weighted toward tonic/5th but includes variety with 3rd and other scale degrees
 * @param availablePitches - Array of available pitches
 * @param settings - Sight reading settings (optional, for key-aware selection)
 * @returns Starting pitch
 */
function selectStartingPitch(availablePitches: string[], settings?: SightReadingSettings): string {
  if (availablePitches.length === 0) {
    throw new Error('No available pitches');
  }

  const middleIndex = Math.floor(availablePitches.length / 2);

  // If we have settings, select from chord tones with variety
  if (settings) {
    // Group pitches by scale degree, filtering to middle third of range for good starting positions
    const rangeStart = Math.floor(availablePitches.length * 0.25);
    const rangeEnd = Math.ceil(availablePitches.length * 0.75);
    const middleRangePitches = availablePitches.slice(rangeStart, rangeEnd);

    // Build candidates with weights based on scale degree
    // Tonic (1) and 5th get higher weight, 3rd moderate, others lower
    const candidates: { pitch: string; weight: number }[] = [];

    for (const pitch of middleRangePitches) {
      const scaleDegree = getScaleDegreeFromTonic(pitch, settings.keySignature);
      let weight = 1;

      if (scaleDegree === 0) weight = 3;      // Tonic - good starting point
      else if (scaleDegree === 4) weight = 2.5; // 5th - stable
      else if (scaleDegree === 2) weight = 2;   // 3rd - common
      else if (scaleDegree === 3) weight = 1.5; // 4th - okay
      else if (scaleDegree === 1) weight = 1.5; // 2nd - passing tone
      else if (scaleDegree === 5) weight = 1;   // 6th - less common
      else if (scaleDegree === 6) weight = 0.5; // 7th - tension, rare start

      candidates.push({ pitch, weight });
    }

    if (candidates.length > 0) {
      return weightedRandomSelection(candidates);
    }
  }

  // Fallback: select random pitch from middle third of range
  const rangeStart = Math.floor(availablePitches.length * 0.25);
  const rangeEnd = Math.ceil(availablePitches.length * 0.75);
  const middleRangePitches = availablePitches.slice(rangeStart, rangeEnd);

  if (middleRangePitches.length > 0) {
    return middleRangePitches[Math.floor(Math.random() * middleRangePitches.length)];
  }

  return availablePitches[middleIndex];
}

/**
 * Perform weighted random selection from candidates
 * @param candidates - Array of candidates with weights
 * @returns Randomly selected pitch based on weights
 */
function weightedRandomSelection(candidates: { pitch: string; weight: number }[]): string {
  // Calculate total weight
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);

  // Generate random number
  let random = Math.random() * totalWeight;

  // Select based on weight
  for (const candidate of candidates) {
    random -= candidate.weight;
    if (random <= 0) {
      return candidate.pitch;
    }
  }

  // Fallback (shouldn't reach here)
  return candidates[candidates.length - 1].pitch;
}

/**
 * Get pitch index for sorting and comparison
 * @param pitch - Pitch string
 * @returns Numeric index
 */
function getPitchIndexForSorting(pitch: string): number {
  const match = pitch.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return 0;

  const [, note, octave] = match;
  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalize enharmonic spellings
  let normalizedNote = note;
  const enharmonicMap: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };

  if (enharmonicMap[note]) {
    normalizedNote = enharmonicMap[note];
  }

  const noteIndex = chromaticNotes.indexOf(normalizedNote);
  return parseInt(octave, 10) * 12 + noteIndex;
}

// ============================================
// MELODIC CONTOUR UTILITIES
// ============================================

/**
 * Analyze melodic contour of a pattern
 * @param pattern - Rhythm pattern with pitches
 * @returns Contour analysis
 */
export function analyzeContour(pattern: RhythmPattern): {
  avgInterval: number;
  maxInterval: number;
  direction: 'ascending' | 'descending' | 'mixed';
  stepwisePercent: number;
} {
  const pitches: string[] = [];

  // Extract all pitches
  for (const measure of pattern.measures) {
    for (const event of measure.events) {
      if (event.type === 'note' && event.pitch) {
        pitches.push(event.pitch);
      }
    }
  }

  if (pitches.length < 2) {
    return {
      avgInterval: 0,
      maxInterval: 0,
      direction: 'mixed',
      stepwisePercent: 0
    };
  }

  // Calculate intervals
  const intervals: number[] = [];
  for (let i = 1; i < pitches.length; i++) {
    const interval = getInterval(pitches[i - 1], pitches[i]);
    intervals.push(interval);
  }

  // Calculate statistics
  const avgInterval = intervals.reduce((sum, i) => sum + Math.abs(i), 0) / intervals.length;
  const maxInterval = Math.max(...intervals.map(i => Math.abs(i)));

  const upCount = intervals.filter(i => i > 0).length;
  const downCount = intervals.filter(i => i < 0).length;

  let direction: 'ascending' | 'descending' | 'mixed';
  if (upCount > downCount * 1.5) {
    direction = 'ascending';
  } else if (downCount > upCount * 1.5) {
    direction = 'descending';
  } else {
    direction = 'mixed';
  }

  const stepwiseCount = intervals.filter(i => Math.abs(i) <= 2).length;
  const stepwisePercent = (stepwiseCount / intervals.length) * 100;

  return {
    avgInterval,
    maxInterval,
    direction,
    stepwisePercent
  };
}
