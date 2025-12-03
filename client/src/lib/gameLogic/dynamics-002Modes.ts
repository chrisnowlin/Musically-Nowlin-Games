/**
 * Mode Definitions for Expression Master
 * ID: dynamics-002
 * Multi-mode game covering expression and interpretation concepts
 * 
 * Modes:
 * - articulation: Identify articulation styles (legato, staccato, accent, tenuto)
 * - interpretation: Understand musical phrasing and character
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

/**
 * Available game modes for Expression Master
 */
export const EXPRESSION_MODES: GameMode[] = [
  {
    id: 'articulation',
    name: 'Articulation Styles',
    description: 'Identify different articulation styles like legato, staccato, accents, and tenuto',
    instructions: 'Listen to the musical phrase and identify which articulation style is being used. Pay attention to how the notes connect (or don\'t) and their emphasis.',
    icon: '🎹',
    color: 'bg-red-500',
    difficulty: 'medium',
    ageRange: '7-12 years',
    maxRounds: 10,
    timePerRound: 30
  },
  {
    id: 'interpretation',
    name: 'Musical Phrasing',
    description: 'Understand how articulation and phrasing express musical character and emotion',
    instructions: 'Listen to the phrase and determine what character or emotion it conveys based on how it is played.',
    icon: '🎭',
    color: 'bg-purple-500',
    difficulty: 'medium',
    ageRange: '7-12 years',
    maxRounds: 10,
    timePerRound: 35
  }
];

/**
 * Articulation style definitions with audio parameters
 */
export const ARTICULATION_STYLES = {
  legato: {
    name: 'Legato',
    definition: 'Smooth and connected - notes flow together',
    symbol: '⌒',
    noteDuration: 0.7,  // Overlapping notes
    noteSpacing: 0.6,   // Notes overlap
    attackTime: 0.1,
    releaseTime: 0.2
  },
  staccato: {
    name: 'Staccato',
    definition: 'Short and detached - notes are separated',
    symbol: '•',
    noteDuration: 0.15, // Very short
    noteSpacing: 0.5,   // Separated
    attackTime: 0.01,
    releaseTime: 0.05
  },
  accent: {
    name: 'Accent',
    definition: 'Strong emphasis - alternating loud and soft',
    symbol: '>',
    noteDuration: 0.5,
    noteSpacing: 0.6,
    attackTime: 0.01,
    releaseTime: 0.1,
    volumeBoost: 0.3    // Extra volume on accented notes
  },
  tenuto: {
    name: 'Tenuto',
    definition: 'Held for full value - sustained',
    symbol: '−',
    noteDuration: 0.65, // Full value, held
    noteSpacing: 0.7,
    attackTime: 0.05,
    releaseTime: 0.05
  }
};

/**
 * Interpretation/character options
 */
export const INTERPRETATIONS = {
  legato: {
    character: 'Flowing and expressive',
    emotion: 'calm',
    description: 'The smooth, connected notes create a sense of serenity and grace.'
  },
  staccato: {
    character: 'Energetic and bouncy',
    emotion: 'playful',
    description: 'The short, detached notes create a lively, spirited feeling.'
  },
  accent: {
    character: 'Powerful and dramatic',
    emotion: 'intense',
    description: 'The emphasized notes create a sense of urgency and importance.'
  },
  tenuto: {
    character: 'Deliberate and weighty',
    emotion: 'serious',
    description: 'The sustained notes create a feeling of gravity and significance.'
  }
};

/**
 * Difficulty progression curves for each mode
 */
export const DIFFICULTY_CURVES: Record<string, DifficultyLevel[]> = {
  articulation: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic articulations (legato vs staccato)',
      parameters: {
        articulations: ['legato', 'staccato'],
        options: 2,
        timeLimit: 30,
        noteDifference: 'obvious'
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Add accent articulation',
      parameters: {
        articulations: ['legato', 'staccato', 'accent'],
        options: 3,
        timeLimit: 25,
        noteDifference: 'moderate'
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'All articulation styles',
      parameters: {
        articulations: ['legato', 'staccato', 'accent', 'tenuto'],
        options: 4,
        timeLimit: 20,
        noteDifference: 'subtle'
      }
    }
  ],
  interpretation: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic character recognition',
      parameters: {
        phrasings: ['legato', 'staccato'],
        options: 2,
        timeLimit: 35,
        distractors: 1
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'More nuanced expression',
      parameters: {
        phrasings: ['legato', 'staccato', 'accent'],
        options: 3,
        timeLimit: 30,
        distractors: 2
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Complex interpretation',
      parameters: {
        phrasings: ['legato', 'staccato', 'accent', 'tenuto'],
        options: 4,
        timeLimit: 25,
        distractors: 3
      }
    }
  ]
};

/**
 * Musical phrases used for demonstrations
 */
export const MUSICAL_PHRASES = [
  { name: 'Scale Up', notes: [262, 294, 330, 349] },       // C D E F
  { name: 'Scale Down', notes: [349, 330, 294, 262] },     // F E D C
  { name: 'Arpeggio', notes: [262, 330, 392, 523] },       // C E G C
  { name: 'Step Pattern', notes: [294, 330, 349, 392] },   // D E F G
  { name: 'Fifth Jump', notes: [262, 392, 330, 392] },     // C G E G
  { name: 'Triad', notes: [262, 330, 392, 330] }           // C E G E
];

/**
 * Get mode by ID
 */
export function getModeById(modeId: string): GameMode | undefined {
  return EXPRESSION_MODES.find(mode => mode.id === modeId);
}

/**
 * Get difficulty configuration for a mode at a specific level
 */
export function getDifficultyForMode(modeId: string, level: number): DifficultyLevel | undefined {
  const difficulties = DIFFICULTY_CURVES[modeId];
  if (!difficulties) return undefined;
  
  return difficulties.find(d => d.level === level) || difficulties[0];
}

/**
 * Get maximum difficulty level for a mode
 */
export function getMaxDifficultyForMode(modeId: string): number {
  const difficulties = DIFFICULTY_CURVES[modeId];
  return difficulties ? difficulties.length : 1;
}

/**
 * Get articulation style info
 */
export function getArticulationInfo(articulation: string) {
  return ARTICULATION_STYLES[articulation as keyof typeof ARTICULATION_STYLES];
}

/**
 * Get interpretation info for a phrasing style
 */
export function getInterpretationInfo(phrasing: string) {
  return INTERPRETATIONS[phrasing as keyof typeof INTERPRETATIONS];
}

/**
 * Get a random musical phrase
 */
export function getRandomPhrase(): number[] {
  const phrase = MUSICAL_PHRASES[Math.floor(Math.random() * MUSICAL_PHRASES.length)];
  return phrase.notes;
}
