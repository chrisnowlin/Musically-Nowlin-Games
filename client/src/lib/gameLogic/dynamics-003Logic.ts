/**
 * Game Logic for Emotion Master
 * ID: dynamics-003
 * Multi-mode game covering emotional recognition and analysis in music
 */

import { 
  GameMode, 
  DifficultyLevel, 
  EmotionConfig,
  getModeById, 
  getDifficultyForMode, 
  getEmotionConfig,
  getAnalysisOptionsForEmotion,
  EMOTIONS,
  DIFFICULTY_CURVES,
  EMOTION_MODES
} from './dynamics-003Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  options: string[];
  correctAnswer: number;
  emotionId: string;
  audioConfig: AudioConfig;
  difficulty: number;
  explanation?: string;
}

export interface AudioConfig {
  emotion: string;
  melody: number[];
  tempo: number;
  dynamics: number;
}

export interface GameProgress {
  mode: string;
  score: number;
  round: number;
  difficulty: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
  bestStreak: number;
}

export interface ScoreBreakdown {
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  difficultyMultiplier: number;
  total: number;
}

/**
 * Generate a round based on mode and difficulty
 */
export function generateRound(mode: string, difficulty: number): GameRound {
  const modeConfig = getModeById(mode);
  const difficultyConfig = getDifficultyForMode(mode, difficulty);
  
  if (!modeConfig || !difficultyConfig) {
    throw new Error(`Invalid mode or difficulty: ${mode}, ${difficulty}`);
  }

  const emotionIds = difficultyConfig.parameters.emotions as string[];
  const randomEmotionId = emotionIds[Math.floor(Math.random() * emotionIds.length)];
  const emotionConfig = getEmotionConfig(randomEmotionId);
  
  if (!emotionConfig) {
    throw new Error(`Invalid emotion ID: ${randomEmotionId}`);
  }

  let round: GameRound;

  if (mode === 'detection') {
    round = generateDetectionRound(difficultyConfig, randomEmotionId, emotionConfig);
  } else if (mode === 'analysis') {
    round = generateAnalysisRound(difficultyConfig, randomEmotionId, emotionConfig);
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  return round;
}

/**
 * Generate a detection mode round
 */
function generateDetectionRound(
  difficulty: DifficultyLevel, 
  emotionId: string, 
  emotionConfig: EmotionConfig
): GameRound {
  const availableEmotions = difficulty.parameters.emotions as string[];
  const optionsCount = difficulty.parameters.optionsCount as number;
  
  // Get incorrect emotions
  const incorrectEmotions = availableEmotions
    .filter(e => e !== emotionId)
    .sort(() => Math.random() - 0.5)
    .slice(0, optionsCount - 1);
  
  // Create options array
  const options = [emotionId, ...incorrectEmotions].sort(() => Math.random() - 0.5);
  const correctAnswer = options.indexOf(emotionId);

  return {
    id: `round-${Date.now()}-${Math.random()}`,
    mode: 'detection',
    question: 'Listen to the musical phrase. What emotion does it express?',
    options: options.map(e => EMOTIONS[e].name),
    correctAnswer,
    emotionId,
    audioConfig: {
      emotion: emotionId,
      melody: emotionConfig.melody,
      tempo: emotionConfig.tempo,
      dynamics: emotionConfig.dynamics
    },
    difficulty: difficulty.level,
    explanation: `This ${emotionConfig.name} emotion uses ${emotionConfig.characteristics.join(', ').toLowerCase()}.`
  };
}

/**
 * Generate an analysis mode round
 */
function generateAnalysisRound(
  difficulty: DifficultyLevel, 
  emotionId: string, 
  emotionConfig: EmotionConfig
): GameRound {
  const analysisOptions = getAnalysisOptionsForEmotion(emotionId);
  const correctAnswer = 0; // First option is always correct in our setup
  
  // For analysis mode, always use 4 options regardless of difficulty
  const shuffledOptions = [...analysisOptions].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.indexOf(analysisOptions[0]);

  const questions = {
    happy: 'What musical elements create the joyful character?',
    sad: 'What creates the melancholic feeling in this phrase?',
    energetic: 'How does this music express energy?',
    calm: 'What makes this phrase feel peaceful?',
    mysterious: 'What creates the mysterious atmosphere?',
    triumphant: 'What gives this music its triumphant character?'
  };

  return {
    id: `round-${Date.now()}-${Math.random()}`,
    mode: 'analysis',
    question: questions[emotionId as keyof typeof questions] || 'What musical elements create this emotional effect?',
    options: shuffledOptions,
    correctAnswer: correctIndex,
    emotionId,
    audioConfig: {
      emotion: emotionId,
      melody: emotionConfig.melody,
      tempo: emotionConfig.tempo,
      dynamics: emotionConfig.dynamics
    },
    difficulty: difficulty.level,
    explanation: `The ${emotionConfig.name} emotion is created through ${emotionConfig.characteristics.join(', ').toLowerCase()}.`
  };
}

/**
 * Validate user answer
 */
export function validateAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}

