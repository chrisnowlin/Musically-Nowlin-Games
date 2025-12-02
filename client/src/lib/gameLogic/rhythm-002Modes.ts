/**
 * Rhythm-002 Mode Definitions
 * Tempo & Pulse Master - Multi-mode tempo and pulse training game
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
    // Tempo changes mode
    tempoRange?: [number, number]; // BPM range
    tempoChangeTypes?: string[];
    tempoChangeAmount?: number;

    // Pulse subdivisions mode
    subdivisionTypes?: string[];
    beatsPerMeasure?: number[];
    subdivisionComplexity?: number;

    // Analysis mode
    analysisTypes?: string[];
    patternLength?: number;
    syncComplexity?: number;
  };
}

export const RHYTHM_MODES: GameMode[] = [
  {
    id: "tempo-changes",
    name: "Tempo Changes",
    description: "Master tempo recognition and identify changes in musical speed",
    icon: "⏱️",
    color: "bg-orange-500",
    ageRange: "6-10 years",
    difficulty: "easy",
    maxRounds: 15,
    maxDifficulty: 3,
    instructions: "Listen to the tempo and identify if it speeds up, slows down, or stays the same."
  },
  {
    id: "pulse-subdivisions",
    name: "Pulse Subdivisions",
    description: "Learn to identify and feel different rhythmic subdivisions of the beat",
    icon: "🎵",
    color: "bg-blue-500",
    ageRange: "7-12 years",
    difficulty: "medium",
    maxRounds: 12,
    maxDifficulty: 3,
    instructions: "Identify the subdivision pattern - quarter notes, eighth notes, triplets, or sixteenth notes."
  },
  {
    id: "analysis",
    name: "Rhythm Analysis",
    description: "Analyze complex rhythmic patterns and identify syncopation, polyrhythms, and meters",
    icon: "🔍",
    color: "bg-purple-500",
    ageRange: "9-12 years",
    difficulty: "hard",
    maxRounds: 10,
    maxDifficulty: 3,
    instructions: "Analyze the rhythmic pattern and identify its characteristics."
  }
];

// Tempo definitions
export const TEMPO_MARKINGS = {
  largo: { name: 'Largo', bpm: 45, range: [40, 50], description: 'Very slow' },
  adagio: { name: 'Adagio', bpm: 65, range: [55, 75], description: 'Slow' },
  andante: { name: 'Andante', bpm: 85, range: [76, 95], description: 'Walking pace' },
  moderato: { name: 'Moderato', bpm: 105, range: [96, 115], description: 'Moderate' },
  allegro: { name: 'Allegro', bpm: 130, range: [116, 145], description: 'Fast' },
  presto: { name: 'Presto', bpm: 170, range: [146, 200], description: 'Very fast' }
};

export const TEMPO_CHANGE_TYPES = {
  'steady': { name: 'Steady', description: 'Tempo remains constant', direction: 'steady' },
  'accelerando': { name: 'Accelerando', description: 'Gradually getting faster', direction: 'faster' },
  'ritardando': { name: 'Ritardando', description: 'Gradually getting slower', direction: 'slower' },
  'a-tempo': { name: 'A Tempo', description: 'Return to original tempo', direction: 'steady' },
  'rubato': { name: 'Rubato', description: 'Flexible tempo', direction: 'flexible' },
  'fermata': { name: 'Fermata', description: 'Hold/pause', direction: 'pause' }
};

// Subdivision patterns
export const SUBDIVISION_PATTERNS = {
  'quarter': {
    name: 'Quarter Notes',
    symbol: '♩',
    divisionsPerBeat: 1,
    description: 'One note per beat',
    difficulty: 1,
    sound: 'simple'
  },
  'eighth': {
    name: 'Eighth Notes',
    symbol: '♪',
    divisionsPerBeat: 2,
    description: 'Two notes per beat',
    difficulty: 1,
    sound: 'steady'
  },
  'triplet': {
    name: 'Triplets',
    symbol: '♪₃',
    divisionsPerBeat: 3,
    description: 'Three notes per beat',
    difficulty: 2,
    sound: 'swing'
  },
  'sixteenth': {
    name: 'Sixteenth Notes',
    symbol: '♬',
    divisionsPerBeat: 4,
    description: 'Four notes per beat',
    difficulty: 2,
    sound: 'fast'
  },
  'quintuplet': {
    name: 'Quintuplets',
    symbol: '♪₅',
    divisionsPerBeat: 5,
    description: 'Five notes per beat',
    difficulty: 3,
    sound: 'complex'
  },
  'sextuplet': {
    name: 'Sextuplets',
    symbol: '♪₆',
    divisionsPerBeat: 6,
    description: 'Six notes per beat',
    difficulty: 3,
    sound: 'flowing'
  }
};

// Time signatures
export const TIME_SIGNATURES = {
  '4/4': { name: 'Common Time', beatsPerMeasure: 4, beatValue: 4, description: 'Four quarter-note beats', difficulty: 1 },
  '3/4': { name: 'Waltz Time', beatsPerMeasure: 3, beatValue: 4, description: 'Three quarter-note beats', difficulty: 1 },
  '2/4': { name: 'March Time', beatsPerMeasure: 2, beatValue: 4, description: 'Two quarter-note beats', difficulty: 1 },
  '6/8': { name: 'Compound Duple', beatsPerMeasure: 6, beatValue: 8, description: 'Six eighth-note beats', difficulty: 2 },
  '5/4': { name: 'Irregular Five', beatsPerMeasure: 5, beatValue: 4, description: 'Five quarter-note beats', difficulty: 3 },
  '7/8': { name: 'Irregular Seven', beatsPerMeasure: 7, beatValue: 8, description: 'Seven eighth-note beats', difficulty: 3 }
};

// Rhythm analysis concepts
export const RHYTHM_CONCEPTS = {
  'syncopation': {
    name: 'Syncopation',
    description: 'Emphasis on weak beats or off-beats',
    difficulty: 2,
    example: [1, 0, 1, 0.5, 0.5, 1]
  },
  'polyrhythm': {
    name: 'Polyrhythm',
    description: 'Two or more conflicting rhythms played simultaneously',
    difficulty: 3,
    example: [[1, 1, 1], [1, 1]]
  },
  'hemiola': {
    name: 'Hemiola',
    description: 'Rhythm that alternates between 3/2 and 6/4',
    difficulty: 3,
    example: [1, 1, 1, 1.5, 1.5]
  },
  'dotted': {
    name: 'Dotted Rhythm',
    description: 'Long-short pattern created by dots',
    difficulty: 2,
    example: [1.5, 0.5, 1.5, 0.5]
  },
  'upbeat': {
    name: 'Upbeat/Anacrusis',
    description: 'Notes that occur before the first strong beat',
    difficulty: 2,
    example: [0.5, 1, 1, 1, 0.5]
  }
};

// Difficulty curve settings
export const DIFFICULTY_CURVES: Record<string, DifficultySettings[]> = {
  'tempo-changes': [
    {
      level: 1,
      parameters: {
        tempoRange: [80, 120],
        tempoChangeTypes: ['steady', 'accelerando', 'ritardando'],
        tempoChangeAmount: 10
      }
    },
    {
      level: 2,
      parameters: {
        tempoRange: [60, 140],
        tempoChangeTypes: ['steady', 'accelerando', 'ritardando', 'a-tempo'],
        tempoChangeAmount: 20
      }
    },
    {
      level: 3,
      parameters: {
        tempoRange: [40, 180],
        tempoChangeTypes: ['steady', 'accelerando', 'ritardando', 'a-tempo', 'rubato'],
        tempoChangeAmount: 30
      }
    }
  ],
  'pulse-subdivisions': [
    {
      level: 1,
      parameters: {
        subdivisionTypes: ['quarter', 'eighth'],
        beatsPerMeasure: [4],
        subdivisionComplexity: 1
      }
    },
    {
      level: 2,
      parameters: {
        subdivisionTypes: ['quarter', 'eighth', 'triplet', 'sixteenth'],
        beatsPerMeasure: [3, 4],
        subdivisionComplexity: 2
      }
    },
    {
      level: 3,
      parameters: {
        subdivisionTypes: ['quarter', 'eighth', 'triplet', 'sixteenth', 'quintuplet', 'sextuplet'],
        beatsPerMeasure: [2, 3, 4, 6],
        subdivisionComplexity: 3
      }
    }
  ],
  'analysis': [
    {
      level: 1,
      parameters: {
        analysisTypes: ['dotted', 'upbeat'],
        patternLength: 4,
        syncComplexity: 1
      }
    },
    {
      level: 2,
      parameters: {
        analysisTypes: ['dotted', 'upbeat', 'syncopation'],
        patternLength: 8,
        syncComplexity: 2
      }
    },
    {
      level: 3,
      parameters: {
        analysisTypes: ['dotted', 'upbeat', 'syncopation', 'polyrhythm', 'hemiola'],
        patternLength: 12,
        syncComplexity: 3
      }
    }
  ]
};

// Helper functions
export const getModeById = (modeId: string): GameMode | undefined => {
  return RHYTHM_MODES.find(mode => mode.id === modeId);
};

export const getDifficultyForMode = (modeId: string, level: number): DifficultySettings | undefined => {
  const curve = DIFFICULTY_CURVES[modeId];
  if (!curve) return undefined;
  return curve.find(d => d.level === level) || curve[0];
};

export const getTempoByBPM = (bpm: number): string => {
  for (const [key, tempo] of Object.entries(TEMPO_MARKINGS)) {
    if (bpm >= tempo.range[0] && bpm <= tempo.range[1]) {
      return key;
    }
  }
  return 'moderato';
};

export const getSubdivisionByDifficulty = (difficulty: number): string[] => {
  return Object.entries(SUBDIVISION_PATTERNS)
    .filter(([_, pattern]) => pattern.difficulty <= difficulty)
    .map(([key, _]) => key);
};

export const getRandomTempo = (range: [number, number]): number => {
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
};

export const generateTempoChange = (
  startTempo: number,
  changeType: string,
  duration: number
): number[] => {
  const tempos: number[] = [];
  const steps = 8;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    let tempo = startTempo;

    switch (changeType) {
      case 'accelerando':
        tempo = startTempo + (progress * 30);
        break;
      case 'ritardando':
        tempo = startTempo - (progress * 30);
        break;
      case 'rubato':
        tempo = startTempo + Math.sin(progress * Math.PI * 2) * 10;
        break;
      default:
        tempo = startTempo;
    }

    tempos.push(Math.round(tempo));
  }

  return tempos;
};

export const generateSubdivisionPattern = (
  subdivisionType: string,
  measures: number,
  beatsPerMeasure: number
): number[] => {
  const pattern = SUBDIVISION_PATTERNS[subdivisionType as keyof typeof SUBDIVISION_PATTERNS];
  if (!pattern) return [];

  const totalBeats = measures * beatsPerMeasure;
  const notesPerBeat = pattern.divisionsPerBeat;
  const totalNotes = totalBeats * notesPerBeat;

  return Array(totalNotes).fill(1);
};
