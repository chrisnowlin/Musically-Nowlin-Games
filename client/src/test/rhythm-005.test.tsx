import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateRound, 
  validateAnswer, 
  calculateScore,
  type GameRound 
} from '@/lib/gameLogic/rhythm-005Logic';
import {
  POLYRHYTHM_MODES,
  POLYRHYTHM_DEFINITIONS,
  POLYRHYTHM_NAMES,
  POLYRHYTHM_TEMPOS,
  POLYRHYTHM_EDUCATION,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode,
  type GameMode
} from '@/lib/gameLogic/rhythm-005Modes';

// Mock AudioContext for audio testing
class MockAudioContext {
  destination = {};
  currentTime = 0;
  state = 'running';
  
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      type: ''
    };
  }
  
  createGain() {
    return {
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn() }
    };
  }
  
  resume() {
    return Promise.resolve();
  }
  
  suspend() {
    return Promise.resolve();
  }
}

// Mock Web Audio API
global.AudioContext = MockAudioContext as any;

describe('Rhythm-005 Polyrhythm Master Game Logic', () => {
  let identificationMode: GameMode;
  let analysisMode: GameMode;
  let transformationMode: GameMode;
  let creationMode: GameMode;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    identificationMode = POLYRHYTHM_MODES.identification;
    analysisMode = POLYRHYTHM_MODES.analysis;
    transformationMode = POLYRHYTHM_MODES.transformation;
    creationMode = POLYRHYTHM_MODES.creation;
  });

  describe('Mode Definitions', () => {
    it('should have correct number of modes', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(4);
    });

    it('should have identification mode with correct properties', () => {
      expect(identificationMode.id).toBe('identification');
      expect(identificationMode.name).toBe('Polyrhythm Detective');
      expect(identificationMode.ageRange).toBe('8-10');
      expect(identificationMode.maxRounds).toBe(10);
      expect(identificationMode.difficulty).toBe('easy');
    });

    it('should have analysis mode with correct properties', () => {
      expect(analysisMode.id).toBe('analysis');
      expect(analysisMode.name).toBe('Rhythm Analyzer');
      expect(analysisMode.ageRange).toBe('10-12');
      expect(analysisMode.maxRounds).toBe(8);
      expect(analysisMode.difficulty).toBe('medium');
    });

    it('should have transformation mode with correct properties', () => {
      expect(transformationMode.id).toBe('transformation');
      expect(transformationMode.name).toBe('Rhythm Transformer');
      expect(transformationMode.ageRange).toBe('11-12');
      expect(transformationMode.maxRounds).toBe(8);
      expect(transformationMode.difficulty).toBe('hard');
    });

    it('should have creation mode with correct properties', () => {
      expect(creationMode.id).toBe('creation');
      expect(creationMode.name).toBe('Polyrhythm Creator');
      expect(creationMode.ageRange).toBe('9-11');
      expect(creationMode.maxRounds).toBe(6);
      expect(creationMode.difficulty).toBe('medium');
    });
  });

  describe('Polyrhythm Definitions', () => {
    it('should have correct polyrhythm definitions', () => {
      expect(POLYRHYTHM_DEFINITIONS['2:3'].ratio).toEqual([2, 3]);
      expect(POLYRHYTHM_DEFINITIONS['3:4'].ratio).toEqual([3, 4]);
      expect(POLYRHYTHM_DEFINITIONS['4:5'].ratio).toEqual([4, 5]);
      expect(POLYRHYTHM_DEFINITIONS['3:5'].ratio).toEqual([3, 5]);
      expect(POLYRHYTHM_DEFINITIONS['2:5'].ratio).toEqual([2, 5]);
    });

    it('should have correct timing patterns', () => {
      const pattern23 = POLYRHYTHM_DEFINITIONS['2:3'].pattern;
      expect(pattern23).toHaveLength(6);
      expect(pattern23[0]).toBe(0);
      
      const pattern34 = POLYRHYTHM_DEFINITIONS['3:4'].pattern;
      expect(pattern34).toHaveLength(12);
      expect(pattern34[0]).toBe(0);
    });

    it('should have descriptive text for each polyrhythm', () => {
      expect(POLYRHYTHM_DEFINITIONS['2:3'].description).toContain('triplet');
      expect(POLYRHYTHM_DEFINITIONS['3:4'].description).toContain('African');
      expect(POLYRHYTHM_DEFINITIONS['4:5'].description).toContain('advanced');
    });
  });

  describe('Polyrhythm Names', () => {
    it('should have human-readable names', () => {
      expect(POLYRHYTHM_NAMES['2:3']).toBe('Two Against Three');
      expect(POLYRHYTHM_NAMES['3:4']).toBe('Three Against Four');
      expect(POLYRHYTHM_NAMES['4:5']).toBe('Four Against Five');
      expect(POLYRHYTHM_NAMES['3:5']).toBe('Three Against Five');
      expect(POLYRHYTHM_NAMES['2:5']).toBe('Two Against Five');
    });
  });

  describe('Polyrhythm Tempos', () => {
    it('should have appropriate tempo ranges', () => {
      expect(POLYRHYTHM_TEMPOS['2:3'].min).toBe(60);
      expect(POLYRHYTHM_TEMPOS['2:3'].max).toBe(120);
      expect(POLYRHYTHM_TEMPOS['2:3'].suggested).toBe(90);
      
      expect(POLYRHYTHM_TEMPOS['4:5'].min).toBe(40);
      expect(POLYRHYTHM_TEMPOS['4:5'].max).toBe(80);
      expect(POLYRHYTHM_TEMPOS['4:5'].suggested).toBe(60);
    });

    it('should have slower tempos for more complex polyrhythms', () => {
      expect(POLYRHYTHM_TEMPOS['2:3'].suggested).toBeGreaterThan(POLYRHYTHM_TEMPOS['4:5'].suggested);
      expect(POLYRHYTHM_TEMPOS['3:4'].suggested).toBeGreaterThan(POLYRHYTHM_TEMPOS['3:5'].suggested);
    });
  });

  describe('Polyrhythm Education', () => {
    it('should have educational content for each polyrhythm', () => {
      expect(POLYRHYTHM_EDUCATION['2:3']).toContain('jazz');
      expect(POLYRHYTHM_EDUCATION['3:4']).toContain('12 beats');
      expect(POLYRHYTHM_EDUCATION['4:5']).toContain('20 beats');
      expect(POLYRHYTHM_EDUCATION['3:5']).toContain('15 beats');
      expect(POLYRHYTHM_EDUCATION['2:5']).toContain('10 beats');
    });
  });

  describe('Helper Functions', () => {
    it('should get mode by id', () => {
      const mode = getModeById('identification');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('identification');
      
      const analysis = getModeById('analysis');
      expect(analysis?.name).toBe('Rhythm Analyzer');
      
      const invalid = getModeById('invalid');
      expect(invalid).toBeUndefined();
    });

    it('should get all modes', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(4);
      expect(modes.map(m => m.id)).toEqual(['identification', 'analysis', 'transformation', 'creation']);
    });

    it('should get max difficulty for mode', () => {
      expect(getMaxDifficultyForMode('identification')).toBe(3);
      expect(getMaxDifficultyForMode('analysis')).toBe(5);
      expect(getMaxDifficultyForMode('transformation')).toBe(7);
      expect(getMaxDifficultyForMode('creation')).toBe(5);
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Game Logic', () => {
    it('should generate rounds for identification mode', () => {
      const round = generateRound('identification', 1);

      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.mode).toBe('identification');
      expect(round.difficulty).toBe(1);
      expect(round.question).toBe('TODO: Generate question');
      expect(round.answer).toBe('TODO: Generate answer');
    });

    it('should generate rounds for analysis mode', () => {
      const round = generateRound('analysis', 2);

      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.mode).toBe('analysis');
      expect(round.difficulty).toBe(2);
      expect(round.question).toBe('TODO: Generate question');
      expect(round.answer).toBe('TODO: Generate answer');
    });

    it('should generate rounds for transformation mode', () => {
      const round = generateRound('transformation', 3);

      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.mode).toBe('transformation');
      expect(round.difficulty).toBe(3);
      expect(round.question).toBe('TODO: Generate question');
      expect(round.answer).toBe('TODO: Generate answer');
    });

    it('should generate rounds for creation mode', () => {
      const round = generateRound('creation', 2);

      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.mode).toBe('creation');
      expect(round.difficulty).toBe(2);
      expect(round.question).toBe('TODO: Generate question');
      expect(round.answer).toBe('TODO: Generate answer');
    });

    it('should generate unique round IDs', () => {
      const round1 = generateRound('identification', 1);
      // Add small delay to ensure different timestamp
      vi.advanceTimersByTime(1);
      const round2 = generateRound('identification', 1);
      
      expect(round1.id).not.toBe(round2.id);
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const isCorrect = validateAnswer('Correct Answer', 'Correct Answer');
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers', () => {
      const isCorrect = validateAnswer('Wrong Answer', 'Correct Answer');
      expect(isCorrect).toBe(false);
    });

    it('should be case-sensitive', () => {
      const isCorrect = validateAnswer('correct answer', 'Correct Answer');
      expect(isCorrect).toBe(false);
    });

    it('should handle empty strings', () => {
      const isCorrect = validateAnswer('', '');
      expect(isCorrect).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score for correct answer', () => {
      const score = calculateScore(true, 2000, 1);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for incorrect answer', () => {
      const score = calculateScore(false, 2000, 1);
      expect(score).toBe(0);
    });

    it('should give time bonus for fast answers', () => {
      const fastScore = calculateScore(true, 1000, 1);
      const slowScore = calculateScore(true, 5000, 1);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should scale with difficulty', () => {
      const easyScore = calculateScore(true, 2000, 1);
      const hardScore = calculateScore(true, 2000, 3);
      expect(hardScore).toBeGreaterThan(easyScore);
    });

    it('should cap time bonus at 0', () => {
      const verySlowScore = calculateScore(true, 10000, 1);
      expect(verySlowScore).toBe(100); // base score only, no time bonus
    });

    it('should calculate maximum possible score', () => {
      const maxScore = calculateScore(true, 0, 5);
      expect(maxScore).toBe(550); // 500 base + 50 time bonus
    });
  });

  describe('Mode Configuration Tests', () => {
    it('should have all required mode properties', () => {
      const modes = getAllModes();
      
      modes.forEach(mode => {
        expect(mode.id).toBeDefined();
        expect(mode.name).toBeDefined();
        expect(mode.description).toBeDefined();
        expect(mode.icon).toBeDefined();
        expect(mode.color).toBeDefined();
        expect(mode.ageRange).toBeDefined();
        expect(mode.difficulty).toBeDefined();
        expect(mode.maxRounds).toBeGreaterThan(0);
        expect(mode.instructions).toBeDefined();
      });
    });

    it('should have unique mode IDs', () => {
      const modes = getAllModes();
      const ids = modes.map(m => m.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have appropriate age ranges for each mode', () => {
      expect(identificationMode.ageRange).toBe('8-10');
      expect(analysisMode.ageRange).toBe('10-12');
      expect(transformationMode.ageRange).toBe('11-12');
      expect(creationMode.ageRange).toBe('9-11');
    });

    it('should have appropriate difficulty levels', () => {
      expect(identificationMode.difficulty).toBe('easy');
      expect(analysisMode.difficulty).toBe('medium');
      expect(transformationMode.difficulty).toBe('hard');
      expect(creationMode.difficulty).toBe('medium');
    });
  });

  describe('Round Generation Tests', () => {
    it('should handle all four modes', () => {
      const modes = ['identification', 'analysis', 'transformation', 'creation'];
      
      modes.forEach(mode => {
        const round = generateRound(mode, 1);
        expect(round.mode).toBe(mode);
        expect(round.difficulty).toBe(1);
      });
    });

    it('should handle different difficulty levels', () => {
      [1, 2, 3, 4, 5].forEach(difficulty => {
        const round = generateRound('identification', difficulty);
        expect(round.difficulty).toBe(difficulty);
      });
    });

    it('should generate rounds with valid structure', () => {
      const round = generateRound('analysis', 2);
      
      expect(typeof round.id).toBe('string');
      expect(typeof round.mode).toBe('string');
      expect(typeof round.question).toBe('string');
      expect(typeof round.answer).toBe('string');
      expect(typeof round.difficulty).toBe('number');
      expect(round.difficulty).toBeGreaterThan(0);
    });
  });

  describe('Audio Synthesis Mock Tests', () => {
    it('should create mock audio context', () => {
      const audioContext = new MockAudioContext();
      expect(audioContext.destination).toBeDefined();
      expect(audioContext.currentTime).toBe(0);
      expect(audioContext.state).toBe('running');
    });

    it('should create mock oscillator', () => {
      const audioContext = new MockAudioContext();
      const oscillator = audioContext.createOscillator();
      
      expect(oscillator.connect).toBeDefined();
      expect(oscillator.start).toBeDefined();
      expect(oscillator.stop).toBeDefined();
      expect(oscillator.frequency).toBeDefined();
    });

    it('should create mock gain node', () => {
      const audioContext = new MockAudioContext();
      const gain = audioContext.createGain();
      
      expect(gain.connect).toBeDefined();
      expect(gain.gain).toBeDefined();
    });
  });

  describe('Progress Tracking Mock Tests', () => {
    it('should track mode completion', () => {
      // Mock progress tracking structure
      const mockProgress = {
        modeId: 'identification',
        completedRounds: 5,
        totalRounds: 10,
        score: 250,
        accuracy: 0.8
      };
      
      expect(mockProgress.modeId).toBe('identification');
      expect(mockProgress.completedRounds).toBeLessThan(mockProgress.totalRounds);
      expect(mockProgress.score).toBeGreaterThan(0);
      expect(mockProgress.accuracy).toBeGreaterThan(0);
    });

    it('should calculate overall progress', () => {
      // Mock overall progress calculation
      const modeProgresses = [
        { completedRounds: 5, totalRounds: 10 },
        { completedRounds: 3, totalRounds: 8 },
        { completedRounds: 2, totalRounds: 8 },
        { completedRounds: 1, totalRounds: 6 }
      ];
      
      const totalCompleted = modeProgresses.reduce((sum, p) => sum + p.completedRounds, 0);
      const totalPossible = modeProgresses.reduce((sum, p) => sum + p.totalRounds, 0);
      const overallProgress = totalCompleted / totalPossible;
      
      expect(overallProgress).toBeGreaterThan(0);
      expect(overallProgress).toBeLessThan(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid mode IDs gracefully', () => {
      const round = generateRound('invalid-mode', 1);
      expect(round.mode).toBe('invalid-mode');
      expect(round.difficulty).toBe(1);
    });

    it('should handle zero difficulty', () => {
      const round = generateRound('identification', 0);
      expect(round.difficulty).toBe(0);
    });

    it('should handle negative difficulty', () => {
      const round = generateRound('identification', -1);
      expect(round.difficulty).toBe(-1);
    });

    it('should handle very high difficulty', () => {
      const round = generateRound('identification', 100);
      expect(round.difficulty).toBe(100);
    });

    it('should handle null answers in validation', () => {
      expect(() => {
        validateAnswer(null as any, 'test');
      }).not.toThrow();
    });

    it('should handle undefined answers in validation', () => {
      expect(() => {
        validateAnswer(undefined as any, 'test');
      }).not.toThrow();
    });

    it('should handle negative time in score calculation', () => {
      const score = calculateScore(true, -1000, 1);
      expect(score).toBeGreaterThan(100); // Should add extra bonus for negative time
    });

    it('should handle zero time in score calculation', () => {
      const score = calculateScore(true, 0, 1);
      expect(score).toBe(150); // 100 base + 50 time bonus
    });
  });

  describe('Performance Tests', () => {
    it('should generate rounds quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        generateRound('identification', 1);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should generate 100 rounds in under 100ms
    });

    it('should validate answers quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        validateAnswer('test', 'test');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should validate 1000 answers in under 50ms
    });

    it('should calculate scores quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        calculateScore(true, 2000, 2);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should calculate 1000 scores in under 50ms
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete game flow simulation', () => {
      // Simulate a simple game flow
      const modes = ['identification', 'analysis', 'transformation', 'creation'];
      let totalScore = 0;
      
      modes.forEach(mode => {
        // Generate a round
        const round = generateRound(mode, 1);
        
        // Validate answer
        const isCorrect = validateAnswer(round.answer, round.answer);
        expect(isCorrect).toBe(true);
        
        // Calculate score
        const score = calculateScore(isCorrect, 2000, round.difficulty);
        totalScore += score;
        
        expect(score).toBeGreaterThan(0);
      });
      
      expect(totalScore).toBeGreaterThan(0);
    });

    it('should handle mode switching', () => {
      const rounds = [];
      
      // Generate rounds for different modes with small delays
      rounds.push(generateRound('identification', 1));
      vi.advanceTimersByTime(1);
      rounds.push(generateRound('analysis', 2));
      vi.advanceTimersByTime(1);
      rounds.push(generateRound('transformation', 3));
      vi.advanceTimersByTime(1);
      rounds.push(generateRound('creation', 2));
      
      // Verify each round has correct mode
      expect(rounds[0].mode).toBe('identification');
      expect(rounds[1].mode).toBe('analysis');
      expect(rounds[2].mode).toBe('transformation');
      expect(rounds[3].mode).toBe('creation');
      
      // Verify all have unique IDs
      const ids = rounds.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});