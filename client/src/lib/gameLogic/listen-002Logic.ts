/**
 * Game Logic for Musical Style Detective
 * ID: listen-002
 * Unified Skill: Identifying musical styles and periods
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["classical-periods", "popular-genres", "world-music"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for musical style detection
  // This function should generate questions based on the mode:
  // - "classical-periods": identifying classical music periods
  // - "popular-genres": identifying popular music genres
  // - "world-music": identifying world music styles
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
