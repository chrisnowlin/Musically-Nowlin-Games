/**
 * Game Logic for Consonance & Dissonance Master
 * ID: harmony-004
 * Unified Skill: Understanding harmonic tension and resolution
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  difficulty: number;
}

const MODES = ["consonance", "dissonance", "non-chord-tones"];

export function generateRound(mode: string, difficulty: number): GameRound {
  // TODO: Implement actual question generation logic for consonance & dissonance mastery
  // This function should generate questions based on the mode:
  // - "consonance": consonant interval and chord identification
  // - "dissonance": dissonant interval and chord identification
  // - "non-chord-tones": non-chord tone identification
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
