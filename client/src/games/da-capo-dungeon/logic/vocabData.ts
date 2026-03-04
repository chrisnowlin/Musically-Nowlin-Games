import type { Tier } from './dungeonTypes';

export type VocabCategory = 'dynamics' | 'tempo' | 'symbols' | 'terms';

export interface VocabEntry {
  term: string;
  definition: string;
  symbol?: string;
  tier: Tier;
  category: VocabCategory;
  /** Question format override. Defaults to 'standard' (4-choice MC). */
  format?: 'standard' | 'opposites' | 'ordering';
}

const DYNAMICS_ENTRIES: VocabEntry[] = [
  // Tier 1 (K-1): opposites format — just f vs p, no parenthetical hints
  { term: 'f', definition: 'Loud', tier: 1, category: 'dynamics', format: 'opposites' },
  { term: 'p', definition: 'Soft', tier: 1, category: 'dynamics', format: 'opposites' },
  // Tier 2 (2-3): standard 4-choice MC
  { term: 'piano', definition: 'Soft', symbol: '𝆏', tier: 2, category: 'dynamics' },
  { term: 'forte', definition: 'Loud', symbol: '𝆑', tier: 2, category: 'dynamics' },
  { term: 'mf', definition: 'Moderately loud', tier: 2, category: 'dynamics' },
  { term: 'mp', definition: 'Moderately soft', tier: 2, category: 'dynamics' },
  { term: 'Crescendo', definition: 'Gradually getting louder', symbol: 'cresc.', tier: 2, category: 'dynamics' },
  { term: 'Decrescendo', definition: 'Gradually getting softer', symbol: 'decresc.', tier: 2, category: 'dynamics' },
  // Tier 3 (4-5): standard + ordering
  { term: 'pp', definition: 'Very soft', tier: 3, category: 'dynamics' },
  { term: 'ff', definition: 'Very loud', tier: 3, category: 'dynamics' },
  { term: 'sfz', definition: 'Sudden strong accent', tier: 3, category: 'dynamics' },
  { term: 'fp', definition: 'Loud then immediately soft', tier: 3, category: 'dynamics' },
  { term: 'Softest to loudest: pp, p, mp, mf, f, ff', definition: 'The standard dynamic ordering from softest to loudest', tier: 3, category: 'dynamics', format: 'ordering' },
  // Tier 4 (6-8)
  { term: 'Diminuendo', definition: 'Gradually getting softer', symbol: 'dim.', tier: 4, category: 'dynamics' },
  { term: 'Morendo', definition: 'Dying away in volume and tempo', tier: 4, category: 'dynamics' },
  { term: 'Fortissimo', definition: 'Very loud', tier: 4, category: 'dynamics' },
  // Tier 5 (HS)
  { term: 'Diminuendo vs Decrescendo', definition: 'Two Italian terms for gradually getting softer; used interchangeably', tier: 5, category: 'dynamics' },
  { term: 'fp vs sfz', definition: 'One starts loud then gets quiet; the other is a sudden accent', tier: 5, category: 'dynamics' },
  { term: 'ppp', definition: 'Extremely soft', tier: 5, category: 'dynamics' },
  { term: 'fff', definition: 'Extremely loud', tier: 5, category: 'dynamics' },
];

