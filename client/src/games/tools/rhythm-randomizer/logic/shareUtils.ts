/**
 * Share Utilities
 * URL encoding/decoding for shareable rhythm patterns
 */

import {
  RhythmPattern,
  RhythmSettings,
  DEFAULT_SETTINGS,
} from './types';

// ============================================
// URL PARAMETER KEYS (short for compact URLs)
// ============================================

const PARAM_KEYS = {
  timeSignature: 'ts',
  tempo: 'bpm',
  measureCount: 'mc',
  allowedNoteValues: 'nv',
  syncopationProbability: 'syn',
  restProbability: 'rp',
  noteDensity: 'nd',
  countingSystem: 'cs',
  sound: 'snd',
  ensembleMode: 'em',
  partCount: 'pc',
} as const;

// ============================================
// ENCODING HELPERS
// ============================================

/**
 * Encode note values array to compact string
 */
function encodeNoteValues(values: string[]): string {
  const shortCodes: Record<string, string> = {
    whole: 'w',
    half: 'h',
    quarter: 'q',
    eighth: 'e',
    sixteenth: 's',
    tripletQuarter: 'tq',
    tripletEighth: 'te',
    // Beamed groups
    twoEighths: '2e',
    fourSixteenths: '4s',
    twoSixteenths: '2s',
    eighthTwoSixteenths: 'e2s',
    twoSixteenthsEighth: '2se',
    sixteenthEighthSixteenth: 'ses',
  };
  return values.map((v) => shortCodes[v] || v).join(',');
}

/**
 * Decode compact string to note values array
 */
function decodeNoteValues(encoded: string): string[] {
  const longCodes: Record<string, string> = {
    w: 'whole',
    h: 'half',
    q: 'quarter',
    e: 'eighth',
    s: 'sixteenth',
    tq: 'tripletQuarter',
    te: 'tripletEighth',
    // Beamed groups
    '2e': 'twoEighths',
    '4s': 'fourSixteenths',
    '2s': 'twoSixteenths',
    'e2s': 'eighthTwoSixteenths',
    '2se': 'twoSixteenthsEighth',
    'ses': 'sixteenthEighthSixteenth',
  };
  return encoded.split(',').map((code) => longCodes[code] || code);
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Encode rhythm settings to URL search params
 */
export function encodeSettingsToUrl(settings: Partial<RhythmSettings>): string {
  const params = new URLSearchParams();

  if (settings.timeSignature && settings.timeSignature !== DEFAULT_SETTINGS.timeSignature) {
    params.set(PARAM_KEYS.timeSignature, settings.timeSignature);
  }

  if (settings.tempo && settings.tempo !== DEFAULT_SETTINGS.tempo) {
    params.set(PARAM_KEYS.tempo, String(settings.tempo));
  }

  if (settings.measureCount && settings.measureCount !== DEFAULT_SETTINGS.measureCount) {
    params.set(PARAM_KEYS.measureCount, String(settings.measureCount));
  }

  if (settings.allowedNoteValues && settings.allowedNoteValues.length > 0) {
    const defaultNotes = encodeNoteValues(DEFAULT_SETTINGS.allowedNoteValues);
    const currentNotes = encodeNoteValues(settings.allowedNoteValues);
    if (currentNotes !== defaultNotes) {
      params.set(PARAM_KEYS.allowedNoteValues, currentNotes);
    }
  }

  if (
    settings.syncopationProbability !== undefined &&
    settings.syncopationProbability !== DEFAULT_SETTINGS.syncopationProbability
  ) {
    params.set(PARAM_KEYS.syncopationProbability, String(settings.syncopationProbability));
  }

  if (
    settings.restProbability !== undefined &&
    settings.restProbability !== DEFAULT_SETTINGS.restProbability
  ) {
    params.set(PARAM_KEYS.restProbability, String(settings.restProbability));
  }

  if (settings.noteDensity && settings.noteDensity !== DEFAULT_SETTINGS.noteDensity) {
    params.set(PARAM_KEYS.noteDensity, settings.noteDensity);
  }

  if (settings.countingSystem && settings.countingSystem !== DEFAULT_SETTINGS.countingSystem) {
    params.set(PARAM_KEYS.countingSystem, settings.countingSystem);
  }

  if (settings.sound && settings.sound !== DEFAULT_SETTINGS.sound) {
    params.set(PARAM_KEYS.sound, settings.sound);
  }

  if (settings.ensembleMode && settings.ensembleMode !== DEFAULT_SETTINGS.ensembleMode) {
    params.set(PARAM_KEYS.ensembleMode, settings.ensembleMode);
  }

  if (settings.partCount && settings.partCount !== DEFAULT_SETTINGS.partCount) {
    params.set(PARAM_KEYS.partCount, String(settings.partCount));
  }

  return params.toString();
}

/**
 * Decode URL search params to rhythm settings
 */
export function decodeSettingsFromUrl(searchParams: URLSearchParams): Partial<RhythmSettings> {
  const settings: Partial<RhythmSettings> = {};

  const ts = searchParams.get(PARAM_KEYS.timeSignature);
  if (ts) settings.timeSignature = ts;

  const bpm = searchParams.get(PARAM_KEYS.tempo);
  if (bpm) settings.tempo = parseInt(bpm, 10);

  const mc = searchParams.get(PARAM_KEYS.measureCount);
  if (mc) settings.measureCount = parseInt(mc, 10) as 1 | 2 | 4 | 8;

  const nv = searchParams.get(PARAM_KEYS.allowedNoteValues);
  if (nv) settings.allowedNoteValues = decodeNoteValues(nv) as RhythmSettings['allowedNoteValues'];

  const syn = searchParams.get(PARAM_KEYS.syncopationProbability);
  if (syn) settings.syncopationProbability = parseInt(syn, 10);

  const rp = searchParams.get(PARAM_KEYS.restProbability);
  if (rp) settings.restProbability = parseInt(rp, 10);

  const nd = searchParams.get(PARAM_KEYS.noteDensity);
  if (nd) settings.noteDensity = nd as RhythmSettings['noteDensity'];

  const cs = searchParams.get(PARAM_KEYS.countingSystem);
  if (cs) settings.countingSystem = cs as RhythmSettings['countingSystem'];

  const snd = searchParams.get(PARAM_KEYS.sound);
  if (snd) settings.sound = snd as RhythmSettings['sound'];

  const em = searchParams.get(PARAM_KEYS.ensembleMode);
  if (em) settings.ensembleMode = em as RhythmSettings['ensembleMode'];

  const pc = searchParams.get(PARAM_KEYS.partCount);
  if (pc) settings.partCount = parseInt(pc, 10) as 2 | 3 | 4;

  return settings;
}

/**
 * Generate a shareable URL for current settings
 */
export function generateShareUrl(settings: RhythmSettings): string {
  const params = encodeSettingsToUrl(settings);
  const baseUrl = `${window.location.origin}/tools/rhythm-randomizer`;
  return params ? `${baseUrl}?${params}` : baseUrl;
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(settings: RhythmSettings): Promise<boolean> {
  try {
    const url = generateShareUrl(settings);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}

/**
 * Load settings from current URL
 */
export function loadSettingsFromUrl(): Partial<RhythmSettings> {
  const searchParams = new URLSearchParams(window.location.search);
  return decodeSettingsFromUrl(searchParams);
}

/**
 * Update URL without navigation
 */
export function updateUrlWithSettings(settings: RhythmSettings): void {
  const params = encodeSettingsToUrl(settings);
  const newUrl = params
    ? `${window.location.pathname}?${params}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}
