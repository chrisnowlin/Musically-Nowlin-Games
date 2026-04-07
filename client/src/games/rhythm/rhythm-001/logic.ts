/**
 * Game Logic for Rhythm Master
 * ID: rhythm-001
 * Unified Skill: Understanding rhythmic patterns and transformations
 * Modes: patterns, transformations, analysis
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  correctAnswer: string;
  options: string[];
  rhythmPattern?: string;
  audioParams?: AudioParams;
  difficulty: number;
}

export interface AudioParams {
  pattern: number[]; // Array of beat subdivisions (1=quarter, 0.5=eighth, etc.)
  tempo: number;
}

const MODES = ["patterns", "transformations", "analysis"] as const;

// Rhythmic pattern types
const RHYTHM_PATTERNS = {
  easy: [
    { name: "Steady Quarter Notes", pattern: [1, 1, 1, 1], description: "Even beats" },
    { name: "Simple Eighths", pattern: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], description: "Even subdivisions" },
    { name: "Half and Quarters", pattern: [2, 1, 1], description: "Long-short-short" },
  ],
  medium: [
    { name: "Syncopation", pattern: [0.5, 1, 0.5, 1, 1], description: "Off-beat accents" },
    { name: "Dotted Rhythm", pattern: [1.5, 0.5, 1.5, 0.5], description: "Long-short pairs" },
    { name: "Triplet Feel", pattern: [0.67, 0.67, 0.67, 0.67, 0.67, 0.67], description: "Three-against-two" },
    { name: "Mixed Divisions", pattern: [1, 0.5, 0.5, 1, 1], description: "Quarter and eighths mixed" },
  ],
  hard: [
    { name: "Complex Syncopation", pattern: [0.5, 0.5, 1, 0.5, 1.5], description: "Advanced off-beats" },
    { name: "Hemiola", pattern: [1.5, 1.5, 1, 1, 1], description: "Three against two grouping" },
    { name: "Polyrhythm", pattern: [0.75, 0.75, 0.75, 0.75], description: "Cross-rhythm pattern" },
    { name: "Irregular Meter", pattern: [1, 1, 1, 0.5, 0.5, 1], description: "Asymmetric grouping" },
  ],
};

// Rhythm transformations
const TRANSFORMATIONS = {
  easy: [
    { name: "Same Pattern", description: "Identical rhythm" },
    { name: "Different Pattern", description: "Completely different" },
  ],
  medium: [
    { name: "Augmentation", description: "Notes made longer (slower)" },
    { name: "Diminution", description: "Notes made shorter (faster)" },
    { name: "Retrograde", description: "Pattern played backwards" },
  ],
  hard: [
    { name: "Augmentation", description: "Notes made longer (slower)" },
    { name: "Diminution", description: "Notes made shorter (faster)" },
    { name: "Retrograde", description: "Pattern played backwards" },
    { name: "Inversion", description: "Accents flipped" },
    { name: "Rotation", description: "Pattern starts at different point" },
  ],
};

// Time signatures and analysis
const TIME_SIGNATURES = {
  easy: [
    { name: "4/4", beats: 4, description: "Four quarter notes per measure" },
    { name: "3/4", beats: 3, description: "Three quarter notes per measure (waltz)" },
    { name: "2/4", beats: 2, description: "Two quarter notes per measure (march)" },
  ],
  medium: [
    { name: "4/4", beats: 4, description: "Four quarter notes per measure" },
    { name: "3/4", beats: 3, description: "Three quarter notes per measure (waltz)" },
    { name: "6/8", beats: 6, description: "Six eighth notes per measure" },
    { name: "2/2", beats: 2, description: "Two half notes per measure (cut time)" },
  ],
  hard: [
    { name: "5/4", beats: 5, description: "Five quarter notes per measure" },
    { name: "7/8", beats: 7, description: "Seven eighth notes per measure" },
    { name: "9/8", beats: 9, description: "Nine eighth notes per measure" },
    { name: "12/8", beats: 12, description: "Twelve eighth notes per measure" },
  ],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generatePatternsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availablePatterns = RHYTHM_PATTERNS[level];
  const correctPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

  const otherPatterns = availablePatterns
    .filter(p => p.name !== correctPattern.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctPattern, ...otherPatterns]
    .map(p => p.name)
    .sort(() => Math.random() - 0.5);

  const question = `Which rhythmic pattern is: ${correctPattern.description}?`;

  return {
    id: `patterns-${Date.now()}`,
    mode: "patterns",
    question,
    correctAnswer: correctPattern.name,
    options,
    rhythmPattern: correctPattern.description,
    audioParams: {
      pattern: correctPattern.pattern,
      tempo: 120,
    },
    difficulty,
  };
}

function generateTransformationsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableTransforms = TRANSFORMATIONS[level];
  const correctTransform = availableTransforms[Math.floor(Math.random() * availableTransforms.length)];

  const otherTransforms = availableTransforms
    .filter(t => t.name !== correctTransform.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctTransform, ...otherTransforms]
    .map(t => t.name)
    .sort(() => Math.random() - 0.5);

  const question = `A rhythm is transformed. The second version has: ${correctTransform.description}. What transformation is this?`;

  return {
    id: `transformations-${Date.now()}`,
    mode: "transformations",
    question,
    correctAnswer: correctTransform.name,
    options,
    rhythmPattern: correctTransform.description,
    difficulty,
  };
}

function generateAnalysisRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableSignatures = TIME_SIGNATURES[level];
  const correctSignature = availableSignatures[Math.floor(Math.random() * availableSignatures.length)];

  const otherSignatures = availableSignatures
    .filter(s => s.name !== correctSignature.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctSignature, ...otherSignatures]
    .map(s => s.name)
    .sort(() => Math.random() - 0.5);

  const question = `A piece has ${correctSignature.beats} beats per measure. What is the time signature?`;

  return {
    id: `analysis-${Date.now()}`,
    mode: "analysis",
    question,
    correctAnswer: correctSignature.name,
    options,
    rhythmPattern: correctSignature.description,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "patterns":
      return generatePatternsRound(difficulty);
    case "transformations":
      return generateTransformationsRound(difficulty);
    case "analysis":
      return generateAnalysisRound(difficulty);
    default:
      return generatePatternsRound(difficulty);
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
