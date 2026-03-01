/**
 * Theory-003 Mode Definitions
 * Chord Builder - Multi-mode chord construction and identification game
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
    // All chords mode
    chordTypes?: string[];
    chordCount?: number;
    includeTriads?: boolean;
    includeSevenths?: boolean;
    
    // Complex mode
    complexTypes?: string[];
    complexity?: number;
    includeExtended?: boolean;
    includeAltered?: boolean;
  };
}

export const CHORD_BUILDER_MODES: GameMode[] = [
  {
    id: "all-chords",
    name: "All Chords",
    description: "Master basic chord construction including triads and seventh chords",
    icon: "🎹",
    color: "bg-green-500",
    ageRange: "7-10 years",
    difficulty: "easy",
    maxRounds: 12,
    maxDifficulty: 3,
    instructions: "Listen to or identify the chord being played and build the correct chord."
  },
  {
    id: "complex",
    name: "Complex Chords",
    description: "Explore extended and altered chords including 9ths, 11ths, 13ths, and advanced harmonies",
    icon: "🎸",
    color: "bg-purple-500",
    ageRange: "10-12 years",
    difficulty: "hard",
    maxRounds: 10,
    maxDifficulty: 3,
    instructions: "Identify and construct complex extended chords with advanced harmonies."
  }
];

// Basic chord definitions
export const BASIC_CHORDS = {
  // Major triads
  'C-major': {
    name: 'C Major Triad',
    type: 'major-triad',
    notes: ['C', 'E', 'G'],
    intervals: [0, 4, 7],
    difficulty: 1,
    description: 'Happy, bright sounding triad'
  },
  'G-major': {
    name: 'G Major Triad',
    type: 'major-triad',
    notes: ['G', 'B', 'D'],
    intervals: [0, 4, 7],
    difficulty: 1,
    description: 'Bright triad, common in folk music'
  },
  'F-major': {
    name: 'F Major Triad',
    type: 'major-triad',
    notes: ['F', 'A', 'C'],
    intervals: [0, 4, 7],
    difficulty: 1,
    description: 'Warm, stable major triad'
  },
  
  // Minor triads
  'A-minor': {
    name: 'A Minor Triad',
    type: 'minor-triad',
    notes: ['A', 'C', 'E'],
    intervals: [0, 3, 7],
    difficulty: 1,
    description: 'Sad, gentle sounding triad'
  },
  'E-minor': {
    name: 'E Minor Triad',
    type: 'minor-triad',
    notes: ['E', 'G', 'B'],
    intervals: [0, 3, 7],
    difficulty: 1,
    description: 'Dark, emotional minor triad'
  },
  'D-minor': {
    name: 'D Minor Triad',
    type: 'minor-triad',
    notes: ['D', 'F', 'A'],
    intervals: [0, 3, 7],
    difficulty: 2,
    description: 'Melancholic minor triad'
  },
  
  // Diminished and augmented triads
  'C-diminished': {
    name: 'C Diminished Triad',
    type: 'diminished-triad',
    notes: ['C', 'Eb', 'Gb'],
    intervals: [0, 3, 6],
    difficulty: 2,
    description: 'Tense, unstable triad'
  },
  'C-augmented': {
    name: 'C Augmented Triad',
    type: 'augmented-triad',
    notes: ['C', 'E', 'G#'],
    intervals: [0, 4, 8],
    difficulty: 2,
    description: 'Dreamy, unresolved triad'
  },
  
  // Seventh chords
  'C-major7': {
    name: 'C Major 7th',
    type: 'major-seventh',
    notes: ['C', 'E', 'G', 'B'],
    intervals: [0, 4, 7, 11],
    difficulty: 2,
    description: 'Jazz-like, sophisticated major chord'
  },
  'G-dominant7': {
    name: 'G Dominant 7th',
    type: 'dominant-seventh',
    notes: ['G', 'B', 'D', 'F'],
    intervals: [0, 4, 7, 10],
    difficulty: 2,
    description: 'Bluesy, needs resolution'
  },
  'A-minor7': {
    name: 'A Minor 7th',
    type: 'minor-seventh',
    notes: ['A', 'C', 'E', 'G'],
    intervals: [0, 3, 7, 10],
    difficulty: 2,
    description: 'Smooth, jazzy minor chord'
  },
  'C-diminished7': {
    name: 'C Diminished 7th',
    type: 'diminished-seventh',
    notes: ['C', 'Eb', 'Gb', 'Bbb'],
    intervals: [0, 3, 6, 9],
    difficulty: 3,
    description: 'Very tense, dramatic chord'
  }
};

// Complex chord definitions
export const COMPLEX_CHORDS = {
  // Extended chords
  'C-major9': {
    name: 'C Major 9th',
    type: 'major-ninth',
    notes: ['C', 'E', 'G', 'B', 'D'],
    intervals: [0, 4, 7, 11, 14],
    difficulty: 3,
    description: 'Rich, lush extended major chord'
  },
  'G-dominant9': {
    name: 'G Dominant 9th',
    type: 'dominant-ninth',
    notes: ['G', 'B', 'D', 'F', 'A'],
    intervals: [0, 4, 7, 10, 14],
    difficulty: 3,
    description: 'Full blues dominant chord'
  },
  'A-minor9': {
    name: 'A Minor 9th',
    type: 'minor-ninth',
    notes: ['A', 'C', 'E', 'G', 'B'],
    intervals: [0, 3, 7, 10, 14],
    difficulty: 3,
    description: 'Sophisticated minor chord'
  },
  'C-major11': {
    name: 'C Major 11th',
    type: 'major-eleventh',
    notes: ['C', 'E', 'G', 'B', 'D', 'F'],
    intervals: [0, 4, 7, 11, 14, 17],
    difficulty: 4,
    description: 'Complex, spacious major chord'
  },
  'G-dominant13': {
    name: 'G Dominant 13th',
    type: 'dominant-thirteenth',
    notes: ['G', 'B', 'D', 'F', 'A', 'C', 'E'],
    intervals: [0, 4, 7, 10, 14, 17, 21],
    difficulty: 4,
    description: 'Ultimate jazz dominant chord'
  },
  
  // Altered chords
  'C-augmented7': {
    name: 'C Augmented 7th',
    type: 'augmented-seventh',
    notes: ['C', 'E', 'G#', 'Bb'],
    intervals: [0, 4, 8, 10],
    difficulty: 4,
    description: 'Tense augmented dominant'
  },
  'G-altered-dominant': {
    name: 'G Altered Dominant',
    type: 'altered-dominant',
    notes: ['G', 'B', 'Db', 'Eb', 'F', 'Ab'],
    intervals: [0, 4, 6, 8, 10, 13],
    difficulty: 5,
    description: 'Jazz altered dominant chord'
  },
  
  // Suspended chords
  'C-suspended4': {
    name: 'C Suspended 4th',
    type: 'suspended-fourth',
    notes: ['C', 'F', 'G'],
    intervals: [0, 5, 7],
    difficulty: 2,
    description: 'Unresolved, modern sound'
  },
  'G-suspended2': {
    name: 'G Suspended 2nd',
    type: 'suspended-second',
    notes: ['G', 'A', 'D'],
    intervals: [0, 2, 7],
    difficulty: 2,
    description: 'Open, suspended sound'
  },
  
  // Add chords
  'C-add2': {
    name: 'C Add 2',
    type: 'add-second',
    notes: ['C', 'D', 'E', 'G'],
    intervals: [0, 2, 4, 7],
    difficulty: 3,
    description: 'Major chord with added second'
  },
  'C-add6': {
    name: 'C Add 6',
    type: 'add-sixth',
    notes: ['C', 'E', 'G', 'A'],
    intervals: [0, 4, 7, 9],
    difficulty: 3,
    description: 'Major chord with added sixth'
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
  'all-chords': [
    {
      level: 1,
      parameters: {
        chordTypes: ['C-major', 'G-major', 'A-minor', 'E-minor'],
        chordCount: 4,
        includeTriads: true,
        includeSevenths: false
      }
    },
    {
      level: 2,
      parameters: {
        chordTypes: ['C-major', 'G-major', 'F-major', 'A-minor', 'E-minor', 'D-minor', 'C-diminished', 'C-augmented'],
        chordCount: 8,
        includeTriads: true,
        includeSevenths: false
      }
    },
    {
      level: 3,
      parameters: {
        chordTypes: Object.keys(BASIC_CHORDS),
        chordCount: 12,
        includeTriads: true,
        includeSevenths: true
      }
    }
  ],
  'complex': [
    {
      level: 1,
      parameters: {
        complexTypes: ['C-major9', 'G-dominant9', 'A-minor9', 'C-suspended4', 'G-suspended2'],
        complexity: 3,
        includeExtended: true,
        includeAltered: false
      }
    },
    {
      level: 2,
      parameters: {
        complexTypes: ['C-major9', 'G-dominant9', 'A-minor9', 'C-major11', 'G-dominant13', 'C-augmented7', 'C-suspended4', 'G-suspended2', 'C-add2', 'C-add6'],
        complexity: 4,
        includeExtended: true,
        includeAltered: true
      }
    },
    {
      level: 3,
      parameters: {
        complexTypes: Object.keys(COMPLEX_CHORDS),
        complexity: 5,
        includeExtended: true,
        includeAltered: true
      }
    }
  ]
};

// Helper functions
export function getModeById(modeId: string): GameMode | undefined {
  return CHORD_BUILDER_MODES.find(mode => mode.id === modeId);
}

export function getAllModes(): GameMode[] {
  return CHORD_BUILDER_MODES;
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

export function getBasicChordById(id: string): typeof BASIC_CHORDS[keyof typeof BASIC_CHORDS] | undefined {
  return BASIC_CHORDS[id as keyof typeof BASIC_CHORDS];
}

export function getComplexChordById(id: string): typeof COMPLEX_CHORDS[keyof typeof COMPLEX_CHORDS] | undefined {
  return COMPLEX_CHORDS[id as keyof typeof COMPLEX_CHORDS];
}

export function getChordById(id: string): typeof BASIC_CHORDS[keyof typeof BASIC_CHORDS] | typeof COMPLEX_CHORDS[keyof typeof COMPLEX_CHORDS] | undefined {
  return getBasicChordById(id) || getComplexChordById(id);
}

export function getNoteFrequency(note: string): number {
  return NOTE_FREQUENCIES[note] || 440; // Default to A4
}

export function getChordFrequencies(chordId: string, rootFreq: number = 261.63): number[] {
  const chord = getChordById(chordId);
  if (!chord) return [];
  
  // Find the root note frequency
  const rootNote = chord.notes[0];
  const actualRootFreq = getNoteFrequency(rootNote);
  
  return chord.intervals.map(interval => 
    actualRootFreq * Math.pow(2, interval / 12)
  );
}

// Chord names for display
export const CHORD_NAMES = {
  // Basic chords
  'C-major': 'C Major',
  'G-major': 'G Major',
  'F-major': 'F Major',
  'A-minor': 'A Minor',
  'E-minor': 'E Minor',
  'D-minor': 'D Minor',
  'C-diminished': 'C Diminished',
  'C-augmented': 'C Augmented',
  'C-major7': 'C Major 7',
  'G-dominant7': 'G Dominant 7',
  'A-minor7': 'A Minor 7',
  'C-diminished7': 'C Diminished 7',
  
  // Complex chords
  'C-major9': 'C Major 9',
  'G-dominant9': 'G Dominant 9',
  'A-minor9': 'A Minor 9',
  'C-major11': 'C Major 11',
  'G-dominant13': 'G Dominant 13',
  'C-augmented7': 'C Augmented 7',
  'G-altered-dominant': 'G Altered Dominant',
  'C-suspended4': 'C Suspended 4',
  'G-suspended2': 'G Suspended 2',
  'C-add2': 'C Add 2',
  'C-add6': 'C Add 6'
};