/**
 * Corrective feedback explanations for all challenge types.
 *
 * System 4: When a student answers incorrectly, show *why* the correct answer
 * is correct — with a short explanation and optional mnemonic.
 */

// ── Vocab Explanations ──────────────────────────────────────
// Keyed by term (matches VocabEntry.term). Falls back to generic format if missing.

export interface VocabExplanation {
  explanation: string;
  mnemonic?: string;
}

/**
 * Hand-written explanations for vocab terms that benefit from mnemonics
 * or additional context beyond "X means Y".
 */
export const VOCAB_EXPLANATIONS: Record<string, VocabExplanation> = {
  // Dynamics
  'f': { explanation: 'f stands for forte, which means Loud.', mnemonic: 'Think of "force" — forceful = loud.' },
  'p': { explanation: 'p stands for piano, which means Soft.', mnemonic: 'Piano also means "softly" in Italian.' },
  'piano': { explanation: 'Piano means Soft in Italian.', mnemonic: 'The instrument piano was originally called "pianoforte" — soft-loud.' },
  'forte': { explanation: 'Forte means Loud in Italian.', mnemonic: '"Forte" sounds like "fort" — strong and powerful.' },
  'mf': { explanation: 'mf means mezzo forte — moderately loud.', mnemonic: '"Mezzo" means middle — halfway to loud.' },
  'mp': { explanation: 'mp means mezzo piano — moderately soft.', mnemonic: '"Mezzo" means middle — halfway to soft.' },
  'Crescendo': { explanation: 'Crescendo means gradually getting louder.', mnemonic: 'Think of a crescent moon — it grows bigger!' },
  'Decrescendo': { explanation: 'Decrescendo means gradually getting softer.', mnemonic: 'De- means "away from" — moving away from loud.' },
  'pp': { explanation: 'pp means pianissimo — very soft.', mnemonic: 'Double p = double soft! The more letters, the more extreme.' },
  'ff': { explanation: 'ff means fortissimo — very loud.', mnemonic: 'Double f = double loud!' },
  'sfz': { explanation: 'sfz means sforzando — a sudden strong accent.', mnemonic: 'Think of a sudden "SFX" sound effect!' },
  'fp': { explanation: 'fp means forte-piano — loud then immediately soft.', mnemonic: 'f then p: start loud, drop to soft instantly.' },
  'ppp': { explanation: 'ppp means pianississimo — extremely soft.', mnemonic: 'Three p\'s = whisper quiet!' },
  'fff': { explanation: 'fff means fortississimo — extremely loud.', mnemonic: 'Three f\'s = as loud as possible!' },
  'Diminuendo': { explanation: 'Diminuendo means gradually getting softer.', mnemonic: '"Diminish" means to get smaller.' },
  'Morendo': { explanation: 'Morendo means dying away in volume and tempo.', mnemonic: '"Morendo" is related to the word "morte" (death) — the music dies away.' },
  'Fortissimo': { explanation: 'Fortissimo means very loud (same as ff).', mnemonic: 'The "-issimo" suffix means "very much" in Italian.' },
  // Tempo
  'Allegro': { explanation: 'Allegro means Fast.', mnemonic: 'Think of an "allegator" — they move fast!' },
  'Adagio': { explanation: 'Adagio means Slow.', mnemonic: '"A day goes" slowly when you\'re bored.' },
  'Andante': { explanation: 'Andante means walking pace.', mnemonic: 'Think of "ambling" or "wandering" — a relaxed walk.' },
  'Moderato': { explanation: 'Moderato means moderate speed.', mnemonic: 'Like "moderate" in English — right in the middle.' },
  'Ritardando': { explanation: 'Ritardando means gradually slowing down.', mnemonic: 'Often shortened to "rit." — like hitting the brakes gently.' },
  'Accelerando': { explanation: 'Accelerando means gradually speeding up.', mnemonic: 'Like "accelerate" in a car — pressing the gas!' },
  'Presto': { explanation: 'Presto means very fast.', mnemonic: '"Presto!" — like a magician doing something instantly.' },
  'Largo': { explanation: 'Largo means very slow.', mnemonic: '"Large" things move slowly and heavily.' },
  'Vivace': { explanation: 'Vivace means lively and fast.', mnemonic: '"Vivacious" means full of life — lively!' },
  'Rubato': { explanation: 'Rubato means flexible tempo — speeding up and slowing down expressively.', mnemonic: '"Rubato" literally means "stolen time" in Italian.' },
  // Symbols
  'Quarter note': { explanation: 'A quarter note gets 1 beat in 4/4 time.', mnemonic: 'There are 4 quarter notes in a measure — each is 1/4.' },
  'Half note': { explanation: 'A half note gets 2 beats.', mnemonic: 'Two halves make a whole — a half note is half of 4 beats.' },
  'Whole note': { explanation: 'A whole note gets 4 beats — a whole measure in 4/4.', mnemonic: 'The "whole" measure belongs to this one note.' },
  'Quarter rest': { explanation: 'A quarter rest is 1 beat of silence.', mnemonic: 'Same duration as a quarter note, but you stay quiet.' },
  'Treble clef': { explanation: 'The treble clef marks the higher-pitched staff.', mnemonic: 'Treble sounds like "trouble" — higher voices cause trouble!' },
  'Sharp': { explanation: 'A sharp raises a note by a half step.', mnemonic: 'A sharp edge points UP — the note goes up.' },
  'Flat': { explanation: 'A flat lowers a note by a half step.', mnemonic: 'A flat tire goes DOWN — the note goes down.' },
  'Natural': { explanation: 'A natural cancels a sharp or flat.', mnemonic: 'It returns the note to its "natural" state.' },
  'Fermata': { explanation: 'A fermata means hold the note longer than its written value.', mnemonic: 'It looks like a bird\'s eye — the bird pauses to look around.' },
  'Triplet': { explanation: 'A triplet fits 3 notes in the space of 2.', mnemonic: '"Tri" means three — three evenly-spaced notes.' },
  // Terms
  'Melody': { explanation: 'A melody is a sequence of notes that make a tune.', mnemonic: 'It\'s the part you sing along to!' },
  'Rhythm': { explanation: 'Rhythm is the pattern of long and short sounds.', mnemonic: 'Think of clapping — the pattern of claps is the rhythm.' },
  'Beat': { explanation: 'The beat is the steady pulse in music.', mnemonic: 'Like your heartbeat — steady and constant.' },
  'Staccato': { explanation: 'Staccato means notes played short and detached.', mnemonic: '"Staccato" sounds sharp and quick — just like the notes!' },
  'Legato': { explanation: 'Legato means notes played smooth and connected.', mnemonic: '"Leg" sounds smooth — legato flows like silk.' },
  'Syncopation': { explanation: 'Syncopation puts emphasis on unexpected beats.', mnemonic: 'The rhythm surprises you — the accent is "off" the beat.' },
  'Timbre': { explanation: 'Timbre is the unique quality or color of a sound.', mnemonic: 'A violin and piano can play the same note but sound different — that difference is timbre.' },
  'Pentatonic scale': { explanation: 'A pentatonic scale uses five notes.', mnemonic: '"Penta" means five — like a pentagon has five sides.' },
  'Unison': { explanation: 'Unison means everyone singing or playing the same notes.', mnemonic: '"Uni" means one — everyone as one voice.' },
  'Solo': { explanation: 'Solo means one person performing alone.', mnemonic: 'Like Han Solo — he works alone.' },
  'Da Capo (D.C.)': { explanation: 'Da Capo means go back to the beginning.', mnemonic: '"Da Capo" is Italian for "from the head" — start from the top!' },
  'Fine': { explanation: 'Fine marks the end of the piece.', mnemonic: 'Pronounced "FEE-nay" — it\'s the finish line.' },
};

