import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  Pitch001Game, 
  Pitch001Round, 
  Pitch001GameState,
  createPitch001Game,
  getPitch001ModeConfig 
} from '@/lib/gameLogic/pitch-001Logic';
import { pitch001Modes } from '@/lib/gameLogic/pitch-001Modes';

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

describe('Pitch-001 Game Logic', () => {
  describe('Mode Configuration', () => {
    it('should have 10 modes defined', () => {
      expect(pitch001Modes).toHaveLength(10);
    });

    it('should have all required mode IDs', () => {
      const modeIds = pitch001Modes.map(mode => mode.id);
      const expectedIds = [
        'octave', 'interval', 'bend', 'vibrato', 'glissando',
        'portamento', 'envelope', 'harmonic', 'relative', 'absolute'
      ];
      expect(modeIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should have valid mode configurations', () => {
      pitch001Modes.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('ageGroup');
        expect(mode).toHaveProperty('estimatedDuration');
        expect(mode).toHaveProperty('instructions');
        expect(mode).toHaveProperty('parameters');
        
        expect(typeof mode.id).toBe('string');
        expect(typeof mode.name).toBe('string');
        expect(typeof mode.description).toBe('string');
        expect(typeof mode.icon).toBe('string');
        expect(typeof mode.color).toBe('string');
        expect(typeof mode.ageGroup).toBe('string');
        expect(typeof mode.estimatedDuration).toBe('number');
        expect(typeof mode.instructions).toBe('object');
        expect(typeof mode.parameters).toBe('object');
      });
    });
  });

  describe('Game Creation', () => {
    it('should create a game for valid mode', () => {
      const game = createPitch001Game('octave', 'easy');
      expect(game).toBeInstanceOf(Pitch001Game);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        createPitch001Game('invalid-mode', 'easy');
      }).toThrow('Unknown mode: invalid-mode');
    });

    it('should get mode config for valid mode', () => {
      const config = getPitch001ModeConfig('octave');
      expect(config).toBeDefined();
      expect(config?.id).toBe('octave');
    });

    it('should return undefined for invalid mode config', () => {
      const config = getPitch001ModeConfig('invalid-mode');
      expect(config).toBeUndefined();
    });
  });

  describe('Octave Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('octave', 'easy');
    });

    it('should generate octave rounds', () => {
      const round = game.generateRound();
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('modeId', 'octave');
      expect(round).toHaveProperty('difficulty', 'easy');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('options');
      expect(round).toHaveProperty('audioData');
      expect(round).toHaveProperty('explanation');
      expect(round).toHaveProperty('points');
    });

    it('should generate same/different questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('same or different');
      expect(round.options).toEqual(['Same', 'Different']);
      expect(['Same', 'Different']).toContain(round.answer);
    });

    it('should generate octave identification for medium mode', () => {
      game = createPitch001Game('octave', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('octave');
      expect(round.options).toHaveLength(3);
    });

    it('should generate relationship identification for hard mode', () => {
      game = createPitch001Game('octave', 'hard');
      const round = game.generateRound();
      expect(round.question).toContain('relate');
      expect(['Same', 'Octave Higher', 'Octave Lower']).toContain(round.answer);
    });

    it('should validate answers correctly', () => {
      const round = game.generateRound();
      const isCorrect = game.validateAnswer(round.answer, round.answer);
      expect(isCorrect).toBe(true);
      
      const isIncorrect = game.validateAnswer('wrong', round.answer);
      expect(isIncorrect).toBe(false);
    });
  });

  describe('Interval Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('interval', 'easy');
    });

    it('should generate interval rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('interval');
      expect(round.audioData.type).toBe('interval');
      expect(round.audioData.frequencies).toHaveLength(2);
    });

    it('should generate direction questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('up, down, or stay the same');
      expect(round.options).toContain('Up');
      expect(round.options).toContain('Down');
      expect(round.options).toContain('Same');
    });

    it('should generate interval identification for medium mode', () => {
      game = createPitch001Game('interval', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('interval');
      expect(round.options.length).toBeGreaterThan(2);
    });
  });

  describe('Pitch Bend Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('bend', 'easy');
    });

    it('should generate pitch bend rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('bend');
      expect(round.audioData.type).toBe('pitch-bend');
      expect(round.audioData.parameters).toHaveProperty('bendAmount');
      expect(round.audioData.parameters).toHaveProperty('bendDirection');
    });

    it('should generate direction questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('up or down');
      expect(round.options).toEqual(['Up', 'Down']);
    });

    it('should generate amount questions for medium mode', () => {
      game = createPitch001Game('bend', 'medium');
      const round = game.generateRound();
      expect(round.question).toContain('How much');
      expect(['Small', 'Medium', 'Large']).toContain(round.answer);
    });
  });

  describe('Vibrato Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('vibrato', 'easy');
    });

    it('should generate vibrato rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('vibrato');
      expect(round.audioData.type).toBe('vibrato');
      expect(round.audioData.parameters).toHaveProperty('hasVibrato');
      expect(round.audioData.parameters).toHaveProperty('rate');
      expect(round.audioData.parameters).toHaveProperty('depth');
    });

    it('should generate vibrato detection for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('vibrato');
      expect(round.options).toEqual(['Vibrato', 'Steady']);
    });
  });

  describe('Glissando Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('glissando', 'easy');
    });

    it('should generate glissando rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('glissando');
      expect(round.audioData.type).toBe('glissando');
      expect(round.audioData.parameters).toHaveProperty('range');
      expect(round.audioData.parameters).toHaveProperty('direction');
    });

    it('should generate direction questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('up or down');
      expect(round.options).toEqual(['Up', 'Down']);
    });
  });

  describe('Portamento Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('portamento', 'easy');
    });

    it('should generate portamento rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('portamento');
      expect(round.audioData.type).toBe('portamento');
      expect(round.audioData.parameters).toHaveProperty('hasPortamento');
      expect(round.audioData.parameters).toHaveProperty('portamentoTime');
    });

    it('should generate connection questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('connect smoothly or jump');
      expect(round.options).toEqual(['Smooth', 'Jump']);
    });
  });

  describe('Envelope Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('envelope', 'easy');
    });

    it('should generate envelope rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('envelope');
      expect(round.audioData.type).toBe('envelope');
      expect(round.audioData.parameters).toHaveProperty('envelopeType');
    });

    it('should generate attack questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('suddenly or fade in');
      expect(round.options).toEqual(['Sudden', 'Fade In']);
    });
  });

  describe('Harmonic Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('harmonic', 'easy');
    });

    it('should generate harmonic rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('harmonic');
      expect(round.audioData.type).toBe('harmonics');
      expect(round.audioData.parameters).toHaveProperty('hasHarmonics');
    });

    it('should generate overtone questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('pure tone or does it have overtones');
      expect(round.options).toEqual(['Pure Tone', 'Overtones']);
    });
  });

  describe('Relative Pitch Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('relative', 'easy');
    });

    it('should generate relative pitch rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('relative');
      expect(round.audioData.type).toBe('relative-pitch');
      expect(round.audioData.frequencies).toHaveLength(2);
    });

    it('should generate higher/lower questions for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('higher or lower');
      expect(round.options).toContain('Higher');
      expect(round.options).toContain('Lower');
      expect(round.options).toContain('Same');
    });
  });

  describe('Absolute Pitch Mode', () => {
    let game: Pitch001Game;

    beforeEach(() => {
      game = createPitch001Game('absolute', 'easy');
    });

    it('should generate absolute pitch rounds', () => {
      const round = game.generateRound();
      expect(round.modeId).toBe('absolute');
      expect(round.audioData.type).toBe('absolute-pitch');
      expect(round.audioData.frequencies).toHaveLength(1);
    });

    it('should generate note identification for easy mode', () => {
      const round = game.generateRound();
      expect(round.question).toContain('What note');
      expect(round.options.length).toBeGreaterThan(0);
      expect(round.options.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Scoring System', () => {
    it('should award correct points for easy difficulty', () => {
      const game = createPitch001Game('octave', 'easy');
      const round = game.generateRound();
      expect(round.points).toBe(10);
    });

    it('should award correct points for medium difficulty', () => {
      const game = createPitch001Game('octave', 'medium');
      const round = game.generateRound();
      expect(round.points).toBe(20);
    });

    it('should award correct points for hard difficulty', () => {
      const game = createPitch001Game('octave', 'hard');
      const round = game.generateRound();
      expect(round.points).toBe(30);
    });
  });

  describe('Audio Data Generation', () => {
    it('should generate valid audio data for all modes', () => {
      const modes = ['octave', 'interval', 'bend', 'vibrato', 'glissando', 'portamento', 'envelope', 'harmonic', 'relative', 'absolute'];
      
      modes.forEach(modeId => {
        const game = createPitch001Game(modeId, 'easy');
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
      const parameterModes = ['bend', 'vibrato', 'glissando', 'portamento', 'envelope', 'harmonic'];
      
      parameterModes.forEach(modeId => {
        const game = createPitch001Game(modeId, 'easy');
        const round = game.generateRound();
        
        expect(round.audioData.parameters).toBeDefined();
        expect(typeof round.audioData.parameters).toBe('object');
      });
    });
  });

  describe('Explanation Generation', () => {
    it('should generate explanations for all rounds', () => {
      const modes = ['octave', 'interval', 'bend', 'vibrato', 'glissando', 'portamento', 'envelope', 'harmonic', 'relative', 'absolute'];
      
      modes.forEach(modeId => {
        const game = createPitch001Game(modeId, 'easy');
        const round = game.generateRound();
        
        expect(round.explanation).toBeDefined();
        expect(typeof round.explanation).toBe('string');
        expect(round.explanation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mode Configuration Access', () => {
    it('should provide access to mode configuration', () => {
      const game = createPitch001Game('octave', 'easy');
      const config = game.getModeConfig();
      
      expect(config).toBeDefined();
      expect(config?.id).toBe('octave');
      expect(config?.name).toBeDefined();
      expect(config?.description).toBeDefined();
    });
  });
});

describe('Pitch-001 Integration', () => {
  it('should handle all difficulty levels for all modes', () => {
    const modes = ['octave', 'interval', 'bend', 'vibrato', 'glissando', 'portamento', 'envelope', 'harmonic', 'relative', 'absolute'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    modes.forEach(modeId => {
      difficulties.forEach(difficulty => {
        expect(() => {
          const game = createPitch001Game(modeId, difficulty as any);
          const round = game.generateRound();
          
          expect(round.modeId).toBe(modeId);
          expect(round.difficulty).toBe(difficulty);
        }).not.toThrow();
      });
    });
  });

  it('should generate properly formatted round IDs', () => {
    const game = createPitch001Game('octave', 'easy');
    const round = game.generateRound();
    
    expect(round.id).toMatch(/^octave-\d+$/);
  });

  it('should handle rapid round generation', () => {
    const game = createPitch001Game('octave', 'easy');
    
    expect(() => {
      for (let i = 0; i < 100; i++) {
        const round = game.generateRound();
        expect(round).toBeDefined();
      }
    }).not.toThrow();
  });
});