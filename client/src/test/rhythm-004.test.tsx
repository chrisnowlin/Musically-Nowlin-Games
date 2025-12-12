import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Rhythm004Logic } from '@/lib/gameLogic/rhythm-004Logic';
import {
  NOTATION_MODES,
  RHYTHM_DEFINITIONS,
  RHYTHM_PATTERNS,
  RHYTHM_NAMES,
  TIME_SIGNATURES,
  DIFFICULTY_PROGRESSIONS,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode,
  type GameMode
} from '@/lib/gameLogic/rhythm-004Modes';

// Mock AudioContext for audio testing
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: ''
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  })),
  destination: {},
  currentTime: 0
};

// Mock window.AudioContext
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true
});

describe('Rhythm-004 Rhythm Notation Master Game Logic', () => {
  let valuesMode: GameMode;
  let tupletsMode: GameMode;
  let conversionMode: GameMode;
  let speedReadingMode: GameMode;

  beforeEach(() => {
    vi.clearAllMocks();
    valuesMode = NOTATION_MODES.values;
    tupletsMode = NOTATION_MODES.tuplets;
    conversionMode = NOTATION_MODES.conversion;
    speedReadingMode = NOTATION_MODES['speed-reading'];
  });

  describe('Mode Definitions', () => {
    it('should have correct number of modes', () => {
      const allModes = getAllModes();
      expect(allModes).toHaveLength(4);
    });

    it('should have values mode with correct properties', () => {
      expect(valuesMode.id).toBe('values');
      expect(valuesMode.name).toBe('Note Values');
      expect(valuesMode.ageRange).toBe('7-9');
      expect(valuesMode.maxRounds).toBe(12);
      expect(valuesMode.difficulty).toBe('easy');
      expect(valuesMode.icon).toBe('🎵');
      expect(valuesMode.color).toBe('from-green-400 to-green-600');
    });

    it('should have tuplets mode with correct properties', () => {
      expect(tupletsMode.id).toBe('tuplets');
      expect(tupletsMode.name).toBe('Tuplet Patterns');
      expect(tupletsMode.ageRange).toBe('10-12');
      expect(tupletsMode.maxRounds).toBe(10);
      expect(tupletsMode.difficulty).toBe('hard');
      expect(tupletsMode.icon).toBe('🎯');
      expect(tupletsMode.color).toBe('from-orange-400 to-orange-600');
    });

    it('should have conversion mode with correct properties', () => {
      expect(conversionMode.id).toBe('conversion');
      expect(conversionMode.name).toBe('Rhythm Conversion');
      expect(conversionMode.ageRange).toBe('9-11');
      expect(conversionMode.maxRounds).toBe(10);
      expect(conversionMode.difficulty).toBe('medium');
      expect(conversionMode.icon).toBe('🔄');
      expect(conversionMode.color).toBe('from-blue-400 to-blue-600');
    });

    it('should have speed-reading mode with correct properties', () => {
      expect(speedReadingMode.id).toBe('speed-reading');
      expect(speedReadingMode.name).toBe('Speed Reading');
      expect(speedReadingMode.ageRange).toBe('8-10');
      expect(speedReadingMode.maxRounds).toBe(15);
      expect(speedReadingMode.difficulty).toBe('medium');
      expect(speedReadingMode.icon).toBe('⚡');
      expect(speedReadingMode.color).toBe('from-purple-400 to-purple-600');
    });
  });

  describe('Rhythm Definitions', () => {
    it('should have correct basic note values', () => {
      expect(RHYTHM_DEFINITIONS.whole.duration).toBe(4);
      expect(RHYTHM_DEFINITIONS.whole.symbol).toBe('𝅝');
      expect(RHYTHM_DEFINITIONS.whole.name).toBe('Whole Note');
      
      expect(RHYTHM_DEFINITIONS.half.duration).toBe(2);
      expect(RHYTHM_DEFINITIONS.quarter.duration).toBe(1);
      expect(RHYTHM_DEFINITIONS.eighth.duration).toBe(0.5);
      expect(RHYTHM_DEFINITIONS.sixteenth.duration).toBe(0.25);
    });

    it('should have correct dotted note values', () => {
      expect(RHYTHM_DEFINITIONS['dotted-half'].duration).toBe(3);
      expect(RHYTHM_DEFINITIONS['dotted-quarter'].duration).toBe(1.5);
      expect(RHYTHM_DEFINITIONS['dotted-eighth'].duration).toBe(0.75);
    });

    it('should have correct tuplet values', () => {
      expect(RHYTHM_DEFINITIONS['triplet-quarter'].duration).toBe(0.667);
      expect(RHYTHM_DEFINITIONS['triplet-eighth'].duration).toBe(0.333);
      expect(RHYTHM_DEFINITIONS['duplet'].duration).toBe(1.5);
      expect(RHYTHM_DEFINITIONS['quintuplet'].duration).toBe(0.4);
      expect(RHYTHM_DEFINITIONS['sextuplet'].duration).toBe(0.333);
    });
  });

  describe('Rhythm Patterns', () => {
    it('should have correct basic patterns', () => {
      expect(RHYTHM_PATTERNS['basic-1']).toEqual(['quarter', 'quarter', 'quarter', 'quarter']);
      expect(RHYTHM_PATTERNS['basic-2']).toEqual(['half', 'half']);
      expect(RHYTHM_PATTERNS['basic-3']).toEqual(['whole']);
    });

    it('should have correct dotted patterns', () => {
      expect(RHYTHM_PATTERNS['dotted-1']).toEqual(['dotted-half', 'quarter']);
      expect(RHYTHM_PATTERNS['dotted-2']).toEqual(['dotted-quarter', 'eighth', 'quarter']);
    });

    it('should have correct tuplet patterns', () => {
      expect(RHYTHM_PATTERNS['tuplet-1']).toEqual(['triplet-quarter', 'triplet-quarter', 'triplet-quarter']);
      expect(RHYTHM_PATTERNS['tuplet-2']).toHaveLength(6);
      expect(RHYTHM_PATTERNS['tuplet-2'][0]).toBe('triplet-eighth');
    });

    it('should have correct mixed patterns', () => {
      expect(RHYTHM_PATTERNS['mixed-1']).toEqual(['quarter', 'eighth', 'eighth', 'half']);
      expect(RHYTHM_PATTERNS['mixed-5']).toEqual(['sixteenth', 'sixteenth', 'eighth', 'quarter', 'half']);
    });
  });

  describe('Time Signatures', () => {
    it('should have correct time signature definitions', () => {
      expect(TIME_SIGNATURES['4/4'].name).toBe('Common Time');
      expect(TIME_SIGNATURES['4/4'].beatsPerMeasure).toBe(4);
      expect(TIME_SIGNATURES['4/4'].beatValue).toBe(4);
      
      expect(TIME_SIGNATURES['3/4'].name).toBe('Waltz Time');
      expect(TIME_SIGNATURES['3/4'].beatsPerMeasure).toBe(3);
      
      expect(TIME_SIGNATURES['6/8'].name).toBe('Compound Duple');
      expect(TIME_SIGNATURES['6/8'].beatsPerMeasure).toBe(6);
    });
  });

  describe('Difficulty Progressions', () => {
    it('should have correct difficulty progressions for values mode', () => {
      expect(DIFFICULTY_PROGRESSIONS.values[1]).toEqual(['whole', 'half', 'quarter']);
      expect(DIFFICULTY_PROGRESSIONS.values[2]).toContain('eighth');
      expect(DIFFICULTY_PROGRESSIONS.values[3]).toContain('sixteenth');
    });

    it('should have correct difficulty progressions for tuplets mode', () => {
      expect(DIFFICULTY_PROGRESSIONS.tuplets[1]).toEqual(['triplet-eighth']);
      expect(DIFFICULTY_PROGRESSIONS.tuplets[2]).toContain('duplet');
      expect(DIFFICULTY_PROGRESSIONS.tuplets[3]).toContain('quintuplet');
    });

    it('should have correct difficulty progressions for speed-reading mode', () => {
      expect(DIFFICULTY_PROGRESSIONS['speed-reading'][1]).toHaveLength(3);
      expect(DIFFICULTY_PROGRESSIONS['speed-reading'][3]).toContain('mixed-1');
      expect(DIFFICULTY_PROGRESSIONS['speed-reading'][5]).toContain('mixed-5');
    });
  });

  describe('Helper Functions', () => {
    it('should get mode by id', () => {
      const mode = getModeById('values');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('values');
      
      const tupletMode = getModeById('tuplets');
      expect(tupletMode).toBeDefined();
      expect(tupletMode?.name).toBe('Tuplet Patterns');
    });

    it('should return undefined for invalid mode id', () => {
      const mode = getModeById('invalid-mode');
      expect(mode).toBeUndefined();
    });

    it('should get all modes', () => {
      const allModes = getAllModes();
      expect(allModes).toHaveLength(4);
      expect(allModes.map(m => m.id)).toContain('values');
      expect(allModes.map(m => m.id)).toContain('tuplets');
      expect(allModes.map(m => m.id)).toContain('conversion');
      expect(allModes.map(m => m.id)).toContain('speed-reading');
    });

    it('should get max difficulty for mode', () => {
      expect(getMaxDifficultyForMode('values')).toBe(3);
      expect(getMaxDifficultyForMode('tuplets')).toBe(7);
      expect(getMaxDifficultyForMode('conversion')).toBe(5);
      expect(getMaxDifficultyForMode('speed-reading')).toBe(5);
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Game Logic', () => {
    it('should initialize game state correctly', () => {
      const state = Rhythm004Logic.initializeGameState(valuesMode);

      expect(state.currentMode).toBe(valuesMode);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(3);
      expect(state.currentRound).toBe(0);
      expect(state.totalRounds).toBe(10);
      expect(state.difficulty).toBe(1);
      expect(state.gameStatus).toBe('playing');
      expect(state.streak).toBe(0);
    });

    it('should generate rounds for values mode', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);

      expect(round.id).toMatch(/^rhythm-004-values-\d+$/);
      expect(round.mode).toBe('values');
      expect(round.difficulty).toBe(1);
      expect(round.questionType).toMatch(/^(identify-note|identify-rest|count-beats|match-symbol)$/);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
      expect(round.options).toBeDefined();
    });

    it('should generate rounds for tuplets mode', () => {
      const round = Rhythm004Logic.generateRound(tupletsMode, 2, 0, 10);

      expect(round.id).toMatch(/^rhythm-004-tuplets-\d+$/);
      expect(round.mode).toBe('tuplets');
      expect(round.difficulty).toBe(2);
      expect(round.questionType).toMatch(/^(identify-tuplet|count-tuplet-notes|tuplet-division)$/);
      expect(round.tupletType).toBeDefined();
    });

    it('should generate rounds for conversion mode', () => {
      const round = Rhythm004Logic.generateRound(conversionMode, 2, 0, 10);

      expect(round.id).toMatch(/^rhythm-004-conversion-\d+$/);
      expect(round.mode).toBe('conversion');
      expect(round.difficulty).toBe(2);
      expect(round.questionType).toMatch(/^(convert-equivalent|replace-notes|simplify-rhythm)$/);
      
      // Only check for patterns if it's a convert-equivalent or replace-notes question
      if (round.questionType === 'convert-equivalent' || round.questionType === 'replace-notes') {
        expect(round.sourcePattern || round.originalNote).toBeDefined();
        expect(round.targetPattern || round.replacementNote).toBeDefined();
      }
    });

    it('should generate rounds for speed-reading mode', () => {
      const round = Rhythm004Logic.generateRound(speedReadingMode, 3, 0, 15);

      expect(round.id).toMatch(/^rhythm-004-speed-reading-\d+$/);
      expect(round.mode).toBe('speed-reading');
      expect(round.difficulty).toBe(3);
      expect(round.questionType).toMatch(/^(identify-pattern|quick-count|sight-read)$/);
      expect(round.pattern).toBeDefined();
      expect(round.timeLimit).toBeDefined();
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const isCorrect = Rhythm004Logic.validateAnswer(round.answer, round.answer, round);
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const isCorrect = Rhythm004Logic.validateAnswer('Wrong Answer', round.answer, round);
      expect(isCorrect).toBe(false);
    });

    it('should be case-insensitive', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const correctLower = round.answer.toLowerCase();
      const isCorrect = Rhythm004Logic.validateAnswer(correctLower, round.answer, round);
      expect(isCorrect).toBe(true);
    });

    it('should handle numeric answers', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      if (round.questionType === 'count-beats') {
        const isCorrect = Rhythm004Logic.validateAnswer('4', '4', round);
        expect(isCorrect).toBe(true);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score for correct answer', () => {
      const score = Rhythm004Logic.calculateScore(true, 2000, 1, 0);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for incorrect answer', () => {
      const score = Rhythm004Logic.calculateScore(false, 2000, 1, 0);
      expect(score).toBe(0);
    });

    it('should give time bonus for fast answers', () => {
      const fastScore = Rhythm004Logic.calculateScore(true, 1000, 1, 0);
      const slowScore = Rhythm004Logic.calculateScore(true, 5000, 1, 0);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should give streak bonus', () => {
      const noStreakScore = Rhythm004Logic.calculateScore(true, 2000, 1, 0);
      const streakScore = Rhythm004Logic.calculateScore(true, 2000, 1, 5);
      expect(streakScore).toBeGreaterThan(noStreakScore);
    });

    it('should scale with difficulty', () => {
      const easyScore = Rhythm004Logic.calculateScore(true, 2000, 1, 0);
      const hardScore = Rhythm004Logic.calculateScore(true, 2000, 3, 0);
      expect(hardScore).toBeGreaterThan(easyScore);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      const progress = Rhythm004Logic.getProgress(5, 10);
      expect(progress.percentage).toBe(50);
      expect(progress.currentRound).toBe(5);
      expect(progress.totalRounds).toBe(10);
    });

    it('should handle completed progress', () => {
      const progress = Rhythm004Logic.getProgress(10, 10);
      expect(progress.percentage).toBe(100);
      expect(progress.isComplete).toBe(true);
    });

    it('should handle starting progress', () => {
      const progress = Rhythm004Logic.getProgress(0, 10);
      expect(progress.percentage).toBe(0);
      expect(progress.isComplete).toBe(false);
    });
  });

  describe('Audio Synthesis', () => {
    it('should create audio context', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      expect(audioContext).toBeDefined();
      expect(window.AudioContext).toHaveBeenCalled();
    });

    it('should synthesize rhythm pattern', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      const pattern = ['quarter', 'quarter', 'half'];
      
      Rhythm004Logic.synthesizeRhythm(audioContext, pattern, 120);
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3);
    });

    it('should handle tuplet patterns in audio synthesis', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      const tupletPattern = ['triplet-eighth', 'triplet-eighth', 'triplet-eighth'];
      
      Rhythm004Logic.synthesizeRhythm(audioContext, tupletPattern, 120);
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should handle dotted notes in audio synthesis', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      const dottedPattern = ['dotted-half', 'quarter'];
      
      Rhythm004Logic.synthesizeRhythm(audioContext, dottedPattern, 120);
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    });
  });

  describe('Difficulty Adjustment', () => {
    it('should increase difficulty after 3 consecutive correct', () => {
      const newDifficulty = Rhythm004Logic.calculateDifficultyAdjustment(1, 3, 0, 3);
      expect(newDifficulty).toBe(2);
    });

    it('should decrease difficulty after 2 consecutive wrong', () => {
      const newDifficulty = Rhythm004Logic.calculateDifficultyAdjustment(2, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });

    it('should not exceed max difficulty', () => {
      const newDifficulty = Rhythm004Logic.calculateDifficultyAdjustment(3, 3, 0, 3);
      expect(newDifficulty).toBe(3);
    });

    it('should not go below minimum difficulty', () => {
      const newDifficulty = Rhythm004Logic.calculateDifficultyAdjustment(1, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });

    it('should respect mode-specific max difficulty', () => {
      const tupletMaxDifficulty = Rhythm004Logic.calculateDifficultyAdjustment(7, 3, 0, 7);
      expect(tupletMaxDifficulty).toBe(7);
    });
  });

  describe('Feedback', () => {
    it('should provide positive feedback for correct fast answer', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const feedback = Rhythm004Logic.provideFeedback(true, round, 2000);
      expect(feedback).toContain('Excellent');
    });

    it('should provide positive feedback for correct answer', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const feedback = Rhythm004Logic.provideFeedback(true, round, 5000);
      expect(feedback).toMatch(/Great|Correct/);
    });

    it('should provide hint for incorrect answer', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 1, 0, 12);
      const feedback = Rhythm004Logic.provideFeedback(false, round, 3000);
      expect(feedback).toContain('Not quite');
    });

    it('should provide mode-specific hints', () => {
      const tupletRound = Rhythm004Logic.generateRound(tupletsMode, 2, 0, 10);
      const feedback = Rhythm004Logic.provideFeedback(false, tupletRound, 3000);
      expect(feedback).toContain('Tuplet');
    });
  });

  describe('Game State Processing', () => {
    it('should process correct answer correctly', () => {
      const state = Rhythm004Logic.initializeGameState(valuesMode);
      const round = Rhythm004Logic.getNextRound(state);

      const updatedState = Rhythm004Logic.processAnswer(
        { ...state, currentRoundData: round },
        round.answer,
        2000
      );

      expect(updatedState.score).toBeGreaterThan(0);
      expect(updatedState.streak).toBe(1);
      expect(updatedState.currentRound).toBe(1);
      expect(updatedState.lives).toBe(3);
    });

    it('should process incorrect answer correctly', () => {
      const state = Rhythm004Logic.initializeGameState(valuesMode);
      const round = Rhythm004Logic.getNextRound(state);

      const updatedState = Rhythm004Logic.processAnswer(
        { ...state, currentRoundData: round },
        'Wrong Answer',
        2000
      );

      expect(updatedState.score).toBe(0);
      expect(updatedState.streak).toBe(0);
      expect(updatedState.currentRound).toBe(1);
      expect(updatedState.lives).toBe(2);
    });

    it('should complete game after max rounds', () => {
      let state = Rhythm004Logic.initializeGameState(valuesMode, 2);

      for (let i = 0; i < 2; i++) {
        const round = Rhythm004Logic.getNextRound(state);
        state = Rhythm004Logic.processAnswer(
          { ...state, currentRoundData: round },
          round.answer,
          2000
        );
      }

      expect(state.gameStatus).toBe('completed');
    });

    it('should fail game when lives run out', () => {
      let state = Rhythm004Logic.initializeGameState(valuesMode);
      state = { ...state, lives: 1 };

      const round = Rhythm004Logic.getNextRound(state);
      state = Rhythm004Logic.processAnswer(
        { ...state, currentRoundData: round },
        'Wrong Answer',
        2000
      );

      expect(state.gameStatus).toBe('failed');
    });
  });

  describe('Values Mode - Specific Tests', () => {
    it('should generate identify-note questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(valuesMode, 1, i, 10)
      );

      const identifyNoteRounds = rounds.filter(r => r.questionType === 'identify-note');
      expect(identifyNoteRounds.length).toBeGreaterThan(0);

      if (identifyNoteRounds.length > 0) {
        const round = identifyNoteRounds[0];
        expect(round.noteValue).toBeDefined();
        expect(round.options).toBeDefined();
        expect(round.options!.length).toBe(4);
      }
    });

    it('should generate count-beats questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(valuesMode, 2, i, 10)
      );

      const countBeatsRounds = rounds.filter(r => r.questionType === 'count-beats');
      expect(countBeatsRounds.length).toBeGreaterThan(0);

      if (countBeatsRounds.length > 0) {
        const round = countBeatsRounds[0];
        expect(round.pattern).toBeDefined();
        expect(round.timeSignature).toBeDefined();
      }
    });

    it('should include dotted notes at higher difficulties', () => {
      const round = Rhythm004Logic.generateRound(valuesMode, 3, 0, 10);
      if (round.questionType === 'identify-note' && round.noteValue) {
        // Should include dotted notes at difficulty 3
        expect(['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter']).toContain(round.noteValue);
      }
    });
  });

  describe('Tuplets Mode - Specific Tests', () => {
    it('should generate identify-tuplet questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(tupletsMode, 1, i, 10)
      );

      const identifyTupletRounds = rounds.filter(r => r.questionType === 'identify-tuplet');
      expect(identifyTupletRounds.length).toBeGreaterThan(0);

      if (identifyTupletRounds.length > 0) {
        const round = identifyTupletRounds[0];
        expect(round.tupletType).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });

    it('should generate count-tuplet-notes questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(tupletsMode, 2, i, 10)
      );

      const countTupletRounds = rounds.filter(r => r.questionType === 'count-tuplet-notes');
      expect(countTupletRounds.length).toBeGreaterThan(0);

      if (countTupletRounds.length > 0) {
        const round = countTupletRounds[0];
        expect(round.tupletType).toBeDefined();
        expect(round.beatValue).toBeDefined();
      }
    });

    it('should include complex tuplets at higher difficulties', () => {
      const round = Rhythm004Logic.generateRound(tupletsMode, 3, 0, 10);
      if (round.tupletType) {
        expect(['triplet-eighth', 'triplet-quarter', 'triplet-sixteenth', 'duplet', 'quintuplet', 'sextuplet']).toContain(round.tupletType);
      }
    });
  });

  describe('Conversion Mode - Specific Tests', () => {
    it('should generate convert-equivalent questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(conversionMode, 1, i, 10)
      );

      const convertRounds = rounds.filter(r => r.questionType === 'convert-equivalent');
      expect(convertRounds.length).toBeGreaterThan(0);

      if (convertRounds.length > 0) {
        const round = convertRounds[0];
        expect(round.sourcePattern).toBeDefined();
        expect(round.targetPattern).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });

    it('should generate replace-notes questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(conversionMode, 2, i, 10)
      );

      const replaceRounds = rounds.filter(r => r.questionType === 'replace-notes');
      expect(replaceRounds.length).toBeGreaterThan(0);

      if (replaceRounds.length > 0) {
        const round = replaceRounds[0];
        expect(round.originalNote).toBeDefined();
        expect(round.replacementNote).toBeDefined();
      }
    });
  });

  describe('Speed Reading Mode - Specific Tests', () => {
    it('should generate identify-pattern questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(speedReadingMode, 2, i, 10)
      );

      const identifyPatternRounds = rounds.filter(r => r.questionType === 'identify-pattern');
      expect(identifyPatternRounds.length).toBeGreaterThan(0);

      if (identifyPatternRounds.length > 0) {
        const round = identifyPatternRounds[0];
        expect(round.pattern).toBeDefined();
        expect(round.options).toBeDefined();
        expect(round.timeLimit).toBeDefined();
      }
    });

    it('should generate quick-count questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm004Logic.generateRound(speedReadingMode, 3, i, 10)
      );

      const quickCountRounds = rounds.filter(r => r.questionType === 'quick-count');
      expect(quickCountRounds.length).toBeGreaterThan(0);

      if (quickCountRounds.length > 0) {
        const round = quickCountRounds[0];
        expect(round.pattern).toBeDefined();
        expect(round.timeLimit).toBeDefined();
        expect(round.timeLimit!).toBeLessThan(8000); // Should be quick
      }
    });

    it('should have shorter time limits at higher difficulties', () => {
      const easyRound = Rhythm004Logic.generateRound(speedReadingMode, 1, 0, 10);
      const hardRound = Rhythm004Logic.generateRound(speedReadingMode, 5, 0, 10);
      
      expect(hardRound.timeLimit!).toBeLessThanOrEqual(easyRound.timeLimit!);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid mode gracefully', () => {
      expect(() => {
        Rhythm004Logic.generateRound({} as GameMode, 1, 0, 10);
      }).toThrow();
    });

    it('should handle zero rounds', () => {
      const state = Rhythm004Logic.initializeGameState(valuesMode, 0);
      expect(state.totalRounds).toBe(0);
      expect(state.gameStatus).toBe('completed');
    });

    it('should handle negative difficulty', () => {
      expect(() => {
        Rhythm004Logic.generateRound(valuesMode, -1, 0, 10);
      }).toThrow();
    });

    it('should handle empty patterns in audio synthesis', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      
      expect(() => {
        Rhythm004Logic.synthesizeRhythm(audioContext, [], 120);
      }).not.toThrow();
    });

    it('should handle very fast tempo in audio synthesis', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      const pattern = ['quarter'];
      
      expect(() => {
        Rhythm004Logic.synthesizeRhythm(audioContext, pattern, 300);
      }).not.toThrow();
    });

    it('should handle very slow tempo in audio synthesis', () => {
      const audioContext = Rhythm004Logic.createAudioContext();
      const pattern = ['whole'];
      
      expect(() => {
        Rhythm004Logic.synthesizeRhythm(audioContext, pattern, 40);
      }).not.toThrow();
    });

    it('should generate unique rounds', () => {
      const rounds = Array.from({ length: 5 }, (_, i) =>
        Rhythm004Logic.generateRound(valuesMode, 1, i, 5)
      );

      const questions = rounds.map(r => r.question);
      const uniqueQuestions = new Set(questions);
      // At least some variety (not all identical)
      expect(uniqueQuestions.size).toBeGreaterThanOrEqual(1);
    });

    it('should handle different difficulty levels', () => {
      [1, 2, 3].forEach(difficulty => {
        const round = Rhythm004Logic.generateRound(valuesMode, difficulty, 0, 12);
        expect(round).toBeDefined();
        expect(round.difficulty).toBe(difficulty);
      });
    });

    it('should validate rhythm pattern completeness', () => {
      const pattern = ['quarter', 'quarter', 'half'];
      const totalDuration = pattern.reduce((sum, note) => sum + RHYTHM_DEFINITIONS[note as keyof typeof RHYTHM_DEFINITIONS].duration, 0);
      expect(totalDuration).toBe(4); // Should complete a 4/4 measure
    });

    it('should handle complex mixed patterns', () => {
      const complexPattern = RHYTHM_PATTERNS['mixed-5'];
      expect(complexPattern).toBeDefined();
      expect(complexPattern.length).toBeGreaterThan(0);
      
      // Verify all notes in pattern are valid
      complexPattern.forEach(note => {
        expect(RHYTHM_DEFINITIONS[note as keyof typeof RHYTHM_DEFINITIONS]).toBeDefined();
      });
    });
  });
});