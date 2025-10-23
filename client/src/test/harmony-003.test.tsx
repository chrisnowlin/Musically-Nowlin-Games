import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initializeGame, 
  generateGameRounds, 
  updateGameState, 
  calculateGameResults,
  getProgressionAudioData,
  getFeatureAudioData,
  getRhythmAudioData
} from '@/lib/gameLogic/harmony-003Logic';
import { HARMONY_MODES, CHORD_PROGRESSIONS, HARMONIC_FEATURES, HARMONIC_RHYTHMS } from '@/lib/gameLogic/harmony-003Modes';

describe('harmony-003Logic', () => {
  describe('Game Initialization', () => {
    it('should initialize game with correct default state', () => {
      const gameState = initializeGame('progressions', 1);
      
      expect(gameState.mode).toBe('progressions');
      expect(gameState.difficulty).toBe(1);
      expect(gameState.score).toBe(0);
      expect(gameState.currentRound).toBe(0);
      expect(gameState.streak).toBe(0);
      expect(gameState.totalRounds).toBe(12);
      expect(gameState.rounds).toEqual([]);
      expect(gameState.totalRounds).toBeGreaterThan(0);
    });

    it('should initialize different modes with correct round counts', () => {
      const progressionsState = initializeGame('progressions', 1);
      const featuresState = initializeGame('features', 1);
      const rhythmState = initializeGame('rhythm', 1);
      
      expect(progressionsState.totalRounds).toBe(12);
      expect(featuresState.totalRounds).toBe(15);
      expect(rhythmState.totalRounds).toBe(10);
    });
  });

  describe('Round Generation', () => {
    it('should generate correct number of rounds for progressions mode', () => {
      const gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      
      expect(rounds).toHaveLength(12);
      rounds.forEach((round, index) => {
        expect(round.id).toMatch(/^round-/); // ID should be a string with prefix
        expect(round.questionType).toBe('progression');
        expect(round.progression).toBeDefined();
        expect(round.options.length).toBeGreaterThanOrEqual(2);
        expect(round.options).toContain(round.answer);
      });
    });

    it('should generate correct number of rounds for features mode', () => {
      const gameState = initializeGame('features', 1);
      const rounds = generateGameRounds('features', 1);
      
      expect(rounds).toHaveLength(15);
      rounds.forEach((round, index) => {
        expect(round.id).toMatch(/^round-/); // ID should be a string with prefix
        expect(round.questionType).toBe('feature');
        expect(round.feature).toBeDefined();
        expect(round.options.length).toBeGreaterThanOrEqual(2);
        expect(round.options).toContain(round.answer);
      });
    });

    it('should generate correct number of rounds for rhythm mode', () => {
      const gameState = initializeGame('rhythm', 1);
      const rounds = generateGameRounds('rhythm', 1);
      
      expect(rounds).toHaveLength(10);
      rounds.forEach((round, index) => {
        expect(round.id).toMatch(/^round-/); // ID should be a string with prefix
        expect(round.questionType).toBe('rhythm');
        expect(round.rhythm).toBeDefined();
        expect(round.options.length).toBeGreaterThanOrEqual(2);
        expect(round.options).toContain(round.answer);
      });
    });

    it('should generate appropriate difficulty content', () => {
      const easyRounds = generateGameRounds('progressions', 1);
      const hardRounds = generateGameRounds('progressions', 3);
      
      // Easy rounds should only use basic progressions
      const easyProgressions = easyRounds.map(r => r.answer);
      const basicProgressions = ['I-V-vi-IV', 'I-IV-V', 'I-vi-IV-V'];
      easyProgressions.forEach(progression => {
        expect(basicProgressions).toContain(progression);
      });
      
      // Hard rounds should include advanced progressions
      const hardProgressions = hardRounds.map(r => r.answer);
      const hasAdvanced = hardProgressions.some(p => 
        !basicProgressions.includes(p)
      );
      expect(hasAdvanced).toBe(true);
    });
  });

  describe('Game State Updates', () => {
    it('should update score correctly for correct answers', () => {
      let gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      gameState = { ...gameState, rounds };
      
      const currentRound = rounds[0];
      const updatedState = updateGameState(gameState, currentRound.id, currentRound.answer, 5000);
      
      expect(updatedState.score).toBeGreaterThan(0);
      expect(updatedState.streak).toBe(1);
      expect(updatedState.currentRound).toBe(1);
      expect(updatedState.answers).toHaveLength(1);
      expect(updatedState.answers[0].isCorrect).toBe(true);
    });

    it('should reset streak for incorrect answers', () => {
      let gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      gameState = { ...gameState, rounds, streak: 3 };
      
      const currentRound = rounds[0];
      const wrongAnswer = currentRound.options.find(opt => opt !== currentRound.answer) || '';
      const updatedState = updateGameState(gameState, currentRound.id, wrongAnswer, 5000);
      
      expect(updatedState.streak).toBe(0);
      expect(updatedState.answers[0].isCorrect).toBe(false);
    });

    it('should calculate time bonus correctly', () => {
      let gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      gameState = { ...gameState, rounds };
      
      const currentRound = rounds[0];
      
      // Fast answer should get more points
      const fastState = updateGameState(gameState, currentRound.id, currentRound.answer, 2000);
      const slowState = updateGameState(gameState, currentRound.id, currentRound.answer, 8000);
      
      expect(fastState.score).toBeGreaterThan(slowState.score);
    });
  });

  describe('Results Calculation', () => {
    it('should calculate results correctly', () => {
      let gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      
      // Simulate completing all rounds with mixed results
      let updatedState = { ...gameState, rounds };
      rounds.forEach((round, index) => {
        const isCorrect = index % 2 === 0; // Every other answer correct
        const answer = isCorrect ? round.answer : round.options.find(opt => opt !== round.answer) || '';
        updatedState = updateGameState(updatedState, round.id, answer, 5000);
      });
      
      const results = calculateGameResults(updatedState);
      
      expect(results.totalRounds).toBe(12);
      expect(results.correctAnswers).toBe(6); // Half correct
      expect(results.accuracy).toBe(50);
      expect(results.score).toBeGreaterThan(0);
      expect(results.averageTime).toBeGreaterThan(0);
    });

    it('should provide improvement tips for low scores', () => {
      let gameState = initializeGame('progressions', 1);
      const rounds = generateGameRounds('progressions', 1);
      
      // Simulate all incorrect answers
      let updatedState = { ...gameState, rounds };
      rounds.forEach(round => {
        const wrongAnswer = round.options.find(opt => opt !== round.answer) || '';
        updatedState = updateGameState(updatedState, round.id, wrongAnswer, 5000);
      });
      
      const results = calculateGameResults(updatedState);
      
      expect(results.improvements.length).toBeGreaterThan(0);
      expect(results.improvements[0]).toContain('Focus');
    });
  });

  describe('Audio Data Generation', () => {
    it('should generate progression audio data', () => {
      const audioData = getProgressionAudioData(['I', 'V', 'vi', 'IV']);
      
      expect(audioData).toHaveLength(4);
      audioData.forEach(chord => {
        expect(chord.frequencies).toBeDefined();
        expect(chord.frequencies.length).toBeGreaterThan(0);
        expect(chord.duration).toBeGreaterThan(0);
      });
    });

    it('should generate feature audio data for basic features', () => {
      const audioData = getFeatureAudioData('authentic-cadence');
      
      expect(audioData.frequencies).toBeDefined();
      expect(audioData.frequencies.length).toBeGreaterThan(0);
      expect(audioData.duration).toBeGreaterThan(0);
    });

    it('should handle secondary dominant feature audio data', () => {
      // Test that we can handle features that might have complex chords
      expect(() => {
        getFeatureAudioData('secondary-dominant');
      }).not.toThrow();
    });

    it('should generate rhythm audio data', () => {
      const audioData = getRhythmAudioData('one-per-measure');
      
      expect(audioData.chordChanges).toBeDefined();
      expect(audioData.chordChanges.length).toBeGreaterThan(0);
      expect(audioData.chordChanges[0]).toBeGreaterThan(0);
    });
  });
});

