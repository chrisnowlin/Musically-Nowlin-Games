/**
 * Central Melody Library
 * 
 * A shared collection of melodic patterns that can be used across multiple games.
 * Melodies are defined in a neutral middle range and can be transposed to fit
 * any instrument's playable range.
 * 
 * All melodies follow clear tonal centers (primarily C major and A minor)
 * with proper harmonic relationships.
 */

export type PatternType = 
  | "melody" 
  | "arpeggio" 
  | "scale" 
  | "fanfare" 
  | "sustained" 
  | "pizzicato" 
  | "rhythm" 
  | "trill";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Melody {
  id: string;
  name: string;
  notes: string[];
  pattern: PatternType;
  difficulty: Difficulty;
  description: string;
  key: "C_MAJOR" | "A_MINOR" | "G_MAJOR" | "C_PENTATONIC";
  tempo?: "slow" | "medium" | "fast";
}

// Note utilities for transposition
const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHROMATIC_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Parse a note string like "C4" into note name and octave
 */
export function parseNote(noteStr: string): { note: string; octave: number } {
  const match = noteStr.match(/^([A-G]#?)(\d)$/);
  if (!match) {
    throw new Error(`Invalid note format: ${noteStr}`);
  }
  return { note: match[1], octave: parseInt(match[2]) };
}

/**
 * Convert a note to its MIDI number for easier transposition
 */
export function noteToMidi(noteStr: string): number {
  const { note, octave } = parseNote(noteStr);
  const noteIndex = CHROMATIC_ORDER.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Convert a MIDI number back to a note string
 */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${CHROMATIC_ORDER[noteIndex]}${octave}`;
}

/**
 * Transpose a melody to fit within a target range
 */
export function transposeMelody(
  notes: string[], 
  targetLowNote: string, 
  targetHighNote: string
): string[] {
  const targetLow = noteToMidi(targetLowNote);
  const targetHigh = noteToMidi(targetHighNote);
  const targetCenter = Math.floor((targetLow + targetHigh) / 2);
  
  // Find the center of the original melody
  const midiNotes = notes.map(noteToMidi);
  const melodyLow = Math.min(...midiNotes);
  const melodyHigh = Math.max(...midiNotes);
  const melodyCenter = Math.floor((melodyLow + melodyHigh) / 2);
  
  // Calculate transposition to center the melody in the target range
  let transposition = targetCenter - melodyCenter;
  
  // Adjust transposition to keep melody within bounds
  const transposedLow = melodyLow + transposition;
  const transposedHigh = melodyHigh + transposition;
  
  if (transposedLow < targetLow) {
    transposition += (targetLow - transposedLow);
  } else if (transposedHigh > targetHigh) {
    transposition -= (transposedHigh - targetHigh);
  }
  
  // Apply transposition
  return midiNotes.map(midi => midiToNote(midi + transposition));
}

/**
 * Get a random melody from the library, optionally filtered by difficulty
 */
export function getRandomMelody(difficulty?: Difficulty): Melody {
  let filtered = MELODY_LIBRARY;
  if (difficulty) {
    if (difficulty === "beginner") {
      filtered = MELODY_LIBRARY.filter(m => m.difficulty === "beginner");
    } else if (difficulty === "intermediate") {
      filtered = MELODY_LIBRARY.filter(m => m.difficulty === "beginner" || m.difficulty === "intermediate");
    }
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get melodies by pattern type
 */
export function getMelodiesByPattern(pattern: PatternType): Melody[] {
  return MELODY_LIBRARY.filter(m => m.pattern === pattern);
}

/**
 * Get melodies by key
 */
export function getMelodiesByKey(key: Melody["key"]): Melody[] {
  return MELODY_LIBRARY.filter(m => m.key === key);
}

// ============================================================================
// MELODY LIBRARY
// All melodies are defined in a middle range (C4-C5 area) for easy transposition
// ============================================================================

export const MELODY_LIBRARY: Melody[] = [
  // ============================================================================
  // C MAJOR MELODIES
  // ============================================================================
  
  // --- Beginner: Simple 3-5 note patterns ---
  {
    id: "cmaj-triad-up",
    name: "Rising Triad",
    notes: ["C4", "E4", "G4"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "C major triad ascending",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-triad-down",
    name: "Falling Triad",
    notes: ["G4", "E4", "C4"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "C major triad descending",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-triad-wave",
    name: "Triad Wave",
    notes: ["C4", "E4", "G4", "E4", "C4"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "C major triad up and down",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-step-up",
    name: "Three Steps Up",
    notes: ["C4", "D4", "E4"],
    pattern: "scale",
    difficulty: "beginner",
    description: "Stepwise ascending",
    key: "C_MAJOR",
    tempo: "slow"
  },
  {
    id: "cmaj-step-down",
    name: "Three Steps Down",
    notes: ["E4", "D4", "C4"],
    pattern: "scale",
    difficulty: "beginner",
    description: "Stepwise descending",
    key: "C_MAJOR",
    tempo: "slow"
  },
  {
    id: "cmaj-neighbor",
    name: "Neighbor Tones",
    notes: ["C4", "D4", "C4", "D4", "C4"],
    pattern: "melody",
    difficulty: "beginner",
    description: "Simple neighbor motion",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-repeated",
    name: "Steady Beat",
    notes: ["C4", "C4", "C4", "G4"],
    pattern: "rhythm",
    difficulty: "beginner",
    description: "Repeated notes with leap",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-long-tones",
    name: "Long Tones",
    notes: ["C4", "E4", "G4"],
    pattern: "sustained",
    difficulty: "beginner",
    description: "Held chord tones",
    key: "C_MAJOR",
    tempo: "slow"
  },
  {
    id: "cmaj-call",
    name: "Simple Call",
    notes: ["G4", "E4", "C4"],
    pattern: "fanfare",
    difficulty: "beginner",
    description: "Bold descending call",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-skip",
    name: "Skip and Step",
    notes: ["C4", "E4", "D4", "C4"],
    pattern: "melody",
    difficulty: "beginner",
    description: "Skip up, step down",
    key: "C_MAJOR",
    tempo: "medium"
  },

  // --- Intermediate: 5-8 note patterns ---
  {
    id: "cmaj-scale-up",
    name: "Ascending Scale",
    notes: ["C4", "D4", "E4", "F4", "G4"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "Five-note scale ascending",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-scale-down",
    name: "Descending Scale",
    notes: ["G4", "F4", "E4", "D4", "C4"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "Five-note scale descending",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-scale-wave",
    name: "Scale Wave",
    notes: ["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "Scale up and back down",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-arp-extended",
    name: "Extended Arpeggio",
    notes: ["C4", "E4", "G4", "C5", "G4", "E4", "C4"],
    pattern: "arpeggio",
    difficulty: "intermediate",
    description: "Full octave arpeggio",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-broken-chord",
    name: "Broken Chord",
    notes: ["C4", "G4", "E4", "C4", "G4", "E4"],
    pattern: "arpeggio",
    difficulty: "intermediate",
    description: "Rolled chord pattern",
    key: "C_MAJOR",
    tempo: "fast"
  },
  {
    id: "cmaj-fanfare",
    name: "Fanfare Call",
    notes: ["C4", "C4", "E4", "G4", "E4", "C4"],
    pattern: "fanfare",
    difficulty: "intermediate",
    description: "Triumphant fanfare",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-folk-tune",
    name: "Folk Tune",
    notes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4", "C4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Simple folk melody",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-waltz",
    name: "Waltz Pattern",
    notes: ["C4", "E4", "G4", "E4", "G4", "E4", "C4"],
    pattern: "rhythm",
    difficulty: "intermediate",
    description: "Lilting waltz rhythm",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-march",
    name: "March Theme",
    notes: ["C4", "C4", "G4", "G4", "E4", "E4", "C4"],
    pattern: "rhythm",
    difficulty: "intermediate",
    description: "Steady march rhythm",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-dance",
    name: "Dance Step",
    notes: ["C4", "D4", "E4", "G4", "E4", "D4", "C4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Light dance melody",
    key: "C_MAJOR",
    tempo: "fast"
  },
  {
    id: "cmaj-question",
    name: "Musical Question",
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "G4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Phrase ending on dominant",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-answer",
    name: "Musical Answer",
    notes: ["G4", "F4", "E4", "D4", "C4", "D4", "C4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Phrase resolving to tonic",
    key: "C_MAJOR",
    tempo: "medium"
  },

  // --- Advanced: 8+ note patterns ---
  {
    id: "cmaj-full-scale",
    name: "Full Scale",
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
    pattern: "scale",
    difficulty: "advanced",
    description: "Complete octave scale",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-scale-round",
    name: "Scale Round Trip",
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
    pattern: "scale",
    difficulty: "advanced",
    description: "Full scale up and down",
    key: "C_MAJOR",
    tempo: "fast"
  },
  {
    id: "cmaj-thirds",
    name: "Thirds Pattern",
    notes: ["C4", "E4", "D4", "F4", "E4", "G4", "F4", "A4", "G4", "B4", "C5"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Ascending in thirds",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-sequence",
    name: "Melodic Sequence",
    notes: ["C4", "D4", "E4", "D4", "E4", "F4", "E4", "F4", "G4", "F4", "G4", "A4", "G4"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Rising sequential pattern",
    key: "C_MAJOR",
    tempo: "medium"
  },
  {
    id: "cmaj-flourish",
    name: "Flourish",
    notes: ["C4", "E4", "G4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
    pattern: "trill",
    difficulty: "advanced",
    description: "Brilliant flourish",
    key: "C_MAJOR",
    tempo: "fast"
  },
  {
    id: "cmaj-cadenza",
    name: "Mini Cadenza",
    notes: ["G4", "A4", "B4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "D4", "E4", "C4"],
    pattern: "trill",
    difficulty: "advanced",
    description: "Virtuosic passage",
    key: "C_MAJOR",
    tempo: "fast"
  },
  {
    id: "cmaj-lyrical",
    name: "Lyrical Theme",
    notes: ["E4", "G4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Singing melodic line",
    key: "C_MAJOR",
    tempo: "slow"
  },
  {
    id: "cmaj-heroic",
    name: "Heroic Theme",
    notes: ["C4", "C4", "C4", "E4", "G4", "G4", "E4", "C4", "G4", "C5"],
    pattern: "fanfare",
    difficulty: "advanced",
    description: "Bold heroic fanfare",
    key: "C_MAJOR",
    tempo: "medium"
  },

  // ============================================================================
  // A MINOR MELODIES
  // ============================================================================
  
  // --- Beginner ---
  {
    id: "amin-triad-up",
    name: "Minor Rising",
    notes: ["A3", "C4", "E4"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "A minor triad ascending",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-triad-down",
    name: "Minor Falling",
    notes: ["E4", "C4", "A3"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "A minor triad descending",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-triad-wave",
    name: "Minor Wave",
    notes: ["A3", "C4", "E4", "C4", "A3"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "A minor triad wave",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-step",
    name: "Minor Steps",
    notes: ["A3", "B3", "C4", "B3", "A3"],
    pattern: "scale",
    difficulty: "beginner",
    description: "Stepwise minor motion",
    key: "A_MINOR",
    tempo: "slow"
  },
  {
    id: "amin-sustained",
    name: "Minor Long Tones",
    notes: ["A3", "C4", "E4"],
    pattern: "sustained",
    difficulty: "beginner",
    description: "Sustained minor chord",
    key: "A_MINOR",
    tempo: "slow"
  },

  // --- Intermediate ---
  {
    id: "amin-scale-up",
    name: "Minor Scale Up",
    notes: ["A3", "B3", "C4", "D4", "E4"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "Natural minor ascending",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-scale-wave",
    name: "Minor Scale Wave",
    notes: ["A3", "B3", "C4", "D4", "E4", "D4", "C4", "B3", "A3"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "Minor scale up and down",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-lament",
    name: "Lament",
    notes: ["E4", "D4", "C4", "B3", "A3", "B3", "C4", "A3"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Melancholy descending line",
    key: "A_MINOR",
    tempo: "slow"
  },
  {
    id: "amin-dance",
    name: "Minor Dance",
    notes: ["A3", "C4", "B3", "C4", "E4", "D4", "C4", "A3"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Lively minor dance",
    key: "A_MINOR",
    tempo: "fast"
  },
  {
    id: "amin-arp-extended",
    name: "Extended Minor Arp",
    notes: ["A3", "C4", "E4", "A4", "E4", "C4", "A3"],
    pattern: "arpeggio",
    difficulty: "intermediate",
    description: "Full minor arpeggio",
    key: "A_MINOR",
    tempo: "medium"
  },

  // --- Advanced ---
  {
    id: "amin-full-scale",
    name: "Full Minor Scale",
    notes: ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
    pattern: "scale",
    difficulty: "advanced",
    description: "Complete natural minor",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-passionate",
    name: "Passionate Theme",
    notes: ["A3", "C4", "E4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Expressive minor melody",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-dramatic",
    name: "Dramatic Line",
    notes: ["E4", "E4", "F4", "E4", "D4", "C4", "B3", "A3", "G3", "A3"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Intense dramatic phrase",
    key: "A_MINOR",
    tempo: "medium"
  },
  {
    id: "amin-flourish",
    name: "Minor Flourish",
    notes: ["A3", "B3", "C4", "D4", "E4", "F4", "E4", "D4", "C4", "B3", "A3"],
    pattern: "trill",
    difficulty: "advanced",
    description: "Rapid minor passage",
    key: "A_MINOR",
    tempo: "fast"
  },

  // ============================================================================
  // G MAJOR MELODIES
  // ============================================================================
  
  // --- Beginner ---
  {
    id: "gmaj-triad",
    name: "G Major Triad",
    notes: ["G3", "B3", "D4", "B3", "G3"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "G major arpeggio",
    key: "G_MAJOR",
    tempo: "medium"
  },
  {
    id: "gmaj-steps",
    name: "G Steps",
    notes: ["G3", "A3", "B3", "A3", "G3"],
    pattern: "scale",
    difficulty: "beginner",
    description: "G major neighbor tones",
    key: "G_MAJOR",
    tempo: "medium"
  },

  // --- Intermediate ---
  {
    id: "gmaj-scale",
    name: "G Major Scale",
    notes: ["G3", "A3", "B3", "C4", "D4", "C4", "B3", "A3", "G3"],
    pattern: "scale",
    difficulty: "intermediate",
    description: "G major scale wave",
    key: "G_MAJOR",
    tempo: "medium"
  },
  {
    id: "gmaj-pastoral",
    name: "Pastoral Theme",
    notes: ["G3", "B3", "D4", "G4", "D4", "B3", "A3", "G3"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Gentle pastoral melody",
    key: "G_MAJOR",
    tempo: "slow"
  },
  {
    id: "gmaj-jig",
    name: "Lively Jig",
    notes: ["G3", "A3", "B3", "D4", "B3", "G3", "A3", "B3", "G3"],
    pattern: "rhythm",
    difficulty: "intermediate",
    description: "Bouncy dance rhythm",
    key: "G_MAJOR",
    tempo: "fast"
  },

  // --- Advanced ---
  {
    id: "gmaj-full-scale",
    name: "Full G Scale",
    notes: ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
    pattern: "scale",
    difficulty: "advanced",
    description: "Complete G major scale",
    key: "G_MAJOR",
    tempo: "medium"
  },
  {
    id: "gmaj-brilliant",
    name: "Brilliant G",
    notes: ["G3", "B3", "D4", "G4", "F#4", "E4", "D4", "C4", "B3", "A3", "G3"],
    pattern: "trill",
    difficulty: "advanced",
    description: "Virtuosic G major run",
    key: "G_MAJOR",
    tempo: "fast"
  },

  // ============================================================================
  // C PENTATONIC MELODIES (no half steps - great for beginners)
  // ============================================================================
  
  // --- Beginner ---
  {
    id: "pent-simple",
    name: "Pentatonic Simple",
    notes: ["C4", "D4", "E4", "G4", "A4"],
    pattern: "scale",
    difficulty: "beginner",
    description: "Simple pentatonic scale",
    key: "C_PENTATONIC",
    tempo: "medium"
  },
  {
    id: "pent-wave",
    name: "Pentatonic Wave",
    notes: ["C4", "E4", "G4", "E4", "C4"],
    pattern: "arpeggio",
    difficulty: "beginner",
    description: "Pentatonic wave pattern",
    key: "C_PENTATONIC",
    tempo: "medium"
  },

  // --- Intermediate ---
  {
    id: "pent-folk",
    name: "Folk Song",
    notes: ["G4", "E4", "G4", "A4", "G4", "E4", "D4", "C4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Folk-like pentatonic tune",
    key: "C_PENTATONIC",
    tempo: "medium"
  },
  {
    id: "pent-asian",
    name: "Eastern Melody",
    notes: ["A4", "G4", "E4", "D4", "C4", "D4", "E4", "G4"],
    pattern: "melody",
    difficulty: "intermediate",
    description: "Asian-inspired melody",
    key: "C_PENTATONIC",
    tempo: "slow"
  },
  {
    id: "pent-blues",
    name: "Blues Riff",
    notes: ["C4", "E4", "G4", "A4", "G4", "E4", "D4", "C4"],
    pattern: "rhythm",
    difficulty: "intermediate",
    description: "Bluesy pentatonic riff",
    key: "C_PENTATONIC",
    tempo: "medium"
  },

  // --- Advanced ---
  {
    id: "pent-cascade",
    name: "Pentatonic Cascade",
    notes: ["C5", "A4", "G4", "E4", "D4", "C4", "D4", "E4", "G4", "A4", "C5"],
    pattern: "melody",
    difficulty: "advanced",
    description: "Flowing pentatonic cascade",
    key: "C_PENTATONIC",
    tempo: "medium"
  },
  {
    id: "pent-jazz",
    name: "Jazz Lick",
    notes: ["G4", "A4", "C5", "A4", "G4", "E4", "D4", "E4", "G4", "E4", "C4"],
    pattern: "trill",
    difficulty: "advanced",
    description: "Jazz-influenced run",
    key: "C_PENTATONIC",
    tempo: "fast"
  },
];

/**
 * Melody Library singleton for easy access
 */
class MelodyLibraryClass {
  private melodies: Melody[] = MELODY_LIBRARY;

  getAllMelodies(): Melody[] {
    return this.melodies;
  }

  getMelodyById(id: string): Melody | undefined {
    return this.melodies.find(m => m.id === id);
  }

  getRandomMelody(difficulty?: Difficulty): Melody {
    return getRandomMelody(difficulty);
  }

  getMelodiesByDifficulty(difficulty: Difficulty): Melody[] {
    if (difficulty === "beginner") {
      return this.melodies.filter(m => m.difficulty === "beginner");
    } else if (difficulty === "intermediate") {
      return this.melodies.filter(m => m.difficulty === "beginner" || m.difficulty === "intermediate");
    }
    return this.melodies;
  }

  getMelodiesByPattern(pattern: PatternType): Melody[] {
    return getMelodiesByPattern(pattern);
  }

  getMelodiesByKey(key: Melody["key"]): Melody[] {
    return getMelodiesByKey(key);
  }

  transposeMelodyToRange(melody: Melody, lowNote: string, highNote: string): string[] {
    return transposeMelody(melody.notes, lowNote, highNote);
  }

  /**
   * Get count of melodies by category
   */
  getStats(): { total: number; byDifficulty: Record<Difficulty, number>; byKey: Record<string, number> } {
    const byDifficulty: Record<Difficulty, number> = {
      beginner: this.melodies.filter(m => m.difficulty === "beginner").length,
      intermediate: this.melodies.filter(m => m.difficulty === "intermediate").length,
      advanced: this.melodies.filter(m => m.difficulty === "advanced").length,
    };

    const byKey: Record<string, number> = {};
    for (const melody of this.melodies) {
      byKey[melody.key] = (byKey[melody.key] || 0) + 1;
    }

    return {
      total: this.melodies.length,
      byDifficulty,
      byKey,
    };
  }
}

export const melodyLibrary = new MelodyLibraryClass();
export default melodyLibrary;