/**
 * Calculate score based on performance
 */
export function calculateScore(
  correct: boolean, 
  timeSpent: number, 
  difficulty: number, 
  streak: number = 0
): number {
  if (!correct) return 0;
  
  const baseScore = 100 * difficulty;
  const speedBonus = Math.max(0, Math.round(50 - (timeSpent / 1000))); // Convert ms to seconds
  const streakBonus = Math.min(50, streak * 5);
  
  return baseScore + speedBonus + streakBonus;
}

/**
 * Get detailed score breakdown
 */
export function getScoreBreakdown(
  correct: boolean,
  timeSpent: number,
  difficulty: number,
  streak: number = 0
): ScoreBreakdown {
  const baseScore = correct ? 100 * difficulty : 0;
  const speedBonus = correct ? Math.max(0, Math.round(50 - (timeSpent / 1000))) : 0;
  const streakBonus = correct ? Math.min(50, streak * 5) : 0;
  const difficultyMultiplier = difficulty;
  
  return {
    baseScore,
    speedBonus,
    streakBonus,
    difficultyMultiplier,
    total: baseScore + speedBonus + streakBonus
  };
}

/**
 * Update progress after a round
 */
export function updateProgress(
  currentProgress: GameProgress,
  correct: boolean,
  timeSpent: number
): GameProgress {
  const newCorrectAnswers = currentProgress.correctAnswers + (correct ? 1 : 0);
  const newTotalAnswers = currentProgress.totalAnswers + 1;
  const newStreak = correct ? currentProgress.streak + 1 : 0;
  const newBestStreak = Math.max(currentProgress.bestStreak, newStreak);
  
  // Calculate new difficulty based on performance
  const accuracy = newCorrectAnswers / newTotalAnswers;
  let newDifficulty = currentProgress.difficulty;
  
  if (accuracy >= 0.8 && newTotalAnswers >= 3) {
    // Consider increasing difficulty
    const maxDifficulty = getMaxDifficultyForMode(currentProgress.mode);
    if (currentProgress.difficulty < maxDifficulty) {
      newDifficulty = currentProgress.difficulty + 1;
    }
  } else if (accuracy < 0.5 && newTotalAnswers >= 3) {
    // Consider decreasing difficulty
    if (currentProgress.difficulty > 1) {
      newDifficulty = currentProgress.difficulty - 1;
    }
  }
  
  const score = calculateScore(correct, timeSpent, currentProgress.difficulty, currentProgress.streak);
  
  return {
    ...currentProgress,
    score: currentProgress.score + score,
    correctAnswers: newCorrectAnswers,
    totalAnswers: newTotalAnswers,
    streak: newStreak,
    bestStreak: newBestStreak,
    difficulty: newDifficulty
  };
}

/**
 * Get next difficulty level
 */
export function getNextDifficulty(mode: string, currentDifficulty: number): number {
  const maxDifficulty = getMaxDifficultyForMode(mode);
  return Math.min(maxDifficulty, currentDifficulty + 1);
}

/**
 * Get audio parameters for synthesis
 */
export function getAudioParameters(emotionId: string): AudioConfig | null {
  const emotion = getEmotionConfig(emotionId);
  if (!emotion) return null;
  
  return {
    emotion: emotionId,
    melody: emotion.melody,
    tempo: emotion.tempo,
    dynamics: emotion.dynamics
  };
}

/**
 * Get max difficulty for a mode
 */
export function getMaxDifficultyForMode(modeId: string): number {
  const difficulties = DIFFICULTY_CURVES[modeId];
  return difficulties ? difficulties.length : 1;
}

/**
 * Check if a mode exists
 */
export function isValidMode(modeId: string): boolean {
  return getModeById(modeId) !== undefined;
}

/**
 * Get all available modes
 */
export function getAllModes(): GameMode[] {
  return [...EMOTION_MODES];
}

/**
 * Reset progress for a mode
 */
export function resetProgress(mode: string): GameProgress {
  return {
    mode,
    score: 0,
    round: 1,
    difficulty: 1,
    correctAnswers: 0,
    totalAnswers: 0,
    streak: 0,
    bestStreak: 0
  };
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correctAnswers: number, totalAnswers: number): number {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
}

/**
 * Get performance feedback
 */
export function getPerformanceFeedback(accuracy: number): string {
  if (accuracy >= 90) return "Outstanding! You're mastering emotional recognition!";
  if (accuracy >= 75) return "Excellent work! You have a great ear for emotion.";
  if (accuracy >= 60) return "Good job! Keep practicing to improve further.";
  if (accuracy >= 40) return "Nice try! Focus on tempo and dynamics clues.";
  return "Keep practicing! Listen carefully to melody direction and mood.";
}
