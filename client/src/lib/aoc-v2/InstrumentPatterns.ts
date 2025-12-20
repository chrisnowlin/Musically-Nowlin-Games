/**
 * Musical patterns for all orchestra instruments
 * All patterns follow 4/4 time signature
 * Duration: '025' = eighth note (0.5 beat), '05' = quarter note (1 beat), '1' = half note (2 beats)
 */

import type { Note, DrumHit, SoundEvent, InstrumentType, Rest } from './OrchestraAudioService';

export interface Pattern {
  id: string;
  name: string;
  instrument: InstrumentType;
  events: SoundEvent[];
  tempoMs: number; // ms per quarter note (beat)
}

// Helper to create notes - duration affects both sound length and timing
// '025' = eighth note, '05' = quarter note, '1' = half note
const n = (name: Note['name'], octave: Note['octave'], duration: Note['duration'] = '05'): Note =>
  ({ name, octave, duration });

const eighth = (name: Note['name'], octave: Note['octave']): Note =>
  ({ name, octave, duration: '025' });

const half = (name: Note['name'], octave: Note['octave']): Note =>
  ({ name, octave, duration: '1' });

// Rest helpers - silent but takes up time
const r = (duration: Rest['duration'] = '05'): Rest => ({ type: 'rest', duration });
const r8 = (): Rest => ({ type: 'rest', duration: '025' }); // eighth rest
const rHalf = (): Rest => ({ type: 'rest', duration: '1' }); // half rest

// Bass drum hits
const hit = (duration: DrumHit['duration'] = '05'): DrumHit => ({ duration });
const hit8 = (): DrumHit => ({ duration: '025' }); // eighth note hit
const hitHalf = (): DrumHit => ({ duration: '1' }); // half note hit

// ============ VIOLIN PATTERNS ============
// All patterns = 8 beats (2 measures of 4/4)
export const VIOLIN_PATTERNS: Pattern[] = [
  {
    id: 'violin-twinkle',
    name: 'Twinkle Twinkle',
    instrument: 'violin',
    tempoMs: 500,
    // |1 . 2 . 3 . 4 .| = 8 eighth notes = 4 beats
    // Two measures: C C G G | A A G -
    events: [
      eighth('C', 4), eighth('C', 4), eighth('G', 4), eighth('G', 4), // beat 1-2
      eighth('A', 4), eighth('A', 4), n('G', 4),                      // beat 3-4
      r(),                                                             // beat 1 (rest)
    ],
  },
  {
    id: 'violin-scale',
    name: 'C Major Scale',
    instrument: 'violin',
    tempoMs: 500,
    // 8 eighth notes = 4 beats (1 measure)
    events: [
      eighth('C', 4), eighth('D', 4), eighth('E', 4), eighth('F', 4),
      eighth('G', 4), eighth('A', 4), eighth('B', 4), eighth('C', 5),
    ],
  },
  {
    id: 'violin-arpeggio',
    name: 'C Major Arpeggio',
    instrument: 'violin',
    tempoMs: 500,
    // | C - E - | G - C - | = 4 half notes across 2 measures = 8 beats...
    // Let's do: | C E G C | G E C - | using quarters
    events: [
      n('C', 4), n('E', 4), n('G', 4), n('C', 5),  // measure 1
      n('G', 4), n('E', 4), half('C', 4),           // measure 2
    ],
  },
  {
    id: 'violin-fanfare',
    name: 'Fanfare',
    instrument: 'violin',
    tempoMs: 500,
    // | G G G - | C C C - | = 2 measures (using C5 instead of A4 for half note availability)
    events: [
      n('G', 4), n('G', 4), half('G', 4),  // measure 1: quarter, quarter, half
      n('C', 5), n('C', 5), half('C', 4),  // measure 2: quarter, quarter, half
    ],
  },
];