describe('harmony-003Modes', () => {
  describe('Mode Definitions', () => {
    it('should have three game modes defined', () => {
      expect(HARMONY_MODES).toHaveLength(3);
      expect(HARMONY_MODES.map(m => m.id)).toEqual(['progressions', 'features', 'rhythm']);
    });

    it('should have valid mode properties', () => {
      HARMONY_MODES.forEach(mode => {
        expect(mode.id).toBeDefined();
        expect(mode.name).toBeDefined();
        expect(mode.description).toBeDefined();
        expect(mode.icon).toBeDefined();
        expect(mode.ageRange).toBeDefined();
        expect(mode.difficulty).toMatch(/^(easy|medium|hard)$/);
        expect(mode.maxRounds).toBeGreaterThan(0);
        expect(mode.maxDifficulty).toBeGreaterThan(0);
        expect(mode.instructions).toBeDefined();
      });
    });
  });

  describe('Chord Progressions', () => {
    it('should have common progressions defined', () => {
      expect(CHORD_PROGRESSIONS['I-V-vi-IV']).toBeDefined();
      expect(CHORD_PROGRESSIONS['I-IV-V']).toBeDefined();
      expect(CHORD_PROGRESSIONS['ii-V-I']).toBeDefined();
    });

    it('should have valid progression properties', () => {
      Object.entries(CHORD_PROGRESSIONS).forEach(([key, progression]) => {
        expect(progression.chords).toBeDefined();
        expect(progression.chords.length).toBeGreaterThan(0);
        expect(progression.difficulty).toBeGreaterThan(0);
        expect(progression.difficulty).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Harmonic Features', () => {
    it('should have common features defined', () => {
      expect(HARMONIC_FEATURES['authentic-cadence']).toBeDefined();
      expect(HARMONIC_FEATURES['half-cadence']).toBeDefined();
      expect(HARMONIC_FEATURES['plagal-cadence']).toBeDefined();
    });

    it('should have valid feature properties', () => {
      Object.entries(HARMONIC_FEATURES).forEach(([key, feature]) => {
        expect(feature.difficulty).toBeGreaterThan(0);
        expect(feature.difficulty).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Harmonic Rhythms', () => {
    it('should have common rhythms defined', () => {
      expect(HARMONIC_RHYTHMS['one-per-measure']).toBeDefined();
      expect(HARMONIC_RHYTHMS['two-per-measure']).toBeDefined();
      expect(HARMONIC_RHYTHMS['four-per-measure']).toBeDefined();
    });

    it('should have valid rhythm properties', () => {
      Object.entries(HARMONIC_RHYTHMS).forEach(([key, rhythm]) => {
        expect(rhythm.pattern).toBeDefined();
        expect(rhythm.pattern.length).toBeGreaterThan(0);
        expect(rhythm.difficulty).toBeGreaterThan(0);
        expect(rhythm.difficulty).toBeLessThanOrEqual(3);
      });
    });
  });
});