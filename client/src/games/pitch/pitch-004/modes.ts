/**
 * Mode Definitions for Scale & Mode Master
 * ID: pitch-004
 * Unified Skill: Understanding scales, modes, and scale degree functions
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

export const SCALE_MODES: Record<string, GameMode> = {
  'major-minor': {
    id: 'major-minor',
    name: 'Major & Minor Scales',
    description: 'Learn to identify and construct major and natural minor scales.',
    icon: '🎵',
    color: 'from-green-400 to-green-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to or identify the scale type and build the correct major or minor scale.'
  },
  modes: {
    id: 'modes',
    name: 'Church Modes',
    description: 'Master the seven church modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian.',
    icon: '🎼',
    color: 'from-blue-400 to-blue-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify different modal scales and their unique characteristics.'
  },
  'special-scales': {
    id: 'special-scales',
    name: 'Special Scales',
    description: 'Explore pentatonic, blues, whole tone, and other special scales used in various musical styles.',
    icon: '🎸',
    color: 'from-purple-400 to-purple-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Identify special scales and their distinctive sounds in different musical contexts.'
  },
  'scale-degrees': {
    id: 'scale-degrees',
    name: 'Scale Degrees',
    description: 'Learn scale degree functions and recognize the role of each note within a scale.',
    icon: '🎯',
    color: 'from-orange-400 to-orange-600',
    ageRange: '8-10',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify scale degrees and their functions (tonic, dominant, etc.) within various scales.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return SCALE_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(SCALE_MODES);
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

// Scale definitions for audio synthesis (intervals in semitones from root)
export const SCALE_DEFINITIONS = {
  // Major & Minor
  'major': [0, 2, 4, 5, 7, 9, 11],
  'natural-minor': [0, 2, 3, 5, 7, 8, 10],
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
  
  // Church Modes
  'ionian': [0, 2, 4, 5, 7, 9, 11],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'phrygian': [0, 1, 3, 5, 7, 8, 10],
  'lydian': [0, 2, 4, 6, 7, 9, 11],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'aeolian': [0, 2, 3, 5, 7, 8, 10],
  'locrian': [0, 1, 3, 5, 6, 8, 10],
  
  // Special Scales
  'major-pentatonic': [0, 2, 4, 7, 9],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  'blues': [0, 3, 5, 6, 7, 10],
  'whole-tone': [0, 2, 4, 6, 8, 10],
  'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'octatonic': [0, 1, 3, 4, 6, 7, 9, 10]
};

export const SCALE_NAMES = {
  // Major & Minor
  'major': 'Major Scale',
  'natural-minor': 'Natural Minor Scale',
  'harmonic-minor': 'Harmonic Minor Scale',
  'melodic-minor': 'Melodic Minor Scale',
  
  // Church Modes
  'ionian': 'Ionian Mode',
  'dorian': 'Dorian Mode',
  'phrygian': 'Phrygian Mode',
  'lydian': 'Lydian Mode',
  'mixolydian': 'Mixolydian Mode',
  'aeolian': 'Aeolian Mode',
  'locrian': 'Locrian Mode',
  
  // Special Scales
  'major-pentatonic': 'Major Pentatonic',
  'minor-pentatonic': 'Minor Pentatonic',
  'blues': 'Blues Scale',
  'whole-tone': 'Whole Tone Scale',
  'chromatic': 'Chromatic Scale',
  'octatonic': 'Octatonic Scale'
};

// Scale degree functions for educational purposes
export const SCALE_DEGREE_FUNCTIONS = {
  1: 'Tonic (home)',
  2: 'Supertonic',
  3: 'Mediant',
  4: 'Subdominant',
  5: 'Dominant',
  6: 'Submediant',
  7: 'Leading Tone'
};