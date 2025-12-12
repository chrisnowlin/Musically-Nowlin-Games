import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  Pitch003Game, 
  Pitch003Round, 
  Pitch003GameState,
  createPitch003Game,
  getPitch003ModeConfig 
} from '@/lib/gameLogic/pitch-003Logic';
import { getAllModes, getModeById } from '@/lib/gameLogic/pitch-003Modes';

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

describe('Pitch-003 Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 3 modes defined', () => {
      const modes = getAllModes();
      expect(modes).toHaveLength(3);
    });

    it('should have all required mode IDs', () => {
      const modeIds = getAllModes().map(mode => mode.id);
      const expectedIds = ['structure', 'relationships', 'transformations'];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      const modes = getAllModes();
      modes.forEach(mode => {
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
      });
    });

    it('should get mode by ID', () => {
      const structureMode = getModeById('structure');
      expect(structureMode).toBeDefined();
      expect(structureMode?.id).toBe('structure');
      expect(structureMode?.name).toBe('Phrase Structure');
    });

    it('should return undefined for invalid mode ID', () => {
      const invalidMode = getModeById('invalid-mode');
      expect(invalidMode).toBeUndefined();
    });
  });

  describe('Game Creation', () => {
    it('should create a game for valid mode', () => {
      const game = createPitch003Game('structure', 'easy');
      expect(game).toBeInstanceOf(Pitch003Game);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        createPitch003Game('invalid-mode', 'easy');
      }).toThrow('Unknown mode: invalid-mode');
    });

    it('should get mode config for valid mode', () => {
      const config = getPitch003ModeConfig('structure');
      expect(config).toBeDefined();
      expect(config?.id).toBe('structure');
    });

    it('should return undefined for invalid mode config', () => {
      const config = getPitch003ModeConfig('invalid-mode');
      expect(config).toBeUndefined();
    });
  });

  describe('Structure Mode', () => {
    let game: Pitch003Game;

    beforeEach(() => {
      game = createPitch003Game('structure', 'easy');
    });

    it('should generate structure rounds', () => {
      const round = game.generateRound();
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('modeId', 'structure');
      expect(round).toHaveProperty('difficulty', 'easy');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('options');
      expect(round).toHaveProperty('audioData');
      expect(round).toHaveProperty('explanation');
      expect(round).toHaveProperty('points');
    });

    it('should generate phrase identification for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('phrase');
      expect(['Basic Phrase', 'Musical Period', 'Musical Sentence']).toContain(round.answer);
      expect(round.options).toHaveLength(3);
    });

    it('should generate phrase boundary questions for medium mode', () => {
      game = createPitch003Game('structure', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('boundaries');
      expect(round.options.length).toBeGreaterThan(2);
    });

    it('should generate phrase analysis for hard mode', () => {
      game = createPitch003Game('structure', 'hard');
      const round = game.generateRound();
      expect(round.question).toContain('analyze');
      expect(round.options.length).toBeGreaterThan(3);
    });

    it('should validate answers correctly', () => {
      const round = game.generateRound();
      const isCorrect = game.validateAnswer(round.answer, round.answer);
      expect(isCorrect).toBe(true);
      
      const isIncorrect = game.validateAnswer('wrong', round.answer);
      expect(isIncorrect).toBe(false);
    });
  });

  describe('Relationships Mode', () => {
    let game: Pitch003Game;

    beforeEach(() => {
      game = createPitch003Game('relationships', 'easy');
    });

    it('should generate relationship rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('relationships');
      expect(round.audioData.type).toBe('phrase-relationship');
      expect(round.audioData.phrases).toHaveLength(2);
    });

    it('should generate relationship identification for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('relationship');
      expect(['Parallel Phrases', 'Contrasting Phrases', 'Sequential Phrases']).toContain(round.answer);
      expect(round.options).toHaveLength(3);
    });

    it('should generate detailed relationship analysis for medium mode', () => {
      game = createPitch003Game('relationships', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('how');
      expect(round.options.length).toBeGreaterThan(3);
    });

    it('should generate complex relationship patterns for hard mode', () => {
      game = createPitch003Game('relationships', 'hard');
      const round = game.generateRound();
      expect(round.question).toContain('pattern');
      expect(round.options.length).toBeGreaterThan(4);
    });
  });

  describe('Transformations Mode', () => {
    let game: Pitch003Game;

    beforeEach(() => {
      game = createPitch003Game('transformations', 'easy');
    });

    it('should generate transformation rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('transformations');
      expect(round.audioData.type).toBe('phrase-transformation');
      expect(round.audioData.parameters).toHaveProperty('transformationType');
    });

    it('should generate transformation identification for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('transformed');
      expect(['Transposition', 'Melodic Inversion', 'Retrograde']).toContain(round.answer);
      expect(round.options).toHaveLength(3);
    });

    it('should generate transformation degree for medium mode', () => {
      game = createPitch003Game('transformations', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('degree');
      expect(['Transposition', 'Melodic Inversion', 'Retrograde', 'Up 2nd', 'Up 3rd', 'Up 4th', 'Up 5th', 'Down 2nd', 'Down 3rd']).toContain(round.answer);
    });

    it('should generate complex transformation analysis for hard mode', () => {
      game = createPitch003Game('transformations', 'hard');
      const round = game.generateRound();
      expect(round.question).toContain('analyze');
      expect(round.options.length).toBeGreaterThan(5);
    });
  });

  describe('Scoring System', () => {
    it('should award correct points for easy difficulty', () => {
      const game = createPitch003Game('structure', 'easy');
      const round = game.generateRound();
      expect(round.points).toBe(10);
    });

    it('should award correct points for medium difficulty', () => {
      const game = createPitch003Game('structure', 'medium');
      const round = game.generateRound();
      expect(round.points).toBe(20);
    });

    it('should award correct points for hard difficulty', () => {
      const game = createPitch003Game('structure', 'hard');
      const round = game.generateRound();
      expect(round.points).toBe(30);
    });
  });

  describe('Audio Data Generation', () => {
    it('should generate valid audio data for all modes', () => {
      const modes = ['structure', 'relationships', 'transformations'];
      
      modes.forEach(modeId => {
        const game = createPitch003Game(modeId, 'easy');
        const round = game.generateRound();
        
        expect(round.audioData).toHaveProperty('type');
        expect(round.audioData).toHaveProperty('frequencies');
        expect(round.audioData).toHaveProperty('duration');
        expect(Array.isArray(round.audioData.frequencies)).toBe(true);
        expect(round.audioData.frequencies.length).toBeGreaterThan(0);
        expect(typeof round.audioData.duration).toBe('number');
        expect(round.audioData.duration).toBeGreaterThan(0);
      });
    });

    it('should include parameters for modes that need them', () => {
      const parameterModes = ['relationships', 'transformations'];
      
      parameterModes.forEach(modeId => {
        const game = createPitch003Game(modeId, 'easy');
        const round = game.generateRound();
        
        expect(round.audioData.parameters).toBeDefined();
        expect(typeof round.audioData.parameters).toBe('object');
      });
    });

    it('should generate phrase-specific audio data', () => {
      const game = createPitch003Game('structure', 'easy');
      const round = game.generateRound();
      
      if (round.answer === 'Basic Phrase') {
        expect(round.audioData.frequencies.length).toBeLessThanOrEqual(8);
      } else if (round.answer === 'Musical Period') {
        expect(round.audioData.frequencies.length).toBeGreaterThan(8);
        expect(round.audioData.frequencies.length).toBeLessThanOrEqual(16);
      } else if (round.answer === 'Musical Sentence') {
        expect(round.audioData.frequencies.length).toBeGreaterThan(16);
      }
    });
  });

  describe('Explanation Generation', () => {
    it('should generate explanations for all rounds', () => {
      const modes = ['structure', 'relationships', 'transformations'];
      
      modes.forEach(modeId => {
        const game = createPitch003Game(modeId, 'easy');
        const round = game.generateRound();
        
        expect(round.explanation).toBeDefined();
        expect(typeof round.explanation).toBe('string');
        expect(round.explanation.length).toBeGreaterThan(0);
      });
    });

    it('should generate mode-specific explanations', () => {
      const structureGame = createPitch003Game('structure', 'easy');
      const structureRound = structureGame.generateRound();
      expect(structureRound.explanation).toContain('phrase');

      const relationshipsGame = createPitch003Game('relationships', 'easy');
      const relationshipsRound = relationshipsGame.generateRound();
      expect(relationshipsRound.explanation).toContain('relationship');

      const transformationsGame = createPitch003Game('transformations', 'easy');
      const transformationsRound = transformationsGame.generateRound();
      expect(transformationsRound.explanation).toContain('transform');
    });
  });

  describe('Progress Tracking', () => {
    it('should track game progress', () => {
      const game = createPitch003Game('structure', 'easy');
      
      expect(game.getProgress()).toEqual({
        currentRound: 0,
        totalRounds: 10,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0
      });
    });

    it('should update progress after answer', () => {
      const game = createPitch003Game('structure', 'easy');
      const round = game.generateRound();
      
      game.submitAnswer(round.answer, round.answer, round.points);
      
      const progress = game.getProgress();
      expect(progress.currentRound).toBe(1);
      expect(progress.totalAnswers).toBe(1);
      expect(progress.correctAnswers).toBe(1);
      expect(progress.score).toBe(round.points);
    });

    it('should not update score for incorrect answers', () => {
      const game = createPitch003Game('structure', 'easy');
      const round = game.generateRound();
      
      game.submitAnswer('wrong answer', round.answer, round.points);
      
      const progress = game.getProgress();
      expect(progress.currentRound).toBe(1);
      expect(progress.totalAnswers).toBe(1);
      expect(progress.correctAnswers).toBe(0);
      expect(progress.score).toBe(0);
    });
  });

  describe('Game State Management', () => {
    it('should initialize game in correct state', () => {
      const game = createPitch003Game('structure', 'easy');
      const state = game.getState();
      
      expect(state.mode).toBe('structure');
      expect(state.difficulty).toBe('easy');
      expect(state.isComplete).toBe(false);
      expect(state.currentRound).toBe(0);
    });

    it('should complete game after max rounds', () => {
      const game = createPitch003Game('structure', 'easy');
      
      // Play through all rounds
      for (let i = 0; i < 10; i++) {
        const round = game.generateRound();
        game.submitAnswer(round.answer, round.answer, round.points);
      }
      
      const state = game.getState();
      expect(state.isComplete).toBe(true);
      expect(game.getProgress().currentRound).toBe(10);
    });

    it('should calculate accuracy correctly', () => {
      const game = createPitch003Game('structure', 'easy');
      
      // Generate rounds first, then answer them
      const rounds = [];
      for (let i = 0; i < 5; i++) {
        rounds.push(game.generateRound());
      }
      
      // Reset the game to start fresh
      game.reset();
      
      // Answer 3 rounds correctly, 2 incorrectly
      for (let i = 0; i < 5; i++) {
        const answer = i < 3 ? rounds[i].answer : 'wrong';
        game.submitAnswer(answer, rounds[i].answer, rounds[i].points);
      }
      
      const accuracy = game.getAccuracy();
      expect(accuracy).toBe(60); // 3/5 = 60%
    });
  });

  describe('Mode Configuration Access', () => {
    it('should provide access to mode configuration', () => {
      const game = createPitch003Game('structure', 'easy');
      const config = game.getModeConfig();
      
      expect(config).toBeDefined();
      expect(config?.id).toBe('structure');
      expect(config?.name).toBe('Phrase Structure');
      expect(config?.description).toBeDefined();
    });

    it('should provide access to all mode configurations', () => {
      const allConfigs = getAllModes();
      
      expect(allConfigs).toHaveLength(3);
      expect(allConfigs[0].id).toBe('structure');
      expect(allConfigs[1].id).toBe('relationships');
      expect(allConfigs[2].id).toBe('transformations');
    });
  });

  describe('Phrase Analysis Logic', () => {
    it('should generate appropriate phrase lengths', () => {
      const game = createPitch003Game('structure', 'easy');
      
      for (let i = 0; i < 10; i++) {
        const round = game.generateRound();
        
        if (round.answer === 'Basic Phrase') {
          expect(round.audioData.frequencies.length).toBeLessThanOrEqual(8);
        } else if (round.answer === 'Musical Period') {
          expect(round.audioData.frequencies.length).toBeGreaterThan(8);
          expect(round.audioData.frequencies.length).toBeLessThanOrEqual(16);
        } else if (round.answer === 'Musical Sentence') {
          expect(round.audioData.frequencies.length).toBeGreaterThan(16);
        }
      }
    });

    it('should generate relationship pairs correctly', () => {
      const game = createPitch003Game('relationships', 'easy');
      
      for (let i = 0; i < 10; i++) {
        const round = game.generateRound();
        
        if (round.audioData.phrases) {
          expect(round.audioData.phrases).toHaveLength(2);
          expect(round.audioData.phrases[0]).toHaveProperty('notes');
          expect(round.audioData.phrases[1]).toHaveProperty('notes');
          expect(round.audioData.phrases[0]).toHaveProperty('rhythm');
          expect(round.audioData.phrases[1]).toHaveProperty('rhythm');
        }
      }
    });

    it('should generate transformation pairs correctly', () => {
      const game = createPitch003Game('transformations', 'easy');
      
      for (let i = 0; i < 10; i++) {
        const round = game.generateRound();
        
        expect(round.audioData.parameters).toHaveProperty('transformationType');
        expect(round.audioData.parameters).toHaveProperty('original');
        expect(round.audioData.parameters).toHaveProperty('transformed');
        
        const { original, transformed } = round.audioData.parameters;
        expect(original).toHaveProperty('notes');
        expect(transformed).toHaveProperty('notes');
        expect(original.notes.length).toBe(transformed.notes.length);
      }
    });
  });
});

