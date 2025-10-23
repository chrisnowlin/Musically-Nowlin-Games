/**
 * Game Logic for Instrument Master
 * ID: timbre-001
 * Unified Skill: Identifying musical instruments
 */

import { 
  TIMBRE_MODES, 
  INSTRUMENT_FAMILIES, 
  INSTRUMENTS, 
  DIFFICULTY_CURVES,
  getDifficultyForMode,
  getInstrumentsByFamily,
  getInstrumentById,
  type GameMode,
  type DifficultySettings
} from './timbre-001Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options: string[];
  difficulty: number;
  instrument?: string;
  family?: string;
  questionType: 'sound' | 'image' | 'description';
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
}

// Initialize game state
export function initializeGame(mode: string, difficulty: number = 1): GameState {
  const modeConfig = TIMBRE_MODES.find(m => m.id === mode);
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
    gameStatus: 'menu'
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
    case 'families':
      return generateFamiliesRound(roundId, difficulty, difficultySettings);
    case 'types':
      return generateTypesRound(roundId, difficulty, difficultySettings);
    case 'specific-instruments':
      return generateSpecificInstrumentsRound(roundId, difficulty, difficultySettings);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

// Generate families mode round
function generateFamiliesRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const families = settings.parameters.families || ['strings', 'woodwinds', 'brass', 'percussion'];
  const familyCount = settings.parameters.familyCount || 2;
  
  // Select correct answer
  const correctFamily = families[Math.floor(Math.random() * families.length)];
  
  // Get instruments from correct family
  const instrumentsInFamily = getInstrumentsByFamily(correctFamily);
  const correctInstrument = instrumentsInFamily[Math.floor(Math.random() * instrumentsInFamily.length)];
  
  // Select distractor families
  const distractorFamilies = families
    .filter(f => f !== correctFamily)
    .sort(() => Math.random() - 0.5)
    .slice(0, familyCount - 1);
  
  const options = [correctFamily, ...distractorFamilies].sort(() => Math.random() - 0.5);
  
  const instrument = getInstrumentById(correctInstrument);
  const family = INSTRUMENT_FAMILIES[correctFamily as keyof typeof INSTRUMENT_FAMILIES];

  return {
    id: roundId,
    mode: 'families',
    question: `What family does this instrument belong to?`,
    answer: correctFamily,
    options,
    difficulty,
    instrument: correctInstrument,
    family: correctFamily,
    questionType: 'sound',
    hint: `Listen to the ${instrument?.name || 'instrument'}. ${family?.description || ''}`
  };
}

// Generate types mode round
function generateTypesRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const types = settings.parameters.types || ['violin', 'flute', 'trumpet', 'drums'];
  const typeCount = settings.parameters.typeCount || 2;
  const includeSimilar = settings.parameters.includeSimilar || false;
  
  // Select correct answer
  const correctType = types[Math.floor(Math.random() * types.length)];
  const correctInstrument = getInstrumentById(correctType);
  
  if (!correctInstrument) {
    throw new Error(`Invalid instrument type: ${correctType}`);
  }
  
  // Select distractors
  let distractors = types.filter(t => t !== correctType);
  
  // If include similar, add instruments from same family
  if (includeSimilar) {
    const sameFamilyInstruments = getInstrumentsByFamily(correctInstrument.family)
      .filter(i => i !== correctType);
    distractors = [...distractors, ...sameFamilyInstruments];
  }
  
  const finalDistractors = distractors
    .sort(() => Math.random() - 0.5)
    .slice(0, typeCount - 1);
  
  const options = [correctType, ...finalDistractors].sort(() => Math.random() - 0.5);

  return {
    id: roundId,
    mode: 'types',
    question: `What specific instrument are you hearing?`,
    answer: correctType,
    options,
    difficulty,
    instrument: correctType,
    family: correctInstrument.family,
    questionType: 'sound',
    hint: `This is a ${correctInstrument.family} instrument. ${correctInstrument.description}`
  };
}

