/**
 * Lore Room Data — System 3
 *
 * Defines lesson content for Lore Rooms: dedicated non-combat floors
 * where a Lorekeeper NPC teaches concepts before tier transitions.
 *
 * Mandatory Lore Rooms appear at tier boundary floors.
 * Optional (random) Lore Rooms offer single-concept refreshers.
 */

import type { Tier } from './dungeonTypes';

// ── Types ───────────────────────────────────────────────────

export interface LoreStep {
  type: 'teach' | 'practice';
  /** Header text shown at top of this step. */
  heading: string;
  /** Main instructional text. */
  body: string;
  /** Optional secondary text (mnemonic, context). */
  detail?: string;
  /** For 'practice' steps: a simple question. */
  question?: string;
  /** For 'practice' steps: the correct answer. */
  correctAnswer?: string;
  /** For 'practice' steps: all answer choices. */
  choices?: string[];
}

export interface LoreLesson {
  id: string;
  /** Display title shown in the Lore Room modal. */
  title: string;
  /** Which floor this mandatory lesson gates (0 for optional/random). */
  gateFloor: number;
  /** Which tier transition this prepares for (target tier). */
  targetTier: Tier;
  /** Concept IDs this lesson covers (for learning state tracking). */
  conceptIds: string[];
  /** Ordered steps: teach → practice. */
  steps: LoreStep[];
}

// ── Mandatory Lore Room Lessons ─────────────────────────────
// Placed right before tier transition zones.

export const MANDATORY_LORE_LESSONS: LoreLesson[] = [
  // Floor 12: T1→T2 transition begins at floor 13
  {
    id: 'lore-t1t2',
    title: 'The Language of Music',
    gateFloor: 12,
    targetTier: 2,
    conceptIds: ['vocab:dynamics:piano', 'vocab:dynamics:forte', 'vocab:tempo:Andante'],
    steps: [
      {
        type: 'teach',
        heading: 'Dynamics: Loud and Soft',
        body: 'Musicians use Italian words to describe how loud or soft to play. "Piano" means soft, and "forte" means loud. Together they created the word "pianoforte" — the instrument that can play soft AND loud!',
        detail: 'You already know f (loud) and p (soft). Now you\'ll learn the full Italian words and more levels in between.',
      },
      {
        type: 'teach',
        heading: 'Tempo: How Fast or Slow',
        body: 'Tempo tells musicians how fast to play. "Andante" means walking pace — not too fast, not too slow. "Ritardando" means to gradually slow down, like gently pressing the brakes.',
        detail: 'You\'ll see more tempo markings like Moderato (moderate) and Accelerando (speeding up).',
      },
      {
        type: 'teach',
        heading: 'New Rhythm Concepts',
        body: 'You\'ll encounter tied notes — two notes connected by a curved line that combines their durations. A quarter note tied to another quarter note lasts 2 beats total!',
        detail: 'You\'ll also see quarter rests — beats of silence where you don\'t play.',
      },
      {
        type: 'practice',
        heading: 'Quick Check!',
        body: 'Let\'s make sure you\'re ready for the next challenge.',
        question: 'What does "piano" mean in music?',
        correctAnswer: 'Soft',
        choices: ['Soft', 'Loud', 'Fast', 'Slow'],
      },
      {
        type: 'practice',
        heading: 'One More!',
        body: 'Almost there!',
        question: 'What does "Andante" mean?',
        correctAnswer: 'Walking pace',
        choices: ['Walking pace', 'Very fast', 'Very slow', 'Extremely loud'],
      },
    ],
  },

  // Floor 35: T2→T3 transition begins at floor 36
  {
    id: 'lore-t2t3',
    title: 'Sharps, Flats, and New Rhythms',
    gateFloor: 35,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Sharp', 'vocab:symbols:Flat', 'vocab:symbols:Dotted quarter note'],
    steps: [
      {
        type: 'teach',
        heading: 'Accidentals: Sharps and Flats',
        body: 'A sharp (#) raises a note by a half step — like moving one key to the right on a piano. A flat (b) lowers a note by a half step — one key to the left. A natural cancels any sharp or flat.',
        detail: 'Think: sharp edge points UP, flat tire goes DOWN.',
      },
      {
        type: 'teach',
        heading: 'New Time Signatures',
        body: 'You\'ve been playing in 4/4 time (4 beats per measure). Now you\'ll see 3/4 time — a waltz feel with 3 beats per measure, and 6/8 time where the eighth note gets the beat.',
        detail: 'In 3/4, count: ONE-two-three, ONE-two-three. In 6/8, count: ONE-two-three-FOUR-five-six.',
      },
      {
        type: 'teach',
        heading: 'Dotted Rhythms and Sixteenths',
        body: 'A dot after a note adds half its value. A dotted quarter note = 1.5 beats. Sixteenth notes are twice as fast as eighth notes — four per beat!',
      },
      {
        type: 'practice',
        heading: 'Quick Check!',
        body: 'Test your knowledge.',
        question: 'What does a sharp do to a note?',
        correctAnswer: 'Raises it by a half step',
        choices: ['Raises it by a half step', 'Lowers it by a half step', 'Makes it louder', 'Makes it longer'],
      },
    ],
  },

  // Floor 68: T3→T4 transition begins at floor 69
  {
    id: 'lore-t3t4',
    title: 'Instruments and Triplets',
    gateFloor: 68,
    targetTier: 4,
    conceptIds: ['vocab:symbols:Triplet', 'vocab:symbols:Bass clef'],
    steps: [
      {
        type: 'teach',
        heading: 'Instrument Families',
        body: 'Every orchestra instrument belongs to a family. Strings vibrate strings (violin, cello). Woodwinds use air (flute, clarinet). Brass buzzes lips (trumpet, horn). Percussion is struck or shaken (drums, xylophone).',
        detail: 'You\'ll need to tell instruments apart by the sound of their family — and eventually by their individual voice.',
      },
      {
        type: 'teach',
        heading: 'Triplets',
        body: 'A triplet squeezes 3 notes into the space of 2. Instead of 2 eighth notes per beat, you play 3 evenly-spaced notes. The feel is "trip-o-let, trip-o-let."',
        detail: 'You\'ll also see new time signatures: 12/8 and 3/8.',
      },
      {
        type: 'teach',
        heading: 'The Bass Clef',
        body: 'The bass clef marks the lower-pitched staff. Its line mnemonic is "Good Boys Do Fine Always" (G, B, D, F, A). Low instruments like cello and tuba read bass clef.',
      },
      {
        type: 'practice',
        heading: 'Quick Check!',
        body: 'Ready?',
        question: 'How many notes does a triplet squeeze into the space of 2?',
        correctAnswer: '3',
        choices: ['3', '2', '4', '6'],
      },
    ],
  },

  // Floor 88: T4→T5 transition begins at floor 89
  {
    id: 'lore-t4t5',
    title: 'Advanced Notation',
    gateFloor: 88,
    targetTier: 5,
    conceptIds: ['vocab:symbols:Trill', 'vocab:tempo:Rubato'],
    steps: [
      {
        type: 'teach',
        heading: 'Ornaments',
        body: 'Advanced music uses ornaments — decorative notes. A trill rapidly alternates between two adjacent notes. A mordent is a quick "wiggle" to the note below and back. A grace note is a tiny quick note before the main note.',
        detail: 'Look for "tr" above a note for trills.',
      },
      {
        type: 'teach',
        heading: 'Expressive Terms',
        body: 'Italian terms like "Con brio" (with vigor), "Dolce" (sweetly), and "Rubato" (flexible tempo — stolen time) tell musicians HOW to play, not just what notes.',
        detail: 'Rubato literally means "stolen" — you borrow time from one note and give it to another.',
      },
      {
        type: 'teach',
        heading: 'Cut Time and Mixed Meter',
        body: 'Cut time (2/2 or "alla breve") is like 4/4 but counted in 2 — the half note gets the beat. Mixed meter patterns change time signatures mid-phrase!',
      },
      {
        type: 'practice',
        heading: 'Final Check!',
        body: 'One more before the final challenge.',
        question: 'What is a trill?',
        correctAnswer: 'Rapid alternation between two adjacent notes',
        choices: ['Rapid alternation between two adjacent notes', 'A very slow tempo', 'Playing very loudly', 'A type of rest'],
      },
    ],
  },
];

