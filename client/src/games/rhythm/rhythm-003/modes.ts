/**
 * Mode Definitions for Meter Master
 * ID: rhythm-003
 * Unified Skill: Understanding metric organization and time signatures
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

export const METER_MODES: Record<string, GameMode> = {
  meters: {
    id: 'meters',
    name: 'Time Signature Explorer',
    description: 'Learn to identify and understand common time signatures like 2/4, 3/4, 4/4, and 6/8.',
    icon: '🎵',
    color: 'from-green-400 to-green-600',
    ageRange: '7-9',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen to the beat pattern and identify the correct time signature.'
  },
  types: {
    id: 'types',
    name: 'Meter Type Detective',
    description: 'Distinguish between simple meters (2/4, 3/4, 4/4) and compound meters (6/8, 9/8, 12/8).',
    icon: '🎼',
    color: 'from-teal-400 to-teal-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Identify whether the meter is simple or compound based on the beat division.'
  },
  features: {
    id: 'features',
    name: 'Metric Features Master',
    description: 'Explore advanced metric concepts including beat subdivision, strong/weak beats, and metric accents.',
    icon: '🎶',
    color: 'from-cyan-400 to-cyan-600',
    ageRange: '10-12',
    difficulty: 'hard',
    maxRounds: 10,
    instructions: 'Analyze metric features like beat patterns, accents, and rhythmic characteristics.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return METER_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(METER_MODES);
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

// Meter definitions for audio synthesis with beat patterns
export const METER_DEFINITIONS = {
  // Simple meters
  '2/4': {
    beatsPerMeasure: 2,
    beatUnit: 4,
    subdivision: 'simple',
    pattern: [1, 0], // Strong, weak
    emphasis: [1.0, 0.5]
  },
  '3/4': {
    beatsPerMeasure: 3,
    beatUnit: 4,
    subdivision: 'simple',
    pattern: [1, 0, 0], // Strong, weak, weak
    emphasis: [1.0, 0.5, 0.5]
  },
  '4/4': {
    beatsPerMeasure: 4,
    beatUnit: 4,
    subdivision: 'simple',
    pattern: [1, 0, 0.5, 0], // Strong, weak, medium, weak
    emphasis: [1.0, 0.5, 0.7, 0.5]
  },
  
  // Compound meters
  '6/8': {
    beatsPerMeasure: 6,
    beatUnit: 8,
    subdivision: 'compound',
    pattern: [1, 0, 0, 0.5, 0, 0], // Two groups of three
    emphasis: [1.0, 0.3, 0.3, 0.7, 0.3, 0.3]
  },
  '9/8': {
    beatsPerMeasure: 9,
    beatUnit: 8,
    subdivision: 'compound',
    pattern: [1, 0, 0, 0.5, 0, 0, 0.5, 0, 0], // Three groups of three
    emphasis: [1.0, 0.3, 0.3, 0.7, 0.3, 0.3, 0.7, 0.3, 0.3]
  },
  '12/8': {
    beatsPerMeasure: 12,
    beatUnit: 8,
    subdivision: 'compound',
    pattern: [1, 0, 0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0, 0], // Four groups of three
    emphasis: [1.0, 0.3, 0.3, 0.7, 0.3, 0.3, 0.7, 0.3, 0.3, 0.7, 0.3, 0.3]
  },
  
  // Asymmetric meters
  '5/4': {
    beatsPerMeasure: 5,
    beatUnit: 4,
    subdivision: 'asymmetric',
    pattern: [1, 0, 0, 0.5, 0], // 3+2 or 2+3 grouping
    emphasis: [1.0, 0.5, 0.5, 0.7, 0.5]
  },
  '7/8': {
    beatsPerMeasure: 7,
    beatUnit: 8,
    subdivision: 'asymmetric',
    pattern: [1, 0, 0, 0.5, 0, 0, 0.5], // Various groupings
    emphasis: [1.0, 0.3, 0.3, 0.7, 0.3, 0.3, 0.5]
  }
};

export const METER_NAMES = {
  // Simple meters
  '2/4': 'Simple Duple',
  '3/4': 'Simple Triple',
  '4/4': 'Simple Quadruple',
  
  // Compound meters
  '6/8': 'Compound Duple',
  '9/8': 'Compound Triple',
  '12/8': 'Compound Quadruple',
  
  // Asymmetric meters
  '5/4': 'Asymmetric (5/4)',
  '7/8': 'Asymmetric (7/8)',
  
  // Meter types
  'simple': 'Simple Meter',
  'compound': 'Compound Meter',
  'asymmetric': 'Asymmetric Meter',
  
  // Features
  'strong_beat': 'Strong Beat',
  'weak_beat': 'Weak Beat',
  'subdivision': 'Beat Subdivision',
  'metric_accent': 'Metric Accent'
};