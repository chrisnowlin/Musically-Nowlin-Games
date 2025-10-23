/**
 * Game Logic for Musical Skills Arena
 * ID: challenge-001
 * Unified Skill: Demonstrating comprehensive musical mastery
 */

import { Challenge001ModeId, getChallenge001Mode } from './challenge-001Modes';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
  category: string;
}

export interface GameRound {
  id: string;
  mode: Challenge001ModeId;
  question: Question;
  timeLimit: number;
  difficulty: number;
}

export interface GameState {
  currentMode: Challenge001ModeId;
  score: number;
  round: number;
  currentQuestion: Question | null;
  timeLeft: number;
  isAnswered: boolean;
  streak: number;
  highScore: number;
  masteryLevel: number;
  totalAnswered: number;
  correctAnswers: number;
}

export interface ScoreCalculation {
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  difficultyBonus: number;
  modeMultiplier: number;
  totalScore: number;
}

// Comprehensive question pool covering all music theory concepts
const QUESTIONS_POOL: Question[] = [
  // Basic Rhythm (difficulty 1)
  {
    id: "rhythm-001",
    question: "How many beats are in a whole note?",
    options: ["2 beats", "3 beats", "4 beats", "8 beats"],
    correctAnswer: 2,
    difficulty: 1,
    category: "rhythm",
  },
  {
    id: "rhythm-002",
    question: "What is the symbol for a quarter note?",
    options: ["𝅝", "𝅗𝅥", "♩", "♪"],
    correctAnswer: 2,
    difficulty: 1,
    category: "rhythm",
  },
  {
    id: "rhythm-003",
    question: "How many eighth notes equal one quarter note?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 1,
    difficulty: 1,
    category: "rhythm",
  },
  
  // Basic Pitch (difficulty 1)
  {
    id: "pitch-001",
    question: "Which note is higher: C or G?",
    options: ["C", "G", "They're the same", "Depends on octave"],
    correctAnswer: 1,
    difficulty: 1,
    category: "pitch",
  },
  {
    id: "pitch-002",
    question: "How many lines does a musical staff have?",
    options: ["4", "5", "6", "7"],
    correctAnswer: 1,
    difficulty: 1,
    category: "pitch",
  },
  
  // Basic Dynamics (difficulty 1)
  {
    id: "dynamics-001",
    question: "What does 'forte' mean in music?",
    options: ["Soft", "Loud", "Fast", "Slow"],
    correctAnswer: 1,
    difficulty: 1,
    category: "dynamics",
  },
  {
    id: "dynamics-002",
    question: "What does 'piano' mean in music?",
    options: ["Soft", "Loud", "Fast", "Slow"],
    correctAnswer: 0,
    difficulty: 1,
    category: "dynamics",
  },
  
  // Intermediate Theory (difficulty 2)
  {
    id: "theory-001",
    question: "How many sharps are in the key of D Major?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 1,
    difficulty: 2,
    category: "theory",
  },
  {
    id: "theory-002",
    question: "What interval is between C and E?",
    options: ["Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th"],
    correctAnswer: 2,
    difficulty: 2,
    category: "theory",
  },
  {
    id: "theory-003",
    question: "What is the relative minor of C Major?",
    options: ["A minor", "D minor", "E minor", "G minor"],
    correctAnswer: 0,
    difficulty: 2,
    category: "theory",
  },
  {
    id: "theory-004",
    question: "What is the dominant chord in C Major?",
    options: ["C Major", "F Major", "G Major", "A minor"],
    correctAnswer: 2,
    difficulty: 2,
    category: "theory",
  },
  
  // Advanced Theory (difficulty 3)
  {
    id: "theory-005",
    question: "In 6/8 time, how many eighth notes per measure?",
    options: ["4", "6", "8", "12"],
    correctAnswer: 1,
    difficulty: 3,
    category: "theory",
  },
  {
    id: "theory-006",
    question: "What is the enharmonic equivalent of C#?",
    options: ["B", "Db", "D", "Bb"],
    correctAnswer: 1,
    difficulty: 3,
    category: "theory",
  },
  {
    id: "theory-007",
    question: "Which scale has the pattern W-W-H-W-W-W-H?",
    options: ["Major", "Minor", "Dorian", "Lydian"],
    correctAnswer: 0,
    difficulty: 3,
    category: "theory",
  },
  {
    id: "theory-008",
    question: "What is the subdominant chord in G Major?",
    options: ["G Major", "C Major", "D Major", "E minor"],
    correctAnswer: 1,
    difficulty: 3,
    category: "theory",
  },
];

