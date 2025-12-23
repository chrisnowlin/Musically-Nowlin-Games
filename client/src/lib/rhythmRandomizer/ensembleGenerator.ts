/**
 * Ensemble Generator
 * Generates coordinated multi-part rhythms for ensemble playing
 */

import {
  RhythmPattern,
  RhythmSettings,
  EnsembleMode,
  EnsemblePattern,
  EnsemblePart,
  BodyPercussionPart,
  NoteValue,
  RestValue,
  NOTE_DURATIONS,
} from './types';
import { generateRhythmPattern } from './rhythmGenerator';

// ============================================
// ENSEMBLE PART CONFIGURATION
// ============================================

interface PartConfig {
  label: string;
  bodyPart?: BodyPercussionPart;
  densityMultiplier: number; // Relative to base pattern
  syncopationMultiplier: number;
  restMultiplier: number;
  preferredNotes: NoteValue[];
}

const BODY_PERCUSSION_CONFIGS: Record<BodyPercussionPart, PartConfig> = {
  stomp: {
    label: 'Stomp (Feet)',
    bodyPart: 'stomp',
    densityMultiplier: 0.5, // Sparse, foundational
    syncopationMultiplier: 0.3,
    restMultiplier: 1.5,
    preferredNotes: ['half', 'quarter', 'whole'],
  },
  clap: {
    label: 'Clap (Hands)',
    bodyPart: 'clap',
    densityMultiplier: 1.0,
    syncopationMultiplier: 0.8,
    restMultiplier: 1.0,
    preferredNotes: ['quarter', 'eighth', 'twoEighths'],
  },
  snap: {
    label: 'Snap (Fingers)',
    bodyPart: 'snap',
    densityMultiplier: 1.2,
    syncopationMultiplier: 1.2,
    restMultiplier: 0.8,
    preferredNotes: ['eighth', 'sixteenth', 'quarter', 'twoEighths', 'twoSixteenths', 'fourSixteenths', 'eighthTwoSixteenths', 'twoSixteenthsEighth', 'sixteenthEighthSixteenth'],
  },
  pat: {
    label: 'Pat (Thighs)',
    bodyPart: 'pat',
    densityMultiplier: 0.8,
    syncopationMultiplier: 0.6,
    restMultiplier: 1.2,
    preferredNotes: ['quarter', 'eighth', 'half', 'twoEighths'],
  },
};

