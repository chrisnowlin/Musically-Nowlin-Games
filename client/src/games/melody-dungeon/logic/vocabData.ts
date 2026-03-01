import type { Tier } from './dungeonTypes';

export type VocabCategory = 'dynamics' | 'tempo' | 'symbols' | 'terms';

export interface VocabEntry {
  term: string;
  definition: string;
  symbol?: string;
  tier: Tier;
  category: VocabCategory;
}

const DYNAMICS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'p', definition: 'Soft', symbol: '𝆏', tier: 1, category: 'dynamics' },
  { term: 'f', definition: 'Loud', symbol: '𝆑', tier: 1, category: 'dynamics' },
  { term: 'mf', definition: 'Moderately loud', symbol: 'mf', tier: 1, category: 'dynamics' },
  { term: 'mp', definition: 'Moderately soft', symbol: 'mp', tier: 1, category: 'dynamics' },
  // Tier 2
  { term: 'pp', definition: 'Very soft', symbol: 'pp', tier: 2, category: 'dynamics' },
  { term: 'ff', definition: 'Very loud', symbol: 'ff', tier: 2, category: 'dynamics' },
  { term: 'sfz', definition: 'Sudden strong accent', symbol: 'sfz', tier: 2, category: 'dynamics' },
  { term: 'fp', definition: 'Loud then immediately soft', symbol: 'fp', tier: 2, category: 'dynamics' },
  // Tier 3
  { term: 'crescendo', definition: 'Gradually getting louder', symbol: 'cresc.', tier: 3, category: 'dynamics' },
  { term: 'decrescendo', definition: 'Gradually getting softer', symbol: 'decresc.', tier: 3, category: 'dynamics' },
  { term: 'diminuendo', definition: 'Gradually getting softer', symbol: 'dim.', tier: 3, category: 'dynamics' },
  { term: 'morendo', definition: 'Dying away', symbol: 'morendo', tier: 3, category: 'dynamics' },
];

const TEMPO_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Allegro', definition: 'Fast and lively', tier: 1, category: 'tempo' },
  { term: 'Adagio', definition: 'Slow and stately', tier: 1, category: 'tempo' },
  { term: 'Andante', definition: 'Walking pace', tier: 1, category: 'tempo' },
  { term: 'Moderato', definition: 'Moderate speed', tier: 1, category: 'tempo' },
  // Tier 2
  { term: 'Presto', definition: 'Very fast', tier: 2, category: 'tempo' },
  { term: 'Largo', definition: 'Very slow and broad', tier: 2, category: 'tempo' },
  { term: 'Vivace', definition: 'Lively and fast', tier: 2, category: 'tempo' },
  { term: 'Allegretto', definition: 'Moderately fast', tier: 2, category: 'tempo' },
  { term: 'ritardando', definition: 'Gradually slowing down', tier: 2, category: 'tempo' },
  { term: 'accelerando', definition: 'Gradually speeding up', tier: 2, category: 'tempo' },
  // Tier 3
  { term: 'Grave', definition: 'Very slow and solemn', tier: 3, category: 'tempo' },
  { term: 'Lento', definition: 'Slow', tier: 3, category: 'tempo' },
  { term: 'Prestissimo', definition: 'As fast as possible', tier: 3, category: 'tempo' },
  { term: 'tempo primo', definition: 'Return to the original tempo', tier: 3, category: 'tempo' },
  { term: 'a tempo', definition: 'Return to the previous tempo', tier: 3, category: 'tempo' },
  { term: 'rubato', definition: 'Flexible tempo for expression', tier: 3, category: 'tempo' },
];

