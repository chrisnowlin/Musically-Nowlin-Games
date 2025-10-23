/**
 * Game Logic for Melody Master
 * ID: pitch-002
 * Unified Skill: Understanding melodic elements and articulation
 * Modes: transformations, patterns, articulations
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  correctAnswer: string;
  options: string[];
  description: string;
  difficulty: number;
}

const MODES = ["transformations", "patterns", "articulations"] as const;

// Melodic Transformations
const MELODIC_TRANSFORMATIONS = {
  easy: [
    { name: "Repetition", description: "The exact same melodic phrase played again" },
    { name: "Sequence", description: "A melodic pattern repeated at a different pitch level" },
    { name: "Inversion", description: "The melody flipped upside down (intervals inverted)" },
  ],
  medium: [
    { name: "Repetition", description: "The exact same melodic phrase played again" },
    { name: "Sequence", description: "A melodic pattern repeated at a different pitch level" },
    { name: "Inversion", description: "The melody flipped upside down (intervals inverted)" },
    { name: "Retrograde", description: "The melody played backwards in time" },
    { name: "Augmentation", description: "The melody with all note durations lengthened" },
  ],
  hard: [
    { name: "Repetition", description: "The exact same melodic phrase played again" },
    { name: "Sequence", description: "A melodic pattern repeated at a different pitch level" },
    { name: "Inversion", description: "The melody flipped upside down (intervals inverted)" },
    { name: "Retrograde", description: "The melody played backwards in time" },
    { name: "Augmentation", description: "The melody with all note durations lengthened" },
    { name: "Diminution", description: "The melody with all note durations shortened" },
    { name: "Retrograde Inversion", description: "The melody played backwards and upside down" },
  ],
};

// Melodic Patterns
const MELODIC_PATTERNS = {
  easy: [
    { name: "Stepwise Motion", description: "Notes moving by step (adjacent scale degrees)" },
    { name: "Leaps", description: "Notes jumping by intervals larger than a step" },
    { name: "Arpeggios", description: "Notes of a chord played in sequence" },
  ],
  medium: [
    { name: "Stepwise Motion", description: "Notes moving by step (adjacent scale degrees)" },
    { name: "Leaps", description: "Notes jumping by intervals larger than a step" },
    { name: "Arpeggios", description: "Notes of a chord played in sequence" },
    { name: "Scales", description: "Sequential notes following a scale pattern" },
    { name: "Chromatic", description: "Movement by half steps (all 12 tones)" },
    { name: "Pentatonic", description: "Five-note scale pattern commonly used in folk music" },
  ],
  hard: [
    { name: "Stepwise Motion", description: "Notes moving by step (adjacent scale degrees)" },
    { name: "Leaps", description: "Notes jumping by intervals larger than a step" },
    { name: "Arpeggios", description: "Notes of a chord played in sequence" },
    { name: "Scales", description: "Sequential notes following a scale pattern" },
    { name: "Chromatic", description: "Movement by half steps (all 12 tones)" },
    { name: "Pentatonic", description: "Five-note scale pattern commonly used in folk music" },
    { name: "Modal", description: "Melodies based on modal scales (Dorian, Phrygian, etc.)" },
    { name: "Whole Tone", description: "Scale built entirely of whole step intervals" },
  ],
};

// Articulations
const ARTICULATIONS = {
  easy: [
    { name: "Legato", description: "Smooth and connected, notes flowing into each other" },
    { name: "Staccato", description: "Short and detached, notes clearly separated" },
    { name: "Accent", description: "Note played with extra emphasis or force" },
  ],
  medium: [
    { name: "Legato", description: "Smooth and connected, notes flowing into each other" },
    { name: "Staccato", description: "Short and detached, notes clearly separated" },
    { name: "Marcato", description: "Each note strongly accented and separated" },
    { name: "Tenuto", description: "Note held for its full value with slight emphasis" },
    { name: "Accent", description: "Note played with extra emphasis or force" },
  ],
  hard: [
    { name: "Legato", description: "Smooth and connected, notes flowing into each other" },
    { name: "Staccato", description: "Short and detached, notes clearly separated" },
    { name: "Marcato", description: "Each note strongly accented and separated" },
    { name: "Tenuto", description: "Note held for its full value with slight emphasis" },
    { name: "Portato", description: "Semi-detached, between legato and staccato" },
    { name: "Accent", description: "Note played with extra emphasis or force" },
    { name: "Sforzando", description: "Sudden strong accent on a single note" },
  ],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generateTransformationsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableTransformations = MELODIC_TRANSFORMATIONS[level];
  const correctTransformation = availableTransformations[Math.floor(Math.random() * availableTransformations.length)];

  const otherTransformations = availableTransformations
    .filter(t => t.name !== correctTransformation.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctTransformation, ...otherTransformations]
    .map(t => t.name)
    .sort(() => Math.random() - 0.5);

  const question = `A melody undergoes this change: ${correctTransformation.description}. What transformation is this?`;

  return {
    id: `transformations-${Date.now()}`,
    mode: "transformations",
    question,
    correctAnswer: correctTransformation.name,
    options,
    description: correctTransformation.description,
    difficulty,
  };
}

function generatePatternsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availablePatterns = MELODIC_PATTERNS[level];
  const correctPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

  const otherPatterns = availablePatterns
    .filter(p => p.name !== correctPattern.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctPattern, ...otherPatterns]
    .map(p => p.name)
    .sort(() => Math.random() - 0.5);

  const question = `A melody has this characteristic: ${correctPattern.description}. What pattern is this?`;

  return {
    id: `patterns-${Date.now()}`,
    mode: "patterns",
    question,
    correctAnswer: correctPattern.name,
    options,
    description: correctPattern.description,
    difficulty,
  };
}

function generateArticulationsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableArticulations = ARTICULATIONS[level];
  const correctArticulation = availableArticulations[Math.floor(Math.random() * availableArticulations.length)];

  const otherArticulations = availableArticulations
    .filter(a => a.name !== correctArticulation.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctArticulation, ...otherArticulations]
    .map(a => a.name)
    .sort(() => Math.random() - 0.5);

  const question = `Notes are played with this quality: ${correctArticulation.description}. What articulation is this?`;

  return {
    id: `articulations-${Date.now()}`,
    mode: "articulations",
    question,
    correctAnswer: correctArticulation.name,
    options,
    description: correctArticulation.description,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "transformations":
      return generateTransformationsRound(difficulty);
    case "patterns":
      return generatePatternsRound(difficulty);
    case "articulations":
      return generateArticulationsRound(difficulty);
    default:
      return generateTransformationsRound(difficulty);
  }
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
