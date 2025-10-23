/**
 * Game Logic for Timbre Analyzer
 * ID: timbre-002
 * Unified Skill: Understanding sound quality and timbre
 * Modes: quality, texture, presence
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
  type: OscillatorType;
  frequency: number;
  filterFreq?: number;
  filterQ?: number;
  reverbAmount?: number;
  brightness?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
}

const MODES = ["quality", "texture", "presence"] as const;

// Quality mode: Bright vs Dark, Warm vs Cold
const QUALITY_OPTIONS = {
  easy: ["bright", "dark"],
  medium: ["bright", "dark", "warm", "cold"],
  hard: ["bright", "dark", "warm", "cold", "rich", "thin"],
};

// Texture mode: Smooth vs Rough
const TEXTURE_OPTIONS = {
  easy: ["smooth", "rough"],
  medium: ["smooth", "rough", "percussive", "sustained"],
  hard: ["smooth", "rough", "percussive", "sustained", "granular", "flowing"],
};

// Presence mode: Close vs Distant
const PRESENCE_OPTIONS = {
  easy: ["close", "distant"],
  medium: ["close", "distant", "spacious", "intimate"],
  hard: ["close", "distant", "spacious", "intimate", "airy", "dense"],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generateQualityRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const options = QUALITY_OPTIONS[level];
  const correctAnswer = options[Math.floor(Math.random() * options.length)];

  let audioParams: AudioParams;
  switch (correctAnswer) {
    case "bright":
      audioParams = {
        type: "triangle",
        frequency: 880 + Math.random() * 440,
        filterFreq: 4000 + Math.random() * 2000,
        brightness: 0.8,
      };
      break;
    case "dark":
      audioParams = {
        type: "sine",
        frequency: 220 + Math.random() * 110,
        filterFreq: 500 + Math.random() * 200,
        brightness: 0.2,
      };
      break;
    case "warm":
      audioParams = {
        type: "sine",
        frequency: 440,
        filterFreq: 800,
        filterQ: 1.5,
        brightness: 0.4,
      };
      break;
    case "cold":
      audioParams = {
        type: "triangle",
        frequency: 880,
        filterFreq: 3000,
        filterQ: 3,
        brightness: 0.7,
      };
      break;
    case "rich":
      audioParams = {
        type: "sawtooth",
        frequency: 440,
        filterFreq: 2000,
        filterQ: 0.7,
        brightness: 0.6,
      };
      break;
    case "thin":
      audioParams = {
        type: "sine",
        frequency: 1320,
        filterFreq: 1500,
        filterQ: 5,
        brightness: 0.5,
      };
      break;
    default:
      audioParams = {
        type: "sine",
        frequency: 440,
        brightness: 0.5,
      };
  }

  return {
    id: `quality-${Date.now()}`,
    mode: "quality",
    question: `Listen to the sound. Which quality best describes it?`,
    correctAnswer,
    options: [...options].sort(() => Math.random() - 0.5),
    audioParams,
    difficulty,
  };
}

function generateTextureRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const options = TEXTURE_OPTIONS[level];
  const correctAnswer = options[Math.floor(Math.random() * options.length)];

  let audioParams: AudioParams;
  switch (correctAnswer) {
    case "smooth":
      audioParams = {
        type: "sine",
        frequency: 440,
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      };
      break;
    case "rough":
      audioParams = {
        type: "sawtooth",
        frequency: 330,
        attack: 0.01,
        decay: 0.05,
        sustain: 0.8,
        release: 0.1,
      };
      break;
    case "percussive":
      audioParams = {
        type: "triangle",
        frequency: 523,
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.1,
      };
      break;
    case "sustained":
      audioParams = {
        type: "sine",
        frequency: 392,
        attack: 0.2,
        decay: 0.1,
        sustain: 0.9,
        release: 0.4,
      };
      break;
    case "granular":
      audioParams = {
        type: "square",
        frequency: 261,
        attack: 0.001,
        decay: 0.01,
        sustain: 0.5,
        release: 0.05,
      };
      break;
    case "flowing":
      audioParams = {
        type: "triangle",
        frequency: 659,
        attack: 0.15,
        decay: 0.3,
        sustain: 0.6,
        release: 0.5,
      };
      break;
    default:
      audioParams = {
        type: "sine",
        frequency: 440,
        attack: 0.1,
        decay: 0.1,
        sustain: 0.7,
        release: 0.2,
      };
  }

  return {
    id: `texture-${Date.now()}`,
    mode: "texture",
    question: `Listen to the sound. Which texture best describes it?`,
    correctAnswer,
    options: [...options].sort(() => Math.random() - 0.5),
    audioParams,
    difficulty,
  };
}

function generatePresenceRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const options = PRESENCE_OPTIONS[level];
  const correctAnswer = options[Math.floor(Math.random() * options.length)];

  let audioParams: AudioParams;
  switch (correctAnswer) {
    case "close":
      audioParams = {
        type: "triangle",
        frequency: 440,
        filterFreq: 5000,
        reverbAmount: 0.1,
      };
      break;
    case "distant":
      audioParams = {
        type: "sine",
        frequency: 440,
        filterFreq: 1200,
        reverbAmount: 0.7,
      };
      break;
    case "spacious":
      audioParams = {
        type: "triangle",
        frequency: 523,
        filterFreq: 3000,
        reverbAmount: 0.6,
      };
      break;
    case "intimate":
      audioParams = {
        type: "sawtooth",
        frequency: 392,
        filterFreq: 4000,
        reverbAmount: 0.15,
      };
      break;
    case "airy":
      audioParams = {
        type: "sine",
        frequency: 880,
        filterFreq: 6000,
        reverbAmount: 0.4,
      };
      break;
    case "dense":
      audioParams = {
        type: "sawtooth",
        frequency: 220,
        filterFreq: 1500,
        reverbAmount: 0.2,
      };
      break;
    default:
      audioParams = {
        type: "sine",
        frequency: 440,
        reverbAmount: 0.3,
      };
  }

  return {
    id: `presence-${Date.now()}`,
    mode: "presence",
    question: `Listen to the sound. How does it feel in terms of space and presence?`,
    correctAnswer,
    options: [...options].sort(() => Math.random() - 0.5),
    audioParams,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "quality":
      return generateQualityRound(difficulty);
    case "texture":
      return generateTextureRound(difficulty);
    case "presence":
      return generatePresenceRound(difficulty);
    default:
      return generateQualityRound(difficulty);
  }
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
