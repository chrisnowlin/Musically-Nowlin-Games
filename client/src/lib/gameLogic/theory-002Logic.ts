/**
 * Game Logic for Scale Builder
 * ID: theory-002
 * Unified Skill: Constructing scale structures
 */

import { 
  THEORY_MODES, 
  COMMON_SCALES, 
  EXOTIC_SCALES,
  DIFFICULTY_CURVES,
  getModeById,
  getDifficultyForMode,
  getScaleById,
  getNoteFrequency,
  getScaleFrequencies,
  type GameMode,
  type DifficultySettings
} from './theory-002Modes';

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options?: string[];
  difficulty: number;
  scale?: string;
  questionType: 'identify' | 'build' | 'complete';
  targetNotes?: string[];
  userAnswer?: string[];
  blanks?: number[];
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
  gameStatus: 'playing' | 'completed' | 'failed';
  startTime: number;
  elapsedTime: number;
}

export interface Theory002State extends GameState {
  currentMode: GameMode;
  currentRoundData: GameRound | null;
  lives: number;
  consecutiveCorrect: number;
  streakBonus: number;
}

export class Theory002Logic {
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

    const scaleKeys = this.getAvailableScaleKeys(mode, difficultySettings);
    const scaleKey = this.selectScale(scaleKeys, difficulty, roundIndex);
    const scale = getScaleById(scaleKey);
    if (!scale) {
      throw new Error(`Scale not found: ${scaleKey}`);
    }

    const questionType = this.selectQuestionType(difficulty, roundIndex);
    
    const round: GameRound = {
      id: `theory-002-${mode.id}-${roundIndex}`,
      mode: mode.id,
      question: this.generateQuestion(scale, questionType),
      answer: scale.name,
      difficulty,
      scale: scaleKey,
      questionType,
      targetNotes: scale.notes,
      hint: this.generateHint(scale, questionType)
    };

    // Generate question-specific content
    switch (questionType) {
      case 'identify':
        round.options = this.generateIdentifyOptions(scale, scaleKeys, difficulty);
        break;
      case 'build':
        round.userAnswer = [];
        break;
      case 'complete':
        round.blanks = this.generateBlanks(scale, difficulty);
        round.userAnswer = new Array(scale.notes.length).fill('');
        break;
    }

