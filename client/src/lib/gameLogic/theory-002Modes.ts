/**
 * Theory-002 Mode Definitions
 * Scale Builder - Multi-mode scale identification and construction game
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
    // All scales mode
    scaleTypes?: string[];
    scaleCount?: number;
    includeModes?: boolean;
    includePentatonics?: boolean;
    
    // Exotic scales mode
    exoticTypes?: string[];
    complexity?: number;
    includeExoticModes?: boolean;
    includeSymmetrical?: boolean;
  };
}

export const THEORY_MODES: GameMode[] = [
  {
    id: "all-scales",
    name: "All Scales",
    description: "Master major, minor, pentatonic, and blues scales through identification and construction",
    icon: "🎵",
    color: "bg-blue-500",
    ageRange: "7-12 years",
    difficulty: "medium",
    maxRounds: 15,
    maxDifficulty: 3,
    instructions: "Listen to or identify the scale being played and select the correct answer."
  },
  {
    id: "exotic",
    name: "Exotic Scales",
    description: "Explore harmonic minor, melodic minor, whole tone, and diminished scales",
    icon: "🌟",
    color: "bg-purple-500",
    ageRange: "9-12 years",
    difficulty: "hard",
    maxRounds: 12,
    maxDifficulty: 3,
    instructions: "Identify advanced and exotic scales from around the world."
  }
];

// Common scales
export const COMMON_SCALES = {
  // Major scales
  'C-major': {
    name: 'C Major',
    type: 'major',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 1,
    description: 'The standard major scale'
  },
  'G-major': {
    name: 'G Major',
    type: 'major',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 1,
    description: 'Major scale with one sharp'
  },
  'D-major': {
    name: 'D Major',
    type: 'major',
    notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 2,
    description: 'Major scale with two sharps'
  },
  'F-major': {
    name: 'F Major',
    type: 'major',
    notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 2,
    description: 'Major scale with one flat'
  },
  
  // Minor scales
  'A-minor': {
    name: 'A Minor',
    type: 'natural-minor',
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 1,
    description: 'The natural minor scale'
  },
  'E-minor': {
    name: 'E Minor',
    type: 'natural-minor',
    notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 2,
    description: 'Natural minor scale with one sharp'
  },
  'D-minor': {
    name: 'D Minor',
    type: 'natural-minor',
    notes: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 2,
    description: 'Natural minor scale with one flat'
  },
  
  // Pentatonic scales
  'C-major-pentatonic': {
    name: 'C Major Pentatonic',
    type: 'major-pentatonic',
    notes: ['C', 'D', 'E', 'G', 'A'],
    intervals: [0, 2, 4, 7, 9],
    difficulty: 1,
    description: 'Five-note major scale'
  },
  'A-minor-pentatonic': {
    name: 'A Minor Pentatonic',
    type: 'minor-pentatonic',
    notes: ['A', 'C', 'D', 'E', 'G'],
    intervals: [0, 3, 5, 7, 10],
    difficulty: 1,
    description: 'Five-note minor scale'
  },
  
  // Blues scales
  'C-blues': {
    name: 'C Blues',
    type: 'blues',
    notes: ['C', 'Eb', 'F', 'Gb', 'G', 'Bb'],
    intervals: [0, 3, 5, 6, 7, 10],
    difficulty: 2,
    description: 'Six-note blues scale'
  },
  'A-blues': {
    name: 'A Blues',
    type: 'blues',
    notes: ['A', 'C', 'D', 'Eb', 'E', 'G'],
    intervals: [0, 3, 5, 6, 7, 10],
    difficulty: 2,
    description: 'Six-note blues scale'
  }
};

// Exotic scales
export const EXOTIC_SCALES = {
  // Harmonic minor
  'A-harmonic-minor': {
    name: 'A Harmonic Minor',
    type: 'harmonic-minor',
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G#'],
    intervals: [0, 2, 3, 5, 7, 8, 11],
    difficulty: 2,
    description: 'Natural minor with raised seventh'
  },
  'E-harmonic-minor': {
    name: 'E Harmonic Minor',
    type: 'harmonic-minor',
    notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D#'],
    intervals: [0, 2, 3, 5, 7, 8, 11],
    difficulty: 3,
    description: 'Natural minor with raised seventh'
  },
  
  // Melodic minor
  'A-melodic-minor': {
    name: 'A Melodic Minor',
    type: 'melodic-minor',
    notes: ['A', 'B', 'C', 'D', 'E', 'F#', 'G#'],
    intervals: [0, 2, 3, 5, 7, 9, 11],
    difficulty: 3,
    description: 'Minor with raised sixth and seventh ascending'
  },
  
  // Whole tone
  'C-whole-tone': {
    name: 'C Whole Tone',
    type: 'whole-tone',
    notes: ['C', 'D', 'E', 'F#', 'G#', 'A#'],
    intervals: [0, 2, 4, 6, 8, 10],
    difficulty: 2,
    description: 'Six-note symmetrical scale'
  },
  
  // Diminished
  'C-diminished': {
    name: 'C Diminished',
    type: 'diminished',
    notes: ['C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B'],
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    difficulty: 3,
    description: 'Eight-note symmetrical scale'
  },
  
  // Modes
  'D-dorian': {
    name: 'D Dorian',
    type: 'dorian',
    notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
    intervals: [0, 2, 3, 5, 7, 9, 10],
    difficulty: 2,
    description: 'Second mode of major scale'
  },
  'E-phrygian': {
    name: 'E Phrygian',
    type: 'phrygian',
    notes: ['E', 'F', 'G', 'A', 'B', 'C', 'D'],
    intervals: [0, 1, 3, 5, 7, 8, 10],
    difficulty: 2,
    description: 'Third mode of major scale'
  },
  'F-lydian': {
    name: 'F Lydian',
    type: 'lydian',
    notes: ['F', 'G', 'A', 'B', 'C', 'D', 'E'],
    intervals: [0, 2, 4, 6, 7, 9, 11],
    difficulty: 2,
    description: 'Fourth mode of major scale'
  },
  'G-mixolydian': {
    name: 'G Mixolydian',
    type: 'mixolydian',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
    intervals: [0, 2, 4, 5, 7, 9, 10],
    difficulty: 2,
    description: 'Fifth mode of major scale'
  },
  
  // Other exotic scales
  'C-enigmatic': {
    name: 'C Enigmatic',
    type: 'enigmatic',
    notes: ['C', 'Db', 'E', 'F#', 'G', 'Bb', 'B'],
    intervals: [0, 1, 4, 6, 7, 10, 11],
    difficulty: 3,
    description: 'Rare and mysterious scale'
  }
};

// Note frequencies (relative to C4 = 261.63 Hz)
export const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C': 261.63,
  'C#': 277.18,
  'Db': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'Bb': 466.16,
  'B': 493.88
};

// Difficulty curves for each mode
export const DIFFICULTY_CURVES = {
  'all-scales': [
    {
      level: 1,
      parameters: {
        scaleTypes: ['C-major', 'G-major', 'A-minor', 'C-major-pentatonic', 'A-minor-pentatonic'],
        scaleCount: 5,
        includeModes: false,
        includePentatonics: true
      }
    },
    {
      level: 2,
      parameters: {
        scaleTypes: ['C-major', 'G-major', 'D-major', 'F-major', 'A-minor', 'E-minor', 'D-minor', 'C-major-pentatonic', 'A-minor-pentatonic', 'C-blues'],
        scaleCount: 8,
        includeModes: false,
        includePentatonics: true
      }
    },
    {
      level: 3,
      parameters: {
        scaleTypes: Object.keys(COMMON_SCALES),
        scaleCount: 12,
        includeModes: true,
        includePentatonics: true
      }
    }
  ],
  'exotic': [
    {
      level: 1,
      parameters: {
        exoticTypes: ['A-harmonic-minor', 'C-whole-tone', 'D-dorian'],
        complexity: 2,
        includeModes: true,
        includeSymmetrical: true
      }
    },
    {
      level: 2,
      parameters: {
        exoticTypes: ['A-harmonic-minor', 'E-harmonic-minor', 'A-melodic-minor', 'C-whole-tone', 'C-diminished', 'D-dorian', 'G-mixolydian'],
        complexity: 3,
        includeModes: true,
        includeSymmetrical: true
      }
    },
    {
      level: 3,
      parameters: {
        exoticTypes: Object.keys(EXOTIC_SCALES),
        complexity: 4,
        includeModes: true,
        includeSymmetrical: true
      }
    }
  ]
};

// Helper functions
export function getModeById(modeId: string): GameMode | undefined {
  return THEORY_MODES.find(mode => mode.id === modeId);
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

export function getCommonScaleById(id: string): typeof COMMON_SCALES[keyof typeof COMMON_SCALES] | undefined {
  return COMMON_SCALES[id as keyof typeof COMMON_SCALES];
}

export function getExoticScaleById(id: string): typeof EXOTIC_SCALES[keyof typeof EXOTIC_SCALES] | undefined {
  return EXOTIC_SCALES[id as keyof typeof EXOTIC_SCALES];
}

export function getScaleById(id: string): typeof COMMON_SCALES[keyof typeof COMMON_SCALES] | typeof EXOTIC_SCALES[keyof typeof EXOTIC_SCALES] | undefined {
  return getCommonScaleById(id) || getExoticScaleById(id);
}

export function getNoteFrequency(note: string): number {
  return NOTE_FREQUENCIES[note] || 440; // Default to A4
}

export function getScaleFrequencies(scaleId: string, rootFreq: number = 261.63): number[] {
  const scale = getScaleById(scaleId);
  if (!scale) return [];
  
  // Find the root note frequency
  const rootNote = scale.notes[0];
  const actualRootFreq = getNoteFrequency(rootNote);
  
  return scale.intervals.map(interval => 
    actualRootFreq * Math.pow(2, interval / 12)
  );
}