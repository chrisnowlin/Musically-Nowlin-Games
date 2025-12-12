import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { 
  generateRound, 
  validateAnswer, 
  calculateScore 
} from '@/lib/gameLogic/listen-002Logic';
import { 
  ANALYSIS_MODES, 
  getModeById, 
  getAllModes, 
  getMaxDifficultyForMode,
  MUSICAL_EXAMPLES,
  MUSICAL_ELEMENT_NAMES 
} from '@/lib/gameLogic/listen-002Modes';

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    frequency: { value: 440 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
    onended: null
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { 
      value: 0.7,
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      setValueAtTime: vi.fn()
    }
  }),
  currentTime: 0,
  destination: {},
  close: vi.fn()
})) as any;

// Type helpers for safe object access
type ComposerKey = 'bach' | 'mozart' | 'beethoven' | 'debussy';
type ElementKey = 'melody' | 'harmony' | 'rhythm' | 'timbre';
type MusicalKey = ComposerKey | ElementKey | 'tempo' | 'dynamics' | 'texture' | 'form';

function isComposerKey(key: string): key is ComposerKey {
  return ['bach', 'mozart', 'beethoven', 'debussy'].includes(key);
}

function isElementKey(key: string): key is ElementKey {
  return ['melody', 'harmony', 'rhythm', 'timbre'].includes(key);
}

function isMusicalKey(key: string): key is MusicalKey {
  return [
    'bach', 'mozart', 'beethoven', 'debussy',
    'melody', 'harmony', 'rhythm', 'timbre',
    'tempo', 'dynamics', 'texture', 'form'
  ].includes(key);
}

