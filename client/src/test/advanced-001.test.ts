import { describe, it, expect } from 'vitest';
import { generateRound, validateAnswer, calculateScore } from '@/lib/gameLogic/advanced-001Logic';

describe('advanced-001 logic', () => {
  it('generateRound returns a valid round for harmony mode', () => {
    const round = generateRound('advanced-harmony', 1);
    expect(round.mode).toBe('advanced-harmony');
    expect(round.question.length).toBeGreaterThan(0);
    expect(Array.isArray(round.options)).toBe(true);
    expect(round.options.length).toBeGreaterThan(0);
  });

  it('validateAnswer returns true for correct answer', () => {
    const round = generateRound('advanced-form', 1);
    expect(validateAnswer(round.answer, round.answer)).toBe(true);
  });

  it('calculateScore gives 0 for incorrect and >0 for correct', () => {
    expect(calculateScore(false, 2000, 1)).toBe(0);
    const score = calculateScore(true, 1000, 1);
    expect(score).toBeGreaterThan(0);
  });

  it('generateRound returns a valid round for rhythm mode with a pattern', () => {
    const round = generateRound('advanced-rhythm', 1);
    expect(round.mode).toBe('advanced-rhythm');
    expect(Array.isArray(round.pattern) || Array.isArray(round.notes)).toBe(true);
  });
});

