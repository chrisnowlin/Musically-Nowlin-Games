/**
 * Mode Definitions for Rhythm Notation Master
 * ID: rhythm-004
 * Unified Skill: Understanding rhythm notation and rhythmic patterns
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

export const NOTATION_MODES: Record<string, GameMode> = {
  values: {
    id: 'values',
    name: 'Note Values',
    description: 'Learn to identify and understand basic note and rest values including whole, half, quarter, and eighth notes.',
    icon: '🎵',
    color: 'from-green-400 to-green-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 12,
    instructions: 'Identify the note or rest value shown on the staff and select the correct duration.'
  },
  tuplets: {
    id: 'tuplets',
    name: 'Tuplet Patterns',
    description: 'Master triplets, duplets, and other tuplet divisions that modify the regular rhythmic subdivision.',
    icon: '🎯',
    color: 'from-orange-400 to-orange-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Identify the tuplet type and determine how many notes fit into the modified beat.'
  },
  conversion: {
    id: 'conversion',
    name: 'Rhythm Conversion',
    description: 'Practice converting between different note values and understanding rhythmic equivalents.',
    icon: '🔄',
    color: 'from-blue-400 to-blue-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Convert the given rhythm to its equivalent using different note values.'
  },
  'speed-reading': {
    id: 'speed-reading',
    name: 'Speed Reading',
    description: 'Quickly identify and perform rhythmic patterns at sight to build reading fluency.',
    icon: '⚡',
    color: 'from-purple-400 to-purple-600',
    ageRange: '8-10',
    difficulty: 'medium',
    maxRounds: 15,
    instructions: 'Quickly identify the rhythm pattern and select the correct notation before time runs out.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return NOTATION_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(NOTATION_MODES);
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

// Rhythm pattern definitions for audio synthesis
export const RHYTHM_DEFINITIONS = {
  // Basic note values (in quarter note units)
  'whole': { duration: 4, symbol: '𝅝', restSymbol: '𝄻', name: 'Whole Note' },
  'half': { duration: 2, symbol: '𝅗𝅥', restSymbol: '𝄼', name: 'Half Note' },
  'quarter': { duration: 1, symbol: '♩', restSymbol: '𝄽', name: 'Quarter Note' },
  'eighth': { duration: 0.5, symbol: '♪', restSymbol: '𝄾', name: 'Eighth Note' },
  'sixteenth': { duration: 0.25, symbol: '♬', restSymbol: '𝄿', name: 'Sixteenth Note' },
  
  // Dotted note values
  'dotted-half': { duration: 3, symbol: '𝅗𝅥.', name: 'Dotted Half Note' },
  'dotted-quarter': { duration: 1.5, symbol: '♩.', name: 'Dotted Quarter Note' },
  'dotted-eighth': { duration: 0.75, symbol: '♪.', name: 'Dotted Eighth Note' },
  
  // Tuplets
  'triplet-quarter': { duration: 0.667, symbol: '♩₃', name: 'Quarter Note Triplet' },
  'triplet-eighth': { duration: 0.333, symbol: '♪₃', name: 'Eighth Note Triplet' },
  'triplet-sixteenth': { duration: 0.167, symbol: '♬₃', name: 'Sixteenth Note Triplet' },
  'duplet': { duration: 1.5, symbol: '♩₂', name: 'Duplet' },
  'quintuplet': { duration: 0.4, symbol: '♪₅', name: 'Quintuplet' },
  'sextuplet': { duration: 0.333, symbol: '♪₆', name: 'Sextuplet' }
};

// Common rhythm patterns for exercises
export const RHYTHM_PATTERNS = {
  // Basic patterns for values mode
  'basic-1': ['quarter', 'quarter', 'quarter', 'quarter'],
  'basic-2': ['half', 'half'],
  'basic-3': ['whole'],
  'basic-4': ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
  'basic-5': ['half', 'quarter', 'quarter'],
  'basic-6': ['quarter', 'eighth', 'eighth', 'quarter', 'quarter'],
  
  // Dotted patterns for conversion mode
  'dotted-1': ['dotted-half', 'quarter'],
  'dotted-2': ['dotted-quarter', 'eighth', 'quarter'],
  'dotted-3': ['dotted-eighth', 'sixteenth', 'eighth', 'eighth'],
  
  // Tuplet patterns for tuplets mode
  'tuplet-1': ['triplet-quarter', 'triplet-quarter', 'triplet-quarter'],
  'tuplet-2': ['triplet-eighth', 'triplet-eighth', 'triplet-eighth', 'triplet-eighth', 'triplet-eighth', 'triplet-eighth'],
  'tuplet-3': ['duplet', 'quarter'],
  'tuplet-4': ['quintuplet', 'quintuplet', 'quarter'],
  'tuplet-5': ['sextuplet', 'sextuplet', 'sextuplet', 'sextuplet'],
  
  // Mixed patterns for speed-reading mode
  'mixed-1': ['quarter', 'eighth', 'eighth', 'half'],
  'mixed-2': ['eighth', 'quarter', 'eighth', 'quarter'],
  'mixed-3': ['dotted-quarter', 'eighth', 'quarter'],
  'mixed-4': ['triplet-eighth', 'triplet-eighth', 'triplet-eighth', 'quarter'],
  'mixed-5': ['sixteenth', 'sixteenth', 'eighth', 'quarter', 'half']
};

// Rhythm names for display
export const RHYTHM_NAMES = {
  // Basic values
  'whole': 'Whole Note (4 beats)',
  'half': 'Half Note (2 beats)',
  'quarter': 'Quarter Note (1 beat)',
  'eighth': 'Eighth Note (1/2 beat)',
  'sixteenth': 'Sixteenth Note (1/4 beat)',
  
  // Dotted values
  'dotted-half': 'Dotted Half Note (3 beats)',
  'dotted-quarter': 'Dotted Quarter Note (1.5 beats)',
  'dotted-eighth': 'Dotted Eighth Note (3/4 beat)',
  
  // Tuplets
  'triplet-quarter': 'Quarter Note Triplet (2/3 beat)',
  'triplet-eighth': 'Eighth Note Triplet (1/3 beat)',
  'triplet-sixteenth': 'Sixteenth Note Triplet (1/6 beat)',
  'duplet': 'Duplet (1.5 beats)',
  'quintuplet': 'Quintuplet (2/5 beat)',
  'sextuplet': 'Sextuplet (1/3 beat)'
};

// Time signatures for context
export const TIME_SIGNATURES = {
  '4/4': { name: 'Common Time', beatsPerMeasure: 4, beatValue: 4 },
  '3/4': { name: 'Waltz Time', beatsPerMeasure: 3, beatValue: 4 },
  '2/4': { name: 'March Time', beatsPerMeasure: 2, beatValue: 4 },
  '6/8': { name: 'Compound Duple', beatsPerMeasure: 6, beatValue: 8 }
};

// Difficulty progressions for each mode
export const DIFFICULTY_PROGRESSIONS = {
  values: {
    1: ['whole', 'half', 'quarter'],
    2: ['whole', 'half', 'quarter', 'eighth'],
    3: ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter']
  },
  tuplets: {
    1: ['triplet-eighth'],
    2: ['triplet-eighth', 'triplet-quarter', 'duplet'],
    3: ['triplet-eighth', 'triplet-quarter', 'triplet-sixteenth', 'duplet', 'quintuplet', 'sextuplet']
  },
  conversion: {
    1: ['whole', 'half', 'quarter', 'eighth'],
    2: ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter'],
    3: ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'dotted-half', 'dotted-quarter', 'dotted-eighth']
  },
  'speed-reading': {
    1: ['basic-1', 'basic-2', 'basic-3'],
    2: ['basic-1', 'basic-2', 'basic-3', 'basic-4', 'basic-5', 'basic-6'],
    3: ['basic-1', 'basic-2', 'basic-3', 'basic-4', 'basic-5', 'basic-6', 'mixed-1', 'mixed-2'],
    4: ['basic-1', 'basic-2', 'basic-3', 'basic-4', 'basic-5', 'basic-6', 'mixed-1', 'mixed-2', 'mixed-3', 'mixed-4'],
    5: ['basic-1', 'basic-2', 'basic-3', 'basic-4', 'basic-5', 'basic-6', 'mixed-1', 'mixed-2', 'mixed-3', 'mixed-4', 'mixed-5']
  }
};