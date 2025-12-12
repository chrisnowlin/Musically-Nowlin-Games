/**
 * Mode Definitions for Phrase Analyzer
 * ID: pitch-003
 * Unified Skill: Understanding musical phrases and their structural relationships
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

export const PHRASE_MODES: Record<string, GameMode> = {
  structure: {
    id: 'structure',
    name: 'Phrase Structure',
    description: 'Learn to identify musical phrases, periods, and sentences in melodies.',
    icon: '🎼',
    color: 'from-green-400 to-green-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to the melody and identify whether it contains phrases, periods, or complete sentences.'
  },
  relationships: {
    id: 'relationships',
    name: 'Phrase Relationships',
    description: 'Discover how phrases relate to each other through parallel, contrasting, or sequential patterns.',
    icon: '🔗',
    color: 'from-blue-400 to-blue-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify the relationship between consecutive phrases - are they parallel, contrasting, or sequential?'
  },
  transformations: {
    id: 'transformations',
    name: 'Phrase Transformations',
    description: 'Recognize musical transformations including transposition, inversion, and retrograde.',
    icon: '🔄',
    color: 'from-purple-400 to-purple-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Listen carefully to identify how the original phrase has been transformed - transposed, inverted, or played backwards.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return PHRASE_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(PHRASE_MODES);
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

// Phrase definitions for audio synthesis
export const PHRASE_DEFINITIONS = {
  // Basic phrase structures
  'basicPhrase': {
    notes: [0, 2, 4, 3, 2, 1, 0], // Simple ascending and descending melody
    rhythm: [1, 1, 1, 1, 1, 1, 2], // Basic rhythm pattern
    description: 'A simple 4-measure phrase with clear beginning and end'
  },
  'period': {
    notes: [0, 2, 4, 3, 2, 1, 0, 5, 7, 9, 8, 7, 6, 5], // Antecedent + consequent
    rhythm: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
    description: 'An 8-measure period with antecedent and consequent phrases'
  },
  'sentence': {
    notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 0], // Presentation + continuation
    rhythm: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    description: 'A 16-measure sentence with presentation and continuation phases'
  },
  
  // Phrase relationships
  'parallel': {
    antecedent: [0, 2, 4, 3, 2, 1, 0],
    consequent: [5, 7, 9, 8, 7, 6, 5], // Same rhythm, different pitch level
    description: 'Parallel phrases with identical rhythmic patterns'
  },
  'contrasting': {
    antecedent: [0, 2, 4, 3, 2, 1, 0],
    consequent: [7, 5, 3, 4, 5, 6, 7], // Different contour and rhythm
    description: 'Contrasting phrases with different melodic contours'
  },
  'sequential': {
    antecedent: [0, 2, 4, 3],
    consequent: [2, 4, 6, 5], // Sequential repetition at different pitch level
    description: 'Sequential phrases with stepwise transposition'
  },
  
  // Transformations
  'transposition': {
    original: [0, 2, 4, 3, 2, 1, 0],
    transformed: [5, 7, 9, 8, 7, 6, 5], // Transposed up a perfect 5th
    description: 'Original phrase transposed up a perfect 5th'
  },
  'inversion': {
    original: [0, 2, 4, 3, 2, 1, 0],
    transformed: [0, -2, -4, -3, -2, -1, 0], // Melodic inversion
    description: 'Original phrase inverted melodically'
  },
  'retrograde': {
    original: [0, 2, 4, 3, 2, 1, 0],
    transformed: [0, 1, 2, 3, 4, 2, 0], // Played backwards
    description: 'Original phrase played in retrograde (backwards)'
  }
};

export const PHRASE_NAMES = {
  // Structure types
  'basicPhrase': 'Basic Phrase',
  'period': 'Musical Period',
  'sentence': 'Musical Sentence',
  
  // Relationship types
  'parallel': 'Parallel Phrases',
  'contrasting': 'Contrasting Phrases',
  'sequential': 'Sequential Phrases',
  
  // Transformation types
  'transposition': 'Transposition',
  'inversion': 'Melodic Inversion',
  'retrograde': 'Retrograde'
};