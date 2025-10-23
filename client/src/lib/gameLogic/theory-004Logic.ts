/**
 * Game Logic for Key Signature Master
 * ID: theory-004
 * Unified Skill: Understanding key signatures and tonality
 * Modes: major, minor, analysis, modulation
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  correctAnswer: string;
  options: string[];
  accidentals: number; // Number of sharps (positive) or flats (negative)
  difficulty: number;
}

const MODES = ["major", "minor", "analysis", "modulation"] as const;

// Key signatures with sharps (positive) and flats (negative)
const MAJOR_KEYS = [
  { name: "C Major", accidentals: 0 },
  { name: "G Major", accidentals: 1 },
  { name: "D Major", accidentals: 2 },
  { name: "A Major", accidentals: 3 },
  { name: "E Major", accidentals: 4 },
  { name: "B Major", accidentals: 5 },
  { name: "F# Major", accidentals: 6 },
  { name: "F Major", accidentals: -1 },
  { name: "Bb Major", accidentals: -2 },
  { name: "Eb Major", accidentals: -3 },
  { name: "Ab Major", accidentals: -4 },
  { name: "Db Major", accidentals: -5 },
  { name: "Gb Major", accidentals: -6 },
];

const MINOR_KEYS = [
  { name: "A minor", accidentals: 0 },
  { name: "E minor", accidentals: 1 },
  { name: "B minor", accidentals: 2 },
  { name: "F# minor", accidentals: 3 },
  { name: "C# minor", accidentals: 4 },
  { name: "G# minor", accidentals: 5 },
  { name: "D# minor", accidentals: 6 },
  { name: "D minor", accidentals: -1 },
  { name: "G minor", accidentals: -2 },
  { name: "C minor", accidentals: -3 },
  { name: "F minor", accidentals: -4 },
  { name: "Bb minor", accidentals: -5 },
  { name: "Eb minor", accidentals: -6 },
];

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function getRandomKeys(keys: typeof MAJOR_KEYS, difficulty: number, count: number) {
  const level = getDifficultyLevel(difficulty);
  let filteredKeys = keys;

  if (level === "easy") {
    filteredKeys = keys.filter(k => Math.abs(k.accidentals) <= 2);
  } else if (level === "medium") {
    filteredKeys = keys.filter(k => Math.abs(k.accidentals) <= 4);
  }

  const shuffled = [...filteredKeys].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function generateMajorRound(difficulty: number): GameRound {
  const selectedKeys = getRandomKeys(MAJOR_KEYS, difficulty, 4);
  const correctKey = selectedKeys[0];

  const question = correctKey.accidentals === 0
    ? "Which major key has no sharps or flats?"
    : correctKey.accidentals > 0
    ? `Which major key has ${correctKey.accidentals} sharp${correctKey.accidentals > 1 ? 's' : ''}?`
    : `Which major key has ${Math.abs(correctKey.accidentals)} flat${Math.abs(correctKey.accidentals) > 1 ? 's' : ''}?`;

  return {
    id: `major-${Date.now()}`,
    mode: "major",
    question,
    correctAnswer: correctKey.name,
    options: selectedKeys.map(k => k.name).sort(() => Math.random() - 0.5),
    accidentals: correctKey.accidentals,
    difficulty,
  };
}

function generateMinorRound(difficulty: number): GameRound {
  const selectedKeys = getRandomKeys(MINOR_KEYS, difficulty, 4);
  const correctKey = selectedKeys[0];

  const question = correctKey.accidentals === 0
    ? "Which minor key has no sharps or flats?"
    : correctKey.accidentals > 0
    ? `Which minor key has ${correctKey.accidentals} sharp${correctKey.accidentals > 1 ? 's' : ''}?`
    : `Which minor key has ${Math.abs(correctKey.accidentals)} flat${Math.abs(correctKey.accidentals) > 1 ? 's' : ''}?`;

  return {
    id: `minor-${Date.now()}`,
    mode: "minor",
    question,
    correctAnswer: correctKey.name,
    options: selectedKeys.map(k => k.name).sort(() => Math.random() - 0.5),
    accidentals: correctKey.accidentals,
    difficulty,
  };
}

function generateAnalysisRound(difficulty: number): GameRound {
  const allKeys = [...MAJOR_KEYS, ...MINOR_KEYS];
  const level = getDifficultyLevel(difficulty);

  let filteredKeys = allKeys;
  if (level === "easy") {
    filteredKeys = allKeys.filter(k => Math.abs(k.accidentals) <= 2);
  } else if (level === "medium") {
    filteredKeys = allKeys.filter(k => Math.abs(k.accidentals) <= 4);
  }

  const correctKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
  const options = [correctKey, ...getRandomKeys(allKeys, difficulty, 3)];
  const uniqueOptions = Array.from(new Set(options.map(k => k.name)));

  const question = `A piece uses ${Math.abs(correctKey.accidentals)} ${correctKey.accidentals > 0 ? 'sharp' : 'flat'}${Math.abs(correctKey.accidentals) !== 1 ? 's' : ''}. What key is it likely in?`;

  return {
    id: `analysis-${Date.now()}`,
    mode: "analysis",
    question,
    correctAnswer: correctKey.name,
    options: uniqueOptions.slice(0, 4).sort(() => Math.random() - 0.5),
    accidentals: correctKey.accidentals,
    difficulty,
  };
}

function generateModulationRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);

  // Common modulation patterns
  const modulations = [
    { from: "C Major", to: "G Major", relationship: "dominant (V)" },
    { from: "C Major", to: "F Major", relationship: "subdominant (IV)" },
    { from: "C Major", to: "A minor", relationship: "relative minor" },
    { from: "G Major", to: "D Major", relationship: "dominant (V)" },
    { from: "G Major", to: "E minor", relationship: "relative minor" },
    { from: "A minor", to: "C Major", relationship: "relative major" },
    { from: "A minor", to: "E minor", relationship: "dominant (v)" },
  ];

  const mod = modulations[Math.floor(Math.random() * modulations.length)];
  const options = ["dominant (V)", "subdominant (IV)", "relative minor", "relative major", "parallel minor", "parallel major"];

  const question = `A piece in ${mod.from} modulates to ${mod.to}. What is the relationship?`;

  return {
    id: `modulation-${Date.now()}`,
    mode: "modulation",
    question,
    correctAnswer: mod.relationship,
    options: options.slice(0, 4).sort(() => Math.random() - 0.5),
    accidentals: 0,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "major":
      return generateMajorRound(difficulty);
    case "minor":
      return generateMinorRound(difficulty);
    case "analysis":
      return generateAnalysisRound(difficulty);
    case "modulation":
      return generateModulationRound(difficulty);
    default:
      return generateMajorRound(difficulty);
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
