/**
 * Compatibility game logic for Phrase Analyzer
 * ID: pitch-003
 *
 * The current route UI does not depend on this module directly, but the test
 * suite still type-checks against an older class-based API. Keep that API
 * available here so repo-wide `tsc` remains green.
 */

import {
  PHRASE_DEFINITIONS,
  PHRASE_MODES,
  PHRASE_NAMES,
  getModeById,
  type GameMode,
} from './modes';

export type Pitch003Difficulty = 'easy' | 'medium' | 'hard';
export type Pitch003ModeId = 'structure' | 'relationships' | 'transformations';

export interface Pitch003AudioData {
  type: 'phrase-structure' | 'phrase-relationship' | 'phrase-transformation';
  frequencies: number[];
  duration: number;
  phrases?: Array<{ notes: number[]; rhythm: number[] }>;
  parameters: {
    transformationType: string;
    original: { notes: number[]; rhythm: number[] };
    transformed: { notes: number[]; rhythm: number[] };
  };
}

export interface Pitch003Round {
  id: string;
  modeId: Pitch003ModeId;
  difficulty: Pitch003Difficulty;
  question: string;
  answer: string;
  options: string[];
  audioData: Pitch003AudioData;
  explanation: string;
  points: number;
}

export interface Pitch003GameState {
  mode: Pitch003ModeId;
  difficulty: Pitch003Difficulty;
  isComplete: boolean;
  currentRound: number;
  totalRounds: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface ProgressSnapshot {
  currentRound: number;
  totalRounds: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

const POINTS_BY_DIFFICULTY: Record<Pitch003Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

const BASE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

function getMode(modeId: string): GameMode {
  const mode = getModeById(modeId);
  if (!mode) {
    throw new Error(`Unknown mode: ${modeId}`);
  }
  return mode;
}

function toFrequencies(values: number[]): number[] {
  return values.map((value) => {
    const normalized = ((value % 8) + 8) % 8;
    return BASE_FREQUENCIES[normalized];
  });
}

function buildStructureRound(difficulty: Pitch003Difficulty, roundIndex: number): Pitch003Round {
  const structureAnswers = ['Basic Phrase', 'Musical Period', 'Musical Sentence'] as const;
  const answer = structureAnswers[roundIndex % structureAnswers.length];
  const sourceKey =
    answer === 'Basic Phrase' ? 'basicPhrase' :
    answer === 'Musical Period' ? 'period' :
    'sentence';
  const source = PHRASE_DEFINITIONS[sourceKey];
  const question =
    difficulty === 'easy'
      ? 'Which phrase shape best matches what you hear?'
      : difficulty === 'medium'
        ? 'Where are the phrase boundaries in this melody?'
        : 'Analyze the phrase design and choose the best label.';

  return {
    id: `pitch-003-structure-${roundIndex + 1}`,
    modeId: 'structure',
    difficulty,
    question,
    answer,
    options: [...structureAnswers],
    audioData: {
      type: 'phrase-structure',
      frequencies: toFrequencies(source.notes),
      duration: source.rhythm.length * 0.5,
      parameters: {
        transformationType: 'structure',
        original: {
          notes: toFrequencies(source.notes),
          rhythm: source.rhythm,
        },
        transformed: {
          notes: toFrequencies(source.notes),
          rhythm: source.rhythm,
        },
      },
    },
    explanation: `This phrase example highlights ${answer.toLowerCase()} structure and phrase organization.`,
    points: POINTS_BY_DIFFICULTY[difficulty],
  };
}

function buildRelationshipRound(difficulty: Pitch003Difficulty, roundIndex: number): Pitch003Round {
  const relationAnswers = ['Parallel Phrases', 'Contrasting Phrases', 'Sequential Phrases'] as const;
  const answer = relationAnswers[roundIndex % relationAnswers.length];
  const sourceKey =
    answer === 'Parallel Phrases' ? 'parallel' :
    answer === 'Contrasting Phrases' ? 'contrasting' :
    'sequential';
  const source = PHRASE_DEFINITIONS[sourceKey];
  const question =
    difficulty === 'easy'
      ? 'What relationship do these two phrases share?'
      : difficulty === 'medium'
        ? 'How do the two phrases relate to each other?'
        : 'Which relationship pattern best describes the paired phrases?';

  return {
    id: `pitch-003-relationships-${roundIndex + 1}`,
    modeId: 'relationships',
    difficulty,
    question,
    answer,
    options:
      difficulty === 'hard'
        ? [...relationAnswers, 'Call and Response', 'Phrase Extension']
        : difficulty === 'medium'
          ? [...relationAnswers, 'Call and Response']
          : [...relationAnswers],
    audioData: {
      type: 'phrase-relationship',
      frequencies: [...toFrequencies(source.antecedent), ...toFrequencies(source.consequent)],
      duration: (source.antecedent.length + source.consequent.length) * 0.5,
      phrases: [
        { notes: toFrequencies(source.antecedent), rhythm: source.antecedent.map(() => 1) },
        { notes: toFrequencies(source.consequent), rhythm: source.consequent.map(() => 1) },
      ],
      parameters: {
        transformationType: 'relationship',
        original: {
          notes: toFrequencies(source.antecedent),
          rhythm: source.antecedent.map(() => 1),
        },
        transformed: {
          notes: toFrequencies(source.consequent),
          rhythm: source.consequent.map(() => 1),
        },
      },
    },
    explanation: `The phrase relationship here is ${answer.toLowerCase()}, showing how one idea connects to another.`,
    points: POINTS_BY_DIFFICULTY[difficulty],
  };
}

function buildTransformationRound(difficulty: Pitch003Difficulty, roundIndex: number): Pitch003Round {
  const easyOptions = ['Transposition', 'Melodic Inversion', 'Retrograde'] as const;
  const mediumOptions = [...easyOptions, 'Up 2nd', 'Up 3rd', 'Up 4th', 'Up 5th', 'Down 2nd', 'Down 3rd'] as const;
  const answerPool = difficulty === 'easy' ? easyOptions : mediumOptions;
  const answer = answerPool[roundIndex % answerPool.length];
  const sourceKey =
    answer === 'Melodic Inversion'
      ? 'inversion'
      : answer === 'Retrograde'
        ? 'retrograde'
        : 'transposition';
  const source = PHRASE_DEFINITIONS[sourceKey];
  const question =
    difficulty === 'easy'
      ? 'How was the original phrase transformed?'
      : difficulty === 'medium'
        ? 'What transformation degree best describes the changed phrase?'
        : 'Analyze the transformed phrase and choose the most accurate description.';

  return {
    id: `pitch-003-transformations-${roundIndex + 1}`,
    modeId: 'transformations',
    difficulty,
    question,
    answer,
    options:
      difficulty === 'hard'
        ? [...mediumOptions, 'Mirror Sequence', 'Expanded Retrograde']
        : [...answerPool],
    audioData: {
      type: 'phrase-transformation',
      frequencies: [...toFrequencies(source.original), ...toFrequencies(source.transformed)],
      duration: (source.original.length + source.transformed.length) * 0.45,
      parameters: {
        transformationType: sourceKey,
        original: {
          notes: toFrequencies(source.original),
          rhythm: source.original.map(() => 1),
        },
        transformed: {
          notes: toFrequencies(source.transformed),
          rhythm: source.transformed.map(() => 1),
        },
      },
    },
    explanation: `This transform example demonstrates ${answer.toLowerCase()} as the key musical change.`,
    points: POINTS_BY_DIFFICULTY[difficulty],
  };
}

function createRound(modeId: Pitch003ModeId, difficulty: Pitch003Difficulty, roundIndex: number): Pitch003Round {
  switch (modeId) {
    case 'structure':
      return buildStructureRound(difficulty, roundIndex);
    case 'relationships':
      return buildRelationshipRound(difficulty, roundIndex);
    case 'transformations':
      return buildTransformationRound(difficulty, roundIndex);
  }
}

export class Pitch003Game {
  private state: Pitch003GameState;

  constructor(
    private readonly modeId: Pitch003ModeId,
    private readonly selectedDifficulty: Pitch003Difficulty,
    private readonly totalRounds = 10,
  ) {
    getMode(modeId);
    this.state = {
      mode: modeId,
      difficulty: selectedDifficulty,
      isComplete: false,
      currentRound: 0,
      totalRounds,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
    };
  }

  generateRound(): Pitch003Round {
    return createRound(this.modeId, this.selectedDifficulty, this.state.currentRound);
  }

  validateAnswer(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }

  submitAnswer(userAnswer: string, correctAnswer: string, points: number): boolean {
    const isCorrect = this.validateAnswer(userAnswer, correctAnswer);
    this.state = {
      ...this.state,
      currentRound: Math.min(this.totalRounds, this.state.currentRound + 1),
      totalAnswers: this.state.totalAnswers + 1,
      correctAnswers: this.state.correctAnswers + (isCorrect ? 1 : 0),
      score: this.state.score + (isCorrect ? points : 0),
      isComplete: this.state.currentRound + 1 >= this.totalRounds,
    };
    return isCorrect;
  }

  getProgress(): ProgressSnapshot {
    return {
      currentRound: this.state.currentRound,
      totalRounds: this.state.totalRounds,
      score: this.state.score,
      correctAnswers: this.state.correctAnswers,
      totalAnswers: this.state.totalAnswers,
    };
  }

  getState(): Pitch003GameState {
    return { ...this.state };
  }

  getAccuracy(): number {
    if (this.state.totalAnswers === 0) return 0;
    return Math.round((this.state.correctAnswers / this.state.totalAnswers) * 100);
  }

  getModeConfig(): GameMode {
    return getMode(this.modeId);
  }

  reset(): void {
    this.state = {
      mode: this.modeId,
      difficulty: this.selectedDifficulty,
      isComplete: false,
      currentRound: 0,
      totalRounds: this.totalRounds,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
    };
  }
}

export function createPitch003Game(modeId: string, difficulty: Pitch003Difficulty): Pitch003Game {
  return new Pitch003Game(modeId as Pitch003ModeId, difficulty);
}

export function getPitch003ModeConfig(modeId: string): GameMode | undefined {
  return getModeById(modeId);
}

// Keep function exports for simpler call sites.
export function generateRound(mode: string, difficulty: Pitch003Difficulty): Pitch003Round {
  return createRound(mode as Pitch003ModeId, difficulty, 0);
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
