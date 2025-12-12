/**
 * Test Suite for Consonance & Dissonance Master (Harmony004Game)
 * ID: harmony-004
 * Unified Skill: Understanding harmonic tension and resolution
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
  getNextDifficulty,
  getIntervalFrequencies,
  getNonChordTonePattern
} from '../lib/gameLogic/harmony-004Logic';
import {
  CONSONANCE_MODES,
  getModeById,
  getAllModes,
  getMaxDifficultyForMode,
  INTERVAL_DEFINITIONS,
  NON_CHORD_TONE_DEFINITIONS,
  getIntervalsByType,
  getAllNonChordTones
} from '../lib/gameLogic/harmony-004Modes';

describe('harmony-004Modes', () => {
  it('should have all required modes', () => {
    const modes = getAllModes();
    expect(modes).toHaveLength(3);
    
    const modeIds = modes.map(m => m.id);
    expect(modeIds).toContain('consonance');
    expect(modeIds).toContain('dissonance');
    expect(modeIds).toContain('non-chord-tones');
  });

  it('should have correct mode properties', () => {
    const consonanceMode = getModeById('consonance');
    expect(consonanceMode).toBeDefined();
    expect(consonanceMode!.name).toBe('Consonant Harmony');
    expect(consonanceMode!.difficulty).toBe('easy');
    expect(consonanceMode!.ageRange).toBe('7-9');
    expect(consonanceMode!.maxRounds).toBe(10);

    const dissonanceMode = getModeById('dissonance');
    expect(dissonanceMode).toBeDefined();
    expect(dissonanceMode!.name).toBe('Dissonant Harmony');
    expect(dissonanceMode!.difficulty).toBe('medium');
    expect(dissonanceMode!.ageRange).toBe('9-11');

    const nonChordMode = getModeById('non-chord-tones');
    expect(nonChordMode).toBeDefined();
    expect(nonChordMode!.name).toBe('Non-Chord Tones');
    expect(nonChordMode!.difficulty).toBe('hard');
    expect(nonChordMode!.ageRange).toBe('10-12');
  });

  it('should return correct max difficulty for modes', () => {
    expect(getMaxDifficultyForMode('consonance')).toBe(3);
    expect(getMaxDifficultyForMode('dissonance')).toBe(5);
    expect(getMaxDifficultyForMode('non-chord-tones')).toBe(7);
    expect(getMaxDifficultyForMode('unknown')).toBe(1);
  });

  it('should have correct interval definitions', () => {
    const consonantIntervals = getIntervalsByType('consonant');
    const dissonantIntervals = getIntervalsByType('dissonant');
    
    expect(consonantIntervals.length).toBeGreaterThan(0);
    expect(dissonantIntervals.length).toBeGreaterThan(0);
    
    // Check specific intervals
    expect(INTERVAL_DEFINITIONS.unison.type).toBe('consonant');
    expect(INTERVAL_DEFINITIONS.tritone.type).toBe('dissonant');
    expect(INTERVAL_DEFINITIONS.major3rd.type).toBe('consonant');
    expect(INTERVAL_DEFINITIONS.minor2nd.type).toBe('dissonant');
  });

  it('should have correct non-chord tone definitions', () => {
    const nonChordTones = getAllNonChordTones();
    expect(nonChordTones).toHaveLength(6);
    
    expect(NON_CHORD_TONE_DEFINITIONS.passingTone.name).toBe('Passing Tone');
    expect(NON_CHORD_TONE_DEFINITIONS.suspension.name).toBe('Suspension');
    expect(NON_CHORD_TONE_DEFINITIONS.appoggiatura.name).toBe('Appoggiatura');
  });
});

describe('harmony-004Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateRound', () => {
    it('should generate valid rounds for consonance mode', () => {
      const round = generateRound('consonance', 1);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'consonance');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('options');
      expect(round).toHaveProperty('correctAnswer');
      expect(round).toHaveProperty('difficulty', 1);
      expect(round).toHaveProperty('rootNote');
      expect(round).toHaveProperty('explanation');
      expect(round).toHaveProperty('audioConfig');
      
      expect(round.options).toBeInstanceOf(Array);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(round.options.length);
      expect(round.audioConfig.type).toBe('interval');
    });

    it('should generate valid rounds for dissonance mode', () => {
      const round = generateRound('dissonance', 2);
      
      expect(round.mode).toBe('dissonance');
      expect(round.difficulty).toBe(2);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.audioConfig.type).toBe('interval');
    });

    it('should generate valid rounds for non-chord-tones mode', () => {
      const round = generateRound('non-chord-tones', 3);
      
      expect(round.mode).toBe('non-chord-tones');
      expect(round.difficulty).toBe(3);
      expect(round.options.length).toBeGreaterThanOrEqual(3);
      expect(round.audioConfig.type).toBe('non-chord-tone');
    });

    it('should increase options with difficulty', () => {
      const easyRound = generateRound('consonance', 1);
      const hardRound = generateRound('consonance', 3);
      
      expect(hardRound.options.length).toBeGreaterThanOrEqual(easyRound.options.length);
    });

    it('should generate unique round IDs', () => {
      const round1 = generateRound('consonance', 1);
      const round2 = generateRound('consonance', 1);
      
      expect(round1.id).not.toBe(round2.id);
    });

    it('should generate valid root notes', () => {
      const round = generateRound('consonance', 1);
      expect(round.rootNote).toBeGreaterThanOrEqual(60);
      expect(round.rootNote).toBeLessThanOrEqual(72);
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

    it('should cap streak bonus at maximum', () => {
      const maxStreakScore = calculateScore(true, 1000, 2, 20);
      expect(maxStreakScore.streakBonus).toBeLessThanOrEqual(50);
    });
  });

  describe('updateProgress', () => {
    it('should create initial progress correctly', () => {
      const progress = createInitialProgress('consonance');
      
      expect(progress.mode).toBe('consonance');
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
      const initial = createInitialProgress('consonance');
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.correctAnswers).toBe(1);
      expect(updated.totalAnswers).toBe(1);
      expect(updated.streak).toBe(1);
      expect(updated.bestStreak).toBe(1);
    });

    it('should reset streak for incorrect answers', () => {
      const initial = createInitialProgress('consonance');
      initial.streak = 3;
      initial.bestStreak = 3;
      
      const updated = updateProgress(initial, false, 1000);
      
      expect(updated.streak).toBe(0);
      expect(updated.bestStreak).toBe(3); // Best streak preserved
      expect(updated.totalAnswers).toBe(1);
      expect(updated.correctAnswers).toBe(0);
    });

    it('should increase difficulty after correct answers', () => {
      const initial = createInitialProgress('consonance');
      initial.correctAnswers = 2;
      initial.difficulty = 1;
      
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.difficulty).toBe(2);
    });

    it('should not exceed max difficulty', () => {
      const initial = createInitialProgress('consonance');
      initial.correctAnswers = 10;
      initial.difficulty = 3; // Max for consonance
      
      const updated = updateProgress(initial, true, 1000);
      
      expect(updated.difficulty).toBe(3); // Should not increase beyond max
    });

    it('should decrease difficulty for struggling players', () => {
      const initial = createInitialProgress('dissonance');
      initial.correctAnswers = 5;
      initial.difficulty = 3;
      
      // Simulate struggling pattern
      let progress = initial;
      for (let i = 0; i < 5; i++) {
        progress = updateProgress(progress, false, 1000);
      }
      
      expect(progress.difficulty).toBeLessThan(3);
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
      expect(getPerformanceFeedback(95)).toContain('Brilliant');
      expect(getPerformanceFeedback(85)).toContain('Excellent');
      expect(getPerformanceFeedback(75)).toContain('Great work');
      expect(getPerformanceFeedback(65)).toContain('Good progress');
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
      const progress = createInitialProgress('consonance');
      progress.score = 100;
      progress.correctAnswers = 5;
      progress.streak = 3;
      
      const reset = resetProgress('consonance');
      
      expect(reset.score).toBe(0);
      expect(reset.correctAnswers).toBe(0);
      expect(reset.streak).toBe(0);
      expect(reset.mode).toBe('consonance');
    });
  });

  describe('Audio Helper Functions', () => {
    it('should calculate interval frequencies correctly', () => {
      const [rootFreq, intervalFreq] = getIntervalFrequencies(60, 7); // Perfect 5th
      
      expect(rootFreq).toBeCloseTo(261.63, 1); // C4
      expect(intervalFreq).toBeCloseTo(392.00, 1); // G4
      expect(intervalFreq / rootFreq).toBeCloseTo(1.5, 1); // Perfect 5th ratio
    });

    it('should generate non-chord tone patterns', () => {
      const passingPattern = getNonChordTonePattern('passing', 60);
      expect(passingPattern).toHaveLength(4);
      expect(passingPattern[0]).toBe(60);
      expect(passingPattern[3]).toBe(67); // Perfect 5th

      const neighborPattern = getNonChordTonePattern('neighbor', 60);
      expect(neighborPattern).toHaveLength(4);
      expect(neighborPattern[0]).toBe(60);
      expect(neighborPattern[2]).toBe(60); // Returns to root

      const suspensionPattern = getNonChordTonePattern('suspension', 60);
      expect(suspensionPattern).toHaveLength(4);
      expect(suspensionPattern[0]).toBe(64); // Suspended 4th
      expect(suspensionPattern[2]).toBe(62); // Resolves down
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid mode gracefully', () => {
      expect(() => generateRound('invalid-mode', 1)).toThrow();
    });

    it('should handle extreme difficulty values', () => {
      const round = generateRound('consonance', 10);
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
    it('should handle complete game flow for consonance mode', () => {
      // Start game
      let progress = createInitialProgress('consonance');
      
      // Play several rounds
      for (let i = 0; i < 5; i++) {
        const round = generateRound('consonance', progress.difficulty);
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

    it('should handle complete game flow for dissonance mode', () => {
      let progress = createInitialProgress('dissonance');
      
      for (let i = 0; i < 5; i++) {
        const round = generateRound('dissonance', progress.difficulty);
        const correct = validateAnswer(round.correctAnswer, round.correctAnswer);
        progress = updateProgress(progress, correct, 1000);
      }
      
      expect(progress.correctAnswers).toBe(5);
      expect(progress.totalAnswers).toBe(5);
    });

    it('should handle complete game flow for non-chord-tones mode', () => {
      let progress = createInitialProgress('non-chord-tones');
      
      for (let i = 0; i < 5; i++) {
        const round = generateRound('non-chord-tones', progress.difficulty);
        const correct = validateAnswer(round.correctAnswer, round.correctAnswer);
        progress = updateProgress(progress, correct, 1000);
      }
      
      expect(progress.correctAnswers).toBe(5);
      expect(progress.totalAnswers).toBe(5);
    });

    it('should handle mixed correct and incorrect answers', () => {
      let progress = createInitialProgress('dissonance');
      
      // Mix of correct and incorrect answers
      const results = [true, false, true, true, false];
      
      for (const correct of results) {
        const round = generateRound('dissonance', progress.difficulty);
        progress = updateProgress(progress, correct, 1000);
      }
      
      expect(progress.correctAnswers).toBe(3);
      expect(progress.totalAnswers).toBe(5);
      expect(calculateAccuracy(progress.correctAnswers, progress.totalAnswers)).toBe(60);
    });

    it('should handle difficulty progression across all modes', () => {
      const modes = ['consonance', 'dissonance', 'non-chord-tones'];
      
      for (const mode of modes) {
        let progress = createInitialProgress(mode);
        const maxDifficulty = getMaxDifficultyForMode(mode);
        
        // Play enough rounds to reach max difficulty
        for (let i = 0; i < 20; i++) {
          const round = generateRound(mode, progress.difficulty);
          progress = updateProgress(progress, true, 1000);
        }
        
        expect(progress.difficulty).toBe(maxDifficulty);
      }
    });
  });

  describe('Audio Configuration Validation', () => {
    it('should generate valid audio config for intervals', () => {
      const consonanceRound = generateRound('consonance', 1);
      const dissonanceRound = generateRound('dissonance', 1);
      
      expect(consonanceRound.audioConfig.type).toBe('interval');
      expect(consonanceRound.audioConfig.data).toHaveProperty('interval');
      expect(consonanceRound.audioConfig.data).toHaveProperty('rootNote');
      expect(consonanceRound.audioConfig.duration).toBe(2.0);
      
      expect(dissonanceRound.audioConfig.type).toBe('interval');
      expect(dissonanceRound.audioConfig.data).toHaveProperty('interval');
      expect(dissonanceRound.audioConfig.data).toHaveProperty('rootNote');
    });

    it('should generate valid audio config for non-chord tones', () => {
      const nctRound = generateRound('non-chord-tones', 1);
      
      expect(nctRound.audioConfig.type).toBe('non-chord-tone');
      expect(nctRound.audioConfig.data).toHaveProperty('type');
      expect(nctRound.audioConfig.data).toHaveProperty('rootNote');
      expect(nctRound.audioConfig.duration).toBe(3.0);
    });
  });
});
