import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateRound, 
  validateAnswer, 
  calculateScore 
} from '@/lib/gameLogic/pitch-004Logic';
import { 
  SCALE_MODES, 
  getModeById, 
  getAllModes, 
  getMaxDifficultyForMode,
  SCALE_DEFINITIONS,
  SCALE_NAMES,
  SCALE_DEGREE_FUNCTIONS
} from '@/lib/gameLogic/pitch-004Modes';

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

describe('Pitch-004 Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 4 modes defined', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(4);
    });

    it('should have all required mode IDs', () => {
      const modeIds = Object.keys(SCALE_MODES);
      const expectedIds = ['major-minor', 'modes', 'special-scales', 'scale-degrees'];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      Object.values(SCALE_MODES).forEach(mode => {
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

    it('should get mode by ID', () => {
      const mode = getModeById('major-minor');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('major-minor');
      expect(mode?.name).toBe('Major & Minor Scales');
    });

    it('should return undefined for invalid mode ID', () => {
      const mode = getModeById('invalid-mode');
      expect(mode).toBeUndefined();
    });

    it('should get max difficulty for modes', () => {
      expect(getMaxDifficultyForMode('major-minor')).toBe(3);
      expect(getMaxDifficultyForMode('modes')).toBe(5);
      expect(getMaxDifficultyForMode('special-scales')).toBe(7);
      expect(getMaxDifficultyForMode('scale-degrees')).toBe(5);
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Scale Definitions', () => {
    it('should have all required scale definitions', () => {
      const expectedScales = [
        'major', 'natural-minor', 'harmonic-minor', 'melodic-minor',
        'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
        'major-pentatonic', 'minor-pentatonic', 'blues', 'whole-tone', 'chromatic', 'octatonic'
      ];
      
      expectedScales.forEach(scale => {
        expect(SCALE_DEFINITIONS).toHaveProperty(scale);
        expect(Array.isArray(SCALE_DEFINITIONS[scale as keyof typeof SCALE_DEFINITIONS])).toBe(true);
        expect(SCALE_DEFINITIONS[scale as keyof typeof SCALE_DEFINITIONS].length).toBeGreaterThan(0);
      });
    });

    it('should have valid scale names', () => {
      Object.keys(SCALE_DEFINITIONS).forEach(scaleKey => {
        expect(SCALE_NAMES).toHaveProperty(scaleKey);
        expect(typeof SCALE_NAMES[scaleKey as keyof typeof SCALE_NAMES]).toBe('string');
        expect(SCALE_NAMES[scaleKey as keyof typeof SCALE_NAMES].length).toBeGreaterThan(0);
      });
    });

    it('should have valid scale degree functions', () => {
      for (let degree = 1; degree <= 7; degree++) {
        expect(SCALE_DEGREE_FUNCTIONS).toHaveProperty(degree.toString());
        expect(typeof SCALE_DEGREE_FUNCTIONS[degree as keyof typeof SCALE_DEGREE_FUNCTIONS]).toBe('string');
        expect(SCALE_DEGREE_FUNCTIONS[degree as keyof typeof SCALE_DEGREE_FUNCTIONS].length).toBeGreaterThan(0);
      }
    });

    it('should have correct major scale intervals', () => {
      expect(SCALE_DEFINITIONS.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have correct natural minor scale intervals', () => {
      expect(SCALE_DEFINITIONS['natural-minor']).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it('should have correct pentatonic scales', () => {
      expect(SCALE_DEFINITIONS['major-pentatonic']).toEqual([0, 2, 4, 7, 9]);
      expect(SCALE_DEFINITIONS['minor-pentatonic']).toEqual([0, 3, 5, 7, 10]);
    });
  });

  describe('Round Generation', () => {
    it('should generate rounds for major-minor mode', () => {
      const round = generateRound('major-minor', 1);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'major-minor');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('difficulty', 1);
      expect(typeof round.id).toBe('string');
      expect(typeof round.question).toBe('string');
      expect(typeof round.answer).toBe('string');
    });

    it('should generate rounds for modes', () => {
      const round = generateRound('modes', 3);
      
      expect(round.mode).toBe('modes');
      expect(round.difficulty).toBe(3);
    });

    it('should generate rounds for special-scales', () => {
      const round = generateRound('special-scales', 5);
      
      expect(round.mode).toBe('special-scales');
      expect(round.difficulty).toBe(5);
    });

    it('should generate rounds for scale-degrees', () => {
      const round = generateRound('scale-degrees', 2);
      
      expect(round.mode).toBe('scale-degrees');
      expect(round.difficulty).toBe(2);
    });

    it('should generate properly formatted round IDs', () => {
      const round = generateRound('major-minor', 1);
      expect(round.id).toMatch(/^round-\d+$/);
    });

    it('should handle all difficulty levels', () => {
      for (let difficulty = 1; difficulty <= 7; difficulty++) {
        expect(() => {
          const round = generateRound('modes', difficulty);
          expect(round.difficulty).toBe(difficulty);
        }).not.toThrow();
      }
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const isCorrect = validateAnswer('major', 'major');
      expect(isCorrect).toBe(true);
    });

    it('should reject incorrect answers', () => {
      const isCorrect = validateAnswer('major', 'minor');
      expect(isCorrect).toBe(false);
    });

    it('should be case sensitive for exact matching', () => {
      const isCorrect = validateAnswer('Major', 'major');
      expect(isCorrect).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(validateAnswer('', '')).toBe(true);
      expect(validateAnswer('major', '')).toBe(false);
      expect(validateAnswer('', 'major')).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    it('should return 0 for incorrect answers', () => {
      const score = calculateScore(false, 1000, 3);
      expect(score).toBe(0);
    });

    it('should calculate base score correctly', () => {
      const score = calculateScore(true, 0, 1);
      expect(score).toBe(150); // 100 * 1 + 50 time bonus
    });

    it('should apply difficulty multiplier', () => {
      const score1 = calculateScore(true, 0, 1);
      const score2 = calculateScore(true, 0, 2);
      const score3 = calculateScore(true, 0, 3);
      
      expect(score2).toBeGreaterThan(score1);
      expect(score3).toBeGreaterThan(score2);
    });

    it('should apply time bonus', () => {
      const fastScore = calculateScore(true, 1000, 2); // 1 second
      const slowScore = calculateScore(true, 5000, 2); // 5 seconds
      
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should not give negative time bonus', () => {
      const verySlowScore = calculateScore(true, 10000, 2); // 10 seconds
      expect(verySlowScore).toBe(200); // 100 * 2 + 0 time bonus
    });

    it('should round scores to integers', () => {
      const score = calculateScore(true, 1234, 3);
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  describe('Major & Minor Mode', () => {
    it('should have correct configuration', () => {
      const mode = SCALE_MODES['major-minor'];
      
      expect(mode.id).toBe('major-minor');
      expect(mode.name).toBe('Major & Minor Scales');
      expect(mode.difficulty).toBe('easy');
      expect(mode.ageRange).toBe('7-9');
      expect(mode.maxRounds).toBe(10);
      expect(mode.icon).toBe('🎵');
    });

    it('should generate appropriate questions', () => {
      const round = generateRound('major-minor', 1);
      expect(round.mode).toBe('major-minor');
    });
  });

  describe('Church Modes', () => {
    it('should have correct configuration', () => {
      const mode = SCALE_MODES.modes;
      
      expect(mode.id).toBe('modes');
      expect(mode.name).toBe('Church Modes');
      expect(mode.difficulty).toBe('medium');
      expect(mode.ageRange).toBe('9-11');
      expect(mode.maxRounds).toBe(10);
      expect(mode.icon).toBe('🎼');
    });

    it('should include all church modes in definitions', () => {
      const churchModes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
      
      churchModes.forEach(mode => {
        expect(SCALE_DEFINITIONS).toHaveProperty(mode);
        expect(SCALE_NAMES).toHaveProperty(mode);
      });
    });
  });

  describe('Special Scales Mode', () => {
    it('should have correct configuration', () => {
      const mode = SCALE_MODES['special-scales'];
      
      expect(mode.id).toBe('special-scales');
      expect(mode.name).toBe('Special Scales');
      expect(mode.difficulty).toBe('hard');
      expect(mode.ageRange).toBe('10-12');
      expect(mode.maxRounds).toBe(10);
      expect(mode.icon).toBe('🎸');
    });

    it('should include all special scales in definitions', () => {
      const specialScales = ['major-pentatonic', 'minor-pentatonic', 'blues', 'whole-tone', 'chromatic', 'octatonic'];
      
      specialScales.forEach(scale => {
        expect(SCALE_DEFINITIONS).toHaveProperty(scale);
        expect(SCALE_NAMES).toHaveProperty(scale);
      });
    });

    it('should have correct blues scale intervals', () => {
      expect(SCALE_DEFINITIONS.blues).toEqual([0, 3, 5, 6, 7, 10]);
    });

    it('should have correct whole tone scale intervals', () => {
      expect(SCALE_DEFINITIONS['whole-tone']).toEqual([0, 2, 4, 6, 8, 10]);
    });
  });

  describe('Scale Degrees Mode', () => {
    it('should have correct configuration', () => {
      const mode = SCALE_MODES['scale-degrees'];
      
      expect(mode.id).toBe('scale-degrees');
      expect(mode.name).toBe('Scale Degrees');
      expect(mode.difficulty).toBe('medium');
      expect(mode.ageRange).toBe('8-10');
      expect(mode.maxRounds).toBe(10);
      expect(mode.icon).toBe('🎯');
    });

    it('should have correct scale degree functions', () => {
      expect(SCALE_DEGREE_FUNCTIONS[1]).toBe('Tonic (home)');
      expect(SCALE_DEGREE_FUNCTIONS[5]).toBe('Dominant');
      expect(SCALE_DEGREE_FUNCTIONS[7]).toBe('Leading Tone');
    });
  });

  describe('Audio Synthesis Support', () => {
    it('should have valid frequency intervals for all scales', () => {
      Object.values(SCALE_DEFINITIONS).forEach(intervals => {
        expect(Array.isArray(intervals)).toBe(true);
        expect(intervals.length).toBeGreaterThan(0);
        
        // All intervals should be valid semitone numbers (0-11)
        intervals.forEach(interval => {
          expect(interval).toBeGreaterThanOrEqual(0);
          expect(interval).toBeLessThanOrEqual(11);
        });
        
        // Intervals should be in ascending order
        for (let i = 1; i < intervals.length; i++) {
          expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
        }
      });
    });

    it('should handle different scale lengths', () => {
      expect(SCALE_DEFINITIONS.major).toHaveLength(7);
      expect(SCALE_DEFINITIONS['major-pentatonic']).toHaveLength(5);
      expect(SCALE_DEFINITIONS.blues).toHaveLength(6);
      expect(SCALE_DEFINITIONS.chromatic).toHaveLength(12);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid mode IDs gracefully', () => {
      expect(() => {
        generateRound('invalid-mode', 1);
      }).not.toThrow();
    });

    it('should handle zero difficulty', () => {
      expect(() => {
        generateRound('major-minor', 0);
      }).not.toThrow();
    });

    it('should handle negative difficulty', () => {
      expect(() => {
        generateRound('major-minor', -1);
      }).not.toThrow();
    });

    it('should handle very high difficulty', () => {
      expect(() => {
        generateRound('special-scales', 10);
      }).not.toThrow();
    });

    it('should handle null inputs in validation', () => {
      expect(() => {
        validateAnswer(null as any, 'test');
      }).not.toThrow();
      
      expect(() => {
        validateAnswer('test', null as any);
      }).not.toThrow();
    });

    it('should handle extreme time values in scoring', () => {
      expect(() => {
        calculateScore(true, -1, 1);
      }).not.toThrow();
      
      expect(() => {
        calculateScore(true, Number.MAX_SAFE_INTEGER, 1);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow for major-minor mode', () => {
      // Generate multiple rounds
      const rounds = [];
      for (let i = 0; i < 5; i++) {
        const round = generateRound('major-minor', 1);
        rounds.push(round);
      }
      
      // Validate each round has required properties
      rounds.forEach(round => {
        expect(round.mode).toBe('major-minor');
        expect(round.difficulty).toBe(1);
        expect(round.id).toMatch(/^round-\d+$/);
      });
      
      // Test scoring
      rounds.forEach(round => {
        const score = calculateScore(true, 2000, round.difficulty);
        expect(score).toBeGreaterThan(0);
      });
    });

    it('should handle all modes with different difficulties', () => {
      const modes = ['major-minor', 'modes', 'special-scales', 'scale-degrees'];
      
      modes.forEach(mode => {
        for (let difficulty = 1; difficulty <= 3; difficulty++) {
          const round = generateRound(mode, difficulty);
          expect(round.mode).toBe(mode);
          expect(round.difficulty).toBe(difficulty);
          
          const isCorrect = validateAnswer(round.answer, round.answer);
          expect(isCorrect).toBe(true);
          
          const score = calculateScore(isCorrect, 1000, difficulty);
          expect(score).toBeGreaterThan(0);
        }
      });
    });

    

    it('should handle rapid round generation', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          const round = generateRound('major-minor', 1);
          expect(round).toBeDefined();
        }
      }).not.toThrow();
    });
  });

  describe('Educational Content Validation', () => {
    it('should provide educational scale names', () => {
      Object.entries(SCALE_NAMES).forEach(([key, name]) => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
        // Scale names should end with Scale, Mode, or just be descriptive names
        expect(name).toMatch(/(Scale|Mode|Pentatonic|Blues|Whole Tone|Chromatic|Octatonic)$/);
      });
    });

    it('should provide educational scale degree functions', () => {
      Object.entries(SCALE_DEGREE_FUNCTIONS).forEach(([degree, funcName]) => {
        expect(typeof funcName).toBe('string');
        expect(funcName.length).toBeGreaterThan(0);
      });
      
      // Tonic should be marked as home
      expect(SCALE_DEGREE_FUNCTIONS[1 as keyof typeof SCALE_DEGREE_FUNCTIONS]).toContain('home');
      
      // Leading tone should be identifiable
      expect(SCALE_DEGREE_FUNCTIONS[7 as keyof typeof SCALE_DEGREE_FUNCTIONS]).toContain('Leading');
    });

    it('should have age-appropriate content for each mode', () => {
      expect(SCALE_MODES['major-minor'].ageRange).toBe('7-9');
      expect(SCALE_MODES['scale-degrees'].ageRange).toBe('8-10');
      expect(SCALE_MODES.modes.ageRange).toBe('9-11');
      expect(SCALE_MODES['special-scales'].ageRange).toBe('10-12');
    });
  });
});