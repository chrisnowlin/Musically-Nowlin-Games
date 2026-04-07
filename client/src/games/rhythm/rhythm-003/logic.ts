/**
 * Compatibility logic for Meter Master
 * ID: rhythm-003
 */

import {
  METER_DEFINITIONS,
  METER_MODES,
  METER_NAMES,
  getMaxDifficultyForMode,
  type GameMode,
} from './modes';

type MeterModeId = keyof typeof METER_MODES;
type GameStatus = 'playing' | 'completed' | 'failed';

type Rhythm003QuestionType =
  | 'identify-signature'
  | 'count-beats'
  | 'match-pattern'
  | 'identify-type'
  | 'classify-meter'
  | 'compare-types'
  | 'identify-feature'
  | 'analyze-pattern'
  | 'locate-accent';

export interface Rhythm003Round {
  id: string;
  mode: MeterModeId;
  difficulty: number;
  questionType: Rhythm003QuestionType;
  question: string;
  answer: string;
  options?: string[];
  timeSignature?: keyof typeof METER_DEFINITIONS;
  beatsPerMeasure?: number;
  meterType?: 'simple' | 'compound' | 'asymmetric';
  featureType?: 'strong_beat' | 'weak_beat' | 'subdivision' | 'metric_accent';
  patternData?: number[];
  accentPattern?: number[];
}

export interface Rhythm003State {
  currentMode: GameMode;
  score: number;
  lives: number;
  currentRound: number;
  totalRounds: number;
  difficulty: number;
  gameStatus: GameStatus;
  streak: number;
  currentRoundData?: Rhythm003Round;
}

const METER_SIGNATURES = Object.keys(METER_DEFINITIONS) as Array<keyof typeof METER_DEFINITIONS>;
const FEATURES: Rhythm003Round['featureType'][] = ['strong_beat', 'weak_beat', 'subdivision', 'metric_accent'];

function clampDifficulty(value: number, maxDifficulty: number): number {
  return Math.max(1, Math.min(value, maxDifficulty));
}

function createModeRound(mode: GameMode, difficulty: number, roundIndex: number): Rhythm003Round {
  const signature = METER_SIGNATURES[roundIndex % METER_SIGNATURES.length] ?? '4/4';
  const definition = METER_DEFINITIONS[signature];
  const meterType = definition.subdivision as Rhythm003Round['meterType'];

  if (mode.id === 'meters') {
    const questionTypes: Rhythm003QuestionType[] = ['identify-signature', 'count-beats', 'match-pattern'];
    const questionType = questionTypes[roundIndex % questionTypes.length] ?? 'identify-signature';
    if (questionType === 'count-beats') {
      return {
        id: `rhythm-003-meters-${roundIndex + 1}`,
        mode: 'meters',
        difficulty,
        questionType,
        question: `How many beats are in ${signature}?`,
        answer: String(definition.beatsPerMeasure),
        timeSignature: signature,
        beatsPerMeasure: definition.beatsPerMeasure,
        options: ['2', '3', '4', '6'],
      };
    }
    if (questionType === 'match-pattern') {
      return {
        id: `rhythm-003-meters-${roundIndex + 1}`,
        mode: 'meters',
        difficulty,
        questionType,
        question: `Match the beat pattern to ${signature}.`,
        answer: METER_NAMES[signature],
        timeSignature: signature,
        beatsPerMeasure: definition.beatsPerMeasure,
        options: ['Simple Duple', 'Simple Triple', 'Simple Quadruple', 'Compound Duple'],
      };
    }
    return {
      id: `rhythm-003-meters-${roundIndex + 1}`,
      mode: 'meters',
      difficulty,
      questionType,
      question: 'Which time signature matches this meter pattern?',
      answer: signature,
      timeSignature: signature,
      beatsPerMeasure: definition.beatsPerMeasure,
      options: ['2/4', '3/4', '4/4', '6/8'],
    };
  }

  if (mode.id === 'types') {
    const questionTypes: Rhythm003QuestionType[] = ['identify-type', 'classify-meter', 'compare-types'];
    const questionType = questionTypes[roundIndex % questionTypes.length] ?? 'identify-type';
    return {
      id: `rhythm-003-types-${roundIndex + 1}`,
      mode: 'types',
      difficulty,
      questionType,
      question:
        questionType === 'identify-type'
          ? `What kind of meter is ${signature}?`
          : questionType === 'classify-meter'
            ? `Classify the meter used in ${signature}.`
            : `Compare the meter type of ${signature} to another pattern.`,
      answer: METER_NAMES[meterType ?? 'simple'],
      options: ['Simple Meter', 'Compound Meter', 'Asymmetric Meter'],
      timeSignature: signature,
      meterType,
    };
  }

  const featureType = FEATURES[roundIndex % FEATURES.length];
  const questionTypes: Rhythm003QuestionType[] = ['identify-feature', 'analyze-pattern', 'locate-accent'];
  const questionType = questionTypes[roundIndex % questionTypes.length] ?? 'identify-feature';
  return {
    id: `rhythm-003-features-${roundIndex + 1}`,
    mode: 'features',
    difficulty,
    questionType,
    question:
      questionType === 'identify-feature'
        ? `Identify the metric feature highlighted in ${signature}.`
        : questionType === 'analyze-pattern'
          ? `Analyze the beat pattern for ${signature}.`
          : `Locate the metric accent in ${signature}.`,
    answer: METER_NAMES[featureType ?? 'metric_accent'],
    options: ['Strong Beat', 'Weak Beat', 'Beat Subdivision', 'Metric Accent'],
    timeSignature: signature,
    meterType,
    featureType,
    patternData: definition.pattern,
    accentPattern: definition.emphasis,
  };
}

