/**
 * Compatibility logic for Rhythm Notation Master
 * ID: rhythm-004
 */

import {
  DIFFICULTY_PROGRESSIONS,
  NOTATION_MODES,
  RHYTHM_DEFINITIONS,
  RHYTHM_PATTERNS,
  TIME_SIGNATURES,
  getMaxDifficultyForMode,
  type GameMode,
} from './modes';

type NotationModeId = keyof typeof NOTATION_MODES;
type GameStatus = 'playing' | 'completed' | 'failed';

type Rhythm004QuestionType =
  | 'identify-note'
  | 'identify-rest'
  | 'count-beats'
  | 'match-symbol'
  | 'identify-tuplet'
  | 'count-tuplet-notes'
  | 'tuplet-division'
  | 'convert-equivalent'
  | 'replace-notes'
  | 'simplify-rhythm'
  | 'identify-pattern'
  | 'quick-count'
  | 'sight-read';

export interface Rhythm004Round {
  id: string;
  mode: NotationModeId;
  difficulty: number;
  questionType: Rhythm004QuestionType;
  question: string;
  answer: string;
  options?: string[];
  noteValue?: keyof typeof RHYTHM_DEFINITIONS;
  tupletType?: keyof typeof RHYTHM_DEFINITIONS;
  sourcePattern?: string[];
  targetPattern?: string[];
  originalNote?: keyof typeof RHYTHM_DEFINITIONS;
  replacementNote?: keyof typeof RHYTHM_DEFINITIONS;
  pattern?: string[];
  timeLimit?: number;
  beatValue?: number;
  timeSignature?: keyof typeof TIME_SIGNATURES;
}

export interface Rhythm004State {
  currentMode: GameMode;
  score: number;
  lives: number;
  currentRound: number;
  totalRounds: number;
  difficulty: number;
  gameStatus: GameStatus;
  streak: number;
  currentRoundData?: Rhythm004Round;
}

const BASIC_VALUES = ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter'] as const;
const TUPLET_VALUES = ['triplet-eighth', 'triplet-quarter', 'triplet-sixteenth', 'duplet', 'quintuplet', 'sextuplet'] as const;
const SPEED_PATTERNS = Object.values(RHYTHM_PATTERNS);
const TIME_SIGNATURE_KEYS = Object.keys(TIME_SIGNATURES) as Array<keyof typeof TIME_SIGNATURES>;

function clampDifficulty(value: number, maxDifficulty: number): number {
  return Math.max(1, Math.min(value, maxDifficulty));
}

function createModeRound(mode: GameMode, difficulty: number, roundIndex: number): Rhythm004Round {
  if (mode.id === 'values') {
    const questionTypes: Rhythm004QuestionType[] = ['identify-note', 'identify-rest', 'count-beats', 'match-symbol'];
    const questionType = questionTypes[roundIndex % questionTypes.length];
    const noteValue = BASIC_VALUES[roundIndex % BASIC_VALUES.length];
    const timeSignature = TIME_SIGNATURE_KEYS[roundIndex % TIME_SIGNATURE_KEYS.length];
    return {
      id: `rhythm-004-values-${roundIndex + 1}`,
      mode: 'values',
      difficulty,
      questionType,
      question:
        questionType === 'count-beats'
          ? `How many beats does this rhythm pattern take in ${timeSignature}?`
          : `Identify the rhythm value shown.`,
      answer: questionType === 'count-beats' ? '4' : RHYTHM_DEFINITIONS[noteValue].name,
      options: Object.values(RHYTHM_DEFINITIONS).slice(0, 4).map((item) => item.name),
      noteValue,
      pattern: RHYTHM_PATTERNS['basic-1'],
      timeSignature,
    };
  }

  if (mode.id === 'tuplets') {
    const questionTypes: Rhythm004QuestionType[] = ['identify-tuplet', 'count-tuplet-notes', 'tuplet-division'];
    const questionType = questionTypes[roundIndex % questionTypes.length];
    const tupletType = TUPLET_VALUES[roundIndex % TUPLET_VALUES.length];
    return {
      id: `rhythm-004-tuplets-${roundIndex + 1}`,
      mode: 'tuplets',
      difficulty,
      questionType,
      question: `Identify the tuplet pattern in this rhythm.`,
      answer: RHYTHM_DEFINITIONS[tupletType].name,
      options: TUPLET_VALUES.slice(0, 4).map((value) => RHYTHM_DEFINITIONS[value].name),
      tupletType,
      beatValue: 1,
    };
  }

  if (mode.id === 'conversion') {
    const questionTypes: Rhythm004QuestionType[] = ['convert-equivalent', 'replace-notes', 'simplify-rhythm'];
    const questionType = questionTypes[roundIndex % questionTypes.length];
    const sourcePattern = RHYTHM_PATTERNS['dotted-1'];
    const targetPattern = RHYTHM_PATTERNS['basic-2'];
    return {
      id: `rhythm-004-conversion-${roundIndex + 1}`,
      mode: 'conversion',
      difficulty,
      questionType,
      question: 'Convert this rhythm into an equivalent pattern.',
      answer: questionType === 'replace-notes' ? 'Half Note' : 'Equivalent Rhythm',
      options: ['Equivalent Rhythm', 'Half Note', 'Quarter Pair', 'Triplet Figure'],
      sourcePattern,
      targetPattern,
      originalNote: 'half',
      replacementNote: 'quarter',
    };
  }

  const questionTypes: Rhythm004QuestionType[] = ['identify-pattern', 'quick-count', 'sight-read'];
  const questionType = questionTypes[roundIndex % questionTypes.length];
  const pattern = SPEED_PATTERNS[roundIndex % SPEED_PATTERNS.length];
  return {
    id: `rhythm-004-speed-reading-${roundIndex + 1}`,
    mode: 'speed-reading',
    difficulty,
    questionType,
    question: 'Read the rhythm pattern as quickly as you can.',
    answer: 'Pattern Recognized',
    options: ['Pattern Recognized', 'Needs More Beats', 'Tuplet Figure', 'Syncopated Cell'],
    pattern,
    timeLimit: Math.max(3, 8 - difficulty),
    timeSignature: '4/4',
  };
}

