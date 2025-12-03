/**
 * Game Logic for Expression Master
 * ID: dynamics-002
 * Unified Skill: Understanding musical expression and interpretation
 * 
 * This module handles:
 * - Round generation for articulation and interpretation modes
 * - Answer validation
 * - Score calculation with difficulty multipliers
 * - Progress tracking and difficulty progression
 * - Audio parameter generation
 */

import {
  ARTICULATION_STYLES,
  INTERPRETATIONS,
  DIFFICULTY_CURVES,
  getDifficultyForMode,
  getRandomPhrase
} from './dynamics-002Modes';

/**
 * Represents a single game round
 */
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

/**
 * Audio configuration for a round
 */
export interface AudioConfig {
  type: 'single' | 'comparison' | 'sequence';
  articulation?: string;
  phrase?: number[];
  phrasing?: 'legato' | 'staccato' | 'accent' | 'tenuto';
  duration?: number;
}

/**
 * Tracks progress within a game session
 */
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

/**
 * Overall game statistics
 */
export interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageAccuracy: number;
  modeStats: Record<string, GameProgress>;
  achievements: string[];
}

/**
 * Generate a round for the articulation mode
 * Players identify the articulation style being played
 */
export function generateArticulationRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('articulation', difficulty);
  const availableArticulations = difficultyConfig?.parameters.articulations || ['legato', 'staccato'];
  const optionsCount = difficultyConfig?.parameters.options || 2;
  
  // Select correct answer
  const correctArticulation = availableArticulations[Math.floor(Math.random() * availableArticulations.length)];
  
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
  
  // Get articulation info for display
  const articulationInfo = ARTICULATION_STYLES[correctArticulation as keyof typeof ARTICULATION_STYLES];
  
  return {
    id: `articulation-${Date.now()}`,
    mode: 'articulation',
    question: 'Listen to the musical phrase. What articulation style do you hear?',
    options: options.map(a => {
      const info = ARTICULATION_STYLES[a as keyof typeof ARTICULATION_STYLES];
      return `${info.name} (${info.definition})`;
    }),
    correctAnswer: finalCorrectIndex,
    difficulty,
    audioConfig: {
      type: 'single',
      phrase: getRandomPhrase(),
      phrasing: correctArticulation as 'legato' | 'staccato' | 'accent' | 'tenuto',
      articulation: correctArticulation
    },
    explanation: `The correct answer is ${articulationInfo.name}. ${articulationInfo.definition}`
  };
}

/**
 * Generate a round for the interpretation mode
 * Players identify the character/emotion of a phrase
 */
export function generateInterpretationRound(difficulty: number): GameRound {
  const difficultyConfig = getDifficultyForMode('interpretation', difficulty);
  const availablePhrasings = difficultyConfig?.parameters.phrasings || ['legato', 'staccato'];
  
  // Select correct phrasing
  const correctPhrasing = availablePhrasings[Math.floor(Math.random() * availablePhrasings.length)];
  const correctInterpretation = INTERPRETATIONS[correctPhrasing as keyof typeof INTERPRETATIONS];
  
  // Generate options - mix of correct and distractors
  const allInterpretations = Object.entries(INTERPRETATIONS)
    .map(([key, val]) => ({ key, character: val.character }));
  
  const correctOption = correctInterpretation.character;
  const distractors = allInterpretations
    .filter(i => i.character !== correctOption)
    .map(i => i.character);
  
  // Add some generic distractors for variety
  const genericDistractors = [
    'Disconnected and random',
    'Silent and mysterious',
    'Harsh and jarring'
  ];
  
  const availableDistractors = [...distractors, ...genericDistractors];
  const options = [correctOption];
  
  // Add distractors
  const numDistractors = Math.min(3, availableDistractors.length);
  const shuffledDistractors = availableDistractors.sort(() => Math.random() - 0.5);
  options.push(...shuffledDistractors.slice(0, numDistractors));
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  const finalCorrectIndex = options.indexOf(correctOption);
  
  const questions = [
    'How would you describe this musical phrase?',
    'What character does this phrase have?',
    'What emotion does this phrase convey?'
  ];
  const question = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    id: `interpretation-${Date.now()}`,
    mode: 'interpretation',
    question,
    options,
    correctAnswer: finalCorrectIndex,
    difficulty,
    audioConfig: {
      type: 'single',
      phrase: getRandomPhrase(),
      phrasing: correctPhrasing as 'legato' | 'staccato' | 'accent' | 'tenuto'
    },
    explanation: `The correct answer is "${correctInterpretation.character}". ${correctInterpretation.description}`
  };
}