export const Rhythm003Logic = {
  initializeGameState(mode: GameMode, totalRounds = 10): Rhythm003State {
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

  generateRound(mode: GameMode, difficulty: number, roundIndex: number, _totalRounds: number): Rhythm003Round {
    return createModeRound(mode, difficulty, roundIndex);
  },

  validateAnswer(userAnswer: string, correctAnswer: string, _round?: Rhythm003Round): boolean {
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
    return {
      percentage: totalRounds === 0 ? 0 : Math.round((currentRound / totalRounds) * 100),
      currentRound,
      totalRounds,
    };
  },

  getPerformanceMetrics(_score: number, correctAnswers: number, totalRounds: number, totalTimeMs: number) {
    return {
      accuracy: totalRounds === 0 ? 0 : Math.round((correctAnswers / totalRounds) * 100),
      averageTime: totalRounds === 0 ? 0 : totalTimeMs / totalRounds / 1000,
      streakBonus: correctAnswers >= Math.ceil(totalRounds / 2),
    };
  },

  createAudioContext(): AudioContext {
    return new AudioContext();
  },

  synthesizeMeterPattern(audioContext: AudioContext, signature: string, tempo: number) {
    if (!(signature in METER_DEFINITIONS)) {
      throw new Error(`Unknown time signature: ${signature}`);
    }
    const definition = METER_DEFINITIONS[signature as keyof typeof METER_DEFINITIONS];
    const duration = 60 / tempo;
    return definition.emphasis.map((emphasis, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(440 + index * 20, audioContext.currentTime);
      gain.gain.setValueAtTime(emphasis, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration * 0.1);
      return { oscillator, gain };
    });
  },

  calculateDifficultyAdjustment(currentDifficulty: number, correctStreak: number, wrongStreak: number, maxDifficulty: number, modeId?: string) {
    const modeMax = modeId ? getMaxDifficultyForMode(modeId) : maxDifficulty;
    if (correctStreak >= 3) return clampDifficulty(currentDifficulty + 1, modeMax);
    if (wrongStreak >= 2) return clampDifficulty(currentDifficulty - 1, modeMax);
    return clampDifficulty(currentDifficulty, modeMax);
  },

  provideFeedback(correct: boolean, round: Rhythm003Round, timeSpent: number): string {
    if (correct && timeSpent <= 2500) return 'Excellent work! You identified the meter quickly.';
    if (correct) return 'Great job! Correct meter answer.';
    if (round.questionType === 'identify-signature') return 'Not quite. Listen again for the time signature pattern.';
    return 'Not quite. Focus on the beat grouping and metric feel.';
  },

  getNextRound(state: Rhythm003State): Rhythm003Round {
    return createModeRound(state.currentMode, state.difficulty, state.currentRound);
  },

  processAnswer(state: Rhythm003State, userAnswer: string, timeSpent: number): Rhythm003State {
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

export type GameRound = Rhythm003Round;

export function generateRound(mode: string, difficulty: number): GameRound {
  return createModeRound(METER_MODES[mode as MeterModeId], difficulty, 0);
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return Rhythm003Logic.validateAnswer(userAnswer, correctAnswer);
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  return Rhythm003Logic.calculateScore(correct, timeSpent, difficulty, 0);
}
