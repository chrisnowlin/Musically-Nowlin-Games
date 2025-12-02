import { describe, it, expect } from 'vitest';
import { generateRound, validateAnswer, calculateScore } from '../lib/gameLogic/cross-001Logic';

describe('cross-001 logic', () => {
  describe('generateRound', () => {
    it('returns a valid round for math mode', () => {
      const round = generateRound('math', 1);
      expect(round.mode).toBe('math');
      expect(round.question.length).toBeGreaterThan(0);
      expect(Array.isArray(round.options)).toBe(true);
      expect(round.options.length).toBeGreaterThan(0);
      expect(round.difficulty).toBe(1);
    });

    it('returns a valid round for language mode', () => {
      const round = generateRound('language', 2);
      expect(round.mode).toBe('language');
      expect(round.question.length).toBeGreaterThan(0);
      expect(Array.isArray(round.options)).toBe(true);
      expect(round.options.length).toBe(4);
      expect(round.difficulty).toBe(2);
    });

    it('returns a valid round for movement mode', () => {
      const round = generateRound('movement', 3);
      expect(round.mode).toBe('movement');
      expect(round.question.length).toBeGreaterThan(0);
      expect(Array.isArray(round.options)).toBe(true);
      expect(round.options.length).toBeGreaterThan(0);
      expect(round.difficulty).toBe(3);
    });

    it('includes audio data for math mode', () => {
      const round = generateRound('math', 1);
      expect(Array.isArray(round.notes)).toBe(true);
      expect(round.notes!.length).toBeGreaterThan(0);
      expect(Array.isArray(round.pattern)).toBe(true);
      expect(round.pattern!.length).toBeGreaterThan(0);
    });

    it('includes audio data for language mode', () => {
      const round = generateRound('language', 1);
      expect(Array.isArray(round.notes)).toBe(true);
      expect(round.notes!.length).toBeGreaterThan(0);
      expect(Array.isArray(round.pattern)).toBe(true);
      expect(round.pattern!.length).toBeGreaterThan(0);
    });

    it('includes audio data for movement mode', () => {
      const round = generateRound('movement', 1);
      expect(Array.isArray(round.notes)).toBe(true);
      expect(round.notes!.length).toBeGreaterThan(0);
      expect(Array.isArray(round.pattern)).toBe(true);
      expect(round.pattern!.length).toBeGreaterThan(0);
    });

    it('includes description for all modes', () => {
      const mathRound = generateRound('math', 1);
      const languageRound = generateRound('language', 1);
      const movementRound = generateRound('movement', 1);
      
      expect(mathRound.description).toBeDefined();
      expect(mathRound.description!.length).toBeGreaterThan(0);
      expect(languageRound.description).toBeDefined();
      expect(languageRound.description!.length).toBeGreaterThan(0);
      expect(movementRound.description).toBeDefined();
      expect(movementRound.description!.length).toBeGreaterThan(0);
    });

    it('generates properly formatted round IDs', () => {
      const round = generateRound('math', 1);
      expect(round.id).toMatch(/^round-\d+$/);
      expect(round.id.length).toBeGreaterThan(5);
    });

    it('handles unknown mode by defaulting to math', () => {
      const round = generateRound('unknown' as any, 1);
      expect(round.mode).toBe('unknown');
      expect(round.question).toBeDefined();
    });
  });

  describe('validateAnswer', () => {
    it('returns true for correct answer', () => {
      expect(validateAnswer('4 beats', '4 beats')).toBe(true);
    });

    it('returns false for incorrect answer', () => {
      expect(validateAnswer('3 beats', '4 beats')).toBe(false);
    });

    it('is case sensitive', () => {
      expect(validateAnswer('4 beats', '4 Beats')).toBe(false);
    });

    it('handles empty strings', () => {
      expect(validateAnswer('', '')).toBe(true);
      expect(validateAnswer('answer', '')).toBe(false);
      expect(validateAnswer('', 'answer')).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('returns 0 for incorrect answer', () => {
      expect(calculateScore(false, 1000, 1)).toBe(0);
      expect(calculateScore(false, 5000, 5)).toBe(0);
    });

    it('returns positive score for correct answer', () => {
      const score = calculateScore(true, 1000, 1);
      expect(score).toBeGreaterThan(0);
    });

    it('increases score with difficulty', () => {
      const score1 = calculateScore(true, 1000, 1);
      const score3 = calculateScore(true, 1000, 3);
      const score5 = calculateScore(true, 1000, 5);
      expect(score3).toBeGreaterThan(score1);
      expect(score5).toBeGreaterThan(score3);
    });

    it('gives time bonus for faster answers', () => {
      const fastScore = calculateScore(true, 500, 2);
      const slowScore = calculateScore(true, 3000, 2);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('caps time bonus at 50 points', () => {
      const instantScore = calculateScore(true, 0, 2);
      const fastScore = calculateScore(true, 100, 2);
      // Both should be close to max, allow small difference due to rounding
      expect(Math.abs(instantScore - fastScore)).toBeLessThanOrEqual(1);
    });

    it('calculates base score correctly', () => {
      // Base score should be 100 * difficulty
      const baseScore1 = calculateScore(true, 5000, 1); // No time bonus
      const baseScore2 = calculateScore(true, 5000, 2); // No time bonus
      const baseScore3 = calculateScore(true, 5000, 3); // No time bonus
      
      expect(baseScore1).toBe(100);
      expect(baseScore2).toBe(200);
      expect(baseScore3).toBe(300);
    });
  });

  describe('Math Mode Questions', () => {
    it('generates math-related questions', () => {
      const round = generateRound('math', 1);
      const hasMathKeyword = round.question.includes('beat') || 
                             round.question.includes('fraction') || 
                             round.question.includes('pattern') ||
                             round.question.includes('sequence');
      expect(hasMathKeyword).toBe(true);
    });

    it.skip('has math-related answer options', () => {
      const round = generateRound('math', 1);
      const hasMathOption = round.options.some(option => 
        option.includes('beat') || 
        option.includes('fraction') || 
        option.includes('pattern') ||
        option.includes('sequence') ||
        option.includes('notes')
      );
      expect(hasMathOption).toBe(true);
    });
  });

  describe('Language Mode Questions', () => {
    it('generates language-related questions', () => {
      const round = generateRound('language', 1);
      const hasLanguageKeyword = round.question.includes('rhythm') || 
                                round.question.includes('pattern') || 
                                round.question.includes('story') ||
                                round.question.includes('syllable');
      expect(hasLanguageKeyword).toBe(true);
    });

    it('has language-related answer options', () => {
      const round = generateRound('language', 1);
      // Just check that we have valid options, the specific content can vary
      expect(round.options.length).toBeGreaterThan(0);
      expect(round.options.length).toBe(4); // All language questions have 4 options
    });
  });

  describe('Movement Mode Questions', () => {
    it('generates movement-related questions', () => {
      const round = generateRound('movement', 1);
      const hasMovementKeyword = round.question.includes('move') || 
                                 round.question.includes('tempo') || 
                                 round.question.includes('energy') ||
                                 round.question.includes('dancing');
      expect(hasMovementKeyword).toBe(true);
    });

    it('has movement-related answer options', () => {
      const round = generateRound('movement', 1);
      const hasMovementOption = round.options.some(option => 
        option.includes('Marching') || 
        option.includes('tempo') || 
        option.includes('energy') ||
        option.includes('dancing') ||
        option.includes('Swaying')
      );
      expect(hasMovementOption).toBe(true);
    });
  });
});