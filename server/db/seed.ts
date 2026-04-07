import 'dotenv/config';
import { db } from './index';
import { users, questionPools, poolVocabEntries } from './schema';
import { eq } from 'drizzle-orm';

const SYSTEM_USER_USERNAME = 'system';
const SYSTEM_POOL_CODE = 'SYSTEM_DEFAULTS';

interface VocabEntryInput {
  term: string;
  definition: string;
  symbol?: string;
  tier: number;
  category: string;
  format?: string;
}

const DEFAULT_VOCAB_ENTRIES: VocabEntryInput[] = [
  // Dynamics - Tier 1
  { term: 'f', definition: 'Loud', tier: 1, category: 'dynamics', format: 'opposites' },
  { term: 'p', definition: 'Soft', tier: 1, category: 'dynamics', format: 'opposites' },
  // Dynamics - Tier 2
  { term: 'piano', definition: 'Soft', symbol: '𝆏', tier: 2, category: 'dynamics' },
  { term: 'forte', definition: 'Loud', symbol: '𝆑', tier: 2, category: 'dynamics' },
  { term: 'mf', definition: 'Moderately loud', tier: 2, category: 'dynamics' },
  { term: 'mp', definition: 'Moderately soft', tier: 2, category: 'dynamics' },
  { term: 'Crescendo', definition: 'Gradually getting louder', symbol: 'cresc.', tier: 2, category: 'dynamics' },
  { term: 'Decrescendo', definition: 'Gradually getting softer', symbol: 'decresc.', tier: 2, category: 'dynamics' },
  // Dynamics - Tier 3
  { term: 'pp', definition: 'Very soft', tier: 3, category: 'dynamics' },
  { term: 'ff', definition: 'Very loud', tier: 3, category: 'dynamics' },
  { term: 'sfz', definition: 'Sudden strong accent', tier: 3, category: 'dynamics' },
  { term: 'fp', definition: 'Loud then immediately soft', tier: 3, category: 'dynamics' },
  { term: 'Softest to loudest: pp, p, mp, mf, f, ff', definition: 'The standard dynamic ordering from softest to loudest', tier: 3, category: 'dynamics', format: 'ordering' },
  // Dynamics - Tier 4
  { term: 'Diminuendo', definition: 'Gradually getting softer', symbol: 'dim.', tier: 4, category: 'dynamics' },
  { term: 'Morendo', definition: 'Dying away in volume and tempo', tier: 4, category: 'dynamics' },
  { term: 'Fortissimo', definition: 'Very loud', tier: 4, category: 'dynamics' },
  // Dynamics - Tier 5
  { term: 'Diminuendo vs Decrescendo', definition: 'Two Italian terms for gradually getting softer; used interchangeably', tier: 5, category: 'dynamics' },
  { term: 'fp vs sfz', definition: 'One starts loud then gets quiet; the other is a sudden accent', tier: 5, category: 'dynamics' },
  { term: 'ppp', definition: 'Extremely soft', tier: 5, category: 'dynamics' },
  { term: 'fff', definition: 'Extremely loud', tier: 5, category: 'dynamics' },

  // Tempo - Tier 1
  { term: 'Allegro', definition: 'Fast', tier: 1, category: 'tempo', format: 'opposites' },
  { term: 'Adagio', definition: 'Slow', tier: 1, category: 'tempo', format: 'opposites' },
  // Tempo - Tier 2
  { term: 'Andante', definition: 'Walking pace', tier: 2, category: 'tempo' },
  { term: 'Moderato', definition: 'Moderate speed', tier: 2, category: 'tempo' },
  { term: 'Ritardando', definition: 'Gradually slowing down', tier: 2, category: 'tempo' },
  { term: 'Accelerando', definition: 'Gradually speeding up', tier: 2, category: 'tempo' },
  // Tempo - Tier 3
  { term: 'Presto', definition: 'Very fast', tier: 3, category: 'tempo' },
  { term: 'Largo', definition: 'Very slow', tier: 3, category: 'tempo' },
  { term: 'Vivace', definition: 'Lively and fast', tier: 3, category: 'tempo' },
  { term: 'Allegretto', definition: 'Moderately fast', tier: 3, category: 'tempo' },
  { term: 'Slowest to fastest: Largo, Adagio, Andante, Moderato, Allegretto, Allegro, Vivace, Presto', definition: 'The standard tempo ordering from slowest to fastest', tier: 3, category: 'tempo', format: 'ordering' },
  // Tempo - Tier 4
  { term: 'Grave', definition: 'Very slow and solemn', tier: 4, category: 'tempo' },
  { term: 'Lento', definition: 'Slow', tier: 4, category: 'tempo' },
  { term: 'Prestissimo', definition: 'Extremely fast', tier: 4, category: 'tempo' },
  { term: 'Tempo primo', definition: 'Return to the original tempo', tier: 4, category: 'tempo' },
  { term: 'A tempo', definition: 'Return to the previous tempo', tier: 4, category: 'tempo' },
  // Tempo - Tier 5
  { term: 'Rubato', definition: 'Flexible tempo, speeding up and slowing down expressively', tier: 5, category: 'tempo' },
  { term: 'Alla breve', definition: 'Cut time (2/2)', tier: 5, category: 'tempo' },
  { term: 'Tempo giusto', definition: 'In strict time', tier: 5, category: 'tempo' },
  { term: "L'istesso tempo", definition: 'The same tempo (when meter changes)', tier: 5, category: 'tempo' },

  // Symbols - Tier 1
  { term: 'Quarter note', definition: 'Gets 1 beat', symbol: '\u{1D1A9}', tier: 1, category: 'symbols' },
  { term: 'Half note', definition: 'Gets 2 beats', symbol: '\u{1D15E}', tier: 1, category: 'symbols' },
  { term: 'Whole note', definition: 'Gets 4 beats', symbol: '\u{1D15D}', tier: 1, category: 'symbols' },
  { term: 'Quarter rest', definition: '1 beat of silence', symbol: '\u{1D13D}', tier: 1, category: 'symbols' },
  { term: 'Treble clef', definition: 'Marks the higher-pitched staff', symbol: '\u{1D11E}', tier: 1, category: 'symbols' },
  // Symbols - Tier 2
  { term: 'Half rest', definition: '2 beats of silence', tier: 2, category: 'symbols' },
  { term: 'Whole rest', definition: '4 beats of silence (or a full measure)', tier: 2, category: 'symbols' },
  { term: 'Tied note', definition: 'Two notes connected to combine their durations', tier: 2, category: 'symbols' },
  { term: 'Dotted half note', definition: 'Gets 3 beats', tier: 2, category: 'symbols' },
  { term: 'Beamed eighth notes', definition: 'Two eighth notes connected by a beam', symbol: '\u{266B}', tier: 2, category: 'symbols' },
  { term: 'Time signature 4/4', definition: '4 beats per measure, quarter note gets 1 beat', tier: 2, category: 'symbols' },
  { term: 'Time signature 3/4', definition: '3 beats per measure, quarter note gets 1 beat', tier: 2, category: 'symbols' },
  // Symbols - Tier 3
  { term: 'Sharp', definition: 'Raises a note by a half step', symbol: '\u{266F}', tier: 3, category: 'symbols' },
  { term: 'Flat', definition: 'Lowers a note by a half step', symbol: '\u{266D}', tier: 3, category: 'symbols' },
  { term: 'Natural', definition: 'Cancels a sharp or flat', symbol: '\u{266E}', tier: 3, category: 'symbols' },
  { term: 'Fermata', definition: 'Hold the note longer than its value', symbol: '\u{1D110}', tier: 3, category: 'symbols' },
  { term: 'Repeat sign', definition: 'Go back and play the section again', tier: 3, category: 'symbols' },
  { term: 'Dotted quarter note', definition: 'Gets 1.5 beats', tier: 3, category: 'symbols' },
  { term: 'Accidentals', definition: 'Sharps, flats, and naturals that alter pitch', tier: 3, category: 'symbols' },
  { term: 'Time signature 6/8', definition: '6 beats per measure, eighth note gets 1 beat', tier: 3, category: 'symbols' },
  // Symbols - Tier 4
  { term: 'D.S. (Dal Segno)', definition: 'Go back to the special marked sign in the music', tier: 4, category: 'symbols' },
  { term: 'Coda', definition: 'A concluding passage that ends the piece', tier: 4, category: 'symbols' },
  { term: 'Double bar line', definition: 'Marks the end of a section or piece', tier: 4, category: 'symbols' },
  { term: 'Tie vs Slur', definition: 'One connects same pitches to extend duration; the other connects different pitches smoothly', tier: 4, category: 'symbols' },
  { term: 'Triplet', definition: 'Three notes in the space of two', tier: 4, category: 'symbols' },
  { term: 'Bass clef', definition: 'Marks the lower-pitched staff', symbol: '\u{1D122}', tier: 4, category: 'symbols' },
  { term: 'Key signature', definition: 'Sharps or flats at the beginning of a staff', tier: 4, category: 'symbols' },
  // Symbols - Tier 5
  { term: 'Trill', definition: 'Rapid alternation between two adjacent notes', symbol: 'tr', tier: 5, category: 'symbols' },
  { term: 'Mordent', definition: 'Quick alternation with the note below', tier: 5, category: 'symbols' },
  { term: 'Turn', definition: 'Ornamental figure: note above, main, note below, main', tier: 5, category: 'symbols' },
  { term: 'Grace note', definition: 'A quick ornamental note before the main note', tier: 5, category: 'symbols' },
  { term: '8va', definition: 'Play one octave higher', tier: 5, category: 'symbols' },
  { term: '8vb', definition: 'Play one octave lower', tier: 5, category: 'symbols' },
  { term: 'Tremolo', definition: 'Rapid repetition of a note or alternation between two notes', tier: 5, category: 'symbols' },

  // Terms - Tier 1
  { term: 'Melody', definition: 'A sequence of notes that make a tune', tier: 1, category: 'terms' },
  { term: 'Rhythm', definition: 'The pattern of long and short sounds', tier: 1, category: 'terms' },
  { term: 'Beat', definition: 'The steady pulse in music', tier: 1, category: 'terms' },
  { term: 'High', definition: 'A thin, bright sound like a piccolo or whistle', tier: 1, category: 'terms' },
  { term: 'Low', definition: 'A deep, rumbling sound like a tuba or bass drum', tier: 1, category: 'terms' },
  { term: 'Song', definition: 'A piece of music with words', tier: 1, category: 'terms' },
  { term: 'Singer', definition: 'A person who uses their voice to make music', tier: 1, category: 'terms' },
  { term: 'Instrument', definition: 'An object used to make music', tier: 1, category: 'terms' },
  // Terms - Tier 2
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
  // Terms - Tier 3
  { term: 'Staccato', definition: 'Notes played short and detached', tier: 3, category: 'terms' },
  { term: 'Legato', definition: 'Notes played smooth and connected', tier: 3, category: 'terms' },
  { term: 'Pentatonic scale', definition: 'A five-note scale', tier: 3, category: 'terms' },
  { term: 'Syncopation', definition: 'Emphasis on unexpected beats', tier: 3, category: 'terms' },
  { term: 'Arpeggio', definition: 'Notes of a chord played one after another', tier: 3, category: 'terms' },
  { term: 'Call and response', definition: 'One group performs, another answers', tier: 3, category: 'terms' },
  { term: 'Rondo', definition: 'A form where the main theme keeps returning (ABACA)', tier: 3, category: 'terms' },
  { term: 'Theme and variations', definition: 'A melody that is changed in different ways', tier: 3, category: 'terms' },
  { term: 'Timbre', definition: 'The unique quality or color of a sound', tier: 3, category: 'terms' },
  // Terms - Tier 4
  { term: 'Da Capo (D.C.)', definition: 'Go back to the beginning', tier: 4, category: 'terms' },
  { term: 'Fine', definition: 'The end of the piece', tier: 4, category: 'terms' },
  { term: 'D.S. al Coda', definition: 'Go to the sign, play to the coda mark, then jump to coda', tier: 4, category: 'terms' },
  { term: 'Monophonic', definition: 'Music with a single melodic line, no harmony', tier: 4, category: 'terms' },
  { term: 'Homophonic', definition: 'Melody with accompanying harmony', tier: 4, category: 'terms' },
  { term: 'Polyphonic', definition: 'Multiple independent melodic lines at once', tier: 4, category: 'terms' },
  { term: 'Pizzicato', definition: 'Plucking strings instead of using a bow', tier: 4, category: 'terms' },
  { term: 'Glissando', definition: 'Sliding between two notes', tier: 4, category: 'terms' },
  // Terms - Tier 5
  { term: 'Con brio', definition: 'With vigor and spirit', tier: 5, category: 'terms' },
  { term: 'Cantabile', definition: 'In a singing style', tier: 5, category: 'terms' },
  { term: 'Dolce', definition: 'Sweetly and softly', tier: 5, category: 'terms' },
  { term: 'Espressivo', definition: 'With expression', tier: 5, category: 'terms' },
  { term: 'Maestoso', definition: 'Majestically', tier: 5, category: 'terms' },
  { term: 'Sotto voce', definition: 'In a soft, quiet voice', tier: 5, category: 'terms' },
  { term: 'Tutti', definition: 'All performers play together', tier: 5, category: 'terms' },
  { term: 'Arrangement', definition: 'A new version of an existing piece for different instruments or voices', tier: 5, category: 'terms' },
] as const;

