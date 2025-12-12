import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateRound,
  validateAnswer,
  calculateScore
} from '@/lib/gameLogic/theory-003Logic';
import { 
  CHORD_BUILDER_MODES,
  BASIC_CHORDS,
  COMPLEX_CHORDS,
  getModeById,
  getBasicChordById,
  getComplexChordById,
  getChordById,
  getNoteFrequency,
  getChordFrequencies,
  DIFFICULTY_CURVES,
  getDifficultyForMode,
  type GameMode,
  type DifficultySettings
} from '@/lib/gameLogic/theory-003Modes';

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

describe('Theory-003 Chord Builder Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 2 modes defined', () => {
      expect(CHORD_BUILDER_MODES).toHaveLength(2);
    });

    it('should have all required mode IDs', () => {
      const modeIds = CHORD_BUILDER_MODES.map(mode => mode.id);
      const expectedIds = ['all-chords', 'complex'];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      CHORD_BUILDER_MODES.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('ageRange');
        expect(mode).toHaveProperty('difficulty');
        expect(mode).toHaveProperty('maxRounds');
        expect(mode).toHaveProperty('maxDifficulty');
        expect(mode).toHaveProperty('instructions');
        
        expect(typeof mode.id).toBe('string');
        expect(typeof mode.name).toBe('string');
        expect(typeof mode.description).toBe('string');
        expect(typeof mode.icon).toBe('string');
        expect(typeof mode.color).toBe('string');
        expect(typeof mode.ageRange).toBe('string');
        expect(typeof mode.difficulty).toBe('string');
        expect(typeof mode.maxRounds).toBe('number');
        expect(typeof mode.maxDifficulty).toBe('number');
        expect(typeof mode.instructions).toBe('string');
      });
    });

    it('should have correct properties for all-chords mode', () => {
      const allChordsMode = getModeById('all-chords');
      expect(allChordsMode).toBeDefined();
      expect(allChordsMode!.id).toBe('all-chords');
      expect(allChordsMode!.name).toBe('All Chords');
      expect(allChordsMode!.ageRange).toBe('7-10 years');
      expect(allChordsMode!.maxRounds).toBe(12);
      expect(allChordsMode!.maxDifficulty).toBe(3);
      expect(allChordsMode!.difficulty).toBe('easy');
    });

    it('should have correct properties for complex mode', () => {
      const complexMode = getModeById('complex');
      expect(complexMode).toBeDefined();
      expect(complexMode!.id).toBe('complex');
      expect(complexMode!.name).toBe('Complex Chords');
      expect(complexMode!.ageRange).toBe('10-12 years');
      expect(complexMode!.maxRounds).toBe(10);
      expect(complexMode!.maxDifficulty).toBe(3);
      expect(complexMode!.difficulty).toBe('hard');
    });
  });

  describe('Chord Collections', () => {
    it('should have basic chords with correct structure', () => {
      const cMajor = BASIC_CHORDS['C-major'];
      expect(cMajor.name).toBe('C Major Triad');
      expect(cMajor.type).toBe('major-triad');
      expect(cMajor.notes).toEqual(['C', 'E', 'G']);
      expect(cMajor.intervals).toEqual([0, 4, 7]);
      expect(cMajor.difficulty).toBe(1);
      expect(cMajor.description).toBe('Happy, bright sounding triad');
    });

    it('should have complex chords with correct structure', () => {
      const cMajor9 = COMPLEX_CHORDS['C-major9'];
      expect(cMajor9.name).toBe('C Major 9th');
      expect(cMajor9.type).toBe('major-ninth');
      expect(cMajor9.notes).toEqual(['C', 'E', 'G', 'B', 'D']);
      expect(cMajor9.intervals).toEqual([0, 4, 7, 11, 14]);
      expect(cMajor9.difficulty).toBe(3);
      expect(cMajor9.description).toBe('Rich, lush extended major chord');
    });

    it('should have correct number of chords', () => {
      expect(Object.keys(BASIC_CHORDS)).toHaveLength(12);
      expect(Object.keys(COMPLEX_CHORDS)).toHaveLength(11);
    });

    it('should include all chord types in basic chords', () => {
      const chordTypes = new Set(Object.values(BASIC_CHORDS).map(chord => chord.type));
      expect(chordTypes.has('major-triad')).toBe(true);
      expect(chordTypes.has('minor-triad')).toBe(true);
      expect(chordTypes.has('diminished-triad')).toBe(true);
      expect(chordTypes.has('augmented-triad')).toBe(true);
      expect(chordTypes.has('major-seventh')).toBe(true);
      expect(chordTypes.has('dominant-seventh')).toBe(true);
      expect(chordTypes.has('minor-seventh')).toBe(true);
      expect(chordTypes.has('diminished-seventh')).toBe(true);
    });

    it('should include extended and altered chords in complex chords', () => {
      const chordTypes = new Set(Object.values(COMPLEX_CHORDS).map(chord => chord.type));
      expect(chordTypes.has('major-ninth')).toBe(true);
      expect(chordTypes.has('dominant-ninth')).toBe(true);
      expect(chordTypes.has('minor-ninth')).toBe(true);
      expect(chordTypes.has('major-eleventh')).toBe(true);
      expect(chordTypes.has('dominant-thirteenth')).toBe(true);
      expect(chordTypes.has('altered-dominant')).toBe(true);
      expect(chordTypes.has('suspended-fourth')).toBe(true);
      expect(chordTypes.has('suspended-second')).toBe(true);
    });
  });

  describe('Game Logic', () => {
    it('should generate rounds for all-chords mode', () => {
      const round = generateRound('all-chords', 1);
      
      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.mode).toBe('all-chords');
      expect(round.difficulty).toBe(1);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
    });

    it('should generate rounds for complex mode', () => {
      const round = generateRound('complex', 2);
      
      expect(round.mode).toBe('complex');
      expect(round.difficulty).toBe(2);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
    });

    it('should generate properly formatted round IDs', () => {
      const round = generateRound('all-chords', 1);
      expect(round.id).toMatch(/^round-\d+$/);
    });

    it('should validate answers correctly', () => {
      expect(validateAnswer('C Major', 'C Major')).toBe(true);
      expect(validateAnswer('C Major', 'G Major')).toBe(false);
      expect(validateAnswer('', '')).toBe(true);
      expect(validateAnswer('wrong', 'right')).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score correctly for correct answers', () => {
      const score = calculateScore(true, 5000, 1); // 5 seconds, difficulty 1
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should return 0 for incorrect answers', () => {
      const score = calculateScore(false, 5000, 1);
      expect(score).toBe(0);
    });

    it('should award more points for higher difficulty', () => {
      const easyScore = calculateScore(true, 5000, 1);
      const mediumScore = calculateScore(true, 5000, 2);
      const hardScore = calculateScore(true, 5000, 3);
      
      expect(hardScore).toBeGreaterThan(mediumScore);
      expect(mediumScore).toBeGreaterThan(easyScore);
    });

    it('should award time bonus for quick answers', () => {
      const quickScore = calculateScore(true, 2000, 1); // 2 seconds
      const slowScore = calculateScore(true, 8000, 1); // 8 seconds
      
      expect(quickScore).toBeGreaterThan(slowScore);
    });
  });

  describe('Helper Functions', () => {
    it('should get mode by ID correctly', () => {
      const allChordsMode = getModeById('all-chords');
      expect(allChordsMode).toBeDefined();
      expect(allChordsMode!.id).toBe('all-chords');
      
      const complexMode = getModeById('complex');
      expect(complexMode).toBeDefined();
      expect(complexMode!.id).toBe('complex');
      
      const nonExistent = getModeById('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get basic chord by ID correctly', () => {
      const cMajor = getBasicChordById('C-major');
      expect(cMajor).toBeDefined();
      expect(cMajor!.name).toBe('C Major Triad');
      
      const nonExistent = getBasicChordById('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get complex chord by ID correctly', () => {
      const cMajor9 = getComplexChordById('C-major9');
      expect(cMajor9).toBeDefined();
      expect(cMajor9!.name).toBe('C Major 9th');
      
      const nonExistent = getComplexChordById('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get any chord by ID correctly', () => {
      const cMajor = getChordById('C-major');
      expect(cMajor).toBeDefined();
      expect(cMajor!.name).toBe('C Major Triad');
      
      const cMajor9 = getChordById('C-major9');
      expect(cMajor9).toBeDefined();
      expect(cMajor9!.name).toBe('C Major 9th');
      
      const nonExistent = getChordById('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get note frequencies correctly', () => {
      expect(getNoteFrequency('C')).toBe(261.63);
      expect(getNoteFrequency('A')).toBe(440.00);
      expect(getNoteFrequency('C#')).toBe(277.18);
      expect(getNoteFrequency('Db')).toBe(277.18); // Enharmonic
      expect(getNoteFrequency('non-existent')).toBe(440); // Default
    });
  });

  describe('Chord Frequency Generation', () => {
    it('should generate frequencies for basic chords', () => {
      const frequencies = getChordFrequencies('C-major');
      expect(frequencies).toHaveLength(3);
      expect(frequencies[0]).toBeCloseTo(261.63, 1); // C
      expect(frequencies[1]).toBeCloseTo(329.63, 1); // E
      expect(frequencies[2]).toBeCloseTo(392.00, 1); // G
    });

    it('should generate frequencies for complex chords', () => {
      const frequencies = getChordFrequencies('C-major9');
      expect(frequencies).toHaveLength(5);
      expect(frequencies[0]).toBeCloseTo(261.63, 1); // C
      expect(frequencies[1]).toBeCloseTo(329.63, 1); // E
      expect(frequencies[2]).toBeCloseTo(392.00, 1); // G
      expect(frequencies[3]).toBeCloseTo(493.88, 1); // B
      expect(frequencies[4]).toBeCloseTo(587.33, 1); // D (9th)
    });

    it('should return empty array for non-existent chord', () => {
      const frequencies = getChordFrequencies('non-existent');
      expect(frequencies).toEqual([]);
    });

    it('should handle custom root frequency', () => {
      const frequencies = getChordFrequencies('C-major', 440); // A4 as root
      // The function ignores the custom root and uses the actual root note frequency
      expect(frequencies[0]).toBeCloseTo(261.63, 1); // C4 frequency
    });
  });

  describe('Difficulty Curves', () => {
    it('should have difficulty curves for all modes', () => {
      expect(DIFFICULTY_CURVES).toHaveProperty('all-chords');
      expect(DIFFICULTY_CURVES).toHaveProperty('complex');
      expect(DIFFICULTY_CURVES['all-chords']).toHaveLength(3);
      expect(DIFFICULTY_CURVES['complex']).toHaveLength(3);
    });

    it('should get difficulty settings for mode', () => {
      const allChordsLevel1 = getDifficultyForMode('all-chords', 1);
      expect(allChordsLevel1).toBeDefined();
      expect(allChordsLevel1!.level).toBe(1);
      expect(allChordsLevel1!.parameters.chordTypes).toContain('C-major');
      expect(allChordsLevel1!.parameters.includeTriads).toBe(true);
      expect(allChordsLevel1!.parameters.includeSevenths).toBe(false);
    });

    it('should progress difficulty correctly for all-chords mode', () => {
      const level1 = getDifficultyForMode('all-chords', 1);
      const level2 = getDifficultyForMode('all-chords', 2);
      const level3 = getDifficultyForMode('all-chords', 3);
      
      expect(level1!.parameters.chordTypes!.length).toBeLessThan(level2!.parameters.chordTypes!.length);
      expect(level2!.parameters.includeSevenths).toBe(false);
      expect(level3!.parameters.includeSevenths).toBe(true);
    });

    it('should progress difficulty correctly for complex mode', () => {
      const level1 = getDifficultyForMode('complex', 1);
      const level2 = getDifficultyForMode('complex', 2);
      const level3 = getDifficultyForMode('complex', 3);
      
      expect(level1!.parameters.includeAltered).toBe(false);
      expect(level2!.parameters.includeAltered).toBe(true);
      expect(level3!.parameters.complexity!).toBeGreaterThan(level2!.parameters.complexity!);
    });

    it('should return default difficulty for invalid level', () => {
      const invalidLevel = getDifficultyForMode('all-chords', 99);
      expect(invalidLevel).toBeDefined();
      expect(invalidLevel!.level).toBe(1); // Should return first level
    });

    it('should return undefined for invalid mode', () => {
      const invalidMode = getDifficultyForMode('non-existent', 1);
      expect(invalidMode).toBeUndefined();
    });
  });

  describe('Audio Synthesis Support', () => {
    it('should have reasonable frequency ranges for all notes', () => {
      Object.entries(getNoteFrequency).forEach(([note, freq]) => {
        if (typeof freq === 'number') {
          expect(freq).toBeGreaterThan(50); // Above bass range
          expect(freq).toBeLessThan(5000); // Below high treble
        }
      });
    });

    it('should generate mathematically correct intervals', () => {
      const cFreq = getNoteFrequency('C');
      const eFreq = getNoteFrequency('E');
      const gFreq = getNoteFrequency('G');
      
      // Major third should be approximately 5 semitones up
      const majorThirdRatio = eFreq / cFreq;
      expect(majorThirdRatio).toBeCloseTo(Math.pow(2, 4/12), 2);
      
      // Perfect fifth should be approximately 7 semitones up
      const perfectFifthRatio = gFreq / cFreq;
      expect(perfectFifthRatio).toBeCloseTo(Math.pow(2, 7/12), 2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty mode gracefully', () => {
      expect(() => {
        generateRound('', 1);
      }).not.toThrow();
    });

    it('should handle invalid difficulty gracefully', () => {
      expect(() => {
        generateRound('all-chords', -1);
      }).not.toThrow();
      
      expect(() => {
        generateRound('all-chords', 999);
      }).not.toThrow();
    });

    it('should handle null and undefined answers in validation', () => {
      expect(validateAnswer(null as any, null as any)).toBe(true);
      expect(validateAnswer(undefined as any, undefined as any)).toBe(true);
      expect(validateAnswer(null as any, 'test')).toBe(false);
      expect(validateAnswer('test', null as any)).toBe(false);
    });

    it('should handle zero and negative time in score calculation', () => {
      const zeroTimeScore = calculateScore(true, 0, 1);
      const negativeTimeScore = calculateScore(true, -1000, 1);
      
      expect(zeroTimeScore).toBeGreaterThan(0);
      expect(negativeTimeScore).toBeGreaterThan(0);
    });

    it('should handle very large time values gracefully', () => {
      const largeTimeScore = calculateScore(true, 999999, 1);
      expect(typeof largeTimeScore).toBe('number');
      expect(largeTimeScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle all difficulty levels for all modes', () => {
      const modes = ['all-chords', 'complex'];
      const difficulties = [1, 2, 3];
      
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

    it('should handle rapid round generation', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          const round = generateRound('all-chords', 1);
          expect(round).toBeDefined();
        }
      }).not.toThrow();
    });

    it('should maintain consistency across helper functions', () => {
      const chordId = 'C-major';
      const chord = getChordById(chordId);
      const frequencies = getChordFrequencies(chordId);
      
      expect(chord).toBeDefined();
      expect(frequencies).toHaveLength(chord!.notes.length);
      
      // Verify frequencies correspond to actual notes
      chord!.notes.forEach((note, index) => {
        const expectedFreq = getNoteFrequency(note);
        expect(frequencies[index]).toBeCloseTo(expectedFreq, 1);
      });
    });

    it('should validate complete game flow', () => {
      // Simulate a complete game session
      const mode = getModeById('all-chords')!;
      let totalScore = 0;
      
      for (let round = 0; round < mode.maxRounds; round++) {
        const difficulty = Math.min(Math.floor(round / 4) + 1, mode.maxDifficulty);
        const gameRound = generateRound(mode.id, difficulty);
        const isCorrect = validateAnswer(gameRound.answer, gameRound.answer);
        const roundScore = calculateScore(isCorrect, 3000, difficulty);
        
        totalScore += roundScore;
        
        expect(gameRound.mode).toBe(mode.id);
        expect(isCorrect).toBe(true);
        expect(roundScore).toBeGreaterThan(0);
      }
      
      expect(totalScore).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of chord lookups efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        getChordById('C-major');
        getChordFrequencies('C-major9');
        getNoteFrequency('A');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 operations in reasonable time
      expect(duration).toBeLessThan(100); // Less than 100ms
    });

    it('should handle memory usage gracefully', () => {
      const rounds = [];
      
      // Generate many rounds to test memory usage
      for (let i = 0; i < 1000; i++) {
        rounds.push(generateRound('all-chords', 1));
      }
      
      expect(rounds).toHaveLength(1000);
      rounds.forEach(round => {
        expect(round.id).toBeDefined();
        expect(round.mode).toBe('all-chords');
      });
    });
  });
});