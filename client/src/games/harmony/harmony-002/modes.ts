/**
 * Mode Definitions for Chord Master
 * ID: harmony-002
 * Unified Skill: Understanding chord structures and vertical harmony
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

export const CHORD_MODES: Record<string, GameMode> = {
  triads: {
    id: 'triads',
    name: 'Triad Builder',
    description: 'Learn to identify and construct major, minor, diminished, and augmented triads.',
    icon: '🎹',
    color: 'from-purple-400 to-purple-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to or identify the triad quality and build the correct chord.'
  },
  sevenths: {
    id: 'sevenths',
    name: 'Seventh Chords',
    description: 'Master seventh chords including major 7th, dominant 7th, minor 7th, and diminished 7th.',
    icon: '🎸',
    color: 'from-blue-400 to-blue-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify the quality and extension of seventh chords.'
  },
  extended: {
    id: 'extended',
    name: 'Extended Harmony',
    description: 'Explore extended chords including 9ths, 11ths, 13ths, and altered dominants.',
    icon: '🎺',
    color: 'from-indigo-400 to-indigo-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Identify complex extended chords and their functions.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return CHORD_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(CHORD_MODES);
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

// Chord definitions for audio synthesis
export const CHORD_DEFINITIONS = {
  // Triads
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  
  // Sevenths
  'major7': [0, 4, 7, 11],
  'dominant7': [0, 4, 7, 10],
  'minor7': [0, 3, 7, 10],
  'diminished7': [0, 3, 6, 9],
  'halfDiminished7': [0, 3, 6, 10],
  
  // Extended
  'major9': [0, 4, 7, 11, 14],
  'dominant9': [0, 4, 7, 10, 14],
  'minor9': [0, 3, 7, 10, 14],
  'dominant13': [0, 4, 7, 10, 14, 21],
  'alteredDominant': [0, 4, 7, 10, 13, 15]
};

export const CHORD_NAMES = {
  // Triads
  'major': 'Major Triad',
  'minor': 'Minor Triad',
  'diminished': 'Diminished Triad',
  'augmented': 'Augmented Triad',
  
  // Sevenths
  'major7': 'Major 7th',
  'dominant7': 'Dominant 7th',
  'minor7': 'Minor 7th',
  'diminished7': 'Diminished 7th',
  'halfDiminished7': 'Half-Diminished 7th',
  
  // Extended
  'major9': 'Major 9th',
  'dominant9': 'Dominant 9th',
  'minor9': 'Minor 9th',
  'dominant13': 'Dominant 13th',
  'alteredDominant': 'Altered Dominant'
};
