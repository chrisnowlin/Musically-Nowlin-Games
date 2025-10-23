/**
 * Game Logic for Orchestration & Style Studio
 * ID: compose-002
 * Unified Skill: Arranging and styling music
 */

import { Compose002ModeId } from "./compose-002Modes";

export interface GameRound {
  id: string;
  mode: Compose002ModeId;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
}

export interface GameState {
  score: number;
  round: number;
  totalRounds: number;
  currentRound: GameRound | null;
  showResult: boolean;
  lastAnswerCorrect: boolean;
  gameStarted: boolean;
  level: number;
  correctStreak: number;
}

// Instrument families for orchestration mode
const instrumentFamilies = [
  { name: "Strings", instruments: ["Violin", "Viola", "Cello", "Double Bass"] },
  { name: "Woodwinds", instruments: ["Flute", "Clarinet", "Oboe", "Bassoon"] },
  { name: "Brass", instruments: ["Trumpet", "Trombone", "French Horn", "Tuba"] },
  { name: "Percussion", instruments: ["Timpani", "Snare Drum", "Cymbals", "Xylophone"] }
];

// Musical styles for style mode
const musicalStyles = [
  { name: "Classical", characteristics: ["Orchestral", "Formal", "Complex"] },
  { name: "Jazz", characteristics: ["Improvised", "Swing", "Blue Notes"] },
  { name: "Rock", characteristics: ["Electric", "Strong Beat", "Guitar-driven"] },
  { name: "Folk", characteristics: ["Acoustic", "Traditional", "Storytelling"] }
];

// Generate orchestration mode rounds
function generateOrchestrationRound(difficulty: number): GameRound {
  const family = instrumentFamilies[Math.floor(Math.random() * instrumentFamilies.length)];
  const correctInstrument = family.instruments[Math.floor(Math.random() * family.instruments.length)];
  
  // Generate wrong answers from other families
  const wrongAnswers: string[] = [];
  instrumentFamilies.forEach(f => {
    if (f.name !== family.name) {
      wrongAnswers.push(...f.instruments);
    }
  });
  
  // Select random wrong answers
  const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
  const options = [correctInstrument, ...shuffledWrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctInstrument);
  
  return {
    id: `orch-${Date.now()}`,
    mode: "orchestration",
    question: `Which instrument belongs to the ${family.name} family?`,
    options,
    correctAnswer: correctIndex,
    explanation: `${correctInstrument} is part of the ${family.name} family.`,
    difficulty
  };
}

// Generate style mode rounds
function generateStyleRound(difficulty: number): GameRound {
  const style = musicalStyles[Math.floor(Math.random() * musicalStyles.length)];
  const correctCharacteristic = style.characteristics[Math.floor(Math.random() * style.characteristics.length)];
  
  // Generate wrong answers from other styles
  const wrongAnswers: string[] = [];
  musicalStyles.forEach(s => {
    if (s.name !== style.name) {
      wrongAnswers.push(...s.characteristics);
    }
  });
  
  // Select random wrong answers
  const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
  const options = [correctCharacteristic, ...shuffledWrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctCharacteristic);
  
  return {
    id: `style-${Date.now()}`,
    mode: "style",
    question: `Which characteristic is associated with ${style.name} music?`,
    options,
    correctAnswer: correctIndex,
    explanation: `${correctCharacteristic} is a key feature of ${style.name} music.`,
    difficulty
  };
}

export function generateRound(mode: Compose002ModeId, difficulty: number = 1): GameRound {
  switch (mode) {
    case "orchestration":
      return generateOrchestrationRound(difficulty);
    case "style":
      return generateStyleRound(difficulty);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

export function validateAnswer(selectedAnswer: number, correctAnswer: number): boolean {
  return selectedAnswer === correctAnswer;
}

export function calculateScore(currentScore: number, isCorrect: boolean, difficulty: number): number {
  if (isCorrect) {
    return currentScore + (10 * difficulty);
  }
  return Math.max(0, currentScore - 5);
}

export function getNextLevel(currentLevel: number, correctStreak: number): number {
  // Level up every 5 correct answers in a row
  if (correctStreak > 0 && correctStreak % 5 === 0) {
    return Math.min(5, currentLevel + 1);
  }
  return currentLevel;
}
