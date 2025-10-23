import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Theory002Logic } from '@/lib/gameLogic/theory-002Logic';
import { 
  THEORY_MODES, 
  COMMON_SCALES, 
  EXOTIC_SCALES,
  getScaleById,
  type GameMode 
} from '@/lib/gameLogic/theory-002Modes';

describe('Theory-002 Scale Builder Game Logic', () => {
  let allScalesMode: GameMode;
  let exoticScalesMode: GameMode;

  beforeEach(() => {
    vi.clearAllMocks();
    allScalesMode = THEORY_MODES.find(mode => mode.id === 'all-scales')!;
    exoticScalesMode = THEORY_MODES.find(mode => mode.id === 'exotic')!;
  });

  describe('Mode Definitions', () => {
    it('should have correct number of modes', () => {
      expect(THEORY_MODES).toHaveLength(2);
    });

    it('should have all scales mode with correct properties', () => {
      expect(allScalesMode.id).toBe('all-scales');
      expect(allScalesMode.name).toBe('All Scales');
      expect(allScalesMode.ageRange).toBe('7-12 years');
      expect(allScalesMode.maxRounds).toBe(15);
      expect(allScalesMode.maxDifficulty).toBe(3);
    });

    it('should have exotic scales mode with correct properties', () => {
      expect(exoticScalesMode.id).toBe('exotic');
      expect(exoticScalesMode.name).toBe('Exotic Scales');
      expect(exoticScalesMode.ageRange).toBe('9-12 years');
      expect(exoticScalesMode.maxRounds).toBe(12);
      expect(exoticScalesMode.maxDifficulty).toBe(3);
    });
  });

  describe('Scale Collections', () => {
    it('should have common scales with correct structure', () => {
      const cMajor = COMMON_SCALES['C-major'];
      expect(cMajor.name).toBe('C Major');
      expect(cMajor.type).toBe('major');
      expect(cMajor.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      expect(cMajor.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
      expect(cMajor.difficulty).toBe(1);
    });

    it('should have exotic scales with correct structure', () => {
      const aHarmonicMinor = EXOTIC_SCALES['A-harmonic-minor'];
      expect(aHarmonicMinor.name).toBe('A Harmonic Minor');
      expect(aHarmonicMinor.type).toBe('harmonic-minor');
      expect(aHarmonicMinor.notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
      expect(aHarmonicMinor.difficulty).toBe(2);
    });

    it('should have correct number of scales', () => {
      expect(Object.keys(COMMON_SCALES)).toHaveLength(11);
      expect(Object.keys(EXOTIC_SCALES)).toHaveLength(10);
    });
  });

  describe('Game Logic', () => {
    it('should initialize game state correctly', () => {
      const state = Theory002Logic.initializeState(allScalesMode);
      
      expect(state.currentMode).toBe(allScalesMode);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(3);
      expect(state.currentRound).toBe(0);
      expect(state.totalRounds).toBe(15);
      expect(state.difficulty).toBe(1);
      expect(state.gameStatus).toBe('playing');
    });

    it('should generate rounds for all scales mode', () => {
      const round = Theory002Logic.generateRound(allScalesMode, 1, 0, 15);
      
      expect(round.id).toMatch(/^theory-002-all-scales-\d+$/);
      expect(round.mode).toBe('all-scales');
      expect(round.difficulty).toBe(1);
      expect(round.questionType).toMatch(/^(identify|build|complete)$/);
      expect(round.scale).toBeDefined();
      expect(round.targetNotes).toBeDefined();
    });

    it('should generate rounds for exotic scales mode', () => {
      const round = Theory002Logic.generateRound(exoticScalesMode, 2, 0, 12);
      
      expect(round.id).toMatch(/^theory-002-exotic-\d+$/);
      expect(round.mode).toBe('exotic');
      expect(round.difficulty).toBe(2);
      expect(round.scale).toBeDefined();
    });

    it('should generate identify questions with options', () => {
      const round = Theory002Logic.generateRound(allScalesMode, 1, 0, 15);
      
      if (round.questionType === 'identify') {
        expect(round.options).toBeDefined();
        expect(round.options!.length).toBeGreaterThan(1);
        expect(round.options!.includes(round.answer)).toBe(true);
      }
    });

    it('should generate build questions with empty user answer array', () => {
      const round = Theory002Logic.generateRound(allScalesMode, 2, 0, 15);
      
      if (round.questionType === 'build') {
        expect(round.userAnswer).toEqual([]);
      }
    });

    it('should generate complete questions with blanks', () => {
      const round = Theory002Logic.generateRound(allScalesMode, 3, 0, 15);
      
      if (round.questionType === 'complete') {
        expect(round.blanks).toBeDefined();
        expect(round.blanks!.length).toBeGreaterThan(0);
        expect(round.userAnswer).toBeDefined();
      }
    });

    it('should validate identify answers correctly', () => {
      const round: any = {
        questionType: 'identify',
        answer: 'C Major'
      };
      
      expect(Theory002Logic.validateAnswer(round, 'C Major')).toBe(true);
      expect(Theory002Logic.validateAnswer(round, 'G Major')).toBe(false);
    });

    it('should validate build answers correctly', () => {
      const round: any = {
        questionType: 'build',
        targetNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      };
      
      expect(Theory002Logic.validateAnswer(round, ['C', 'D', 'E', 'F', 'G', 'A', 'B'])).toBe(true);
      expect(Theory002Logic.validateAnswer(round, ['C', 'D', 'E'])).toBe(false);
      expect(Theory002Logic.validateAnswer(round, ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'])).toBe(false);
    });

    it('should validate complete answers correctly', () => {
      const round: any = {
        questionType: 'complete',
        targetNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        blanks: [2, 5]
      };
      
      const correctAnswer = ['', '', 'E', '', '', 'A', ''];
      const wrongAnswer = ['', '', 'F', '', '', 'G', ''];
      
      expect(Theory002Logic.validateAnswer(round, correctAnswer)).toBe(true);
      expect(Theory002Logic.validateAnswer(round, wrongAnswer)).toBe(false);
    });

    it('should calculate score correctly', () => {
      const basePoints = 10;
      const timeRemaining = 30;
      const timeLimit = 60;
      const consecutiveCorrect = 2;
      const streakBonus = 5;
      
      const score = Theory002Logic.calculateScore(
        basePoints,
        timeRemaining,
        timeLimit,
        consecutiveCorrect,
        streakBonus
      );
      
      expect(score).toBeGreaterThan(basePoints);
      expect(typeof score).toBe('number');
    });

    it('should check game end conditions correctly', () => {
      const wonState: any = {
        currentRound: 15,
        totalRounds: 15,
        lives: 2
      };
      
      const lostState: any = {
        currentRound: 10,
        totalRounds: 15,
        lives: 0
      };
      
      const continueState: any = {
        currentRound: 10,
        totalRounds: 15,
        lives: 2
      };
      
      expect(Theory002Logic.checkGameEnd(wonState)).toBe('won');
      expect(Theory002Logic.checkGameEnd(lostState)).toBe('lost');
      expect(Theory002Logic.checkGameEnd(continueState)).toBe('continue');
    });

    it('should generate appropriate performance messages', () => {
      expect(Theory002Logic.getPerformanceMessage(95, 100)).toContain('Outstanding');
      expect(Theory002Logic.getPerformanceMessage(85, 100)).toContain('Excellent');
      expect(Theory002Logic.getPerformanceMessage(75, 100)).toContain('Good job');
      expect(Theory002Logic.getPerformanceMessage(65, 100)).toContain('Nice effort');
      expect(Theory002Logic.getPerformanceMessage(50, 100)).toContain('Keep practicing');
    });
  });

  describe('Scale Helper Functions', () => {
    it('should get scale by ID correctly', () => {
      const cMajor = getScaleById('C-major');
      expect(cMajor).toBeDefined();
      expect(cMajor!.name).toBe('C Major');
      
      const aHarmonicMinor = getScaleById('A-harmonic-minor');
      expect(aHarmonicMinor).toBeDefined();
      expect(aHarmonicMinor!.name).toBe('A Harmonic Minor');
      
      const nonExistent = getScaleById('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get note frequencies correctly', () => {
      const cFreq = getScaleById('C-major');
      expect(cFreq).toBeDefined();
      
      // Test that frequencies are reasonable (around middle C)
      expect(cFreq!.notes[0]).toBe('C');
    });
  });

  describe('Question Type Selection', () => {
    it('should select appropriate question types for difficulty 1', () => {
      // Early rounds should focus on identification
      const round1 = Theory002Logic.generateRound(allScalesMode, 1, 0, 15);
      expect(round1.questionType).toBe('identify');
      
      const round2 = Theory002Logic.generateRound(allScalesMode, 1, 1, 15);
      expect(round2.questionType).toBe('identify');
      
      const round3 = Theory002Logic.generateRound(allScalesMode, 1, 2, 15);
      expect(round3.questionType).toBe('identify');
    });

    it('should select varied question types for difficulty 2', () => {
      const questionTypes = new Set();
      
      for (let i = 0; i < 10; i++) {
        const round = Theory002Logic.generateRound(allScalesMode, 2, i, 15);
        questionTypes.add(round.questionType);
      }
      
      // Should include identify and build for medium difficulty
      expect(questionTypes.has('identify')).toBe(true);
      expect(questionTypes.has('build')).toBe(true);
    });

    it('should select all question types for difficulty 3', () => {
      const questionTypes = new Set();
      
      for (let i = 0; i < 20; i++) {
        const round = Theory002Logic.generateRound(allScalesMode, 3, i, 15);
        questionTypes.add(round.questionType);
      }
      
      // Should include all question types for high difficulty
      expect(questionTypes.has('identify')).toBe(true);
      expect(questionTypes.has('build')).toBe(true);
      expect(questionTypes.has('complete')).toBe(true);
    });
  });

  describe('Difficulty Progression', () => {
    it('should advance difficulty correctly', () => {
      const state = Theory002Logic.initializeState(allScalesMode);
      
      expect(state.difficulty).toBe(1);
      
      const advanced = Theory002Logic.advanceDifficulty(state);
      expect(advanced).toBe(true);
      expect(state.difficulty).toBe(2);
      
      const advancedAgain = Theory002Logic.advanceDifficulty(state);
      expect(advancedAgain).toBe(true);
      expect(state.difficulty).toBe(3);
      
      const cannotAdvance = Theory002Logic.advanceDifficulty(state);
      expect(cannotAdvance).toBe(false);
      expect(state.difficulty).toBe(3);
    });
  });

  describe('Hint Generation', () => {
    it('should generate appropriate hints for identify questions', () => {
      const round: any = {
        questionType: 'identify',
        targetNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        hint: 'This scale has 7 notes and is in the major family.'
      };
      
      const hint = Theory002Logic.getHint(round);
      expect(hint).toContain('7 notes');
    });

    it('should generate appropriate hints for build questions', () => {
      const round: any = {
        questionType: 'build',
        targetNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        hint: 'Start with the root note (C) and follow the major pattern.'
      };
      
      const hint = Theory002Logic.getHint(round);
      expect(hint).toContain('root note');
    });

    it('should generate appropriate hints for complete questions', () => {
      const round: any = {
        questionType: 'complete',
        targetNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        blanks: [2, 5],
        hint: 'Look at the pattern of the scale to find the missing notes.'
      };
      
      const hint = Theory002Logic.getHint(round);
      expect(hint).toContain('pattern');
    });
  });
});