/**
 * Game Logic for Music & Language Lab
 * ID: cross-002
 * Unified Skill: Understanding linguistic patterns in music
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["phonemes-prosody", "rhythm-stress", "narrative-structure"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for music & language lab
  // This function should generate questions based on the mode:
  // - "phonemes-prosody": phonemes and prosody in music
  // - "rhythm-stress": rhythm and stress patterns
  // - "narrative-structure": narrative structure in music
  // For now, returns placeholder values
  return {
    id: `round-${Date.now()}`,
    mode,
    question: "TODO: Generate question",
    answer: "TODO: Generate answer",
    difficulty,
  };
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer === correctAnswer;
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