const LAYERED_PART_CONFIGS: PartConfig[] = [
  {
    label: 'Part 1 (Foundation)',
    densityMultiplier: 0.5,
    syncopationMultiplier: 0.2,
    restMultiplier: 1.3,
    preferredNotes: ['half', 'quarter', 'whole'],
  },
  {
    label: 'Part 2 (Mid)',
    densityMultiplier: 0.8,
    syncopationMultiplier: 0.6,
    restMultiplier: 1.0,
    preferredNotes: ['quarter', 'eighth', 'twoEighths'],
  },
  {
    label: 'Part 3 (Active)',
    densityMultiplier: 1.2,
    syncopationMultiplier: 1.0,
    restMultiplier: 0.7,
    preferredNotes: ['eighth', 'sixteenth', 'quarter', 'twoEighths', 'twoSixteenths', 'fourSixteenths', 'eighthTwoSixteenths', 'twoSixteenthsEighth', 'sixteenthEighthSixteenth'],
  },
  {
    label: 'Part 4 (Complex)',
    densityMultiplier: 1.5,
    syncopationMultiplier: 1.3,
    restMultiplier: 0.5,
    preferredNotes: ['sixteenth', 'eighth', 'twoSixteenths', 'fourSixteenths', 'eighthTwoSixteenths', 'twoSixteenthsEighth', 'sixteenthEighthSixteenth'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateUniqueId(): string {
  return `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Filter allowed notes based on part configuration
 * Always respects user's selections - only filters if there's overlap with preferred notes
 * If user has only selected notes that don't match preferences, use all user selections
 */
function filterNotesForPart(
  allowedNotes: NoteValue[],
  preferredNotes: NoteValue[]
): NoteValue[] {
  // If user hasn't selected any notes, return preferences as fallback
  if (allowedNotes.length === 0) {
    return preferredNotes;
  }

  // Try to find overlap between user selections and part preferences
  const filtered = allowedNotes.filter((note) => preferredNotes.includes(note));

  // If there's overlap, use filtered notes; otherwise use ALL of user's selections
  // This ensures user's selections are always respected
  return filtered.length > 0 ? filtered : allowedNotes;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Create settings for a part based on base settings and config
 */
function createPartSettings(
  baseSettings: RhythmSettings,
  config: PartConfig
): RhythmSettings {
  return {
    ...baseSettings,
    allowedNoteValues: filterNotesForPart(
      baseSettings.allowedNoteValues,
      config.preferredNotes
    ),
    syncopationProbability: clamp(
      Math.round(baseSettings.syncopationProbability * config.syncopationMultiplier),
      0,
      100
    ),
    restProbability: clamp(
      Math.round(baseSettings.restProbability * config.restMultiplier),
      0,
      60 // Cap rest probability
    ),
    // Adjust density based on multiplier
    noteDensity:
      config.densityMultiplier < 0.7
        ? 'sparse'
        : config.densityMultiplier > 1.2
        ? 'dense'
        : 'medium',
  };
}

// ============================================
// CALL & RESPONSE GENERATOR
// ============================================

/**
 * Generate a call and response pattern pair
 * The "response" is a complementary variation of the "call"
 */
function generateCallResponse(settings: RhythmSettings): EnsemblePattern {
  // Generate the "call" pattern
  const callSettings: RhythmSettings = {
    ...settings,
    measureCount: Math.max(1, Math.floor(settings.measureCount / 2)) as 1 | 2 | 4 | 8,
  };
  const callPattern = generateRhythmPattern(callSettings);

  // Generate the "response" pattern - slightly varied
  const responseSettings: RhythmSettings = {
    ...callSettings,
    syncopationProbability: clamp(
      callSettings.syncopationProbability + 15,
      0,
      100
    ),
    // Slightly different note selection for variation
  };
  const responsePattern = generateRhythmPattern(responseSettings);

  const parts: EnsemblePart[] = [
    {
      id: generateUniqueId(),
      label: 'Call',
      pattern: callPattern,
      isMuted: false,
      isSoloed: false,
    },
    {
      id: generateUniqueId(),
      label: 'Response',
      pattern: responsePattern,
      isMuted: false,
      isSoloed: false,
    },
  ];

  return {
    mode: 'callResponse',
    parts,
    settings,
  };
}

// ============================================
// LAYERED PARTS GENERATOR
// ============================================

/**
 * Generate multiple layered parts with varying complexity
 */
function generateLayeredParts(
  settings: RhythmSettings,
  partCount: 2 | 3 | 4
): EnsemblePattern {
  const parts: EnsemblePart[] = [];

  for (let i = 0; i < partCount; i++) {
    const config = LAYERED_PART_CONFIGS[i];
    const partSettings = createPartSettings(settings, config);
    const pattern = generateRhythmPattern(partSettings);

    parts.push({
      id: generateUniqueId(),
      label: config.label,
      pattern,
      isMuted: false,
      isSoloed: false,
    });
  }

  return {
    mode: 'layered',
    parts,
    settings,
  };
}

// ============================================
// BODY PERCUSSION GENERATOR
// ============================================

/**
 * Generate body percussion ensemble parts
 */
function generateBodyPercussion(
  settings: RhythmSettings,
  partCount: 2 | 3 | 4
): EnsemblePattern {
  const bodyParts: BodyPercussionPart[] = ['stomp', 'clap', 'snap', 'pat'];
  const selectedParts = bodyParts.slice(0, partCount);
  const parts: EnsemblePart[] = [];

  for (const bodyPart of selectedParts) {
    const config = BODY_PERCUSSION_CONFIGS[bodyPart];
    const partSettings = createPartSettings(settings, config);
    const pattern = generateRhythmPattern(partSettings);

    parts.push({
      id: generateUniqueId(),
      label: config.label,
      pattern,
      bodyPart,
      isMuted: false,
      isSoloed: false,
    });
  }

  return {
    mode: 'bodyPercussion',
    parts,
    settings,
  };
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

/**
 * Generate an ensemble pattern based on mode and settings
 */
export function generateEnsemblePattern(
  settings: RhythmSettings,
  mode: EnsembleMode,
  partCount: 2 | 3 | 4 = 2
): EnsemblePattern | null {
  if (mode === 'single') {
    return null; // Single mode doesn't use ensemble
  }

  switch (mode) {
    case 'callResponse':
      return generateCallResponse(settings);
    case 'layered':
      return generateLayeredParts(settings, partCount);
    case 'bodyPercussion':
      return generateBodyPercussion(settings, partCount);
    default:
      return null;
  }
}

/**
 * Regenerate a single part within an ensemble
 */
export function regeneratePart(
  ensemble: EnsemblePattern,
  partIndex: number
): EnsemblePattern {
  const part = ensemble.parts[partIndex];
  if (!part) return ensemble;

  let config: PartConfig;

  if (ensemble.mode === 'bodyPercussion' && part.bodyPart) {
    config = BODY_PERCUSSION_CONFIGS[part.bodyPart];
  } else if (ensemble.mode === 'layered') {
    config = LAYERED_PART_CONFIGS[partIndex] || LAYERED_PART_CONFIGS[0];
  } else {
    // Call/response - use base settings
    const newPattern = generateRhythmPattern(ensemble.settings);
    return {
      ...ensemble,
      parts: ensemble.parts.map((p, i) =>
        i === partIndex ? { ...p, pattern: newPattern } : p
      ),
    };
  }

  const partSettings = createPartSettings(ensemble.settings, config);
  const newPattern = generateRhythmPattern(partSettings);

  return {
    ...ensemble,
    parts: ensemble.parts.map((p, i) =>
      i === partIndex ? { ...p, pattern: newPattern } : p
    ),
  };
}

/**
 * Toggle mute state for a part
 */
export function togglePartMute(
  ensemble: EnsemblePattern,
  partIndex: number
): EnsemblePattern {
  return {
    ...ensemble,
    parts: ensemble.parts.map((p, i) =>
      i === partIndex ? { ...p, isMuted: !p.isMuted } : p
    ),
  };
}

/**
 * Toggle solo state for a part
 */
export function togglePartSolo(
  ensemble: EnsemblePattern,
  partIndex: number
): EnsemblePattern {
  return {
    ...ensemble,
    parts: ensemble.parts.map((p, i) =>
      i === partIndex ? { ...p, isSoloed: !p.isSoloed } : p
    ),
  };
}

/**
 * Get total duration of ensemble in beats
 */
export function getEnsembleDuration(ensemble: EnsemblePattern): number {
  if (ensemble.parts.length === 0) return 0;

  // For call/response, parts are sequential
  if (ensemble.mode === 'callResponse') {
    return ensemble.parts.reduce(
      (total, part) => total + part.pattern.totalDurationBeats,
      0
    );
  }

  // For other modes, parts are parallel - use longest
  return Math.max(...ensemble.parts.map((p) => p.pattern.totalDurationBeats));
}

/**
 * Get ensemble mode display name
 */
export function getEnsembleModeDisplayName(mode: EnsembleMode): string {
  switch (mode) {
    case 'single':
      return 'Single Part';
    case 'callResponse':
      return 'Call & Response';
    case 'layered':
      return 'Layered Parts';
    case 'bodyPercussion':
      return 'Body Percussion';
    default:
      return mode;
  }
}

/**
 * Get body percussion part display name
 */
export function getBodyPercussionPartName(part: BodyPercussionPart): string {
  return BODY_PERCUSSION_CONFIGS[part].label;
}
