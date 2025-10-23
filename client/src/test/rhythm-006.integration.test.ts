import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RHYTHM_006_MODES } from '../lib/gameLogic/rhythm-006Modes';
import { generateRound, validateAnswer, calculateScore } from '../lib/gameLogic/rhythm-006Logic';

describe('Rhythm006 Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('Mode Integration', () => {
    it('should support all required modes', () => {
      expect(RHYTHM_006_MODES).toContain('steady-beat');
      expect(RHYTHM_006_MODES).toContain('beat-tapping');
      expect(RHYTHM_006_MODES).toContain('internal-pulse');
      expect(RHYTHM_006_MODES).toContain('subdivisions');
      expect(RHYTHM_006_MODES).toContain('tempo-stability');
      expect(RHYTHM_006_MODES).toHaveLength(5);
    });

    it('should generate rounds for all modes', () => {
      RHYTHM_006_MODES.forEach(mode => {
        const round = generateRound(mode, 1);
        expect(round.mode).toBe(mode);
        expect(round.difficulty).toBe(1);
        expect(round.id).toBeTruthy();
      });
    });
  });

  describe('Game Logic Integration', () => {
    it('should handle complete game flow for beat tapping mode', () => {
      const mode = 'beat-tapping';
      const difficulty = 2;
      
      // Generate round
      const round = generateRound(mode, difficulty);
      expect(round.mode).toBe(mode);
      
      // Simulate user answer
      const userAnswer = round.answer;
      const isCorrect = validateAnswer(userAnswer, round.answer);
      expect(isCorrect).toBe(true);
      
      // Calculate score
      const score = calculateScore(isCorrect, 1000, difficulty);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle incorrect answers properly', () => {
      const mode = 'steady-beat';
      const difficulty = 1;
      
      const round = generateRound(mode, difficulty);
      const wrongAnswer = 'wrong answer';
      const isCorrect = validateAnswer(wrongAnswer, round.answer);
      expect(isCorrect).toBe(false);
      
      const score = calculateScore(isCorrect, 1000, difficulty);
      expect(score).toBe(0);
    });

    it('should apply difficulty scaling correctly', () => {
      const mode = 'subdivisions';
      const timeSpent = 1000;
      
      const round1 = generateRound(mode, 1);
      const score1 = calculateScore(true, timeSpent, 1);
      
      const round2 = generateRound(mode, 3);
      const score2 = calculateScore(true, timeSpent, 3);
      
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('Timing and Scoring Integration', () => {
    it('should reward faster answers', () => {
      const mode = 'tempo-stability';
      const difficulty = 2;
      
      const fastScore = calculateScore(true, 500, difficulty);
      const slowScore = calculateScore(true, 3000, difficulty);
      
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should handle edge cases in scoring', () => {
      // Very slow answer should still get base score
      const verySlowScore = calculateScore(true, 20000, 1);
      expect(verySlowScore).toBe(100);
      
      // Instant answer should get maximum bonus
      const instantScore = calculateScore(true, 0, 1);
      expect(instantScore).toBe(150);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent round structure across modes', () => {
      const rounds = RHYTHM_006_MODES.map(mode => generateRound(mode, 1));
      
      rounds.forEach(round => {
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
    });

    it('should generate unique IDs consistently', () => {
      const ids = new Set();
      
      for (let i = 0; i < 10; i++) {
        // Mock Date.now to ensure different timestamps
        const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(i * 1000);
        const round = generateRound('steady-beat', 1);
        mockDateNow.mockRestore();
        
        expect(ids.has(round.id)).toBe(false);
        ids.add(round.id);
      }
    });
  });
});