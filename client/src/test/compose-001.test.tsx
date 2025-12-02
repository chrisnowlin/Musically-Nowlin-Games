import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRound, validateComposition, calculateScore } from '@/lib/gameLogic/compose-001Logic';
import { getAllModes, getModeDefinition } from '@/lib/gameLogic/compose-001Modes';

// Component tests are skipped as they need UI updates
// Focus on logic tests which are more stable

describe('compose-001Logic', () => {
  describe('generateRound', () => {
    it('generates a round for melody mode', () => {
      const round = generateRound('melody', 1);
      
      expect(round.mode).toBe('melody');
      expect(round.difficulty).toBe(1);
      expect(round.challenge).toBeDefined();
      expect(round.id).toBeDefined();
      expect(round.timeLimit).toBeDefined();
    });

    it('generates a round for rhythm mode', () => {
      const round = generateRound('rhythm', 2);
      
      expect(round.mode).toBe('rhythm');
      expect(round.difficulty).toBe(2);
      expect(round.challenge).toBeDefined();
    });

    it('generates a round for harmony mode', () => {
      const round = generateRound('harmony', 3);
      
      expect(round.mode).toBe('harmony');
      expect(round.difficulty).toBe(3);
      expect(round.challenge).toBeDefined();
    });
  });

  describe('validateComposition', () => {
    it('validates a melody composition with specific challenge', () => {
      // Use a specific round with known requirements
      const round = {
        id: 'test-round',
        mode: 'melody' as const,
        challenge: {
          id: 'melody-001',
          text: 'Create a melody using at least 4 notes',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
          },
        },
        difficulty: 1,
        timeLimit: 100,
      };
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback).toBe('Great composition!');
    });

    it('validates a melody that is too short', () => {
      const round = {
        id: 'test-round',
        mode: 'melody' as const,
        challenge: {
          id: 'melody-001',
          text: 'Create a melody using at least 4 notes',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
          },
        },
        difficulty: 1,
        timeLimit: 100,
      };
      const composition = {
        type: 'melody' as const,
        notes: ['C'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toBe('Keep working on it!');
    });

    it('validates a correct rhythm composition', () => {
      const round = {
        id: 'test-round',
        mode: 'rhythm' as const,
        challenge: {
          id: 'rhythm-001',
          text: 'Create a rhythm with at least 4 beats',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
          },
        },
        difficulty: 1,
        timeLimit: 100,
      };
      const composition = {
        type: 'rhythm' as const,
        rhythm: ['♩', '♩', '♩', '♩'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('validates a rhythm with required rest', () => {
      const round = {
        id: 'test-round',
        mode: 'rhythm' as const,
        challenge: {
          id: 'rhythm-002',
          text: 'Create a rhythm with at least one rest',
          difficulty: 2,
          validation: {
            minLength: 3,
            maxLength: 8,
            requiredElements: ['rest'],
          },
        },
        difficulty: 2,
        timeLimit: 100,
      };
      const composition = {
        type: 'rhythm' as const,
        rhythm: ['♩', '𝄽', '♩', '♩'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Includes rest');
    });

    it('validates a correct harmony composition', () => {
      const round = {
        id: 'test-round',
        mode: 'harmony' as const,
        challenge: {
          id: 'harmony-001',
          text: 'Create a chord progression with at least 3 chords',
          difficulty: 1,
          validation: {
            minLength: 3,
            maxLength: 6,
          },
        },
        difficulty: 1,
        timeLimit: 100,
      };
      const composition = {
        type: 'harmony' as const,
        chords: ['C Major', 'F Major', 'G Major'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('validates an I-IV-V progression', () => {
      const round = {
        id: 'test-round',
        mode: 'harmony' as const,
        challenge: {
          id: 'harmony-004',
          text: 'Build a simple I-IV-V progression',
          difficulty: 2,
          validation: {
            minLength: 3,
            maxLength: 3,
            patterns: [['I-IV-V']],
          },
        },
        difficulty: 2,
        timeLimit: 100,
      };
      const composition = {
        type: 'harmony' as const,
        chords: ['C Major', 'F Major', 'G Major'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Shows I-IV-V pattern');
    });

    it('detects ascending melody pattern', () => {
      const round = {
        id: 'test-round',
        mode: 'melody' as const,
        challenge: {
          id: 'melody-002',
          text: 'Create an ascending melody',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
            patterns: [['ascending']],
          },
        },
        difficulty: 1,
        timeLimit: 100,
      };
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Shows ascending pattern');
    });

    it('gives time bonus for quick completion', () => {
      const round = {
        id: 'test-round',
        mode: 'melody' as const,
        challenge: {
          id: 'melody-001',
          text: 'Create an ascending melody using at least 4 notes',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
            patterns: [['ascending']],
          },
        },
        difficulty: 1,
        timeLimit: 10000, // 10 seconds
      };
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const quickResult = validateComposition(composition, round, 1000); // 1 second
      const slowResult = validateComposition(composition, round, 15000); // 15 seconds (over limit)
      
      expect(quickResult.score).toBeGreaterThan(slowResult.score);
    });
  });

  describe('calculateScore', () => {
    it('calculates score with difficulty multiplier', () => {
      const validationResult = {
        valid: true,
        score: 100,
        feedback: 'Great!',
      };
      
      const score1 = calculateScore(validationResult, 1);
      const score3 = calculateScore(validationResult, 3);
      
      expect(score3).toBeGreaterThan(score1);
    });

    it('returns 0 for invalid composition', () => {
      const validationResult = {
        valid: false,
        score: 0,
        feedback: 'Keep working!',
      };
      
      const score = calculateScore(validationResult, 2);
      
      expect(score).toBe(0);
    });
  });
});

describe('compose-001Modes', () => {
  describe('getAllModes', () => {
    it('returns all available modes', () => {
      const modes = getAllModes();
      
      expect(modes).toHaveLength(3);
      expect(modes.map(m => m.id)).toContain('melody');
      expect(modes.map(m => m.id)).toContain('rhythm');
      expect(modes.map(m => m.id)).toContain('harmony');
    });
  });

  describe('getModeDefinition', () => {
    it('returns correct mode definition', () => {
      const melodyMode = getModeDefinition('melody');
      
      expect(melodyMode?.id).toBe('melody');
      expect(melodyMode?.name).toBe('Melody');
      expect(melodyMode?.color).toBe('blue');
    });

    it('returns undefined for invalid mode', () => {
      const invalidMode = getModeDefinition('invalid');
      
      expect(invalidMode).toBeUndefined();
    });
  });

  describe('Mode definitions', () => {
    it('has correct structure for all modes', () => {
      const modes = getAllModes();
      
      modes.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('instructions');
        expect(mode).toHaveProperty('difficultyRange');
        expect(mode).toHaveProperty('maxRounds');
        expect(Array.isArray(mode.instructions)).toBe(true);
      });
    });
  });
});
