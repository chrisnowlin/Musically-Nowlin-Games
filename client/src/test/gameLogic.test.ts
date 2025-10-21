import { describe, it, expect } from 'vitest';
import type { GameRound } from '../lib/schema';
import { ANIMAL_CHARACTERS, MUSICAL_NOTES } from '../lib/schema';
import { generateNewRound, validateAnswer, calculateScore } from '../lib/gameUtils';

describe('Game Logic - generateNewRound', () => {
  it('should generate two different pitches', () => {
    const round = generateNewRound();
    expect(round.pitch1).not.toBe(round.pitch2);
  });

  it('should generate pitches from the valid MUSICAL_NOTES range', () => {
    const validFrequencies = MUSICAL_NOTES.map(note => note.frequency);
    const round = generateNewRound();
    
    expect(validFrequencies).toContain(round.pitch1);
    expect(validFrequencies).toContain(round.pitch2);
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
          expect(round.pitch1).toBeGreaterThan(round.pitch2);
        } else {
          expect(round.pitch2).toBeGreaterThan(round.pitch1);
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
          expect(round.pitch1).toBeLessThan(round.pitch2);
        } else {
          expect(round.pitch2).toBeLessThan(round.pitch1);
        }
      }
    }
  });

  it('should use consistent character assignments', () => {
    const round = generateNewRound();
    expect(round.character1.name).toBe('Ellie Elephant');
    expect(round.character2.name).toBe('Gary Giraffe');
  });
});

describe('Game Logic - Answer Validation', () => {
  it('should correctly validate a correct answer with validateAnswer', () => {
    const round: GameRound = {
      character1: ANIMAL_CHARACTERS[0],
      pitch1: 440,
      character2: ANIMAL_CHARACTERS[1],
      pitch2: 330,
      question: "higher",
      correctAnswer: 1,
    };

    const isCorrect = validateAnswer(1, round.correctAnswer);
    expect(isCorrect).toBe(true);
  });

  it('should correctly validate an incorrect answer with validateAnswer', () => {
    const round: GameRound = {
      character1: ANIMAL_CHARACTERS[0],
      pitch1: 440,
      pitch2: 330,
      character2: ANIMAL_CHARACTERS[1],
      question: "higher",
      correctAnswer: 1,
    };

    const isCorrect = validateAnswer(2, round.correctAnswer);
    expect(isCorrect).toBe(false);
  });

  it('should handle "lower" question correctly', () => {
    const round: GameRound = {
      character1: ANIMAL_CHARACTERS[0],
      pitch1: 330,
      character2: ANIMAL_CHARACTERS[1],
      pitch2: 440,
      question: "lower",
      correctAnswer: 1,
    };

    expect(round.pitch1).toBeLessThan(round.pitch2);
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
      character1: ANIMAL_CHARACTERS[0],
      pitch1: 500,
      character2: ANIMAL_CHARACTERS[1],
      pitch2: 300,
      question: "higher",
      correctAnswer: 1,
    };

    const characterClicked: 1 | 2 = 1;
    const isCorrect = validateAnswer(characterClicked, round.correctAnswer);
    
    expect(isCorrect).toBe(true);
  });

  it('should correctly determine if answer is incorrect when wrong character is clicked', () => {
    const round: GameRound = {
      character1: ANIMAL_CHARACTERS[0],
      pitch1: 300,
      character2: ANIMAL_CHARACTERS[1],
      pitch2: 500,
      question: "higher",
      correctAnswer: 2,
    };

    const characterClicked: 1 | 2 = 1;
    const isCorrect = validateAnswer(characterClicked, round.correctAnswer);
    
    expect(isCorrect).toBe(false);
  });
});
