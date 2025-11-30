/**
 * Game Logic for Composer Detective
 * ID: listen-003
 * Unified Skill: Identifying composers and their styles
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["baroque-classical", "romantic-modern", "jazz-contemporary"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for composer detection
  // This function should generate questions based on the mode:
  // - "baroque-classical": identifying baroque and classical composers
  // - "romantic-modern": identifying romantic and modern composers
  // - "jazz-contemporary": identifying jazz and contemporary composers
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
