import type { GameRound } from "@/lib/schema";
import { ANIMAL_CHARACTERS, MUSICAL_NOTES } from "@/lib/schema";

/**
 * Generate a new game round with random pitches and question
 * @param numAnimals Number of animals to include (2-5)
 */
export function generateNewRound(numAnimals: number = 2): GameRound {
  // Clamp numAnimals to valid range
  const animalCount = Math.max(2, Math.min(5, numAnimals));
  
  // Select random unique animals
  const availableAnimals = [...ANIMAL_CHARACTERS];
  const selectedAnimals: typeof ANIMAL_CHARACTERS = [];
  const selectedIndices: number[] = [];
  
  for (let i = 0; i < animalCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableAnimals.length);
    selectedAnimals.push(availableAnimals[randomIndex]);
    selectedIndices.push(randomIndex);
    availableAnimals.splice(randomIndex, 1);
  }

  // Pick random unique frequencies
  const availableNotes = [...MUSICAL_NOTES];
  const selectedPitches: number[] = [];
  
  for (let i = 0; i < animalCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    selectedPitches.push(availableNotes[randomIndex].frequency);
    availableNotes.splice(randomIndex, 1);
  }

  // Randomly decide the question type
  const question = Math.random() < 0.5 ? "higher" : "lower";
  
  // Determine correct answer (1-based index)
  let correctAnswer: number;
  if (question === "higher") {
    const maxPitch = Math.max(...selectedPitches);
    correctAnswer = selectedPitches.findIndex(p => p === maxPitch) + 1;
  } else {
    const minPitch = Math.min(...selectedPitches);
    correctAnswer = selectedPitches.findIndex(p => p === minPitch) + 1;
  }

  return {
    characters: selectedAnimals,
    pitches: selectedPitches,
    question,
    correctAnswer,
  };
}

/**
 * Validate if a user's answer is correct
 */
export function validateAnswer(characterPosition: number, correctAnswer: number): boolean {
  return characterPosition === correctAnswer;
}

/**
 * Calculate updated score based on answer correctness
 */
export function calculateScore(currentScore: number, isCorrect: boolean): number {
  return isCorrect ? currentScore + 1 : currentScore;
}
