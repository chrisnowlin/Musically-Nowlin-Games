/**
 * Tests for Timbre-001 Instrument Master Game
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeGame,
  generateRound,
  generateGameRounds,
  validateAnswer,
  calculateScore,
  updateGameState,
  calculateGameResults,
  getInstrumentAudioProperties,
  getFamilyColor,
  getModeConfig,
  getNextDifficulty,
  isReadyForNextDifficulty
} from '@/lib/gameLogic/timbre-001Logic';
import { TIMBRE_MODES, INSTRUMENT_FAMILIES, INSTRUMENTS } from '@/lib/gameLogic/timbre-001Modes';

describe('Timbre-001 Game Logic', () => {
  describe('initializeGame', () => {
    it('should initialize game with correct default values', () => {
      const gameState = initializeGame('families', 1);
      
      expect(gameState.currentRound).toBe(0);
      expect(gameState.totalRounds).toBe(10);
      expect(gameState.score).toBe(0);
      expect(gameState.streak).toBe(0);
      expect(gameState.mode).toBe('families');
      expect(gameState.difficulty).toBe(1);
      expect(gameState.rounds).toEqual([]);
      expect(gameState.answers).toEqual([]);
      expect(gameState.gameStatus).toBe('menu');
    });

    it('should throw error for invalid mode', () => {
      expect(() => initializeGame('invalid-mode', 1)).toThrow('Invalid mode: invalid-mode');
    });

    it('should use correct max rounds for different modes', () => {
      const familiesGame = initializeGame('families', 1);
      const typesGame = initializeGame('types', 1);
      const specificGame = initializeGame('specific-instruments', 1);

      expect(familiesGame.totalRounds).toBe(10);
      expect(typesGame.totalRounds).toBe(12);
      expect(specificGame.totalRounds).toBe(15);
    });
  });

  describe('generateRound', () => {
    it('should generate families mode round', () => {
      const round = generateRound('families', 1);
      
      expect(round.mode).toBe('families');
      expect(round.difficulty).toBe(1);
      expect(round.question).toContain('What family');
      expect(round.options).toHaveLength(2);
      expect(round.options).toContain(round.answer);
      expect(round.questionType).toBe('sound');
      expect(round.instrument).toBeDefined();
      expect(round.family).toBeDefined();
    });

    it('should generate types mode round', () => {
      const round = generateRound('types', 1);
      
      expect(round.mode).toBe('types');
      expect(round.difficulty).toBe(1);
      expect(round.question).toContain('What specific instrument');
      expect(round.options).toHaveLength(2);
      expect(round.options).toContain(round.answer);
      expect(round.questionType).toBe('sound');
    });

    it('should generate specific-instruments mode round', () => {
      const round = generateRound('specific-instruments', 1);
      
      expect(round.mode).toBe('specific-instruments');
      expect(round.difficulty).toBe(1);
      expect(round.options).toHaveLength(2);
      expect(round.options).toContain(round.answer);
      expect(['sound', 'image']).toContain(round.questionType);
    });

    it('should throw error for invalid mode', () => {
      expect(() => generateRound('invalid-mode', 1)).toThrow('No difficulty settings found for mode invalid-mode, difficulty 1');
    });

    it('should increase options with difficulty', () => {
      const easyRound = generateRound('families', 1);
      const mediumRound = generateRound('families', 2);
      const hardRound = generateRound('families', 3);

      expect(easyRound.options.length).toBeLessThanOrEqual(mediumRound.options.length);
      expect(mediumRound.options.length).toBeLessThanOrEqual(hardRound.options.length);
    });
  });

  describe('generateGameRounds', () => {
    it('should generate correct number of rounds', () => {
      const rounds = generateGameRounds('families', 1);
      expect(rounds).toHaveLength(10);
    });

    it('should generate rounds with unique IDs', () => {
      const rounds = generateGameRounds('families', 1);
      const ids = rounds.map(r => r.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);
    });

    it('should throw error for invalid mode', () => {
      expect(() => generateGameRounds('invalid-mode', 1)).toThrow('Invalid mode: invalid-mode');
    });
  });

  describe('validateAnswer', () => {
    it('should return true for correct answer', () => {
      expect(validateAnswer('violin', 'violin')).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      expect(validateAnswer('violin', 'flute')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(validateAnswer('Violin', 'violin')).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for incorrect answer', () => {
      const score = calculateScore(false, 5000, 1, 0);
      expect(score).toBe(0);
    });

    it('should calculate base score correctly', () => {
      const score = calculateScore(true, 5000, 1, 0);
      expect(score).toBeGreaterThan(100);
    });

    it('should include difficulty multiplier', () => {
      const easyScore = calculateScore(true, 5000, 1, 0);
      const hardScore = calculateScore(true, 5000, 3, 0);
      expect(hardScore).toBeGreaterThan(easyScore);
    });

    it('should include time bonus', () => {
      const fastScore = calculateScore(true, 1000, 1, 0);
      const slowScore = calculateScore(true, 10000, 1, 0);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should include streak bonus', () => {
      const noStreakScore = calculateScore(true, 5000, 1, 0);
      const streakScore = calculateScore(true, 5000, 1, 5);
      expect(streakScore).toBeGreaterThan(noStreakScore);
    });
  });

  describe('updateGameState', () => {
    let gameState: any;

    beforeEach(() => {
      gameState = initializeGame('families', 1);
      gameState.rounds = generateGameRounds('families', 1);
    });

    it('should update score for correct answer', () => {
      const currentRound = gameState.rounds[0];
      const updatedState = updateGameState(gameState, currentRound.id, currentRound.answer, 5000);
      
      expect(updatedState.score).toBeGreaterThan(0);
      expect(updatedState.streak).toBe(1);
      expect(updatedState.currentRound).toBe(1);
    });

    it('should reset streak for incorrect answer', () => {
      const currentRound = gameState.rounds[0];
      const updatedState = updateGameState(gameState, currentRound.id, 'wrong-answer', 5000);
      
      expect(updatedState.score).toBe(0);
      expect(updatedState.streak).toBe(0);
      expect(updatedState.currentRound).toBe(1);
    });

    it('should add answer to answers array', () => {
      const currentRound = gameState.rounds[0];
      const updatedState = updateGameState(gameState, currentRound.id, currentRound.answer, 5000);
      
      expect(updatedState.answers).toHaveLength(1);
      expect(updatedState.answers[0]).toMatchObject({
        roundId: currentRound.id,
        userAnswer: currentRound.answer,
        correctAnswer: currentRound.answer,
        isCorrect: true,
        timeSpent: 5000
      });
    });

    it('should set game status to finished when all rounds completed', () => {
      gameState.currentRound = gameState.totalRounds - 1;
      const currentRound = gameState.rounds[gameState.currentRound];
      const updatedState = updateGameState(gameState, currentRound.id, currentRound.answer, 5000);
      
      expect(updatedState.gameStatus).toBe('finished');
    });

    it('should throw error for invalid round ID', () => {
      expect(() => updateGameState(gameState, 'invalid-id', 'answer', 5000))
        .toThrow('Round invalid-id not found');
    });
  });

  describe('calculateGameResults', () => {
    let gameState: any;

    beforeEach(() => {
      gameState = initializeGame('families', 1);
      gameState.rounds = generateGameRounds('families', 1);
    });

    it('should calculate results correctly', () => {
      // Simulate some answers
      for (let i = 0; i < 5; i++) {
        const round = gameState.rounds[i];
        gameState = updateGameState(gameState, round.id, round.answer, 5000);
      }

      const results = calculateGameResults(gameState);
      
      expect(results.score).toBeGreaterThan(0);
      expect(results.totalRounds).toBe(10);
      expect(results.correctAnswers).toBe(5);
      expect(results.accuracy).toBe(100);
      expect(results.mode).toBe('families');
      expect(results.difficulty).toBe(1);
    });

    it('should provide improvement suggestions for low accuracy', () => {
      // Simulate poor performance
      for (let i = 0; i < 10; i++) {
        const round = gameState.rounds[i];
        gameState = updateGameState(gameState, round.id, 'wrong-answer', 5000);
      }

      const results = calculateGameResults(gameState);
      expect(results.improvements.length).toBeGreaterThan(0);
      expect(results.improvements[0]).toContain('listening more carefully');
    });

    it('should suggest speed improvements for slow answers', () => {
      // Simulate slow answers
      for (let i = 0; i < 5; i++) {
        const round = gameState.rounds[i];
        gameState = updateGameState(gameState, round.id, round.answer, 15000);
      }

      const results = calculateGameResults(gameState);
      expect(results.improvements.some(imp => imp.includes('quickly'))).toBe(true);
    });
  });

  describe('getInstrumentAudioProperties', () => {
    it('should return audio properties for valid instrument', () => {
      const props = getInstrumentAudioProperties('violin');
      
      expect(props).toHaveProperty('frequency');
      expect(props).toHaveProperty('waveform');
      expect(props).toHaveProperty('envelope');
      expect(props.frequency).toBe(440);
      expect(props.waveform).toBe('sawtooth');
    });

    it('should throw error for invalid instrument', () => {
      expect(() => getInstrumentAudioProperties('invalid-instrument'))
        .toThrow('Instrument invalid-instrument not found');
    });
  });

  describe('getFamilyColor', () => {
    it('should return correct color for valid family', () => {
      expect(getFamilyColor('strings')).toBe('bg-amber-600');
      expect(getFamilyColor('woodwinds')).toBe('bg-green-600');
      expect(getFamilyColor('brass')).toBe('bg-yellow-600');
    });

    it('should return default color for invalid family', () => {
      expect(getFamilyColor('invalid-family')).toBe('bg-gray-500');
    });
  });

  describe('getModeConfig', () => {
    it('should return correct config for valid mode', () => {
      const config = getModeConfig('families');
      expect(config?.id).toBe('families');
      expect(config?.name).toBe('Instrument Families');
      expect(config?.icon).toBe('🎻');
    });

    it('should return undefined for invalid mode', () => {
      expect(getModeConfig('invalid-mode')).toBeUndefined();
    });
  });

  describe('getNextDifficulty', () => {
    it('should increase difficulty within limits', () => {
      expect(getNextDifficulty(1, 'families')).toBe(2);
      expect(getNextDifficulty(2, 'families')).toBe(3);
    });

    it('should not exceed max difficulty', () => {
      expect(getNextDifficulty(3, 'families')).toBe(3);
      expect(getNextDifficulty(5, 'families')).toBe(3);
    });

    it('should return current difficulty for invalid mode', () => {
      expect(getNextDifficulty(2, 'invalid-mode')).toBe(2);
    });
  });

  describe('isReadyForNextDifficulty', () => {
    it('should return true for high accuracy', () => {
      const results = {
        score: 800,
        totalRounds: 10,
        correctAnswers: 9,
        accuracy: 90,
        averageTime: 5000,
        difficulty: 1,
        mode: 'families',
        improvements: []
      };
      
      expect(isReadyForNextDifficulty(results)).toBe(true);
    });

    it('should return false for low accuracy', () => {
      const results = {
        score: 200,
        totalRounds: 10,
        correctAnswers: 3,
        accuracy: 30,
        averageTime: 5000,
        difficulty: 1,
        mode: 'families',
        improvements: ['Keep practicing']
      };
      
      expect(isReadyForNextDifficulty(results)).toBe(false);
    });

    it('should return false for insufficient correct answers', () => {
      const results = {
        score: 600,
        totalRounds: 10,
        correctAnswers: 7,
        accuracy: 70,
        averageTime: 5000,
        difficulty: 1,
        mode: 'families',
        improvements: []
      };
      
      expect(isReadyForNextDifficulty(results)).toBe(false);
    });
  });
});

describe('Timbre-001 Modes and Data', () => {
  describe('TIMBRE_MODES', () => {
    it('should have correct number of modes', () => {
      expect(TIMBRE_MODES).toHaveLength(3);
    });

    it('should have required modes', () => {
      const modeIds = TIMBRE_MODES.map(m => m.id);
      expect(modeIds).toContain('families');
      expect(modeIds).toContain('types');
      expect(modeIds).toContain('specific-instruments');
    });

    it('should have all required properties', () => {
      TIMBRE_MODES.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('ageRange');
        expect(mode).toHaveProperty('difficulty');
        expect(mode).toHaveProperty('maxRounds');
        expect(mode).toHaveProperty('maxDifficulty');
        expect(mode).toHaveProperty('instructions');
      });
    });
  });

  describe('INSTRUMENT_FAMILIES', () => {
    it('should have all required families', () => {
      const families = Object.keys(INSTRUMENT_FAMILIES);
      expect(families).toContain('strings');
      expect(families).toContain('woodwinds');
      expect(families).toContain('brass');
      expect(families).toContain('percussion');
      expect(families).toContain('keyboard');
      expect(families).toContain('electronic');
    });

    it('should have correct structure for each family', () => {
      Object.values(INSTRUMENT_FAMILIES).forEach(family => {
        expect(family).toHaveProperty('name');
        expect(family).toHaveProperty('description');
        expect(family).toHaveProperty('examples');
        expect(family).toHaveProperty('color');
        expect(Array.isArray(family.examples)).toBe(true);
      });
    });
  });

  describe('INSTRUMENTS', () => {
    it('should have instruments for each family', () => {
      const instruments = Object.values(INSTRUMENTS);
      const families = [...new Set(instruments.map(i => i.family))];
      
      expect(families).toContain('strings');
      expect(families).toContain('woodwinds');
      expect(families).toContain('brass');
      expect(families).toContain('percussion');
      expect(families).toContain('keyboard');
      expect(families).toContain('electronic');
    });

    it('should have correct structure for each instrument', () => {
      Object.values(INSTRUMENTS).forEach(instrument => {
        expect(instrument).toHaveProperty('family');
        expect(instrument).toHaveProperty('name');
        expect(instrument).toHaveProperty('description');
        expect(instrument).toHaveProperty('frequency');
        expect(instrument).toHaveProperty('waveform');
        expect(instrument).toHaveProperty('envelope');
        
        expect(typeof instrument.frequency).toBe('number');
        expect(typeof instrument.waveform).toBe('string');
        expect(typeof instrument.envelope).toBe('object');
      });
    });

    it('should have valid audio properties', () => {
      Object.values(INSTRUMENTS).forEach(instrument => {
        expect(instrument.frequency).toBeGreaterThan(0);
        expect(['sine', 'square', 'sawtooth', 'triangle']).toContain(instrument.waveform);
        expect(instrument.envelope).toHaveProperty('attack');
        expect(instrument.envelope).toHaveProperty('decay');
        expect(instrument.envelope).toHaveProperty('sustain');
        expect(instrument.envelope).toHaveProperty('release');
      });
    });
  });
});