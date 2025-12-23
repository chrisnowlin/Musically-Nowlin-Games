/**
 * Example Usage of Sight Reading Randomizer
 * Demonstrates how to use the pitch generation system
 */

import type { RhythmPattern } from '../rhythmRandomizer/types';
import type { SightReadingSettings } from './types';
import {
  assignPitchesToPattern,
  selectNextPitch,
  analyzeContour,
  getAllPitchesInRange,
  getDiatonicPitchesInRange,
  getScaleNotes,
  pitchToVexFlow,
  pitchToFrequency,
  getInterval,
  TREBLE_CLEF_RANGE,
  BASS_CLEF_RANGE,
  DEFAULT_SIGHT_READING_SETTINGS
} from './index';

// ============================================
// EXAMPLE 1: Get pitches in a range
// ============================================

export function example1_getAllPitches() {
  console.log('=== Example 1: Get All Chromatic Pitches ===');

  const pitches = getAllPitchesInRange('C4', 'C5');
  console.log('Chromatic pitches from C4 to C5:', pitches);
  // Output: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5']

  return pitches;
}

// ============================================
// EXAMPLE 2: Get scale notes
// ============================================

export function example2_getScaleNotes() {
  console.log('\n=== Example 2: Get Scale Notes ===');

  const cMajor = getScaleNotes('C');
  console.log('C Major scale:', cMajor);
  // Output: ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  const gMajor = getScaleNotes('G');
  console.log('G Major scale:', gMajor);
  // Output: ['G', 'A', 'B', 'C', 'D', 'E', 'F#']

  const aMinor = getScaleNotes('Am');
  console.log('A Minor scale:', aMinor);
  // Output: ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  return { cMajor, gMajor, aMinor };
}

// ============================================
// EXAMPLE 3: Get diatonic pitches in range
// ============================================

export function example3_getDiatonicPitches() {
  console.log('\n=== Example 3: Get Diatonic Pitches in Range ===');

  const diatonicPitches = getDiatonicPitchesInRange('G', TREBLE_CLEF_RANGE);
  console.log('G Major pitches in treble clef range:', diatonicPitches);
  // Output: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'A5']

  return diatonicPitches;
}

// ============================================
// EXAMPLE 4: Convert pitches
// ============================================

export function example4_convertPitches() {
  console.log('\n=== Example 4: Convert Pitches ===');

  const pitch = 'C#4';
  const vexflow = pitchToVexFlow(pitch);
  const frequency = pitchToFrequency(pitch);

  console.log(`Pitch: ${pitch}`);
  console.log(`VexFlow format: ${vexflow}`);
  console.log(`Frequency: ${frequency.toFixed(2)} Hz`);
  // Output:
  // Pitch: C#4
  // VexFlow format: c#/4
  // Frequency: 277.18 Hz

  return { pitch, vexflow, frequency };
}

// ============================================
// EXAMPLE 5: Calculate intervals
// ============================================

export function example5_calculateIntervals() {
  console.log('\n=== Example 5: Calculate Intervals ===');

  const interval1 = getInterval('C4', 'E4');
  console.log('C4 to E4:', interval1, 'semitones (Major 3rd)');

  const interval2 = getInterval('G4', 'C4');
  console.log('G4 to C4:', interval2, 'semitones (Perfect 4th down)');

  const interval3 = getInterval('A4', 'A5');
  console.log('A4 to A5:', interval3, 'semitones (Octave)');

  return { interval1, interval2, interval3 };
}

// ============================================
// EXAMPLE 6: Select next pitch with difficulty
// ============================================

export function example6_selectNextPitch() {
  console.log('\n=== Example 6: Select Next Pitch ===');

  const availablePitches = getDiatonicPitchesInRange('C', TREBLE_CLEF_RANGE);
  const currentPitch = 'C4';

  // Easy: Mostly steps
  const easyPitch = selectNextPitch(currentPitch, availablePitches, 'easy');
  console.log('Easy difficulty from C4:', easyPitch);

  // Medium: Mix of steps and leaps
  const mediumPitch = selectNextPitch(currentPitch, availablePitches, 'medium');
  console.log('Medium difficulty from C4:', mediumPitch);

  // Hard: More varied intervals
  const hardPitch = selectNextPitch(currentPitch, availablePitches, 'hard');
  console.log('Hard difficulty from C4:', hardPitch);

  return { easyPitch, mediumPitch, hardPitch };
}

// ============================================
// EXAMPLE 7: Assign pitches to a rhythm pattern
// ============================================

export function example7_assignPitches() {
  console.log('\n=== Example 7: Assign Pitches to Pattern ===');

  // Create a simple rhythm pattern (mock data)
  const rhythmPattern: RhythmPattern = {
    id: 'example-1',
    measures: [
      {
        measureNumber: 1,
        events: [
          { type: 'note', value: 'quarter', duration: 1 },
          { type: 'note', value: 'quarter', duration: 1 },
          { type: 'note', value: 'quarter', duration: 1 },
          { type: 'note', value: 'quarter', duration: 1 }
        ]
      }
    ],
    totalDurationBeats: 4,
    settings: {} as any,
    createdAt: Date.now()
  };

  // Configure sight reading settings
  const settings: SightReadingSettings = {
    ...DEFAULT_SIGHT_READING_SETTINGS,
    keySignature: 'G',
    melodicDifficulty: 'easy',
    pitchRange: TREBLE_CLEF_RANGE,
    useDiatonicOnly: true,
    maxInterval: 4
  };

  // Assign pitches
  const patternWithPitches = assignPitchesToPattern(rhythmPattern, settings);

  console.log('Original pattern:', rhythmPattern.measures[0].events);
  console.log('\nPattern with pitches:');
  patternWithPitches.measures[0].events.forEach((event, i) => {
    console.log(`Note ${i + 1}: ${event.pitch} (${event.vexflowKey})`);
  });

  return patternWithPitches;
}

// ============================================
// EXAMPLE 8: Analyze melodic contour
// ============================================

export function example8_analyzeContour() {
  console.log('\n=== Example 8: Analyze Melodic Contour ===');

  // Create pattern with known pitches
  const pattern: RhythmPattern = {
    id: 'example-2',
    measures: [
      {
        measureNumber: 1,
        events: [
          { type: 'note', value: 'quarter', duration: 1, pitch: 'C4' },
          { type: 'note', value: 'quarter', duration: 1, pitch: 'D4' },
          { type: 'note', value: 'quarter', duration: 1, pitch: 'E4' },
          { type: 'note', value: 'quarter', duration: 1, pitch: 'G4' }
        ]
      }
    ],
    totalDurationBeats: 4,
    settings: {} as any,
    createdAt: Date.now()
  };

  const analysis = analyzeContour(pattern);
  console.log('Contour analysis:', analysis);
  console.log(`Average interval: ${analysis.avgInterval.toFixed(1)} semitones`);
  console.log(`Max interval: ${analysis.maxInterval} semitones`);
  console.log(`Direction: ${analysis.direction}`);
  console.log(`Stepwise motion: ${analysis.stepwisePercent.toFixed(1)}%`);

  return analysis;
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

export function runAllExamples() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Sight Reading Randomizer - Example Usage           ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  example1_getAllPitches();
  example2_getScaleNotes();
  example3_getDiatonicPitches();
  example4_convertPitches();
  example5_calculateIntervals();
  example6_selectNextPitch();
  example7_assignPitches();
  example8_analyzeContour();

  console.log('\n✅ All examples completed successfully!');
}

// Uncomment to run examples:
// runAllExamples();