export const Rhythm004Logic = {
  initializeGameState(mode: GameMode, totalRounds = 10): Rhythm004State {
    return {
      currentMode: mode,
      score: 0,
      lives: 3,
      currentRound: 0,
      totalRounds,
      difficulty: 1,
      gameStatus: 'playing',
      streak: 0,
    };
  },

  generateRound(mode: GameMode, difficulty: number, roundIndex: number, _totalRounds: number): Rhythm004Round {
    return createModeRound(mode, difficulty, roundIndex);
  },

  validateAnswer(userAnswer: string, correctAnswer: string, _round?: Rhythm004Round): boolean {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  },

  calculateScore(correct: boolean, timeSpent: number, difficulty: number, streak: number): number {
    if (!correct) return 0;
    const base = 100 * difficulty;
    const timeBonus = Math.max(0, Math.round((6000 - timeSpent) / 200));
    const streakBonus = streak * 10;
    return base + timeBonus + streakBonus;
  },

  getProgress(currentRound: number, totalRounds: number) {
    const percentage = totalRounds === 0 ? 0 : Math.round((currentRound / totalRounds) * 100);
    return {
      percentage,
      currentRound,
      totalRounds,
      isComplete: currentRound >= totalRounds,
    };
  },

  createAudioContext(): AudioContext {
    return new AudioContext();
  },

  synthesizeRhythm(audioContext: AudioContext, pattern: string[], tempo: number) {
    const beatSeconds = 60 / tempo;
    return pattern.map((value, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(440 + index * 30, audioContext.currentTime);
      gain.gain.setValueAtTime(0.5, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + beatSeconds * 0.1);
      return { value, oscillator, gain };
    });
  },

  calculateDifficultyAdjustment(currentDifficulty: number, correctStreak: number, wrongStreak: number, maxDifficulty: number) {
    const modeMax = Math.min(maxDifficulty, getMaxDifficultyForMode('tuplets'));
    if (correctStreak >= 3) return clampDifficulty(currentDifficulty + 1, modeMax);
    if (wrongStreak >= 2) return clampDifficulty(currentDifficulty - 1, modeMax);
    return clampDifficulty(currentDifficulty, modeMax);
  },

  provideFeedback(correct: boolean, round: Rhythm004Round, timeSpent: number): string {
    if (correct && timeSpent <= 2500) return 'Excellent reading speed and accuracy.';
    if (correct) return 'Great job! Correct rhythm answer.';
    if (round.mode === 'tuplets') return 'Not quite. Tuplet groupings change how the beat divides.';
    return 'Not quite. Check the rhythm values and try again.';
  },

  getNextRound(state: Rhythm004State): Rhythm004Round {
    return createModeRound(state.currentMode, state.difficulty, state.currentRound);
  },

  processAnswer(state: Rhythm004State, userAnswer: string, timeSpent: number): Rhythm004State {
    const round = state.currentRoundData ?? createModeRound(state.currentMode, state.difficulty, state.currentRound);
    const correct = this.validateAnswer(userAnswer, round.answer, round);
    const score = this.calculateScore(correct, timeSpent, state.difficulty, state.streak);
    const nextRound = state.currentRound + 1;
    const nextLives = correct ? state.lives : state.lives - 1;
    const nextStatus: GameStatus =
      nextLives <= 0
        ? 'failed'
        : nextRound >= state.totalRounds
          ? 'completed'
          : 'playing';

    return {
      ...state,
      score: state.score + score,
      streak: correct ? state.streak + 1 : 0,
      currentRound: nextRound,
      lives: nextLives,
      gameStatus: nextStatus,
      currentRoundData: undefined,
    };
  },
};

export type GameRound = Rhythm004Round;

export function generateRound(mode: string, difficulty: number): GameRound {
  return createModeRound(NOTATION_MODES[mode as NotationModeId], difficulty, 0);
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return Rhythm004Logic.validateAnswer(userAnswer, correctAnswer);
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  return Rhythm004Logic.calculateScore(correct, timeSpent, difficulty, 0);
}
