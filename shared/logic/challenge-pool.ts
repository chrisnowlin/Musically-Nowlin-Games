/**
 * Cadence Quest - Challenge Pool Generator
 * Creates music challenges across all 5 disciplines. Deterministic validation.
 */

import {
  type MusicChallenge,
  type MusicDiscipline,
  type ChallengeAnswer,
  type NoteReadingChallenge,
  type RhythmTapChallenge,
  type IntervalChallenge,
  type ChordIdentifyChallenge,
  type ScaleIdentifyChallenge,
  type TempoIdentifyChallenge,
  type ListeningChallenge,
  MUSIC_DISCIPLINES,
} from '../types/cadence-quest';

type Difficulty = 'easy' | 'medium' | 'hard';

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OCTAVES = [3, 4, 5];
/** Space notes only (in staff): F4, A4, C5, E5 */
const NOTES_SPACE = ['F4', 'A4', 'C5', 'E5'];
/** Line notes only (in staff): E4, G4, B4, D5, F5 */
const NOTES_LINE = ['E4', 'G4', 'B4', 'D5', 'F5'];
/** Both space and line notes in staff */
const NOTES_BOTH = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
/** Ledger-line notes outside staff: C4, D4, G5, A5 */
const NOTES_LEDGER = ['C4', 'D4', 'G5', 'A5'];

const INTERVALS = [
  { name: 'Unison', semitones: 0 },
  { name: '2nd', semitones: 2 },
  { name: '3rd', semitones: 4 },
  { name: '4th', semitones: 5 },
  { name: '5th', semitones: 7 },
  { name: '6th', semitones: 9 },
  { name: 'Octave', semitones: 12 },
];

const SEMITONE_TO_NOTE: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B',
};

const CHORDS: { name: string; intervals: number[] }[] = [
  { name: 'C major', intervals: [0, 4, 7] },
  { name: 'C minor', intervals: [0, 3, 7] },
  { name: 'G major', intervals: [7, 11, 14] },
  { name: 'F major', intervals: [5, 9, 12] },
  { name: 'Am', intervals: [9, 12, 16] },
  { name: 'Dm', intervals: [2, 5, 9] },
  { name: 'Em', intervals: [4, 7, 11] },
];

const TEMPO_OPTIONS: { label: string; bpm: number }[] = [
  { label: 'Largo (40-60)', bpm: 50 },
  { label: 'Adagio (66-76)', bpm: 72 },
  { label: 'Andante (76-108)', bpm: 92 },
  { label: 'Moderato (108-120)', bpm: 114 },
  { label: 'Allegro (120-168)', bpm: 132 },
  { label: 'Presto (168-200)', bpm: 184 },
];

const DURATION_MAP: Record<string, number> = {
  quarter: 1,
  half: 2,
  eighth: 0.5,
  sixteenth: 0.25,
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickOptions<T>(correct: T, pool: T[], count: number): T[] {
  const others = pool.filter((x) => x !== correct);
  const selected = shuffle(others).slice(0, count - 1);
  return shuffle([...selected, correct]);
}

function noteToSemitones(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60;
  const [_, name, oct] = match;
  const idx = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(name);
  if (idx < 0) return 60;
  return (parseInt(oct, 10) + 1) * 12 + idx;
}

function semitonesToNote(semitones: number): string {
  const oct = Math.floor(semitones / 12) - 1;
  const idx = ((semitones % 12) + 12) % 12;
  return `${SEMITONE_TO_NOTE[idx]}${oct}`;
}

function generateId(): string {
  return `ch-${Date.now()}-${rand(1000, 9999)}`;
}

// ---- Note Reading ----

/** Note-reading mode by difficulty: space -> line -> both -> ledger */
export function generateNoteReadingChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'pitch'
): NoteReadingChallenge {
  const notes =
    difficulty === 'easy' ? NOTES_SPACE
    : difficulty === 'medium' ? NOTES_LINE
    : NOTES_BOTH;
  const targetNote = pick(notes);
  const options = pickOptions(targetNote, notes, 4);
  return {
    id: generateId(),
    type: 'noteReading',
    discipline,
    difficulty,
    targetNote,
    options: options.map((n) => n.replace(/\d+/, '')),
    useBassClef: false,
  };
}

