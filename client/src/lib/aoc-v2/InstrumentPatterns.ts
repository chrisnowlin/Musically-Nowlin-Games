/**
 * Musical patterns for all orchestra instruments
 * Patterns are designed to complement each other when played together
 */

import type { Note, DrumHit, SoundEvent, InstrumentType } from './OrchestraAudioService';

export interface Pattern {
  id: string;
  name: string;
  instrument: InstrumentType;
  events: SoundEvent[];
  tempoMs: number;
}

// Helper to create notes quickly
const n = (name: Note['name'], octave: Note['octave'], duration: Note['duration'] = '025'): Note => 
  ({ name, octave, duration });

const nLong = (name: Note['name'], octave: Note['octave']): Note => 
  ({ name, octave, duration: '05' });

// Bass drum hits - using '1' for long since '05' doesn't have bass-drum-mallet
const hit = (duration: DrumHit['duration'] = '025'): DrumHit => ({ duration });
const hitLong = (): DrumHit => ({ duration: '1' });

// ============ VIOLIN PATTERNS ============
export const VIOLIN_PATTERNS: Pattern[] = [
  {
    id: 'violin-twinkle',
    name: 'Twinkle Twinkle',
    instrument: 'violin',
    tempoMs: 400,
    events: [
      n('C', 4), n('C', 4), n('G', 4), n('G', 4), n('A', 4), n('A', 4), nLong('G', 4),
      n('F', 4), n('F', 4), n('E', 4), n('E', 4), n('D', 4), n('D', 4), nLong('C', 4),
    ],
  },
  {
    id: 'violin-scale',
    name: 'C Major Scale',
    instrument: 'violin',
    tempoMs: 300,
    events: [n('C', 4), n('D', 4), n('E', 4), n('F', 4), n('G', 4), n('A', 4), n('B', 4), nLong('C', 5)],
  },
  {
    id: 'violin-arpeggio',
    name: 'C Major Arpeggio',
    instrument: 'violin',
    tempoMs: 350,
    events: [n('C', 4), n('E', 4), n('G', 4), nLong('C', 5), n('G', 4), n('E', 4), nLong('C', 4)],
  },
  {
    id: 'violin-fanfare',
    name: 'Fanfare',
    instrument: 'violin',
    tempoMs: 300,
    events: [
      n('G', 4), n('G', 4), n('G', 4), nLong('G', 4),
      n('A', 4), n('A', 4), n('A', 4), nLong('A', 4),
      n('B', 4), n('B', 4), { ...n('G', 5), dynamic: 'forte' } as Note, { ...nLong('G', 5), dynamic: 'forte' } as Note,
    ],
  },
];

// ============ FLUTE PATTERNS ============
export const FLUTE_PATTERNS: Pattern[] = [
  {
    id: 'flute-melody',
    name: 'Bird Song',
    instrument: 'flute',
    tempoMs: 250,
    events: [n('G', 5), n('A', 5), nLong('B', 5), n('A', 5), n('G', 5), nLong('E', 5)],
  },
  {
    id: 'flute-trill',
    name: 'Flutter',
    instrument: 'flute',
    tempoMs: 200,
    events: [n('C', 5), n('D', 5), n('C', 5), n('D', 5), n('E', 5), n('D', 5), n('E', 5), nLong('G', 5)],
  },
  {
    id: 'flute-scale',
    name: 'Ascending',
    instrument: 'flute',
    tempoMs: 300,
    events: [n('C', 5), n('D', 5), n('E', 5), n('F', 5), n('G', 5), n('A', 5), n('B', 5), nLong('C', 6)],
  },
];

// ============ CLARINET PATTERNS ============
export const CLARINET_PATTERNS: Pattern[] = [
  {
    id: 'clarinet-waltz',
    name: 'Waltz',
    instrument: 'clarinet',
    tempoMs: 400,
    events: [nLong('C', 4), n('E', 4), n('G', 4), nLong('C', 4), n('E', 4), n('G', 4)],
  },
  {
    id: 'clarinet-blues',
    name: 'Blues Lick',
    instrument: 'clarinet',
    tempoMs: 350,
    events: [n('G', 3), n('As', 3), n('C', 4), n('Cs', 4), n('D', 4), nLong('G', 3)],
  },
  {
    id: 'clarinet-legato',
    name: 'Smooth',
    instrument: 'clarinet',
    tempoMs: 500,
    events: [nLong('E', 4), nLong('G', 4), nLong('C', 5), nLong('G', 4)],
  },
];

// ============ TRUMPET PATTERNS ============
export const TRUMPET_PATTERNS: Pattern[] = [
  {
    id: 'trumpet-fanfare',
    name: 'Royal Fanfare',
    instrument: 'trumpet',
    tempoMs: 350,
    events: [
      { ...n('C', 4), dynamic: 'forte' } as Note, { ...n('C', 4), dynamic: 'forte' } as Note,
      { ...n('G', 4), dynamic: 'forte' } as Note, { ...nLong('G', 4), dynamic: 'forte' } as Note,
      { ...n('E', 4), dynamic: 'forte' } as Note, { ...nLong('C', 4), dynamic: 'forte' } as Note,
    ],
  },
  {
    id: 'trumpet-march',
    name: 'March',
    instrument: 'trumpet',
    tempoMs: 300,
    events: [n('G', 4), n('G', 4), n('A', 4), n('G', 4), n('C', 5), nLong('B', 4)],
  },
  {
    id: 'trumpet-call',
    name: 'Bugle Call',
    instrument: 'trumpet',
    tempoMs: 400,
    events: [n('G', 4), n('C', 5), n('E', 5), n('G', 5), nLong('E', 5), nLong('C', 5)],
  },
];

// ============ TUBA PATTERNS ============
export const TUBA_PATTERNS: Pattern[] = [
  {
    id: 'tuba-oom',
    name: 'Oom-Pah',
    instrument: 'tuba',
    tempoMs: 400,
    events: [nLong('C', 2), n('G', 2), n('G', 2), nLong('C', 2), n('G', 2), n('G', 2)],
  },
  {
    id: 'tuba-bass',
    name: 'Bass Line',
    instrument: 'tuba',
    tempoMs: 500,
    events: [nLong('C', 2), nLong('G', 1), nLong('A', 1), nLong('G', 1)],
  },
  {
    id: 'tuba-march',
    name: 'March Bass',
    instrument: 'tuba',
    tempoMs: 350,
    events: [n('C', 2), n('C', 2), n('G', 1), n('G', 1), n('A', 1), n('A', 1), nLong('G', 1)],
  },
];

// ============ BASS DRUM PATTERNS ============
export const BASS_DRUM_PATTERNS: Pattern[] = [
  {
    id: 'drum-beat',
    name: 'Basic Beat',
    instrument: 'bass-drum',
    tempoMs: 500,
    events: [hit(), hit(), hit(), hit()],
  },
  {
    id: 'drum-march',
    name: 'March Beat',
    instrument: 'bass-drum',
    tempoMs: 400,
    events: [hitLong(), hit(), hit(), hitLong(), hit(), hit()],
  },
  {
    id: 'drum-slow',
    name: 'Slow Pulse',
    instrument: 'bass-drum',
    tempoMs: 800,
    events: [hitLong(), hitLong()],
  },
];

