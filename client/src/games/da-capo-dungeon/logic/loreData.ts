/**
 * Lore Room Data — System 3
 *
 * Defines lesson content for Lore Rooms: short interstitial teaching moments
 * that appear between floors every 4-5 floors. All lore rooms are optional
 * (the student can skip them).
 *
 * Each lesson is short (1 teach step + 1 practice step) to keep flow moving.
 * Content leans toward previewing upcoming concepts with some review mixed in.
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
  /** Which floor this lesson triggers after (between this floor and the next). */
  gateFloor: number;
  /** Which tier this lesson is relevant to. */
  targetTier: Tier;
  /** Concept IDs this lesson covers (for learning state tracking). */
  conceptIds: string[];
  /** Ordered steps: teach → practice. */
  steps: LoreStep[];
}

// ── Lore Lessons ────────────────────────────────────────────
// Placed every 4-5 floors. Each lesson is 2 steps: teach + practice.
// Mix of preview (upcoming concepts) and review (recent concepts).

export const LORE_LESSONS: LoreLesson[] = [
  // ── T1 zone (floors 1-12) ──────────────────────────────

  // Floor 4: Review basics — voice types & beat
  {
    id: 'lore-04',
    title: 'Your Musical Voice',
    gateFloor: 4,
    targetTier: 1,
    conceptIds: ['vocab:terms:Beat', 'vocab:terms:Melody'],
    steps: [
      {
        type: 'teach',
        heading: 'Beat and Melody',
        body: 'Every piece of music has a beat — a steady pulse, like a heartbeat. A melody is the tune that rides on top of the beat — the part you hum or sing.',
        detail: 'Tap your foot to the beat while you hum the melody!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is the steady pulse in music called?',
        correctAnswer: 'The beat',
        choices: ['The beat', 'The melody', 'The rhythm', 'The tempo'],
      },
    ],
  },

  // Floor 8: Preview dynamics (f, p) before they show up more
  {
    id: 'lore-08',
    title: 'Loud and Soft',
    gateFloor: 8,
    targetTier: 1,
    conceptIds: ['vocab:dynamics:f', 'vocab:dynamics:p'],
    steps: [
      {
        type: 'teach',
        heading: 'Dynamics: f and p',
        body: 'Musicians use letters to show how loud or soft to play. "f" stands for forte — play LOUD. "p" stands for piano — play SOFT. Think: "f" for "force" and "p" for "peaceful."',
        detail: 'You\'ll see these letters under the notes on a music sheet.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "f" mean in music?',
        correctAnswer: 'Loud',
        choices: ['Loud', 'Soft', 'Fast', 'Slow'],
      },
    ],
  },

  // Floor 12: Preview T2 concepts — tier boundary prep
  {
    id: 'lore-12',
    title: 'The Language of Music',
    gateFloor: 12,
    targetTier: 2,
    conceptIds: ['vocab:dynamics:piano', 'vocab:dynamics:forte', 'vocab:tempo:Andante'],
    steps: [
      {
        type: 'teach',
        heading: 'Italian Words in Music',
        body: 'Musicians use Italian words for dynamics and tempo. "Piano" means soft and "forte" means loud — together they made the word "pianoforte," the instrument that plays soft AND loud! "Andante" means walking pace.',
        detail: 'Coming up: you\'ll learn crescendo (getting louder), decrescendo (getting softer), and more tempo markings.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "piano" mean in music?',
        correctAnswer: 'Soft',
        choices: ['Soft', 'Loud', 'Fast', 'The instrument only'],
      },
    ],
  },

  // ── T1→T2 transition (floors 13-18) ────────────────────

  // Floor 16: Review note values + preview ties
  {
    id: 'lore-16',
    title: 'Note Values',
    gateFloor: 16,
    targetTier: 2,
    conceptIds: ['vocab:symbols:Quarter note', 'vocab:symbols:Half note', 'vocab:symbols:Tied note'],
    steps: [
      {
        type: 'teach',
        heading: 'How Long Notes Last',
        body: 'A quarter note gets 1 beat, a half note gets 2 beats, and a whole note gets 4 beats. A tied note connects two notes with a curved line — you hold through both! A quarter note tied to a quarter note = 2 beats.',
        detail: 'The more filled-in a note looks, the shorter it is.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'How many beats does a half note get?',
        correctAnswer: '2 beats',
        choices: ['2 beats', '1 beat', '4 beats', '3 beats'],
      },
    ],
  },

  // ── T2 pure (floors 19-35) ─────────────────────────────

  // Floor 20: Review crescendo/decrescendo
  {
    id: 'lore-20',
    title: 'Getting Louder and Softer',
    gateFloor: 20,
    targetTier: 2,
    conceptIds: ['vocab:dynamics:Crescendo', 'vocab:dynamics:Decrescendo'],
    steps: [
      {
        type: 'teach',
        heading: 'Crescendo and Decrescendo',
        body: 'A crescendo means gradually getting LOUDER — like a wave building. A decrescendo means gradually getting SOFTER — like a wave fading away. They look like long hairpin shapes in the music: < for louder, > for softer.',
        detail: 'Think: the opening < grows bigger = crescendo (louder).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does a crescendo tell you to do?',
        correctAnswer: 'Gradually get louder',
        choices: ['Gradually get louder', 'Gradually get softer', 'Play very fast', 'Stop playing'],
      },
    ],
  },

  // Floor 25: Preview time signatures
  {
    id: 'lore-25',
    title: 'Counting Beats',
    gateFloor: 25,
    targetTier: 2,
    conceptIds: ['vocab:symbols:Time signature 4/4', 'vocab:symbols:Time signature 3/4'],
    steps: [
      {
        type: 'teach',
        heading: 'Time Signatures',
        body: 'The two numbers at the start of music tell you how to count. 4/4 means 4 beats per measure — count: 1-2-3-4. 3/4 means 3 beats per measure — count: 1-2-3, like a waltz!',
        detail: 'The top number = how many beats. The bottom number = which note gets 1 beat.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'In 3/4 time, how many beats are in each measure?',
        correctAnswer: '3',
        choices: ['3', '4', '6', '2'],
      },
    ],
  },

  // Floor 30: Review tempo terms + preview more
  {
    id: 'lore-30',
    title: 'The Speed of Music',
    gateFloor: 30,
    targetTier: 2,
    conceptIds: ['vocab:tempo:Ritardando', 'vocab:tempo:Accelerando'],
    steps: [
      {
        type: 'teach',
        heading: 'Speeding Up and Slowing Down',
        body: 'Ritardando (rit.) means gradually slowing down — like gently pressing the brakes. Accelerando (accel.) means gradually speeding up — like pressing the gas pedal. Remember: "r" for ritardando and "reduce speed."',
        detail: 'Allegro = fast, Adagio = slow, Andante = walking pace, Moderato = moderate.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "Ritardando" tell a musician to do?',
        correctAnswer: 'Gradually slow down',
        choices: ['Gradually slow down', 'Gradually speed up', 'Play very loud', 'Repeat the section'],
      },
    ],
  },

  // Floor 35: Preview T3 concepts — accidentals
  {
    id: 'lore-35',
    title: 'Sharps, Flats, and Naturals',
    gateFloor: 35,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Sharp', 'vocab:symbols:Flat', 'vocab:symbols:Natural'],
    steps: [
      {
        type: 'teach',
        heading: 'Accidentals',
        body: 'A sharp (#) raises a note by a half step — one key to the right on a piano. A flat (b) lowers a note by a half step — one key to the left. A natural cancels any sharp or flat, returning to the plain note.',
        detail: 'Think: sharp edge points UP, flat tire goes DOWN.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does a sharp do to a note?',
        correctAnswer: 'Raises it by a half step',
        choices: ['Raises it by a half step', 'Lowers it by a half step', 'Makes it louder', 'Makes it longer'],
      },
    ],
  },

  // ── T2→T3 transition (floors 36-42) ────────────────────

  // Floor 40: Review intervals + preview key signatures
  {
    id: 'lore-40',
    title: 'Steps and Skips',
    gateFloor: 40,
    targetTier: 3,
    conceptIds: ['interval:stepSkip:Step', 'interval:stepSkip:Skip', 'vocab:symbols:Key signature'],
    steps: [
      {
        type: 'teach',
        heading: 'Steps, Skips, and Key Signatures',
        body: 'A step moves to the very next note (C to D). A skip jumps over one (C to E). Coming up: key signatures — the sharps or flats at the start of a staff that apply to the whole piece, so you don\'t have to write them on every note.',
        detail: 'Think of stairs: a step is one stair, a skip is two.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is a key signature?',
        correctAnswer: 'Sharps or flats at the start of a staff',
        choices: ['Sharps or flats at the start of a staff', 'A clef at the start', 'The tempo marking', 'The title of the piece'],
      },
    ],
  },

  // ── T3 pure (floors 43-68) ─────────────────────────────

  // Floor 45: Preview dynamics ordering
  {
    id: 'lore-45',
    title: 'Dynamic Levels',
    gateFloor: 45,
    targetTier: 3,
    conceptIds: ['vocab:dynamics:pp', 'vocab:dynamics:ff'],
    steps: [
      {
        type: 'teach',
        heading: 'The Full Dynamic Range',
        body: 'Beyond f and p, there are more levels: pp (pianissimo) = very soft, ff (fortissimo) = very loud, mp (mezzo-piano) = moderately soft, mf (mezzo-forte) = moderately loud. From softest to loudest: pp, p, mp, mf, f, ff.',
        detail: '"Mezzo" means "medium" in Italian — so mp and mf are the middle ground.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "pp" mean?',
        correctAnswer: 'Very soft',
        choices: ['Very soft', 'Very loud', 'Moderately loud', 'Moderately soft'],
      },
    ],
  },

  // Floor 50: Review dotted rhythms + preview fermata
  {
    id: 'lore-50',
    title: 'Dots and Holds',
    gateFloor: 50,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Dotted quarter note', 'vocab:symbols:Fermata'],
    steps: [
      {
        type: 'teach',
        heading: 'Dotted Notes and Fermatas',
        body: 'A dot after a note adds half its value. A dotted quarter note = 1.5 beats (1 + 0.5). A fermata is a symbol that means "hold this note longer than written" — the performer decides how long. It looks like an eye or a bird above the note.',
        detail: 'Dots make notes longer by 50%. A dotted half note = 3 beats (2 + 1).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'How many beats does a dotted quarter note get?',
        correctAnswer: '1.5 beats',
        choices: ['1.5 beats', '1 beat', '2 beats', '0.5 beats'],
      },
    ],
  },

  // Floor 56: Review tempo terms at T3
  {
    id: 'lore-56',
    title: 'More Tempo Markings',
    gateFloor: 56,
    targetTier: 3,
    conceptIds: ['vocab:tempo:Presto', 'vocab:tempo:Largo'],
    steps: [
      {
        type: 'teach',
        heading: 'Fast and Slow Tempos',
        body: 'Presto means very fast — think of a magician saying "presto!" Largo means very slow and broad. Vivace means lively and fast. From slowest to fastest: Largo, Adagio, Andante, Moderato, Allegretto, Allegro, Vivace, Presto.',
        detail: 'A useful trick: "Largo" sounds like "large" — taking big, slow steps.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'Which tempo marking means "very fast"?',
        correctAnswer: 'Presto',
        choices: ['Presto', 'Largo', 'Andante', 'Adagio'],
      },
    ],
  },

  // Floor 62: Preview repeats and form
  {
    id: 'lore-62',
    title: 'Repeat and Form',
    gateFloor: 62,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Repeat sign', 'vocab:symbols:Time signature 6/8'],
    steps: [
      {
        type: 'teach',
        heading: 'Repeat Signs and 6/8 Time',
        body: 'A repeat sign tells you to go back and play a section again — it looks like a double bar with two dots. 6/8 time has 6 eighth-note beats per measure, usually felt in 2 groups of 3: ONE-two-three-FOUR-five-six.',
        detail: '6/8 time feels different from 3/4 even though both have the same total note value per measure.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does a repeat sign tell you to do?',
        correctAnswer: 'Go back and play the section again',
        choices: ['Go back and play the section again', 'Play louder', 'Speed up', 'Skip to the end'],
      },
    ],
  },

  // Floor 68: Preview T4 concepts — instruments and triplets
  {
    id: 'lore-68',
    title: 'Instruments and Triplets',
    gateFloor: 68,
    targetTier: 4,
    conceptIds: ['vocab:symbols:Triplet', 'vocab:symbols:Bass clef'],
    steps: [
      {
        type: 'teach',
        heading: 'Triplets and the Bass Clef',
        body: 'A triplet squeezes 3 notes into the space of 2 — say "trip-o-let" to feel the rhythm. The bass clef marks the lower-pitched staff. Its line notes spell "Good Boys Do Fine Always" (G, B, D, F, A).',
        detail: 'Coming up: you\'ll learn to identify instruments by their sound family — strings, woodwinds, brass, and percussion.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'How many notes does a triplet squeeze into the space of 2?',
        correctAnswer: '3',
        choices: ['3', '2', '4', '6'],
      },
    ],
  },

  // ── T3→T4 transition (floors 69-75) ────────────────────

  // Floor 73: Review accidentals + preview D.S. and Coda
  {
    id: 'lore-73',
    title: 'Navigation Symbols',
    gateFloor: 73,
    targetTier: 4,
    conceptIds: ['vocab:symbols:D.S. (Dal Segno)', 'vocab:symbols:Coda'],
    steps: [
      {
        type: 'teach',
        heading: 'D.S. and Coda',
        body: 'D.S. (Dal Segno) means "from the sign" — go back to a special marker in the music. Coda means "tail" — it\'s the ending section. When you see "D.S. al Coda," go back to the sign, play until you see "To Coda," then jump to the Coda to finish.',
        detail: 'Think of it like a treasure map: the sign marks where to go back, and the coda is the X that marks the end.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "D.S." tell you to do?',
        correctAnswer: 'Go back to the sign',
        choices: ['Go back to the sign', 'Play louder', 'Play the coda', 'Repeat from the beginning'],
      },
    ],
  },

  // ── T4 pure (floors 76-88) ─────────────────────────────

  // Floor 78: Review instrument families
  {
    id: 'lore-78',
    title: 'Instrument Families',
    gateFloor: 78,
    targetTier: 4,
    conceptIds: ['vocab:terms:Instrument'],
    steps: [
      {
        type: 'teach',
        heading: 'The Four Families',
        body: 'Every orchestra instrument belongs to a family. Strings vibrate strings (violin, cello, guitar). Woodwinds use air and reeds (flute, clarinet, oboe). Brass instruments buzz lips into a mouthpiece (trumpet, trombone, horn). Percussion is struck or shaken (drums, xylophone, cymbals).',
        detail: 'Listen for brightness (brass), warmth (strings), breathiness (woodwinds), or sharp attacks (percussion).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'Which instrument family uses reeds or air to make sound?',
        correctAnswer: 'Woodwinds',
        choices: ['Woodwinds', 'Brass', 'Strings', 'Percussion'],
      },
    ],
  },

  // Floor 83: Review ties vs slurs + preview accents
  {
    id: 'lore-83',
    title: 'Ties, Slurs, and Accents',
    gateFloor: 83,
    targetTier: 4,
    conceptIds: ['vocab:symbols:Tie vs Slur', 'vocab:symbols:Accent'],
    steps: [
      {
        type: 'teach',
        heading: 'Ties vs Slurs and Accents',
        body: 'A tie connects two notes of the SAME pitch — hold through both. A slur connects DIFFERENT pitches — play them smoothly connected. An accent (>) means emphasize that note — give it extra punch. A marcato (^) is even stronger.',
        detail: 'Same pitch = tie (one long note). Different pitches = slur (smooth connection).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is the difference between a tie and a slur?',
        correctAnswer: 'A tie connects same pitches; a slur connects different pitches',
        choices: ['A tie connects same pitches; a slur connects different pitches', 'A tie is louder than a slur', 'They are the same thing', 'A slur connects same pitches; a tie connects different pitches'],
      },
    ],
  },

  // Floor 88: Preview T5 concepts — ornaments
  {
    id: 'lore-88',
    title: 'Advanced Notation',
    gateFloor: 88,
    targetTier: 5,
    conceptIds: ['vocab:symbols:Trill', 'vocab:tempo:Rubato'],
    steps: [
      {
        type: 'teach',
        heading: 'Ornaments and Rubato',
        body: 'A trill (tr) rapidly alternates between two adjacent notes — like a bird singing. A mordent is a quick "wiggle" to the note below and back. Rubato means "stolen time" — the performer speeds up and slows down expressively, bending the tempo.',
        detail: 'Coming up: grace notes (quick decorative notes), 8va (play an octave higher), and more!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is a trill?',
        correctAnswer: 'Rapid alternation between two adjacent notes',
        choices: ['Rapid alternation between two adjacent notes', 'A very slow tempo', 'Playing very loudly', 'A type of rest'],
      },
    ],
  },

  // ── T4→T5 transition (floors 89-94) ────────────────────

  // Floor 92: Review complex tempo terms
  {
    id: 'lore-92',
    title: 'Tempo Mastery',
    gateFloor: 92,
    targetTier: 5,
    conceptIds: ['vocab:tempo:Grave', 'vocab:tempo:Prestissimo'],
    steps: [
      {
        type: 'teach',
        heading: 'Extreme Tempos',
        body: 'Grave means very slow and solemn — the slowest standard tempo. Prestissimo means extremely fast — as fast as it gets! "A tempo" means go back to the previous speed, and "Tempo primo" means return to the very first tempo of the piece.',
        detail: 'Full tempo order: Grave, Largo, Lento, Adagio, Andante, Moderato, Allegretto, Allegro, Vivace, Presto, Prestissimo.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'Which is the fastest standard tempo marking?',
        correctAnswer: 'Prestissimo',
        choices: ['Prestissimo', 'Presto', 'Vivace', 'Allegro'],
      },
    ],
  },

  // ── T5 pure (floors 95-100) ─────────────────────────────

  // Floor 96: Review ornaments + preview advanced symbols
  {
    id: 'lore-96',
    title: 'The Final Frontier',
    gateFloor: 96,
    targetTier: 5,
    conceptIds: ['vocab:symbols:Grace note', 'vocab:symbols:8va'],
    steps: [
      {
        type: 'teach',
        heading: 'Grace Notes and Octave Signs',
        body: 'A grace note is a tiny, quick ornamental note played just before the main note — like a musical springboard. 8va means "play one octave higher than written" and 8vb means "play one octave lower." These save space by avoiding lots of ledger lines.',
        detail: 'You\'ve mastered nearly everything! These final concepts round out professional-level notation reading.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does 8va mean?',
        correctAnswer: 'Play one octave higher',
        choices: ['Play one octave higher', 'Play one octave lower', 'Play 8 times', 'Play very fast'],
      },
    ],
  },
];

/** Set of all floors that have lore lessons. */
export const LORE_GATE_FLOORS = new Set(LORE_LESSONS.map(l => l.gateFloor));

/**
 * Get the lore lesson for a given floor, if one exists.
 * Returns undefined if no lesson is scheduled for this floor.
 */
export function getLoreLesson(floorNumber: number): LoreLesson | undefined {
  return LORE_LESSONS.find(l => l.gateFloor === floorNumber);
}

/**
 * @deprecated Use getLoreLesson instead. Kept for backward compatibility.
 */
export function getMandatoryLoreLesson(floorNumber: number): LoreLesson | undefined {
  return getLoreLesson(floorNumber);
}

/**
 * Pick a random optional lore lesson appropriate for the given tier.
 */
export function getRandomOptionalLoreLesson(tier: Tier): LoreLesson {
  const eligible = LORE_LESSONS.filter(l => l.targetTier <= tier);
  if (eligible.length === 0) return LORE_LESSONS[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}
