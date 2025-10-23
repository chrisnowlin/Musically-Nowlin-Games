/**
 * Game Logic for Interval Master
 * ID: harmony-001
 * Unified Skill: Understanding intervals and pitch distances
 * Modes: all-intervals, qualities
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  correctAnswer: string;
  options: string[];
  audioParams: AudioParams;
  difficulty: number;
}

export interface AudioParams {
  type: "harmonic" | "melodic-ascending" | "melodic-descending";
  baseFreq: number;
  intervalSemitones: number;
  intervalName: string;
}

const MODES = ["all-intervals", "qualities"] as const;

// All intervals with semitone distances
const ALL_INTERVALS = [
  { name: "unison", semitones: 0, quality: "perfect" },
  { name: "minor 2nd", semitones: 1, quality: "minor" },
  { name: "major 2nd", semitones: 2, quality: "major" },
  { name: "minor 3rd", semitones: 3, quality: "minor" },
  { name: "major 3rd", semitones: 4, quality: "major" },
  { name: "perfect 4th", semitones: 5, quality: "perfect" },
  { name: "tritone", semitones: 6, quality: "augmented" },
  { name: "perfect 5th", semitones: 7, quality: "perfect" },
  { name: "minor 6th", semitones: 8, quality: "minor" },
  { name: "major 6th", semitones: 9, quality: "major" },
  { name: "minor 7th", semitones: 10, quality: "minor" },
  { name: "major 7th", semitones: 11, quality: "major" },
  { name: "octave", semitones: 12, quality: "perfect" },
];

// Interval qualities
const INTERVAL_QUALITIES = ["perfect", "major", "minor", "augmented", "diminished"] as const;

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function getRandomBaseFreq(): number {
  // Random base note between C4 (261.63 Hz) and C5 (523.25 Hz)
  const baseNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
  return baseNotes[Math.floor(Math.random() * baseNotes.length)];
}

function generateAllIntervalsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);

  let availableIntervals = ALL_INTERVALS;
  if (level === "easy") {
    // Easy: unison, octave, perfect 5th, perfect 4th, major 3rd
    availableIntervals = ALL_INTERVALS.filter(i =>
      [0, 4, 5, 7, 12].includes(i.semitones)
    );
  } else if (level === "medium") {
    // Medium: add 2nds, 3rds, 6ths
    availableIntervals = ALL_INTERVALS.filter(i =>
      i.semitones <= 9
    );
  }
  // Hard: all intervals

  const correctInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];

  // Get 3 other random intervals for options
  const otherIntervals = availableIntervals
    .filter(i => i.name !== correctInterval.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctInterval, ...otherIntervals]
    .map(i => i.name)
    .sort(() => Math.random() - 0.5);

  const playType = Math.random() < 0.5 ? "harmonic" : Math.random() < 0.5 ? "melodic-ascending" : "melodic-descending";
  const baseFreq = getRandomBaseFreq();

  const question = playType === "harmonic"
    ? "Listen to these two notes played together. What interval is this?"
    : playType === "melodic-ascending"
    ? "Listen to these two notes played upward. What interval is this?"
    : "Listen to these two notes played downward. What interval is this?";

  return {
    id: `all-intervals-${Date.now()}`,
    mode: "all-intervals",
    question,
    correctAnswer: correctInterval.name,
    options,
    audioParams: {
      type: playType,
      baseFreq,
      intervalSemitones: correctInterval.semitones,
      intervalName: correctInterval.name,
    },
    difficulty,
  };
}

function generateQualitiesRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);

  let availableQualities: string[];
  if (level === "easy") {
    availableQualities = ["perfect", "major", "minor"];
  } else if (level === "medium") {
    availableQualities = ["perfect", "major", "minor", "augmented"];
  } else {
    availableQualities = ["perfect", "major", "minor", "augmented", "diminished"];
  }

  // Select a random quality
  const correctQuality = availableQualities[Math.floor(Math.random() * availableQualities.length)];

  // Find intervals with that quality
  const intervalsWithQuality = ALL_INTERVALS.filter(i => i.quality === correctQuality);
  const selectedInterval = intervalsWithQuality[Math.floor(Math.random() * intervalsWithQuality.length)];

  const options = availableQualities.sort(() => Math.random() - 0.5).slice(0, 4);

  const playType = Math.random() < 0.5 ? "harmonic" : "melodic-ascending";
  const baseFreq = getRandomBaseFreq();

  const question = `Listen to this ${selectedInterval.name}. What is its quality?`;

  return {
    id: `qualities-${Date.now()}`,
    mode: "qualities",
    question,
    correctAnswer: correctQuality,
    options,
    audioParams: {
      type: playType,
      baseFreq,
      intervalSemitones: selectedInterval.semitones,
      intervalName: selectedInterval.name,
    },
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "all-intervals":
      return generateAllIntervalsRound(difficulty);
    case "qualities":
      return generateQualitiesRound(difficulty);
    default:
      return generateAllIntervalsRound(difficulty);
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
