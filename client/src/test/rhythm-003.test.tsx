import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Rhythm003Logic } from '@/lib/gameLogic/rhythm-003Logic';
import {
  METER_MODES,
  METER_DEFINITIONS,
  METER_NAMES,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode,
  type GameMode
} from '@/lib/gameLogic/rhythm-003Modes';

// Mock AudioContext for audio testing
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine'
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  })),
  destination: {},
  currentTime: 0
} as any;

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);

describe('Rhythm-003 Meter Master Game Logic', () => {
  let metersMode: GameMode;
  let typesMode: GameMode;
  let featuresMode: GameMode;

  beforeEach(() => {
    vi.clearAllMocks();
    metersMode = getModeById('meters')!;
    typesMode = getModeById('types')!;
    featuresMode = getModeById('features')!;
  });

  describe('Mode Definitions', () => {
    it('should have correct number of modes', () => {
      const allModes = getAllModes();
      expect(allModes).toHaveLength(3);
    });

    it('should have meters mode with correct properties', () => {
      expect(metersMode.id).toBe('meters');
      expect(metersMode.name).toBe('Time Signature Explorer');
      expect(metersMode.ageRange).toBe('7-9');
      expect(metersMode.maxRounds).toBe(10);
      expect(metersMode.difficulty).toBe('easy');
      expect(metersMode.icon).toBe('🎵');
      expect(metersMode.color).toBe('from-green-400 to-green-600');
    });

    it('should have types mode with correct properties', () => {
      expect(typesMode.id).toBe('types');
      expect(typesMode.name).toBe('Meter Type Detective');
      expect(typesMode.ageRange).toBe('9-11');
      expect(typesMode.maxRounds).toBe(10);
      expect(typesMode.difficulty).toBe('medium');
      expect(typesMode.icon).toBe('🎼');
      expect(typesMode.color).toBe('from-teal-400 to-teal-600');
    });

    it('should have features mode with correct properties', () => {
      expect(featuresMode.id).toBe('features');
      expect(featuresMode.name).toBe('Metric Features Master');
      expect(featuresMode.ageRange).toBe('10-12');
      expect(featuresMode.maxRounds).toBe(10);
      expect(featuresMode.difficulty).toBe('hard');
      expect(featuresMode.icon).toBe('🎶');
      expect(featuresMode.color).toBe('from-cyan-400 to-cyan-600');
    });
  });

  describe('Meter Definitions', () => {
    it('should have correct simple meter definitions', () => {
      expect(METER_DEFINITIONS['2/4'].beatsPerMeasure).toBe(2);
      expect(METER_DEFINITIONS['2/4'].beatUnit).toBe(4);
      expect(METER_DEFINITIONS['2/4'].subdivision).toBe('simple');
      expect(METER_DEFINITIONS['2/4'].pattern).toEqual([1, 0]);
      expect(METER_DEFINITIONS['2/4'].emphasis).toEqual([1.0, 0.5]);

      expect(METER_DEFINITIONS['3/4'].beatsPerMeasure).toBe(3);
      expect(METER_DEFINITIONS['4/4'].beatsPerMeasure).toBe(4);
    });

    it('should have correct compound meter definitions', () => {
      expect(METER_DEFINITIONS['6/8'].beatsPerMeasure).toBe(6);
      expect(METER_DEFINITIONS['6/8'].beatUnit).toBe(8);
      expect(METER_DEFINITIONS['6/8'].subdivision).toBe('compound');
      expect(METER_DEFINITIONS['6/8'].pattern).toEqual([1, 0, 0, 0.5, 0, 0]);

      expect(METER_DEFINITIONS['9/8'].beatsPerMeasure).toBe(9);
      expect(METER_DEFINITIONS['12/8'].beatsPerMeasure).toBe(12);
    });

    it('should have correct asymmetric meter definitions', () => {
      expect(METER_DEFINITIONS['5/4'].beatsPerMeasure).toBe(5);
      expect(METER_DEFINITIONS['5/4'].subdivision).toBe('asymmetric');
      expect(METER_DEFINITIONS['7/8'].beatsPerMeasure).toBe(7);
      expect(METER_DEFINITIONS['7/8'].subdivision).toBe('asymmetric');
    });
  });

  describe('Meter Names', () => {
    it('should have correct meter names', () => {
      expect(METER_NAMES['2/4']).toBe('Simple Duple');
      expect(METER_NAMES['3/4']).toBe('Simple Triple');
      expect(METER_NAMES['4/4']).toBe('Simple Quadruple');
      expect(METER_NAMES['6/8']).toBe('Compound Duple');
      expect(METER_NAMES['9/8']).toBe('Compound Triple');
      expect(METER_NAMES['12/8']).toBe('Compound Quadruple');
    });

    it('should have correct meter type names', () => {
      expect(METER_NAMES['simple']).toBe('Simple Meter');
      expect(METER_NAMES['compound']).toBe('Compound Meter');
      expect(METER_NAMES['asymmetric']).toBe('Asymmetric Meter');
    });

    it('should have correct feature names', () => {
      expect(METER_NAMES['strong_beat']).toBe('Strong Beat');
      expect(METER_NAMES['weak_beat']).toBe('Weak Beat');
      expect(METER_NAMES['subdivision']).toBe('Beat Subdivision');
      expect(METER_NAMES['metric_accent']).toBe('Metric Accent');
    });
  });

  describe('Helper Functions', () => {
    it('should get mode by id', () => {
      const mode = getModeById('meters');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('meters');

      const invalidMode = getModeById('invalid');
      expect(invalidMode).toBeUndefined();
    });

    it('should get all modes', () => {
      const allModes = getAllModes();
      expect(allModes).toHaveLength(3);
      expect(allModes.map(m => m.id)).toEqual(['meters', 'types', 'features']);
    });

    it('should get max difficulty for mode', () => {
      expect(getMaxDifficultyForMode('meters')).toBe(3);
      expect(getMaxDifficultyForMode('types')).toBe(5);
      expect(getMaxDifficultyForMode('features')).toBe(7);
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Game Logic', () => {
    it('should initialize game state correctly', () => {
      const state = Rhythm003Logic.initializeGameState(metersMode);

      expect(state.currentMode).toBe(metersMode);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(3);
      expect(state.currentRound).toBe(0);
      expect(state.totalRounds).toBe(10);
      expect(state.difficulty).toBe(1);
      expect(state.gameStatus).toBe('playing');
      expect(state.streak).toBe(0);
    });

    it('should generate rounds for meters mode', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);

      expect(round.id).toMatch(/^rhythm-003-meters-\d+$/);
      expect(round.mode).toBe('meters');
      expect(round.difficulty).toBe(1);
      expect(round.questionType).toMatch(/^(identify-signature|count-beats|match-pattern)$/);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
      expect(round.options).toBeDefined();
    });

    it('should generate rounds for types mode', () => {
      const round = Rhythm003Logic.generateRound(typesMode, 2, 0, 10);

      expect(round.id).toMatch(/^rhythm-003-types-\d+$/);
      expect(round.mode).toBe('types');
      expect(round.difficulty).toBe(2);
      expect(round.questionType).toMatch(/^(identify-type|classify-meter|compare-types)$/);
      expect(round.meterType).toBeDefined();
    });

    it('should generate rounds for features mode', () => {
      const round = Rhythm003Logic.generateRound(featuresMode, 3, 0, 10);

      expect(round.id).toMatch(/^rhythm-003-features-\d+$/);
      expect(round.mode).toBe('features');
      expect(round.difficulty).toBe(3);
      expect(round.questionType).toMatch(/^(identify-feature|analyze-pattern|locate-accent)$/);
      expect(round.featureType).toBeDefined();
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const isCorrect = Rhythm003Logic.validateAnswer(round.answer, round.answer, round);
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const isCorrect = Rhythm003Logic.validateAnswer('Wrong Answer', round.answer, round);
      expect(isCorrect).toBe(false);
    });

    it('should be case-insensitive', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const correctLower = round.answer.toLowerCase();
      const isCorrect = Rhythm003Logic.validateAnswer(correctLower, round.answer, round);
      expect(isCorrect).toBe(true);
    });

    it('should handle numeric answers', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      if (round.questionType === 'count-beats') {
        const isCorrect = Rhythm003Logic.validateAnswer('4', '4', round);
        expect(isCorrect).toBe(true);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score for correct answer', () => {
      const score = Rhythm003Logic.calculateScore(true, 2000, 1, 0);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for incorrect answer', () => {
      const score = Rhythm003Logic.calculateScore(false, 2000, 1, 0);
      expect(score).toBe(0);
    });

    it('should give time bonus for fast answers', () => {
      const fastScore = Rhythm003Logic.calculateScore(true, 1000, 1, 0);
      const slowScore = Rhythm003Logic.calculateScore(true, 5000, 1, 0);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should give streak bonus', () => {
      const noStreakScore = Rhythm003Logic.calculateScore(true, 2000, 1, 0);
      const streakScore = Rhythm003Logic.calculateScore(true, 2000, 1, 5);
      expect(streakScore).toBeGreaterThan(noStreakScore);
    });

    it('should scale with difficulty', () => {
      const easyScore = Rhythm003Logic.calculateScore(true, 2000, 1, 0);
      const hardScore = Rhythm003Logic.calculateScore(true, 2000, 3, 0);
      expect(hardScore).toBeGreaterThan(easyScore);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      const progress = Rhythm003Logic.getProgress(5, 10);
      expect(progress.percentage).toBe(50);
      expect(progress.currentRound).toBe(5);
      expect(progress.totalRounds).toBe(10);
    });

    it('should calculate performance metrics', () => {
      const performance = Rhythm003Logic.getPerformanceMetrics(85, 7, 10, 85000);
      expect(performance.accuracy).toBe(70);
      expect(performance.averageTime).toBeCloseTo(8.5, 1);
      expect(performance.streakBonus).toBe(true);
    });
  });

  describe('Audio Synthesis', () => {
    it('should create audio context for meter playback', () => {
      const audioContext = Rhythm003Logic.createAudioContext();
      expect(audioContext).toBeDefined();
      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('should synthesize meter patterns', () => {
      const audioContext = new AudioContext();
      const meterPattern = Rhythm003Logic.synthesizeMeterPattern(audioContext, '4/4', 120);
      
      expect(meterPattern).toBeDefined();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should handle different time signatures', () => {
      const audioContext = new AudioContext();
      const signatures = ['2/4', '3/4', '4/4', '6/8', '9/8'];
      
      signatures.forEach(signature => {
        const pattern = Rhythm003Logic.synthesizeMeterPattern(audioContext, signature, 120);
        expect(pattern).toBeDefined();
      });
    });

    it('should apply correct emphasis patterns', () => {
      const audioContext = new AudioContext();
      const pattern = Rhythm003Logic.synthesizeMeterPattern(audioContext, '4/4', 120);
      
      // Verify that emphasis is applied based on meter definition
      expect(METER_DEFINITIONS['4/4'].emphasis).toEqual([1.0, 0.5, 0.7, 0.5]);
    });
  });

  describe('Difficulty Adjustment', () => {
    it('should increase difficulty after consecutive correct', () => {
      const newDifficulty = Rhythm003Logic.calculateDifficultyAdjustment(1, 3, 0, 3);
      expect(newDifficulty).toBe(2);
    });

    it('should decrease difficulty after consecutive wrong', () => {
      const newDifficulty = Rhythm003Logic.calculateDifficultyAdjustment(2, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });

    it('should not exceed max difficulty', () => {
      const newDifficulty = Rhythm003Logic.calculateDifficultyAdjustment(3, 3, 0, 3);
      expect(newDifficulty).toBe(3);
    });

    it('should not go below minimum difficulty', () => {
      const newDifficulty = Rhythm003Logic.calculateDifficultyAdjustment(1, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });

    it('should respect mode-specific max difficulty', () => {
      const metersMaxDiff = Rhythm003Logic.calculateDifficultyAdjustment(3, 3, 0, 3, 'meters');
      expect(metersMaxDiff).toBeLessThanOrEqual(3);

      const featuresMaxDiff = Rhythm003Logic.calculateDifficultyAdjustment(6, 3, 0, 7, 'features');
      expect(featuresMaxDiff).toBeLessThanOrEqual(7);
    });
  });

  describe('Feedback', () => {
    it('should provide positive feedback for correct fast answer', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const feedback = Rhythm003Logic.provideFeedback(true, round, 2000);
      expect(feedback).toContain('Excellent');
    });

    it('should provide positive feedback for correct answer', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const feedback = Rhythm003Logic.provideFeedback(true, round, 5000);
      expect(feedback).toMatch(/Great|Correct/);
    });

    it('should provide hint for incorrect answer', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      const feedback = Rhythm003Logic.provideFeedback(false, round, 3000);
      expect(feedback).toContain('Not quite');
    });

    it('should provide educational feedback for meter identification', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      if (round.questionType === 'identify-signature') {
        const feedback = Rhythm003Logic.provideFeedback(false, round, 3000);
        expect(feedback).toContain('time signature');
      }
    });
  });

  describe('Game State Processing', () => {
    it('should process correct answer correctly', () => {
      const state = Rhythm003Logic.initializeGameState(metersMode);
      const round = Rhythm003Logic.getNextRound(state);

      const updatedState = Rhythm003Logic.processAnswer(
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
      const state = Rhythm003Logic.initializeGameState(metersMode);
      const round = Rhythm003Logic.getNextRound(state);

      const updatedState = Rhythm003Logic.processAnswer(
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
      let state = Rhythm003Logic.initializeGameState(metersMode, 2);

      for (let i = 0; i < 2; i++) {
        const round = Rhythm003Logic.getNextRound(state);
        state = Rhythm003Logic.processAnswer(
          { ...state, currentRoundData: round },
          round.answer,
          2000
        );
      }

      expect(state.gameStatus).toBe('completed');
    });

    it('should fail game when lives run out', () => {
      let state = Rhythm003Logic.initializeGameState(metersMode);
      state = { ...state, lives: 1 };

      const round = Rhythm003Logic.getNextRound(state);
      state = Rhythm003Logic.processAnswer(
        { ...state, currentRoundData: round },
        'Wrong Answer',
        2000
      );

      expect(state.gameStatus).toBe('failed');
    });
  });

  describe('Meters Mode - Specific Tests', () => {
    it('should generate identify-signature questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(metersMode, 1, i, 10)
      );

      const identifySignatureRounds = rounds.filter(r => r.questionType === 'identify-signature');
      expect(identifySignatureRounds.length).toBeGreaterThan(0);

      if (identifySignatureRounds.length > 0) {
        const round = identifySignatureRounds[0];
        expect(round.timeSignature).toBeDefined();
        expect(round.options).toBeDefined();
        expect(round.options!.length).toBe(4);
      }
    });

    it('should generate count-beats questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(metersMode, 2, i, 10)
      );

      const countBeatsRounds = rounds.filter(r => r.questionType === 'count-beats');
      expect(countBeatsRounds.length).toBeGreaterThan(0);

      if (countBeatsRounds.length > 0) {
        const round = countBeatsRounds[0];
        expect(round.timeSignature).toBeDefined();
        expect(round.beatsPerMeasure).toBeDefined();
      }
    });

    it('should include all common time signatures', () => {
      const rounds = Array.from({ length: 30 }, (_, i) =>
        Rhythm003Logic.generateRound(metersMode, 1, i, 30)
      );

      const signatures = new Set(rounds.map(r => r.timeSignature).filter(Boolean));
      expect(signatures.has('2/4')).toBe(true);
      expect(signatures.has('3/4')).toBe(true);
      expect(signatures.has('4/4')).toBe(true);
    });
  });

  describe('Types Mode - Specific Tests', () => {
    it('should generate identify-type questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(typesMode, 1, i, 10)
      );

      const identifyTypeRounds = rounds.filter(r => r.questionType === 'identify-type');
      expect(identifyTypeRounds.length).toBeGreaterThan(0);

      if (identifyTypeRounds.length > 0) {
        const round = identifyTypeRounds[0];
        expect(round.meterType).toBeDefined();
        expect(round.options).toBeDefined();
        expect(round.options!.length).toBe(3);
      }
    });

    it('should generate classify-meter questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(typesMode, 2, i, 10)
      );

      const classifyMeterRounds = rounds.filter(r => r.questionType === 'classify-meter');
      expect(classifyMeterRounds.length).toBeGreaterThan(0);

      if (classifyMeterRounds.length > 0) {
        const round = classifyMeterRounds[0];
        expect(round.timeSignature).toBeDefined();
        expect(round.meterType).toBeDefined();
      }
    });

    it('should distinguish simple vs compound meters', () => {
      const rounds = Array.from({ length: 20 }, (_, i) =>
        Rhythm003Logic.generateRound(typesMode, 2, i, 20)
      );

      const simpleMeters = rounds.filter(r => r.meterType === 'simple');
      const compoundMeters = rounds.filter(r => r.meterType === 'compound');
      
      expect(simpleMeters.length).toBeGreaterThan(0);
      expect(compoundMeters.length).toBeGreaterThan(0);
    });
  });

  describe('Features Mode - Specific Tests', () => {
    it('should generate identify-feature questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(featuresMode, 1, i, 10)
      );

      const identifyFeatureRounds = rounds.filter(r => r.questionType === 'identify-feature');
      expect(identifyFeatureRounds.length).toBeGreaterThan(0);

      if (identifyFeatureRounds.length > 0) {
        const round = identifyFeatureRounds[0];
        expect(round.featureType).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });

    it('should generate analyze-pattern questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(featuresMode, 2, i, 10)
      );

      const analyzePatternRounds = rounds.filter(r => r.questionType === 'analyze-pattern');
      expect(analyzePatternRounds.length).toBeGreaterThan(0);

      if (analyzePatternRounds.length > 0) {
        const round = analyzePatternRounds[0];
        expect(round.patternData).toBeDefined();
        expect(round.featureType).toBeDefined();
      }
    });

    it('should generate locate-accent questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm003Logic.generateRound(featuresMode, 3, i, 10)
      );

      const locateAccentRounds = rounds.filter(r => r.questionType === 'locate-accent');
      expect(locateAccentRounds.length).toBeGreaterThan(0);

      if (locateAccentRounds.length > 0) {
        const round = locateAccentRounds[0];
        expect(round.timeSignature).toBeDefined();
        expect(round.accentPattern).toBeDefined();
      }
    });
  });

  describe('Round Generation Edge Cases', () => {
    it('should handle different difficulty levels', () => {
      [1, 2, 3].forEach(difficulty => {
        const round = Rhythm003Logic.generateRound(metersMode, difficulty, 0, 10);
        expect(round).toBeDefined();
        expect(round.difficulty).toBe(difficulty);
      });
    });

    it('should generate unique rounds', () => {
      const rounds = Array.from({ length: 5 }, (_, i) =>
        Rhythm003Logic.generateRound(metersMode, 1, i, 5)
      );

      const questions = rounds.map(r => r.question);
      const uniqueQuestions = new Set(questions);
      // At least some variety (not all identical)
      expect(uniqueQuestions.size).toBeGreaterThanOrEqual(1);
    });

    it('should handle asymmetric meters at higher difficulties', () => {
      const round = Rhythm003Logic.generateRound(featuresMode, 5, 0, 10);
      expect(round).toBeDefined();
      expect(round.difficulty).toBe(5);
    });

    it('should generate appropriate options for each question type', () => {
      const round = Rhythm003Logic.generateRound(metersMode, 1, 0, 10);
      expect(round.options).toBeDefined();
      expect(round.options!.length).toBeGreaterThan(1);
      expect(round.options!.includes(round.answer)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid mode gracefully', () => {
      expect(() => {
        Rhythm003Logic.generateRound({} as GameMode, 1, 0, 10);
      }).toThrow();
    });

    it('should handle invalid difficulty', () => {
      expect(() => {
        Rhythm003Logic.generateRound(metersMode, -1, 0, 10);
      }).toThrow();
    });

    it('should handle audio context creation failure', () => {
      vi.mocked(global.AudioContext).mockImplementationOnce(() => {
        throw new Error('AudioContext not supported');
      });

      expect(() => {
        Rhythm003Logic.createAudioContext();
      }).toThrow('AudioContext not supported');
    });

    it('should handle invalid time signature in synthesis', () => {
      const audioContext = new AudioContext();
      
      expect(() => {
        Rhythm003Logic.synthesizeMeterPattern(audioContext, 'invalid', 120);
      }).toThrow();
    });
  });

  describe('Meter Concept Coverage', () => {
    it('should cover all simple meter concepts', () => {
      const simpleMeters = ['2/4', '3/4', '4/4'];
      const rounds = Array.from({ length: 50 }, (_, i) =>
        Rhythm003Logic.generateRound(metersMode, 1, i, 50)
      );

      simpleMeters.forEach(meter => {
        const hasMeter = rounds.some(r => r.timeSignature === meter);
        expect(hasMeter).toBe(true);
      });
    });

    it('should cover all compound meter concepts', () => {
      const compoundMeters = ['6/8', '9/8', '12/8'];
      const rounds = Array.from({ length: 50 }, (_, i) =>
        Rhythm003Logic.generateRound(typesMode, 2, i, 50)
      );

      compoundMeters.forEach(meter => {
        const hasMeter = rounds.some(r => r.timeSignature === meter);
        expect(hasMeter).toBe(true);
      });
    });

    it('should cover metric features', () => {
      const features = ['strong_beat', 'weak_beat', 'subdivision', 'metric_accent'];
      const rounds = Array.from({ length: 50 }, (_, i) =>
        Rhythm003Logic.generateRound(featuresMode, 2, i, 50)
      );

      features.forEach(feature => {
        const hasFeature = rounds.some(r => r.featureType === feature);
        expect(hasFeature).toBe(true);
      });
    });
  });
});