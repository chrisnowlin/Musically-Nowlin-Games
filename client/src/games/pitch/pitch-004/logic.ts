/**
 * Game Logic for Phrase Analyzer
 * ID: pitch-004
 * Unified Skill: Understanding musical phrasing and sentence structure
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["structure", "relationships", "transformations"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for phrase analysis
  // This function should generate questions based on the mode:
  // - "structure": musical phrase structure (antecedent/consequent, etc.)
  // - "relationships": relationships between phrases
  // - "transformations": phrase transformations and variations
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
