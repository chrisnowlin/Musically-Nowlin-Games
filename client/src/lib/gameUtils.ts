import type { GameRound } from "@/lib/schema";
import { ANIMAL_CHARACTERS, MUSICAL_NOTES } from "@/lib/schema";

/**
 * Generate a new game round with random pitches and question
 */
export function generateNewRound(): GameRound {
  // Pick two random different frequencies
  const note1 = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
  let note2 = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
  
  // Ensure they are different
  while (note2.frequency === note1.frequency) {
    note2 = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
  }

  // Randomly decide the question type
  const question = Math.random() < 0.5 ? "higher" : "lower";
  
  // Determine correct answer
  let correctAnswer: 1 | 2;
  if (question === "higher") {
    correctAnswer = note1.frequency > note2.frequency ? 1 : 2;
  } else {
    correctAnswer = note1.frequency < note2.frequency ? 1 : 2;
  }

  return {
    character1: ANIMAL_CHARACTERS[0],
    character2: ANIMAL_CHARACTERS[1],
    pitch1: note1.frequency,
    pitch2: note2.frequency,
    question,
    correctAnswer,
  };
}

/**
 * Validate if a user's answer is correct
 */
export function validateAnswer(characterPosition: 1 | 2, correctAnswer: 1 | 2): boolean {
  return characterPosition === correctAnswer;
}

/**
 * Calculate updated score based on answer correctness
 */
export function calculateScore(currentScore: number, isCorrect: boolean): number {
  return isCorrect ? currentScore + 1 : currentScore;
}
