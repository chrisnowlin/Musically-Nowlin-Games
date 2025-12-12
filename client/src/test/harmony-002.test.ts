/**
 * Test Suite for Chord Master (Harmony002Game)
 * ID: harmony-002
 * Unified Skill: Understanding chord structures and vertical harmony
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateRound,
  validateAnswer,
  calculateScore,
  updateProgress,
  createInitialProgress,
  resetProgress,
  calculateAccuracy,
  getPerformanceFeedback,
  getNextDifficulty
} from '../lib/gameLogic/harmony-002Logic';
import {
  CHORD_MODES,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode
} from '../lib/gameLogic/harmony-002Modes';

describe('harmony-002Modes', () => {
  it('should have all required modes', () => {
    const modes = getAllModes();
    expect(modes).toHaveLength(3);
    
    const modeIds = modes.map(m => m.id);
    expect(modeIds).toContain('triads');
    expect(modeIds).toContain('sevenths');
    expect(modeIds).toContain('extended');
  });

  it('should have correct mode properties', () => {
    const triadsMode = getModeById('triads');
    expect(triadsMode).toBeDefined();
    expect(triadsMode!.name).toBe('Triad Builder');
    expect(triadsMode!.difficulty).toBe('easy');
    expect(triadsMode!.ageRange).toBe('7-9');
    expect(triadsMode!.maxRounds).toBe(10);

    const seventhsMode = getModeById('sevenths');
    expect(seventhsMode).toBeDefined();
    expect(seventhsMode!.name).toBe('Seventh Chords');
    expect(seventhsMode!.difficulty).toBe('medium');
    expect(seventhsMode!.ageRange).toBe('9-11');

    const extendedMode = getModeById('extended');
    expect(extendedMode).toBeDefined();
    expect(extendedMode!.name).toBe('Extended Harmony');
    expect(extendedMode!.difficulty).toBe('hard');
    expect(extendedMode!.ageRange).toBe('10-12');
  });

  it('should return correct max difficulty for modes', () => {
    expect(getMaxDifficultyForMode('triads')).toBe(3);
    expect(getMaxDifficultyForMode('sevenths')).toBe(5);
    expect(getMaxDifficultyForMode('extended')).toBe(7);
    expect(getMaxDifficultyForMode('unknown')).toBe(1);
  });
});

describe('harmony-002Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateRound', () => {
    it('should generate valid rounds for triads mode', () => {
      const round = generateRound('triads', 1);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'triads');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('options');
      expect(round).toHaveProperty('correctAnswer');
      expect(round).toHaveProperty('difficulty', 1);
      expect(round).toHaveProperty('chordType');
      expect(round).toHaveProperty('rootNote');
      expect(round).toHaveProperty('explanation');
      expect(round).toHaveProperty('audioConfig');
      
      expect(round.options).toBeInstanceOf(Array);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(round.options.length);
    });

    it('should generate valid rounds for sevenths mode', () => {
      const round = generateRound('sevenths', 2);
      
      expect(round.mode).toBe('sevenths');
      expect(round.difficulty).toBe(2);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.chordType).toBeTruthy();
    });

    it('should generate valid rounds for extended mode', () => {
      const round = generateRound('extended', 3);
      
      expect(round.mode).toBe('extended');
      expect(round.difficulty).toBe(3);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.chordType).toBeTruthy();
    });

    it('should increase options with difficulty', () => {
      const easyRound = generateRound('triads', 1);
      const hardRound = generateRound('triads', 3);
      
      expect(hardRound.options.length).toBeGreaterThanOrEqual(easyRound.options.length);
    });

    it('should generate unique round IDs', () => {
      const round1 = generateRound('triads', 1);
      const round2 = generateRound('triads', 1);
      
      expect(round1.id).not.toBe(round2.id);
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answers', () => {
      expect(validateAnswer(2, 2)).toBe(true);
      expect(validateAnswer(0, 0)).toBe(true);
    });

    it('should reject incorrect answers', () => {
      expect(validateAnswer(1, 2)).toBe(false);
      expect(validateAnswer(3, 0)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate zero score for incorrect answers', () => {
      const score = calculateScore(false, 1000, 2, 0);
      expect(score.total).toBe(0);
      expect(score.baseScore).toBe(0);
      expect(score.speedBonus).toBe(0);
      expect(score.streakBonus).toBe(0);
    });

    it('should calculate positive score for correct answers', () => {
      const score = calculateScore(true, 1000, 2, 3);
      expect(score.baseScore).toBe(200); // 100 * difficulty
      expect(score.speedBonus).toBeGreaterThan(0);
      expect(score.streakBonus).toBe(15); // 3 * 5
      expect(score.difficultyMultiplier).toBe(2);
      expect(score.total).toBeGreaterThan(200);
    });

    it('should give higher scores for faster answers', () => {
      const fastScore = calculateScore(true, 500, 2, 0);
      const slowScore = calculateScore(true, 2000, 2, 0);
      
      expect(fastScore.speedBonus).toBeGreaterThan(slowScore.speedBonus);
    });

    it('should increase streak bonus with longer streaks', () => {
      const noStreakScore = calculateScore(true, 1000, 2, 0);
      const streakScore = calculateScore(true, 1000, 2, 5);
      
      expect(streakScore.streakBonus).toBeGreaterThan(noStreakScore.streakBonus);
    });
  });

  describe('updateProgress', () => {
    it('should create initial progress correctly', () => {
      const progress = createInitialProgress('triads');
      
      expect(progress.mode).toBe('triads');
      expect(progress.score).toBe(0);
      expect(progress.round).toBe(1);
      expect(progress.difficulty).toBe(1);
      expect(progress.correctAnswers).toBe(0);
      expect(progress.totalAnswers).toBe(0);
      expect(progress.streak).toBe(0);
      expect(progress.bestStreak).toBe(0);
      expect(progress.bestScore).toBe(0);
    });

    it('should update progress for correct answers', () => {
      const initial = createInitialProgress('triads');
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.correctAnswers).toBe(1);
      expect(updated.totalAnswers).toBe(1);
      expect(updated.streak).toBe(1);
      expect(updated.bestStreak).toBe(1);
    });

    it('should reset streak for incorrect answers', () => {
      const initial = createInitialProgress('triads');
      initial.streak = 3;
      initial.bestStreak = 3;
      
      const updated = updateProgress(initial, false, 1000);
      
      expect(updated.streak).toBe(0);
      expect(updated.bestStreak).toBe(3); // Best streak preserved
      expect(updated.totalAnswers).toBe(1);
      expect(updated.correctAnswers).toBe(0);
    });

    it('should increase difficulty after correct answers', () => {
      const initial = createInitialProgress('triads');
      initial.correctAnswers = 2;
      initial.difficulty = 1;
      
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.difficulty).toBe(2);
    });

    it('should not exceed max difficulty', () => {
      const initial = createInitialProgress('triads');
      initial.correctAnswers = 10;
      initial.difficulty = 3; // Max for triads
      
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.difficulty).toBe(3); // Should not increase beyond max
    });
  });

  describe('calculateAccuracy', () => {
    it('should calculate accuracy correctly', () => {
      expect(calculateAccuracy(8, 10)).toBe(80);
      expect(calculateAccuracy(5, 10)).toBe(50);
      expect(calculateAccuracy(0, 10)).toBe(0);
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('should handle zero total answers', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });
  });

  describe('getPerformanceFeedback', () => {
    it('should return appropriate feedback for different accuracy levels', () => {
      expect(getPerformanceFeedback(95)).toContain('Outstanding');
      expect(getPerformanceFeedback(85)).toContain('Excellent');
      expect(getPerformanceFeedback(75)).toContain('Good job');
      expect(getPerformanceFeedback(65)).toContain('Nice effort');
      expect(getPerformanceFeedback(55)).toContain('Keep practicing');
    });
  });

  describe('getNextDifficulty', () => {
    it('should increase difficulty for high accuracy', () => {
      const nextDifficulty = getNextDifficulty(2, 85, 5);
      expect(nextDifficulty).toBe(3);
    });

    it('should decrease difficulty for low accuracy', () => {
      const nextDifficulty = getNextDifficulty(3, 55, 5);
      expect(nextDifficulty).toBe(2);
    });

    it('should maintain difficulty for moderate accuracy', () => {
      const nextDifficulty = getNextDifficulty(3, 70, 5);
      expect(nextDifficulty).toBe(3);
    });

    it('should not go below minimum difficulty', () => {
      const nextDifficulty = getNextDifficulty(1, 55, 5);
      expect(nextDifficulty).toBe(1);
    });

    it('should not go above maximum difficulty', () => {
      const nextDifficulty = getNextDifficulty(5, 85, 5);
      expect(nextDifficulty).toBe(5);
    });
  });

  describe('resetProgress', () => {
    it('should reset progress to initial state', () => {
      const progress = createInitialProgress('triads');
      progress.score = 100;
      progress.correctAnswers = 5;
      progress.streak = 3;
      
      const reset = resetProgress('triads');
      
      expect(reset.score).toBe(0);
      expect(reset.correctAnswers).toBe(0);
      expect(reset.streak).toBe(0);
      expect(reset.mode).toBe('triads');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid mode gracefully', () => {
      expect(() => generateRound('invalid-mode', 1)).toThrow();
    });

    it('should handle extreme difficulty values', () => {
      const round = generateRound('triads', 10);
      expect(round.difficulty).toBe(10);
      expect(round.options.length).toBeGreaterThan(0);
    });

    it('should handle negative time spent', () => {
      const score = calculateScore(true, -100, 2, 0);
      expect(score.total).toBeGreaterThan(0);
    });

    it('should handle very large streak values', () => {
      const score = calculateScore(true, 1000, 2, 100);
      expect(score.streakBonus).toBeLessThanOrEqual(50); // Capped at 50
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow', () => {
      // Start game
      let progress = createInitialProgress('triads');
      
      // Play several rounds
      for (let i = 0; i < 5; i++) {
        const round = generateRound('triads', progress.difficulty);
        const correct = validateAnswer(round.correctAnswer, round.correctAnswer);
        const score = calculateScore(correct, 1000, progress.difficulty, progress.streak);
        
        progress = updateProgress(progress, correct, 1000);
        progress.score += score.total;
      }
      
      expect(progress.correctAnswers).toBe(5);
      expect(progress.totalAnswers).toBe(5);
      expect(progress.score).toBeGreaterThan(0);
      expect(progress.difficulty).toBeGreaterThan(1);
    });

    it('should handle mixed correct and incorrect answers', () => {
      let progress = createInitialProgress('sevenths');
      
      // Mix of correct and incorrect answers
      const results = [true, false, true, true, false];
      
      for (const correct of results) {
        const round = generateRound('sevenths', progress.difficulty);
        progress = updateProgress(progress, correct, 1000);
      }
      
      expect(progress.correctAnswers).toBe(3);
      expect(progress.totalAnswers).toBe(5);
      expect(calculateAccuracy(progress.correctAnswers, progress.totalAnswers)).toBe(60);
    });
  });
});
