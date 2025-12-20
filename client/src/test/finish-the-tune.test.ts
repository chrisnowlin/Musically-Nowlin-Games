import { describe, it, expect } from 'vitest';
import {
  generateWrongEndings,
  shuffleOptions,
  areEndingsEqual,
  getNoteName,
  NOTES,
  NOTE_FREQS,
  MELODY_PATTERNS,
  DIFFICULTY_CONFIG,
  TOTAL_MELODIES,
} from '../components/finish-the-tune/finish-the-tune-Logic';
import {
  checkAchievements,
  getAchievement,
  ACHIEVEMENTS,
} from '../components/finish-the-tune/finish-the-tune-Achievements';
import type { FinishTheTuneState, NoteEvent } from '../components/finish-the-tune/types';

// Helper to create a test state
function createTestState(overrides: Partial<FinishTheTuneState> = {}): FinishTheTuneState {
  return {
    currentQuestion: null,
    shuffledOptions: [],
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    hasPlayedMelody: false,
    activeNoteIndex: -1,
    playingSequenceId: null,
    selectedOptionIndex: null,
    feedback: null,
    streak: 0,
    bestStreak: 0,
    completedMelodies: new Set<string>(),
    wrongQuestionQueue: [],
    achievements: [],
    highScore: 0,
    difficulty: 'medium',
    playbackSpeed: 1.0,
    autoPlay: false,
    volume: 70,
    loopMelody: false,
    showNoteNames: false,
    timedMode: false,
    timeRemaining: 60,
    focusedOptionIndex: 0,
    compareMode: false,
    compareSelections: [],
    ...overrides,
  };
}

