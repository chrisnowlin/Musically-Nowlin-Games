/**
 * Mode Definitions for Musical Analysis Master
 * ID: listen-002
 * Unified Skill: Musical analysis and critical listening
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

export const ANALYSIS_MODES: Record<string, GameMode> = {
  composers: {
    id: 'composers',
    name: 'Composer Detective',
    description: 'Learn to recognize different composers and their unique musical styles through listening.',
    icon: '🎼',
    color: 'from-amber-400 to-amber-600',
    ageRange: '8-12',
    difficulty: 'medium',
    maxRounds: 10,
    instructions: 'Listen to musical excerpts and identify the composer or their characteristic style.'
  },
  elements: {
    id: 'elements',
    name: 'Musical Elements Explorer',
    description: 'Identify and analyze musical elements including melody, harmony, rhythm, and timbre.',
    icon: '🎵',
    color: 'from-teal-400 to-teal-600',
    ageRange: '7-10',
    difficulty: 'easy',
    maxRounds: 10,
    instructions: 'Listen carefully and identify which musical element is featured or how it\'s being used.'
  }
};

export function getModeById(id: string): GameMode | undefined {
  return ANALYSIS_MODES[id];
}

export function getAllModes(): GameMode[] {
  return Object.values(ANALYSIS_MODES);
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

// Musical example definitions for audio synthesis
export const MUSICAL_EXAMPLES = {
  // Composer styles
  'bach': {
    style: 'Baroque',
    characteristics: ['complex counterpoint', 'ornamentation', 'harpsichord-like texture'],
    tempo: 120,
    key: 'C major'
  },
  'mozart': {
    style: 'Classical',
    characteristics: ['clear melody', 'balanced phrases', 'elegant harmony'],
    tempo: 110,
    key: 'G major'
  },
  'beethoven': {
    style: 'Classical/Romantic',
    characteristics: ['dramatic dynamics', 'strong rhythms', 'emotional melodies'],
    tempo: 100,
    key: 'C minor'
  },
  'debussy': {
    style: 'Impressionist',
    characteristics: ['dreamy atmosphere', 'whole-tone scales', 'fluid rhythms'],
    tempo: 80,
    key: 'C major (impressionist)'
  },
  
  // Musical elements
  'melody': {
    description: 'The main tune or musical line',
    characteristics: ['contour', 'intervals', 'phrase structure'],
    examples: ['stepwise motion', 'leaping melody', 'repeating motif']
  },
  'harmony': {
    description: 'The vertical aspect of music',
    characteristics: ['chords', 'progressions', 'consonance/dissonance'],
    examples: ['major chords', 'minor chords', 'chord progressions']
  },
  'rhythm': {
    description: 'The timing and duration of sounds',
    characteristics: ['beat', 'meter', 'patterns'],
    examples: ['steady beat', 'syncopation', 'polyrhythm']
  },
  'timbre': {
    description: 'The quality or color of sound',
    characteristics: ['instrument families', 'tone color', 'articulation'],
    examples: ['string instruments', 'wind instruments', 'percussion sounds']
  }
};

export const MUSICAL_ELEMENT_NAMES = {
  // Composer styles
  'bach': 'J.S. Bach - Baroque Style',
  'mozart': 'W.A. Mozart - Classical Style',
  'beethoven': 'L. van Beethoven - Classical/Romantic Style',
  'debussy': 'C. Debussy - Impressionist Style',
  
  // Musical elements
  'melody': 'Melody - The Musical Line',
  'harmony': 'Harmony - Chords and Progressions',
  'rhythm': 'Rhythm - Beat and Patterns',
  'timbre': 'Timbre - Sound Quality and Color',
  
  // Additional analysis terms
  'tempo': 'Tempo - Speed of Music',
  'dynamics': 'Dynamics - Loud and Soft',
  'texture': 'Texture - How Music Layers',
  'form': 'Form - Structure of Music'
};