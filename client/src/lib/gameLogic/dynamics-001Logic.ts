/**
 * Game Logic for Dynamics Master
 * ID: dynamics-001
 * Multi-mode game covering dynamics & expression concepts
 */

import { DYNAMIC_LEVELS, DIFFICULTY_CURVES, getDifficultyForMode } from './dynamics-001Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
  audioConfig: AudioConfig;
  explanation?: string;
}

export interface AudioConfig {
  type: 'single' | 'comparison' | 'progression' | 'articulation';
  volume1?: number;
  volume2?: number;
  direction?: 'crescendo' | 'diminuendo';
  dynamicLevel?: string;
  articulation?: string;
  notes?: number[];
  duration?: number;
}

export interface GameProgress {
  mode: string;
  score: number;
  roundsCompleted: number;
  currentDifficulty: number;
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  bestScore: number;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageAccuracy: number;
  modeStats: Record<string, GameProgress>;
  achievements: string[];
}

// Musical phrases for variety
const MUSICAL_PHRASES = [
  { name: "Ascending Scale", notes: [262, 294, 330, 349, 392] },      // C D E F G
  { name: "Descending Scale", notes: [392, 349, 330, 294, 262] },     // G F E D C
  { name: "Major Arpeggio", notes: [262, 330, 392, 523] },            // C E G C
  { name: "Minor Arpeggio", notes: [220, 262, 330, 440] },            // A C E A
  { name: "Twinkle Start", notes: [262, 262, 392, 392] },             // C C G G
  { name: "Fifth Jump", notes: [262, 392, 523, 392] },                // C G C G
  { name: "Step Up", notes: [262, 294, 262, 294] },                   // C D C D
  { name: "Triad", notes: [262, 330, 392, 330] }                      // C E G E
];

function getRandomPhrase(): number[] {
  const phrase = MUSICAL_PHRASES[Math.floor(Math.random() * MUSICAL_PHRASES.length)];
  return phrase.notes;
}

// Question generation functions for each mode
export function generateLevelsRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('levels', difficulty);
  const availableDynamics = difficultyConfig?.parameters.dynamics || ['p', 'f'];
  const optionsCount = difficultyConfig?.parameters.options || 2;
  
  // Select correct answer
  const correctDynamic = availableDynamics[Math.floor(Math.random() * availableDynamics.length)];
  const correctIndex = 0;
  
  // Generate options
  const options = [correctDynamic];
  const remainingDynamics = availableDynamics.filter((d: string) => d !== correctDynamic);
  
  while (options.length < optionsCount && remainingDynamics.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingDynamics.length);
    const selectedDynamic = remainingDynamics.splice(randomIndex, 1)[0];
    options.push(selectedDynamic);
  }
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Find correct answer index after shuffle
  const finalCorrectIndex = options.indexOf(correctDynamic);
  
  return {
    id: `levels-${Date.now()}`,
    mode: 'levels',
    question: `Listen to the music and select the correct dynamic level.`,
    options: options.map(d => `${d.toUpperCase()} - ${DYNAMIC_LEVELS[d as keyof typeof DYNAMIC_LEVELS].description}`),
    correctAnswer: finalCorrectIndex,
    difficulty,
    audioConfig: {
      type: 'single',
      dynamicLevel: correctDynamic,
      notes: getRandomPhrase(),
      duration: 2.0
    },
    explanation: `The correct answer is ${correctDynamic.toUpperCase()} (${DYNAMIC_LEVELS[correctDynamic as keyof typeof DYNAMIC_LEVELS].description}).`
  };
}

export function generateRelativeRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('relative', difficulty);
  const volumeDifference = difficultyConfig?.parameters.volumeDifference || 0.4;
  
  // Generate two volumes with specified difference
  const baseVolume = 0.3 + Math.random() * 0.3;
  const louderFirst = Math.random() > 0.5;
  
  let volume1, volume2, correctAnswer;
  if (louderFirst) {
    volume1 = Math.min(baseVolume + volumeDifference, 0.9);
    volume2 = baseVolume;
    correctAnswer = 0; // First is louder
  } else {
    volume1 = baseVolume;
    volume2 = Math.min(baseVolume + volumeDifference, 0.9);
    correctAnswer = 1; // Second is louder
  }
  
  return {
    id: `relative-${Date.now()}`,
    mode: 'relative',
    question: 'Which phrase is louder?',
    options: ['First phrase is louder', 'Second phrase is louder'],
    correctAnswer,
    difficulty,
    audioConfig: {
      type: 'comparison',
      volume1,
      volume2,
      notes: getRandomPhrase(),
      duration: 1.5
    },
    explanation: correctAnswer === 0 ? 'The first phrase was louder than the second.' : 'The second phrase was louder than the first.'
  };
}