// ── Note Reading Explanations ───────────────────────────────

const TREBLE_LINE_MNEMONIC = 'Every Good Boy Does Fine (lines: E, G, B, D, F)';
const TREBLE_SPACE_MNEMONIC = 'F-A-C-E spells FACE (spaces from bottom up)';
const BASS_LINE_MNEMONIC = 'Good Boys Do Fine Always (lines: G, B, D, F, A)';
const BASS_SPACE_MNEMONIC = 'All Cows Eat Grass (spaces: A, C, E, G)';

const TREBLE_LINES = new Set(['E4', 'G4', 'B4', 'D5', 'F5']);
const TREBLE_SPACES = new Set(['F4', 'A4', 'C5', 'E5']);
const BASS_LINES = new Set(['G2', 'B2', 'D3', 'F3', 'A3']);
const BASS_SPACES = new Set(['A2', 'C3', 'E3', 'G3']);

export function getNoteExplanation(noteKey: string, noteName: string, clef: 'treble' | 'bass'): { explanation: string; mnemonic: string } {
  if (clef === 'treble') {
    if (TREBLE_LINES.has(noteKey)) {
      return {
        explanation: `${noteName} sits on a line of the treble clef staff.`,
        mnemonic: TREBLE_LINE_MNEMONIC,
      };
    }
    if (TREBLE_SPACES.has(noteKey)) {
      return {
        explanation: `${noteName} sits in a space of the treble clef staff.`,
        mnemonic: TREBLE_SPACE_MNEMONIC,
      };
    }
    return {
      explanation: `${noteName} is a ledger-line note above or below the treble staff.`,
      mnemonic: 'Ledger lines extend the staff. Count up or down from the nearest staff note.',
    };
  }
  // Bass clef
  if (BASS_LINES.has(noteKey)) {
    return {
      explanation: `${noteName} sits on a line of the bass clef staff.`,
      mnemonic: BASS_LINE_MNEMONIC,
    };
  }
  if (BASS_SPACES.has(noteKey)) {
    return {
      explanation: `${noteName} sits in a space of the bass clef staff.`,
      mnemonic: BASS_SPACE_MNEMONIC,
    };
  }
  return {
    explanation: `${noteName} is a ledger-line note above or below the bass staff.`,
    mnemonic: 'Ledger lines extend the staff. Count up or down from the nearest staff note.',
  };
}

