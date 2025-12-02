/**
 * Unit Tests for Dynamics Master Game
 * ID: dynamics-001
 * Testing all game modes and logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRound,
  validateAnswer,
  calculateScore,
  updateProgress,
  getNextDifficulty,
  shouldIncreaseDifficulty,
  shouldDecreaseDifficulty,
  getAudioParameters,
  GameProgress
} from '../lib/gameLogic/dynamics-001Logic';
import { getDifficultyForMode } from '../lib/gameLogic/dynamics-001Modes';

describe('Dynamics Master - Levels Mode', () => {
  it('should generate a valid levels round', () => {
    const round = generateRound('levels', 1);
    
    expect(round.mode).toBe('levels');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBeTruthy();
    expect(round.options).toHaveLength(2); // Beginner level has 2 options
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(round.options.length);
    expect(round.audioConfig.type).toBe('single');
    expect(round.audioConfig.dynamicLevel).toBeTruthy();
    expect(round.explanation).toBeTruthy();
  });

  it('should generate different dynamics for different difficulties', () => {
    const beginnerRound = generateRound('levels', 1);
    const advancedRound = generateRound('levels', 3);
    
    const beginnerDifficulty = getDifficultyForMode('levels', 1);
    const advancedDifficulty = getDifficultyForMode('levels', 3);
    
    expect(beginnerDifficulty?.parameters.dynamics).toHaveLength(2);
    expect(advancedDifficulty?.parameters.dynamics).toHaveLength(6);
  });

  it('should include correct dynamic level in options', () => {
    const round = generateRound('levels', 1);
    const correctOption = round.options[round.correctAnswer];
    
    expect(correctOption).toMatch(/^[PF]\s*-\s*.*$/); // Should match P or F format
  });
});

describe('Dynamics Master - Relative Mode', () => {
  it('should generate a valid relative round', () => {
    const round = generateRound('relative', 1);
    
    expect(round.mode).toBe('relative');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBe('Which phrase is louder?');
    expect(round.options).toEqual(['First phrase is louder', 'Second phrase is louder']);
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(2);
    expect(round.audioConfig.type).toBe('comparison');
    expect(round.audioConfig.volume1).toBeDefined();
    expect(round.audioConfig.volume2).toBeDefined();
    expect(round.explanation).toBeTruthy();
  });

  it('should have different volumes for comparison', () => {
    const round = generateRound('relative', 1);
    
    expect(round.audioConfig.volume1).not.toBe(round.audioConfig.volume2);
    expect(Math.abs((round.audioConfig.volume1 || 0) - (round.audioConfig.volume2 || 0))).toBeGreaterThan(0.1);
  });
});

describe('Dynamics Master - Changes Mode', () => {
  it('should generate a valid changes round', () => {
    const round = generateRound('changes', 1);
    
    expect(round.mode).toBe('changes');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBe('Listen to the music. Does it get louder or softer?');
    expect(round.options).toEqual(['Gets louder (crescendo)', 'Gets softer (diminuendo)']);
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(2);
    expect(round.audioConfig.type).toBe('progression');
    expect(round.audioConfig.direction).toMatch(/^(crescendo|diminuendo)$/);
    expect(round.explanation).toBeTruthy();
  });

  it('should generate both crescendo and diminuendo', () => {
    const rounds = Array.from({ length: 10 }, () => generateRound('changes', 1));
    const crescendos = rounds.filter(r => r.audioConfig.direction === 'crescendo');
    const diminuendos = rounds.filter(r => r.audioConfig.direction === 'diminuendo');
    
    expect(crescendos.length).toBeGreaterThan(0);
    expect(diminuendos.length).toBeGreaterThan(0);
  });
});

describe('Dynamics Master - Pulse Mode', () => {
  it('should generate a valid pulse round', () => {
    const round = generateRound('pulse', 1);
    
    expect(round.mode).toBe('pulse');
    expect(round.difficulty).toBe(1);
    expect(round.question).toBe('Listen to the music and select the correct articulation style.');
    expect(round.options).toHaveLength(2); // Beginner level has 2 options
    expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.correctAnswer).toBeLessThan(round.options.length);
    expect(round.audioConfig.type).toBe('articulation');
    expect(round.audioConfig.articulation).toBeTruthy();
    expect(round.explanation).toBeTruthy();
  });

  it('should include correct articulation in options', () => {
    const round = generateRound('pulse', 1);
    const correctOption = round.options[round.correctAnswer];
    
    expect(['Staccato', 'Legato']).toContain(correctOption);
  });
});

describe('Dynamics Master - Answer Validation', () => {
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

describe('Dynamics Master - Score Calculation', () => {
  it('should calculate score for correct answers', () => {
    const score1 = calculateScore(true, 5000, 1); // 5 seconds, difficulty 1
    const score2 = calculateScore(true, 3000, 2); // 3 seconds, difficulty 2
    const score3 = calculateScore(true, 1000, 3); // 1 second, difficulty 3
    
    expect(score1).toBeGreaterThan(0);
    expect(score2).toBeGreaterThan(score1);
    expect(score3).toBeGreaterThan(score2);
  });

  it('should return 0 for incorrect answers', () => {
    expect(calculateScore(false, 5000, 1)).toBe(0);
    expect(calculateScore(false, 1000, 3)).toBe(0);
  });

  it('should calculate score based on difficulty multiplier', () => {
    // The implementation uses difficulty as a multiplier (no time bonus)
    const score1 = calculateScore(true, 1000, 1);
    const score2 = calculateScore(true, 1000, 2);
    const score3 = calculateScore(true, 1000, 3);
    
    expect(score1).toBe(100); // 100 * 1
    expect(score2).toBe(200); // 100 * 2
    expect(score3).toBe(300); // 100 * 3
  });
});

describe('Dynamics Master - Progress Tracking', () => {
  let initialProgress: GameProgress;

  beforeEach(() => {
    initialProgress = {
      mode: 'levels',
      score: 100,
      roundsCompleted: 5,
      currentDifficulty: 1,
      correctAnswers: 4,
      totalAnswers: 5,
      averageTime: 3000,
      bestScore: 150
    };
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
      score: 200 // New best score
    });

    expect(updated.bestScore).toBe(200);
  });
});

describe('Dynamics Master - Difficulty Progression', () => {
  let goodProgress: GameProgress;
  let poorProgress: GameProgress;

  beforeEach(() => {
    goodProgress = {
      mode: 'levels',
      score: 500,
      roundsCompleted: 10,
      currentDifficulty: 2,
      correctAnswers: 9,
      totalAnswers: 10,
      averageTime: 2500,
      bestScore: 180
    };

    poorProgress = {
      mode: 'levels',
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
      totalAnswers: 10 // 60% accuracy
    };

    expect(shouldIncreaseDifficulty(averageProgress)).toBe(false);
    expect(shouldDecreaseDifficulty(averageProgress)).toBe(false);
    expect(getNextDifficulty(2, averageProgress, 3)).toBe(2);
  });
});

describe('Dynamics Master - Audio Parameters', () => {
  it('should generate parameters for single tone', () => {
    const config = {
      type: 'single' as const,
      dynamicLevel: 'f',
      notes: [262, 330],
      duration: 2.0
    };

    const parameters = getAudioParameters(config);

    expect(parameters).toHaveLength(2);
    expect(parameters[0].frequency).toBe(262);
    expect(parameters[0].duration).toBe(2.0);
    expect(parameters[0].volume).toBe(0.7); // forte value
  });

  it('should generate parameters for comparison (first phrase)', () => {
    // The implementation returns only the first phrase parameters
    // The component handles the second phrase separately
    const config = {
      type: 'comparison' as const,
      volume1: 0.3,
      volume2: 0.7,
      notes: [440],
      duration: 1.5
    };

    const parameters = getAudioParameters(config);

    expect(parameters).toHaveLength(1);
    expect(parameters[0].volume).toBe(0.3); // First phrase volume
  });

  it('should generate parameters for articulation', () => {
    const config = {
      type: 'articulation' as const,
      articulation: 'staccato',
      notes: [262, 330, 392],
      duration: 0.3
    };

    const parameters = getAudioParameters(config);

    expect(parameters).toHaveLength(3);
    expect(parameters[0].articulation).toBe('staccato');
    expect(parameters[0].duration).toBe(0.3);
  });

  it('should handle missing notes gracefully', () => {
    const config = {
      type: 'single' as const,
      dynamicLevel: 'p'
    };

    const parameters = getAudioParameters(config);

    expect(parameters).toHaveLength(1);
    expect(parameters[0].frequency).toBe(440); // Default A4
    expect(parameters[0].duration).toBe(1.0); // Default duration
  });
});

describe('Dynamics Master - Edge Cases', () => {
  it('should handle unknown mode gracefully', () => {
    expect(() => generateRound('unknown', 1)).toThrow('Unknown mode: unknown');
  });

  it('should handle zero time spent', () => {
    const score = calculateScore(true, 0, 1);
    // No time bonus in implementation, just base score * difficulty
    expect(score).toBe(100);
  });

  it('should handle very high time spent', () => {
    const score = calculateScore(true, 100000, 1); // 100 seconds
    expect(score).toBe(100); // Base score only
  });

  it('should handle empty progress correctly', () => {
    const emptyProgress: GameProgress = {
      mode: 'levels',
      score: 0,
      roundsCompleted: 0,
      currentDifficulty: 1,
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      bestScore: 0
    };

    expect(shouldIncreaseDifficulty(emptyProgress)).toBe(false);
    expect(shouldDecreaseDifficulty(emptyProgress)).toBe(false);
  });
});