export function generateChangesRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('changes', difficulty);
  const changeAmount = difficultyConfig?.parameters.changeAmount || 0.5;
  const duration = difficultyConfig?.parameters.duration || 2.0;
  
  // Randomly choose crescendo or diminuendo
  const isCrescendo = Math.random() > 0.5;
  const correctAnswer = isCrescendo ? 0 : 1;
  
  return {
    id: `changes-${Date.now()}`,
    mode: 'changes',
    question: 'Listen to the music. Does it get louder or softer?',
    options: ['Gets louder (crescendo)', 'Gets softer (diminuendo)'],
    correctAnswer,
    difficulty,
    audioConfig: {
      type: 'progression',
      direction: isCrescendo ? 'crescendo' : 'diminuendo',
      volume1: isCrescendo ? 0.2 : 0.7,
      volume2: isCrescendo ? 0.7 : 0.2,
      notes: getRandomPhrase(),
      duration
    },
    explanation: isCrescendo ? 'The music gradually got louder (crescendo).' : 'The music gradually got softer (diminuendo).'
  };
}

const ARTICULATION_INFO: Record<string, { definition: string, hint: string }> = {
  staccato: {
    definition: "Staccato notes are performed short and detached from each other.",
    hint: "Listen for the short, 'bouncy' quality with silence between the notes."
  },
  legato: {
    definition: "Legato notes are played smoothly and connected to each other.",
    hint: "The notes should flow continuously without any silence in between."
  },
  accent: {
    definition: "An accent indicates that a note should be played with more force or emphasis.",
    hint: "Listen for specific notes that 'pop' out or sound suddenly louder than the others."
  },
  tenuto: {
    definition: "Tenuto indicates holding a note for its full length, often with a slight stress.",
    hint: "The notes feel heavy and deliberate, held slightly longer than usual but not detached."
  },
  marcato: {
    definition: "Marcato indicates a note played loudly with a strong accent.",
    hint: "It sounds punchy, forceful, and distinct, often described as 'marked'."
  }
};

export function generatePulseRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('pulse', difficulty);
  const availableArticulations = difficultyConfig?.parameters.articulations || ['staccato', 'legato'];
  const optionsCount = difficultyConfig?.parameters.options || 2;
  
  // Select correct articulation
  const correctArticulation = availableArticulations[Math.floor(Math.random() * availableArticulations.length)];
  const correctIndex = 0;
  
  // Generate options
  const options = [correctArticulation];
  const remainingArticulations = availableArticulations.filter((a: string) => a !== correctArticulation);
  
  while (options.length < optionsCount && remainingArticulations.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingArticulations.length);
    const selectedArticulation = remainingArticulations.splice(randomIndex, 1)[0];
    options.push(selectedArticulation);
  }
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Find correct answer index after shuffle
  const finalCorrectIndex = options.indexOf(correctArticulation);
  
  return {
    id: `pulse-${Date.now()}`,
    mode: 'pulse',
    question: 'Listen to the music and select the correct articulation style.',
    options: options.map(a => a.charAt(0).toUpperCase() + a.slice(1)),
    correctAnswer: finalCorrectIndex,
    difficulty,
    audioConfig: {
      type: 'articulation',
      articulation: correctArticulation,
      notes: getRandomPhrase(),
      duration: 0.3
    },
    explanation: `The correct answer is ${correctArticulation.charAt(0).toUpperCase() + correctArticulation.slice(1)}. ${ARTICULATION_INFO[correctArticulation].definition} ${ARTICULATION_INFO[correctArticulation].hint}`
  };
}

// Main round generation function
export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case 'levels':
      return generateLevelsRound(difficulty);
    case 'relative':
      return generateRelativeRound(difficulty);
    case 'changes':
      return generateChangesRound(difficulty);
    case 'pulse':
      return generatePulseRound(difficulty);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

// Answer validation
export function validateAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}

// Score calculation
export interface ScoreBreakdown {
  baseScore: number;
  difficultyMultiplier: number;
  total: number;
}

export function getScoreBreakdown(correct: boolean, timeSpent: number, difficulty: number): ScoreBreakdown {
  if (!correct) {
    return { baseScore: 0, difficultyMultiplier: 1, total: 0 };
  }

  const baseScore = 100;
  
  // Simple multiplier matches difficulty level (1x, 2x, 3x)
  const difficultyMultiplier = difficulty;
  
  const total = Math.round(baseScore * difficultyMultiplier);
  
  return { baseScore, difficultyMultiplier, total };
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  return getScoreBreakdown(correct, timeSpent, difficulty).total;
}

