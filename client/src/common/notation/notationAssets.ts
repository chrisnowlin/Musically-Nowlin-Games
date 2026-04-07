/**
 * Maps vocabulary terms to their LilyPond-generated SVG notation assets.
 *
 * Keys are VocabEntry.term values from vocabData.ts.
 * Values are "{category}/{filename}" where the full path is
 * /images/notation/notation/{category}/{filename}.svg
 */
export const VOCAB_ASSET_MAP: Record<string, string> = {
  // ── Clefs ──────────────────────────────
  'Treble clef': 'clefs/treble-clef',
  'Bass clef': 'clefs/bass-clef',

  // ── Note Values ────────────────────────
  'Quarter note': 'notes/quarter-note',
  'Half note': 'notes/half-note',
  'Whole note': 'notes/whole-note',
  'Beamed eighth notes': 'notes/beamed-eighths',
  'Dotted half note': 'notes/dotted-half-note',
  'Dotted quarter note': 'notes/dotted-quarter-note',

  // ── Rests ──────────────────────────────
  'Quarter rest': 'notes/quarter-rest',
  'Half rest': 'notes/half-rest',
  'Whole rest': 'notes/whole-rest',

  // ── Dynamics ───────────────────────────
  'f': 'dynamics/f',
  'p': 'dynamics/p',
  'piano': 'dynamics/p',
  'forte': 'dynamics/f',
  'mf': 'dynamics/mf',
  'mp': 'dynamics/mp',
  'pp': 'dynamics/pp',
  'ff': 'dynamics/ff',
  'sfz': 'dynamics/sfz',
  'fp': 'dynamics/fp',
  'ppp': 'dynamics/ppp',
  'fff': 'dynamics/fff',
  'Crescendo': 'dynamics/crescendo',
  'Decrescendo': 'dynamics/decrescendo',
  'Diminuendo': 'dynamics/decrescendo',
  'Fortissimo': 'dynamics/ff',

  // ── Time Signatures ────────────────────
  'Time signature 4/4': 'symbols/time-sig-4-4',
  'Time signature 3/4': 'symbols/time-sig-3-4',
  'Time signature 6/8': 'symbols/time-sig-6-8',

  // ── Accidentals ────────────────────────
  'Sharp': 'symbols/sharp',
  'Flat': 'symbols/flat',
  'Natural': 'symbols/natural',

  // ── Articulations & Symbols ────────────
  'Fermata': 'symbols/fermata',
  'Staccato': 'symbols/staccato',
  'Repeat sign': 'symbols/repeat-sign',
  'Tied note': 'symbols/tie',
  'Triplet': 'symbols/triplet',
  'Trill': 'symbols/trill',
  'Grace note': 'symbols/grace-note',
  'Double bar line': 'symbols/double-bar',
};

/**
 * Get the public URL for a notation SVG asset.
 */
export function getNotationAsset(category: string, key: string): string {
  return `/images/notation/notation/${category}/${key}.svg`;
}

/**
 * Given a VocabEntry term, return the asset URL if one exists.
 * Returns undefined if no LilyPond asset is available for this term.
 */
export function getVocabNotationAsset(term: string): string | undefined {
  const assetKey = VOCAB_ASSET_MAP[term];
  if (!assetKey) return undefined;
  return `/images/notation/notation/${assetKey}.svg`;
}
