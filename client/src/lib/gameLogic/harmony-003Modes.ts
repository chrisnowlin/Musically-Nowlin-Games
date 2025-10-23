/**
 * Harmony-003 Mode Definitions
 * Harmonic Progression Master - Multi-mode harmonic progression and chord analysis game
 */

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ageRange: string;
  difficulty: "easy" | "medium" | "hard";
  maxRounds: number;
  maxDifficulty: number;
  instructions: string;
}

export interface DifficultySettings {
  level: number;
  parameters: {
    // Progressions mode
    progressionTypes?: string[];
    chordCount?: number;
    includeSecondaryDominants?: boolean;
    includeModulations?: boolean;
    
    // Features mode
    features?: string[];
    featureCount?: number;
    includeAdvancedFeatures?: boolean;
    
    // Rhythm mode
    rhythmPatterns?: string[];
    timeSignatures?: string[];
    complexity?: number;
  };
}

export const HARMONY_MODES: GameMode[] = [
  {
    id: "progressions",
    name: "Chord Progressions",
    description: "Identify and analyze common chord progressions and harmonic patterns",
    icon: "🎼",
    color: "bg-green-500",
    ageRange: "8-12 years",
    difficulty: "medium",
    maxRounds: 12,
    maxDifficulty: 3,
    instructions: "Listen to the chord progression and select the correct harmonic pattern."
  },
  {
    id: "features",
    name: "Harmonic Features",
    description: "Identify specific harmonic features like cadences, modulations, and secondary dominants",
    icon: "🎹",
    color: "bg-blue-500",
    ageRange: "9-12 years",
    difficulty: "medium",
    maxRounds: 15,
    maxDifficulty: 3,
    instructions: "Listen carefully and identify the specific harmonic feature being demonstrated."
  },
  {
    id: "rhythm",
    name: "Harmonic Rhythm",
    description: "Analyze the rhythm of chord changes and harmonic motion",
    icon: "🥁",
    color: "bg-purple-500",
    ageRange: "8-12 years",
    difficulty: "medium",
    maxRounds: 10,
    maxDifficulty: 3,
    instructions: "Identify the harmonic rhythm pattern - how often the chords change."
  }
];

// Common chord progressions
export const CHORD_PROGRESSIONS = {
  // Basic progressions
  'I-V-vi-IV': {
    name: 'Pop Progression',
    description: 'The most common pop progression',
    chords: ['I', 'V', 'vi', 'IV'],
    difficulty: 1
  },
  'I-IV-V': {
    name: 'Three-Chord Trick',
    description: 'Classic blues and folk progression',
    chords: ['I', 'IV', 'V'],
    difficulty: 1
  },
  'I-vi-IV-V': {
    name: '50s Progression',
    description: 'Classic 1950s doo-wop progression',
    chords: ['I', 'vi', 'IV', 'V'],
    difficulty: 1
  },
  'ii-V-I': {
    name: 'Jazz Cadence',
    description: 'Fundamental jazz progression',
    chords: ['ii', 'V', 'I'],
    difficulty: 2
  },
  'I-IV-viio-V': {
    description: 'Classical cadence',
    chords: ['I', 'IV', 'viio', 'V'],
    difficulty: 2
  },
  'I-vi-ii-V': {
    name: 'Turnaround',
    description: 'Common jazz turnaround',
    chords: ['I', 'vi', 'ii', 'V'],
    difficulty: 2
  },
  // Advanced progressions
  'I-V-vi-iii-IV-I-IV-V': {
    name: 'Extended Pop',
    description: 'Extended pop progression with subdominant',
    chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    difficulty: 3
  },
  'I-IV-viio-iii-vi-ii-V-I': {
    name: 'Circle Progression',
    description: 'Circle of fifths progression',
    chords: ['I', 'IV', 'viio', 'iii', 'vi', 'ii', 'V', 'I'],
    difficulty: 3
  }
};

// Harmonic features
export const HARMONIC_FEATURES = {
  'authentic-cadence': {
    name: 'Authentic Cadence',
    description: 'V-I perfect cadence',
    difficulty: 1
  },
  'half-cadence': {
    name: 'Half Cadence',
    description: 'Ends on V chord',
    difficulty: 1
  },
  'plagal-cadence': {
    name: 'Plagal Cadence',
    description: 'IV-I "Amen" cadence',
    difficulty: 1
  },
  'deceptive-cadence': {
    name: 'Deceptive Cadence',
    description: 'V-vi deceptive resolution',
    difficulty: 2
  },
  'secondary-dominant': {
    name: 'Secondary Dominant',
    description: 'V/V leading to V',
    difficulty: 2
  },
  'modulation': {
    name: 'Modulation',
    description: 'Key change to related key',
    difficulty: 3
  },
  'borrowed-chord': {
    name: 'Borrowed Chord',
    description: 'Chord from parallel key',
    difficulty: 3
  },
  'augmented-sixth': {
    name: 'Augmented Sixth',
    description: 'Ger+6 or It+6 chord',
    difficulty: 3
  }
};

