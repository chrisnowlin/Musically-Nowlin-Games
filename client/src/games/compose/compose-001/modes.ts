/**
 * Mode Definitions for Composition Studio
 * ID: compose-001
 * Unified Skill: Composing original music
 */

export interface ModeDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  instructions: string[];
  difficultyRange: {
    min: number;
    max: number;
  };
  maxRounds: number;
}

export interface Challenge {
  id: string;
  text: string;
  difficulty: number;
  validation: {
    minLength?: number;
    maxLength?: number;
    requiredElements?: string[];
    patterns?: string[][];
  };
}

export const MODES: Record<string, ModeDefinition> = {
  melody: {
    id: "melody",
    name: "Melody",
    description: "Create original melodic lines and patterns",
    color: "blue",
    icon: "🎵",
    instructions: [
      "Click notes to add them to your melody",
      "Listen to your creation with the Play button",
      "Try to match the challenge requirements",
      "Submit when you're satisfied with your melody"
    ],
    difficultyRange: { min: 1, max: 5 },
    maxRounds: 10,
  },
  rhythm: {
    id: "rhythm",
    name: "Rhythm",
    description: "Compose rhythmic patterns and grooves",
    color: "orange",
    icon: "🥁",
    instructions: [
      "Click rhythm symbols to build your pattern",
      "Mix different note durations and rests",
      "Create patterns that match the challenge",
      "Submit your rhythmic composition"
    ],
    difficultyRange: { min: 1, max: 5 },
    maxRounds: 10,
  },
  harmony: {
    id: "harmony",
    name: "Harmony",
    description: "Build chord progressions and harmonic structures",
    color: "green",
    icon: "🎹",
    instructions: [
      "Select chords to build your progression",
      "Listen to how chords connect together",
      "Create progressions that sound complete",
      "Submit your harmonic composition"
    ],
    difficultyRange: { min: 1, max: 5 },
    maxRounds: 10,
  },
};

export const MELODY_CHALLENGES: Challenge[] = [
  {
    id: "melody-001",
    text: "Create an ascending melody using at least 4 notes",
    difficulty: 1,
    validation: {
      minLength: 4,
      maxLength: 8,
      patterns: [["ascending"]],
    },
  },
  {
    id: "melody-002",
    text: "Create a melody that goes up and down",
    difficulty: 2,
    validation: {
      minLength: 5,
      maxLength: 8,
      patterns: [["contour"]],
    },
  },
  {
    id: "melody-003",
    text: "Create a simple 3-note melody",
    difficulty: 1,
    validation: {
      minLength: 3,
      maxLength: 3,
    },
  },
  {
    id: "melody-004",
    text: "Create a melody using all 5 different notes",
    difficulty: 3,
    validation: {
      minLength: 5,
      maxLength: 8,
      requiredElements: ["variety"],
    },
  },
  {
    id: "melody-005",
    text: "Create a melody that repeats a pattern",
    difficulty: 4,
    validation: {
      minLength: 6,
      maxLength: 8,
      patterns: [["repetition"]],
    },
  },
];

export const RHYTHM_CHALLENGES: Challenge[] = [
  {
    id: "rhythm-001",
    text: "Create a 4-beat rhythm pattern",
    difficulty: 1,
    validation: {
      minLength: 4,
      maxLength: 8,
    },
  },
  {
    id: "rhythm-002",
    text: "Create a rhythm with at least one rest",
    difficulty: 2,
    validation: {
      minLength: 3,
      maxLength: 8,
      requiredElements: ["rest"],
    },
  },
  {
    id: "rhythm-003",
    text: "Create a pattern with quarter and eighth notes",
    difficulty: 2,
    validation: {
      minLength: 4,
      maxLength: 8,
      requiredElements: ["quarter", "eighth"],
    },
  },
  {
    id: "rhythm-004",
    text: "Create a simple steady beat pattern",
    difficulty: 1,
    validation: {
      minLength: 4,
      maxLength: 6,
      patterns: [["steady"]],
    },
  },
  {
    id: "rhythm-005",
    text: "Create a complex rhythm with mixed durations",
    difficulty: 4,
    validation: {
      minLength: 6,
      maxLength: 8,
      requiredElements: ["variety"],
    },
  },
];

export const HARMONY_CHALLENGES: Challenge[] = [
  {
    id: "harmony-001",
    text: "Create a 3-chord progression",
    difficulty: 1,
    validation: {
      minLength: 3,
      maxLength: 3,
    },
  },
  {
    id: "harmony-002",
    text: "Start with C Major and add two more chords",
    difficulty: 2,
    validation: {
      minLength: 3,
      maxLength: 4,
      requiredElements: ["C Major"],
    },
  },
  {
    id: "harmony-003",
    text: "Create a progression using major and minor chords",
    difficulty: 3,
    validation: {
      minLength: 3,
      maxLength: 5,
      requiredElements: ["major", "minor"],
    },
  },
  {
    id: "harmony-004",
    text: "Build a simple I-IV-V progression",
    difficulty: 2,
    validation: {
      minLength: 3,
      maxLength: 3,
      patterns: [["I-IV-V"]],
    },
  },
  {
    id: "harmony-005",
    text: "Create a progression that sounds complete",
    difficulty: 4,
    validation: {
      minLength: 4,
      maxLength: 6,
      patterns: [["cadence"]],
    },
  },
];

export function getChallengesForMode(mode: string): Challenge[] {
  switch (mode) {
    case "melody":
      return MELODY_CHALLENGES;
    case "rhythm":
      return RHYTHM_CHALLENGES;
    case "harmony":
      return HARMONY_CHALLENGES;
    default:
      return [];
  }
}

export function getModeDefinition(mode: string): ModeDefinition | undefined {
  return MODES[mode];
}

export function getAllModes(): ModeDefinition[] {
  return Object.values(MODES);
}

export function getRandomChallenge(mode: string, difficulty: number): Challenge {
  const challenges = getChallengesForMode(mode);
  const filteredChallenges = challenges.filter(c => c.difficulty <= difficulty);
  
  if (filteredChallenges.length === 0) {
    return challenges[0]; // Fallback to first challenge
  }
  
  return filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
}