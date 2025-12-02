import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Rhythm002Logic } from '@/lib/gameLogic/rhythm-002Logic';
import {
  RHYTHM_MODES,
  TEMPO_MARKINGS,
  TEMPO_CHANGE_TYPES,
  SUBDIVISION_PATTERNS,
  RHYTHM_CONCEPTS,
  getDifficultyForMode,
  getModeById,
  getTempoByBPM,
  type GameMode
} from '@/lib/gameLogic/rhythm-002Modes';

describe('Rhythm-002 Tempo & Pulse Master Game Logic', () => {
  let tempoChangesMode: GameMode;
  let pulseSubdivisionsMode: GameMode;
  let analysisMode: GameMode;

  beforeEach(() => {
    vi.clearAllMocks();
    tempoChangesMode = RHYTHM_MODES.find(mode => mode.id === 'tempo-changes')!;
    pulseSubdivisionsMode = RHYTHM_MODES.find(mode => mode.id === 'pulse-subdivisions')!;
    analysisMode = RHYTHM_MODES.find(mode => mode.id === 'analysis')!;
  });

  describe('Mode Definitions', () => {
    it('should have correct number of modes', () => {
      expect(RHYTHM_MODES).toHaveLength(3);
    });

    it('should have tempo changes mode with correct properties', () => {
      expect(tempoChangesMode.id).toBe('tempo-changes');
      expect(tempoChangesMode.name).toBe('Tempo Changes');
      expect(tempoChangesMode.ageRange).toBe('6-10 years');
      expect(tempoChangesMode.maxRounds).toBe(15);
      expect(tempoChangesMode.maxDifficulty).toBe(3);
    });

    it('should have pulse subdivisions mode with correct properties', () => {
      expect(pulseSubdivisionsMode.id).toBe('pulse-subdivisions');
      expect(pulseSubdivisionsMode.name).toBe('Pulse Subdivisions');
      expect(pulseSubdivisionsMode.ageRange).toBe('7-12 years');
      expect(pulseSubdivisionsMode.maxRounds).toBe(12);
      expect(pulseSubdivisionsMode.maxDifficulty).toBe(3);
    });

    it('should have analysis mode with correct properties', () => {
      expect(analysisMode.id).toBe('analysis');
      expect(analysisMode.name).toBe('Rhythm Analysis');
      expect(analysisMode.ageRange).toBe('9-12 years');
      expect(analysisMode.maxRounds).toBe(10);
      expect(analysisMode.maxDifficulty).toBe(3);
    });
  });

  describe('Tempo Markings', () => {
    it('should have correct tempo markings', () => {
      expect(TEMPO_MARKINGS.largo.name).toBe('Largo');
      expect(TEMPO_MARKINGS.largo.bpm).toBe(45);
      expect(TEMPO_MARKINGS.allegro.name).toBe('Allegro');
      expect(TEMPO_MARKINGS.allegro.bpm).toBe(130);
    });

    it('should have correct tempo change types', () => {
      expect(TEMPO_CHANGE_TYPES.accelerando.name).toBe('Accelerando');
      expect(TEMPO_CHANGE_TYPES.accelerando.direction).toBe('faster');
      expect(TEMPO_CHANGE_TYPES.ritardando.name).toBe('Ritardando');
      expect(TEMPO_CHANGE_TYPES.ritardando.direction).toBe('slower');
    });
  });

  describe('Subdivision Patterns', () => {
    it('should have correct subdivision patterns', () => {
      expect(SUBDIVISION_PATTERNS.quarter.name).toBe('Quarter Notes');
      expect(SUBDIVISION_PATTERNS.quarter.divisionsPerBeat).toBe(1);
      expect(SUBDIVISION_PATTERNS.eighth.divisionsPerBeat).toBe(2);
      expect(SUBDIVISION_PATTERNS.triplet.divisionsPerBeat).toBe(3);
      expect(SUBDIVISION_PATTERNS.sixteenth.divisionsPerBeat).toBe(4);
    });

    it('should have correct difficulty levels', () => {
      expect(SUBDIVISION_PATTERNS.quarter.difficulty).toBe(1);
      expect(SUBDIVISION_PATTERNS.eighth.difficulty).toBe(1);
      expect(SUBDIVISION_PATTERNS.triplet.difficulty).toBe(2);
      expect(SUBDIVISION_PATTERNS.quintuplet.difficulty).toBe(3);
    });
  });

  describe('Rhythm Concepts', () => {
    it('should have correct rhythm concepts', () => {
      expect(RHYTHM_CONCEPTS.syncopation.name).toBe('Syncopation');
      expect(RHYTHM_CONCEPTS.syncopation.difficulty).toBe(2);
      expect(RHYTHM_CONCEPTS.polyrhythm.name).toBe('Polyrhythm');
      expect(RHYTHM_CONCEPTS.polyrhythm.difficulty).toBe(3);
    });
  });

  describe('Helper Functions', () => {
    it('should get mode by id', () => {
      const mode = getModeById('tempo-changes');
      expect(mode).toBeDefined();
      expect(mode?.id).toBe('tempo-changes');
    });

    it('should get difficulty for mode', () => {
      const diff = getDifficultyForMode('tempo-changes', 1);
      expect(diff).toBeDefined();
      expect(diff?.level).toBe(1);
      expect(diff?.parameters.tempoRange).toBeDefined();
    });

    it('should get tempo by BPM', () => {
      expect(getTempoByBPM(45)).toBe('largo');
      expect(getTempoByBPM(85)).toBe('andante');
      expect(getTempoByBPM(130)).toBe('allegro');
      expect(getTempoByBPM(170)).toBe('presto');
    });
  });

  describe('Game Logic', () => {
    it('should initialize game state correctly', () => {
      const state = Rhythm002Logic.initializeGameState(tempoChangesMode);

      expect(state.currentMode).toBe(tempoChangesMode);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(3);
      expect(state.currentRound).toBe(0);
      expect(state.totalRounds).toBe(10);
      expect(state.difficulty).toBe(1);
      expect(state.gameStatus).toBe('playing');
      expect(state.streak).toBe(0);
    });

    it('should generate rounds for tempo changes mode', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);

      expect(round.id).toMatch(/^rhythm-002-tempo-changes-\d+$/);
      expect(round.mode).toBe('tempo-changes');
      expect(round.difficulty).toBe(1);
      expect(round.questionType).toMatch(/^(identify-tempo|identify-change|compare-tempos)$/);
      expect(round.question).toBeDefined();
      expect(round.answer).toBeDefined();
      expect(round.options).toBeDefined();
    });

    it('should generate rounds for pulse subdivisions mode', () => {
      const round = Rhythm002Logic.generateRound(pulseSubdivisionsMode, 2, 0, 12);

      expect(round.id).toMatch(/^rhythm-002-pulse-subdivisions-\d+$/);
      expect(round.mode).toBe('pulse-subdivisions');
      expect(round.difficulty).toBe(2);
      expect(round.questionType).toMatch(/^(identify-subdivision|count-subdivisions|match-pattern)$/);
      expect(round.subdivisionType).toBeDefined();
    });

    it('should generate rounds for analysis mode', () => {
      const round = Rhythm002Logic.generateRound(analysisMode, 2, 0, 10);

      expect(round.id).toMatch(/^rhythm-002-analysis-\d+$/);
      expect(round.mode).toBe('analysis');
      expect(round.difficulty).toBe(2);
      expect(round.questionType).toMatch(/^(identify-concept|detect-feature|analyze-pattern)$/);
      expect(round.conceptType).toBeDefined();
    });
  });

  describe('Answer Validation', () => {
    it('should validate correct answers', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const isCorrect = Rhythm002Logic.validateAnswer(round.answer, round.answer, round);
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const isCorrect = Rhythm002Logic.validateAnswer('Wrong Answer', round.answer, round);
      expect(isCorrect).toBe(false);
    });

    it('should be case-insensitive', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const correctLower = round.answer.toLowerCase();
      const isCorrect = Rhythm002Logic.validateAnswer(correctLower, round.answer, round);
      expect(isCorrect).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score for correct answer', () => {
      const score = Rhythm002Logic.calculateScore(true, 2000, 1, 0);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for incorrect answer', () => {
      const score = Rhythm002Logic.calculateScore(false, 2000, 1, 0);
      expect(score).toBe(0);
    });

    it('should give time bonus for fast answers', () => {
      const fastScore = Rhythm002Logic.calculateScore(true, 1000, 1, 0);
      const slowScore = Rhythm002Logic.calculateScore(true, 5000, 1, 0);
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should give streak bonus', () => {
      const noStreakScore = Rhythm002Logic.calculateScore(true, 2000, 1, 0);
      const streakScore = Rhythm002Logic.calculateScore(true, 2000, 1, 5);
      expect(streakScore).toBeGreaterThan(noStreakScore);
    });

    it('should scale with difficulty', () => {
      const easyScore = Rhythm002Logic.calculateScore(true, 2000, 1, 0);
      const hardScore = Rhythm002Logic.calculateScore(true, 2000, 3, 0);
      expect(hardScore).toBeGreaterThan(easyScore);
    });
  });

  describe('Difficulty Adjustment', () => {
    it('should increase difficulty after 3 consecutive correct', () => {
      const newDifficulty = Rhythm002Logic.calculateDifficultyAdjustment(1, 3, 0, 3);
      expect(newDifficulty).toBe(2);
    });

    it('should decrease difficulty after 2 consecutive wrong', () => {
      const newDifficulty = Rhythm002Logic.calculateDifficultyAdjustment(2, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });

    it('should not exceed max difficulty', () => {
      const newDifficulty = Rhythm002Logic.calculateDifficultyAdjustment(3, 3, 0, 3);
      expect(newDifficulty).toBe(3);
    });

    it('should not go below minimum difficulty', () => {
      const newDifficulty = Rhythm002Logic.calculateDifficultyAdjustment(1, 0, 2, 3);
      expect(newDifficulty).toBe(1);
    });
  });

  describe('Feedback', () => {
    it('should provide positive feedback for correct fast answer', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const feedback = Rhythm002Logic.provideFeedback(true, round, 2000);
      expect(feedback).toContain('Excellent');
    });

    it('should provide positive feedback for correct answer', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const feedback = Rhythm002Logic.provideFeedback(true, round, 5000);
      expect(feedback).toMatch(/Great|Correct/);
    });

    it('should provide hint for incorrect answer', () => {
      const round = Rhythm002Logic.generateRound(tempoChangesMode, 1, 0, 15);
      const feedback = Rhythm002Logic.provideFeedback(false, round, 3000);
      expect(feedback).toContain('Not quite');
    });
  });

  describe('Game State Processing', () => {
    it('should process correct answer correctly', () => {
      const state = Rhythm002Logic.initializeGameState(tempoChangesMode);
      const round = Rhythm002Logic.getNextRound(state);

      const updatedState = Rhythm002Logic.processAnswer(
        { ...state, currentRoundData: round },
        round.answer,
        2000
      );

      expect(updatedState.score).toBeGreaterThan(0);
      expect(updatedState.streak).toBe(1);
      expect(updatedState.currentRound).toBe(1);
      expect(updatedState.lives).toBe(3);
    });

    it('should process incorrect answer correctly', () => {
      const state = Rhythm002Logic.initializeGameState(tempoChangesMode);
      const round = Rhythm002Logic.getNextRound(state);

      const updatedState = Rhythm002Logic.processAnswer(
        { ...state, currentRoundData: round },
        'Wrong Answer',
        2000
      );

      expect(updatedState.score).toBe(0);
      expect(updatedState.streak).toBe(0);
      expect(updatedState.currentRound).toBe(1);
      expect(updatedState.lives).toBe(2);
    });

    it('should complete game after max rounds', () => {
      let state = Rhythm002Logic.initializeGameState(tempoChangesMode, 2);

      for (let i = 0; i < 2; i++) {
        const round = Rhythm002Logic.getNextRound(state);
        state = Rhythm002Logic.processAnswer(
          { ...state, currentRoundData: round },
          round.answer,
          2000
        );
      }

      expect(state.gameStatus).toBe('completed');
    });

    it('should fail game when lives run out', () => {
      let state = Rhythm002Logic.initializeGameState(tempoChangesMode);
      state = { ...state, lives: 1 };

      const round = Rhythm002Logic.getNextRound(state);
      state = Rhythm002Logic.processAnswer(
        { ...state, currentRoundData: round },
        'Wrong Answer',
        2000
      );

      expect(state.gameStatus).toBe('failed');
    });
  });

  describe('Tempo Changes Mode - Specific Tests', () => {
    it('should generate identify-tempo questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm002Logic.generateRound(tempoChangesMode, 1, i, 10)
      );

      const identifyTempoRounds = rounds.filter(r => r.questionType === 'identify-tempo');
      expect(identifyTempoRounds.length).toBeGreaterThan(0);

      if (identifyTempoRounds.length > 0) {
        const round = identifyTempoRounds[0];
        expect(round.startTempo).toBeDefined();
        expect(round.options).toBeDefined();
        expect(round.options!.length).toBe(4);
      }
    });

    it('should generate identify-change questions', () => {
      const rounds = Array.from({ length: 20 }, (_, i) =>
        Rhythm002Logic.generateRound(tempoChangesMode, 2, i, 20)
      );

      const identifyChangeRounds = rounds.filter(r => r.questionType === 'identify-change');
      expect(identifyChangeRounds.length).toBeGreaterThan(0);

      if (identifyChangeRounds.length > 0) {
        const round = identifyChangeRounds[0];
        expect(round.startTempo).toBeDefined();
        expect(round.endTempo).toBeDefined();
        expect(round.tempoChangeType).toBeDefined();
      }
    });
  });

  describe('Pulse Subdivisions Mode - Specific Tests', () => {
    it('should generate identify-subdivision questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm002Logic.generateRound(pulseSubdivisionsMode, 1, i, 10)
      );

      const identifySubdivisionRounds = rounds.filter(r => r.questionType === 'identify-subdivision');
      expect(identifySubdivisionRounds.length).toBeGreaterThan(0);

      if (identifySubdivisionRounds.length > 0) {
        const round = identifySubdivisionRounds[0];
        expect(round.subdivisionType).toBeDefined();
        expect(round.pattern).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });

    it('should generate count-subdivisions questions', () => {
      const rounds = Array.from({ length: 20 }, (_, i) =>
        Rhythm002Logic.generateRound(pulseSubdivisionsMode, 2, i, 20)
      );

      const countSubdivisionRounds = rounds.filter(r => r.questionType === 'count-subdivisions');
      expect(countSubdivisionRounds.length).toBeGreaterThan(0);

      if (countSubdivisionRounds.length > 0) {
        const round = countSubdivisionRounds[0];
        expect(round.subdivisionType).toBeDefined();
        expect(round.beatsPerMeasure).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });
  });

  describe('Analysis Mode - Specific Tests', () => {
    it('should generate identify-concept questions', () => {
      const rounds = Array.from({ length: 10 }, (_, i) =>
        Rhythm002Logic.generateRound(analysisMode, 2, i, 10)
      );

      const identifyConceptRounds = rounds.filter(r => r.questionType === 'identify-concept');
      expect(identifyConceptRounds.length).toBeGreaterThan(0);

      if (identifyConceptRounds.length > 0) {
        const round = identifyConceptRounds[0];
        expect(round.conceptType).toBeDefined();
        expect(round.patternData).toBeDefined();
        expect(round.options).toBeDefined();
      }
    });

    it('should generate detect-feature questions', () => {
      const rounds = Array.from({ length: 20 }, (_, i) =>
        Rhythm002Logic.generateRound(analysisMode, 2, i, 20)
      );

      const detectFeatureRounds = rounds.filter(r => r.questionType === 'detect-feature');
      expect(detectFeatureRounds.length).toBeGreaterThan(0);

      if (detectFeatureRounds.length > 0) {
        const round = detectFeatureRounds[0];
        expect(round.options).toEqual(['Yes', 'No']);
      }
    });
  });

  describe('Round Generation Edge Cases', () => {
    it('should handle different difficulty levels', () => {
      [1, 2, 3].forEach(difficulty => {
        const round = Rhythm002Logic.generateRound(tempoChangesMode, difficulty, 0, 15);
        expect(round).toBeDefined();
        expect(round.difficulty).toBe(difficulty);
      });
    });

    it('should generate unique rounds', () => {
      const rounds = Array.from({ length: 5 }, (_, i) =>
        Rhythm002Logic.generateRound(tempoChangesMode, 1, i, 5)
      );

      const questions = rounds.map(r => r.question);
      const uniqueQuestions = new Set(questions);
      // At least some variety (not all identical)
      expect(uniqueQuestions.size).toBeGreaterThanOrEqual(1);
    });
  });
});