describe('Finish the Tune - Logic', () => {
  describe('NOTES configuration', () => {
    it('has all 8 notes in the C major scale', () => {
      expect(Object.keys(NOTES)).toHaveLength(8);
      expect(NOTES.C).toBe(262);
      expect(NOTES.D).toBe(294);
      expect(NOTES.E).toBe(330);
      expect(NOTES.F).toBe(349);
      expect(NOTES.G).toBe(392);
      expect(NOTES.A).toBe(440);
      expect(NOTES.B).toBe(494);
      expect(NOTES.C2).toBe(523);
    });

    it('NOTE_FREQS is sorted ascending', () => {
      for (let i = 1; i < NOTE_FREQS.length; i++) {
        expect(NOTE_FREQS[i]).toBeGreaterThan(NOTE_FREQS[i - 1]);
      }
    });
  });

  describe('getNoteName', () => {
    it('returns correct note name for each frequency', () => {
      expect(getNoteName(262)).toBe('C');
      expect(getNoteName(294)).toBe('D');
      expect(getNoteName(330)).toBe('E');
      expect(getNoteName(349)).toBe('F');
      expect(getNoteName(392)).toBe('G');
      expect(getNoteName(440)).toBe('A');
      expect(getNoteName(494)).toBe('B');
      expect(getNoteName(523)).toBe('C2');
    });

    it('returns ? for unknown frequencies', () => {
      expect(getNoteName(999)).toBe('?');
      expect(getNoteName(0)).toBe('?');
    });
  });

  describe('MELODY_PATTERNS', () => {
    it('has the expected number of patterns', () => {
      expect(MELODY_PATTERNS).toHaveLength(8);
      expect(TOTAL_MELODIES).toBe(8);
    });

    it('each pattern has required properties', () => {
      MELODY_PATTERNS.forEach((pattern) => {
        expect(pattern.start).toBeDefined();
        expect(Array.isArray(pattern.start)).toBe(true);
        expect(pattern.start.length).toBeGreaterThan(0);

        expect(pattern.endings).toBeDefined();
        expect(pattern.endings.correct).toBeDefined();
        expect(Array.isArray(pattern.endings.correct)).toBe(true);
        expect(pattern.endings.name).toBeDefined();

        expect(pattern.hint).toBeDefined();
        expect(typeof pattern.hint).toBe('string');
      });
    });

    it('each note has valid freq and duration', () => {
      MELODY_PATTERNS.forEach((pattern) => {
        [...pattern.start, ...pattern.endings.correct].forEach((note) => {
          expect(typeof note.freq).toBe('number');
          expect(note.freq).toBeGreaterThan(0);
          expect(typeof note.duration).toBe('number');
          expect(note.duration).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('DIFFICULTY_CONFIG', () => {
    it('has three difficulty levels', () => {
      expect(Object.keys(DIFFICULTY_CONFIG)).toHaveLength(3);
    });

    it('easy has 2 options', () => {
      expect(DIFFICULTY_CONFIG.easy.optionCount).toBe(2);
      expect(DIFFICULTY_CONFIG.easy.label).toBe('Easy');
    });

    it('medium has 3 options', () => {
      expect(DIFFICULTY_CONFIG.medium.optionCount).toBe(3);
      expect(DIFFICULTY_CONFIG.medium.label).toBe('Medium');
    });

    it('hard has 4 options', () => {
      expect(DIFFICULTY_CONFIG.hard.optionCount).toBe(4);
      expect(DIFFICULTY_CONFIG.hard.label).toBe('Hard');
    });
  });

  describe('generateWrongEndings', () => {
    const correctEnding: NoteEvent[] = [{ freq: NOTES.C, duration: 0.8 }];

    it('generates the requested number of wrong endings', () => {
      const wrong1 = generateWrongEndings(correctEnding, 1);
      expect(wrong1).toHaveLength(1);

      const wrong2 = generateWrongEndings(correctEnding, 2);
      expect(wrong2).toHaveLength(2);

      const wrong3 = generateWrongEndings(correctEnding, 3);
      expect(wrong3).toHaveLength(3);
    });

    it('generates wrong endings with same length as correct', () => {
      const correctMulti: NoteEvent[] = [
        { freq: NOTES.F, duration: 0.2 },
        { freq: NOTES.E, duration: 0.2 },
        { freq: NOTES.D, duration: 0.2 },
        { freq: NOTES.C, duration: 0.8 },
      ];
      const wrong = generateWrongEndings(correctMulti, 3);

      wrong.forEach((ending) => {
        expect(ending).toHaveLength(correctMulti.length);
      });
    });

    it('preserves duration from correct ending', () => {
      const correctMulti: NoteEvent[] = [
        { freq: NOTES.F, duration: 0.2 },
        { freq: NOTES.E, duration: 0.3 },
        { freq: NOTES.C, duration: 0.8 },
      ];
      const wrong = generateWrongEndings(correctMulti, 3);

      wrong.forEach((ending) => {
        expect(ending[0].duration).toBe(0.2);
        expect(ending[1].duration).toBe(0.3);
        expect(ending[2].duration).toBe(0.8);
      });
    });

    it('last note of wrong endings should not be tonic (C or C2)', () => {
      const correctEnding: NoteEvent[] = [{ freq: NOTES.C, duration: 0.8 }];
      // Run multiple times to increase confidence
      for (let i = 0; i < 10; i++) {
        const wrong = generateWrongEndings(correctEnding, 3);
        wrong.forEach((ending) => {
          const lastNote = ending[ending.length - 1];
          expect(lastNote.freq).not.toBe(NOTES.C);
          expect(lastNote.freq).not.toBe(NOTES.C2);
        });
      }
    });
  });

  describe('shuffleOptions', () => {
    it('includes the correct ending in shuffled options', () => {
      const correct: NoteEvent[] = [{ freq: NOTES.C, duration: 0.8 }];
      const wrong: NoteEvent[][] = [
        [{ freq: NOTES.D, duration: 0.8 }],
        [{ freq: NOTES.E, duration: 0.8 }],
      ];

      const shuffled = shuffleOptions(correct, wrong);
      expect(shuffled).toHaveLength(3);

      // Check that correct ending is present
      const hasCorrect = shuffled.some((opt) => areEndingsEqual(opt, correct));
      expect(hasCorrect).toBe(true);
    });

    it('includes all wrong endings in shuffled options', () => {
      const correct: NoteEvent[] = [{ freq: NOTES.C, duration: 0.8 }];
      const wrong: NoteEvent[][] = [
        [{ freq: NOTES.D, duration: 0.8 }],
        [{ freq: NOTES.E, duration: 0.8 }],
        [{ freq: NOTES.F, duration: 0.8 }],
      ];

      const shuffled = shuffleOptions(correct, wrong);
      expect(shuffled).toHaveLength(4);

      wrong.forEach((wrongEnding) => {
        const hasWrong = shuffled.some((opt) => areEndingsEqual(opt, wrongEnding));
        expect(hasWrong).toBe(true);
      });
    });
  });

  describe('areEndingsEqual', () => {
    it('returns true for identical endings', () => {
      const a: NoteEvent[] = [
        { freq: NOTES.C, duration: 0.4 },
        { freq: NOTES.D, duration: 0.8 },
      ];
      const b: NoteEvent[] = [
        { freq: NOTES.C, duration: 0.4 },
        { freq: NOTES.D, duration: 0.8 },
      ];
      expect(areEndingsEqual(a, b)).toBe(true);
    });

    it('returns false for different frequencies', () => {
      const a: NoteEvent[] = [{ freq: NOTES.C, duration: 0.4 }];
      const b: NoteEvent[] = [{ freq: NOTES.D, duration: 0.4 }];
      expect(areEndingsEqual(a, b)).toBe(false);
    });

    it('returns false for different durations', () => {
      const a: NoteEvent[] = [{ freq: NOTES.C, duration: 0.4 }];
      const b: NoteEvent[] = [{ freq: NOTES.C, duration: 0.8 }];
      expect(areEndingsEqual(a, b)).toBe(false);
    });

    it('returns false for different lengths', () => {
      const a: NoteEvent[] = [{ freq: NOTES.C, duration: 0.4 }];
      const b: NoteEvent[] = [
        { freq: NOTES.C, duration: 0.4 },
        { freq: NOTES.D, duration: 0.4 },
      ];
      expect(areEndingsEqual(a, b)).toBe(false);
    });
  });
});

describe('Finish the Tune - Achievements', () => {
  describe('ACHIEVEMENTS', () => {
    it('has the expected achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      expect(ids).toContain('first_correct');
      expect(ids).toContain('streak_5');
      expect(ids).toContain('streak_10');
      expect(ids).toContain('perfect_10');
      expect(ids).toContain('all_melodies');
      expect(ids).toContain('speed_demon');
    });

    it('each achievement has required properties', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(typeof achievement.condition).toBe('function');
      });
    });
  });

  describe('getAchievement', () => {
    it('returns achievement by id', () => {
      const achievement = getAchievement('first_correct');
      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('First Note');
    });

    it('returns undefined for unknown id', () => {
      const achievement = getAchievement('unknown_achievement');
      expect(achievement).toBeUndefined();
    });
  });

  describe('checkAchievements', () => {
    it('unlocks first_correct on first correct answer', () => {
      const state = createTestState({ score: 1 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('first_correct');
    });

    it('does not unlock first_correct if already unlocked', () => {
      const state = createTestState({ score: 1 });
      const newAchievements = checkAchievements(state, ['first_correct']);
      expect(newAchievements).not.toContain('first_correct');
    });

    it('unlocks streak_5 on 5 streak', () => {
      const state = createTestState({ streak: 5 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('streak_5');
    });

    it('unlocks streak_10 on 10 streak', () => {
      const state = createTestState({ streak: 10 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('streak_10');
    });

    it('unlocks perfect_10 on 10/10 accuracy', () => {
      const state = createTestState({ score: 10, totalQuestions: 10 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('perfect_10');
    });

    it('does not unlock perfect_10 with less than 10 questions', () => {
      const state = createTestState({ score: 5, totalQuestions: 5 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).not.toContain('perfect_10');
    });

    it('does not unlock perfect_10 with imperfect accuracy', () => {
      const state = createTestState({ score: 9, totalQuestions: 10 });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).not.toContain('perfect_10');
    });

    it('unlocks all_melodies when all 8 discovered', () => {
      const allMelodies = new Set(MELODY_PATTERNS.map((p) => p.endings.name));
      const state = createTestState({ completedMelodies: allMelodies });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('all_melodies');
    });

    it('does not unlock all_melodies with fewer than 8', () => {
      const someMelodies = new Set(['Walking Home', 'Jump to the Top']);
      const state = createTestState({ completedMelodies: someMelodies });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).not.toContain('all_melodies');
    });

    it('can unlock multiple achievements at once', () => {
      const state = createTestState({
        score: 5,
        streak: 5,
      });
      const newAchievements = checkAchievements(state, []);
      expect(newAchievements).toContain('first_correct');
      expect(newAchievements).toContain('streak_5');
    });
  });
});