// ============ FLUTE PATTERNS ============
// All patterns = 4 or 8 beats (1-2 measures of 4/4)
export const FLUTE_PATTERNS: Pattern[] = [
  {
    id: 'flute-melody',
    name: 'Bird Song',
    instrument: 'flute',
    tempoMs: 500,
    // | G A B - | A G E - | = 2 measures
    events: [
      n('G', 5), n('A', 5), half('B', 5),  // measure 1
      n('A', 5), n('G', 5), half('E', 5),  // measure 2
    ],
  },
  {
    id: 'flute-trill',
    name: 'Flutter',
    instrument: 'flute',
    tempoMs: 500,
    // 8 eighth notes = 1 measure
    events: [
      eighth('C', 5), eighth('D', 5), eighth('C', 5), eighth('D', 5),
      eighth('E', 5), eighth('D', 5), eighth('E', 5), eighth('G', 5),
    ],
  },
  {
    id: 'flute-scale',
    name: 'Ascending',
    instrument: 'flute',
    tempoMs: 500,
    // 8 eighth notes = 1 measure
    events: [
      eighth('C', 5), eighth('D', 5), eighth('E', 5), eighth('F', 5),
      eighth('G', 5), eighth('A', 5), eighth('B', 5), eighth('C', 6),
    ],
  },
  {
    id: 'flute-dance',
    name: 'Dance',
    instrument: 'flute',
    tempoMs: 500,
    // | E . G . A - | G . E . C - | = 2 measures
    events: [
      eighth('E', 5), eighth('G', 5), half('A', 5), r(),  // measure 1
      eighth('G', 5), eighth('E', 5), half('C', 5), r(),  // measure 2
    ],
  },
];

// ============ CLARINET PATTERNS ============
// All patterns = 4 or 8 beats (1-2 measures of 4/4)
export const CLARINET_PATTERNS: Pattern[] = [
  {
    id: 'clarinet-melody',
    name: 'Melody',
    instrument: 'clarinet',
    tempoMs: 500,
    // | C - E G | C - E G | = 2 measures (half + quarter + quarter = 4 beats each)
    events: [
      half('C', 4), n('E', 4), n('G', 4),  // measure 1: 2 + 1 + 1 = 4 beats
      half('C', 4), n('E', 4), n('G', 4),  // measure 2: 2 + 1 + 1 = 4 beats
    ],
  },
  {
    id: 'clarinet-blues',
    name: 'Blues Lick',
    instrument: 'clarinet',
    tempoMs: 500,
    // | G Bb C C# D C# C G | = 8 eighth notes = 4 beats (1 measure)
    // Adding measure 2 for consistency
    events: [
      eighth('G', 3), eighth('As', 3), eighth('C', 4), eighth('Cs', 4),  // beats 1-2
      eighth('D', 4), eighth('Cs', 4), eighth('C', 4), eighth('G', 3),   // beats 3-4
      eighth('G', 3), eighth('As', 3), eighth('C', 4), eighth('D', 4),   // measure 2: beats 1-2
      eighth('C', 4), r8(), half('G', 3),                                  // beats 3-4
    ],
  },
  {
    id: 'clarinet-legato',
    name: 'Smooth',
    instrument: 'clarinet',
    tempoMs: 500,
    // | E - G - | C - G - | = 2 measures (4 half notes = 8 beats)
    events: [
      half('E', 4), half('G', 4),   // measure 1: 2 + 2 = 4 beats
      half('C', 5), half('G', 4),   // measure 2: 2 + 2 = 4 beats
    ],
  },
  {
    id: 'clarinet-dance',
    name: 'Dance',
    instrument: 'clarinet',
    tempoMs: 500,
    // | E . G . A - | G . E . C - | = 2 measures with rests
    events: [
      eighth('E', 4), eighth('G', 4), half('A', 4), r(),  // measure 1: 0.5 + 0.5 + 2 + 1 = 4 beats
      eighth('G', 4), eighth('E', 4), half('C', 4), r(),  // measure 2: 0.5 + 0.5 + 2 + 1 = 4 beats
    ],
  },
];