const TEMPO_ENTRIES: VocabEntry[] = [
  // Tier 1 (K-1): opposites format — just Allegro vs Adagio
  { term: 'Allegro', definition: 'Fast', tier: 1, category: 'tempo', format: 'opposites' },
  { term: 'Adagio', definition: 'Slow', tier: 1, category: 'tempo', format: 'opposites' },
  // Tier 2 (2-3): standard MC
  { term: 'Andante', definition: 'Walking pace', tier: 2, category: 'tempo' },
  { term: 'Moderato', definition: 'Moderate speed', tier: 2, category: 'tempo' },
  { term: 'Ritardando', definition: 'Gradually slowing down', tier: 2, category: 'tempo' },
  { term: 'Accelerando', definition: 'Gradually speeding up', tier: 2, category: 'tempo' },
  // Tier 3 (4-5): standard + ordering
  { term: 'Presto', definition: 'Very fast', tier: 3, category: 'tempo' },
  { term: 'Largo', definition: 'Very slow', tier: 3, category: 'tempo' },
  { term: 'Vivace', definition: 'Lively and fast', tier: 3, category: 'tempo' },
  { term: 'Allegretto', definition: 'Moderately fast', tier: 3, category: 'tempo' },
  { term: 'Slowest to fastest: Largo, Adagio, Andante, Moderato, Allegretto, Allegro, Vivace, Presto', definition: 'The standard tempo ordering from slowest to fastest', tier: 3, category: 'tempo', format: 'ordering' },
  // Tier 4 (6-8)
  { term: 'Grave', definition: 'Very slow and solemn', tier: 4, category: 'tempo' },
  { term: 'Lento', definition: 'Slow', tier: 4, category: 'tempo' },
  { term: 'Prestissimo', definition: 'Extremely fast', tier: 4, category: 'tempo' },
  { term: 'Tempo primo', definition: 'Return to the original tempo', tier: 4, category: 'tempo' },
  { term: 'A tempo', definition: 'Return to the previous tempo', tier: 4, category: 'tempo' },
  { term: 'Rallentando', definition: 'Gradually slowing down', tier: 4, category: 'tempo' },
  { term: 'Allargando', definition: 'Slowing and growing broader', tier: 4, category: 'tempo' },
  // Tier 5 (HS)
  { term: 'Rubato', definition: 'Flexible tempo, speeding up and slowing down expressively', tier: 5, category: 'tempo' },
  { term: 'Alla breve', definition: 'Cut time (2/2)', tier: 5, category: 'tempo' },
  { term: 'Tempo giusto', definition: 'In strict time', tier: 5, category: 'tempo' },
  { term: "L'istesso tempo", definition: 'The same tempo (when meter changes)', tier: 5, category: 'tempo' },
];

const SYMBOLS_ENTRIES: VocabEntry[] = [
  // Tier 1 (K-1): note values
  { term: 'Quarter note', definition: 'Gets 1 beat', symbol: '\u{1D1A9}', tier: 1, category: 'symbols' },
  { term: 'Half note', definition: 'Gets 2 beats', symbol: '\u{1D15E}', tier: 1, category: 'symbols' },
  { term: 'Whole note', definition: 'Gets 4 beats', symbol: '\u{1D15D}', tier: 1, category: 'symbols' },
  { term: 'Quarter rest', definition: '1 beat of silence', symbol: '\u{1D13D}', tier: 1, category: 'symbols' },
  { term: 'Treble clef', definition: 'Marks the higher-pitched staff', symbol: '\u{1D11E}', tier: 1, category: 'symbols' },
  // Tier 2 (2-3)
  { term: 'Half rest', definition: '2 beats of silence', tier: 2, category: 'symbols' },
  { term: 'Whole rest', definition: '4 beats of silence (or a full measure)', tier: 2, category: 'symbols' },
  { term: 'Tied note', definition: 'Two notes connected to combine their durations', tier: 2, category: 'symbols' },
  { term: 'Dotted half note', definition: 'Gets 3 beats', tier: 2, category: 'symbols' },
  { term: 'Beamed eighth notes', definition: 'Two eighth notes connected by a beam', symbol: '\u{266B}', tier: 2, category: 'symbols' },
  { term: 'Time signature 4/4', definition: '4 beats per measure, quarter note gets 1 beat', tier: 2, category: 'symbols' },
  { term: 'Time signature 3/4', definition: '3 beats per measure, quarter note gets 1 beat', tier: 2, category: 'symbols' },
  // Tier 3 (4-5)
  { term: 'Sharp', definition: 'Raises a note by a half step', symbol: '\u{266F}', tier: 3, category: 'symbols' },
  { term: 'Flat', definition: 'Lowers a note by a half step', symbol: '\u{266D}', tier: 3, category: 'symbols' },
  { term: 'Natural', definition: 'Cancels a sharp or flat', symbol: '\u{266E}', tier: 3, category: 'symbols' },
  { term: 'Fermata', definition: 'Hold the note longer than its value', symbol: '\u{1D110}', tier: 3, category: 'symbols' },
  { term: 'Repeat sign', definition: 'Go back and play the section again', tier: 3, category: 'symbols' },
  { term: 'Dotted quarter note', definition: 'Gets 1.5 beats', tier: 3, category: 'symbols' },
  { term: 'Accidentals', definition: 'Sharps, flats, and naturals that alter pitch', tier: 3, category: 'symbols' },
  { term: 'Time signature 6/8', definition: '6 beats per measure, eighth note gets 1 beat', tier: 3, category: 'symbols' },
  // Tier 4 (6-8)
  { term: 'D.S. (Dal Segno)', definition: 'Go back to the special marked sign in the music', tier: 4, category: 'symbols' },
  { term: 'Coda', definition: 'A concluding passage that ends the piece', tier: 4, category: 'symbols' },
  { term: 'Double bar line', definition: 'Marks the end of a section or piece', tier: 4, category: 'symbols' },
  { term: 'Tie vs Slur', definition: 'One connects same pitches to extend duration; the other connects different pitches smoothly', tier: 4, category: 'symbols' },
  { term: 'Triplet', definition: 'Three notes in the space of two', tier: 4, category: 'symbols' },
  { term: 'Bass clef', definition: 'Marks the lower-pitched staff', symbol: '\u{1D122}', tier: 4, category: 'symbols' },
  { term: 'Key signature', definition: 'Sharps or flats at the beginning of a staff', tier: 3, category: 'symbols' },
  { term: 'Time signature 12/8', definition: '4 beats per measure, dotted quarter note gets 1 beat', tier: 4, category: 'symbols' },
  { term: 'Time signature 3/8', definition: '1 beat per measure, dotted quarter note gets 1 beat', tier: 4, category: 'symbols' },
  // Tier 5 (HS)
  { term: 'Trill', definition: 'Rapid alternation between two adjacent notes', symbol: 'tr', tier: 5, category: 'symbols' },
  { term: 'Mordent', definition: 'Quick alternation with the note below', tier: 5, category: 'symbols' },
  { term: 'Turn', definition: 'Ornamental figure: note above, main, note below, main', tier: 5, category: 'symbols' },
  { term: 'Grace note', definition: 'A quick ornamental note before the main note', tier: 5, category: 'symbols' },
  { term: '8va', definition: 'Play one octave higher', tier: 5, category: 'symbols' },
  { term: '8vb', definition: 'Play one octave lower', tier: 5, category: 'symbols' },
  { term: 'Tremolo', definition: 'Rapid repetition of a note or alternation between two notes', tier: 5, category: 'symbols' },
  { term: 'Accent', definition: 'Emphasis on a note', symbol: '>', tier: 4, category: 'symbols' },
  { term: 'Marcato', definition: 'Strongly accented note', symbol: '^', tier: 4, category: 'symbols' },
];