// ---- Rhythm Tap ----

export function generateRhythmTapChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'rhythm'
): RhythmTapChallenge {
  const bpm = difficulty === 'easy' ? 80 : difficulty === 'medium' ? 100 : 120;
  const toleranceMs = difficulty === 'easy' ? 300 : difficulty === 'medium' ? 200 : 150;
  const subdivisions =
    difficulty === 'easy'
      ? (['quarter', 'half'] as const)
      : difficulty === 'medium'
        ? (['quarter', 'half', 'eighth'] as const)
        : (['quarter', 'eighth', 'sixteenth'] as const);
  const patternLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 6;
  const beatDuration = 60000 / bpm;

  const pattern: { time: number; duration: number }[] = [];
  let currentTime = 0;
  for (let i = 0; i < patternLength; i++) {
    const sub = pick(subdivisions);
    const dur = DURATION_MAP[sub] * beatDuration;
    pattern.push({ time: currentTime, duration: dur });
    currentTime += dur;
  }

  return {
    id: generateId(),
    type: 'rhythmTap',
    discipline,
    difficulty,
    pattern,
    bpm,
    toleranceMs,
  };
}

// ---- Interval ----

export function generateIntervalChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'pitch'
): IntervalChallenge {
  const intervalPool =
    difficulty === 'easy'
      ? INTERVALS.slice(0, 3)
      : difficulty === 'medium'
        ? INTERVALS.slice(1, 5)
        : INTERVALS;
  const interval = pick(intervalPool);
  const baseNote = pick(NOTES_MEDIUM);
  const baseSemitones = noteToSemitones(baseNote);
  const note2 = semitonesToNote(baseSemitones + interval.semitones);
  const options = pickOptions(interval.name, intervalPool.map((i) => i.name), 4);
  return {
    id: generateId(),
    type: 'interval',
    discipline,
    difficulty,
    note1: baseNote,
    note2,
    intervalName: interval.name,
    options,
  };
}

// ---- Chord Identify ----

export function generateChordIdentifyChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'harmony'
): ChordIdentifyChallenge {
  const pool = difficulty === 'easy' ? CHORDS.slice(0, 3) : CHORDS;
  const chord = pick(pool);
  const chordNotes = chord.intervals.map((i) => semitonesToNote(60 + i));
  const options = pickOptions(chord.name, pool.map((c) => c.name), 4);
  return {
    id: generateId(),
    type: 'chordIdentify',
    discipline,
    difficulty,
    chordNotes,
    chordName: chord.name,
    options,
  };
}

// ---- Scale Identify ----

const SCALES = [
  { name: 'C major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'A minor', intervals: [9, 11, 0, 2, 4, 5, 7] },
  { name: 'G major', intervals: [7, 9, 11, 0, 2, 4, 6] },
  { name: 'D minor', intervals: [2, 4, 5, 7, 9, 11, 0] },
];

export function generateScaleIdentifyChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'harmony'
): ScaleIdentifyChallenge {
  const scale = pick(SCALES);
  const scaleNotes = scale.intervals.map((i) => semitonesToNote(60 + (i % 12)));
  const options = pickOptions(scale.name, SCALES.map((s) => s.name), 4);
  return {
    id: generateId(),
    type: 'scaleIdentify',
    discipline,
    difficulty,
    scaleNotes,
    scaleName: scale.name,
    options,
  };
}

// ---- Tempo Identify ----

export function generateTempoIdentifyChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'rhythm'
): TempoIdentifyChallenge {
  const pool = difficulty === 'easy' ? TEMPO_OPTIONS.slice(1, 4) : TEMPO_OPTIONS;
  const target = pick(pool);
  const options = pickOptions(target, pool, 4);
  return {
    id: generateId(),
    type: 'tempoIdentify',
    discipline,
    difficulty,
    bpm: target.bpm,
    options,
  };
}