export function getRandomQuestion(difficultyRange?: { min: number; max: number } | { minDifficulty: number; maxDifficulty: number }): Question {
  let filtered = QUESTIONS_POOL;
  
  if (difficultyRange) {
    const min = 'min' in difficultyRange ? difficultyRange.min : difficultyRange.minDifficulty;
    const max = 'max' in difficultyRange ? difficultyRange.max : difficultyRange.maxDifficulty;
    filtered = QUESTIONS_POOL.filter(
      q => q.difficulty >= min && q.difficulty <= max
    );
  }
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function generateRound(mode: Challenge001ModeId, masteryLevel: number): GameRound {
  const modeConfig = getChallenge001Mode(mode);
  if (!modeConfig) {
    throw new Error(`Invalid mode: ${mode}`);
  }
  
  const difficultyRange = modeConfig.difficultyCurve(masteryLevel);
  const question = getRandomQuestion(difficultyRange);
  
  return {
    id: `round-${Date.now()}-${Math.random()}`,
    mode,
    question,
    timeLimit: modeConfig.timeLimit,
    difficulty: question.difficulty,
  };
}

export function validateAnswer(selectedAnswer: number, correctAnswer: number): boolean {
  return selectedAnswer === correctAnswer;
}

export function calculateScore(
  correct: boolean,
  timeSpent: number,
  timeLimit: number,
  difficulty: number,
  streak: number,
  mode: Challenge001ModeId
): ScoreCalculation {
  const modeConfig = getChallenge001Mode(mode);
  const modeMultiplier = modeConfig?.scoringMultiplier ?? 1.0;
  
  if (!correct) {
    return {
      baseScore: 0,
      speedBonus: 0,
      streakBonus: 0,
      difficultyBonus: 0,
      modeMultiplier,
      totalScore: 0,
    };
  }
  
  // Base score based on difficulty
  const baseScore = 10 * difficulty;
  
  // Speed bonus (more points for faster answers)
  const speedBonus = Math.max(0, Math.floor((timeLimit - timeSpent) * 2));
  
  // Streak bonus
  const streakBonus = streak > 0 ? streak * 2 : 0;
  
  // Difficulty bonus
  const difficultyBonus = difficulty * 5;
  
  const totalScore = Math.round((baseScore + speedBonus + streakBonus + difficultyBonus) * modeMultiplier);
  
  return {
    baseScore,
    speedBonus,
    streakBonus,
    difficultyBonus,
    modeMultiplier,
    totalScore,
  };
}

export function calculateMasteryProgress(
  correct: boolean,
  currentMasteryLevel: number,
  questionDifficulty: number
): number {
  if (!correct) {
    return Math.max(1, currentMasteryLevel - 0.2);
  }
  
  // Increase mastery based on question difficulty
  const increase = questionDifficulty * 0.3;
  return Math.min(9, currentMasteryLevel + increase);
}

export function getAccuracy(correctAnswers: number, totalAnswered: number): number {
  if (totalAnswered === 0) return 0;
  return Math.round((correctAnswers / totalAnswered) * 100);
}

export function shouldIncreaseDifficulty(
  accuracy: number,
  currentDifficulty: number,
  maxDifficulty: number
): boolean {
  return accuracy >= 80 && currentDifficulty < maxDifficulty;
}

export function shouldDecreaseDifficulty(
  accuracy: number,
  currentDifficulty: number,
  minDifficulty: number
): boolean {
  return accuracy < 60 && currentDifficulty > minDifficulty;
}
