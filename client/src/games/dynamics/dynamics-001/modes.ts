/**
 * Mode Definitions for Dynamics Master
 * ID: dynamics-001
 * Multi-mode game covering dynamics & expression concepts
 */

export interface GameMode {
  id: string;
  name: string;
  description: string;
  instructions: string;
  icon: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  maxRounds: number;
  timePerRound: number; // seconds
}

export interface DifficultyLevel {
  level: number;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export const DYNAMICS_MODES: GameMode[] = [
  {
    id: 'levels',
    name: 'Volume Levels',
    description: 'Identify dynamic markings from pp to ff',
    instructions: 'Listen to the music and select the correct dynamic level (very soft to very loud).',
    icon: '🔊',
    color: 'bg-red-500',
    difficulty: 'easy',
    ageRange: '6-9 years',
    maxRounds: 10,
    timePerRound: 30
  },
  {
    id: 'relative',
    name: 'Relative Dynamics',
    description: 'Compare dynamics between phrases',
    instructions: 'Listen to two phrases and determine which is louder or softer.',
    icon: '⚖️',
    color: 'bg-orange-500',
    difficulty: 'easy',
    ageRange: '6-9 years',
    maxRounds: 10,
    timePerRound: 25
  },
  {
    id: 'changes',
    name: 'Dynamic Changes',
    description: 'Identify crescendo and diminuendo',
    instructions: 'Listen to the music and identify if it gets louder (crescendo) or softer (diminuendo).',
    icon: '📈',
    color: 'bg-yellow-500',
    difficulty: 'medium',
    ageRange: '7-10 years',
    maxRounds: 10,
    timePerRound: 35
  },
  {
    id: 'pulse',
    name: 'Musical Expression',
    description: 'Understand articulation and phrasing',
    instructions: 'Listen to the music and identify the expressive quality (staccato, legato, accent).',
    icon: '🎭',
    color: 'bg-green-500',
    difficulty: 'medium',
    ageRange: '8-12 years',
    maxRounds: 10,
    timePerRound: 30
  }
];

export const DYNAMIC_LEVELS = {
  'pp': { name: 'pianissimo', value: 0.1, description: 'very soft' },
  'p': { name: 'piano', value: 0.25, description: 'soft' },
  'mp': { name: 'mezzo-piano', value: 0.4, description: 'moderately soft' },
  'mf': { name: 'mezzo-forte', value: 0.55, description: 'moderately loud' },
  'f': { name: 'forte', value: 0.7, description: 'loud' },
  'ff': { name: 'fortissimo', value: 0.9, description: 'very loud' }
};

export const DIFFICULTY_CURVES: Record<string, DifficultyLevel[]> = {
  levels: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic dynamics (p, f)',
      parameters: {
        dynamics: ['p', 'f'],
        options: 2,
        timeLimit: 30
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Add medium dynamics (mp, mf)',
      parameters: {
        dynamics: ['p', 'mp', 'mf', 'f'],
        options: 3,
        timeLimit: 25
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'All dynamics including extremes (pp, ff)',
      parameters: {
        dynamics: ['pp', 'p', 'mp', 'mf', 'f', 'ff'],
        options: 4,
        timeLimit: 20
      }
    }
  ],
  relative: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Obvious differences',
      parameters: {
        volumeDifference: 0.4,
        options: 2,
        timeLimit: 25
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Moderate differences',
      parameters: {
        volumeDifference: 0.25,
        options: 2,
        timeLimit: 20
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Subtle differences',
      parameters: {
        volumeDifference: 0.15,
        options: 2,
        timeLimit: 15
      }
    }
  ],
  changes: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Clear crescendo/diminuendo',
      parameters: {
        changeAmount: 0.5,
        duration: 2.0,
        options: 2,
        timeLimit: 35
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Moderate changes',
      parameters: {
        changeAmount: 0.3,
        duration: 1.5,
        options: 2,
        timeLimit: 30
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Subtle changes',
      parameters: {
        changeAmount: 0.2,
        duration: 1.0,
        options: 2,
        timeLimit: 25
      }
    }
  ],
  pulse: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic articulation',
      parameters: {
        articulations: ['staccato', 'legato'],
        options: 2,
        timeLimit: 30
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Add accents',
      parameters: {
        articulations: ['staccato', 'legato', 'accent'],
        options: 3,
        timeLimit: 25
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Complex expression',
      parameters: {
        articulations: ['staccato', 'legato', 'accent', 'tenuto', 'marcato'],
        options: 4,
        timeLimit: 20
      }
    }
  ]
};

export function getModeById(modeId: string): GameMode | undefined {
  return DYNAMICS_MODES.find(mode => mode.id === modeId);
}

export function getDifficultyForMode(modeId: string, level: number): DifficultyLevel | undefined {
  const difficulties = DIFFICULTY_CURVES[modeId];
  if (!difficulties) return undefined;
  
  return difficulties.find(d => d.level === level) || difficulties[0];
}

export function getMaxDifficultyForMode(modeId: string): number {
  const difficulties = DIFFICULTY_CURVES[modeId];
  return difficulties ? difficulties.length : 1;
}