// Generate specific instruments mode round
function generateSpecificInstrumentsRound(roundId: string, difficulty: number, settings: DifficultySettings): GameRound {
  const instruments = settings.parameters.instruments || Object.keys(INSTRUMENTS);
  const instrumentCount = settings.parameters.instrumentCount || 2;
  const bySound = settings.parameters.bySound !== false;
  const byImage = settings.parameters.byImage === true;
  
  // Select correct answer
  const correctInstrumentKey = instruments[Math.floor(Math.random() * instruments.length)];
  const correctInstrument = getInstrumentById(correctInstrumentKey);
  
  if (!correctInstrument) {
    throw new Error(`Invalid instrument: ${correctInstrumentKey}`);
  }
  
  // Select distractors
  const distractors = instruments
    .filter(i => i !== correctInstrumentKey)
    .sort(() => Math.random() - 0.5)
    .slice(0, instrumentCount - 1);
  
  const options = [correctInstrumentKey, ...distractors].sort(() => Math.random() - 0.5);
  
  // Determine question type
  const questionType = byImage && Math.random() > 0.5 ? 'image' : 'sound';
  const questionText = questionType === 'image' 
    ? `What instrument is shown in this picture?`
    : `What instrument are you hearing?`;

  return {
    id: roundId,
    mode: 'specific-instruments',
    question: questionText,
    answer: correctInstrumentKey,
    options,
    difficulty,
    instrument: correctInstrumentKey,
    family: correctInstrument.family,
    questionType: questionType as 'sound' | 'image',
    hint: `This is a ${correctInstrument.family} instrument. ${correctInstrument.description}`
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
  const timeBonus = Math.max(0, 50 - Math.floor(timeSpent / 1000)); // Convert to seconds
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
  
  return {
    ...gameState,
    score: gameState.score + score,
    streak: isCorrect ? gameState.streak + 1 : 0,
    currentRound: gameState.currentRound + 1,
    answers: newAnswers,
    gameStatus: gameState.currentRound + 1 >= gameState.totalRounds ? 'finished' : 'playing'
  };
}

// Generate all rounds for a game
export function generateGameRounds(mode: string, difficulty: number): GameRound[] {
  const modeConfig = TIMBRE_MODES.find(m => m.id === mode);
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
    improvements.push("Try listening more carefully to the instrument characteristics");
  }
  if (averageTime > 10000) {
    improvements.push("Work on recognizing instruments more quickly");
  }
  if (gameState.streak < 3) {
    improvements.push("Focus on building consistency in your answers");
  }
  
  return {
    score: gameState.score,
    totalRounds: gameState.totalRounds,
    correctAnswers,
    accuracy: Math.round(accuracy),
    averageTime: Math.round(averageTime),
    difficulty: gameState.difficulty,
    mode: gameState.mode,
    improvements
  };
}

// Get next difficulty level
export function getNextDifficulty(currentDifficulty: number, mode: string): number {
  const modeConfig = TIMBRE_MODES.find(m => m.id === mode);
  if (!modeConfig) return currentDifficulty;
  
  return Math.min(currentDifficulty + 1, modeConfig.maxDifficulty);
}

// Check if player is ready for next difficulty
export function isReadyForNextDifficulty(results: GameResult): boolean {
  return results.accuracy >= 80 && results.correctAnswers >= results.totalRounds * 0.8;
}

// Get instrument audio properties for sound generation
export function getInstrumentAudioProperties(instrumentId: string) {
  const instrument = getInstrumentById(instrumentId);
  if (!instrument) {
    throw new Error(`Instrument ${instrumentId} not found`);
  }
  
  return {
    frequency: instrument.frequency,
    waveform: instrument.waveform,
    envelope: instrument.envelope
  };
}

// Get family color for UI
export function getFamilyColor(familyId: string): string {
  const family = INSTRUMENT_FAMILIES[familyId as keyof typeof INSTRUMENT_FAMILIES];
  return family?.color || 'bg-gray-500';
}

// Get mode configuration
export function getModeConfig(modeId: string): GameMode | undefined {
  return TIMBRE_MODES.find(m => m.id === modeId);
}

// Export all modes for UI
export { TIMBRE_MODES, INSTRUMENT_FAMILIES, INSTRUMENTS };