import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CONTOUR_MODES, 
  CONTOUR_PATTERNS,
  CONTOUR_NAMES,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode
} from '@/lib/gameLogic/pitch-005Modes';
import { 
  generateRound, 
  validateAnswer, 
  calculateScore 
} from '@/lib/gameLogic/pitch-005Logic';

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    frequency: { value: 440 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
    onended: null
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { 
      value: 0.7,
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      setValueAtTime: vi.fn()
    }
  }),
  currentTime: 0,
  destination: {},
  close: vi.fn()
})) as any;

describe('Pitch-005 Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 3 modes defined', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(3);
    });

    it('should have all required mode IDs', () => {
      const modeIds = Object.keys(CONTOUR_MODES);
      const expectedIds = ['transformations', 'modifications', 'analysis'];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      Object.values(CONTOUR_MODES).forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('ageRange');
        expect(mode).toHaveProperty('difficulty');
        expect(mode).toHaveProperty('maxRounds');
        expect(mode).toHaveProperty('instructions');
        
        expect(typeof mode.id).toBe('string');
        expect(typeof mode.name).toBe('string');
        expect(typeof mode.description).toBe('string');
        expect(typeof mode.icon).toBe('string');
        expect(typeof mode.color).toBe('string');
        expect(typeof mode.ageRange).toBe('string');
        expect(['easy', 'medium', 'hard']).toContain(mode.difficulty);
        expect(typeof mode.maxRounds).toBe('number');
        expect(typeof mode.instructions).toBe('string');
      });
    });

    it('should have appropriate age ranges for each mode', () => {
      expect(CONTOUR_MODES.transformations.ageRange).toBe('8-10');
      expect(CONTOUR_MODES.modifications.ageRange).toBe('9-11');
      expect(CONTOUR_MODES.analysis.ageRange).toBe('7-9');
    });

    it('should have appropriate difficulty levels for each mode', () => {
      expect(CONTOUR_MODES.transformations.difficulty).toBe('easy');
      expect(CONTOUR_MODES.modifications.difficulty).toBe('medium');
      expect(CONTOUR_MODES.analysis.difficulty).toBe('easy');
    });
  });

  describe('Contour Patterns', () => {
    it('should have all required contour patterns', () => {
      const expectedPatterns = [
        'ascending', 'descending', 'arch', 'valley', 'wave', 'plateau',
        'inverted', 'retrograde', 'invertedRetrograde',
        'ascendingGrace', 'descendingTurn', 'archMordent', 'valleyTrill',
        'sawtooth', 'sineWave', 'zigzag', 'cascade'
      ] as Array<keyof typeof CONTOUR_PATTERNS>;
      
      expectedPatterns.forEach(pattern => {
        expect(CONTOUR_PATTERNS).toHaveProperty(pattern);
        expect(Array.isArray(CONTOUR_PATTERNS[pattern])).toBe(true);
        expect(CONTOUR_PATTERNS[pattern].length).toBeGreaterThan(0);
      });
    });

    it('should have valid contour names', () => {
      (Object.keys(CONTOUR_PATTERNS) as Array<keyof typeof CONTOUR_PATTERNS>).forEach(pattern => {
        expect(CONTOUR_NAMES).toHaveProperty(pattern);
        expect(typeof CONTOUR_NAMES[pattern]).toBe('string');
        expect(CONTOUR_NAMES[pattern].length).toBeGreaterThan(0);
      });
    });

    it('should have pattern values in valid range', () => {
      (Object.keys(CONTOUR_PATTERNS) as Array<keyof typeof CONTOUR_PATTERNS>).forEach(patternKey => {
        const pattern = CONTOUR_PATTERNS[patternKey];
        pattern.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(8);
        });
      });
    });
  });

  describe('Mode Access Functions', () => {
    it('should get mode by valid ID', () => {
      const mode = getModeById('transformations');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('transformations');
    });

    it('should return undefined for invalid mode ID', () => {
      const mode = getModeById('invalid-mode');
      expect(mode).toBeUndefined();
    });

    it('should get all modes', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(3);
      expect(modes[0]).toHaveProperty('id');
    });

    it('should get max difficulty for each mode', () => {
      expect(getMaxDifficultyForMode('transformations')).toBe(3);
      expect(getMaxDifficultyForMode('modifications')).toBe(5);
      expect(getMaxDifficultyForMode('analysis')).toBe(3);
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Transformations Mode', () => {
    it('should generate transformation rounds', () => {
      const round = generateRound('transformations', 1);
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'transformations');
      expect(round).toHaveProperty('difficulty', 1);
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
    });

    it('should generate inversion questions', () => {
      const round = generateRound('transformations', 1);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
      expect(typeof round.question).toBe('string');
      expect(typeof round.answer).toBe('string');
    });

    it('should validate answers correctly', () => {
      const round = generateRound('transformations', 1);
      const isCorrect = validateAnswer(round.answer, round.answer);
      expect(isCorrect).toBe(true);
      
      const isIncorrect = validateAnswer('wrong', round.answer);
      expect(isIncorrect).toBe(false);
    });
  });

  describe('Modifications Mode', () => {
    it('should generate modification rounds', () => {
      const round = generateRound('modifications', 1);
      expect(round.mode).toBe('modifications');
      expect(round.difficulty).toBe(1);
    });

    it('should generate ornamentation questions', () => {
      const round = generateRound('modifications', 1);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
    });

    it('should handle different difficulty levels', () => {
      const easyRound = generateRound('modifications', 1);
      const mediumRound = generateRound('modifications', 3);
      const hardRound = generateRound('modifications', 5);
      
      expect(easyRound.difficulty).toBe(1);
      expect(mediumRound.difficulty).toBe(3);
      expect(hardRound.difficulty).toBe(5);
    });
  });

  describe('Analysis Mode', () => {
    it('should generate analysis rounds', () => {
      const round = generateRound('analysis', 1);
      expect(round.mode).toBe('analysis');
      expect(round.difficulty).toBe(1);
    });

    it('should generate contour analysis questions', () => {
      const round = generateRound('analysis', 1);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
    });

    it('should generate shape identification questions', () => {
      const round = generateRound('analysis', 1);
      expect(round.question.length).toBeGreaterThan(0);
      expect(round.answer.length).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score for correct answer', () => {
      const score = calculateScore(true, 5000, 2);
      expect(score).toBeGreaterThan(0);
      expect(score).toBe(200); // 100 * 2 + Math.max(0, 50 - 5000/100) = 200 + 0 = 200
    });

    it('should return 0 for incorrect answer', () => {
      const score = calculateScore(false, 5000, 2);
      expect(score).toBe(0);
    });

    it('should award time bonus for fast answers', () => {
      const fastScore = calculateScore(true, 1000, 2);
      const slowScore = calculateScore(true, 10000, 2);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should scale score with difficulty', () => {
      const easyScore = calculateScore(true, 5000, 1);
      const hardScore = calculateScore(true, 5000, 3);
      expect(hardScore).toBeGreaterThan(easyScore);
    });

    it('should not have negative time bonus', () => {
      const score = calculateScore(true, 60000, 1); // Very slow answer
      expect(score).toBeGreaterThanOrEqual(100); // Base score only
    });
  });

  describe('Answer Validation', () => {
    it('should validate exact matches', () => {
      expect(validateAnswer('ascending', 'ascending')).toBe(true);
      expect(validateAnswer('Ascending', 'ascending')).toBe(false); // Case sensitive
    });

    it('should reject incorrect answers', () => {
      expect(validateAnswer('wrong', 'ascending')).toBe(false);
      expect(validateAnswer('', 'ascending')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateAnswer('ascending', 'ascending')).toBe(true);
      expect(validateAnswer('ascending', 'descending')).toBe(false);
    });
  });

  describe('Round Generation', () => {
    it('should generate unique round IDs', () => {
      // Mock Date.now to return different values
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = vi.fn(() => {
        callCount++;
        return 1000000 + callCount;
      });
      
      const round1 = generateRound('transformations', 1);
      const round2 = generateRound('transformations', 1);
      
      expect(round1.id).not.toBe(round2.id);
      expect(round1.id).toBe('round-1000001');
      expect(round2.id).toBe('round-1000002');
      
      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should generate valid round structure', () => {
      const round = generateRound('analysis', 2);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('difficulty');
      
      expect(typeof round.id).toBe('string');
      expect(typeof round.mode).toBe('string');
      expect(typeof round.question).toBe('string');
      expect(typeof round.answer).toBe('string');
      expect(typeof round.difficulty).toBe('number');
    });

    it('should handle all valid modes', () => {
      const modes = ['transformations', 'modifications', 'analysis'];
      
      modes.forEach(mode => {
        expect(() => {
          const round = generateRound(mode, 1);
          expect(round.mode).toBe(mode);
        }).not.toThrow();
      });
    });

    it('should handle invalid mode gracefully', () => {
      expect(() => {
        const round = generateRound('invalid-mode', 1);
        expect(round.mode).toBe('invalid-mode');
      }).not.toThrow();
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress per mode', () => {
      const transformationsRound = generateRound('transformations', 1);
      const modificationsRound = generateRound('modifications', 1);
      const analysisRound = generateRound('analysis', 1);
      
      expect(transformationsRound.mode).toBe('transformations');
      expect(modificationsRound.mode).toBe('modifications');
      expect(analysisRound.mode).toBe('analysis');
    });

    it('should handle difficulty progression', () => {
      const mode = 'transformations';
      const maxDifficulty = getMaxDifficultyForMode(mode);
      
      for (let difficulty = 1; difficulty <= maxDifficulty; difficulty++) {
        const round = generateRound(mode, difficulty);
        expect(round.difficulty).toBe(difficulty);
      }
    });
  });

  describe('Audio Synthesis Support', () => {
    it('should have patterns suitable for audio synthesis', () => {
      Object.values(CONTOUR_PATTERNS).forEach(pattern => {
        expect(pattern.length).toBeGreaterThan(0);
        expect(pattern.length).toBeLessThanOrEqual(9); // Reasonable length for melodies
        
        // Check if pattern has reasonable interval jumps
        for (let i = 1; i < pattern.length; i++) {
          const interval = Math.abs(pattern[i] - pattern[i - 1]);
          expect(interval).toBeLessThanOrEqual(8); // Maximum reasonable interval
        }
      });
    });

    it('should include transformation patterns', () => {
      expect(CONTOUR_PATTERNS).toHaveProperty('inverted');
      expect(CONTOUR_PATTERNS).toHaveProperty('retrograde');
      expect(CONTOUR_PATTERNS).toHaveProperty('invertedRetrograde');
    });

    it('should include ornamentation patterns', () => {
      expect(CONTOUR_PATTERNS).toHaveProperty('ascendingGrace');
      expect(CONTOUR_PATTERNS).toHaveProperty('descendingTurn');
      expect(CONTOUR_PATTERNS).toHaveProperty('archMordent');
      expect(CONTOUR_PATTERNS).toHaveProperty('valleyTrill');
    });

    it('should include complex analysis patterns', () => {
      expect(CONTOUR_PATTERNS).toHaveProperty('sawtooth');
      expect(CONTOUR_PATTERNS).toHaveProperty('sineWave');
      expect(CONTOUR_PATTERNS).toHaveProperty('zigzag');
      expect(CONTOUR_PATTERNS).toHaveProperty('cascade');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero difficulty', () => {
      expect(() => {
        const round = generateRound('transformations', 0);
        expect(round.difficulty).toBe(0);
      }).not.toThrow();
    });

    it('should handle negative difficulty', () => {
      expect(() => {
        const round = generateRound('transformations', -1);
        expect(round.difficulty).toBe(-1);
      }).not.toThrow();
    });

    it('should handle very high difficulty', () => {
      expect(() => {
        const round = generateRound('transformations', 100);
        expect(round.difficulty).toBe(100);
      }).not.toThrow();
    });

    it('should handle empty mode string', () => {
      expect(() => {
        const round = generateRound('', 1);
        expect(round.mode).toBe('');
      }).not.toThrow();
    });

    it('should handle null inputs gracefully', () => {
      expect(validateAnswer(null as any, 'ascending')).toBe(false);
      expect(validateAnswer('ascending', null as any)).toBe(false);
      // Note: null === null is true, so this is expected behavior
      expect(validateAnswer(null as any, null as any)).toBe(true);
    });

    it('should handle undefined inputs gracefully', () => {
      expect(validateAnswer(undefined as any, 'ascending')).toBe(false);
      expect(validateAnswer('ascending', undefined as any)).toBe(false);
      // Note: undefined === undefined is true, so this is expected behavior
      expect(validateAnswer(undefined as any, undefined as any)).toBe(true);
    });
  });

  describe('Mode-Specific Features', () => {
    describe('Transformations Mode Features', () => {
      it('should focus on inversion and retrograde concepts', () => {
        const mode = CONTOUR_MODES.transformations;
        expect(mode.description).toContain('inversions');
        expect(mode.description).toContain('retrogrades');
        expect(mode.instructions).toContain('inversion');
        expect(mode.instructions).toContain('retrograde');
      });

      it('should have appropriate icon and color', () => {
        const mode = CONTOUR_MODES.transformations;
        expect(mode.icon).toBe('🔄');
        expect(mode.color).toBe('from-green-400 to-green-600');
      });
    });

    describe('Modifications Mode Features', () => {
      it('should focus on ornamentation concepts', () => {
        const mode = CONTOUR_MODES.modifications;
        expect(mode.description).toContain('ornamentation');
        expect(mode.description).toContain('embellishment');
        expect(mode.instructions).toContain('ornaments');
      });

      it('should have appropriate icon and color', () => {
        const mode = CONTOUR_MODES.modifications;
        expect(mode.icon).toBe('✨');
        expect(mode.color).toBe('from-orange-400 to-orange-600');
      });

      it('should have medium difficulty', () => {
        expect(CONTOUR_MODES.modifications.difficulty).toBe('medium');
      });
    });

    describe('Analysis Mode Features', () => {
      it('should focus on contour analysis concepts', () => {
        const mode = CONTOUR_MODES.analysis;
        expect(mode.description).toContain('melodic shapes');
        expect(mode.description).toContain('directions');
        expect(mode.instructions).toContain('contour shape');
      });

      it('should have appropriate icon and color', () => {
        const mode = CONTOUR_MODES.analysis;
        expect(mode.icon).toBe('📊');
        expect(mode.color).toBe('from-blue-400 to-blue-600');
      });

      it('should be suitable for youngest age group', () => {
        const analysisMode = CONTOUR_MODES.analysis;
        expect(analysisMode.ageRange).toBe('7-9');
      });
    });
  });
});

