/**
 * Mode Definitions for Polyrhythm Master
 * ID: rhythm-005
 * Unified Skill: Understanding and performing polyrhythms
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

export const POLYRHYTHM_MODES: Record<string, GameMode> = {
  identification: {
    id: 'identification',
    name: 'Polyrhythm Detective',
    description: 'Identify common polyrhythms like 2:3, 3:4, and 4:5 by ear.',
    icon: '🎯',
    color: 'from-orange-400 to-orange-600',
    ageRange: '8-10',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen carefully and identify which polyrhythm pattern is being played.'
  },
  analysis: {
    id: 'analysis',
    name: 'Rhythm Analyzer',
    description: 'Analyze the structure of polyrhythms and understand how different pulse patterns work together.',
    icon: '🔍',
    color: 'from-teal-400 to-teal-600',
    ageRange: '10-12',
    difficulty: 'medium',
    maxRounds: 8,
    instructions: 'Break down polyrhythms to understand how the individual rhythms align and interact.'
  },
  transformation: {
    id: 'transformation',
    name: 'Rhythm Transformer',
    description: 'Transform simple rhythms into complex polyrhythms by adding contrasting pulse patterns.',
    icon: '🔄',
    color: 'from-purple-400 to-purple-600',
    ageRange: '11-12',
    difficulty: 'hard',
    maxRounds: 8,
    instructions: 'Take a basic rhythm pattern and transform it into a polyrhythm by adding a second layer.'
  },
  creation: {
    id: 'creation',
    name: 'Polyrhythm Creator',
    description: 'Create and perform your own polyrhythms using different time divisions.',
    icon: '🎨',
    color: 'from-pink-400 to-pink-600',
    ageRange: '9-11',
    difficulty: 'medium',
    maxRounds: 6,
    instructions: 'Build your own polyrhythms by combining different rhythmic patterns and perform them.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return POLYRHYTHM_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(POLYRHYTHM_MODES);
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

// Polyrhythm definitions for audio synthesis with accurate timing
export const POLYRHYTHM_DEFINITIONS = {
  // Common polyrhythms with timing ratios (first:number, second:number)
  '2:3': {
    ratio: [2, 3],
    pattern: [0, 0.5, 0.333, 0.833, 0.667, 1.167], // Combined timing points
    description: 'Two against three - triplet feel with duplet overlay'
  },
  '3:4': {
    ratio: [3, 4],
    pattern: [0, 0.333, 0.667, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25],
    description: 'Three against four - common in African and Latin music'
  },
  '4:5': {
    ratio: [4, 5],
    pattern: [0, 0.25, 0.5, 0.75, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0],
    description: 'Four against five - advanced polyrhythm'
  },
  '3:5': {
    ratio: [3, 5],
    pattern: [0, 0.333, 0.667, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4],
    description: 'Three against five - complex rhythmic texture'
  },
  '2:5': {
    ratio: [2, 5],
    pattern: [0, 0.5, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8],
    description: 'Two against five - quintuplet feel with duplet overlay'
  }
};

// Polyrhythm names for display
export const POLYRHYTHM_NAMES = {
  '2:3': 'Two Against Three',
  '3:4': 'Three Against Four', 
  '4:5': 'Four Against Five',
  '3:5': 'Three Against Five',
  '2:5': 'Two Against Five'
};

// Tempo recommendations for different polyrhythms (BPM)
export const POLYRHYTHM_TEMPOS = {
  '2:3': { min: 60, max: 120, suggested: 90 },
  '3:4': { min: 50, max: 100, suggested: 75 },
  '4:5': { min: 40, max: 80, suggested: 60 },
  '3:5': { min: 45, max: 90, suggested: 65 },
  '2:5': { min: 50, max: 100, suggested: 70 }
};

// Educational descriptions for each polyrhythm
export const POLYRHYTHM_EDUCATION = {
  '2:3': 'This is the most common polyrhythm. Think of playing triplets on one hand while playing eighth notes on the other. It creates a swinging, syncopated feel used in jazz and African music.',
  '3:4': 'Found in many traditional African rhythms, this pattern creates a complex interplay between three and four beats. Listen for how the patterns align every 12 beats.',
  '4:5': 'An advanced polyrhythm that creates a sophisticated rhythmic texture. The patterns only align every 20 beats, creating a constantly shifting feel.',
  '3:5': 'This polyrhythm combines a simple triple feel with quintuplets. It creates an interesting tension that resolves every 15 beats.',
  '2:5': 'Combines a simple duplet with quintuplets, creating a complex but learnable pattern. The two rhythms align every 10 beats.'
};