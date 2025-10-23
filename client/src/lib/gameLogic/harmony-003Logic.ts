/**
 * Game Logic for Harmonic Progression Master
 * ID: harmony-003
 * Unified Skill: Identifying chord progressions, harmonic features, and harmonic rhythm
 */

import { 
  HARMONY_MODES, 
  CHORD_PROGRESSIONS, 
  HARMONIC_FEATURES, 
  HARMONIC_RHYTHMS,
  CHORDS,
  DIFFICULTY_CURVES,
  getDifficultyForMode,
  getProgressionById,
  getFeatureById,
  getRhythmById,
  getChordBySymbol,
  type GameMode,
  type DifficultySettings
} from './harmony-003Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options: string[];
  difficulty: number;
  progression?: string[];
  feature?: string;
  rhythm?: string;
  tempo?: number;
  key?: string;
  questionType: 'progression' | 'feature' | 'rhythm';
  hint?: string;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  mode: string;
  difficulty: number;
  rounds: GameRound[];
  answers: Array<{
    roundId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  gameStatus: 'menu' | 'playing' | 'paused' | 'finished';
  modeProgress: Record<string, {
    completed: number;
    bestScore: number;
    lastPlayed: number;
  }>;
}

export interface GameResult {
  score: number;
  totalRounds: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  difficulty: number;
  mode: string;
  improvements: string[];
  modeProgress: Record<string, number>;
}

// Initialize game state
export function initializeGame(mode: string, difficulty: number = 1): GameState {
  const modeConfig = HARMONY_MODES.find(m => m.id === mode);
  if (!modeConfig) {
    throw new Error(`Invalid mode: ${mode}`);
  }

  return {
    currentRound: 0,
    totalRounds: modeConfig.maxRounds,
    score: 0,
    streak: 0,
    mode,
    difficulty,
    rounds: [],
    answers: [],
    gameStatus: 'menu',
    modeProgress: {}
  };
}

