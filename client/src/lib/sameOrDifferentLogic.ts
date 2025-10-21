import { ANIMAL_CHARACTERS, MUSICAL_NOTES, AnimalCharacter } from "@/lib/schema";

export type DifferenceType = "rhythm" | "pitch" | "dynamics" | "tempo";

export interface SameOrDifferentRound {
  character1: AnimalCharacter;
  character2: AnimalCharacter;
  phrase1: number[]; // Array of frequencies
  phrase2: number[]; // Array of frequencies
  phraseDurations1: number[]; // Duration in ms for each note
  phraseDurations2: number[]; // Duration in ms for each note
  dynamics1: number[]; // Volume 0-1 for each note
  dynamics2: number[]; // Volume 0-1 for each note
  tempo: number; // BPM for note timing
  isDifferent: boolean;
  differenceType?: DifferenceType; // Type of difference if isDifferent
}

/**
 * Generate a simple melodic phrase (3-5 notes)
 */
function generatePhrase(length: number = 4): number[] {
  const phraseLength = length;
  const phrase: number[] = [];

  // Select a starting note
  const startIdx = Math.floor(Math.random() * (MUSICAL_NOTES.length - 5));

  for (let i = 0; i < phraseLength; i++) {
    // Generate intervals within a range (±2 semitones from start)
    const offsetIdx = startIdx + Math.floor(Math.random() * 5) - 2;
    const idx = Math.max(0, Math.min(MUSICAL_NOTES.length - 1, offsetIdx));
    phrase.push(MUSICAL_NOTES[idx].frequency);
  }

  return phrase;
}

/**
 * Generate default durations (all quarter notes)
 */
function generateDurations(length: number): number[] {
  return Array(length).fill(500); // 500ms per note at default tempo
}

/**
 * Generate default dynamics (medium volume for all)
 */
function generateDynamics(length: number): number[] {
  return Array(length).fill(0.7); // 70% volume
}

/**
 * Create a variation of a phrase based on difference type
 */
function createDifference(
  phrase: number[],
  durations: number[],
  dynamics: number[],
  differenceType: DifferenceType
): { phrase: number[]; durations: number[]; dynamics: number[] } {
  const newPhrase = [...phrase];
  const newDurations = [...durations];
  const newDynamics = [...dynamics];

  switch (differenceType) {
    case "rhythm":
      // Change one note duration
      const rhythmIdx = Math.floor(Math.random() * newDurations.length);
      newDurations[rhythmIdx] = newDurations[rhythmIdx] === 500 ? 250 : 750;
      break;

    case "pitch":
      // Change one note pitch (up or down by 2-5 semitones)
      const pitchIdx = Math.floor(Math.random() * newPhrase.length);
      const semitones = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.floor(Math.random() * 4));
      const noteIdx = MUSICAL_NOTES.findIndex(n => Math.abs(n.frequency - newPhrase[pitchIdx]) < 1);
      if (noteIdx !== -1 && noteIdx + semitones >= 0 && noteIdx + semitones < MUSICAL_NOTES.length) {
        newPhrase[pitchIdx] = MUSICAL_NOTES[noteIdx + semitones].frequency;
      }
      break;

    case "dynamics":
      // Change volume of one note
      const dynamicsIdx = Math.floor(Math.random() * newDynamics.length);
      newDynamics[dynamicsIdx] = newDynamics[dynamicsIdx] > 0.5 ? 0.3 : 0.9;
      break;

    case "tempo":
      // Subtle timing change (not actually changing tempo, but note duration variation)
      const tempoIdx = Math.floor(Math.random() * newDurations.length);
      newDurations[tempoIdx] = newDurations[tempoIdx] * 1.25;
      break;
  }

  return { phrase: newPhrase, durations: newDurations, dynamics: newDynamics };
}

/**
 * Generate a new game round
 */
export function generateSameOrDifferentRound(): SameOrDifferentRound {
  const phrase1 = generatePhrase();
  const durations1 = generateDurations(phrase1.length);
  const dynamics1 = generateDynamics(phrase1.length);

  // 50% chance of same or different
  const isDifferent = Math.random() < 0.5;

  let phrase2 = [...phrase1];
  let durations2 = [...durations1];
  let dynamics2 = [...dynamics1];
  let differenceType: DifferenceType | undefined;

  if (isDifferent) {
    const differenceTypes: DifferenceType[] = ["rhythm", "pitch", "dynamics", "tempo"];
    differenceType = differenceTypes[Math.floor(Math.random() * differenceTypes.length)];
    const variation = createDifference(phrase1, durations1, dynamics1, differenceType);
    phrase2 = variation.phrase;
    durations2 = variation.durations;
    dynamics2 = variation.dynamics;
  }

  return {
    character1: ANIMAL_CHARACTERS[0],
    character2: ANIMAL_CHARACTERS[1],
    phrase1,
    phrase2,
    phraseDurations1: durations1,
    phraseDurations2: durations2,
    dynamics1,
    dynamics2,
    tempo: 120, // BPM
    isDifferent,
    differenceType,
  };
}

/**
 * Validate if user's answer is correct
 */
export function validateSameOrDifferentAnswer(
  userAnswer: "same" | "different",
  isDifferent: boolean
): boolean {
  return (userAnswer === "different") === isDifferent;
}

/**
 * Calculate updated score
 */
export function calculateSameOrDifferentScore(
  currentScore: number,
  isCorrect: boolean
): number {
  return isCorrect ? currentScore + 1 : currentScore;
}
