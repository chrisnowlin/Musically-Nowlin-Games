import { describe, it, expect } from 'vitest';
import { 
  generateRound, 
  validateAnswer, 
  calculateScore, 
  calculateMasteryProgress, 
  getAccuracy,
  shouldIncreaseDifficulty,
  shouldDecreaseDifficulty
} from '../lib/gameLogic/challenge-001Logic';
import { 
  challenge001Modes,
  getChallenge001Mode,
  getModeTimeLimit,
  getModeScoringMultiplier 
} from '../lib/gameLogic/challenge-001Modes';

describe('challenge-001 modes', () => {
  it('has all required modes', () => {
    expect(challenge001Modes).toHaveLength(3);
    const modeIds = challenge001Modes.map(m => m.id);
    expect(modeIds).toContain('speed-challenges');
    expect(modeIds).toContain('progressive-mastery');
    expect(modeIds).toContain('competitive-play');
  });

  it('speed-challenges mode has correct configuration', () => {
    const mode = getChallenge001Mode('speed-challenges');
    expect(mode).toBeDefined();
    expect(mode?.timeLimit).toBe(10);
    expect(mode?.scoringMultiplier).toBe(1.5);
    expect(mode?.label).toBe('Speed Challenges');
    expect(mode?.emoji).toBe('⚡');
  });

  it('progressive-mastery mode has correct configuration', () => {
    const mode = getChallenge001Mode('progressive-mastery');
    expect(mode).toBeDefined();
    expect(mode?.timeLimit).toBe(20);
    expect(mode?.scoringMultiplier).toBe(1.0);
    expect(mode?.label).toBe('Progressive Mastery');
    expect(mode?.emoji).toBe('📈');
  });

  it('competitive-play mode has correct configuration', () => {
    const mode = getChallenge001Mode('competitive-play');
    expect(mode).toBeDefined();
    expect(mode?.timeLimit).toBe(15);
    expect(mode?.scoringMultiplier).toBe(1.2);
    expect(mode?.label).toBe('Competitive Play');
    expect(mode?.emoji).toBe('🏆');
  });

  it('utility functions work correctly', () => {
    expect(getModeTimeLimit('speed-challenges')).toBe(10);
    expect(getModeTimeLimit('progressive-mastery')).toBe(20);
    expect(getModeTimeLimit('competitive-play')).toBe(15);
    
    expect(getModeScoringMultiplier('speed-challenges')).toBe(1.5);
    expect(getModeScoringMultiplier('progressive-mastery')).toBe(1.0);
    expect(getModeScoringMultiplier('competitive-play')).toBe(1.2);
  });
});

