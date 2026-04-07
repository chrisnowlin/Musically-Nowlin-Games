export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ageGroup: string;
  estimatedDuration: number;
}

export interface DifficultyLevel {
  easy: number;
  medium: number;
  hard: number;
}

export interface Pitch001ModeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ageGroup: string;
  estimatedDuration: number;
  instructions: {
    easy: string;
    medium: string;
    hard: string;
  };
  parameters: {
    [key: string]: any;
  };
}

export const pitch001Modes: Pitch001ModeConfig[] = [
  {
    id: 'octave',
    name: 'Octave Explorer',
    description: 'Learn to recognize and match octaves - the foundation of pitch understanding',
    icon: '🎵',
    color: '#8B5CF6',
    ageGroup: '5-8 years',
    estimatedDuration: 3,
    instructions: {
      easy: 'Listen to two notes and tell if they are the same note or different notes',
      medium: 'Listen to a note and find its octave - the same note but higher or lower',
      hard: 'Identify whether the second note is the same, an octave higher, or an octave lower'
    },
    parameters: {
      noteRange: ['C3', 'C5'],
      octaveRange: [3, 5],
      playbackSpeed: 1.0,
      includeHarmonics: false
    }
  },
  {
    id: 'interval',
    name: 'Interval Detective',
    description: 'Master musical intervals - the distances between notes that create melodies',
    icon: '🔍',
    color: '#3B82F6',
    ageGroup: '6-10 years',
    estimatedDuration: 4,
    instructions: {
      easy: 'Listen to two notes and tell if they go up, down, or stay the same',
      medium: 'Identify simple intervals like seconds, thirds, and fourths',
      hard: 'Recognize complex intervals including fifths, sixths, sevenths, and octaves'
    },
    parameters: {
      intervals: {
        easy: ['unison', 'second', 'third'],
        medium: ['unison', 'second', 'third', 'fourth', 'fifth'],
        hard: ['unison', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'octave']
      },
      intervalTypes: ['melodic', 'harmonic'],
      direction: ['up', 'down', 'both']
    }
  },
  {
    id: 'bend',
    name: 'Pitch Bender',
    description: 'Explore pitch bending and microtonal variations in music',
    icon: '〰️',
    color: '#10B981',
    ageGroup: '7-12 years',
    estimatedDuration: 4,
    instructions: {
      easy: 'Listen to notes that bend up or down and identify the direction',
      medium: 'Identify how much the pitch bends - small, medium, or large bends',
      hard: 'Recreate pitch bends by controlling the bend amount and direction'
    },
    parameters: {
      bendRange: {
        easy: [0.5, 2], // semitones
        medium: [0.25, 3],
        hard: [0.1, 4]
      },
      bendSpeed: ['slow', 'medium', 'fast'],
      bendTypes: ['linear', 'exponential', 'logarithmic']
    }
  },
  {
    id: 'vibrato',
    name: 'Vibrato Master',
    description: 'Learn to recognize and create vibrato - the beautiful pulsing in sustained notes',
    icon: '〰️',
    color: '#F59E0B',
    ageGroup: '8-12 years',
    estimatedDuration: 4,
    instructions: {
      easy: 'Listen to notes and tell if they have vibrato (wobble) or are steady',
      medium: 'Identify if vibrato is fast, medium, or slow',
      hard: 'Match the vibrato speed and depth you hear'
    },
    parameters: {
      vibratoRate: {
        easy: [4, 6], // Hz
        medium: [3, 8],
        hard: [2, 10]
      },
      vibratoDepth: {
        easy: [0.1, 0.3], // semitones
        medium: [0.05, 0.5],
        hard: [0.02, 0.8]
      },
      vibratoTypes: ['sine', 'triangle', 'square']
    }
  },
  {
    id: 'glissando',
    name: 'Glissando Glide',
    description: 'Master glissandos - smooth slides between notes that create expressive effects',
    icon: '🎢',
    color: '#EF4444',
    ageGroup: '7-12 years',
    estimatedDuration: 4,
    instructions: {
      easy: 'Listen to notes that slide up or down and identify the direction',
      medium: 'Identify if the slide is short, medium, or long',
      hard: 'Recreate glissandos with the correct speed and range'
    },
    parameters: {
      glissandoRange: {
        easy: [2, 4], // semitones
        medium: [1, 6],
        hard: [0.5, 12]
      },
      glissandoSpeed: ['slow', 'medium', 'fast'],
      glissandoTypes: ['chromatic', 'diatonic', 'continuous']
    }
  },
  {
    id: 'portamento',
    name: 'Portamento Pro',
    description: 'Learn portamento - smooth pitch transitions that connect notes beautifully',
    icon: '🌊',
    color: '#06B6D4',
    ageGroup: '8-12 years',
    estimatedDuration: 4,
    instructions: {
      easy: 'Listen to connected notes and tell if they slide smoothly or jump',
      medium: 'Identify the speed of the portamento - fast, medium, or slow',
      hard: 'Create portamento effects with the right timing and smoothness'
    },
    parameters: {
      portamentoTime: {
        easy: [0.1, 0.3], // seconds
        medium: [0.05, 0.5],
        hard: [0.02, 0.8]
      },
      portamentoCurve: ['linear', 'exponential', 'logarithmic'],
      noteConnections: ['stepwise', 'leapwise', 'mixed']
    }
  },
  {
    id: 'envelope',
    name: 'Envelope Explorer',
    description: 'Understand ADSR envelopes - how sounds start, sustain, and fade away',
    icon: '📊',
    color: '#84CC16',
    ageGroup: '9-12 years',
    estimatedDuration: 5,
    instructions: {
      easy: 'Listen to sounds and identify if they start suddenly or fade in slowly',
      medium: 'Identify parts of the sound - attack, decay, sustain, or release',
      hard: 'Match the envelope shape you hear by adjusting ADSR controls'
    },
    parameters: {
      envelopeTypes: {
        easy: ['percussive', 'smooth'],
        medium: ['percussive', 'smooth', 'sustained'],
        hard: ['percussive', 'smooth', 'sustained', 'complex']
      },
      attackTime: [0.01, 2.0],
      decayTime: [0.1, 1.5],
      sustainLevel: [0.1, 1.0],
      releaseTime: [0.1, 3.0]
    }
  },
  {
    id: 'harmonic',
    name: 'Harmonic Hunter',
    description: 'Discover the harmonic series - the natural overtones that give instruments their character',
    icon: '🎼',
    color: '#A855F7',
    ageGroup: '10-12 years',
    estimatedDuration: 5,
    instructions: {
      easy: 'Listen to sounds and tell if they have overtones (bright) or are pure tones',
      medium: 'Identify how many harmonics you hear - 1, 2, 3, or more',
      hard: 'Identify specific harmonic numbers in the series'
    },
    parameters: {
      harmonicSeries: {
        easy: [1, 3], // fundamental + 2 harmonics
        medium: [1, 5], // fundamental + 4 harmonics
        hard: [1, 8] // fundamental + 7 harmonics
      },
      harmonicTypes: ['sine', 'sawtooth', 'square', 'triangle'],
      fundamentalFreq: [110, 440] // Hz
    }
  },
  {
    id: 'relative',
    name: 'Relative Pitch',
    description: 'Develop relative pitch - the ability to understand relationships between notes',
    icon: '🎯',
    color: '#F97316',
    ageGroup: '8-12 years',
    estimatedDuration: 5,
    instructions: {
      easy: 'Listen to a reference note, then tell if the next note is higher or lower',
      medium: 'After hearing a reference, identify the interval to the next note',
      hard: 'Hear a chord progression and identify the movement of each voice'
    },
    parameters: {
      referenceTypes: ['single', 'chord', 'melody'],
      intervalComplexity: {
        easy: ['step', 'skip'],
        medium: ['step', 'skip', 'leap'],
        hard: ['step', 'skip', 'leap', 'complex']
      },
      contextLength: {
        easy: 1,
        medium: 2,
        hard: 4
      }
    }
  },
  {
    id: 'absolute',
    name: 'Perfect Pitch',
    description: 'Train your perfect pitch - the ability to identify notes without any reference',
    icon: '🎹',
    color: '#DC2626',
    ageGroup: '10-12 years',
    estimatedDuration: 6,
    instructions: {
      easy: 'Listen to single notes and identify them from a small set of options',
      medium: 'Identify notes from the full musical alphabet',
      hard: 'Identify notes with sharps and flats, and even chord qualities'
    },
    parameters: {
      noteSet: {
        easy: ['C', 'D', 'E', 'F', 'G'],
        medium: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        hard: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      },
      octaveRange: {
        easy: [4, 4],
        medium: [3, 5],
        hard: [2, 6]
      },
      includeChords: {
        easy: false,
        medium: false,
        hard: true
      }
    }
  }
];

export const getPitch001Mode = (modeId: string): Pitch001ModeConfig | undefined => {
  return pitch001Modes.find(mode => mode.id === modeId);
};

export const getPitch001ModesByAge = (age: number): Pitch001ModeConfig[] => {
  return pitch001Modes.filter(mode => {
    const [minAge, maxAge] = mode.ageGroup.split('-').map(n => parseInt(n));
    return age >= minAge && age <= maxAge;
  });
};

export const getPitch001ModesByDuration = (maxMinutes: number): Pitch001ModeConfig[] => {
  return pitch001Modes.filter(mode => mode.estimatedDuration <= maxMinutes);
};