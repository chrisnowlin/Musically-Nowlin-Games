# Sound and Melody Systems Guide

This document covers the core audio infrastructure for Musically Nowlin Games, including the centralized sound library, melody library, and important audio engineering considerations.

## Table of Contents

1. [Sound Library (Philharmonia Samples)](#sound-library-philharmonia-samples)
2. [Melody Library](#melody-library)
3. [Volume and Gain System](#volume-and-gain-system)
4. [Integration Examples](#integration-examples)

---

## Sound Library (Philharmonia Samples)

### Overview

All instrument samples are sourced from the **Philharmonia Orchestra** and stored in a centralized location. This ensures consistency across all games and simplifies maintenance.

### Location

```
client/public/audio/philharmonia/
├── strings/
│   ├── violin/
│   ├── viola/
│   ├── cello/
│   └── double bass/
├── woodwinds/
│   ├── flute/
│   ├── clarinet/
│   ├── oboe/
│   ├── bassoon/
│   └── saxophone/
├── brass/
│   ├── trumpet/
│   ├── french horn/
│   ├── trombone/
│   └── tuba/
└── percussion/
    ├── timpani/
    ├── xylophone/
    └── glockenspiel/
```

### Available Instruments (15 total)

| Family | Instruments | Notes |
|--------|-------------|-------|
| **Strings** (4) | Violin, Viola, Cello, Double Bass | Bowed instruments with warm tones |
| **Woodwinds** (5) | Flute, Clarinet, Oboe, Bassoon, Saxophone | Airy, expressive sounds |
| **Brass** (4) | Trumpet, French Horn, Trombone, Tuba | Bold, powerful tones |
| **Percussion** (3) | Timpani, Xylophone, Glockenspiel | Rhythmic and melodic struck sounds |

### Instrument Library API

The `instrumentLibrary` singleton (`client/src/lib/instrumentLibrary.ts`) provides access to all instruments and their samples:

```typescript
import { instrumentLibrary } from '@/lib/instrumentLibrary';

// Get an instrument
const violin = instrumentLibrary.getInstrument('violin');

// Get all samples for an instrument
const samples = instrumentLibrary.getSamples('violin');
// Returns: [{ note: 'C5', path: '...', ... }, ...]

// Get instruments by family
const strings = instrumentLibrary.getInstrumentsByFamily('strings');

// Get sample path for a specific note
const path = instrumentLibrary.getSamplePath('violin', 'C5');
```

### Important: Sample Availability

**Only use notes that have actual sample files.** Each instrument has a limited set of sampled notes. Using notes without samples will result in silence or fallback to synthesis.

```typescript
// ✅ CORRECT: Use available notes from the library
const samples = instrumentLibrary.getSamples('violin');
const availableNotes = samples.map(s => s.note);
// ['C5', 'D5', 'E5', 'G4', 'A4']

// ❌ WRONG: Don't assume arbitrary notes exist
const note = 'B4'; // May not have a sample!
```

### Removed Instruments

The following instruments have been removed due to sample issues:
- **Guitar** - Samples did not play correctly
- **Banjo** - Samples did not play correctly
- **Harp** - Replaced with other instruments

---

## Melody Library

### Overview

The **Melody Library** (`client/src/lib/melodyLibrary.ts`) provides a centralized collection of musical patterns that can be used across multiple games. This promotes consistency and allows any instrument to play any melody.

### Location

```
client/src/lib/melodyLibrary.ts
```

### Features

- **60+ melodic patterns** organized by difficulty and key
- **Transposition utilities** to adapt melodies to different instrument ranges
- **Pattern types**: melody, arpeggio, scale, fanfare, sustained, pizzicato, rhythm, trill
- **Difficulty levels**: beginner, intermediate, advanced
- **Musical keys**: C Major, A Minor, G Major, C Pentatonic

### Basic Usage

```typescript
import { melodyLibrary, transposeMelody, Melody } from '@/lib/melodyLibrary';

// Get a random melody
const melody = melodyLibrary.getRandomMelody('beginner');

// Get melodies by pattern type
const arpeggios = melodyLibrary.getMelodiesByPattern('arpeggio');

// Get melodies by key
const cMajorMelodies = melodyLibrary.getMelodiesByKey('C_MAJOR');

// Transpose a melody to fit an instrument's range
const transposed = transposeMelody(melody.notes, 'C4', 'G5');
```

### Melody Structure

```typescript
interface Melody {
  id: string;           // Unique identifier
  name: string;         // Display name
  notes: string[];      // Array of notes (e.g., ["C4", "E4", "G4"])
  pattern: PatternType; // Type of pattern
  difficulty: Difficulty;
  description: string;  // Human-readable description
  key: "C_MAJOR" | "A_MINOR" | "G_MAJOR" | "C_PENTATONIC";
  tempo?: "slow" | "medium" | "fast";
}
```

### Pattern Types

| Pattern | Description | Typical Use |
|---------|-------------|-------------|
| `melody` | Flowing melodic lines | General musical phrases |
| `arpeggio` | Broken chord patterns | Harmonic exercises |
| `scale` | Stepwise motion | Technical passages |
| `fanfare` | Bold, accented notes | Dramatic moments |
| `sustained` | Long held tones | Instrument recognition |
| `pizzicato` | Short, plucked notes | Rhythmic variety |
| `rhythm` | Varied note lengths | Rhythmic exercises |
| `trill` | Rapid alternating notes | Ornamental passages |

### Best Practice: Use Available Samples Only

When using the melody library with instruments, **always generate patterns from actual available samples** rather than transposing arbitrary notes:

```typescript
// ✅ RECOMMENDED: Build patterns from available notes
const instrument = instrumentLibrary.getInstrument('violin');
const samples = instrumentLibrary.getSamples('violin');
const availableNotes = samples.map(s => s.note);

// Create a pattern using only available notes
const pattern = [
  availableNotes[0],
  availableNotes[1], 
  availableNotes[2],
  availableNotes[1],
  availableNotes[0]
];
```

---

## Volume and Gain System

### ⚠️ Critical Discovery: Web Audio API Gain Limits

The Web Audio API **supports gain values greater than 1.0** for amplification. This is important because:

1. Many Philharmonia samples are recorded at different volumes
2. Some instruments are naturally quieter than others
3. Volume normalization requires boosting quieter instruments

### The Problem We Solved

Initially, volume was capped at 1.0:

```typescript
// ❌ OLD CODE - Volume capped at 1.0
const getNormalizedVolume = (instrumentName: string, baseVolume: number): number => {
  const normalizer = INSTRUMENT_VOLUME_NORMALIZATION[instrumentName] || 1.0;
  return Math.min(1.0, baseVolume * normalizer);  // Cap prevents amplification!
};
```

This meant that no matter how high the volume multipliers were set, the effective volume could never exceed 1.0.

### The Solution

Remove the cap to allow proper amplification:

```typescript
// ✅ CORRECT - Allow amplification above 1.0
const getNormalizedVolume = (instrumentName: string, baseVolume: number): number => {
  const normalizer = INSTRUMENT_VOLUME_NORMALIZATION[instrumentName] || 1.0;
  return baseVolume * normalizer;  // Web Audio API handles values > 1.0
};
```

### Volume Normalization Per Instrument

Different instruments require different volume multipliers to sound balanced:

```typescript
const INSTRUMENT_VOLUME_NORMALIZATION: Record<string, number> = {
  // Strings
  'violin': 9.0,
  'viola': 9.9,
  'cello': 8.7,
  'double-bass': 11.4,  // Much quieter samples need bigger boost
  
  // Woodwinds
  'flute': 7.8,
  'clarinet': 8.1,
  'oboe': 7.2,
  'bassoon': 9.9,
  'saxophone': 6.9,
  
  // Brass
  'trumpet': 6.0,
  'french-horn': 7.8,
  'trombone': 6.3,
  'tuba': 8.1,
  
  // Percussion
  'timpani': 12.0,      // Needs significant boost
  'xylophone': 7.2,
  'glockenspiel': 5.4,  // Naturally bright/loud
};
```

### How Volume Calculation Works

```
Final Volume = (UI Slider Value / 100) × Instrument Multiplier

Example:
- UI Slider at 50%
- Violin multiplier: 9.0
- Final volume: 0.5 × 9.0 = 4.5 (amplified)
```

### Guidelines for Volume Multipliers

| Scenario | Multiplier Range | Notes |
|----------|------------------|-------|
| Naturally loud instruments | 5.0 - 7.0 | Trumpet, glockenspiel |
| Medium volume instruments | 7.0 - 9.0 | Most instruments |
| Quiet instruments | 9.0 - 12.0 | Double bass, timpani |

### Web Audio API Technical Note

The `GainNode` in Web Audio API accepts any positive value:
- `0.0` = silence
- `1.0` = unity gain (no change)
- `> 1.0` = amplification
- Very high values may cause clipping/distortion

---

## Integration Examples

### Example 1: Playing an Instrument with Proper Volume

```typescript
import { instrumentLibrary } from '@/lib/instrumentLibrary';
import { usePhilharmoniaInstruments } from '@/hooks/usePhilharmoniaInstruments';

function MyGame() {
  const { playNote, isLoading } = usePhilharmoniaInstruments(['violin', 'flute']);
  
  const VOLUME_MULTIPLIERS = {
    'violin': 9.0,
    'flute': 7.8,
  };
  
  const playWithVolume = async (instrument: string, note: string, uiVolume: number) => {
    const multiplier = VOLUME_MULTIPLIERS[instrument] || 1.0;
    const finalVolume = (uiVolume / 100) * multiplier;
    
    await playNote(instrument, note, { volume: finalVolume });
  };
  
  return (
    <button onClick={() => playWithVolume('violin', 'C5', 50)}>
      Play Violin
    </button>
  );
}
```

### Example 2: Using Melody Library with Safe Note Selection

```typescript
import { instrumentLibrary } from '@/lib/instrumentLibrary';

function generateSafePattern(instrumentName: string): string[] {
  // Get only the notes that have samples
  const samples = instrumentLibrary.getSamples(instrumentName);
  const availableNotes = samples.map(s => s.note);
  
  if (availableNotes.length < 3) {
    return availableNotes; // Not enough notes for a pattern
  }
  
  // Create a simple up-and-down pattern
  return [
    availableNotes[0],
    availableNotes[1],
    availableNotes[2],
    availableNotes[1],
    availableNotes[0],
  ];
}

// Usage
const violinPattern = generateSafePattern('violin');
// Result: ['G4', 'A4', 'C5', 'A4', 'G4'] (actual available notes)
```

### Example 3: Complete Game Integration

See `client/src/components/InstrumentDetectiveGame.tsx` for a complete implementation that:
- Dynamically builds instrument data from the library
- Generates patterns using only available notes
- Applies volume normalization correctly
- Handles multiple difficulty levels

---

## File Reference

| File | Purpose |
|------|---------|
| `client/src/lib/instrumentLibrary.ts` | Instrument catalog and sample metadata |
| `client/src/lib/melodyLibrary.ts` | Central melody pattern collection |
| `client/src/lib/sampleAudioService.ts` | Audio loading and playback |
| `client/src/hooks/usePhilharmoniaInstruments.ts` | React hook for instruments |
| `client/public/audio/philharmonia/` | Audio sample files |

---

## Troubleshooting

### Sounds Not Playing

1. **Check sample availability**: Use `instrumentLibrary.getSamples()` to see what notes exist
2. **Verify file paths**: Check browser Network tab for 404 errors
3. **Check volume**: Ensure volume multiplier is applied correctly (not capped at 1.0)

### Sounds Too Quiet

1. **Remove Math.min cap**: Ensure `getNormalizedVolume` doesn't cap at 1.0
2. **Increase multipliers**: Adjust `INSTRUMENT_VOLUME_NORMALIZATION` values
3. **Check UI slider**: Make sure slider value is being used correctly

### Sounds Partially Playing

1. **Use only available notes**: Don't transpose to notes without samples
2. **Check sample loading**: Ensure samples finish loading before playing
3. **Verify sample names**: Use consistent naming from `instrumentLibrary.getSampleName()`

---

## Summary

- **Sound Library**: Centralized Philharmonia samples in `client/public/audio/philharmonia/`
- **Melody Library**: Reusable patterns in `client/src/lib/melodyLibrary.ts`
- **Volume System**: Web Audio API supports gain > 1.0 — don't cap volume at 1.0!
- **Best Practice**: Always use notes that have actual samples in the library

For more details, see:
- `AUDIO_SYSTEM_README.md` - Overview and quick start
- `INSTRUMENT_LIBRARY_GUIDE.md` - Detailed API reference