const TERMS_ENTRIES: VocabEntry[] = [
  // Tier 1 (K-1): simple English
  { term: 'Melody', definition: 'A sequence of notes that make a tune', tier: 1, category: 'terms' },
  { term: 'Rhythm', definition: 'The pattern of long and short sounds', tier: 1, category: 'terms' },
  { term: 'Beat', definition: 'The steady pulse in music', tier: 1, category: 'terms' },
  { term: 'Steady beat', definition: 'An even, regular pulse that stays the same speed', tier: 1, category: 'terms' },
  { term: 'High', definition: 'A thin, bright sound like a piccolo or whistle', tier: 1, category: 'terms' },
  { term: 'Low', definition: 'A deep, rumbling sound like a tuba or bass drum', tier: 1, category: 'terms' },
  { term: 'Song', definition: 'A piece of music with words', tier: 1, category: 'terms' },
  { term: 'Singer', definition: 'A person who uses their voice to make music', tier: 1, category: 'terms' },
  { term: 'Instrument', definition: 'An object used to make music', tier: 1, category: 'terms' },
  // Tier 2 (2-3)
  { term: 'Unison', definition: 'Everyone singing or playing the same notes', tier: 2, category: 'terms' },
  { term: 'Round', definition: 'A song where groups start at different times singing the same melody', tier: 2, category: 'terms' },
  { term: 'Ostinato', definition: 'A repeated musical pattern', tier: 2, category: 'terms' },
  { term: 'Solo', definition: 'One person performing alone', tier: 2, category: 'terms' },
  { term: 'Duet', definition: 'Two people performing together', tier: 2, category: 'terms' },
  { term: 'Chord', definition: 'Three or more notes played at the same time', tier: 2, category: 'terms' },
  { term: 'Harmony', definition: 'Two or more notes sounding together', tier: 2, category: 'terms' },
  { term: 'Ensemble', definition: 'A group of musicians performing together', tier: 2, category: 'terms' },
  { term: 'AB form', definition: 'A musical structure with two contrasting sections', tier: 2, category: 'terms' },
  { term: 'ABA form', definition: 'A musical structure: first section, contrasting section, return to first', tier: 2, category: 'terms' },
  { term: 'Form', definition: 'The overall structure or organization of a piece of music', tier: 2, category: 'terms' },
  { term: 'Texture', definition: 'How many layers of sound are heard at once (thick or thin)', tier: 2, category: 'terms' },
  { term: 'One Sound Alone (Monophonic)', definition: 'Music with a single melody line', tier: 2, category: 'terms' },
  { term: 'Many Sounds Together (Polyphonic)', definition: 'Music with multiple independent melodies at once', tier: 2, category: 'terms' },
  { term: 'Staccato', definition: 'Notes played short and detached', tier: 2, category: 'terms' },
  { term: 'Legato', definition: 'Notes played smooth and connected', tier: 2, category: 'terms' },
  { term: 'Phrase', definition: 'A musical thought, like a sentence in music', tier: 2, category: 'terms' },
  // Tier 3 (4-5)
  { term: 'Pentatonic scale', definition: 'A five-note scale', tier: 3, category: 'terms' },
  { term: 'Syncopation', definition: 'Emphasis on unexpected beats', tier: 3, category: 'terms' },
  { term: 'Arpeggio', definition: 'Notes of a chord played one after another', tier: 3, category: 'terms' },
  { term: 'Call and response', definition: 'One group performs, another answers', tier: 3, category: 'terms' },
  { term: 'Rondo', definition: 'A form where the main theme keeps returning (ABACA)', tier: 3, category: 'terms' },
  { term: 'Theme and variations', definition: 'A melody that is changed in different ways', tier: 3, category: 'terms' },
  { term: 'Timbre', definition: 'The unique quality or color of a sound', tier: 3, category: 'terms' },
  // Tier 4 (6-8)
  { term: 'Da Capo (D.C.)', definition: 'Go back to the beginning', tier: 4, category: 'terms' },
  { term: 'Fine', definition: 'The end of the piece', tier: 4, category: 'terms' },
  { term: 'D.S. al Coda', definition: 'Go to the sign, play to the coda mark, then jump to coda', tier: 4, category: 'terms' },
  { term: 'Monophonic', definition: 'Music with a single melodic line, no harmony', tier: 4, category: 'terms' },
  { term: 'Homophonic', definition: 'Melody with accompanying harmony', tier: 4, category: 'terms' },
  { term: 'Polyphonic', definition: 'Multiple independent melodic lines at once', tier: 4, category: 'terms' },
  { term: 'Pizzicato', definition: 'Plucking strings instead of using a bow', tier: 4, category: 'terms' },
  { term: 'Glissando', definition: 'Sliding between two notes', tier: 4, category: 'terms' },
  // Tier 5 (HS)
  { term: 'Con brio', definition: 'With vigor and spirit', tier: 5, category: 'terms' },
  { term: 'Cantabile', definition: 'In a singing style', tier: 5, category: 'terms' },
  { term: 'Dolce', definition: 'Sweetly and softly', tier: 5, category: 'terms' },
  { term: 'Espressivo', definition: 'With expression', tier: 5, category: 'terms' },
  { term: 'Maestoso', definition: 'Majestically', tier: 5, category: 'terms' },
  { term: 'Sotto voce', definition: 'In a soft, quiet voice', tier: 5, category: 'terms' },
  { term: 'Tutti', definition: 'All performers play together', tier: 5, category: 'terms' },
  { term: 'Arrangement', definition: 'A new version of an existing piece for different instruments or voices', tier: 5, category: 'terms' },
];

const ALL_ENTRIES: VocabEntry[] = [
  ...DYNAMICS_ENTRIES,
  ...TEMPO_ENTRIES,
  ...SYMBOLS_ENTRIES,
  ...TERMS_ENTRIES,
];

/** Get all vocab entries for a given category up to (and including) the specified tier. */
export function getVocabEntries(category: VocabCategory, tier: Tier): VocabEntry[] {
  return ALL_ENTRIES.filter((e) => e.category === category && e.tier <= tier);
}

/** Get all vocab entries across all categories (used for generating distractors). */
export function getAllVocabEntries(): VocabEntry[] {
  return ALL_ENTRIES;
}