describe('Pitch-003 Integration', () => {
  it('should handle all difficulty levels for all modes', () => {
    const modes = ['structure', 'relationships', 'transformations'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    modes.forEach(modeId => {
      difficulties.forEach(difficulty => {
        expect(() => {
          const game = createPitch003Game(modeId, difficulty as any);
          const round = game.generateRound();
          
          expect(round.modeId).toBe(modeId);
          expect(round.difficulty).toBe(difficulty);
        }).not.toThrow();
      });
    });
  });

  it('should generate properly formatted round IDs', () => {
    const game = createPitch003Game('structure', 'easy');
    const round = game.generateRound();
    
    expect(round.id).toMatch(/^structure-\d+$/);
  });

  it('should handle rapid round generation', () => {
    const game = createPitch003Game('structure', 'easy');
    
    expect(() => {
      for (let i = 0; i < 100; i++) {
        const round = game.generateRound();
        expect(round).toBeDefined();
      }
    }).not.toThrow();
  });

  it('should maintain consistency across rounds', () => {
    const game = createPitch003Game('structure', 'easy');
    const rounds = [];
    
    for (let i = 0; i < 10; i++) {
      rounds.push(game.generateRound());
    }
    
    rounds.forEach(round => {
      expect(round.modeId).toBe('structure');
      expect(round.difficulty).toBe('easy');
      expect(round.points).toBe(10);
      expect(round.options).toContain(round.answer);
    });
  });

  it('should handle edge cases in answer validation', () => {
    const game = createPitch003Game('structure', 'easy');
    
    expect(game.validateAnswer('', 'Basic Phrase')).toBe(false);
    expect(game.validateAnswer(null as any, 'Basic Phrase')).toBe(false);
    expect(game.validateAnswer(undefined as any, 'Basic Phrase')).toBe(false);
    expect(game.validateAnswer('Basic Phrase', '')).toBe(false);
    expect(game.validateAnswer('Basic Phrase', null as any)).toBe(false);
    expect(game.validateAnswer('Basic Phrase', undefined as any)).toBe(false);
  });

  it('should handle game reset functionality', () => {
    const game = createPitch003Game('structure', 'easy');
    
    // Play some rounds
    for (let i = 0; i < 3; i++) {
      const round = game.generateRound();
      game.submitAnswer(round.answer, round.answer, round.points);
    }
    
    // Reset game
    game.reset();
    
    const progress = game.getProgress();
    expect(progress.currentRound).toBe(0);
    expect(progress.score).toBe(0);
    expect(progress.correctAnswers).toBe(0);
    expect(progress.totalAnswers).toBe(0);
  });
});

describe('Pitch-003 Audio Synthesis', () => {
  it('should generate valid frequency arrays', () => {
    const game = createPitch003Game('structure', 'easy');
    const round = game.generateRound();
    
    round.audioData.frequencies.forEach((freq: number) => {
      expect(typeof freq).toBe('number');
      expect(freq).toBeGreaterThan(0);
      expect(freq).toBeLessThan(2000); // Reasonable frequency range
    });
  });

  it('should generate appropriate durations', () => {
    const game = createPitch003Game('structure', 'easy');
    const round = game.generateRound();
    
    expect(typeof round.audioData.duration).toBe('number');
    expect(round.audioData.duration).toBeGreaterThan(0);
    expect(round.audioData.duration).toBeLessThan(15); // Reasonable duration
  });

  it('should handle different audio types', () => {
    const modes = [
      { id: 'structure', expectedType: 'phrase-structure' },
      { id: 'relationships', expectedType: 'phrase-relationship' },
      { id: 'transformations', expectedType: 'phrase-transformation' }
    ];
    
    modes.forEach(({ id, expectedType }) => {
      const game = createPitch003Game(id, 'easy');
      const round = game.generateRound();
      
      expect(round.audioData.type).toBe(expectedType);
    });
  });
});