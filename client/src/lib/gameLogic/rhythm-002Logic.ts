/**
 * Game Logic for Tempo & Pulse Master
 * ID: rhythm-002
 * Unified Skill: Understanding musical speed, pulse, and tempo changes
 */

import {
  RHYTHM_MODES,
  TEMPO_MARKINGS,
  TEMPO_CHANGE_TYPES,
  SUBDIVISION_PATTERNS,
  TIME_SIGNATURES,
  RHYTHM_CONCEPTS,
  DIFFICULTY_CURVES,
  getModeById,
  getDifficultyForMode,
  getTempoByBPM,
  getSubdivisionByDifficulty,
  getRandomTempo,
  generateTempoChange,
  generateSubdivisionPattern,
  type GameMode,
  type DifficultySettings
} from './rhythm-002Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options?: string[];
  difficulty: number;
  questionType: string;

  // Tempo-specific
  startTempo?: number;
  endTempo?: number;
  tempoChangeType?: string;
  tempoMarkings?: string[];

  // Subdivision-specific
  subdivisionType?: string;
  beatsPerMeasure?: number;
  timeSignature?: string;
  pattern?: number[];

  // Analysis-specific
  conceptType?: string;
  patternData?: any;

  hint?: string;
  audioData?: any;
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
  gameStatus: 'playing' | 'completed' | 'failed';
  startTime: number;
  elapsedTime: number;
}

export interface Rhythm002State extends GameState {
  currentMode: GameMode;
  currentRoundData: GameRound | null;
  lives: number;
  consecutiveCorrect: number;
  streakBonus: number;
}

export class Rhythm002Logic {
  static generateRound(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    totalRounds: number
  ): GameRound {
    const difficultySettings = getDifficultyForMode(mode.id, difficulty);
    if (!difficultySettings) {
      throw new Error(`No difficulty settings found for mode ${mode.id} at level ${difficulty}`);
    }

    switch (mode.id) {
      case 'tempo-changes':
        return this.generateTempoChangesRound(mode, difficulty, roundIndex, difficultySettings);
      case 'pulse-subdivisions':
        return this.generatePulseSubdivisionsRound(mode, difficulty, roundIndex, difficultySettings);
      case 'analysis':
        return this.generateAnalysisRound(mode, difficulty, roundIndex, difficultySettings);
      default:
        throw new Error(`Unknown mode: ${mode.id}`);
    }
  }

  // ===== TEMPO CHANGES MODE =====
  private static generateTempoChangesRound(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    settings: DifficultySettings
  ): GameRound {
    const { tempoRange, tempoChangeTypes, tempoChangeAmount } = settings.parameters;

    const questionTypes = ['identify-tempo', 'identify-change', 'compare-tempos'];
    const questionType = questionTypes[Math.floor(Math.random() * Math.min(questionTypes.length, difficulty))];

    let round: GameRound;

    switch (questionType) {
      case 'identify-tempo':
        round = this.generateIdentifyTempoQuestion(mode, difficulty, roundIndex, tempoRange!);
        break;
      case 'identify-change':
        round = this.generateIdentifyChangeQuestion(mode, difficulty, roundIndex, tempoRange!, tempoChangeTypes!);
        break;
      case 'compare-tempos':
        round = this.generateCompareTemposQuestion(mode, difficulty, roundIndex, tempoRange!);
        break;
      default:
        round = this.generateIdentifyTempoQuestion(mode, difficulty, roundIndex, tempoRange!);
    }

    return round;
  }