describe('challenge-001 logic', () => {
  it('generateRound creates valid round for speed-challenges mode', () => {
    const round = generateRound('speed-challenges', 1);
    expect(round.mode).toBe('speed-challenges');
    expect(round.timeLimit).toBe(10);
    expect(round.question).toBeDefined();
    expect(round.question.options).toHaveLength(4);
    expect(round.question.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(round.question.correctAnswer).toBeLessThan(4);
    expect(round.question.difficulty).toBeGreaterThanOrEqual(1);
    expect(round.question.difficulty).toBeLessThanOrEqual(3);
  });

  it('generateRound creates valid round for progressive-mastery mode', () => {
    const round = generateRound('progressive-mastery', 5);
    expect(round.mode).toBe('progressive-mastery');
    expect(round.timeLimit).toBe(20);
    expect(round.question.difficulty).toBeGreaterThanOrEqual(1);
    expect(round.question.difficulty).toBeLessThanOrEqual(3);
  });

  it('generateRound creates valid round for competitive-play mode', () => {
    const round = generateRound('competitive-play', 3);
    expect(round.mode).toBe('competitive-play');
    expect(round.timeLimit).toBe(15);
    expect(round.question.difficulty).toBeGreaterThanOrEqual(1);
    expect(round.question.difficulty).toBeLessThanOrEqual(3);
  });

  it('validateAnswer works correctly', () => {
    expect(validateAnswer(0, 0)).toBe(true);
    expect(validateAnswer(1, 0)).toBe(false);
    expect(validateAnswer(2, 2)).toBe(true);
    expect(validateAnswer(3, 1)).toBe(false);
  });

  it('calculateScore returns 0 for incorrect answers', () => {
    const score = calculateScore(false, 5, 10, 2, 0, 'speed-challenges');
    expect(score.totalScore).toBe(0);
    expect(score.baseScore).toBe(0);
    expect(score.speedBonus).toBe(0);
    expect(score.streakBonus).toBe(0);
    expect(score.difficultyBonus).toBe(0);
  });

  it('calculateScore calculates correct score for speed-challenges', () => {
    const score = calculateScore(true, 3, 10, 2, 3, 'speed-challenges');
    expect(score.baseScore).toBe(20); // 10 * difficulty
    expect(score.speedBonus).toBeGreaterThan(0); // (10-3) * 2 = 14
    expect(score.streakBonus).toBe(6); // 3 * 2
    expect(score.difficultyBonus).toBe(10); // 2 * 5
    expect(score.modeMultiplier).toBe(1.5);
    expect(score.totalScore).toBe(Math.round((20 + 14 + 6 + 10) * 1.5));
  });

  it('calculateScore calculates correct score for progressive-mastery', () => {
    const score = calculateScore(true, 10, 20, 1, 0, 'progressive-mastery');
    expect(score.baseScore).toBe(10); // 10 * difficulty
    expect(score.speedBonus).toBeGreaterThan(0); // (20-10) * 2 = 20
    expect(score.streakBonus).toBe(0); // no streak
    expect(score.difficultyBonus).toBe(5); // 1 * 5
    expect(score.modeMultiplier).toBe(1.0);
    expect(score.totalScore).toBe(10 + 20 + 0 + 5);
  });

  it('calculateScore calculates correct score for competitive-play', () => {
    const score = calculateScore(true, 5, 15, 3, 2, 'competitive-play');
    expect(score.baseScore).toBe(30); // 10 * difficulty
    expect(score.speedBonus).toBeGreaterThan(0); // (15-5) * 2 = 20
    expect(score.streakBonus).toBe(4); // 2 * 2
    expect(score.difficultyBonus).toBe(15); // 3 * 5
    expect(score.modeMultiplier).toBe(1.2);
    expect(score.totalScore).toBe(Math.round((30 + 20 + 4 + 15) * 1.2));
  });

  it('calculateMasteryProgress increases for correct answers', () => {
    const newLevel = calculateMasteryProgress(true, 3, 2);
    expect(newLevel).toBeGreaterThan(3);
    expect(newLevel).toBeLessThanOrEqual(9);
  });

  it('calculateMasteryProgress decreases for incorrect answers', () => {
    const newLevel = calculateMasteryProgress(false, 5, 2);
    expect(newLevel).toBeLessThan(5);
    expect(newLevel).toBeGreaterThanOrEqual(1);
  });

  it('calculateMasteryProgress caps at maximum', () => {
    const newLevel = calculateMasteryProgress(true, 8.5, 3);
    expect(newLevel).toBeLessThanOrEqual(9);
  });

  it('getAccuracy calculates correctly', () => {
    expect(getAccuracy(8, 10)).toBe(80);
    expect(getAccuracy(5, 10)).toBe(50);
    expect(getAccuracy(0, 0)).toBe(0);
    expect(getAccuracy(10, 10)).toBe(100);
  });

  it('shouldIncreaseDifficulty works correctly', () => {
    expect(shouldIncreaseDifficulty(85, 1, 3)).toBe(true);
    expect(shouldIncreaseDifficulty(80, 1, 3)).toBe(true);
    expect(shouldIncreaseDifficulty(79, 1, 3)).toBe(false);
    expect(shouldIncreaseDifficulty(90, 3, 3)).toBe(false); // at max
  });

  it('shouldDecreaseDifficulty works correctly', () => {
    expect(shouldDecreaseDifficulty(50, 3, 1)).toBe(true);
    expect(shouldDecreaseDifficulty(59, 3, 1)).toBe(true);
    expect(shouldDecreaseDifficulty(60, 3, 1)).toBe(false);
    expect(shouldDecreaseDifficulty(30, 1, 1)).toBe(false); // at min
  });
});

describe('challenge-001 difficulty progression', () => {
  it('speed-challenges difficulty range works correctly', () => {
    const mode = getChallenge001Mode('speed-challenges');
    expect(mode).toBeDefined();
    
    // Level 1-3: difficulty 1
    expect(mode!.difficultyCurve(1)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    expect(mode!.difficultyCurve(2)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    expect(mode!.difficultyCurve(3)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    
    // Level 4-6: difficulty 2
    expect(mode!.difficultyCurve(4)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(5)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(6)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    
    // Level 7-9: difficulty 3
    expect(mode!.difficultyCurve(7)).toEqual({ minDifficulty: 1, maxDifficulty: 3 });
    expect(mode!.difficultyCurve(8)).toEqual({ minDifficulty: 1, maxDifficulty: 3 });
    expect(mode!.difficultyCurve(9)).toEqual({ minDifficulty: 1, maxDifficulty: 3 });
  });

  it('progressive-mastery difficulty range works correctly', () => {
    const mode = getChallenge001Mode('progressive-mastery');
    expect(mode).toBeDefined();
    
    // Level 1-3: difficulty 1
    expect(mode!.difficultyCurve(1)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    expect(mode!.difficultyCurve(2)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    expect(mode!.difficultyCurve(3)).toEqual({ minDifficulty: 1, maxDifficulty: 1 });
    
    // Level 4-6: difficulty 2
    expect(mode!.difficultyCurve(4)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(5)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(6)).toEqual({ minDifficulty: 2, maxDifficulty: 2 });
    
    // Level 7-9: difficulty 3
    expect(mode!.difficultyCurve(7)).toEqual({ minDifficulty: 2, maxDifficulty: 3 });
    expect(mode!.difficultyCurve(8)).toEqual({ minDifficulty: 2, maxDifficulty: 3 });
    expect(mode!.difficultyCurve(9)).toEqual({ minDifficulty: 3, maxDifficulty: 3 });
  });

  it('competitive-play difficulty range works correctly', () => {
    const mode = getChallenge001Mode('competitive-play');
    expect(mode).toBeDefined();
    
    // Level 1-2: difficulty 1-2
    expect(mode!.difficultyCurve(1)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(2)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    
    // Level 3-4: difficulty 1-2
    expect(mode!.difficultyCurve(3)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    expect(mode!.difficultyCurve(4)).toEqual({ minDifficulty: 1, maxDifficulty: 2 });
    
    // Level 5+: difficulty 3
    expect(mode!.difficultyCurve(5)).toEqual({ minDifficulty: 2, maxDifficulty: 3 });
    expect(mode!.difficultyCurve(9)).toEqual({ minDifficulty: 2, maxDifficulty: 3 });
  });
});

describe('challenge-001 question categories', () => {
  it('generates questions from different categories', () => {
    const categories = new Set();
    
    // Generate multiple rounds to test category distribution
    for (let i = 0; i < 20; i++) {
      const round = generateRound('speed-challenges', 1);
      categories.add(round.question.category);
    }
    
    // Should have questions from multiple categories
    expect(categories.size).toBeGreaterThan(1);
    // Note: Due to random selection, we might not get all categories in 20 draws
    expect(categories.has('rhythm') || categories.has('pitch') || categories.has('dynamics') || categories.has('theory')).toBe(true);
  });

  it('difficulty levels are distributed correctly', () => {
    const difficulties: number[] = [];
    
    for (let i = 0; i < 30; i++) {
      const round = generateRound('speed-challenges', 5);
      difficulties.push(round.question.difficulty);
    }
    
    // Should have a mix of difficulties
    const uniqueDifficulties = Array.from(new Set(difficulties));
    expect(uniqueDifficulties.length).toBeGreaterThan(1);
    expect(difficulties.every(d => d >= 1 && d <= 3)).toBe(true);
  });
});