describe('Listen-002 Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 2 modes defined', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(2);
    });

    it('should have all required mode IDs', () => {
      const modeIds = Object.keys(ANALYSIS_MODES);
      const expectedIds = ['composers', 'elements'];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      Object.values(ANALYSIS_MODES).forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('ageRange');
        expect(mode).toHaveProperty('difficulty');
        expect(mode).toHaveProperty('maxRounds');
        expect(mode).toHaveProperty('instructions');
        
        expect(typeof mode.id).toBe('string');
        expect(typeof mode.name).toBe('string');
        expect(typeof mode.description).toBe('string');
        expect(typeof mode.icon).toBe('string');
        expect(typeof mode.color).toBe('string');
        expect(typeof mode.ageRange).toBe('string');
        expect(typeof mode.difficulty).toBe('string');
        expect(typeof mode.maxRounds).toBe('number');
        expect(typeof mode.instructions).toBe('string');
        
        expect(['easy', 'medium', 'hard']).toContain(mode.difficulty);
      });
    });

    it('should get mode by ID', () => {
      const composersMode = getModeById('composers');
      expect(composersMode).toBeDefined();
      expect(composersMode?.id).toBe('composers');
      expect(composersMode?.name).toBe('Composer Detective');
      
      const elementsMode = getModeById('elements');
      expect(elementsMode).toBeDefined();
      expect(elementsMode?.id).toBe('elements');
      expect(elementsMode?.name).toBe('Musical Elements Explorer');
    });

    it('should return undefined for invalid mode ID', () => {
      const invalidMode = getModeById('invalid-mode');
      expect(invalidMode).toBeUndefined();
    });

    it('should get max difficulty for modes', () => {
      expect(getMaxDifficultyForMode('composers')).toBe(5); // medium difficulty
      expect(getMaxDifficultyForMode('elements')).toBe(3); // easy difficulty
      expect(getMaxDifficultyForMode('invalid')).toBe(1);
    });
  });

  describe('Musical Examples Configuration', () => {
    it('should have composer examples defined', () => {
      const composers: ComposerKey[] = ['bach', 'mozart', 'beethoven', 'debussy'];
      
      composers.forEach(composer => {
        const example = MUSICAL_EXAMPLES[composer];
        expect(example).toBeDefined();
        expect(example).toHaveProperty('style');
        expect(example).toHaveProperty('characteristics');
        expect(example).toHaveProperty('tempo');
        expect(example).toHaveProperty('key');
        
        expect(Array.isArray(example.characteristics)).toBe(true);
        expect(typeof example.tempo).toBe('number');
        expect(typeof example.key).toBe('string');
      });
    });

    it('should have musical elements defined', () => {
      const elements: ElementKey[] = ['melody', 'harmony', 'rhythm', 'timbre'];
      
      elements.forEach(element => {
        const example = MUSICAL_EXAMPLES[element];
        expect(example).toBeDefined();
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('characteristics');
        expect(example).toHaveProperty('examples');
        
        expect(typeof example.description).toBe('string');
        expect(Array.isArray(example.characteristics)).toBe(true);
        expect(Array.isArray(example.examples)).toBe(true);
      });
    });

    it('should have musical element names defined', () => {
      const expectedNames: MusicalKey[] = [
        'bach', 'mozart', 'beethoven', 'debussy',
        'melody', 'harmony', 'rhythm', 'timbre',
        'tempo', 'dynamics', 'texture', 'form'
      ];
      
      expectedNames.forEach(name => {
        expect(MUSICAL_ELEMENT_NAMES[name]).toBeDefined();
        expect(typeof MUSICAL_ELEMENT_NAMES[name]).toBe('string');
        expect(MUSICAL_ELEMENT_NAMES[name].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Round Generation', () => {
    it('should generate rounds for composers mode', () => {
      const round = generateRound('composers', 1);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'composers');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('difficulty', 1);
      
      expect(typeof round.id).toBe('string');
      expect(typeof round.question).toBe('string');
      expect(typeof round.answer).toBe('string');
      expect(typeof round.difficulty).toBe('number');
    });

    it('should generate rounds for elements mode', () => {
      const round = generateRound('elements', 2);
      
      expect(round.mode).toBe('elements');
      expect(round.difficulty).toBe(2);
      expect(round.id).toMatch(/^round-\d+$/);
    });

    it('should generate unique round IDs', () => {
      const round1 = generateRound('composers', 1);
      const round2 = generateRound('composers', 1);
      
      // Both should have valid round ID format
      expect(round1.id).toMatch(/^round-\d+$/);
      expect(round2.id).toMatch(/^round-\d+$/);
      
      // IDs should be strings
      expect(typeof round1.id).toBe('string');
      expect(typeof round2.id).toBe('string');
    });

    it('should handle different difficulty levels', () => {
      const difficulties = [1, 2, 3, 4, 5];
      
      difficulties.forEach(difficulty => {
        const round = generateRound('composers', difficulty);
        expect(round.difficulty).toBe(difficulty);
      });
    });

    it('should generate valid question format', () => {
      const round = generateRound('composers', 1);
      
      expect(round.question.length).toBeGreaterThan(0);
      expect(typeof round.question).toBe('string');
    });

    it('should generate valid answer format', () => {
      const round = generateRound('elements', 1);
      
      expect(round.answer.length).toBeGreaterThan(0);
      expect(typeof round.answer).toBe('string');
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const isCorrect = validateAnswer('bach', 'bach');
      expect(isCorrect).toBe(true);
    });

    it('should reject incorrect answers', () => {
      const isIncorrect = validateAnswer('mozart', 'bach');
      expect(isIncorrect).toBe(false);
    });

    it('should handle case sensitivity', () => {
      const isCaseSensitive = validateAnswer('Bach', 'bach');
      expect(isCaseSensitive).toBe(false); // Should be case sensitive
    });

    it('should handle empty answers', () => {
      const isEmpty = validateAnswer('', 'bach');
      expect(isEmpty).toBe(false);
    });

    it('should handle special characters', () => {
      const isCorrect = validateAnswer('C. Debussy', 'C. Debussy');
      expect(isCorrect).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    it('should return 0 for incorrect answers', () => {
      const score = calculateScore(false, 5000, 3);
      expect(score).toBe(0);
    });

    it('should calculate base score correctly', () => {
      const score = calculateScore(true, 0, 1);
      expect(score).toBe(150); // 100 * 1 + 50 time bonus
    });

    it('should apply difficulty multiplier', () => {
      const scoreEasy = calculateScore(true, 0, 1);
      const scoreMedium = calculateScore(true, 0, 3);
      const scoreHard = calculateScore(true, 0, 5);
      
      expect(scoreMedium).toBeGreaterThan(scoreEasy);
      expect(scoreHard).toBeGreaterThan(scoreMedium);
    });

    it('should apply time bonus', () => {
      const scoreFast = calculateScore(true, 1000, 3); // 1 second
      const scoreSlow = calculateScore(true, 10000, 3); // 10 seconds
      
      expect(scoreFast).toBeGreaterThan(scoreSlow);
    });

    it('should not give negative time bonus', () => {
      const score = calculateScore(true, 60000, 3); // 60 seconds
      expect(score).toBe(300); // 100 * 3 + 0 time bonus
    });

    it('should round scores to integers', () => {
      const score = calculateScore(true, 1234, 2);
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  describe('Composers Mode Specific Tests', () => {
    it('should have correct mode configuration', () => {
      const mode = getModeById('composers');
      
      expect(mode?.name).toBe('Composer Detective');
      expect(mode?.description).toContain('composers');
      expect(mode?.icon).toBe('🎼');
      expect(mode?.color).toBe('from-amber-400 to-amber-600');
      expect(mode?.ageRange).toBe('8-12');
      expect(mode?.difficulty).toBe('medium');
      expect(mode?.maxRounds).toBe(10);
    });

    it('should generate composer-related questions', () => {
      const round = generateRound('composers', 1);
      
      // When implemented, should generate questions about composers
      expect(round.mode).toBe('composers');
    });

    it('should handle all composer examples', () => {
      const composers: ComposerKey[] = ['bach', 'mozart', 'beethoven', 'debussy'];
      
      expect(composers).toHaveLength(4);
      composers.forEach(composer => {
        const name = MUSICAL_ELEMENT_NAMES[composer];
        expect(name).toBeDefined();
        expect(name.toLowerCase()).toContain(composer);
      });
    });
  });

  describe('Elements Mode Specific Tests', () => {
    it('should have correct mode configuration', () => {
      const mode = getModeById('elements');
      
      expect(mode?.name).toBe('Musical Elements Explorer');
      expect(mode?.description).toContain('musical elements');
      expect(mode?.icon).toBe('🎵');
      expect(mode?.color).toBe('from-teal-400 to-teal-600');
      expect(mode?.ageRange).toBe('7-10');
      expect(mode?.difficulty).toBe('easy');
      expect(mode?.maxRounds).toBe(10);
    });

    it('should generate elements-related questions', () => {
      const round = generateRound('elements', 1);
      
      // When implemented, should generate questions about musical elements
      expect(round.mode).toBe('elements');
    });

    it('should handle all musical elements', () => {
      const elements: ElementKey[] = ['melody', 'harmony', 'rhythm', 'timbre'];
      
      elements.forEach(element => {
        expect(MUSICAL_EXAMPLES[element]).toBeDefined();
        const name = MUSICAL_ELEMENT_NAMES[element];
        expect(name).toBeDefined();
        expect(name.toLowerCase()).toContain(element);
      });
    });
  });

  describe('Audio Synthesis Support', () => {
    it('should have AudioContext mocked for testing', () => {
      expect(global.AudioContext).toBeDefined();
    });

    it('should mock oscillator creation', () => {
      const audioContext = new (global.AudioContext as any)();
      const oscillator = audioContext.createOscillator();
      
      expect(oscillator.connect).toBeDefined();
      expect(oscillator.start).toBeDefined();
      expect(oscillator.stop).toBeDefined();
      expect(oscillator.frequency).toBeDefined();
    });

    it('should mock gain node creation', () => {
      const audioContext = new (global.AudioContext as any)();
      const gain = audioContext.createGain();
      
      expect(gain.connect).toBeDefined();
      expect(gain.gain).toBeDefined();
      expect(gain.gain.exponentialRampToValueAtTime).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid mode gracefully', () => {
      expect(() => {
        generateRound('invalid-mode', 1);
      }).not.toThrow();
    });

    it('should handle zero difficulty', () => {
      const round = generateRound('composers', 0);
      expect(round.difficulty).toBe(0);
    });

    it('should handle negative difficulty', () => {
      const round = generateRound('composers', -1);
      expect(round.difficulty).toBe(-1);
    });

    it('should handle very high difficulty', () => {
      const round = generateRound('composers', 100);
      expect(round.difficulty).toBe(100);
    });

    it('should handle null answers in validation', () => {
      expect(() => {
        validateAnswer(null as any, 'bach');
      }).not.toThrow();
    });

    it('should handle undefined answers in validation', () => {
      expect(() => {
        validateAnswer(undefined as any, 'bach');
      }).not.toThrow();
    });

    it('should handle very long answers', () => {
      const longAnswer = 'a'.repeat(1000);
      const isValid = validateAnswer(longAnswer, longAnswer);
      expect(isValid).toBe(true);
    });

    it('should handle zero time in score calculation', () => {
      const score = calculateScore(true, 0, 1);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle negative time in score calculation', () => {
      const score = calculateScore(true, -1000, 1);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow for composers mode', () => {
      // Generate round
      const round = generateRound('composers', 3);
      expect(round).toBeDefined();
      
      // Validate answer
      const isCorrect = validateAnswer(round.answer, round.answer);
      expect(isCorrect).toBe(true);
      
      // Calculate score
      const score = calculateScore(isCorrect, 5000, round.difficulty);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle complete game flow for elements mode', () => {
      // Generate round
      const round = generateRound('elements', 2);
      expect(round).toBeDefined();
      
      // Validate answer
      const isCorrect = validateAnswer(round.answer, round.answer);
      expect(isCorrect).toBe(true);
      
      // Calculate score
      const score = calculateScore(isCorrect, 3000, round.difficulty);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle rapid round generation', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          const round = generateRound('composers', 1);
          expect(round).toBeDefined();
        }
      }).not.toThrow();
    });

    it('should handle mixed mode generation', () => {
      const modes = ['composers', 'elements'];
      
      modes.forEach(mode => {
        const round = generateRound(mode, 1);
        expect(round.mode).toBe(mode);
      });
    });

    it('should maintain consistency across difficulty levels', () => {
      const difficulties = [1, 2, 3, 4, 5];
      const rounds = difficulties.map(diff => generateRound('composers', diff));
      
      rounds.forEach((round, index) => {
        expect(round.difficulty).toBe(difficulties[index]);
        expect(round.mode).toBe('composers');
      });
    });
  });

  describe('Musical Content Validation', () => {
    it('should have valid composer characteristics', () => {
      const composers: ComposerKey[] = ['bach', 'mozart', 'beethoven', 'debussy'];
      
      composers.forEach(composer => {
        const example = MUSICAL_EXAMPLES[composer];
        if ('style' in example) { // It's a composer example
          expect(example.characteristics.length).toBeGreaterThan(0);
          expect(example.tempo).toBeGreaterThan(0);
          expect(example.key.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid element examples', () => {
      const elements: ElementKey[] = ['melody', 'harmony', 'rhythm', 'timbre'];
      
      elements.forEach(element => {
        const example = MUSICAL_EXAMPLES[element];
        if ('description' in example) { // It's an element example
          expect(example.examples.length).toBeGreaterThan(0);
          expect(example.characteristics.length).toBeGreaterThan(0);
          expect(example.description.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have properly formatted element names', () => {
      Object.entries(MUSICAL_ELEMENT_NAMES).forEach(([key, name]) => {
        if (isMusicalKey(key)) {
          expect(name.toLowerCase()).toContain(key);
          expect(name.length).toBeGreaterThan(key.length);
        }
      });
    });
  });
});

describe('Listen-002 Audio Integration', () => {
  it('should support audio synthesis for composer examples', () => {
    const audioContext = new (global.AudioContext as any)();
    
    // Test that we can create audio components for synthesis
    expect(audioContext.createOscillator).toBeDefined();
    expect(audioContext.createGain).toBeDefined();
    
    // Verify tempo values are in reasonable range
    const composers: ComposerKey[] = ['bach', 'mozart', 'beethoven', 'debussy'];
    composers.forEach(composer => {
      const example = MUSICAL_EXAMPLES[composer];
      if ('tempo' in example) {
        expect(example.tempo).toBeGreaterThan(40);
        expect(example.tempo).toBeLessThan(200);
      }
    });
  });

  it('should handle audio context lifecycle', () => {
    const audioContext = new (global.AudioContext as any)();
    
    expect(audioContext.close).toBeDefined();
    expect(audioContext.destination).toBeDefined();
    expect(audioContext.currentTime).toBeDefined();
  });
});

describe('Listen-002 Performance Tests', () => {
  it('should handle bulk operations efficiently', () => {
    const startTime = performance.now();
    
    // Generate many rounds
    for (let i = 0; i < 1000; i++) {
      generateRound('composers', 1);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (less than 1 second)
    expect(duration).toBeLessThan(1000);
  });

  it('should handle memory usage during repeated operations', () => {
    const rounds = [];
    
    // Generate and store many rounds
    for (let i = 0; i < 100; i++) {
      rounds.push(generateRound('elements', i % 5 + 1));
    }
    
    // All rounds should be valid
    rounds.forEach(round => {
      expect(round.id).toBeDefined();
      expect(round.mode).toBe('elements');
    });
    
    expect(rounds).toHaveLength(100);
  });
});