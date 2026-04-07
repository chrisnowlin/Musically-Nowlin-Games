/**
 * Mode Definitions for Emotion Master
 * ID: dynamics-003
 * Multi-mode game covering emotional recognition and analysis in music
 * 
 * Modes:
 * - detection: Detect emotional content in musical phrases
 * - analysis: Analyze how musical elements create emotions
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

export interface EmotionConfig {
  name: string;
  icon: string;
  color: string;
  melody: number[];
  tempo: number;
  dynamics: number;
  characteristics: string[];
}

/**
 * Available game modes for Emotion Master
 */
export const EMOTION_MODES: GameMode[] = [
  {
    id: 'detection',
    name: 'Emotion Detection',
    description: 'Identify the emotional character expressed in musical phrases',
    instructions: 'Listen carefully to the musical phrase and select the emotion it best expresses. Pay attention to tempo, dynamics, melody direction, and overall mood.',
    icon: '🎭',
    color: 'bg-pink-500',
    difficulty: 'medium',
    ageRange: '7-12 years',
    maxRounds: 10,
    timePerRound: 30
  },
  {
    id: 'analysis',
    name: 'Emotional Analysis',
    description: 'Understand how musical elements create specific emotions and moods',
    instructions: 'Listen to the musical phrase and identify which musical elements are creating the emotional effect. Consider tempo, dynamics, melody direction, and articulation.',
    icon: '🔍',
    color: 'bg-purple-500',
    difficulty: 'medium',
    ageRange: '8-12 years',
    maxRounds: 10,
    timePerRound: 45
  }
];

/**
 * Emotion configurations with musical parameters
 */
export const EMOTIONS: Record<string, EmotionConfig> = {
  happy: {
    name: 'Happy',
    icon: '😊',
    color: 'text-yellow-500',
    melody: [262, 294, 330, 349, 392], // C D E F G - major scale
    tempo: 0.4,
    dynamics: 0.35,
    characteristics: ['Major scale', 'Bright tempo', 'Ascending melody', 'Clear articulation']
  },
  sad: {
    name: 'Sad',
    icon: '😢',
    color: 'text-blue-500',
    melody: [294, 262, 233, 220, 196], // D C Bb A G - descending minor
    tempo: 0.9,
    dynamics: 0.2,
    characteristics: ['Descending melody', 'Slow tempo', 'Soft dynamics', 'Legato articulation']
  },
  energetic: {
    name: 'Energetic',
    icon: '⚡',
    color: 'text-orange-500',
    melody: [392, 440, 523, 587, 659], // G A C D E - fast ascending
    tempo: 0.25,
    dynamics: 0.4,
    characteristics: ['Fast tempo', 'Strong dynamics', 'Leaping intervals', 'Staccato articulation']
  },
  calm: {
    name: 'Calm',
    icon: '🧘',
    color: 'text-green-500',
    melody: [262, 294, 262, 220, 196], // C D C A G - gentle motion
    tempo: 1.0,
    dynamics: 0.25,
    characteristics: ['Slow tempo', 'Gentle motion', 'Soft dynamics', 'Sustained tones']
  },
  mysterious: {
    name: 'Mysterious',
    icon: '🌙',
    color: 'text-purple-500',
    melody: [233, 247, 262, 277, 294], // Bb B C Db D - chromatic
    tempo: 0.7,
    dynamics: 0.15,
    characteristics: ['Chromatic motion', 'Moderate tempo', 'Soft dynamics', 'Legato articulation']
  },
  triumphant: {
    name: 'Triumphant',
    icon: '🏆',
    color: 'text-red-500',
    melody: [262, 330, 392, 523, 659], // C E G C E - major triad arpeggio
    tempo: 0.5,
    dynamics: 0.45,
    characteristics: ['Major triads', 'Strong dynamics', 'Ascending leaps', 'Accent articulation']
  }
};

/**
 * Analysis options for emotional analysis mode
 */
