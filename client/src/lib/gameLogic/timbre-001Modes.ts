/**
 * Timbre-001 Mode Definitions
 * Instrument Master - Multi-mode timbre and instrument identification game
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
    // Families mode
    families?: string[];
    familyCount?: number;
    
    // Types mode
    types?: string[];
    typeCount?: number;
    includeSimilar?: boolean;
    
    // Specific instruments mode
    instruments?: string[];
    instrumentCount?: number;
    includeRare?: boolean;
    bySound?: boolean;
    byImage?: boolean;
  };
}

export const TIMBRE_MODES: GameMode[] = [
  {
    id: "families",
    name: "Instrument Families",
    description: "Identify instrument families like strings, woodwinds, brass, and percussion",
    icon: "🎻",
    color: "bg-purple-500",
    ageRange: "5-8 years",
    difficulty: "easy",
    maxRounds: 10,
    maxDifficulty: 3,
    instructions: "Listen to the instrument sound and select the correct family it belongs to."
  },
  {
    id: "types",
    name: "Instrument Types",
    description: "Identify specific types within instrument families",
    icon: "🎺",
    color: "bg-blue-500",
    ageRange: "7-10 years",
    difficulty: "medium",
    maxRounds: 12,
    maxDifficulty: 3,
    instructions: "Listen carefully and identify the specific type of instrument being played."
  },
  {
    id: "specific-instruments",
    name: "Specific Instruments",
    description: "Identify individual instruments by sound and appearance",
    icon: "🎸",
    color: "bg-green-500",
    ageRange: "8-12 years",
    difficulty: "hard",
    maxRounds: 15,
    maxDifficulty: 3,
    instructions: "Identify the exact instrument being played. Some may sound similar!"
  }
];

// Instrument families data
export const INSTRUMENT_FAMILIES = {
  strings: {
    name: "Strings",
    description: "Instruments with strings that vibrate",
    examples: ["violin", "viola", "cello", "double bass", "guitar", "harp"],
    color: "bg-amber-600"
  },
  woodwinds: {
    name: "Woodwinds",
    description: "Instruments played by blowing air",
    examples: ["flute", "clarinet", "oboe", "bassoon", "saxophone", "recorder"],
    color: "bg-green-600"
  },
  brass: {
    name: "Brass",
    description: "Metal instruments played with buzzing lips",
    examples: ["trumpet", "trombone", "french horn", "tuba", "cornet", "bugle"],
    color: "bg-yellow-600"
  },
  percussion: {
    name: "Percussion",
    description: "Instruments that are struck or shaken",
    examples: ["drums", "xylophone", "cymbals", "triangle", "tambourine", "maracas"],
    color: "bg-red-600"
  },
  keyboard: {
    name: "Keyboard",
    description: "Instruments played with keys",
    examples: ["piano", "organ", "harpsichord", "synthesizer", "accordion"],
    color: "bg-purple-600"
  },
  electronic: {
    name: "Electronic",
    description: "Electronic and digital instruments",
    examples: ["synthesizer", "drum machine", "theremin", "electric guitar", " sampler"],
    color: "bg-blue-600"
  }
};

// Specific instruments with their properties
export const INSTRUMENTS = {
  // Strings
  violin: {
    family: "strings",
    name: "Violin",
    description: "Highest-pitched string instrument",
    frequency: 440, // A4
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 }
  },
  viola: {
    family: "strings",
    name: "Viola",
    description: "Alto string instrument",
    frequency: 329.63, // E4
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 }
  },
  cello: {
    family: "strings",
    name: "Cello",
    description: "Tenor string instrument",
    frequency: 220, // A3
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 }
  },
  doubleBass: {
    family: "strings",
    name: "Double Bass",
    description: "Lowest-pitched string instrument",
    frequency: 110, // A2
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 }
  },
  guitar: {
    family: "strings",
    name: "Guitar",
    description: "Six-string fretted instrument",
    frequency: 329.63, // E4
    waveform: "triangle",
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.3 }
  },
  harp: {
    family: "strings",
    name: "Harp",
    description: "Large plucked string instrument",
    frequency: 523.25, // C5
    waveform: "sine",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 }
  },

  // Woodwinds
  flute: {
    family: "woodwinds",
    name: "Flute",
    description: "High-pitched woodwind instrument",
    frequency: 880, // A5
    waveform: "sine",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 }
  },
  clarinet: {
    family: "woodwinds",
    name: "Clarinet",
    description: "Single-reed woodwind instrument",
    frequency: 440, // A4
    waveform: "triangle",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 }
  },
  oboe: {
    family: "woodwinds",
    name: "Oboe",
    description: "Double-reed woodwind instrument",
    frequency: 440, // A4
    waveform: "sawtooth",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 }
  },
  bassoon: {
    family: "woodwinds",
    name: "Bassoon",
    description: "Low-pitched double-reed instrument",
    frequency: 220, // A3
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.3 }
  },
  saxophone: {
    family: "woodwinds",
    name: "Saxophone",
    description: "Single-reed brass instrument",
    frequency: 440, // A4
    waveform: "triangle",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 }
  },

  // Brass
  trumpet: {
    family: "brass",
    name: "Trumpet",
    description: "Highest-pitched brass instrument",
    frequency: 440, // A4
    waveform: "square",
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.1 }
  },
  trombone: {
    family: "brass",
    name: "Trombone",
    description: "Brass instrument with slide",
    frequency: 220, // A3
    waveform: "square",
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.1 }
  },
  frenchHorn: {
    family: "brass",
    name: "French Horn",
    description: "Mellow brass instrument",
    frequency: 329.63, // E4
    waveform: "square",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 }
  },
  tuba: {
    family: "brass",
    name: "Tuba",
    description: "Lowest-pitched brass instrument",
    frequency: 110, // A2
    waveform: "square",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 }
  },

  // Percussion
  drums: {
    family: "percussion",
    name: "Drums",
    description: "Percussion instrument set",
    frequency: 100, // Low frequency for kick
    waveform: "square",
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }
  },
  xylophone: {
    family: "percussion",
    name: "Xylophone",
    description: "Wooden bar percussion instrument",
    frequency: 523.25, // C5
    waveform: "sine",
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
  },
  cymbals: {
    family: "percussion",
    name: "Cymbals",
    description: "Metal percussion discs",
    frequency: 2000, // High frequency for crash
    waveform: "sawtooth",
    envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.2 }
  },
  triangle: {
    family: "percussion",
    name: "Triangle",
    description: "Metal triangular percussion",
    frequency: 3000, // High frequency
    waveform: "sine",
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }
  },

  // Keyboard
  piano: {
    family: "keyboard",
    name: "Piano",
    description: "Stringed keyboard instrument",
    frequency: 440, // A4
    waveform: "triangle",
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 }
  },
  organ: {
    family: "keyboard",
    name: "Organ",
    description: "Pipe or electronic keyboard instrument",
    frequency: 440, // A4
    waveform: "sine",
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.1 }
  },

  // Electronic
  synthesizer: {
    family: "electronic",
    name: "Synthesizer",
    description: "Electronic sound generator",
    frequency: 440, // A4
    waveform: "sawtooth",
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.3 }
  },
  electricGuitar: {
    family: "electronic",
    name: "Electric Guitar",
    description: "Electrically amplified guitar",
    frequency: 329.63, // E4
    waveform: "sawtooth",
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.3 }
  }
};

// Difficulty curves for each mode
export const DIFFICULTY_CURVES = {
  families: [
    {
      level: 1,
      parameters: {
        families: ["strings", "woodwinds", "brass", "percussion"],
        familyCount: 2
      }
    },
    {
      level: 2,
      parameters: {
        families: ["strings", "woodwinds", "brass", "percussion", "keyboard"],
        familyCount: 3
      }
    },
    {
      level: 3,
      parameters: {
        families: ["strings", "woodwinds", "brass", "percussion", "keyboard", "electronic"],
        familyCount: 4
      }
    }
  ],
  types: [
    {
      level: 1,
      parameters: {
        types: ["violin", "flute", "trumpet", "drums"],
        typeCount: 2,
        includeSimilar: false
      }
    },
    {
      level: 2,
      parameters: {
        types: ["violin", "viola", "flute", "clarinet", "trumpet", "trombone"],
        typeCount: 3,
        includeSimilar: true
      }
    },
    {
      level: 3,
      parameters: {
        types: ["violin", "viola", "cello", "flute", "oboe", "trumpet", "french horn", "drums", "xylophone"],
        typeCount: 4,
        includeSimilar: true
      }
    }
  ],
  "specific-instruments": [
    {
      level: 1,
      parameters: {
        instruments: ["violin", "flute", "trumpet", "piano"],
        instrumentCount: 2,
        includeRare: false,
        bySound: true,
        byImage: false
      }
    },
    {
      level: 2,
      parameters: {
        instruments: ["violin", "viola", "flute", "clarinet", "trumpet", "trombone", "piano", "organ"],
        instrumentCount: 3,
        includeRare: false,
        bySound: true,
        byImage: true
      }
    },
    {
      level: 3,
      parameters: {
        instruments: Object.keys(INSTRUMENTS),
        instrumentCount: 4,
        includeRare: true,
        bySound: true,
        byImage: true
      }
    }
  ]
};

// Helper functions
export function getModeById(modeId: string): GameMode | undefined {
  return TIMBRE_MODES.find(mode => mode.id === modeId);
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

export function getInstrumentsByFamily(family: string): string[] {
  return Object.entries(INSTRUMENTS)
    .filter(([_, instrument]) => instrument.family === family)
    .map(([key]) => key);
}

export function getInstrumentById(id: string): typeof INSTRUMENTS[keyof typeof INSTRUMENTS] | undefined {
  return INSTRUMENTS[id as keyof typeof INSTRUMENTS];
}