// ---- Listening (Theory) - simplified ----

const LISTENING_PROMPTS: { prompt: string; options: string[]; correctAnswer: string }[] = [
  { prompt: 'Is this phrase ascending or descending?', options: ['Ascending', 'Descending', 'Same'], correctAnswer: 'Ascending' },
  { prompt: 'How many beats per measure?', options: ['2', '3', '4'], correctAnswer: '4' },
  { prompt: 'Which interval sounds?', options: ['2nd', '3rd', '5th'], correctAnswer: '3rd' },
];

export function generateListeningChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'theory'
): ListeningChallenge {
  const item = pick(LISTENING_PROMPTS);
  return {
    id: generateId(),
    type: 'listening',
    discipline,
    difficulty,
    prompt: item.prompt,
    options: item.options,
    correctAnswer: item.correctAnswer,
  };
}

// ---- Main generator ----

const CHALLENGE_GENERATORS: Array<
  (d: Difficulty, disc?: MusicDiscipline) => MusicChallenge
> = [
  generateNoteReadingChallenge,
  generateRhythmTapChallenge,
  generateIntervalChallenge,
  generateChordIdentifyChallenge,
  generateScaleIdentifyChallenge,
  generateTempoIdentifyChallenge,
  generateListeningChallenge,
];

export function generateChallenge(
  discipline: MusicDiscipline,
  difficulty: Difficulty = 'medium'
): MusicChallenge {
  const filtered = CHALLENGE_GENERATORS.filter((g) => {
    const c = g(difficulty, discipline);
    return c.discipline === discipline;
  });
  if (filtered.length === 0) {
    return generateNoteReadingChallenge(difficulty, discipline);
  }
  return pick(filtered)(difficulty, discipline);
}

/** Generate a challenge weighted toward a region's discipline */
export function generateChallengeForRegion(
  regionDiscipline: MusicDiscipline,
  difficulty: Difficulty = 'medium'
): MusicChallenge {
  const roll = Math.random();
  if (roll < 0.7) {
    return generateChallenge(regionDiscipline, difficulty);
  }
  const other = pick(MUSIC_DISCIPLINES.filter((d) => d !== regionDiscipline));
  return generateChallenge(other, difficulty);
}

// ---- Validation ----

export function validateAnswer(challenge: MusicChallenge, answer: ChallengeAnswer): boolean {
  if (challenge.id !== answer.challengeId) return false;

  switch (challenge.type) {
    case 'noteReading': {
      const selected = String(answer.value).toUpperCase();
      const correct = challenge.targetNote.replace(/\d+/, '');
      return selected === correct;
    }
    case 'rhythmTap': {
      const taps = Array.isArray(answer.value) ? answer.value : [];
      if (taps.length < 2) return false;
      const patternIntervals = challenge.pattern.slice(1).map((b, i) => b.time - challenge.pattern[i].time);
      const tapIntervals = taps.slice(1).map((t, i) => (t as number) - (taps[i] as number));
      let matchCount = 0;
      for (let i = 0; i < patternIntervals.length; i++) {
        if (tapIntervals[i] !== undefined) {
          const diff = Math.abs(tapIntervals[i] - patternIntervals[i]);
          if (diff <= challenge.toleranceMs) matchCount++;
        }
      }
      const accuracy = patternIntervals.length > 0 ? matchCount / patternIntervals.length : 1;
      return accuracy >= 0.5;
    }
    case 'interval':
      return String(answer.value).trim() === challenge.intervalName;
    case 'chordIdentify':
      return String(answer.value).trim() === challenge.chordName;
    case 'scaleIdentify':
      return String(answer.value).trim() === challenge.scaleName;
    case 'tempoIdentify': {
      const selected = challenge.options.find((o) => o.label === answer.value);
      return selected?.bpm === challenge.bpm;
    }
    case 'listening':
      return String(answer.value).trim() === challenge.correctAnswer;
    default:
      return false;
  }
}