describe('Pitch-005 Integration', () => {
  it('should handle all difficulty levels for all modes', () => {
    const modes = ['transformations', 'modifications', 'analysis'];
    const difficulties = [1, 2, 3, 4, 5];
    
    modes.forEach(modeId => {
      difficulties.forEach(difficulty => {
        expect(() => {
          const round = generateRound(modeId, difficulty);
          expect(round.mode).toBe(modeId);
          expect(round.difficulty).toBe(difficulty);
        }).not.toThrow();
      });
    });
  });

  it('should generate properly formatted round IDs', () => {
    const round = generateRound('transformations', 1);
    expect(round.id).toMatch(/^round-\d+$/);
  });

  it('should handle rapid round generation', () => {
    expect(() => {
      for (let i = 0; i < 100; i++) {
        const round = generateRound('analysis', 1);
        expect(round).toBeDefined();
      }
    }).not.toThrow();
  });

  it('should maintain consistency across modes', () => {
    const transformationsRound = generateRound('transformations', 1);
    const modificationsRound = generateRound('modifications', 1);
    const analysisRound = generateRound('analysis', 1);
    
    // All rounds should have the same structure
    [transformationsRound, modificationsRound, analysisRound].forEach(round => {
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('difficulty');
    });
  });

  it('should support mode switching workflow', () => {
    // Simulate switching between modes
    const modeSequence = ['analysis', 'transformations', 'modifications'];
    
    modeSequence.forEach(modeId => {
      const round = generateRound(modeId, 1);
      expect(round.mode).toBe(modeId);
      
      const isValidMode = getModeById(modeId);
      expect(isValidMode).toBeDefined();
    });
  });

  it('should handle comprehensive scoring scenarios', () => {
    const testCases = [
      { correct: true, timeSpent: 1000, difficulty: 1 },
      { correct: true, timeSpent: 5000, difficulty: 2 },
      { correct: true, timeSpent: 10000, difficulty: 3 },
      { correct: false, timeSpent: 1000, difficulty: 1 },
      { correct: false, timeSpent: 5000, difficulty: 2 },
    ];
    
    testCases.forEach(({ correct, timeSpent, difficulty }) => {
      const score = calculateScore(correct, timeSpent, difficulty);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      
      if (!correct) {
        expect(score).toBe(0);
      }
    });
  });
});