const SYMBOLS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Fermata', definition: 'Hold the note longer than its value', symbol: '𝄐', tier: 1, category: 'symbols' },
  { term: 'Repeat sign', definition: 'Go back and play the section again', symbol: '𝄇', tier: 1, category: 'symbols' },
  { term: 'Whole rest', definition: 'Rest for a whole measure', symbol: '𝄻', tier: 1, category: 'symbols' },
  { term: 'Half rest', definition: 'Rest for two beats', symbol: '𝄼', tier: 1, category: 'symbols' },
  { term: 'Quarter rest', definition: 'Rest for one beat', symbol: '𝄽', tier: 1, category: 'symbols' },
  { term: 'Sharp', definition: 'Raise the pitch by a half step', symbol: '♯', tier: 1, category: 'symbols' },
  { term: 'Flat', definition: 'Lower the pitch by a half step', symbol: '♭', tier: 1, category: 'symbols' },
  // Tier 2
  { term: 'Natural', definition: 'Cancel a sharp or flat', symbol: '♮', tier: 2, category: 'symbols' },
  { term: 'Double bar line', definition: 'Marks the end of a section', symbol: '𝄁', tier: 2, category: 'symbols' },
  { term: 'Dal Segno', definition: 'Go back to the segno sign', symbol: 'D.S.', tier: 2, category: 'symbols' },
  { term: 'Coda', definition: 'Jump to the ending section', symbol: '𝄌', tier: 2, category: 'symbols' },
  { term: 'Tie', definition: 'Connect two notes of the same pitch', tier: 2, category: 'symbols' },
  { term: 'Slur', definition: 'Play notes smoothly connected', tier: 2, category: 'symbols' },
  { term: 'Dotted note', definition: 'Adds half the note\'s value', tier: 2, category: 'symbols' },
  // Tier 3
  { term: 'Trill', definition: 'Rapidly alternate between two adjacent notes', symbol: 'tr', tier: 3, category: 'symbols' },
  { term: 'Mordent', definition: 'Quick alternation with the note below', tier: 3, category: 'symbols' },
  { term: 'Turn', definition: 'Ornament playing notes above and below', symbol: '~', tier: 3, category: 'symbols' },
  { term: 'Grace note', definition: 'A quick ornamental note before the main note', tier: 3, category: 'symbols' },
  { term: '8va', definition: 'Play one octave higher', symbol: '8va', tier: 3, category: 'symbols' },
  { term: '8vb', definition: 'Play one octave lower', symbol: '8vb', tier: 3, category: 'symbols' },
  { term: 'Tremolo', definition: 'Rapid repetition of a note', tier: 3, category: 'symbols' },
];

const TERMS_ENTRIES: VocabEntry[] = [
  // Tier 1
  { term: 'Staccato', definition: 'Play notes short and detached', tier: 1, category: 'terms' },
  { term: 'Legato', definition: 'Play notes smooth and connected', tier: 1, category: 'terms' },
  { term: 'Solo', definition: 'A piece or passage for one performer', tier: 1, category: 'terms' },
  { term: 'Duet', definition: 'A piece for two performers', tier: 1, category: 'terms' },
  { term: 'Chord', definition: 'Three or more notes played together', tier: 1, category: 'terms' },
  { term: 'Melody', definition: 'A sequence of single notes forming a tune', tier: 1, category: 'terms' },
  { term: 'Harmony', definition: 'Notes combined to support the melody', tier: 1, category: 'terms' },
  // Tier 2
  { term: 'Da Capo', definition: 'Go back to the beginning', symbol: 'D.C.', tier: 2, category: 'terms' },
  { term: 'Dal Segno', definition: 'Go back to the sign', symbol: 'D.S.', tier: 2, category: 'terms' },
  { term: 'Fine', definition: 'The end of the piece', tier: 2, category: 'terms' },
  { term: 'Ostinato', definition: 'A repeated musical pattern', tier: 2, category: 'terms' },
  { term: 'Arpeggio', definition: 'A broken chord played one note at a time', tier: 2, category: 'terms' },
  { term: 'Glissando', definition: 'A slide between two notes', tier: 2, category: 'terms' },
  { term: 'Pizzicato', definition: 'Pluck the strings instead of bowing', tier: 2, category: 'terms' },
  // Tier 3
  { term: 'Con brio', definition: 'With spirit and vigor', tier: 3, category: 'terms' },
  { term: 'Cantabile', definition: 'In a singing style', tier: 3, category: 'terms' },
  { term: 'Dolce', definition: 'Sweetly and softly', tier: 3, category: 'terms' },
  { term: 'Espressivo', definition: 'With expression', tier: 3, category: 'terms' },
  { term: 'Maestoso', definition: 'Majestic and stately', tier: 3, category: 'terms' },
  { term: 'Sotto voce', definition: 'In a soft, quiet voice', tier: 3, category: 'terms' },
  { term: 'Tutti', definition: 'All performers play together', tier: 3, category: 'terms' },
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
