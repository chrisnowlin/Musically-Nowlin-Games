/**
 * Game Logic for Rhythm Notation Master
 * ID: rhythm-004
 * Unified Skill: Reading and writing rhythmic notation
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["values", "tuplets", "conversion", "speed-reading"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for rhythm notation mastery
  // This function should generate questions based on the mode:
  // - "values": note value identification
  // - "tuplets": tuplet identification and notation
  // - "conversion": rhythm conversion exercises
  // - "speed-reading": rapid rhythm reading
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
