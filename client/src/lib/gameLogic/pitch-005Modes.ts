/**
 * Mode Definitions for Contour Master
 * ID: pitch-005
 * Unified Skill: Understanding melodic contour and shape
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

export const CONTOUR_MODES: Record<string, GameMode> = {
  transformations: {
    id: 'transformations',
    name: 'Contour Transformations',
    description: 'Learn to identify and create melodic inversions and retrogrades.',
    icon: '🔄',
    color: 'from-green-400 to-green-600',
    ageRange: '8-10',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to the melody and identify its transformation or create the correct inversion/retrograde.'
  },
  modifications: {
    id: 'modifications',
    name: 'Contour Modifications',
    description: 'Master melodic ornamentation and embellishment techniques.',
    icon: '✨',
    color: 'from-orange-400 to-orange-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify or add ornaments and embellishments to melodic contours.'
  },
  analysis: {
    id: 'analysis',
    name: 'Contour Analysis',
    description: 'Analyze melodic shapes, directions, and ranges in music.',
    icon: '📊',
    color: 'from-blue-400 to-blue-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to melodies and analyze their contour shape, direction, and range.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return CONTOUR_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(CONTOUR_MODES);
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

// Contour pattern definitions for audio synthesis
export const CONTOUR_PATTERNS = {
  // Basic contour shapes
  'ascending': [0, 2, 4, 6, 8],
  'descending': [8, 6, 4, 2, 0],
  'arch': [0, 3, 6, 4, 2],
  'valley': [6, 4, 2, 4, 6],
  'wave': [2, 6, 2, 6, 2],
  'plateau': [0, 4, 8, 8, 4],
  
  // Transformations
  'inverted': [8, 6, 4, 2, 0],
  'retrograde': [8, 6, 4, 2, 0],
  'invertedRetrograde': [0, 2, 4, 6, 8],
  
  // Modified contours with ornaments
  'ascendingGrace': [0, 1, 2, 4, 6, 8],
  'descendingTurn': [8, 6, 7, 6, 4, 2, 0],
  'archMordent': [0, 3, 5, 3, 6, 4, 2],
  'valleyTrill': [6, 4, 5, 4, 2, 4, 6],
  
  // Complex contours
  'sawtooth': [0, 6, 2, 8, 4, 0],
  'sineWave': [4, 6, 8, 6, 4, 2, 0, 2, 4],
  'zigzag': [0, 8, 2, 6, 4, 8, 0, 6, 2],
  'cascade': [8, 6, 4, 2, 0, 2, 4, 6, 8]
};

export const CONTOUR_NAMES = {
  // Basic contour shapes
  'ascending': 'Ascending Line',
  'descending': 'Descending Line',
  'arch': 'Arch Shape',
  'valley': 'Valley Shape',
  'wave': 'Wave Pattern',
  'plateau': 'Plateau Shape',
  
  // Transformations
  'inverted': 'Inverted Contour',
  'retrograde': 'Retrograde',
  'invertedRetrograde': 'Inverted Retrograde',
  
  // Modified contours with ornaments
  'ascendingGrace': 'Ascending with Grace Note',
  'descendingTurn': 'Descending with Turn',
  'archMordent': 'Arch with Mordent',
  'valleyTrill': 'Valley with Trill',
  
  // Complex contours
  'sawtooth': 'Sawtooth Pattern',
  'sineWave': 'Sine Wave',
  'zigzag': 'Zigzag Pattern',
  'cascade': 'Cascade Pattern'
};