/**
 * Main round generation function - dispatches to mode-specific generators
 */
export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case 'articulation':
      return generateArticulationRound(difficulty);
    case 'interpretation':
      return generateInterpretationRound(difficulty);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Validate a user's answer
 */
export function validateAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}

/**
 * Score breakdown for detailed feedback
 */
export interface ScoreBreakdown {
  baseScore: number;
  difficultyMultiplier: number;
  total: number;
}

/**
 * Get detailed score breakdown
 */
export function getScoreBreakdown(correct: boolean, timeSpent: number, difficulty: number): ScoreBreakdown {
  if (!correct) {
    return { baseScore: 0, difficultyMultiplier: 1, total: 0 };
  }

  const baseScore = 100;
  const difficultyMultiplier = difficulty;
  const total = Math.round(baseScore * difficultyMultiplier);
  
  return { baseScore, difficultyMultiplier, total };
}

/**
 * Calculate score for a round
 */
export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  return getScoreBreakdown(correct, timeSpent, difficulty).total;
}

/**
 * Determine if difficulty should increase based on performance
 */
export function shouldIncreaseDifficulty(progress: GameProgress): boolean {
  const accuracy = progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
  return accuracy >= 0.8 && progress.roundsCompleted >= 5;
}

/**
 * Determine if difficulty should decrease based on performance
 */
export function shouldDecreaseDifficulty(progress: GameProgress): boolean {
  const accuracy = progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
  return accuracy < 0.4 && progress.totalAnswers >= 3;
}

/**
 * Calculate the next difficulty level based on performance
 */
export function getNextDifficulty(currentDifficulty: number, progress: GameProgress, maxDifficulty: number): number {
  if (shouldIncreaseDifficulty(progress)) {
    return Math.min(currentDifficulty + 1, maxDifficulty);
  } else if (shouldDecreaseDifficulty(progress)) {
    return Math.max(currentDifficulty - 1, 1);
  }
  return currentDifficulty;
}

/**
 * Update progress after a round
 */
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

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(progress: GameProgress): number {
  return progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
}

/**
 * Get achievements based on game statistics
 */
export function getAchievements(stats: GameStats): string[] {
  const achievements: string[] = [];
  
  // Score-based achievements
  if (stats.totalScore >= 500) achievements.push('Expression Explorer');
  if (stats.totalScore >= 1000) achievements.push('Expression Expert');
  if (stats.totalScore >= 2000) achievements.push('Expression Master');
  
  // Accuracy-based achievements
  if (stats.averageAccuracy >= 0.8) achievements.push('Keen Ear');
  if (stats.averageAccuracy >= 0.9) achievements.push('Perfect Pitch');
  
  // Mode-specific achievements
  Object.entries(stats.modeStats).forEach(([mode, progress]) => {
    if (progress.currentDifficulty >= 3) {
      achievements.push(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Master`);
    }
    if (progress.roundsCompleted >= 20) {
      achievements.push(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Enthusiast`);
    }
  });
  
  return Array.from(new Set(achievements));
}

/**
 * Audio synthesis parameters for a given configuration
 */
export interface AudioParameter {
  frequency: number;
  duration: number;
  volume: number;
  articulation?: string;
  startTime?: number;
}

/**
 * Generate audio parameters from a round's audio config
 */
export function getAudioParameters(config: AudioConfig): AudioParameter[] {
  const notes = config.phrase || [440];
  const articulation = config.phrasing || config.articulation || 'legato';
  const articulationInfo = ARTICULATION_STYLES[articulation as keyof typeof ARTICULATION_STYLES];
  
  const duration = articulationInfo?.noteDuration || 0.5;
  const spacing = articulationInfo?.noteSpacing || 0.5;
  
  return notes.map((note, index) => ({
    frequency: note,
    duration,
    volume: 0.3,
    articulation,
    startTime: index * spacing
  }));
}

/**
 * Create initial progress state
 */
export function createInitialProgress(mode: string): GameProgress {
  return {
    mode,
    score: 0,
    roundsCompleted: 0,
    currentDifficulty: 1,
    correctAnswers: 0,
    totalAnswers: 0,
    averageTime: 0,
    bestScore: 0
  };
}

/**
 * Create initial game stats
 */
export function createInitialStats(): GameStats {
  return {
    totalGamesPlayed: 0,
    totalScore: 0,
    averageAccuracy: 0,
    modeStats: {},
    achievements: []
  };
}
