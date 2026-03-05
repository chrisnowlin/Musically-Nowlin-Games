import { describe, it, expect } from 'vitest';
import {
  createLearningState,
  markGuidedSeen,
  recordCorrect,
  recordWrong,
  shouldGuide,
  getMastery,
  getMasteryLevel,
  getTopConfusion,
  masteryWeight,
  minSpacing,
  weightedPick,
  vocabConceptId,
  noteReadingConceptId,
  intervalConceptId,
  rhythmConceptId,
  timbreConceptId,
} from '../logic/learningState';

describe('learningState', () => {
  // ── Concept ID helpers ──────────────────────────────────

  describe('concept ID helpers', () => {
    it('generates vocab concept IDs', () => {
      expect(vocabConceptId('dynamics', 'f')).toBe('vocab:dynamics:f');
      expect(vocabConceptId('tempo', 'Allegro')).toBe('vocab:tempo:Allegro');
    });

    it('generates note reading concept IDs', () => {
      expect(noteReadingConceptId('treble', 'C4')).toBe('noteReading:treble:C4');
      expect(noteReadingConceptId('bass', 'G2')).toBe('noteReading:bass:G2');
    });

    it('generates interval concept IDs', () => {
      expect(intervalConceptId('highLow', 'Higher')).toBe('interval:highLow:Higher');
      expect(intervalConceptId('standard', '3rd')).toBe('interval:standard:3rd');
    });

    it('generates rhythm concept IDs', () => {
      expect(rhythmConceptId('t1-01')).toBe('rhythm:t1-01');
    });

    it('generates timbre concept IDs', () => {
      expect(timbreConceptId('t1-high')).toBe('timbre:t1-high');
    });
  });

  // ── Guided mode ─────────────────────────────────────────

  describe('guided mode (System 2)', () => {
    it('shouldGuide returns true for unseen concepts', () => {
      const state = createLearningState();
      expect(shouldGuide(state, 'vocab:dynamics:f')).toBe(true);
    });

    it('shouldGuide returns false after markGuidedSeen', () => {
      let state = createLearningState();
      state = markGuidedSeen(state, 'vocab:dynamics:f');
      expect(shouldGuide(state, 'vocab:dynamics:f')).toBe(false);
    });

    it('markGuidedSeen does not affect other concepts', () => {
      let state = createLearningState();
      state = markGuidedSeen(state, 'vocab:dynamics:f');
      expect(shouldGuide(state, 'vocab:dynamics:p')).toBe(true);
    });
  });

  // ── Mastery tracking ────────────────────────────────────

  describe('mastery tracking (System 5)', () => {
    it('starts with no mastery data', () => {
      const state = createLearningState();
      expect(getMastery(state, 'vocab:dynamics:f')).toBeUndefined();
      expect(getMasteryLevel(state, 'vocab:dynamics:f')).toBe('new');
    });

    it('records correct answers', () => {
      let state = createLearningState();
      state = recordCorrect(state, 'vocab:dynamics:f', 3);
      const m = getMastery(state, 'vocab:dynamics:f');
      expect(m).toBeDefined();
      expect(m!.correct).toBe(1);
      expect(m!.attempts).toBe(1);
      expect(m!.streak).toBe(1);
      expect(m!.lastSeenFloor).toBe(3);
      expect(m!.masteryLevel).toBe('learning');
    });

    it('records wrong answers and resets streak', () => {
      let state = createLearningState();
      state = recordCorrect(state, 'vocab:dynamics:f', 1);
      state = recordCorrect(state, 'vocab:dynamics:f', 2);
      state = recordWrong(state, 'vocab:dynamics:f', 3);
      const m = getMastery(state, 'vocab:dynamics:f');
      expect(m!.correct).toBe(2);
      expect(m!.attempts).toBe(3);
      expect(m!.streak).toBe(0);
    });

    it('progresses through mastery levels', () => {
      let state = createLearningState();
      const id = 'vocab:dynamics:f';

      // 1 correct: learning
      state = recordCorrect(state, id, 1);
      expect(getMasteryLevel(state, id)).toBe('learning');

      // 2 more correct (3 total, 100% accuracy): familiar
      state = recordCorrect(state, id, 2);
      state = recordCorrect(state, id, 3);
      expect(getMasteryLevel(state, id)).toBe('familiar');

      // 2 more correct (5 total, 100% accuracy, streak 5): mastered
      state = recordCorrect(state, id, 4);
      state = recordCorrect(state, id, 5);
      expect(getMasteryLevel(state, id)).toBe('mastered');
    });

    it('drops from mastered when streak breaks', () => {
      let state = createLearningState();
      const id = 'vocab:dynamics:f';
      for (let i = 1; i <= 5; i++) {
        state = recordCorrect(state, id, i);
      }
      expect(getMasteryLevel(state, id)).toBe('mastered');

      // Wrong answer breaks streak → drops to familiar
      state = recordWrong(state, id, 6);
      expect(getMasteryLevel(state, id)).toBe('familiar');
    });
  });

  // ── Confusion pairs ─────────────────────────────────────

  describe('confusion pairs (System 4/5)', () => {
    it('records confusion pairs on wrong answers', () => {
      let state = createLearningState();
      state = recordWrong(state, 'vocab:dynamics:f', 1, 'vocab:dynamics:p');
      state = recordWrong(state, 'vocab:dynamics:f', 2, 'vocab:dynamics:p');
      state = recordWrong(state, 'vocab:dynamics:f', 3, 'vocab:dynamics:mf');

      expect(getTopConfusion(state, 'vocab:dynamics:f')).toBe('vocab:dynamics:p');
    });

    it('returns undefined when no confusion data', () => {
      const state = createLearningState();
      expect(getTopConfusion(state, 'vocab:dynamics:f')).toBeUndefined();
    });
  });

  // ── Mastery weights ─────────────────────────────────────

  describe('mastery weights', () => {
    it('new concepts have highest weight', () => {
      expect(masteryWeight('new')).toBe(3);
    });

    it('mastered concepts have lowest weight', () => {
      expect(masteryWeight('mastered')).toBe(0.3);
    });

    it('weight order: new > learning > familiar > mastered', () => {
      expect(masteryWeight('new')).toBeGreaterThan(masteryWeight('learning'));
      expect(masteryWeight('learning')).toBeGreaterThan(masteryWeight('familiar'));
      expect(masteryWeight('familiar')).toBeGreaterThan(masteryWeight('mastered'));
    });
  });

  // ── Spacing ─────────────────────────────────────────────

  describe('spacing', () => {
    it('new concepts have no spacing requirement', () => {
      expect(minSpacing('new')).toBe(0);
    });

    it('mastered concepts have longest spacing', () => {
      expect(minSpacing('mastered')).toBe(5);
    });

    it('spacing order: new < learning < familiar < mastered', () => {
      expect(minSpacing('new')).toBeLessThan(minSpacing('learning'));
      expect(minSpacing('learning')).toBeLessThan(minSpacing('familiar'));
      expect(minSpacing('familiar')).toBeLessThan(minSpacing('mastered'));
    });
  });

  // ── Weighted pick ───────────────────────────────────────

  describe('weightedPick', () => {
    it('returns the only item from a single-item pool', () => {
      const state = createLearningState();
      const result = weightedPick(['A'], (x) => `test:${x}`, state, 1);
      expect(result).toBe('A');
    });

    it('returns an item from the pool', () => {
      const state = createLearningState();
      const pool = ['A', 'B', 'C', 'D'];
      const result = weightedPick(pool, (x) => `test:${x}`, state, 1);
      expect(pool).toContain(result);
    });

    it('throws on empty pool', () => {
      const state = createLearningState();
      expect(() => weightedPick([], (x) => `test:${x}`, state, 1)).toThrow();
    });

    it('favors new concepts over mastered ones', () => {
      let state = createLearningState();
      // Master concept A
      for (let i = 0; i < 6; i++) {
        state = recordCorrect(state, 'test:A', i);
      }
      expect(getMasteryLevel(state, 'test:A')).toBe('mastered');

      // Run many picks — B, C, D should appear much more than A
      const pool = ['A', 'B', 'C', 'D'];
      const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      for (let i = 0; i < 1000; i++) {
        const picked = weightedPick(pool, (x) => `test:${x}`, state, 100);
        counts[picked]++;
      }

      // A (mastered, weight 0.3) should appear much less than B/C/D (new, weight 3 each)
      expect(counts.A).toBeLessThan(counts.B);
      expect(counts.A).toBeLessThan(counts.C);
      expect(counts.A).toBeLessThan(counts.D);
    });
  });

  // ── Immutability ────────────────────────────────────────

  describe('immutability', () => {
    it('state mutations return new objects', () => {
      const original = createLearningState();
      const afterGuide = markGuidedSeen(original, 'vocab:dynamics:f');
      const afterCorrect = recordCorrect(original, 'vocab:dynamics:f', 1);
      const afterWrong = recordWrong(original, 'vocab:dynamics:f', 1, 'vocab:dynamics:p');

      // Original should be unchanged
      expect(original.seenConcepts.size).toBe(0);
      expect(original.conceptMastery.size).toBe(0);
      expect(original.confusionPairs.size).toBe(0);

      // Each mutation returns a new object
      expect(afterGuide).not.toBe(original);
      expect(afterCorrect).not.toBe(original);
      expect(afterWrong).not.toBe(original);
    });
  });
});
