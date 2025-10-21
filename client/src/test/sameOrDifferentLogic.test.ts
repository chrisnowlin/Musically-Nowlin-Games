import { describe, it, expect } from 'vitest';
import {
  generateSameOrDifferentRound,
  validateSameOrDifferentAnswer,
  calculateSameOrDifferentScore,
  type SameOrDifferentRound,
} from '../lib/sameOrDifferentLogic';
import { ANIMAL_CHARACTERS, MUSICAL_NOTES } from '../lib/schema';

describe('Same or Different Logic - generateSameOrDifferentRound', () => {
  it('should generate a round with two phrases', () => {
    const round = generateSameOrDifferentRound();
    expect(round.phrase1).toBeDefined();
    expect(round.phrase2).toBeDefined();
    expect(Array.isArray(round.phrase1)).toBe(true);
    expect(Array.isArray(round.phrase2)).toBe(true);
  });

  it('should generate phrases with valid frequencies from MUSICAL_NOTES', () => {
    const round = generateSameOrDifferentRound();
    const validFrequencies = MUSICAL_NOTES.map(note => note.frequency);

    round.phrase1.forEach(freq => {
      expect(validFrequencies).toContain(freq);
    });

    round.phrase2.forEach(freq => {
      expect(validFrequencies).toContain(freq);
    });
  });

  it('should have matching duration and dynamics arrays', () => {
    const round = generateSameOrDifferentRound();

    expect(round.phraseDurations1.length).toBe(round.phrase1.length);
    expect(round.phraseDurations2.length).toBe(round.phrase2.length);
    expect(round.dynamics1.length).toBe(round.phrase1.length);
    expect(round.dynamics2.length).toBe(round.phrase2.length);
  });

  it('should have valid dynamics values between 0 and 1', () => {
    const round = generateSameOrDifferentRound();

    round.dynamics1.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    });

    round.dynamics2.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    });
  });

  it('should have positive duration values', () => {
    const round = generateSameOrDifferentRound();

    round.phraseDurations1.forEach(d => {
      expect(d).toBeGreaterThan(0);
    });

    round.phraseDurations2.forEach(d => {
      expect(d).toBeGreaterThan(0);
    });
  });

  it('should assign consistent character positions', () => {
    const round = generateSameOrDifferentRound();
    expect(round.character1.name).toBe('Ellie Elephant');
    expect(round.character2.name).toBe('Gary Giraffe');
  });

  it('should have isDifferent flag set to boolean', () => {
    const round = generateSameOrDifferentRound();
    expect(typeof round.isDifferent).toBe('boolean');
  });

  it('should have differenceType when isDifferent is true', () => {
    // Generate multiple rounds until we get a different one
    let round: SameOrDifferentRound | null = null;
    for (let i = 0; i < 100; i++) {
      const testRound = generateSameOrDifferentRound();
      if (testRound.isDifferent) {
        round = testRound;
        break;
      }
    }

    if (round) {
      expect(round.differenceType).toBeDefined();
      expect(['rhythm', 'pitch', 'dynamics', 'tempo']).toContain(round.differenceType);
    }
  });

  it('should have undefined differenceType when isDifferent is false', () => {
    // Generate multiple rounds until we get a same one
    let round: SameOrDifferentRound | null = null;
    for (let i = 0; i < 100; i++) {
      const testRound = generateSameOrDifferentRound();
      if (!testRound.isDifferent) {
        round = testRound;
        break;
      }
    }

    if (round) {
      expect(round.differenceType).toBeUndefined();
    }
  });

  it('should have valid tempo value', () => {
    const round = generateSameOrDifferentRound();
    expect(round.tempo).toBeGreaterThan(0);
    expect(round.tempo).toBeLessThanOrEqual(200);
  });
});