// ── Interval Explanations ───────────────────────────────────

export function getIntervalExplanation(intervalName: string, mode: string): { explanation: string; mnemonic?: string } {
  if (mode === 'highLow') {
    switch (intervalName) {
      case 'Higher': return { explanation: 'The second note was higher in pitch than the first.' };
      case 'Lower': return { explanation: 'The second note was lower in pitch than the first.' };
      case 'Same': return { explanation: 'Both notes were the same pitch.' };
    }
  }
  if (mode === 'stepSkip') {
    switch (intervalName) {
      case 'Step': return { explanation: 'A step moves to the next neighboring note (like C to D).', mnemonic: 'Steps are small — adjacent letter names.' };
      case 'Skip': return { explanation: 'A skip jumps over one note (like C to E).', mnemonic: 'Skips are bigger — you skip a letter.' };
      case 'Same': return { explanation: 'Both notes were the same pitch — no movement.' };
    }
  }
  // Standard mode
  switch (intervalName) {
    case 'Unison': return { explanation: 'A unison is the same note repeated — distance of 1.', mnemonic: '"Uni" means one.' };
    case '2nd': return { explanation: 'A 2nd spans two letter names (like C to D).', mnemonic: 'Count: start note = 1, next = 2.' };
    case '3rd': return { explanation: 'A 3rd spans three letter names (like C to E).', mnemonic: 'Count: C(1), D(2), E(3) = a 3rd.' };
    case '4th': return { explanation: 'A 4th spans four letter names (like C to F).', mnemonic: 'The opening of "Here Comes the Bride" is a 4th.' };
    case '5th': return { explanation: 'A 5th spans five letter names (like C to G).', mnemonic: 'The opening of "Star Wars" is a 5th.' };
    case '6th': return { explanation: 'A 6th spans six letter names (like C to A).', mnemonic: 'The opening of "My Bonnie Lies Over the Ocean" is a 6th.' };
    case 'Octave': return { explanation: 'An octave spans eight letter names — the same note but higher/lower.', mnemonic: '"Oct" means eight, like octopus (8 legs).' };
  }
  return { explanation: `The interval was a ${intervalName}.` };
}