async function seed() {
  console.log('Seeding system defaults...');

  if (!db) {
    console.error('Database not configured. Set DATABASE_URL environment variable.');
    process.exit(1);
  }

  let systemUser = await db.query.users.findFirst({
    where: eq(users.username, SYSTEM_USER_USERNAME),
  });

  if (!systemUser) {
    console.log('Creating system user...');
    const [inserted] = await db.insert(users).values({
      username: SYSTEM_USER_USERNAME,
      passwordHash: 'SYSTEM_ACCOUNT_NO_LOGIN',
      role: 'system',
      displayName: 'System',
    }).returning();
    systemUser = inserted;
  }

  let systemPool = await db.query.questionPools.findFirst({
    where: eq(questionPools.gameCode, SYSTEM_POOL_CODE),
  });

  if (!systemPool) {
    console.log('Creating system pool...');
    const [inserted] = await db.insert(questionPools).values({
      teacherId: systemUser!.id,
      name: 'Default Music Vocabulary',
      gameCode: SYSTEM_POOL_CODE,
      isShared: true,
      useDefaults: false,
    }).returning();
    systemPool = inserted;
  }

  const existingEntries = await db.query.poolVocabEntries.findMany({
    where: eq(poolVocabEntries.poolId, systemPool!.id),
  });

  if (existingEntries.length > 0) {
    console.log(`System pool already has ${existingEntries.length} entries. Skipping seed.`);
    return;
  }

  console.log(`Inserting ${DEFAULT_VOCAB_ENTRIES.length} vocab entries...`);
  
  await db.insert(poolVocabEntries).values(
    DEFAULT_VOCAB_ENTRIES.map((entry) => ({
      poolId: systemPool!.id,
      term: entry.term,
      definition: entry.definition,
      symbol: entry.symbol ?? null,
      tier: entry.tier,
      category: entry.category,
      format: entry.format ?? null,
    }))
  );

  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
