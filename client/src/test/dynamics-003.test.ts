/**
 * Test Suite for Emotion Master (dynamics-003)
 * Multi-mode game covering emotional recognition and analysis in music
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRound,
  validateAnswer,
  calculateScore,
  getScoreBreakdown,
  updateProgress,
  getNextDifficulty,
  getAudioParameters,
  getMaxDifficultyForMode,
  isValidMode,
  getAllModes,
  resetProgress,
  calculateAccuracy,
  getPerformanceFeedback,
  GameProgress
} from '../lib/gameLogic/dynamics-003Logic';
import {
  EMOTION_MODES,
  EMOTIONS,
  DIFFICULTY_CURVES,
  getModeById,
  getDifficultyForMode,
  getEmotionConfig,
  getAnalysisOptionsForEmotion
} from '../lib/gameLogic/dynamics-003Modes';

describe('dynamics-003Modes', () => {
  describe('EMOTION_MODES', () => {
    it('should have exactly 2 modes', () => {
      expect(EMOTION_MODES).toHaveLength(2);
    });

    it('should include detection and analysis modes', () => {
      const modeIds = EMOTION_MODES.map(m => m.id);
      expect(modeIds).toContain('detection');
      expect(modeIds).toContain('analysis');
    });

    it('should have required mode properties', () => {
      EMOTION_MODES.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('instructions');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('difficulty');
        expect(mode).toHaveProperty('ageRange');
        expect(mode).toHaveProperty('maxRounds');
        expect(mode).toHaveProperty('timePerRound');
      });
    });
  });

  describe('EMOTIONS', () => {
    it('should have 6 emotion configurations', () => {
      expect(Object.keys(EMOTIONS)).toHaveLength(6);
    });

    it('should include all required emotions', () => {
      const emotionIds = Object.keys(EMOTIONS);
      expect(emotionIds).toContain('happy');
      expect(emotionIds).toContain('sad');
      expect(emotionIds).toContain('energetic');
      expect(emotionIds).toContain('calm');
      expect(emotionIds).toContain('mysterious');
      expect(emotionIds).toContain('triumphant');
    });

    it('should have required emotion properties', () => {
      Object.values(EMOTIONS).forEach(emotion => {
        expect(emotion).toHaveProperty('name');
        expect(emotion).toHaveProperty('icon');
        expect(emotion).toHaveProperty('color');
        expect(emotion).toHaveProperty('melody');
        expect(emotion).toHaveProperty('tempo');
        expect(emotion).toHaveProperty('dynamics');
        expect(emotion).toHaveProperty('characteristics');
        expect(Array.isArray(emotion.melody)).toBe(true);
        expect(Array.isArray(emotion.characteristics)).toBe(true);
      });
    });
  });

  describe('DIFFICULTY_CURVES', () => {
    it('should have difficulty curves for both modes', () => {
      expect(DIFFICULTY_CURVES).toHaveProperty('detection');
      expect(DIFFICULTY_CURVES).toHaveProperty('analysis');
    });

    it('should have 3 difficulty levels for each mode', () => {
      Object.values(DIFFICULTY_CURVES).forEach(curve => {
        expect(curve).toHaveLength(3);
        curve.forEach((level, index) => {
          expect(level.level).toBe(index + 1);
        });
      });
    });
  });

  describe('Helper Functions', () => {
    it('getModeById should return correct mode', () => {
      const detection = getModeById('detection');
      expect(detection?.id).toBe('detection');
      expect(detection?.name).toBe('Emotion Detection');
    });

    it('getModeById should return undefined for invalid mode', () => {
      expect(getModeById('invalid')).toBeUndefined();
    });

    it('getDifficultyForMode should return correct difficulty', () => {
      const difficulty = getDifficultyForMode('detection', 1);
      expect(difficulty?.level).toBe(1);
      expect(difficulty?.name).toBe('Beginner');
    });

    it('getEmotionConfig should return correct emotion', () => {
      const happy = getEmotionConfig('happy');
      expect(happy?.name).toBe('Happy');
      expect(happy?.tempo).toBe(0.4);
    });

    it('getAnalysisOptionsForEmotion should return options', () => {
      const options = getAnalysisOptionsForEmotion('happy');
      expect(Array.isArray(options)).toBe(true);
      expect(options).toHaveLength(4);
    });
  });
});

describe('dynamics-003Logic', () => {
  describe('generateRound', () => {
    it('should generate detection round correctly', () => {
      const round = generateRound('detection', 1);
      
      expect(round.mode).toBe('detection');
      expect(round.question).toContain('emotion');
      expect(round.options).toHaveLength(3); // Beginner level has 3 options
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(round.options.length);
      expect(round.difficulty).toBe(1);
      expect(round.audioConfig).toHaveProperty('emotion');
      expect(round.audioConfig).toHaveProperty('melody');
      expect(round.audioConfig).toHaveProperty('tempo');
      expect(round.audioConfig).toHaveProperty('dynamics');
    });

    it('should generate analysis round correctly', () => {
      const round = generateRound('analysis', 1);
      
      expect(round.mode).toBe('analysis');
      // Analysis questions are emotion-specific, so check for common patterns
      expect(round.question).toMatch(/(What|How)/);
      expect(round.options).toHaveLength(4); // Analysis mode always has 4 options
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(round.options.length);
      expect(round.difficulty).toBe(1);
    });

    it('should generate different options for different difficulty levels in detection mode', () => {
      const round1 = generateRound('detection', 1);
      const round2 = generateRound('detection', 2);
      const round3 = generateRound('detection', 3);
      
      expect(round1.options).toHaveLength(3);
      expect(round2.options).toHaveLength(4);
      expect(round3.options).toHaveLength(6);
    });

    it('should always have 4 options in analysis mode regardless of difficulty', () => {
      const round1 = generateRound('analysis', 1);
      const round2 = generateRound('analysis', 2);
      const round3 = generateRound('analysis', 3);
      
      expect(round1.options).toHaveLength(4);
      expect(round2.options).toHaveLength(4);
      expect(round3.options).toHaveLength(4);
    });

    it('should throw error for invalid mode', () => {
      expect(() => generateRound('invalid', 1)).toThrow('Invalid mode or difficulty');
    });

    it('should handle high difficulty gracefully', () => {
      // The function should not throw for high difficulty, but use max available
      expect(() => generateRound('detection', 99)).not.toThrow();
    });

    it('should generate unique round IDs', () => {
      const round1 = generateRound('detection', 1);
      const round2 = generateRound('detection', 1);
      expect(round1.id).not.toBe(round2.id);
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answer', () => {
      expect(validateAnswer(2, 2)).toBe(true);
    });

    it('should reject incorrect answer', () => {
      expect(validateAnswer(1, 2)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for incorrect answer', () => {
      expect(calculateScore(false, 1000, 1)).toBe(0);
    });

    it('should calculate base score correctly', () => {
      // Base score + speed bonus (50 - 1 second) = 100 + 49 = 149
      expect(calculateScore(true, 1000, 1)).toBe(149);
      expect(calculateScore(true, 1000, 2)).toBe(249);
      expect(calculateScore(true, 1000, 3)).toBe(349);
    });

    it('should add speed bonus', () => {
      const fastScore = calculateScore(true, 500, 1);
      const slowScore = calculateScore(true, 2000, 1);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should add streak bonus', () => {
      const noStreakScore = calculateScore(true, 1000, 1, 0);
      const streakScore = calculateScore(true, 1000, 1, 5);
      expect(streakScore).toBeGreaterThan(noStreakScore);
    });

    it('should cap speed bonus at 50', () => {
      const instantScore = calculateScore(true, 0, 1);
      expect(instantScore).toBe(150); // 100 base + 50 speed
    });
  });

  describe('getScoreBreakdown', () => {
    it('should provide detailed breakdown for correct answer', () => {
      const breakdown = getScoreBreakdown(true, 1000, 2, 3);
      
      expect(breakdown.baseScore).toBe(200);
      expect(breakdown.speedBonus).toBeGreaterThanOrEqual(0);
      expect(breakdown.streakBonus).toBe(15);
      expect(breakdown.difficultyMultiplier).toBe(2);
      expect(breakdown.total).toBe(breakdown.baseScore + breakdown.speedBonus + breakdown.streakBonus);
    });

    it('should return zero breakdown for incorrect answer', () => {
      const breakdown = getScoreBreakdown(false, 1000, 2, 3);
      
      expect(breakdown.baseScore).toBe(0);
      expect(breakdown.speedBonus).toBe(0);
      expect(breakdown.streakBonus).toBe(0);
      expect(breakdown.total).toBe(0);
    });
  });

  describe('updateProgress', () => {
    let initialProgress: GameProgress;

    beforeEach(() => {
      initialProgress = {
        mode: 'detection',
        score: 0,
        round: 1,
        difficulty: 1,
        correctAnswers: 0,
        totalAnswers: 0,
        streak: 0,
        bestStreak: 0
      };
    });

    it('should update progress for correct answer', () => {
      const updated = updateProgress(initialProgress, true, 1000);
      
      expect(updated.correctAnswers).toBe(1);
      expect(updated.totalAnswers).toBe(1);
      expect(updated.streak).toBe(1);
      expect(updated.bestStreak).toBe(1);
      expect(updated.score).toBeGreaterThan(0);
    });

    it('should update progress for incorrect answer', () => {
      const updated = updateProgress(initialProgress, false, 1000);
      
      expect(updated.correctAnswers).toBe(0);
      expect(updated.totalAnswers).toBe(1);
      expect(updated.streak).toBe(0);
      expect(updated.bestStreak).toBe(0);
      expect(updated.score).toBe(0);
    });

    it('should reset streak on incorrect answer', () => {
      const withStreak = { ...initialProgress, streak: 5 };
      const updated = updateProgress(withStreak, false, 1000);
      
      expect(updated.streak).toBe(0);
    });

    it('should increase difficulty with high accuracy', () => {
      let progress = initialProgress;
      
      // Add 3 correct answers
      for (let i = 0; i < 3; i++) {
        progress = updateProgress(progress, true, 1000);
      }
      
      expect(progress.difficulty).toBe(2);
    });

    it('should decrease difficulty with low accuracy', () => {
      let progress = { ...initialProgress, difficulty: 2 };
      
      // Add 3 incorrect answers and 1 correct
      for (let i = 0; i < 4; i++) {
        progress = updateProgress(progress, i === 0, 1000);
      }
      
      expect(progress.difficulty).toBe(1);
    });
  });

  describe('getNextDifficulty', () => {
    it('should increase difficulty within bounds', () => {
      expect(getNextDifficulty('detection', 1)).toBe(2);
      expect(getNextDifficulty('detection', 2)).toBe(3);
    });

    it('should not exceed max difficulty', () => {
      expect(getNextDifficulty('detection', 3)).toBe(3);
    });
  });

  describe('getAudioParameters', () => {
    it('should return audio config for valid emotion', () => {
      const config = getAudioParameters('happy');
      
      expect(config).not.toBeNull();
      expect(config?.emotion).toBe('happy');
      expect(config?.melody).toEqual([262, 294, 330, 349, 392]);
      expect(config?.tempo).toBe(0.4);
      expect(config?.dynamics).toBe(0.35);
    });

    it('should return null for invalid emotion', () => {
      expect(getAudioParameters('invalid')).toBeNull();
    });
  });

  describe('getMaxDifficultyForMode', () => {
    it('should return max difficulty for valid mode', () => {
      expect(getMaxDifficultyForMode('detection')).toBe(3);
      expect(getMaxDifficultyForMode('analysis')).toBe(3);
    });

    it('should return 1 for invalid mode', () => {
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('isValidMode', () => {
    it('should validate correct modes', () => {
      expect(isValidMode('detection')).toBe(true);
      expect(isValidMode('analysis')).toBe(true);
    });

    it('should reject invalid modes', () => {
      expect(isValidMode('invalid')).toBe(false);
    });
  });

  describe('getAllModes', () => {
    it('should return all available modes', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(2);
      expect(modes[0].id).toBe('detection');
      expect(modes[1].id).toBe('analysis');
    });
  });

  describe('resetProgress', () => {
    it('should reset progress to initial state', () => {
      const reset = resetProgress('detection');
      
      expect(reset.mode).toBe('detection');
      expect(reset.score).toBe(0);
      expect(reset.round).toBe(1);
      expect(reset.difficulty).toBe(1);
      expect(reset.correctAnswers).toBe(0);
      expect(reset.totalAnswers).toBe(0);
      expect(reset.streak).toBe(0);
      expect(reset.bestStreak).toBe(0);
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
    it('should provide appropriate feedback', () => {
      expect(getPerformanceFeedback(95)).toContain('Outstanding');
      expect(getPerformanceFeedback(80)).toContain('Excellent');
      expect(getPerformanceFeedback(70)).toContain('Good job');
      expect(getPerformanceFeedback(50)).toContain('Nice try');
      expect(getPerformanceFeedback(30)).toContain('Keep practicing');
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full game flow', () => {
    // Start with detection mode
    let progress = resetProgress('detection');
    
    // Play 5 rounds
    for (let i = 0; i < 5; i++) {
      const round = generateRound(progress.mode, progress.difficulty);
      const correct = validateAnswer(round.correctAnswer, round.correctAnswer);
      progress = updateProgress(progress, correct, 1000);
    }
    
    expect(progress.totalAnswers).toBe(5);
    expect(progress.score).toBeGreaterThan(0);
    // Note: round is not automatically incremented in updateProgress
  });

  it('should handle mode switching', () => {
    // Play detection mode
    let progress = resetProgress('detection');
    const round1 = generateRound(progress.mode, progress.difficulty);
    progress = updateProgress(progress, true, 1000);
    
    // Switch to analysis mode
    progress = resetProgress('analysis');
    const round2 = generateRound(progress.mode, progress.difficulty);
    
    expect(round1.mode).toBe('detection');
    expect(round2.mode).toBe('analysis');
    expect(progress.mode).toBe('analysis');
  });

  it('should maintain audio consistency', () => {
    const round = generateRound('detection', 1);
    const audioParams = getAudioParameters(round.audioConfig.emotion);
    
    expect(audioParams?.emotion).toBe(round.audioConfig.emotion);
    expect(audioParams?.melody).toEqual(round.audioConfig.melody);
  });
});
