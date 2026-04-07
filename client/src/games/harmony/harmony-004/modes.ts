/**
 * Mode Definitions for Consonance & Dissonance Master
 * ID: harmony-004
 * Unified Skill: Understanding harmonic tension and resolution
 */

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ageRange: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxRounds: number;
  instructions: string;
}

export const CONSONANCE_MODES: Record<string, GameMode> = {
  consonance: {
    id: 'consonance',
    name: 'Consonant Harmony',
    description: 'Identify stable, pleasing sounds and intervals that create musical rest.',
    icon: '😌',
    color: 'from-green-400 to-green-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to the musical examples and identify the consonant intervals or chords.'
  },
  dissonance: {
    id: 'dissonance',
    name: 'Dissonant Harmony',
    description: 'Recognize tense, unstable sounds that create musical tension and desire resolution.',
    icon: '😰',
    color: 'from-orange-400 to-red-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify the dissonant intervals or chords that create musical tension.'
  },
  'non-chord-tones': {
    id: 'non-chord-tones',
    name: 'Non-Chord Tones',
    description: 'Master passing tones, neighbor tones, suspensions, and other embellishments.',
    icon: '🎭',
    color: 'from-purple-400 to-pink-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Identify non-chord tones and embellishments that add color to melodies.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return CONSONANCE_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(CONSONANCE_MODES);
}

export function getMaxDifficultyForMode(modeId: string): number {
  const mode = getModeById(modeId);
  if (!mode) return 1;
  
  switch (mode.difficulty) {
    case 'easy': return 3;
    case 'medium': return 5;
    case 'hard': return 7;
    default: return 3;
  }
}

// Interval definitions for consonance/dissonance
export const INTERVAL_DEFINITIONS = {
  // Consonant intervals
  'unison': { interval: 0, type: 'consonant', name: 'Unison', description: 'Perfect consonance - same note' },
  'octave': { interval: 12, type: 'consonant', name: 'Octave', description: 'Perfect consonance - same note name, higher pitch' },
  'perfect5th': { interval: 7, type: 'consonant', name: 'Perfect 5th', description: 'Perfect consonance - very stable' },
  'perfect4th': { interval: 5, type: 'consonant', name: 'Perfect 4th', description: 'Perfect consonance - stable' },
  'major3rd': { interval: 4, type: 'consonant', name: 'Major 3rd', description: 'Imperfect consonance - happy sound' },
  'minor3rd': { interval: 3, type: 'consonant', name: 'Minor 3rd', description: 'Imperfect consonance - sad sound' },
  'major6th': { interval: 9, type: 'consonant', name: 'Major 6th', description: 'Imperfect consonance - bright sound' },
  'minor6th': { interval: 8, type: 'consonant', name: 'Minor 6th', description: 'Imperfect consonance - dark sound' },
  
  // Dissonant intervals
  'major2nd': { interval: 2, type: 'dissonant', name: 'Major 2nd', description: 'Dissonance - needs resolution' },
  'minor2nd': { interval: 1, type: 'dissonant', name: 'Minor 2nd', description: 'Dissonance - very tense' },
  'major7th': { interval: 11, type: 'dissonant', name: 'Major 7th', description: 'Dissonance - tense but colorful' },
  'minor7th': { interval: 10, type: 'dissonant', name: 'Minor 7th', description: 'Dissonance - moderate tension' },
  'tritone': { interval: 6, type: 'dissonant', name: 'Tritone', description: 'Dissonance - most tense interval' }
};

// Non-chord tone definitions
export const NON_CHORD_TONE_DEFINITIONS = {
  'passingTone': { 
    type: 'passing', 
    name: 'Passing Tone', 
    description: 'Stepwise motion between chord tones',
    pattern: 'step-up-down'
  },
  'neighborTone': { 
    type: 'neighbor', 
    name: 'Neighbor Tone', 
    description: 'Step away from and back to chord tone',
    pattern: 'step-return'
  },
  'suspension': { 
    type: 'suspension', 
    name: 'Suspension', 
    description: 'Tied note that resolves down by step',
    pattern: 'tie-resolve-down'
  },
  'retardation': { 
    type: 'retardation', 
    name: 'Retardation', 
    description: 'Tied note that resolves up by step',
    pattern: 'tie-resolve-up'
  },
  'appoggiatura': { 
    type: 'appoggiatura', 
    name: 'Appoggiatura', 
    description: 'Approached by leap, resolved by step',
    pattern: 'leap-step'
  },
  'escapeTone': { 
    type: 'escape', 
    name: 'Escape Tone', 
    description: 'Step away, leap back to chord tone',
    pattern: 'step-leap'
  }
};

// Helper function to get intervals by type
export function getIntervalsByType(type: 'consonant' | 'dissonant') {
  return Object.entries(INTERVAL_DEFINITIONS)
    .filter(([_, def]) => def.type === type)
    .map(([key, def]) => ({ key, ...def }));
}

// Helper function to get all non-chord tones
export function getAllNonChordTones() {
  return Object.entries(NON_CHORD_TONE_DEFINITIONS)
    .map(([key, def]) => ({ key, ...def }));
}
