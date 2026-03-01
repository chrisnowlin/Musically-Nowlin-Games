/**
 * Game Logic for Melody Master
 * ID: pitch-003
 * Unified Skill: Understanding melodic transformation and expression
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["transformations", "patterns", "articulations"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for melody transformations
  // This function should generate questions based on the mode:
  // - "transformations": melodic transformations (inversion, retrograde, etc.)
  // - "patterns": melodic patterns and sequences
  // - "articulations": melodic articulation and expression
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