describe('Same or Different Logic - Answer Validation', () => {
  it('should validate correct "same" answer when phrases are identical', () => {
    const isCorrect = validateSameOrDifferentAnswer('same', false);
    expect(isCorrect).toBe(true);
  });

  it('should validate incorrect "same" answer when phrases are different', () => {
    const isCorrect = validateSameOrDifferentAnswer('same', true);
    expect(isCorrect).toBe(false);
  });

  it('should validate correct "different" answer when phrases are different', () => {
    const isCorrect = validateSameOrDifferentAnswer('different', true);
    expect(isCorrect).toBe(true);
  });

  it('should validate incorrect "different" answer when phrases are identical', () => {
    const isCorrect = validateSameOrDifferentAnswer('different', false);
    expect(isCorrect).toBe(false);
  });

  it('should consistently validate answers', () => {
    const testCases = [
      { answer: 'same' as const, isDifferent: false, expected: true },
      { answer: 'same' as const, isDifferent: true, expected: false },
      { answer: 'different' as const, isDifferent: false, expected: false },
      { answer: 'different' as const, isDifferent: true, expected: true },
    ];

    testCases.forEach(testCase => {
      const result = validateSameOrDifferentAnswer(testCase.answer, testCase.isDifferent);
      expect(result).toBe(testCase.expected);
    });
  });
});

describe('Same or Different Logic - Score Calculation', () => {
  it('should increment score on correct answer', () => {
    const currentScore = 0;
    const newScore = calculateSameOrDifferentScore(currentScore, true);
    expect(newScore).toBe(1);
  });

  it('should not increment score on incorrect answer', () => {
    const currentScore = 0;
    const newScore = calculateSameOrDifferentScore(currentScore, false);
    expect(newScore).toBe(0);
  });

  it('should maintain correct score across multiple answers', () => {
    let score = 0;

    // Simulate answers: correct, correct, incorrect, correct, incorrect
    const answers = [true, true, false, true, false];

    answers.forEach(isCorrect => {
      score = calculateSameOrDifferentScore(score, isCorrect);
    });

    expect(score).toBe(3);
  });

  it('should correctly accumulate scores over time', () => {
    let score = 10;

    // Add 5 more correct answers
    for (let i = 0; i < 5; i++) {
      score = calculateSameOrDifferentScore(score, true);
    }

    expect(score).toBe(15);
  });

  it('should handle zero initial score', () => {
    const score = calculateSameOrDifferentScore(0, true);
    expect(score).toBe(1);
  });
});

describe('Same or Different Logic - Phrase Generation Consistency', () => {
  it('should generate phrases with reasonable lengths', () => {
    const round = generateSameOrDifferentRound();
    expect(round.phrase1.length).toBeGreaterThanOrEqual(3);
    expect(round.phrase1.length).toBeLessThanOrEqual(6);
    expect(round.phrase2.length).toBeGreaterThanOrEqual(3);
    expect(round.phrase2.length).toBeLessThanOrEqual(6);
  });

  it('should generate phrases with realistic pitch ranges', () => {
    const round = generateSameOrDifferentRound();
    const allFrequencies = [...round.phrase1, ...round.phrase2];

    allFrequencies.forEach(freq => {
      expect(freq).toBeGreaterThanOrEqual(200);
      expect(freq).toBeLessThanOrEqual(1100);
    });
  });

  it('should generate different phrase types when isDifferent is true', () => {
    // Generate multiple rounds with difference
    const differences = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const round = generateSameOrDifferentRound();
      if (round.isDifferent && round.differenceType) {
        differences.add(round.differenceType);
      }
    }

    // Should have generated multiple types of differences
    expect(differences.size).toBeGreaterThan(0);
  });

  it('should generate both same and different phrases', () => {
    const sameCount = { same: 0, different: 0 };

    // Generate 100 rounds and count
    for (let i = 0; i < 100; i++) {
      const round = generateSameOrDifferentRound();
      if (round.isDifferent) {
        sameCount.different++;
      } else {
        sameCount.same++;
      }
    }

    // Both types should be generated
    expect(sameCount.same).toBeGreaterThan(0);
    expect(sameCount.different).toBeGreaterThan(0);
  });
});
