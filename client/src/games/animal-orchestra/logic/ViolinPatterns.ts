/**
 * ViolinPatterns - Musical patterns for the violin
 * 
 * Each pattern is an array of notes that can be played in sequence.
 */

import type { Note } from './ViolinAudioService';

export interface Pattern {
  id: string;
  name: string;
  description: string;
  notes: Note[];
  tempoMs: number; // Milliseconds per beat
}

// C Major Scale (ascending) - C4 D4 E4 F4 G4 A4 B4 C5
export const C_MAJOR_SCALE: Pattern = {
  id: 'c-major-scale',
  name: 'C Major Scale',
  description: 'A bright, happy ascending scale',
  tempoMs: 400,
  notes: [
    { name: 'C', octave: 4, duration: '025' },
    { name: 'D', octave: 4, duration: '025' },
    { name: 'E', octave: 4, duration: '025' },
    { name: 'F', octave: 4, duration: '025' },
    { name: 'G', octave: 4, duration: '025' },
    { name: 'A', octave: 4, duration: '025' },
    { name: 'B', octave: 4, duration: '025' },
    { name: 'C', octave: 5, duration: '05' },
  ],
};

// Simple Arpeggio - C E G C
export const C_MAJOR_ARPEGGIO: Pattern = {
  id: 'c-major-arpeggio',
  name: 'C Major Arpeggio',
  description: 'A flowing broken chord',
  tempoMs: 500,
  notes: [
    { name: 'C', octave: 4, duration: '025' },
    { name: 'E', octave: 4, duration: '025' },
    { name: 'G', octave: 4, duration: '025' },
    { name: 'C', octave: 5, duration: '05' },
  ],
};

// Twinkle Twinkle opening phrase - C C G G A A G
export const TWINKLE_TWINKLE: Pattern = {
  id: 'twinkle-twinkle',
  name: 'Twinkle Twinkle',
  description: 'The famous lullaby opening',
  tempoMs: 450,
  notes: [
    { name: 'C', octave: 4, duration: '025' },
    { name: 'C', octave: 4, duration: '025' },
    { name: 'G', octave: 4, duration: '025' },
    { name: 'G', octave: 4, duration: '025' },
    { name: 'A', octave: 4, duration: '025' },
    { name: 'A', octave: 4, duration: '025' },
    { name: 'G', octave: 4, duration: '05' },
  ],
};

// G Major Scale - G3 A3 B3 C4 D4 E4 Fs4 G4
export const G_MAJOR_SCALE: Pattern = {
  id: 'g-major-scale',
  name: 'G Major Scale',
  description: 'A warm, resonant scale starting on the open G string',
  tempoMs: 400,
  notes: [
    { name: 'G', octave: 3, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'A', octave: 3, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'B', octave: 3, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'C', octave: 4, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'D', octave: 4, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'E', octave: 4, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'Fs', octave: 4, duration: '025', dynamic: 'mezzo-forte' },
    { name: 'G', octave: 4, duration: '05', dynamic: 'mezzo-forte' },
  ],
};

// Short fanfare - G4 G4 G4 C5
export const FANFARE: Pattern = {
  id: 'fanfare',
  name: 'Fanfare',
  description: 'A triumphant call',
  tempoMs: 350,
  notes: [
    { name: 'G', octave: 4, duration: '025', dynamic: 'forte' },
    { name: 'G', octave: 4, duration: '025', dynamic: 'forte' },
    { name: 'G', octave: 4, duration: '025', dynamic: 'forte' },
    { name: 'C', octave: 5, duration: '1', dynamic: 'mezzo-forte' },
  ],
};

// All available patterns
export const VIOLIN_PATTERNS: Pattern[] = [
  TWINKLE_TWINKLE,
  C_MAJOR_SCALE,
  C_MAJOR_ARPEGGIO,
  G_MAJOR_SCALE,
  FANFARE,
];

/**
 * Get all unique notes from all patterns (for preloading)
 */
export function getAllPatternNotes(): Note[] {
  const noteSet = new Map<string, Note>();
  
  for (const pattern of VIOLIN_PATTERNS) {
    for (const note of pattern.notes) {
      const key = `${note.name}${note.octave}_${note.duration}_${note.dynamic || 'mezzo-forte'}`;
      if (!noteSet.has(key)) {
        noteSet.set(key, note);
      }
    }
  }
  
  return Array.from(noteSet.values());
}