// ── Timbre Explanations ─────────────────────────────────────

export const TIMBRE_EXPLANATIONS: Record<string, { explanation: string; mnemonic?: string }> = {
  // T1 sound properties
  't1-high': { explanation: 'A high sound has a fast vibration frequency — it sounds bright and thin.' },
  't1-low': { explanation: 'A low sound has a slow vibration frequency — it sounds deep and rumbling.' },
  't1-fast': { explanation: 'A fast sound has rapid note changes — the rhythm moves quickly.' },
  't1-slow': { explanation: 'A slow sound has gradual note changes — the rhythm moves slowly.' },
  // T2 instrument families
  't2-strings': { explanation: 'The Strings family makes sound by vibrating strings — with a bow or plucking.', mnemonic: 'Think of a guitar or violin — they all have strings!' },
  't2-woodwinds': { explanation: 'The Woodwinds family makes sound by blowing air through or across a mouthpiece.', mnemonic: 'Originally made of wood, and you use wind (breath) to play.' },
  't2-brass': { explanation: 'The Brass family makes sound by buzzing lips into a metal mouthpiece.', mnemonic: 'They\'re shiny and made of brass metal!' },
  't2-percussion': { explanation: 'The Percussion family makes sound by being struck, shaken, or scraped.', mnemonic: 'If you hit it, shake it, or scrape it — it\'s percussion!' },
  // T3-T5 specific instruments
  't3-violin': { explanation: 'The violin is the smallest and highest-pitched string instrument.', mnemonic: 'It\'s held under the chin and played with a bow.' },
  't3-cello': { explanation: 'The cello is a large string instrument with a rich, warm tone.', mnemonic: 'It sits on the floor between the player\'s knees.' },
  't3-flute': { explanation: 'The flute is a high-pitched woodwind you play by blowing across a hole.', mnemonic: 'It\'s held sideways — the only common orchestral instrument played that way.' },
  't3-clarinet': { explanation: 'The clarinet is a woodwind with a single reed and a warm, mellow sound.', mnemonic: 'It looks like a dark cylinder with silver keys.' },
  't3-trumpet': { explanation: 'The trumpet is a bright, powerful brass instrument.', mnemonic: 'The highest-pitched common brass instrument.' },
  't3-french-horn': { explanation: 'The French horn has a round, mellow brass sound.', mnemonic: 'Its tubing is coiled in a big circle.' },
  't3-oboe': { explanation: 'The oboe is a woodwind with a double reed and a nasal, penetrating sound.', mnemonic: 'The orchestra tunes to the oboe\'s A.' },
  't3-bassoon': { explanation: 'The bassoon is a large double-reed woodwind with a deep, rich tone.', mnemonic: 'It looks like a tall stick and sounds like a cartoon character.' },
};

// ── Rhythm Explanations ─────────────────────────────────────

export function getRhythmExplanation(): { explanation: string; mnemonic: string } {
  return {
    explanation: 'Listen carefully to where each beat falls. Strong beats usually land on 1 and 3 in 4/4 time.',
    mnemonic: 'Count along: say "1-and-2-and-3-and-4-and" to subdivide the beats.',
  };
}

// ── Scenario Explanations ───────────────────────────────────

export const SCENARIO_EXPLANATIONS: Record<string, string> = {
  'Singing Voice': 'The singing voice uses pitch and melody to carry a tune. We sing songs, lullabies, and hymns.',
  'Speaking Voice': 'The speaking voice is our normal voice for conversations, reading, and answering questions.',
  'Whispering Voice': 'The whispering voice is very quiet — used when we need to be soft and gentle.',
  'Shouting Voice': 'The shouting voice is very loud — used to be heard far away or to cheer.',
};