// ── Optional (Random) Lore Lessons ──────────────────────────
// Short single-concept refreshers for random Lore Room spawns.

export const OPTIONAL_LORE_LESSONS: LoreLesson[] = [
  {
    id: 'lore-opt-dynamics',
    title: 'Dynamics Refresher',
    gateFloor: 0,
    targetTier: 1,
    conceptIds: ['vocab:dynamics:f', 'vocab:dynamics:p'],
    steps: [
      {
        type: 'teach',
        heading: 'Remember: f and p',
        body: 'f means forte (loud) and p means piano (soft). Think of "force" for loud and "piano" for soft.',
      },
      {
        type: 'practice',
        heading: 'Quick Refresher',
        body: '',
        question: 'What does f mean?',
        correctAnswer: 'Loud',
        choices: ['Loud', 'Soft', 'Fast', 'Slow'],
      },
    ],
  },
  {
    id: 'lore-opt-beats',
    title: 'Note Values Refresher',
    gateFloor: 0,
    targetTier: 1,
    conceptIds: ['vocab:symbols:Quarter note', 'vocab:symbols:Half note'],
    steps: [
      {
        type: 'teach',
        heading: 'Remember: Note Values',
        body: 'A quarter note gets 1 beat, a half note gets 2 beats, and a whole note gets 4 beats. The more filled in and stemmed a note is, the shorter it lasts!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'How many beats does a half note get?',
        correctAnswer: '2',
        choices: ['2', '1', '4', '3'],
      },
    ],
  },
  {
    id: 'lore-opt-intervals',
    title: 'Intervals Refresher',
    gateFloor: 0,
    targetTier: 2,
    conceptIds: ['interval:stepSkip:Step', 'interval:stepSkip:Skip'],
    steps: [
      {
        type: 'teach',
        heading: 'Steps vs Skips',
        body: 'A step moves to the very next note (like C to D). A skip jumps over a note (like C to E). Steps are small, skips are bigger.',
        detail: 'Think of walking up stairs: a step is one stair, a skip is two.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'C to E is what kind of movement?',
        correctAnswer: 'Skip',
        choices: ['Skip', 'Step', 'Same', 'Leap'],
      },
    ],
  },
];

/**
 * Get the mandatory lore lesson for a given floor, if one exists.
 * Returns undefined if no mandatory lesson gates this floor.
 */
export function getMandatoryLoreLesson(floorNumber: number): LoreLesson | undefined {
  return MANDATORY_LORE_LESSONS.find(l => l.gateFloor === floorNumber);
}

/**
 * Pick a random optional lore lesson appropriate for the given tier.
 */
export function getRandomOptionalLoreLesson(tier: Tier): LoreLesson {
  const eligible = OPTIONAL_LORE_LESSONS.filter(l => l.targetTier <= tier);
  if (eligible.length === 0) return OPTIONAL_LORE_LESSONS[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** All floors that have mandatory lore lessons. */
export const LORE_GATE_FLOORS = new Set(MANDATORY_LORE_LESSONS.map(l => l.gateFloor));
