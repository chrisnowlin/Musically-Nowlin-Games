/**
 * Lore Room Data — System 3
 *
 * Short interstitial teaching moments between floors. All are optional
 * (skippable). Each lesson is 2 steps: 1 teach + 1 practice.
 *
 * Distribution is front-loaded for K-5 students:
 *   T1 (floors 1-12):   5 lessons — foundational concepts
 *   T2 (floors 13-35):  7 lessons — expanding vocabulary
 *   T3 (floors 36-68):  6 lessons — intermediate concepts
 *   T4-T5 (floors 69+): 3 lessons — lighter coverage for advanced students
 *
 * Content leans toward previewing upcoming concepts with review mixed in.
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

// ═══════════════════════════════════════════════════════════════
// T1  —  Floors 1-12  (K-1 foundations)
// 5 lessons: every 2-3 floors
// ═══════════════════════════════════════════════════════════════

export const LORE_LESSONS: LoreLesson[] = [

  // Floor 2: Voice types — this is the very first concept students encounter
  {
    id: 'lore-02',
    title: 'Using Your Voice',
    gateFloor: 2,
    targetTier: 1,
    conceptIds: ['vocab:terms:Singer', 'vocab:terms:Song'],
    steps: [
      {
        type: 'teach',
        heading: 'Four Kinds of Voices',
        body: 'You use different voices for different things! Your SINGING voice is for songs and music. Your SPEAKING voice is for talking normally. Your WHISPERING voice is soft and quiet. Your SHOUTING voice is loud and strong — like cheering at a game!',
        detail: 'Think about which voice fits: a lullaby? Singing voice! A secret? Whispering voice!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'Which voice would you use to sing "Happy Birthday"?',
        correctAnswer: 'Singing Voice',
        choices: ['Singing Voice', 'Speaking Voice', 'Whispering Voice', 'Shouting Voice'],
      },
    ],
  },

  // Floor 4: Beat and rhythm — the foundation of everything
  {
    id: 'lore-04',
    title: 'The Heartbeat of Music',
    gateFloor: 4,
    targetTier: 1,
    conceptIds: ['vocab:terms:Beat', 'vocab:terms:Rhythm'],
    steps: [
      {
        type: 'teach',
        heading: 'Beat and Rhythm',
        body: 'Every piece of music has a BEAT — a steady pulse, like a heartbeat or a clock ticking. Clap along: clap-clap-clap-clap! RHYTHM is the pattern of long and short sounds that ride on top of the beat — it\'s what makes music interesting!',
        detail: 'Try this: tap a steady beat with your foot, then clap a pattern on top!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is the steady pulse in music called?',
        correctAnswer: 'The beat',
        choices: ['The beat', 'The melody', 'The song', 'The singer'],
      },
    ],
  },

  // Floor 6: High/low + note values — both core to T1 challenges
  {
    id: 'lore-06',
    title: 'High, Low, and Note Shapes',
    gateFloor: 6,
    targetTier: 1,
    conceptIds: ['vocab:terms:High', 'vocab:terms:Low', 'vocab:symbols:Quarter note'],
    steps: [
      {
        type: 'teach',
        heading: 'High and Low Sounds',
        body: 'Sounds can be HIGH (thin and bright, like a whistle or a bird) or LOW (deep and rumbly, like a tuba or thunder). In music, notes go higher as you move up the staff, and lower as you move down. A quarter note gets 1 beat, a half note gets 2 beats, and a whole note gets 4 beats!',
        detail: 'The more filled-in a note looks, the shorter it lasts. A quarter note is filled in — a whole note is just an empty circle.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'How many beats does a quarter note get?',
        correctAnswer: '1 beat',
        choices: ['1 beat', '2 beats', '4 beats', '3 beats'],
      },
    ],
  },

  // Floor 9: Loud/soft and fast/slow — dynamics and tempo basics
  {
    id: 'lore-09',
    title: 'Loud, Soft, Fast, Slow',
    gateFloor: 9,
    targetTier: 1,
    conceptIds: ['vocab:dynamics:f', 'vocab:dynamics:p', 'vocab:tempo:Allegro', 'vocab:tempo:Adagio'],
    steps: [
      {
        type: 'teach',
        heading: 'Dynamics and Tempo',
        body: '"f" stands for FORTE — play LOUD! "p" stands for PIANO — play SOFT! Musicians also use words for speed: ALLEGRO means fast, and ADAGIO means slow. So music can be loud AND fast, or soft AND slow, or any mix!',
        detail: 'Remember: "f" for "force" (loud) and "p" for "peaceful" (soft).',
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

  // Floor 11: Treble clef + staff reading preview
  {
    id: 'lore-11',
    title: 'Reading the Music Staff',
    gateFloor: 11,
    targetTier: 1,
    conceptIds: ['vocab:symbols:Treble clef', 'vocab:symbols:Quarter rest'],
    steps: [
      {
        type: 'teach',
        heading: 'The Staff and Treble Clef',
        body: 'Music is written on 5 lines called a STAFF. The TREBLE CLEF at the beginning tells you which notes go where. The space notes spell F-A-C-E from bottom to top! A QUARTER REST means 1 beat of silence — shh!',
        detail: 'The space notes spell a word you know: FACE! That makes them easy to remember.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What do the space notes on the treble clef spell?',
        correctAnswer: 'FACE',
        choices: ['FACE', 'BEAD', 'CAGE', 'DEAF'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // T2  —  Floors 13-35  (Grades 2-3)
  // 7 lessons: every 3-4 floors
  // ═══════════════════════════════════════════════════════════════

  // Floor 14: Italian words for dynamics — preview the full words
  {
    id: 'lore-14',
    title: 'Italian Words for Loud and Soft',
    gateFloor: 14,
    targetTier: 2,
    conceptIds: ['vocab:dynamics:piano', 'vocab:dynamics:forte'],
    steps: [
      {
        type: 'teach',
        heading: 'Piano and Forte',
        body: 'You know f and p — now meet the full Italian words! "Piano" means soft, and "forte" means loud. Together they made the word "pianoforte" — that\'s the full name of the piano, because it can play soft AND loud! You\'ll also see "mf" (moderately loud) and "mp" (moderately soft).',
        detail: '"Mezzo" means "medium" — so mf and mp are the middle ground between loud and soft.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "piano" mean in music?',
        correctAnswer: 'Soft',
        choices: ['Soft', 'Loud', 'Medium', 'The instrument only'],
      },
    ],
  },

  // Floor 17: Note values and ties — expanding rhythmic knowledge
  {
    id: 'lore-17',
    title: 'Longer Notes and Ties',
    gateFloor: 17,
    targetTier: 2,
    conceptIds: ['vocab:symbols:Half note', 'vocab:symbols:Whole note', 'vocab:symbols:Tied note'],
    steps: [
      {
        type: 'teach',
        heading: 'Rests, Ties, and Eighth Notes',
        body: 'A HALF REST is 2 beats of silence (it sits ON the line). A WHOLE REST is 4 beats of silence (it hangs UNDER the line). A TIE connects two notes of the same pitch so you hold through both. EIGHTH NOTES are fast — two of them fit in 1 beat!',
        detail: 'Whole rest hangs down like a hole in the ground. Half rest sits up like a hat on a head!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does a tie do?',
        correctAnswer: 'Connects two notes to combine their durations',
        choices: ['Connects two notes to combine their durations', 'Makes the note louder', 'Makes the note shorter', 'Adds a beat of silence'],
      },
    ],
  },

  // Floor 20: Crescendo/decrescendo — getting louder and softer
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
        body: 'A CRESCENDO means gradually getting LOUDER — like a wave building. A DECRESCENDO means gradually getting SOFTER — like a wave fading. They look like long hairpin shapes in the music: < for louder, > for softer.',
        detail: 'The opening < gets bigger = crescendo (louder). The closing > gets smaller = decrescendo (softer).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does a crescendo mean?',
        correctAnswer: 'Gradually get louder',
        choices: ['Gradually get louder', 'Gradually get softer', 'Play very fast', 'Stop playing'],
      },
    ],
  },

  // Floor 23: Time signatures — how we count beats
  {
    id: 'lore-23',
    title: 'Counting Beats in a Measure',
    gateFloor: 23,
    targetTier: 2,
    conceptIds: ['vocab:symbols:Time signature 4/4', 'vocab:symbols:Time signature 3/4'],
    steps: [
      {
        type: 'teach',
        heading: 'Time Signatures',
        body: 'Two numbers at the start of music tell you how to count. 4/4 means 4 beats per measure — count 1-2-3-4, 1-2-3-4. 3/4 means 3 beats per measure — count 1-2-3, 1-2-3. That\'s a waltz! The top number = how many beats. The bottom = which note gets 1 beat.',
        detail: 'Most music you hear is in 4/4 time. "Happy Birthday" is in 3/4 time!',
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

  // Floor 26: Tempo terms — speeding up and slowing down
  {
    id: 'lore-26',
    title: 'The Speed of Music',
    gateFloor: 26,
    targetTier: 2,
    conceptIds: ['vocab:tempo:Andante', 'vocab:tempo:Moderato', 'vocab:tempo:Ritardando'],
    steps: [
      {
        type: 'teach',
        heading: 'More Tempo Words',
        body: 'ANDANTE means walking pace — not too fast, not too slow. MODERATO means moderate speed. RITARDANDO (rit.) means gradually slow down — like gently pressing the brakes. ACCELERANDO (accel.) means gradually speed up — like pressing the gas!',
        detail: 'Remember: "rit." for ritardando starts with "r" like "reduce speed."',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "Andante" mean?',
        correctAnswer: 'Walking pace',
        choices: ['Walking pace', 'Very fast', 'Very slow', 'Extremely loud'],
      },
    ],
  },

  // Floor 29: Staccato, legato, and musical form
  {
    id: 'lore-29',
    title: 'Smooth, Bouncy, and Song Shapes',
    gateFloor: 29,
    targetTier: 2,
    conceptIds: ['vocab:terms:Staccato', 'vocab:terms:Legato', 'vocab:terms:AB form'],
    steps: [
      {
        type: 'teach',
        heading: 'Staccato, Legato, and Form',
        body: 'STACCATO means notes played short and bouncy — like popping popcorn. LEGATO means notes played smooth and connected — like pouring honey. Music also has FORM — a shape or pattern. AB form has two different sections. ABA form goes: first part, new part, first part again!',
        detail: 'Think of a sandwich: ABA form is like bread-filling-bread!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "staccato" mean?',
        correctAnswer: 'Short and detached',
        choices: ['Short and detached', 'Smooth and connected', 'Very loud', 'Very fast'],
      },
    ],
  },

  // Floor 33: Steps and skips + staff review — preview intervals for T2
  {
    id: 'lore-33',
    title: 'Steps and Skips',
    gateFloor: 33,
    targetTier: 2,
    conceptIds: ['interval:stepSkip:Step', 'interval:stepSkip:Skip'],
    steps: [
      {
        type: 'teach',
        heading: 'How Notes Move',
        body: 'Notes can move by STEP (to the very next note, like C to D) or by SKIP (jumping over a note, like C to E). Steps sound close together, skips sound further apart. You can also hear if a second note is HIGHER, LOWER, or the SAME as the first.',
        detail: 'Think of stairs: a step is one stair, a skip is two stairs at once!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'C to E (jumping over D) is what kind of movement?',
        correctAnswer: 'A skip',
        choices: ['A skip', 'A step', 'The same note', 'A rest'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // T3  —  Floors 36-68  (Grades 4-5)
  // 6 lessons: every 5-6 floors
  // ═══════════════════════════════════════════════════════════════

  // Floor 37: Accidentals — sharps and flats preview
  {
    id: 'lore-37',
    title: 'Sharps and Flats',
    gateFloor: 37,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Sharp', 'vocab:symbols:Flat', 'vocab:symbols:Natural'],
    steps: [
      {
        type: 'teach',
        heading: 'Accidentals',
        body: 'A SHARP (#) raises a note by a half step — one key to the right on a piano. A FLAT (b) lowers a note by a half step — one key to the left. A NATURAL cancels any sharp or flat. Together, sharps, flats, and naturals are called ACCIDENTALS.',
        detail: 'Think: sharp edge points UP (raises the note), flat tire goes DOWN (lowers the note).',
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

  // Floor 42: Dynamic levels — pp, ff, and ordering
  {
    id: 'lore-42',
    title: 'The Full Dynamic Range',
    gateFloor: 42,
    targetTier: 3,
    conceptIds: ['vocab:dynamics:pp', 'vocab:dynamics:ff', 'vocab:dynamics:mp'],
    steps: [
      {
        type: 'teach',
        heading: 'From Very Soft to Very Loud',
        body: 'Beyond f and p, there are more levels! pp (pianissimo) = very soft. ff (fortissimo) = very loud. mp (mezzo-piano) = moderately soft. mf (mezzo-forte) = moderately loud. The full order from softest to loudest: pp, p, mp, mf, f, ff.',
        detail: '"Pianissimo" = very very soft (double piano). "Fortissimo" = very very loud (double forte).',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "pp" mean?',
        correctAnswer: 'Very soft',
        choices: ['Very soft', 'Very loud', 'Moderately soft', 'Moderately loud'],
      },
    ],
  },

  // Floor 48: Dotted notes, fermata, and repeat signs
  {
    id: 'lore-48',
    title: 'Dots, Holds, and Repeats',
    gateFloor: 48,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Dotted quarter note', 'vocab:symbols:Fermata', 'vocab:symbols:Repeat sign'],
    steps: [
      {
        type: 'teach',
        heading: 'Special Note Symbols',
        body: 'A DOT after a note adds half its value. A dotted quarter note = 1.5 beats (1 + 0.5). A FERMATA means "hold this note longer than written" — the performer decides how long! A REPEAT SIGN means go back and play that section again.',
        detail: 'The fermata looks like a little eye above the note. When you see it, hold and listen!',
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

  // Floor 53: More tempo + syncopation
  {
    id: 'lore-53',
    title: 'Fast, Slow, and Surprising Rhythms',
    gateFloor: 53,
    targetTier: 3,
    conceptIds: ['vocab:tempo:Presto', 'vocab:tempo:Largo', 'vocab:terms:Syncopation'],
    steps: [
      {
        type: 'teach',
        heading: 'Extreme Tempos and Syncopation',
        body: 'PRESTO means very fast — think of a magician saying "presto!" LARGO means very slow and broad. SYNCOPATION means putting emphasis on unexpected beats — it makes music feel jazzy and surprising, like clapping on beats 2 and 4 instead of 1 and 3!',
        detail: '"Largo" sounds like "large" — taking big, slow, heavy steps.',
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

  // Floor 58: Timbre and call-and-response
  {
    id: 'lore-58',
    title: 'The Color of Sound',
    gateFloor: 58,
    targetTier: 3,
    conceptIds: ['vocab:terms:Timbre', 'vocab:terms:Call and response'],
    steps: [
      {
        type: 'teach',
        heading: 'Timbre and Call-and-Response',
        body: 'TIMBRE (say "TAM-ber") is the unique color or quality of a sound — it\'s why a violin and a trumpet playing the same note sound different. CALL AND RESPONSE is when one group performs a phrase, then another group answers back — like a musical conversation!',
        detail: 'Think: a flute sounds bright and airy, a cello sounds warm and deep. Same note, different timbre!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is timbre?',
        correctAnswer: 'The unique quality or color of a sound',
        choices: ['The unique quality or color of a sound', 'How loud a sound is', 'How fast the music goes', 'The number of beats per measure'],
      },
    ],
  },

  // Floor 64: Key signatures and 6/8 time
  {
    id: 'lore-64',
    title: 'Keys and Compound Time',
    gateFloor: 64,
    targetTier: 3,
    conceptIds: ['vocab:symbols:Key signature', 'vocab:symbols:Time signature 6/8'],
    steps: [
      {
        type: 'teach',
        heading: 'Key Signatures and 6/8 Time',
        body: 'A KEY SIGNATURE is the group of sharps or flats at the very beginning of a staff — they apply to the whole piece so you don\'t have to write them on every note! 6/8 TIME has 6 eighth-note beats per measure, usually felt in 2 groups of 3: ONE-two-three-FOUR-five-six.',
        detail: '6/8 time often sounds like a rocking boat or a jig!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What is a key signature?',
        correctAnswer: 'Sharps or flats at the beginning of a staff',
        choices: ['Sharps or flats at the beginning of a staff', 'The tempo marking', 'The title of the piece', 'The clef symbol'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // T4-T5  —  Floors 69-100  (Grades 6-8 / HS)
  // 3 lessons: lighter coverage
  // ═══════════════════════════════════════════════════════════════

  // Floor 72: Instrument families and bass clef
  {
    id: 'lore-72',
    title: 'Instrument Families',
    gateFloor: 72,
    targetTier: 4,
    conceptIds: ['vocab:symbols:Bass clef', 'vocab:symbols:Triplet'],
    steps: [
      {
        type: 'teach',
        heading: 'Four Families and the Bass Clef',
        body: 'Every orchestra instrument belongs to a family. STRINGS vibrate strings (violin, cello). WOODWINDS use air (flute, clarinet). BRASS buzzes lips (trumpet, trombone). PERCUSSION is struck or shaken (drums, xylophone). The BASS CLEF marks the lower-pitched staff — its line notes spell "Good Boys Do Fine Always."',
        detail: 'A TRIPLET squeezes 3 notes into the space of 2. Say "trip-o-let" to feel the rhythm!',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'Which family uses reeds or air to make sound?',
        correctAnswer: 'Woodwinds',
        choices: ['Woodwinds', 'Brass', 'Strings', 'Percussion'],
      },
    ],
  },

  // Floor 82: Navigation symbols (D.S., Coda)
  {
    id: 'lore-82',
    title: 'Musical Navigation',
    gateFloor: 82,
    targetTier: 4,
    conceptIds: ['vocab:symbols:D.S. (Dal Segno)', 'vocab:symbols:Coda'],
    steps: [
      {
        type: 'teach',
        heading: 'D.S. and Coda',
        body: 'D.S. (Dal Segno) means "from the sign" — jump back to a special marker. CODA means "tail" — it\'s the ending section. When you see "D.S. al Coda," go back to the sign, play until you see "To Coda," then jump to the ending.',
        detail: 'Think of it like a treasure map: the sign marks where to go back, and the coda is the X at the end.',
      },
      {
        type: 'practice',
        heading: 'Quick Check',
        body: '',
        question: 'What does "D.S." mean?',
        correctAnswer: 'Go back to the sign',
        choices: ['Go back to the sign', 'Play louder', 'Play the ending', 'Repeat from the beginning'],
      },
    ],
  },

  // Floor 92: Ornaments preview for T5
  {
    id: 'lore-92',
    title: 'Ornaments and Expression',
    gateFloor: 92,
    targetTier: 5,
    conceptIds: ['vocab:symbols:Trill', 'vocab:tempo:Rubato'],
    steps: [
      {
        type: 'teach',
        heading: 'Trills and Rubato',
        body: 'A TRILL (tr) rapidly alternates between two adjacent notes — like a bird singing. RUBATO means "stolen time" — the performer flexes the tempo, speeding up and slowing down expressively. A GRACE NOTE is a tiny quick ornamental note played just before the main note.',
        detail: 'Advanced performers use rubato and ornaments to make music feel personal and alive.',
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