// Generate a game round based on mode and difficulty
export function generateRound(mode: string, difficulty: number): GameRound {
  const difficultySettings = getDifficultyForMode(mode, difficulty);
  if (!difficultySettings) {
    throw new Error(`No difficulty settings found for mode ${mode}, difficulty ${difficulty}`);
  }

  const roundId = `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (mode) {
    case 'progressions':
      return generateProgressionsRound(roundId, difficulty, difficultySettings);
    case 'features':
      return generateFeaturesRound(roundId, difficulty, difficultySettings);
    case 'rhythm':
      return generateRhythmRound(roundId, difficulty, difficultySettings);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

// Generate progressions mode round
function generateProgressionsRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const progressionTypes = settings.parameters.progressionTypes || ['I-V-vi-IV', 'I-IV-V'];
  const chordCount = settings.parameters.chordCount || 4;
  
  // Select correct progression
  const correctProgressionId = progressionTypes[Math.floor(Math.random() * progressionTypes.length)];
  const correctProgression = getProgressionById(correctProgressionId);
  
  if (!correctProgression) {
    throw new Error(`Invalid progression: ${correctProgressionId}`);
  }
  
  // Select distractor progressions
  const distractors = progressionTypes
    .filter(p => p !== correctProgressionId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const options = [correctProgressionId, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    id: roundId,
    mode: 'progressions',
    question: `Identify this chord progression:`,
    answer: correctProgressionId,
    options,
    difficulty,
    progression: correctProgression.chords,
    tempo: 120,
    key: 'C',
    questionType: 'progression',
    hint: `Listen for the harmonic movement and chord relationships. ${correctProgression.description}`
  };
}

// Generate features mode round
function generateFeaturesRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const features = settings.parameters.features || ['authentic-cadence', 'half-cadence'];
  const featureCount = settings.parameters.featureCount || 2;
  
  // Select correct feature
  const correctFeatureId = features[Math.floor(Math.random() * features.length)];
  const correctFeature = getFeatureById(correctFeatureId);
  
  if (!correctFeature) {
    throw new Error(`Invalid feature: ${correctFeatureId}`);
  }
  
  // Select distractors
  const distractors = features
    .filter(f => f !== correctFeatureId)
    .sort(() => Math.random() - 0.5)
    .slice(0, featureCount - 1);
  
  const options = [correctFeatureId, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    id: roundId,
    mode: 'features',
    question: `What harmonic feature is being demonstrated?`,
    answer: correctFeatureId,
    options,
    difficulty,
    feature: correctFeatureId,
    tempo: 100,
    key: 'C',
    questionType: 'feature',
    hint: `Listen for the specific harmonic characteristic. ${correctFeature.description}`
  };
}

// Generate rhythm mode round
function generateRhythmRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const rhythmPatterns = settings.parameters.rhythmPatterns || ['one-per-measure', 'two-per-measure'];
  
  // Select correct rhythm
  const correctRhythmId = rhythmPatterns[Math.floor(Math.random() * rhythmPatterns.length)];
  const correctRhythm = getRhythmById(correctRhythmId);
  
  if (!correctRhythm) {
    throw new Error(`Invalid rhythm: ${correctRhythmId}`);
  }
  
  // Select distractors
  const distractors = rhythmPatterns
    .filter(r => r !== correctRhythmId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const options = [correctRhythmId, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    id: roundId,
    mode: 'rhythm',
    question: `How many chord changes per measure?`,
    answer: correctRhythmId,
    options,
    difficulty,
    rhythm: correctRhythmId,
    tempo: 120,
    key: 'C',
    questionType: 'rhythm',
    hint: `Count the chord changes in each measure. ${correctRhythm.description}`
  };
}

// Validate user answer
export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer === correctAnswer;
}

// Calculate score for a round
export function calculateScore(correct: boolean, timeSpent: number, difficulty: number, streak: number): number {
  if (!correct) return 0;
  
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - Math.floor(timeSpent / 1000));
  const streakBonus = Math.min(50, streak * 5);
  
  return Math.round(baseScore + timeBonus + streakBonus);
}

// Update game state after answer
export function updateGameState(
  gameState: GameState, 
  roundId: string, 
  userAnswer: string, 
  timeSpent: number
): GameState {
  const round = gameState.rounds.find(r => r.id === roundId);
  if (!round) {
    throw new Error(`Round ${roundId} not found`);
  }
  
  const isCorrect = validateAnswer(userAnswer, round.answer);
  const score = calculateScore(isCorrect, timeSpent, round.difficulty, gameState.streak);
  
  const newAnswers = [...gameState.answers, {
    roundId,
    userAnswer,
    correctAnswer: round.answer,
    isCorrect,
    timeSpent
  }];
  
  // Update mode progress
  const newModeProgress = { ...gameState.modeProgress };
  if (!newModeProgress[gameState.mode]) {
    newModeProgress[gameState.mode] = {
      completed: 0,
      bestScore: 0,
      lastPlayed: Date.now()
    };
  }
  
  newModeProgress[gameState.mode].completed++;
  newModeProgress[gameState.mode].bestScore = Math.max(
    newModeProgress[gameState.mode].bestScore,
    gameState.score + score
  );
  newModeProgress[gameState.mode].lastPlayed = Date.now();
  
  return {
    ...gameState,
    score: gameState.score + score,
    streak: isCorrect ? gameState.streak + 1 : 0,
    currentRound: gameState.currentRound + 1,
    answers: newAnswers,
    modeProgress: newModeProgress,
    gameStatus: gameState.currentRound + 1 >= gameState.totalRounds ? 'finished' : 'playing'
  };
}

// Generate all rounds for a game
export function generateGameRounds(mode: string, difficulty: number): GameRound[] {
  const modeConfig = HARMONY_MODES.find(m => m.id === mode);
  if (!modeConfig) {
    throw new Error(`Invalid mode: ${mode}`);
  }
  
  const rounds: GameRound[] = [];
  for (let i = 0; i < modeConfig.maxRounds; i++) {
    rounds.push(generateRound(mode, difficulty));
  }
  
  return rounds;
}

// Calculate final game results
export function calculateGameResults(gameState: GameState): GameResult {
  const correctAnswers = gameState.answers.filter(a => a.isCorrect).length;
  const totalTime = gameState.answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const averageTime = gameState.answers.length > 0 ? totalTime / gameState.answers.length : 0;
  const accuracy = gameState.answers.length > 0 ? (correctAnswers / gameState.answers.length) * 100 : 0;
  
  // Generate improvement suggestions
  const improvements: string[] = [];
  if (accuracy < 70) {
    improvements.push("Focus on listening to the complete harmonic progression");
  }
  if (averageTime > 10000) {
    improvements.push("Work on recognizing harmonic patterns more quickly");
  }
  if (gameState.streak < 3) {
    improvements.push("Build consistency by practicing similar progressions");
  }
  
  return {
    score: gameState.score,
    totalRounds: gameState.totalRounds,
    correctAnswers,
    accuracy: Math.round(accuracy),
    averageTime: Math.round(averageTime),
    difficulty: gameState.difficulty,
    mode: gameState.mode,
    improvements,
    modeProgress: Object.fromEntries(
      Object.entries(gameState.modeProgress).map(([mode, progress]) => [mode, progress.completed])
    )
  };
}

// Get next difficulty level
export function getNextDifficulty(currentDifficulty: number, mode: string): number {
  const modeConfig = HARMONY_MODES.find(m => m.id === mode);
  if (!modeConfig) return currentDifficulty;
  
  return Math.min(currentDifficulty + 1, modeConfig.maxDifficulty);
}

// Check if player is ready for next difficulty
export function isReadyForNextDifficulty(results: GameResult): boolean {
  return results.accuracy >= 80 && results.correctAnswers >= results.totalRounds * 0.8;
}

// Audio synthesis helpers
export function getChordFrequencies(chordSymbol: string, rootFreq: number = 261.63): number[] {
  // Handle secondary dominants (e.g., V/V)
  if (chordSymbol.includes('/')) {
    const [dominant, target] = chordSymbol.split('/');
    if (dominant === 'V' && target === 'V') {
      // V/V is the dominant of the dominant (II7 in C major)
      // Use a major chord built on the second scale degree
      return [
        rootFreq * Math.pow(2, 2 / 12), // D (root of V/V)
        rootFreq * Math.pow(2, 6 / 12), // F#
        rootFreq * Math.pow(2, 9 / 12)  // A
      ];
    }
  }
  
  // Handle borrowed chords (e.g., iv from minor key)
  if (chordSymbol === 'iv') {
    // iv is the minor subdominant (F minor in C major)
    return [
      rootFreq * Math.pow(2, 5 / 12), // F (root)
      rootFreq * Math.pow(2, 8 / 12), // Ab
      rootFreq * Math.pow(2, 12 / 12) // C
    ];
  }
  
  const chord = getChordBySymbol(chordSymbol);
  if (!chord) {
    throw new Error(`Invalid chord: ${chordSymbol}`);
  }
  
  return chord.notes.map(semiTone => rootFreq * Math.pow(2, semiTone / 12));
}

export function getProgressionAudioData(progression: string[], rootFreq: number = 261.63): Array<{
  frequencies: number[];
  duration: number;
}> {
  return progression.map(chordSymbol => {
    const frequencies = getChordFrequencies(chordSymbol, rootFreq);
    return {
      frequencies,
      duration: 1000 // 1 second per chord
    };
  });
}

export function getFeatureAudioData(featureId: string, rootFreq: number = 261.63): {
  frequencies: number[];
  duration: number;
  pattern: string;
} {
  const feature = getFeatureById(featureId);
  if (!feature) {
    throw new Error(`Invalid feature: ${featureId}`);
  }
  
  // Define audio patterns for different features
  const patterns: Record<string, { frequencies: number[]; duration: number }> = {
    'authentic-cadence': {
      frequencies: getChordFrequencies('V', rootFreq),
      duration: 500
    },
    'half-cadence': {
      frequencies: getChordFrequencies('V', rootFreq),
      duration: 500
    },
    'plagal-cadence': {
      frequencies: getChordFrequencies('IV', rootFreq),
      duration: 500
    },
    'deceptive-cadence': {
      frequencies: getChordFrequencies('vi', rootFreq),
      duration: 500
    },
    'secondary-dominant': {
      frequencies: getChordFrequencies('V/V', rootFreq),
      duration: 500
    },
    'modulation': {
      frequencies: getChordFrequencies('V', rootFreq * 1.12), // Modulate up
      duration: 1000
    },
    'borrowed-chord': {
      frequencies: getChordFrequencies('iv', rootFreq), // Borrowed from minor
      duration: 500
    },
    'augmented-sixth': {
      frequencies: [rootFreq * 1.5, rootFreq * 1.6, rootFreq * 1.8], // Ger+6
      duration: 500
    }
  };
  
  const pattern = patterns[featureId] || patterns['authentic-cadence'];
  
  return {
    frequencies: pattern.frequencies,
    duration: pattern.duration,
    pattern: featureId
  };
}

export function getRhythmAudioData(rhythmId: string, rootFreq: number = 261.63): {
  chordChanges: number[];
  tempo: number;
  pattern: string;
} {
  const rhythm = getRhythmById(rhythmId);
  if (!rhythm) {
    throw new Error(`Invalid rhythm: ${rhythmId}`);
  }
  
  return {
    chordChanges: rhythm.pattern,
    tempo: 120,
    pattern: rhythmId
  };
}

// Get mode configuration
export function getModeConfig(modeId: string): GameMode | undefined {
  return HARMONY_MODES.find(m => m.id === modeId);
}

// Export all modes for UI
export { HARMONY_MODES, CHORD_PROGRESSIONS, HARMONIC_FEATURES, HARMONIC_RHYTHMS, CHORDS };