export const ANALYSIS_OPTIONS = {
  happy: [
    'Major scale ascending with bright, quick tempo',
    'Loud volume with sharp accents throughout',
    'Random notes with unpredictable rhythm',
    'Monotone repetition without variation'
  ],
  sad: [
    'Descending melody with slow tempo and soft dynamics',
    'Fast staccato notes with loud volume',
    'Ascending major scale with quick tempo',
    'Complex rhythm with changing dynamics'
  ],
  energetic: [
    'Fast tempo with ascending leaps and strong dynamics',
    'Slow legato melody with soft volume',
    'Chromatic descent with minimal dynamics',
    'Simple repetition with moderate tempo'
  ],
  calm: [
    'Slow, gentle melody with soft, sustained tones',
    'Fast rhythmic pattern with loud accents',
    'Dissonant intervals with abrupt changes',
    'Complex polyrhythm with varying dynamics'
  ],
  mysterious: [
    'Chromatic motion with soft, sustained dynamics',
    'Bright major scale with fast tempo',
    'Loud rhythmic patterns with clear articulation',
    'Simple triadic harmony with moderate tempo'
  ],
  triumphant: [
    'Major triad arpeggios with strong dynamics and accents',
    'Minor descending melody with soft volume',
    'Slow chromatic motion with minimal articulation',
    'Complex dissonance with unpredictable rhythm'
  ]
};

/**
 * Difficulty curves for each mode
 */
export const DIFFICULTY_CURVES: Record<string, DifficultyLevel[]> = {
  detection: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic emotions (happy, sad, calm) with clear musical characteristics',
      parameters: {
        emotions: ['happy', 'sad', 'calm'],
        optionsCount: 3,
        tempo: 0.5,
        complexity: 'simple'
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'All emotions with moderate complexity',
      parameters: {
        emotions: ['happy', 'sad', 'calm', 'energetic', 'mysterious'],
        optionsCount: 4,
        tempo: 0.4,
        complexity: 'moderate'
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'All emotions including triumphant with subtle characteristics',
      parameters: {
        emotions: ['happy', 'sad', 'calm', 'energetic', 'mysterious', 'triumphant'],
        optionsCount: 6,
        tempo: 0.3,
        complexity: 'complex'
      }
    }
  ],
  analysis: [
    {
      level: 1,
      name: 'Beginner',
      description: 'Basic analysis of clear emotional examples',
      parameters: {
        emotions: ['happy', 'sad', 'calm'],
        optionsCount: 4, // Analysis mode always has 4 options
        analysisType: 'basic',
        distractors: 'simple'
      }
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Detailed analysis of moderate complexity examples',
      parameters: {
        emotions: ['happy', 'sad', 'calm', 'energetic', 'mysterious'],
        optionsCount: 4,
        analysisType: 'detailed',
        distractors: 'moderate'
      }
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Complex analysis with subtle musical elements',
      parameters: {
        emotions: ['happy', 'sad', 'calm', 'energetic', 'mysterious', 'triumphant'],
        optionsCount: 4,
        analysisType: 'complex',
        distractors: 'challenging'
      }
    }
  ]
};

/**
 * Helper functions
 */
export function getModeById(modeId: string): GameMode | undefined {
  return EMOTION_MODES.find(mode => mode.id === modeId);
}

export function getDifficultyForMode(modeId: string, difficultyLevel: number): DifficultyLevel | undefined {
  const difficulties = DIFFICULTY_CURVES[modeId];
  if (!difficulties) return undefined;
  
  return difficulties.find(d => d.level === difficultyLevel) || difficulties[0];
}

export function getMaxDifficultyForMode(modeId: string): number {
  const difficulties = DIFFICULTY_CURVES[modeId];
  return difficulties ? difficulties.length : 1;
}

export function getEmotionConfig(emotionId: string): EmotionConfig | undefined {
  return EMOTIONS[emotionId];
}

export function getAnalysisOptionsForEmotion(emotionId: string): string[] {
  return ANALYSIS_OPTIONS[emotionId as keyof typeof ANALYSIS_OPTIONS] || [];
}

export function getAllModes(): GameMode[] {
  return [...EMOTION_MODES];
}