// ============ TRUMPET PATTERNS ============
// All patterns = 4 or 8 beats (1-2 measures of 4/4)
export const TRUMPET_PATTERNS: Pattern[] = [
  {
    id: 'trumpet-fanfare',
    name: 'Royal Fanfare',
    instrument: 'trumpet',
    tempoMs: 500,
    // | C C G - | E - C - | = 2 measures (1+1+2 = 4 beats, 2+2 = 4 beats)
    events: [
      { ...n('C', 4), dynamic: 'forte' } as Note, { ...n('C', 4), dynamic: 'forte' } as Note,
      { ...half('G', 4), dynamic: 'forte' } as Note,  // measure 1: 1 + 1 + 2 = 4 beats
      { ...half('E', 4), dynamic: 'forte' } as Note,
      { ...half('C', 4), dynamic: 'forte' } as Note,  // measure 2: 2 + 2 = 4 beats
    ],
  },
  {
    id: 'trumpet-march',
    name: 'March',
    instrument: 'trumpet',
    tempoMs: 500,
    // | G G G G | C - G - | = 2 measures (4 quarters = 4 beats, 2 halves = 4 beats)
    events: [
      n('G', 4), n('G', 4), n('G', 4), n('G', 4),  // measure 1: 1+1+1+1 = 4 beats
      half('C', 5), half('G', 4),                   // measure 2: 2+2 = 4 beats
    ],
  },
  {
    id: 'trumpet-call',
    name: 'Bugle Call',
    instrument: 'trumpet',
    tempoMs: 500,
    // | G C E G | E - C - | = 2 measures
    events: [
      n('G', 4), n('C', 5), n('E', 5), n('G', 5),  // measure 1: 1+1+1+1 = 4 beats
      half('E', 5), half('C', 5),                   // measure 2: 2+2 = 4 beats
    ],
  },
  {
    id: 'trumpet-herald',
    name: 'Herald',
    instrument: 'trumpet',
    tempoMs: 500,
    // | G . G . G - | C - - r | = 2 measures with rest
    events: [
      eighth('G', 4), eighth('G', 4), eighth('G', 4), r8(), half('G', 4),  // measure 1: 0.5+0.5+0.5+0.5+2 = 4 beats
      half('C', 5), r(), r(),                                               // measure 2: 2+1+1 = 4 beats
    ],
  },
];

// ============ TUBA PATTERNS ============
// All patterns = 4 or 8 beats (1-2 measures of 4/4)
export const TUBA_PATTERNS: Pattern[] = [
  {
    id: 'tuba-oom',
    name: 'Oom-Pah',
    instrument: 'tuba',
    tempoMs: 500,
    // | C - G G | C - G G | = 2 measures (bass on 1, chords on 3-4)
    events: [
      half('C', 2), n('G', 2), n('G', 2),  // measure 1
      half('C', 2), n('G', 2), n('G', 2),  // measure 2
    ],
  },
  {
    id: 'tuba-bass',
    name: 'Bass Line',
    instrument: 'tuba',
    tempoMs: 500,
    // | C - - - | G - A - | G - - - | C - - - | = 4 measures, but let's do 2
    // | C - G - | A - G - | = 2 measures
    events: [
      half('C', 2), half('G', 1),  // measure 1
      half('A', 1), half('G', 1),  // measure 2
    ],
  },
  {
    id: 'tuba-march',
    name: 'March Bass',
    instrument: 'tuba',
    tempoMs: 500,
    // | C C G G | A A G - | = 2 measures
    events: [
      n('C', 2), n('C', 2), n('G', 1), n('G', 1),  // measure 1
      n('A', 1), n('A', 1), half('G', 1),           // measure 2
    ],
  },
  {
    id: 'tuba-pulse',
    name: 'Steady Pulse',
    instrument: 'tuba',
    tempoMs: 500,
    // | C C C C | = 1 measure of quarter notes
    events: [n('C', 2), n('C', 2), n('C', 2), n('C', 2)],
  },
];

// ============ BASS DRUM PATTERNS ============
// All patterns = 4 or 8 beats (1-2 measures of 4/4)
// Only using '025' (eighth) and '1' (half) durations for mallet samples
export const BASS_DRUM_PATTERNS: Pattern[] = [
  {
    id: 'drum-beat',
    name: 'Basic Beat',
    instrument: 'bass-drum',
    tempoMs: 500,
    // | X . X . X . X . | = 8 eighth notes (1 measure) - hit on each beat
    events: [hit8(), r8(), hit8(), r8(), hit8(), r8(), hit8(), r8()],
  },
  {
    id: 'drum-march',
    name: 'March Beat',
    instrument: 'bass-drum',
    tempoMs: 500,
    // | X - - - X . X . | = 1 measure (half + eighth eighth eighth eighth)
    events: [
      hitHalf(), hit8(), r8(), hit8(), r8(),  // measure 1
    ],
  },
  {
    id: 'drum-slow',
    name: 'Slow Pulse',
    instrument: 'bass-drum',
    tempoMs: 500,
    // | X - - - | X - - - | = 2 half notes (2 measures)
    events: [hitHalf(), rHalf(), hitHalf(), rHalf()],
  },
  {
    id: 'drum-double',
    name: 'Double Hit',
    instrument: 'bass-drum',
    tempoMs: 500,
    // | X X . . X X . . | = eighth pairs with rests (1 measure)
    events: [hit8(), hit8(), r8(), r8(), hit8(), hit8(), r8(), r8()],
  },
];

