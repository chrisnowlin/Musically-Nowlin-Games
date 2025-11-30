/**
 * Game Logic for Emotion Master
 * ID: dynamics-003
 * Unified Skill: Understanding emotional content in music
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["detection", "analysis"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for emotion mastery
  // This function should generate questions based on the mode:
  // - "detection": detecting emotional content in music
  // - "analysis": analyzing emotional expression
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
