// Game logic utilities for Finish the Tune

import type { NoteEvent, MelodyPattern, Difficulty, DIFFICULTY_CONFIG as DifficultyConfig } from './types';

// Note frequencies (C major scale)
export const NOTES: Record<string, number> = {
  C: 262,
  D: 294,
  E: 330,
  F: 349,
  G: 392,
  A: 440,
  B: 494,
  C2: 523,
};

export const NOTE_FREQS = Object.values(NOTES).sort((a, b) => a - b);

// Reverse lookup: frequency to note name
export const FREQ_TO_NOTE: Record<number, string> = Object.fromEntries(
  Object.entries(NOTES).map(([name, freq]) => [freq, name])
);

// Helper to get note name from frequency
export function getNoteName(freq: number): string {
  return FREQ_TO_NOTE[freq] || '?';
}

// Helper to create notes with duration (default 0.4s)
export const n = (freq: number, duration: number = 0.4): NoteEvent => ({ freq, duration });

// Common melodic patterns focused on RESOLUTION to C (Tonic) with RHYTHM
export const MELODY_PATTERNS: MelodyPattern[] = [
  {
    start: [n(NOTES.G, 0.4), n(NOTES.F, 0.4), n(NOTES.E, 0.6), n(NOTES.D, 0.2)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "Walking Home" },
    hint: "The music is walking down the stairs. What is the last step?"
  },
  {
    start: [n(NOTES.C, 0.3), n(NOTES.E, 0.3), n(NOTES.G, 0.6)],
    endings: { correct: [n(NOTES.C2, 0.8)], name: "Jump to the Top" },
    hint: "We are jumping up the chord. Finish the jump to the high C!"
  },
  {
    start: [n(NOTES.C, 0.4), n(NOTES.G, 0.4), n(NOTES.G, 0.8)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "There and Back" },
    hint: "We went far away to G. Now let's come back Home to C."
  },
  {
    start: [n(NOTES.E, 0.3), n(NOTES.D, 0.3), n(NOTES.C, 0.3), n(NOTES.D, 0.3)],
    endings: { correct: [n(NOTES.C, 1.0)], name: "Wiggle Home" },
    hint: "The melody is wiggling around the bottom. End on the lowest note."
  },
  {
    start: [n(NOTES.C, 0.4), n(NOTES.C, 0.4), n(NOTES.G, 0.4), n(NOTES.G, 0.4), n(NOTES.A, 0.4), n(NOTES.A, 0.4)],
    endings: { correct: [n(NOTES.G, 0.8)], name: "Twinkle Pause" },
    hint: "Twinkle Twinkle Little Star... how does the phrase end?"
  },
  {
    start: [n(NOTES.D, 0.4), n(NOTES.E, 0.4), n(NOTES.F, 0.6), n(NOTES.D, 0.2)],
    endings: { correct: [n(NOTES.C, 0.8)], name: "Step Down Home" },
    hint: "We are hovering above home. Take one step down to finish."
  },
  {
    start: [n(NOTES.C2, 0.2), n(NOTES.B, 0.2), n(NOTES.A, 0.2), n(NOTES.G, 0.6)],
    endings: { correct: [n(NOTES.F, 0.2), n(NOTES.E, 0.2), n(NOTES.D, 0.2), n(NOTES.C, 0.8)], name: "The Long Fall" },
    hint: "Slide all the way down the slide to the bottom!"
  },
  {
    start: [n(NOTES.G, 0.3), n(NOTES.G, 0.3), n(NOTES.E, 0.6)],
    endings: { correct: [n(NOTES.D, 0.3), n(NOTES.D, 0.3), n(NOTES.C, 0.8)], name: "Skipping Home" },
    hint: "We are skipping down. Find the last skip to C."
  }
];

// Difficulty configuration
export const DIFFICULTY_CONFIG: typeof DifficultyConfig = {
  easy: { optionCount: 2, label: 'Easy' },
  medium: { optionCount: 3, label: 'Medium' },
  hard: { optionCount: 4, label: 'Hard' },
};

/**
 * Generate wrong endings for a melody pattern
 * @param correctEnding The correct ending notes
 * @param count Number of wrong endings to generate
 */
export function generateWrongEndings(correctEnding: NoteEvent[], count: number = 3): NoteEvent[][] {
  const allNotes = Object.values(NOTES);
  const wrongEndings: NoteEvent[][] = [];

  for (let i = 0; i < count; i++) {
    const wrongEnding: NoteEvent[] = [];
    for (let j = 0; j < correctEnding.length; j++) {
      let randomNoteFreq;
      let attempts = 0;
      const isLastNote = j === correctEnding.length - 1;

      do {
        randomNoteFreq = allNotes[Math.floor(Math.random() * allNotes.length)];
        attempts++;
      } while (
        attempts < 20 &&
        (
          // Avoid exact duplicate of correct note at this position
          (randomNoteFreq === correctEnding[j].freq) ||
          // If it's the last note, avoid resolving to C/C2 (tonic)
          (isLastNote && (randomNoteFreq === NOTES.C || randomNoteFreq === NOTES.C2))
        )
      );
      // Preserve the rhythm (duration) of the correct ending
      wrongEnding.push({ freq: randomNoteFreq, duration: correctEnding[j].duration });
    }
    wrongEndings.push(wrongEnding);
  }

  return wrongEndings;
}

/**
 * Shuffle options with the correct ending mixed in
 */
export function shuffleOptions(correctEnding: NoteEvent[], wrongEndings: NoteEvent[][]): NoteEvent[][] {
  return [...wrongEndings, correctEnding].sort(() => Math.random() - 0.5);
}

/**
 * Get a random melody pattern
 */
export function getRandomPattern(): MelodyPattern {
  return MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];
}

/**
 * Calculate total melody count for progress tracking
 */
export const TOTAL_MELODIES = MELODY_PATTERNS.length;

/**
 * Check if two note arrays are equal
 */
export function areEndingsEqual(a: NoteEvent[], b: NoteEvent[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((note, i) => note.freq === b[i].freq && note.duration === b[i].duration);
}