    return round;
  }

  static getAvailableScaleKeys(mode: GameMode, difficultySettings: DifficultySettings): string[] {
    if (mode.id === 'all-scales') {
      return difficultySettings.parameters.scaleTypes || Object.keys(COMMON_SCALES);
    } else if (mode.id === 'exotic') {
      return difficultySettings.parameters.exoticTypes || Object.keys(EXOTIC_SCALES);
    }
    return [];
  }

  static selectScale(scaleKeys: string[], difficulty: number, roundIndex: number): string {
    // Ensure variety in scale selection
    const shuffled = [...scaleKeys].sort(() => Math.random() - 0.5);
    return shuffled[roundIndex % shuffled.length];
  }

  static selectQuestionType(difficulty: number, roundIndex: number): 'identify' | 'build' | 'complete' {
    const types: ('identify' | 'build' | 'complete')[] = ['identify', 'build', 'complete'];
    
    // Early rounds focus on identification
    if (difficulty === 1 && roundIndex < 3) {
      return 'identify';
    }
    
    // Later rounds include more complex question types
    if (difficulty === 3) {
      return types[Math.floor(Math.random() * types.length)];
    }
    
    // Medium difficulty
    return types[Math.floor(Math.random() * 2)]; // identify or build
  }

  static generateQuestion(scale: any, questionType: 'identify' | 'build' | 'complete'): string {
    switch (questionType) {
      case 'identify':
        return `What scale is this? Listen to the notes: ${scale.notes.join(', ')}`;
      case 'build':
        return `Build the ${scale.name} scale by arranging the notes in the correct order.`;
      case 'complete':
        return `Complete the ${scale.name} scale by filling in the missing notes.`;
      default:
        return `What scale is this?`;
    }
  }

  static generateIdentifyOptions(
    targetScale: any,
    availableScaleKeys: string[],
    difficulty: number
  ): string[] {
    const options = [targetScale.name];
    const otherScaleKeys = availableScaleKeys.filter(key => key !== targetScale.id);
    
    // Add distractors based on difficulty
    const distractorCount = Math.min(3 + difficulty, otherScaleKeys.length);
    const shuffled = otherScaleKeys.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < distractorCount; i++) {
      const scale = getScaleById(shuffled[i]);
      if (scale) {
        options.push(scale.name);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  }

  static generateBlanks(scale: any, difficulty: number): number[] {
    const noteCount = scale.notes.length;
    const blankCount = Math.min(1 + Math.floor(difficulty / 2), Math.floor(noteCount / 2));
    const blanks: number[] = [];
    
    while (blanks.length < blankCount) {
      const position = Math.floor(Math.random() * noteCount);
      if (!blanks.includes(position)) {
        blanks.push(position);
      }
    }
    
    return blanks.sort((a, b) => a - b);
  }

  static generateHint(scale: any, questionType: 'identify' | 'build' | 'complete'): string {
    switch (questionType) {
      case 'identify':
        return `This scale has ${scale.notes.length} notes and is in the ${scale.type} family.`;
      case 'build':
        return `Start with the root note (${scale.notes[0]}) and follow the ${scale.type} pattern.`;
      case 'complete':
        return `Look at the pattern of the scale to find the missing notes.`;
      default:
        return "Think about the scale pattern and the notes you know.";
    }
  }

  static validateAnswer(round: GameRound, userAnswer: string | string[]): boolean {
    switch (round.questionType) {
      case 'identify':
        return userAnswer === round.answer;
      
      case 'build':
        const buildAnswer = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const targetNotes = round.targetNotes || [];
        return this.arraysEqual(buildAnswer.filter(n => n), targetNotes);
      
      case 'complete':
        const completeAnswer = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        if (!round.blanks || !round.targetNotes) return false;
        
        return round.blanks.every(blankIndex => 
          completeAnswer[blankIndex] === round.targetNotes![blankIndex]
        );
      
      default:
        return false;
    }
  }

  static arraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
  }

  static calculateScore(
    basePoints: number,
    timeRemaining: number,
    timeLimit: number,
    consecutiveCorrect: number,
    streakBonus: number
  ): number {
    const timeBonus = Math.floor((timeRemaining / timeLimit) * basePoints * 0.5);
    const streakMultiplier = Math.min(1 + (consecutiveCorrect * 0.1), 2);
    const totalPoints = (basePoints + timeBonus + streakBonus) * streakMultiplier;
    
    return Math.round(totalPoints);
  }

  static initializeState(mode: GameMode): Theory002State {
    return {
      currentRound: 0,
      totalRounds: mode.maxRounds,
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

  static advanceDifficulty(state: Theory002State): boolean {
    if (state.difficulty < state.currentMode.maxDifficulty) {
      state.difficulty++;
      return true;
    }
    return false;
  }

  static checkGameEnd(state: Theory002State): 'won' | 'lost' | 'continue' {
    if (state.currentRound >= state.totalRounds) {
      return 'won';
    }
    
    if (state.lives <= 0) {
      return 'lost';
    }
    
    return 'continue';
  }

  static getPerformanceMessage(score: number, totalPossible: number): string {
    const percentage = (score / totalPossible) * 100;
    
    if (percentage >= 90) return "Outstanding! You're a scale master! 🎵";
    if (percentage >= 80) return "Excellent work! Great scale knowledge! 🌟";
    if (percentage >= 70) return "Good job! Keep practicing scales! 👍";
    if (percentage >= 60) return "Nice effort! Review the scales and try again! 📚";
    return "Keep practicing! Scale mastery takes time! 🎼";
  }

  static getHint(round: GameRound): string {
    if (round.hint) {
      return round.hint;
    }
    
    switch (round.questionType) {
      case 'identify':
        return `This scale has ${round.targetNotes?.length || 0} notes.`;
      case 'build':
        return `Start with the first note and follow the pattern.`;
      case 'complete':
        if (round.blanks && round.blanks.length > 0 && round.targetNotes) {
          const firstBlank = round.blanks[0];
          return `The note at position ${firstBlank + 1} is ${round.targetNotes[firstBlank]}.`;
        }
        return "Look at the pattern of the scale to find the missing notes.";
      default:
        return "Think about the scale pattern and the notes you know.";
    }
  }
}