/**
 * Game Logic for Cross-Curricular Music Master
 * ID: cross-001
 * Unified Skill: Cross-curricular connections between music and math, language, and movement
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  answer: string;
  options: string[];
  difficulty: number;
  notes?: number[]; // Frequencies for audio playback
  pattern?: number[]; // Duration pattern for rhythm/movement
  description?: string;
}

// Math Mode Questions - connecting music to mathematical concepts
const mathQuestions = [
  {
    question: "How many beats are in this musical pattern?",
    answer: "4 beats",
    options: ["2 beats", "3 beats", "4 beats", "6 beats"],
    notes: [440, 440, 440, 440], // Four beats
    pattern: [500, 500, 500, 500],
    description: "Count the beats carefully",
  },
  {
    question: "What fraction of the whole measure is this note?",
    answer: "1/4",
    options: ["1/2", "1/4", "1/8", "1/16"],
    notes: [440], // Quarter note
    pattern: [1000],
    description: "Listen to the note duration",
  },
  {
    question: "How many notes are in this musical sequence?",
    answer: "5 notes",
    options: ["3 notes", "4 notes", "5 notes", "6 notes"],
    notes: [261.63, 293.66, 329.63, 349.23, 392.00], // C-D-E-F-G
    pattern: [400, 400, 400, 400, 400],
    description: "Count each note in the sequence",
  },
  {
    question: "What is the pattern in this musical sequence?",
    answer: "Adding 2 beats each time",
    options: ["Same length", "Adding 1 beat", "Adding 2 beats", "Subtracting 1 beat"],
    notes: [440, 440, 440, 440],
    pattern: [200, 400, 600, 800], // Increasing pattern
    description: "Notice how the duration changes",
  },
];

// Language Mode Questions - connecting music to language concepts
const languageQuestions = [
  {
    question: "Which word best describes the rhythm of this pattern?",
    answer: "Syncopated",
    options: ["Smooth", "Syncopated", "Even", "Simple"],
    notes: [440, 440, 440, 440],
    pattern: [300, 200, 300, 200], // Off-beat pattern
    description: "Listen for the rhythmic character",
  },
  {
    question: "This musical pattern sounds like which type of poetry?",
    answer: "Rhyming couplet",
    options: ["Free verse", "Haiku", "Rhyming couplet", "Limerick"],
    notes: [440, 523.25, 440, 523.25], // A-B-A-B pattern
    pattern: [500, 500, 500, 500],
    description: "Notice the repeating pattern",
  },
  {
    question: "What storytelling element does this music suggest?",
    answer: "Building excitement",
    options: ["Peaceful ending", "Building excitement", "Sad moment", "Happy dance"],
    notes: [261.63, 293.66, 329.63, 392.00, 523.25], // Rising pitch
    pattern: [400, 400, 400, 400, 600],
    description: "How does the music make you feel?",
  },
  {
    question: "This rhythm pattern matches which syllable structure?",
    answer: "DA-da-DA-da",
    options: ["DA-DA-DA", "da-DA-da-DA", "DA-da-DA-da", "da-da-DA-DA"],
    notes: [523.25, 440, 523.25, 440], // Strong-weak pattern
    pattern: [300, 200, 300, 200],
    description: "Listen for stressed and unstressed beats",
  },
];

// Movement Mode Questions - connecting music to physical movement
const movementQuestions = [
  {
    question: "How should you move to this music?",
    answer: "Marching",
    options: ["Floating", "Marching", "Spinning", "Jumping"],
    notes: [440, 440, 440, 440],
    pattern: [500, 500, 500, 500], // Steady beat
    description: "Feel the steady pulse",
  },
  {
    question: "What tempo is best for dancing to this music?",
    answer: "Moderate tempo",
    options: ["Very slow", "Moderate tempo", "Very fast", "No steady beat"],
    notes: [440, 523.25, 440, 523.25],
    pattern: [400, 400, 400, 400], // Danceable tempo
    description: "Imagine dancing to this rhythm",
  },
  {
    question: "This music suggests which type of movement?",
    answer: "Swaying gently",
    options: ["Running fast", "Swaying gently", "Stomping loudly", "Skipping lightly"],
    notes: [349.23, 392.00, 349.23, 392.00], // Gentle rocking
    pattern: [600, 600, 600, 600],
    description: "Let the music guide your body",
  },
  {
    question: "What energy level does this music have?",
    answer: "High energy",
    options: ["Very calm", "Medium energy", "High energy", "No energy"],
    notes: [523.25, 659.25, 783.99, 880.00], // Bright, high pitches
    pattern: [200, 200, 200, 200], // Fast tempo
    description: "Feel the energy in the music",
  },
];

const questionBank = {
  "math": mathQuestions,
  "language": languageQuestions,
  "movement": movementQuestions,
};

export function generateRound(mode: string, difficulty: number): GameRound {
  const questions = questionBank[mode as keyof typeof questionBank] || mathQuestions;
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
