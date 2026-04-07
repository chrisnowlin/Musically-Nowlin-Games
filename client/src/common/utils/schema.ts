// Game state types (for in-memory state management)
export type AnimalCharacter = {
  id: string;
  name: string;
  color: string;
  instrument: string;
};

export type GameRound = {
  characters: AnimalCharacter[];
  pitches: number[]; // Hz frequencies
  question: "higher" | "lower";
  correctAnswer: number; // 1-based index of correct character
};

export type GameState = {
  currentRound: GameRound | null;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: {
    show: boolean;
    isCorrect: boolean;
    selectedCharacter: number | null; // 1-based index
  } | null;
};

// Musical notes with frequencies (two octave range C4-C6)
export const MUSICAL_NOTES = [
  { note: "C4", frequency: 261.63 },
  { note: "D4", frequency: 293.66 },
  { note: "E4", frequency: 329.63 },
  { note: "F4", frequency: 349.23 },
  { note: "G4", frequency: 392.00 },
  { note: "A4", frequency: 440.00 },
  { note: "B4", frequency: 493.88 },
  { note: "C5", frequency: 523.25 },
  { note: "D5", frequency: 587.33 },
  { note: "E5", frequency: 659.25 },
  { note: "F5", frequency: 698.46 },
  { note: "G5", frequency: 783.99 },
  { note: "A5", frequency: 880.00 },
  { note: "B5", frequency: 987.77 },
  { note: "C6", frequency: 1046.50 },
];

// Animal characters with their instruments
export const ANIMAL_CHARACTERS: AnimalCharacter[] = [
  { id: "elephant", name: "Ellie Elephant", color: "chart-2", instrument: "Trumpet" },
  { id: "giraffe", name: "Gary Giraffe", color: "chart-3", instrument: "Violin" },
  { id: "monkey", name: "Milo Monkey", color: "chart-4", instrument: "Flute" },
  { id: "bird", name: "Bella Bird", color: "chart-5", instrument: "Clarinet" },
  { id: "lion", name: "Leo Lion", color: "chart-6", instrument: "Oboe" },
];

