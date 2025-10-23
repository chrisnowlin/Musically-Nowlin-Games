/**
 * Game Logic for Technique Master
 * ID: timbre-003
 * Unified Skill: Understanding performance techniques and articulations
 * Modes: string-techniques, articulation
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
  technique?: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  modulation?: number;
  tremolo?: boolean;
  vibrato?: boolean;
}

const MODES = ["string-techniques", "articulation"] as const;

// String techniques
const STRING_TECHNIQUES = {
  easy: ["pizzicato", "arco"],
  medium: ["pizzicato", "arco", "tremolo", "spiccato"],
  hard: ["pizzicato", "arco", "tremolo", "spiccato", "col-legno", "sul-ponticello"],
};

// Articulation types
const ARTICULATIONS = {
  easy: ["staccato", "legato"],
  medium: ["staccato", "legato", "marcato", "tenuto"],
  hard: ["staccato", "legato", "marcato", "tenuto", "accent", "portato"],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generateStringTechniquesRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const options = STRING_TECHNIQUES[level];
  const correctAnswer = options[Math.floor(Math.random() * options.length)];

  let audioParams: AudioParams;
  switch (correctAnswer) {
    case "pizzicato":
      audioParams = {
        type: "triangle",
        frequency: 440,
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.2,
        technique: "pluck",
      };
      break;
    case "arco":
      audioParams = {
        type: "sawtooth",
        frequency: 440,
        attack: 0.1,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3,
        technique: "bow",
      };
      break;
    case "tremolo":
      audioParams = {
        type: "sawtooth",
        frequency: 440,
        attack: 0.05,
        decay: 0.05,
        sustain: 0.7,
        release: 0.2,
        technique: "tremolo",
        tremolo: true,
        modulation: 8,
      };
      break;
    case "spiccato":
      audioParams = {
        type: "triangle",
        frequency: 523,
        attack: 0.005,
        decay: 0.02,
        sustain: 0.3,
        release: 0.1,
        technique: "bounce",
      };
      break;
    case "col-legno":
      audioParams = {
        type: "square",
        frequency: 330,
        attack: 0.001,
        decay: 0.03,
        sustain: 0,
        release: 0.05,
        technique: "wood",
      };
      break;
    case "sul-ponticello":
      audioParams = {
        type: "sawtooth",
        frequency: 880,
        attack: 0.08,
        decay: 0.1,
        sustain: 0.6,
        release: 0.2,
        technique: "bridge",
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
    id: `string-${Date.now()}`,
    mode: "string-techniques",
    question: "Listen to this string technique. What technique is being used?",
    correctAnswer,
    options: [...options].sort(() => Math.random() - 0.5),
    audioParams,
    difficulty,
  };
}

function generateArticulationRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const options = ARTICULATIONS[level];
  const correctAnswer = options[Math.floor(Math.random() * options.length)];

  let audioParams: AudioParams;
  switch (correctAnswer) {
    case "staccato":
      audioParams = {
        type: "triangle",
        frequency: 523,
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        release: 0.05,
      };
      break;
    case "legato":
      audioParams = {
        type: "sine",
        frequency: 440,
        attack: 0.15,
        decay: 0.1,
        sustain: 0.9,
        release: 0.3,
      };
      break;
    case "marcato":
      audioParams = {
        type: "sawtooth",
        frequency: 392,
        attack: 0.002,
        decay: 0.08,
        sustain: 0.7,
        release: 0.1,
      };
      break;
    case "tenuto":
      audioParams = {
        type: "sine",
        frequency: 523,
        attack: 0.05,
        decay: 0.05,
        sustain: 0.95,
        release: 0.15,
      };
      break;
    case "accent":
      audioParams = {
        type: "triangle",
        frequency: 659,
        attack: 0.001,
        decay: 0.1,
        sustain: 0.6,
        release: 0.2,
      };
      break;
    case "portato":
      audioParams = {
        type: "sine",
        frequency: 349,
        attack: 0.08,
        decay: 0.08,
        sustain: 0.75,
        release: 0.2,
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
    id: `articulation-${Date.now()}`,
    mode: "articulation",
    question: "Listen to this articulation. Which articulation is this?",
    correctAnswer,
    options: [...options].sort(() => Math.random() - 0.5),
    audioParams,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "string-techniques":
      return generateStringTechniquesRound(difficulty);
    case "articulation":
      return generateArticulationRound(difficulty);
    default:
      return generateStringTechniquesRound(difficulty);
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