// Difficulty progression
export function shouldIncreaseDifficulty(progress: GameProgress): boolean {
  const accuracy = progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
  
  return accuracy >= 0.8 && progress.roundsCompleted >= 5;
}

export function shouldDecreaseDifficulty(progress: GameProgress): boolean {
  const accuracy = progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
  
  return accuracy < 0.4 && progress.totalAnswers >= 3;
}

export function getNextDifficulty(currentDifficulty: number, progress: GameProgress, maxDifficulty: number): number {
  if (shouldIncreaseDifficulty(progress)) {
    return Math.min(currentDifficulty + 1, maxDifficulty);
  } else if (shouldDecreaseDifficulty(progress)) {
    return Math.max(currentDifficulty - 1, 1);
  }
  return currentDifficulty;
}

// Progress tracking
export function updateProgress(currentProgress: GameProgress, roundResult: {
  correct: boolean;
  timeSpent: number;
  score: number;
}): GameProgress {
  const newProgress = { ...currentProgress };
  
  newProgress.roundsCompleted++;
  newProgress.totalAnswers++;
  newProgress.score += roundResult.score;
  
  if (roundResult.correct) {
    newProgress.correctAnswers++;
  }
  
  // Update average time
  const totalTime = newProgress.averageTime * (newProgress.totalAnswers - 1) + roundResult.timeSpent;
  newProgress.averageTime = totalTime / newProgress.totalAnswers;
  
  // Update best score
  if (roundResult.score > newProgress.bestScore) {
    newProgress.bestScore = roundResult.score;
  }
  
  return newProgress;
}

// Statistics and achievements
export function calculateAccuracy(progress: GameProgress): number {
  return progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
}

export function getAchievements(stats: GameStats): string[] {
  const achievements: string[] = [];
  
  // Score-based achievements
  if (stats.totalScore >= 1000) achievements.push('Score Master');
  if (stats.totalScore >= 5000) achievements.push('Score Expert');
  if (stats.totalScore >= 10000) achievements.push('Score Legend');
  
  // Accuracy-based achievements
  if (stats.averageAccuracy >= 0.9) achievements.push('Precision Expert');
  if (stats.averageAccuracy >= 0.95) achievements.push('Precision Master');
  
  // Mode-specific achievements
  Object.entries(stats.modeStats).forEach(([mode, progress]) => {
    if (progress.currentDifficulty >= 3) {
      achievements.push(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Master`);
    }
    if (progress.bestScore >= 500) {
      achievements.push(`${mode.charAt(0).toUpperCase() + mode.slice(1)} High Scorer`);
    }
  });
  
  return Array.from(new Set(achievements)); // Remove duplicates
}

// Audio synthesis helpers
export function getAudioParameters(config: AudioConfig): {
  frequency: number;
  duration: number;
  volume: number;
  articulation?: string;
}[] {
  const notes = config.notes || [440]; // Default to A4
  const duration = config.duration || 1.0;
  
  switch (config.type) {
    case 'single':
      return notes.map(note => ({
        frequency: note,
        duration,
        volume: DYNAMIC_LEVELS[config.dynamicLevel as keyof typeof DYNAMIC_LEVELS]?.value || 0.5
      }));
      
    case 'comparison':
      // Return the sequence for the FIRST phrase
      // The component handles the second phrase logic currently, 
      // but it expects 'parameters' to be the first phrase.
      return notes.map(note => ({
        frequency: note,
        duration,
        volume: config.volume1 || 0.5
      }));
      
    case 'progression':
      // Return notes with calculated volumes for crescendo/diminuendo
      // If we have 4 notes, and volume goes from v1 to v2
      const count = notes.length;
      const v1 = config.volume1 || 0.5;
      const v2 = config.volume2 || 0.5;
      const step = (v2 - v1) / (count - 1 || 1);
      
      return notes.map((note, index) => ({
        frequency: note,
        duration,
        volume: v1 + (step * index),
        articulation: config.articulation // Passing direction as articulation if needed
      }));
      
    case 'articulation':
      return notes.map(note => ({
        frequency: note,
        duration: config.duration || 0.3,
        volume: 0.6,
        articulation: config.articulation
      }));
      
    default:
      return notes.map(note => ({
        frequency: note,
        duration,
        volume: 0.5
      }));
  }
}