  private static generateIdentifyTempoQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    tempoRange: [number, number]
  ): GameRound {
    const tempo = getRandomTempo(tempoRange);
    const correctTempoMarking = getTempoByBPM(tempo);
    const correctTempo = TEMPO_MARKINGS[correctTempoMarking as keyof typeof TEMPO_MARKINGS];

    // Generate options
    const allTempos = Object.keys(TEMPO_MARKINGS);
    const options = this.generateOptions(correctTempoMarking, allTempos, 4);

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'identify-tempo',
      question: `Listen to the tempo. What speed marking best describes it?`,
      answer: correctTempo.name,
      options: options.map(key => TEMPO_MARKINGS[key as keyof typeof TEMPO_MARKINGS].name),
      difficulty,
      startTempo: tempo,
      tempoMarkings: options,
      hint: `The tempo is around ${tempo} BPM. ${correctTempo.description}.`
    };
  }

  private static generateIdentifyChangeQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    tempoRange: [number, number],
    changeTypes: string[]
  ): GameRound {
    const startTempo = getRandomTempo(tempoRange);
    const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
    const tempoSequence = generateTempoChange(startTempo, changeType, 4);
    const endTempo = tempoSequence[tempoSequence.length - 1];

    const change = TEMPO_CHANGE_TYPES[changeType as keyof typeof TEMPO_CHANGE_TYPES];
    const options = this.generateOptions(
      changeType,
      Object.keys(TEMPO_CHANGE_TYPES).filter(t => changeTypes.includes(t)),
      4
    );

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'identify-change',
      question: `Listen to the music. How does the tempo change?`,
      answer: change.name,
      options: options.map(key => TEMPO_CHANGE_TYPES[key as keyof typeof TEMPO_CHANGE_TYPES].name),
      difficulty,
      startTempo,
      endTempo,
      tempoChangeType: changeType,
      audioData: { tempoSequence },
      hint: `The tempo ${change.description.toLowerCase()}.`
    };
  }

  private static generateCompareTemposQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    tempoRange: [number, number]
  ): GameRound {
    const tempo1 = getRandomTempo(tempoRange);
    const diff = 20 + (difficulty * 10);
    const tempo2 = tempo1 + (Math.random() > 0.5 ? diff : -diff);

    const faster = tempo1 > tempo2 ? 'First' : 'Second';
    const options = ['First', 'Second', 'Same speed'];

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'compare-tempos',
      question: `Listen to two rhythms. Which one is faster?`,
      answer: faster,
      options,
      difficulty,
      audioData: { tempo1, tempo2 },
      hint: `Compare the speed of the beats.`
    };
  }

  // ===== PULSE SUBDIVISIONS MODE =====
  private static generatePulseSubdivisionsRound(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    settings: DifficultySettings
  ): GameRound {
    const { subdivisionTypes, beatsPerMeasure } = settings.parameters;

    const questionTypes = ['identify-subdivision', 'count-subdivisions', 'match-pattern'];
    const questionType = questionTypes[Math.floor(Math.random() * Math.min(questionTypes.length, difficulty))];

    switch (questionType) {
      case 'identify-subdivision':
        return this.generateIdentifySubdivisionQuestion(mode, difficulty, roundIndex, subdivisionTypes!);
      case 'count-subdivisions':
        return this.generateCountSubdivisionsQuestion(mode, difficulty, roundIndex, subdivisionTypes!, beatsPerMeasure!);
      case 'match-pattern':
        return this.generateMatchPatternQuestion(mode, difficulty, roundIndex, subdivisionTypes!);
      default:
        return this.generateIdentifySubdivisionQuestion(mode, difficulty, roundIndex, subdivisionTypes!);
    }
  }

  private static generateIdentifySubdivisionQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    subdivisionTypes: string[]
  ): GameRound {
    const subdivisionType = subdivisionTypes[Math.floor(Math.random() * subdivisionTypes.length)];
    const subdivision = SUBDIVISION_PATTERNS[subdivisionType as keyof typeof SUBDIVISION_PATTERNS];

    const options = this.generateOptions(subdivisionType, subdivisionTypes, 4);

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'identify-subdivision',
      question: `Listen to the rhythm. What subdivision pattern do you hear?`,
      answer: subdivision.name,
      options: options.map(key => SUBDIVISION_PATTERNS[key as keyof typeof SUBDIVISION_PATTERNS].name),
      difficulty,
      subdivisionType,
      pattern: generateSubdivisionPattern(subdivisionType, 2, 4),
      hint: `${subdivision.description}. Symbol: ${subdivision.symbol}`
    };
  }

  private static generateCountSubdivisionsQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    subdivisionTypes: string[],
    beatsPerMeasure: number[]
  ): GameRound {
    const subdivisionType = subdivisionTypes[Math.floor(Math.random() * subdivisionTypes.length)];
    const subdivision = SUBDIVISION_PATTERNS[subdivisionType as keyof typeof SUBDIVISION_PATTERNS];
    const beats = beatsPerMeasure[Math.floor(Math.random() * beatsPerMeasure.length)];

    const totalNotes = beats * subdivision.divisionsPerBeat;
    const options = [
      totalNotes.toString(),
      (totalNotes - subdivision.divisionsPerBeat).toString(),
      (totalNotes + subdivision.divisionsPerBeat).toString(),
      (beats).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'count-subdivisions',
      question: `How many notes are played in one measure?`,
      answer: totalNotes.toString(),
      options,
      difficulty,
      subdivisionType,
      beatsPerMeasure: beats,
      pattern: generateSubdivisionPattern(subdivisionType, 1, beats),
      hint: `There are ${beats} beats with ${subdivision.divisionsPerBeat} notes per beat.`
    };
  }

  private static generateMatchPatternQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    subdivisionTypes: string[]
  ): GameRound {
    const subdivisionType = subdivisionTypes[Math.floor(Math.random() * subdivisionTypes.length)];
    const subdivision = SUBDIVISION_PATTERNS[subdivisionType as keyof typeof SUBDIVISION_PATTERNS];

    // Generate a simple rhythmic pattern
    const pattern = generateSubdivisionPattern(subdivisionType, 1, 4);

    // Create visual representation options
    const options = subdivisionTypes.slice(0, 4).map(type =>
      SUBDIVISION_PATTERNS[type as keyof typeof SUBDIVISION_PATTERNS].symbol
    );

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'match-pattern',
      question: `Which notation matches the rhythm you hear?`,
      answer: subdivision.symbol,
      options,
      difficulty,
      subdivisionType,
      pattern,
      hint: `Listen for ${subdivision.description.toLowerCase()}.`
    };
  }

  // ===== ANALYSIS MODE =====
  private static generateAnalysisRound(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    settings: DifficultySettings
  ): GameRound {
    const { analysisTypes } = settings.parameters;

    const conceptType = analysisTypes![Math.floor(Math.random() * analysisTypes!.length)];
    const concept = RHYTHM_CONCEPTS[conceptType as keyof typeof RHYTHM_CONCEPTS];

    const questionTypes = ['identify-concept', 'detect-feature', 'analyze-pattern'];
    const questionType = questionTypes[Math.floor(Math.random() * Math.min(questionTypes.length, difficulty))];

    switch (questionType) {
      case 'identify-concept':
        return this.generateIdentifyConceptQuestion(mode, difficulty, roundIndex, conceptType, concept);
      case 'detect-feature':
        return this.generateDetectFeatureQuestion(mode, difficulty, roundIndex, analysisTypes!);
      case 'analyze-pattern':
        return this.generateAnalyzePatternQuestion(mode, difficulty, roundIndex, conceptType, concept);
      default:
        return this.generateIdentifyConceptQuestion(mode, difficulty, roundIndex, conceptType, concept);
    }
  }

  private static generateIdentifyConceptQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    conceptType: string,
    concept: any
  ): GameRound {
    const allConcepts = Object.keys(RHYTHM_CONCEPTS);
    const options = this.generateOptions(conceptType, allConcepts, 4);

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'identify-concept',
      question: `What rhythmic technique is being used?`,
      answer: concept.name,
      options: options.map(key => RHYTHM_CONCEPTS[key as keyof typeof RHYTHM_CONCEPTS].name),
      difficulty,
      conceptType,
      patternData: concept.example,
      hint: `${concept.description}.`
    };
  }

  private static generateDetectFeatureQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    analysisTypes: string[]
  ): GameRound {
    const hasConcept = Math.random() > 0.4;
    const conceptType = hasConcept ?
      analysisTypes[Math.floor(Math.random() * analysisTypes.length)] :
      'none';

    const concept = hasConcept ? RHYTHM_CONCEPTS[conceptType as keyof typeof RHYTHM_CONCEPTS] : null;
    const options = ['Yes', 'No'];

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'detect-feature',
      question: hasConcept ?
        `Does this rhythm contain ${concept!.name.toLowerCase()}?` :
        `Does this rhythm contain syncopation?`,
      answer: hasConcept ? 'Yes' : 'No',
      options,
      difficulty,
      conceptType,
      patternData: hasConcept ? concept!.example : [1, 1, 1, 1],
      hint: hasConcept ? `Listen for ${concept!.description.toLowerCase()}.` : 'The rhythm is steady with no syncopation.'
    };
  }

  private static generateAnalyzePatternQuestion(
    mode: GameMode,
    difficulty: number,
    roundIndex: number,
    conceptType: string,
    concept: any
  ): GameRound {
    const questions = [
      { q: 'How many strong beats are emphasized?', a: '2' },
      { q: 'What is the main rhythmic feel?', a: concept.name },
      { q: 'Is this rhythm simple or complex?', a: difficulty >= 2 ? 'Complex' : 'Simple' }
    ];

    const selected = questions[Math.floor(Math.random() * questions.length)];
    const options = selected.q.includes('How many') ?
      ['1', '2', '3', '4'] :
      selected.q.includes('feel') ?
        [concept.name, 'Regular', 'Irregular', 'Flowing'] :
        ['Simple', 'Complex'];

    return {
      id: `rhythm-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      questionType: 'analyze-pattern',
      question: selected.q,
      answer: selected.a,
      options,
      difficulty,
      conceptType,
      patternData: concept.example,
      hint: `Analyze the overall structure and feel.`
    };
  }

  // ===== VALIDATION & SCORING =====
  static validateAnswer(userAnswer: string, correctAnswer: string, round: GameRound): boolean {
    // Normalize answers for comparison
    const normalize = (str: string) => str.toLowerCase().trim();
    return normalize(userAnswer) === normalize(correctAnswer);
  }

  static calculateScore(
    isCorrect: boolean,
    timeSpent: number,
    difficulty: number,
    streak: number
  ): number {
    if (!isCorrect) return 0;

    const baseScore = 100 * difficulty;

    // Time bonus (max 50 points, decreases over 10 seconds)
    const timeBonus = Math.max(0, 50 - (timeSpent / 200));

    // Streak bonus (10 points per consecutive correct, max 50)
    const streakBonus = Math.min(50, streak * 10);

    // Difficulty multiplier
    const difficultyMultiplier = 1 + (difficulty * 0.2);

    return Math.round((baseScore + timeBonus + streakBonus) * difficultyMultiplier);
  }

  static calculateDifficultyAdjustment(
    currentDifficulty: number,
    consecutiveCorrect: number,
    consecutiveWrong: number,
    maxDifficulty: number
  ): number {
    // Increase difficulty after 3 consecutive correct answers
    if (consecutiveCorrect >= 3 && currentDifficulty < maxDifficulty) {
      return currentDifficulty + 1;
    }

    // Decrease difficulty after 2 consecutive wrong answers
    if (consecutiveWrong >= 2 && currentDifficulty > 1) {
      return currentDifficulty - 1;
    }

    return currentDifficulty;
  }

  static provideFeedback(isCorrect: boolean, round: GameRound, timeSpent: number): string {
    if (isCorrect) {
      if (timeSpent < 3000) {
        return `Excellent! Lightning fast! ${round.hint || ''}`;
      } else if (timeSpent < 6000) {
        return `Great job! ${round.hint || ''}`;
      } else {
        return `Correct! ${round.hint || ''}`;
      }
    } else {
      return `Not quite. ${round.hint || 'Try again!'}`;
    }
  }

  // ===== HELPER METHODS =====
  private static generateOptions(
    correct: string,
    pool: string[],
    count: number
  ): string[] {
    const options = new Set<string>([correct]);

    const shuffled = [...pool].filter(x => x !== correct).sort(() => Math.random() - 0.5);

    for (let i = 0; i < count - 1 && i < shuffled.length; i++) {
      options.add(shuffled[i]);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  static initializeGameState(mode: GameMode, totalRounds: number = 10): Rhythm002State {
    return {
      currentRound: 0,
      totalRounds,
      score: 0,
      streak: 0,
      mode: mode.id,
      difficulty: 1,
      rounds: [],
      answers: [],
      gameStatus: 'playing',
      startTime: Date.now(),
      elapsedTime: 0,
      currentMode: mode,
      currentRoundData: null,
      lives: 3,
      consecutiveCorrect: 0,
      streakBonus: 0
    };
  }

  static getNextRound(state: Rhythm002State): GameRound {
    const round = this.generateRound(
      state.currentMode,
      state.difficulty,
      state.currentRound,
      state.totalRounds
    );
    return round;
  }

  static processAnswer(
    state: Rhythm002State,
    userAnswer: string,
    timeSpent: number
  ): Rhythm002State {
    if (!state.currentRoundData) return state;

    const isCorrect = this.validateAnswer(
      userAnswer,
      state.currentRoundData.answer,
      state.currentRoundData
    );

    const newStreak = isCorrect ? state.streak + 1 : 0;
    const scoreGained = this.calculateScore(
      isCorrect,
      timeSpent,
      state.difficulty,
      state.streak
    );

    const consecutiveCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0;
    const consecutiveWrong = isCorrect ? 0 : state.consecutiveCorrect;

    const newDifficulty = this.calculateDifficultyAdjustment(
      state.difficulty,
      consecutiveCorrect,
      consecutiveWrong,
      state.currentMode.maxDifficulty
    );

    return {
      ...state,
      score: state.score + scoreGained,
      streak: newStreak,
      difficulty: newDifficulty,
      consecutiveCorrect,
      lives: isCorrect ? state.lives : Math.max(0, state.lives - 1),
      answers: [
        ...state.answers,
        {
          roundId: state.currentRoundData.id,
          userAnswer,
          correctAnswer: state.currentRoundData.answer,
          isCorrect,
          timeSpent
        }
      ],
      currentRound: state.currentRound + 1,
      gameStatus:
        state.currentRound + 1 >= state.totalRounds ? 'completed' :
        state.lives <= 1 && !isCorrect ? 'failed' :
        'playing'
    };
  }
}

export default Rhythm002Logic;
