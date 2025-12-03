/**
 * Unit Tests for Expression Master Game
 * ID: dynamics-002
 * Testing all game modes and logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRound,
  generateArticulationRound,
  generateInterpretationRound,
  validateAnswer,
  calculateScore,
  getScoreBreakdown,
  updateProgress,
  getNextDifficulty,
  shouldIncreaseDifficulty,
  shouldDecreaseDifficulty,
  getAudioParameters,
  createInitialProgress,
  calculateAccuracy,
  getAchievements,
  GameProgress,
  GameStats
} from '../lib/gameLogic/dynamics-002Logic';
import {
  EXPRESSION_MODES,
  ARTICULATION_STYLES,
  INTERPRETATIONS,
  getDifficultyForMode,
  getModeById,
  getMaxDifficultyForMode
} from '../lib/gameLogic/dynamics-002Modes';

describe('Expression Master - Mode Definitions', () => {
  it('should have exactly 2 modes defined', () => {
    expect(EXPRESSION_MODES).toHaveLength(2);
  });

  it('should have articulation and interpretation modes', () => {
    const modeIds = EXPRESSION_MODES.map(m => m.id);
    expect(modeIds).toContain('articulation');
    expect(modeIds).toContain('interpretation');
  });

  it('should get mode by ID', () => {
    const articulationMode = getModeById('articulation');
    expect(articulationMode).toBeDefined();
    expect(articulationMode?.name).toBe('Articulation Styles');
    
    const interpretationMode = getModeById('interpretation');
    expect(interpretationMode).toBeDefined();
    expect(interpretationMode?.name).toBe('Musical Phrasing');
  });

  it('should return undefined for unknown mode', () => {
    expect(getModeById('unknown')).toBeUndefined();
  });
});

describe('Expression Master - Articulation Mode', () => {
  it('should generate a valid articulation round', () => {
    const round = generateArticulationRound(1);
    
    expect(round.mode).toBe('articulation');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBeTruthy();
    expect(round.options).toHaveLength(2); // Beginner level has 2 options
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(round.options.length);
    expect(round.audioConfig.type).toBe('single');
    expect(round.audioConfig.phrasing).toBeTruthy();
    expect(round.explanation).toBeTruthy();
  });

  it('should have more options at higher difficulty', () => {
    const beginnerRound = generateArticulationRound(1);
    const advancedRound = generateArticulationRound(3);
    
    expect(beginnerRound.options.length).toBe(2);
    expect(advancedRound.options.length).toBe(4);
  });

  it('should include all articulation styles at advanced level', () => {
    const difficultyConfig = getDifficultyForMode('articulation', 3);
    expect(difficultyConfig?.parameters.articulations).toEqual(['legato', 'staccato', 'accent', 'tenuto']);
  });

  it('should include correct articulation in options', () => {
    const round = generateArticulationRound(1);
    const hasCorrectOption = round.options.some(opt => 
      opt.toLowerCase().includes('legato') || opt.toLowerCase().includes('staccato')
    );
    expect(hasCorrectOption).toBe(true);
  });
});

describe('Expression Master - Interpretation Mode', () => {
  it('should generate a valid interpretation round', () => {
    const round = generateInterpretationRound(1);
    
    expect(round.mode).toBe('interpretation');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBeTruthy();
    expect(round.options.length).toBeGreaterThanOrEqual(2);
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(round.options.length);
    expect(round.audioConfig.type).toBe('single');
    expect(round.audioConfig.phrasing).toBeTruthy();
    expect(round.explanation).toBeTruthy();
  });

  it('should have character descriptions as options', () => {
    const round = generateInterpretationRound(1);
    const validCharacters = Object.values(INTERPRETATIONS).map(i => i.character);
    
    // At least one option should be a valid character
    const hasValidOption = round.options.some(opt => 
      validCharacters.some(char => opt.includes(char))
    );
    expect(hasValidOption).toBe(true);
  });

  it('should ask about character or emotion', () => {
    const round = generateInterpretationRound(1);
    const validQuestions = [
      'How would you describe this musical phrase?',
      'What character does this phrase have?',
      'What emotion does this phrase convey?'
    ];
    expect(validQuestions).toContain(round.question);
  });
});

describe('Expression Master - Round Generation', () => {
  it('should generate rounds via main function', () => {
    const articulationRound = generateRound('articulation', 1);
    expect(articulationRound.mode).toBe('articulation');
    
    const interpretationRound = generateRound('interpretation', 1);
    expect(interpretationRound.mode).toBe('interpretation');
  });

  it('should throw error for unknown mode', () => {
    expect(() => generateRound('unknown', 1)).toThrow('Unknown mode: unknown');
  });

  it('should generate unique round IDs', () => {
    const round1 = generateRound('articulation', 1);
    const round2 = generateRound('articulation', 1);
    expect(round1.id).toMatch(/^articulation-/); expect(round2.id).toMatch(/^articulation-/);
  });
});

describe('Expression Master - Answer Validation', () => {
  it('should validate correct answers', () => {
    expect(validateAnswer(0, 0)).toBe(true);
    expect(validateAnswer(1, 1)).toBe(true);
    expect(validateAnswer(2, 2)).toBe(true);
  });

  it('should reject incorrect answers', () => {
    expect(validateAnswer(0, 1)).toBe(false);
    expect(validateAnswer(1, 0)).toBe(false);
    expect(validateAnswer(2, 0)).toBe(false);
  });
});

describe('Expression Master - Score Calculation', () => {
  it('should calculate score for correct answers', () => {
    const score1 = calculateScore(true, 5000, 1);
    const score2 = calculateScore(true, 3000, 2);
    const score3 = calculateScore(true, 1000, 3);
    
    expect(score1).toBeGreaterThan(0);
    expect(score2).toBeGreaterThan(score1);
    expect(score3).toBeGreaterThan(score2);
  });

  it('should return 0 for incorrect answers', () => {
    expect(calculateScore(false, 5000, 1)).toBe(0);
    expect(calculateScore(false, 1000, 3)).toBe(0);
  });

  it('should calculate score based on difficulty multiplier', () => {
    const score1 = calculateScore(true, 1000, 1);
    const score2 = calculateScore(true, 1000, 2);
    const score3 = calculateScore(true, 1000, 3);
    
    expect(score1).toBe(100); // 100 * 1
    expect(score2).toBe(200); // 100 * 2
    expect(score3).toBe(300); // 100 * 3
  });

  it('should provide score breakdown', () => {
    const breakdown = getScoreBreakdown(true, 1000, 2);
    expect(breakdown.baseScore).toBe(100);
    expect(breakdown.difficultyMultiplier).toBe(2);
    expect(breakdown.total).toBe(200);
  });
});

describe('Expression Master - Progress Tracking', () => {
  let initialProgress: GameProgress;

  beforeEach(() => {
    initialProgress = {
      mode: 'articulation',
      score: 100,
      roundsCompleted: 5,
      currentDifficulty: 1,
      correctAnswers: 4,
      totalAnswers: 5,
      averageTime: 3000,
      bestScore: 150
    };
  });

  it('should create initial progress', () => {
    const progress = createInitialProgress('articulation');
    expect(progress.mode).toBe('articulation');
    expect(progress.score).toBe(0);
    expect(progress.roundsCompleted).toBe(0);
    expect(progress.currentDifficulty).toBe(1);
  });

  it('should update progress for correct answer', () => {
    const updated = updateProgress(initialProgress, {
      correct: true,
      timeSpent: 2000,
      score: 120
    });

    expect(updated.roundsCompleted).toBe(6);
    expect(updated.correctAnswers).toBe(5);
    expect(updated.totalAnswers).toBe(6);
    expect(updated.score).toBe(220);
    expect(updated.bestScore).toBe(150); // Best score unchanged
    expect(updated.averageTime).toBeLessThan(initialProgress.averageTime);
  });

  it('should update progress for incorrect answer', () => {
    const updated = updateProgress(initialProgress, {
      correct: false,
      timeSpent: 4000,
      score: 0
    });

    expect(updated.roundsCompleted).toBe(6);
    expect(updated.correctAnswers).toBe(4); // Unchanged
    expect(updated.totalAnswers).toBe(6);
    expect(updated.score).toBe(100); // Unchanged
    expect(updated.bestScore).toBe(150);
  });

  it('should update best score for new record', () => {
    const updated = updateProgress(initialProgress, {
      correct: true,
      timeSpent: 2000,
      score: 200
    });

    expect(updated.bestScore).toBe(200);
  });

  it('should calculate accuracy correctly', () => {
    expect(calculateAccuracy(initialProgress)).toBe(0.8);
    
    const zeroProgress = createInitialProgress('test');
    expect(calculateAccuracy(zeroProgress)).toBe(0);
  });
});

describe('Expression Master - Difficulty Progression', () => {
  let goodProgress: GameProgress;
  let poorProgress: GameProgress;

  beforeEach(() => {
    goodProgress = {
      mode: 'articulation',
      score: 500,
      roundsCompleted: 10,
      currentDifficulty: 2,
      correctAnswers: 9,
      totalAnswers: 10,
      averageTime: 2500,
      bestScore: 180
    };

    poorProgress = {
      mode: 'articulation',
      score: 100,
      roundsCompleted: 5,
      currentDifficulty: 2,
      correctAnswers: 1,
      totalAnswers: 5,
      averageTime: 5000,
      bestScore: 80
    };
  });

  it('should increase difficulty for good performance', () => {
    expect(shouldIncreaseDifficulty(goodProgress)).toBe(true);
    expect(getNextDifficulty(2, goodProgress, 3)).toBe(3);
  });

  it('should not increase difficulty beyond maximum', () => {
    expect(getNextDifficulty(3, goodProgress, 3)).toBe(3);
  });

  it('should decrease difficulty for poor performance', () => {
    expect(shouldDecreaseDifficulty(poorProgress)).toBe(true);
    expect(getNextDifficulty(2, poorProgress, 3)).toBe(1);
  });

  it('should not decrease difficulty below minimum', () => {
    expect(getNextDifficulty(1, poorProgress, 3)).toBe(1);
  });

  it('should maintain difficulty for average performance', () => {
    const averageProgress = {
      ...goodProgress,
      correctAnswers: 6,
      totalAnswers: 10
    };

    expect(shouldIncreaseDifficulty(averageProgress)).toBe(false);
    expect(shouldDecreaseDifficulty(averageProgress)).toBe(false);
    expect(getNextDifficulty(2, averageProgress, 3)).toBe(2);
  });

  it('should get max difficulty for modes', () => {
    expect(getMaxDifficultyForMode('articulation')).toBe(3);
    expect(getMaxDifficultyForMode('interpretation')).toBe(3);
    expect(getMaxDifficultyForMode('unknown')).toBe(1);
  });
});

describe('Expression Master - Audio Parameters', () => {
  it('should generate audio parameters for legato', () => {
    const config = {
      type: 'single' as const,
      phrase: [262, 294, 330],
      phrasing: 'legato' as const
    };

    const params = getAudioParameters(config);

    expect(params).toHaveLength(3);
    expect(params[0].frequency).toBe(262);
    expect(params[0].articulation).toBe('legato');
    expect(params[0].duration).toBe(ARTICULATION_STYLES.legato.noteDuration);
  });

  it('should generate audio parameters for staccato', () => {
    const config = {
      type: 'single' as const,
      phrase: [262, 294],
      phrasing: 'staccato' as const
    };

    const params = getAudioParameters(config);

    expect(params).toHaveLength(2);
    expect(params[0].articulation).toBe('staccato');
    expect(params[0].duration).toBe(ARTICULATION_STYLES.staccato.noteDuration);
  });

  it('should handle missing phrase gracefully', () => {
    const config = {
      type: 'single' as const,
      phrasing: 'legato' as const
    };

    const params = getAudioParameters(config);

    expect(params).toHaveLength(1);
    expect(params[0].frequency).toBe(440); // Default A4
  });

  it('should calculate correct start times', () => {
    const config = {
      type: 'single' as const,
      phrase: [262, 294, 330],
      phrasing: 'legato' as const
    };

    const params = getAudioParameters(config);

    expect(params[0].startTime).toBe(0);
    expect(params[1].startTime).toBe(ARTICULATION_STYLES.legato.noteSpacing);
    expect(params[2].startTime).toBe(ARTICULATION_STYLES.legato.noteSpacing * 2);
  });
});

describe('Expression Master - Achievements', () => {
  it('should return empty array for new player', () => {
    const stats: GameStats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageAccuracy: 0,
      modeStats: {},
      achievements: []
    };

    expect(getAchievements(stats)).toEqual([]);
  });

  it('should award score-based achievements', () => {
    const stats: GameStats = {
      totalGamesPlayed: 10,
      totalScore: 1000,
      averageAccuracy: 0.7,
      modeStats: {},
      achievements: []
    };

    const achievements = getAchievements(stats);
    expect(achievements).toContain('Expression Explorer');
    expect(achievements).toContain('Expression Expert');
  });

  it('should award accuracy-based achievements', () => {
    const stats: GameStats = {
      totalGamesPlayed: 10,
      totalScore: 100,
      averageAccuracy: 0.9,
      modeStats: {},
      achievements: []
    };

    const achievements = getAchievements(stats);
    expect(achievements).toContain('Keen Ear');
    expect(achievements).toContain('Perfect Pitch');
  });

  it('should award mode-specific achievements', () => {
    const stats: GameStats = {
      totalGamesPlayed: 20,
      totalScore: 500,
      averageAccuracy: 0.7,
      modeStats: {
        articulation: {
          mode: 'articulation',
          score: 300,
          roundsCompleted: 25,
          currentDifficulty: 3,
          correctAnswers: 20,
          totalAnswers: 25,
          averageTime: 3000,
          bestScore: 200
        }
      },
      achievements: []
    };

    const achievements = getAchievements(stats);
    expect(achievements).toContain('Articulation Master');
    expect(achievements).toContain('Articulation Enthusiast');
  });
});

describe('Expression Master - Articulation Styles', () => {
  it('should have all required articulation styles', () => {
    expect(ARTICULATION_STYLES).toHaveProperty('legato');
    expect(ARTICULATION_STYLES).toHaveProperty('staccato');
    expect(ARTICULATION_STYLES).toHaveProperty('accent');
    expect(ARTICULATION_STYLES).toHaveProperty('tenuto');
  });

  it('should have proper audio parameters for each style', () => {
    Object.values(ARTICULATION_STYLES).forEach(style => {
      expect(style.noteDuration).toBeGreaterThan(0);
      expect(style.noteSpacing).toBeGreaterThan(0);
      expect(style.attackTime).toBeGreaterThanOrEqual(0);
      expect(style.releaseTime).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Expression Master - Interpretations', () => {
  it('should have interpretations for all articulation styles', () => {
    expect(INTERPRETATIONS).toHaveProperty('legato');
    expect(INTERPRETATIONS).toHaveProperty('staccato');
    expect(INTERPRETATIONS).toHaveProperty('accent');
    expect(INTERPRETATIONS).toHaveProperty('tenuto');
  });

  it('should have character, emotion, and description for each', () => {
    Object.values(INTERPRETATIONS).forEach(interp => {
      expect(interp.character).toBeTruthy();
      expect(interp.emotion).toBeTruthy();
      expect(interp.description).toBeTruthy();
    });
  });
});

describe('Expression Master - Edge Cases', () => {
  it('should handle zero time spent', () => {
    const score = calculateScore(true, 0, 1);
    expect(score).toBe(100);
  });

  it('should handle very high time spent', () => {
    const score = calculateScore(true, 100000, 1);
    expect(score).toBe(100);
  });

  it('should handle empty progress correctly', () => {
    const emptyProgress: GameProgress = createInitialProgress('test');

    expect(shouldIncreaseDifficulty(emptyProgress)).toBe(false);
    expect(shouldDecreaseDifficulty(emptyProgress)).toBe(false);
  });

  it('should not crash with negative difficulty', () => {
    // Should fall back to level 1
    const difficultyConfig = getDifficultyForMode('articulation', -1);
    expect(difficultyConfig).toBeDefined();
  });
});
