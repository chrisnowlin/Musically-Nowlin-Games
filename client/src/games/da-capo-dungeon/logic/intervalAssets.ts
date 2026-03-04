/**
 * Maps interval names (from getIntervalParams) to SVG file IDs
 * under lilypond/challenges/intervals/.
 */
export const INTERVAL_ASSETS: Record<string, string> = {
  'Unison':  'unison',
  '2nd':     '2nd',
  '3rd':     '3rd',
  '4th':     '4th',
  '5th':     '5th',
  '6th':     '6th',
  'Octave':  'octave',
};

/**
 * Get the public SVG URL for an interval reference image.
 * Returns undefined if no asset exists for the given interval name.
 */
export function getIntervalSvgUrl(intervalName: string): string | undefined {
  const fileId = INTERVAL_ASSETS[intervalName];
  if (!fileId) return undefined;
  return `/images/notation/challenges/intervals/${fileId}.svg`;
}
