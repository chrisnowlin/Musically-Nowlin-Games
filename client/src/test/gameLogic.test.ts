import { describe, it, expect } from 'vitest';
import type { GameRound } from '../lib/schema';
import { ANIMAL_CHARACTERS, MUSICAL_NOTES } from '../lib/schema';
import { generateNewRound, validateAnswer, calculateScore } from '../lib/gameUtils';

describe('Game Logic - generateNewRound', () => {
  it('should generate two different pitches', () => {
    const round = generateNewRound();
    expect(round.pitches[0]).not.toBe(round.pitches[1]);
  });

  it('should generate pitches from the valid MUSICAL_NOTES range', () => {
    const validFrequencies = MUSICAL_NOTES.map(note => note.frequency);
    const round = generateNewRound();
    
    expect(validFrequencies).toContain(round.pitches[0]);
    expect(validFrequencies).toContain(round.pitches[1]);
  });

  it('should generate either "higher" or "lower" question', () => {
    const round = generateNewRound();
    expect(['higher', 'lower']).toContain(round.question);
  });

  it('should have correct answer as 1 or 2', () => {
    const round = generateNewRound();
    expect([1, 2]).toContain(round.correctAnswer);
  });

  it('should correctly identify higher pitch when question is "higher"', () => {
    // Run multiple times to test randomization
    for (let i = 0; i < 20; i++) {
      const round = generateNewRound();
      
      if (round.question === 'higher') {
        if (round.correctAnswer === 1) {
          expect(round.pitches[0]).toBeGreaterThan(round.pitches[1]);
        } else {
          expect(round.pitches[1]).toBeGreaterThan(round.pitches[0]);
        }
      }
    }
  });

  it('should correctly identify lower pitch when question is "lower"', () => {
    // Run multiple times to test randomization
    for (let i = 0; i < 20; i++) {
      const round = generateNewRound();
      
      if (round.question === 'lower') {
        if (round.correctAnswer === 1) {
          expect(round.pitches[0]).toBeLessThan(round.pitches[1]);
        } else {
          expect(round.pitches[1]).toBeLessThan(round.pitches[0]);
        }
      }
    }
  });

  it('should assign two different characters', () => {
    const round = generateNewRound();
    expect(round.characters).toHaveLength(2);
    expect(round.characters[0].name).not.toBe(round.characters[1].name);
  });
});

describe('Game Logic - Answer Validation', () => {
  it('should correctly validate a correct answer with validateAnswer', () => {
    const round: GameRound = {
      characters: [ANIMAL_CHARACTERS[0], ANIMAL_CHARACTERS[1]],
      pitches: [440, 330],
      question: "higher",
      correctAnswer: 1,
    };

    const isCorrect = validateAnswer(1, round.correctAnswer);
    expect(isCorrect).toBe(true);
  });

  it('should correctly validate an incorrect answer with validateAnswer', () => {
    const round: GameRound = {
      characters: [ANIMAL_CHARACTERS[0], ANIMAL_CHARACTERS[1]],
      pitches: [440, 330],
      question: "higher",
      correctAnswer: 1,
    };

    const isCorrect = validateAnswer(2, round.correctAnswer);
    expect(isCorrect).toBe(false);
  });

  it('should handle "lower" question correctly', () => {
    const round: GameRound = {
      characters: [ANIMAL_CHARACTERS[0], ANIMAL_CHARACTERS[1]],
      pitches: [330, 440],
      question: "lower",
      correctAnswer: 1,
    };

    expect(round.pitches[0]).toBeLessThan(round.pitches[1]);
    expect(round.correctAnswer).toBe(1);
  });
});

describe('Game Logic - Score Calculation', () => {
  it('should increment score on correct answer using calculateScore', () => {
    const currentScore = 0;
    const newScore = calculateScore(currentScore, true);
    
    expect(newScore).toBe(1);
  });

  it('should not increment score on incorrect answer using calculateScore', () => {
    const currentScore = 0;
    const newScore = calculateScore(currentScore, false);
    
    expect(newScore).toBe(0);
  });

  it('should maintain correct score across multiple answers', () => {
    let score = 0;
    
    // Simulate 5 answers: correct, correct, incorrect, correct, incorrect
    const answers = [true, true, false, true, false];
    
    answers.forEach(isCorrect => {
      score = calculateScore(score, isCorrect);
    });

    expect(score).toBe(3);
  });
});

describe('Game Logic - Character Click Handling', () => {
  it('should correctly determine if answer is correct when character 1 is clicked', () => {
    const round: GameRound = {
      characters: [ANIMAL_CHARACTERS[0], ANIMAL_CHARACTERS[1]],
      pitches: [500, 300],
      question: "higher",
      correctAnswer: 1,
    };

    const characterClicked: 1 | 2 = 1;
    const isCorrect = validateAnswer(characterClicked, round.correctAnswer);
    
    expect(isCorrect).toBe(true);
  });

  it('should correctly determine if answer is incorrect when wrong character is clicked', () => {
    const round: GameRound = {
      characters: [ANIMAL_CHARACTERS[0], ANIMAL_CHARACTERS[1]],
      pitches: [300, 500],
      question: "higher",
      correctAnswer: 2,
    };

    const characterClicked: 1 | 2 = 1;
    const isCorrect = validateAnswer(characterClicked, round.correctAnswer);
    
    expect(isCorrect).toBe(false);
  });
});
