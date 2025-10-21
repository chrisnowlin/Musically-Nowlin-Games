/**
 * Game Logic for Advanced Music Analyzer
 * ID: advanced-001
 * Unified Skill: Analyzing advanced and contemporary music
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options: string[];
  difficulty: number;
  notes?: number[]; // Frequencies for audio playback
  pattern?: number[]; // Duration pattern for rhythm
  description?: string;
}

const MODES = ["advanced-harmony", "advanced-rhythm", "advanced-form"];

// Advanced Harmony Questions
const harmonyQuestions = [
  {
    question: "What type of chord is being played?",
    answer: "Diminished 7th",
    options: ["Major 7th", "Diminished 7th", "Augmented", "Dominant 7th"],
    notes: [261.63, 311.13, 369.99, 440.00], // C-Eb-Gb-Bbb
    description: "Listen to the chord quality",
  },
  {
    question: "Identify the chord progression",
    answer: "ii-V-I (Jazz)",
    options: ["I-IV-V", "ii-V-I (Jazz)", "I-vi-IV-V", "vi-IV-I-V"],
    notes: [293.66, 329.63, 392.00], // D-E-G (simplified)
    description: "Common in jazz music",
  },
  {
    question: "What is this harmonic function?",
    answer: "Secondary Dominant",
    options: ["Tonic", "Secondary Dominant", "Subdominant", "Mediant"],
    notes: [392.00, 493.88, 587.33], // G-B-D (V of V)
    description: "Listen for the leading tone",
  },
  {
    question: "Identify this extended chord",
    answer: "Major 9th",
    options: ["Major 7th", "Major 9th", "Minor 11th", "Dominant 13th"],
    notes: [261.63, 329.63, 392.00, 493.88, 587.33], // C-E-G-B-D
    description: "Count the chord extensions",
  },
];

// Advanced Rhythm Questions
const rhythmQuestions = [
  {
    question: "What time signature is this rhythm in?",
    answer: "5/4",
    options: ["4/4", "3/4", "5/4", "7/8"],
    pattern: [200, 200, 200, 200, 200], // 5 beats
    notes: [440], // A4
    description: "Count the beats carefully",
  },
  {
    question: "Identify the rhythmic pattern",
    answer: "Syncopated",
    options: ["Straight", "Syncopated", "Triplets", "Dotted"],
    pattern: [150, 250, 150, 250, 200], // Off-beat emphasis
    notes: [440],
    description: "Listen for off-beat accents",
  },
  {
    question: "What type of rhythm is this?",
    answer: "Polyrhythm (3 over 2)",
    options: ["Even beats", "Triplets", "Polyrhythm (3 over 2)", "Swing"],
    pattern: [133, 133, 133, 200, 200], // 3 over 2
    notes: [440, 523.25], // A4 and C5 alternating
    description: "Two rhythms played simultaneously",
  },
  {
    question: "Identify this rhythmic technique",
    answer: "Hemiola",
    options: ["Hemiola", "Cross-rhythm", "Augmentation", "Diminution"],
    pattern: [200, 200, 200, 300, 300, 200], // 3+2 feel
    notes: [440],
    description: "Shift in metric grouping",
  },
];

// Advanced Form Questions
const formQuestions = [
  {
    question: "What musical form is this?",
    answer: "Sonata Form",
    options: ["Binary Form", "Ternary Form", "Sonata Form", "Rondo Form"],
    description: "Exposition → Development → Recapitulation",
    notes: [261.63, 293.66, 329.63], // Theme
  },
  {
    question: "Identify the formal structure",
    answer: "Theme and Variations",
    options: ["Through-composed", "Theme and Variations", "Strophic", "Fugue"],
    description: "Same melody, different treatments",
    notes: [261.63, 277.18, 293.66, 311.13],
  },
  {
    question: "What type of development is this?",
    answer: "Sequence",
    options: ["Inversion", "Sequence", "Retrograde", "Augmentation"],
    description: "Pattern repeated at different pitch levels",
    notes: [261.63, 293.66, 329.63, 349.23, 392.00], // Rising sequence
  },
  {
    question: "Identify the cadence type",
    answer: "Deceptive Cadence",
    options: ["Authentic Cadence", "Plagal Cadence", "Deceptive Cadence", "Half Cadence"],
    description: "Unexpected resolution",
    notes: [392.00, 349.23], // V-vi
  },
];

const questionBank = {
  "advanced-harmony": harmonyQuestions,
  "advanced-rhythm": rhythmQuestions,
  "advanced-form": formQuestions,
};

export function generateRound(mode: string, difficulty: number): GameRound {
  const questions = questionBank[mode as keyof typeof questionBank] || harmonyQuestions;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    id: `round-${Date.now()}`,
    mode,
    question: randomQuestion.question,
    answer: randomQuestion.answer,
    options: randomQuestion.options,
    difficulty,
    notes: randomQuestion.notes,
    pattern: randomQuestion.pattern,
    description: randomQuestion.description,
  };
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer === correctAnswer;
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
