/**
 * Game Logic for Scale & Mode Master
 * ID: pitch-005
 * Unified Skill: Understanding tonal systems and frameworks
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["major-minor", "church-modes", "special-scales", "scale-degrees"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for scale & mode mastery
  // This function should generate questions based on the mode:
  // - "major-minor": major and minor scale identification
  // - "church-modes": church mode identification
  // - "special-scales": special scales (pentatonic, blues, etc.)
  // - "scale-degrees": scale degree identification
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
