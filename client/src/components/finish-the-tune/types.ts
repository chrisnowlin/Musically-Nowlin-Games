// Shared TypeScript interfaces for Finish the Tune game

export interface NoteEvent {
  freq: number;
  duration: number;
}

export interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
}

export interface Question {
  melodyStart: NoteEvent[];
  correctEnding: NoteEvent[];
  wrongEndings: NoteEvent[][];
  description: string;
  hint: string;
}

export interface MelodyPattern {
  start: NoteEvent[];
  endings: {
    correct: NoteEvent[];
    name: string;
  };
  hint: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface FinishTheTuneState {
  // Core game
  currentQuestion: Question | null;
  shuffledOptions: NoteEvent[][];
  score: number;
  totalQuestions: number;

  // Playback
  isPlaying: boolean;
  hasPlayedMelody: boolean;
  activeNoteIndex: number;
  playingSequenceId: string | null;
  selectedOptionIndex: number | null;
  feedback: FeedbackState | null;

  // Gamification
  streak: number;
  bestStreak: number;
  completedMelodies: Set<string>;
  wrongQuestionQueue: Question[];
  achievements: string[];
  highScore: number;

  // Settings
  difficulty: Difficulty;
  playbackSpeed: number; // 0.5 = slow, 1.0 = normal
  autoPlay: boolean;
  volume: number;
  loopMelody: boolean;
  showNoteNames: boolean;

  // Timed mode
  timedMode: boolean;
  timeRemaining: number;

  // Accessibility
  focusedOptionIndex: number;

  // Compare mode
  compareMode: boolean;
  compareSelections: number[]; // Indices of selected options for comparison (max 2)
}

export type GameAction =
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<PersistedState> }
  | { type: 'NEW_QUESTION'; payload: { question: Question; shuffledOptions: NoteEvent[][] } }
  | { type: 'SELECT_ANSWER'; payload: { index: number; isCorrect: boolean; melodyName: string } }
  | { type: 'PLAY_MELODY'; payload: { sequenceId: string } }
  | { type: 'UPDATE_ACTIVE_NOTE'; payload: number }
  | { type: 'STOP_PLAYING' }
  | { type: 'SET_HAS_PLAYED_MELODY' }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'TOGGLE_LOOP_MELODY' }
  | { type: 'TOGGLE_SHOW_NOTE_NAMES' }
  | { type: 'TOGGLE_TIMED_MODE' }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_FOCUSED_OPTION'; payload: number }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'RESET_GAME' }
  | { type: 'END_TIMED_GAME' }
  | { type: 'TOGGLE_COMPARE_MODE' }
  | { type: 'ADD_COMPARE_SELECTION'; payload: number }
  | { type: 'CLEAR_COMPARE_SELECTIONS' };

export interface PersistedState {
  highScore: number;
  bestStreak: number;
  achievements: string[];
  completedMelodies: string[]; // Serialized from Set
  settings: {
    difficulty: Difficulty;
    playbackSpeed: number;
    autoPlay: boolean;
    volume: number;
    loopMelody: boolean;
    showNoteNames: boolean;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: FinishTheTuneState) => boolean;
}

// Difficulty configuration
export const DIFFICULTY_CONFIG: Record<Difficulty, { optionCount: number; label: string }> = {
  easy: { optionCount: 2, label: 'Easy' },
  medium: { optionCount: 3, label: 'Medium' },
  hard: { optionCount: 4, label: 'Hard' },
};

// Color mapping for pitch-based gradient
export const PITCH_COLORS: Record<string, string> = {
  C: '#ef4444',   // red-500
  D: '#f97316',   // orange-500
  E: '#eab308',   // yellow-500
  F: '#22c55e',   // green-500
  G: '#14b8a6',   // teal-500
  A: '#3b82f6',   // blue-500
  B: '#6366f1',   // indigo-500
  C2: '#8b5cf6',  // violet-500
};
