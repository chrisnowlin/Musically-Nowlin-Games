/**
 * Game Logic for Contour Master
 * ID: pitch-006
 * Unified Skill: Understanding melodic shape and direction
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["transformations", "modifications", "analysis"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for contour mastery
  // This function should generate questions based on the mode:
  // - "transformations": melodic contour transformations
  // - "modifications": contour modifications
  // - "analysis": contour analysis
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