// Harmonic rhythm patterns
export const HARMONIC_RHYTHMS = {
  'one-per-measure': {
    name: 'One Chord Per Measure',
    description: 'Slow harmonic rhythm',
    pattern: [1],
    difficulty: 1
  },
  'two-per-measure': {
    name: 'Two Chords Per Measure',
    description: 'Moderate harmonic rhythm',
    pattern: [2],
    difficulty: 1
  },
  'four-per-measure': {
    name: 'Four Chords Per Measure',
    description: 'Fast harmonic rhythm',
    pattern: [4],
    difficulty: 2
  },
  'changing-pattern': {
    name: 'Changing Pattern',
    description: 'Variable harmonic rhythm',
    pattern: [1, 2, 4, 2],
    difficulty: 2
  },
  'syncopated': {
    name: 'Syncopated Rhythm',
    description: 'Off-beat chord changes',
    pattern: [3, 1],
    difficulty: 3
  },
  'complex-pattern': {
    name: 'Complex Pattern',
    description: 'Mixed rhythmic patterns',
    pattern: [2, 3, 1, 4],
    difficulty: 3
  }
};

// Chord definitions with frequencies (relative to root)
export const CHORDS = {
  'I': { name: 'Tonic', notes: [0, 4, 7], quality: 'major' },
  'ii': { name: 'Supertonic', notes: [2, 5, 9], quality: 'minor' },
  'iii': { name: 'Mediant', notes: [4, 7, 11], quality: 'minor' },
  'IV': { name: 'Subdominant', notes: [5, 9, 0], quality: 'major' },
  'V': { name: 'Dominant', notes: [7, 11, 2], quality: 'major' },
  'vi': { name: 'Submediant', notes: [9, 0, 4], quality: 'minor' },
  'viio': { name: 'Leading Tone', notes: [11, 2, 5], quality: 'diminished' }
};

// Difficulty curves for each mode
export const DIFFICULTY_CURVES = {
  progressions: [
    {
      level: 1,
      parameters: {
        progressionTypes: ['I-V-vi-IV', 'I-IV-V', 'I-vi-IV-V'],
        chordCount: 4,
        includeSecondaryDominants: false,
        includeModulations: false
      }
    },
    {
      level: 2,
      parameters: {
        progressionTypes: ['I-V-vi-IV', 'I-IV-V', 'I-vi-IV-V', 'ii-V-I', 'I-IV-viio-V'],
        chordCount: 6,
        includeSecondaryDominants: true,
        includeModulations: false
      }
    },
    {
      level: 3,
      parameters: {
        progressionTypes: Object.keys(CHORD_PROGRESSIONS),
        chordCount: 8,
        includeSecondaryDominants: true,
        includeModulations: true
      }
    }
  ],
  features: [
    {
      level: 1,
      parameters: {
        features: ['authentic-cadence', 'half-cadence', 'plagal-cadence'],
        featureCount: 2,
        includeAdvancedFeatures: false
      }
    },
    {
      level: 2,
      parameters: {
        features: ['authentic-cadence', 'half-cadence', 'plagal-cadence', 'deceptive-cadence', 'secondary-dominant'],
        featureCount: 3,
        includeAdvancedFeatures: true
      }
    },
    {
      level: 3,
      parameters: {
        features: Object.keys(HARMONIC_FEATURES),
        featureCount: 4,
        includeAdvancedFeatures: true
      }
    }
  ],
  rhythm: [
    {
      level: 1,
      parameters: {
        rhythmPatterns: ['one-per-measure', 'two-per-measure'],
        timeSignatures: ['4/4'],
        complexity: 1
      }
    },
    {
      level: 2,
      parameters: {
        rhythmPatterns: ['one-per-measure', 'two-per-measure', 'four-per-measure', 'changing-pattern'],
        timeSignatures: ['4/4', '3/4'],
        complexity: 2
      }
    },
    {
      level: 3,
      parameters: {
        rhythmPatterns: Object.keys(HARMONIC_RHYTHMS),
        timeSignatures: ['4/4', '3/4', '6/8'],
        complexity: 3
      }
    }
  ]
};

// Helper functions
export function getModeById(modeId: string): GameMode | undefined {
  return HARMONY_MODES.find(mode => mode.id === modeId);
}

export function getMaxDifficultyForMode(modeId: string): number {
  const mode = getModeById(modeId);
  return mode?.maxDifficulty || 3;
}

export function getDifficultyForMode(modeId: string, difficulty: number): DifficultySettings | undefined {
  const curves = DIFFICULTY_CURVES[modeId as keyof typeof DIFFICULTY_CURVES];
  if (!curves) return undefined;
  
  return curves.find(curve => curve.level === difficulty) || curves[0];
}

export function getProgressionById(id: string): typeof CHORD_PROGRESSIONS[keyof typeof CHORD_PROGRESSIONS] | undefined {
  return CHORD_PROGRESSIONS[id as keyof typeof CHORD_PROGRESSIONS];
}

export function getFeatureById(id: string): typeof HARMONIC_FEATURES[keyof typeof HARMONIC_FEATURES] | undefined {
  return HARMONIC_FEATURES[id as keyof typeof HARMONIC_FEATURES];
}

export function getRhythmById(id: string): typeof HARMONIC_RHYTHMS[keyof typeof HARMONIC_RHYTHMS] | undefined {
  return HARMONIC_RHYTHMS[id as keyof typeof HARMONIC_RHYTHMS];
}

export function getChordBySymbol(symbol: string): typeof CHORDS[keyof typeof CHORDS] | undefined {
  return CHORDS[symbol as keyof typeof CHORDS];
}