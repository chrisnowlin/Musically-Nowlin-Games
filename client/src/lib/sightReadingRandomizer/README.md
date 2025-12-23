# Sight Reading Randomizer - Pitch System (Phase 1-2)

This module implements the pitch generation system for sight reading exercises, extending the Rhythm Randomizer with melodic capabilities.

## Overview

The sight reading randomizer assigns pitches to rhythmic patterns based on key signatures, difficulty levels, and melodic constraints. It supports all major and minor keys with proper accidental handling.

## Files

### `types.ts`
Core type definitions for sight reading:
- **KeySignature**: All major/minor keys (C, G, D, A, E, B, F#, Cb, F, Bb, Eb, Ab, Db, Gb and relative minors)
- **MelodicDifficulty**: 'easy' | 'medium' | 'hard'
- **PitchRange**: Interface for defining pitch ranges (lowest/highest)
- **SightReadingSettings**: Configuration for pitch generation
- **Constants**: `TREBLE_CLEF_RANGE` (C4-A5), `BASS_CLEF_RANGE` (E2-C4)

### `pitchUtils.ts`
Utility functions for pitch manipulation:
- `pitchToVexFlow(pitch)`: Convert 'C4' → 'c/4', 'D#4' → 'd#/4'
- `pitchToFrequency(pitch)`: Get frequency in Hz (A4 = 440Hz)
- `getAllPitchesInRange(lowest, highest)`: Get all chromatic pitches in range
- `getInterval(from, to)`: Calculate semitone distance between pitches
- `pitchFromIndex(index)`: Convert chromatic index to pitch
- **NOTE_FREQUENCIES**: Complete frequency map for C2-C6 (includes enharmonic spellings)

### `keySignatureUtils.ts`
Functions for working with key signatures and scales:
- `getScaleNotes(key)`: Get all notes in a scale (without octaves)
- `getDiatonicPitchesInRange(key, range)`: Get scale notes with octaves in range
- `getVexFlowKeySignature(key)`: Get VexFlow key signature format
- `isNoteInKey(note, key)`: Check if a note is diatonic to the key
- **KEY_SIGNATURES**: Complete data for all major/minor keys with accidentals

### `pitchGenerator.ts`
Melodic pitch generation with difficulty-based weighting:
- `selectNextPitch(current, available, difficulty, settings)`: Choose next pitch with weighted randomness
- `assignPitchesToPattern(pattern, settings)`: Assign pitches to all notes in a rhythm pattern
- `analyzeContour(pattern)`: Analyze melodic characteristics

**Difficulty Weighting:**
- **Easy**: 80% steps (2nds), 20% small leaps (3rds)
- **Medium**: 50% steps, 30% small leaps (3rds), 20% larger leaps (4ths-5ths)
- **Hard**: 30% steps, 25% small leaps, 25% medium leaps, 20% large leaps (up to octave)

### `index.ts`
Main export file for convenient imports.

## Usage Example

```typescript
import {
  assignPitchesToPattern,
  TREBLE_CLEF_RANGE,
  DEFAULT_SIGHT_READING_SETTINGS
} from '@/lib/sightReadingRandomizer';
import type { RhythmPattern } from '@/lib/rhythmRandomizer/types';

// Configure settings
const settings = {
  ...DEFAULT_SIGHT_READING_SETTINGS,
  keySignature: 'G' as const,
  melodicDifficulty: 'medium' as const,
  pitchRange: TREBLE_CLEF_RANGE,
  useDiatonicOnly: true,
  maxInterval: 7 // Perfect 5th
};

// Assign pitches to a rhythm pattern
const patternWithPitches = assignPitchesToPattern(rhythmPattern, settings);

// Access pitch data
patternWithPitches.measures.forEach(measure => {
  measure.events.forEach(event => {
    if (event.type === 'note') {
      console.log(event.pitch); // 'C4', 'D4', etc.
      console.log(event.vexflowKey); // 'c/4', 'd/4', etc.
    }
  });
});
```

## Integration with RhythmEvent

The `RhythmEvent` interface has been extended with optional pitch properties:

```typescript
export interface RhythmEvent {
  type: 'note' | 'rest';
  value: NoteValue | RestValue;
  duration: number;
  // ... existing properties
  pitch?: string;      // e.g., 'C4', 'D#4', 'Eb5'
  vexflowKey?: string; // e.g., 'c/4', 'd#/4', 'eb/5'
}
```

These properties are:
- **Optional**: Backward compatible with rhythm-only patterns
- **Assigned automatically**: By `assignPitchesToPattern()`
- **VexFlow-ready**: `vexflowKey` is formatted for direct use in notation rendering

## Key Features

1. **Complete Key Support**: All 28 major and minor keys with proper accidental handling
2. **Enharmonic Awareness**: Handles both sharp and flat spellings (C#/Db, etc.)
3. **Difficulty-Based Intervals**: Weighted random selection based on pedagogical principles
4. **Melodic Constraints**: Max interval limits, stepwise bias, contour variety
5. **Diatonic Filtering**: Option to use only scale notes or full chromatic range
6. **Backward Compatible**: Existing rhythm patterns work without modification

## Next Steps (Future Phases)

- **Phase 3**: UI controls for pitch settings
- **Phase 4**: Audio playback with pitched notes
- **Phase 5**: VexFlow notation rendering with pitches
- **Phase 6**: Advanced melodic features (sequences, motifs, harmonic implications)

## Testing

All TypeScript files pass type checking with zero errors. The module is ready for integration into the UI and playback systems.
