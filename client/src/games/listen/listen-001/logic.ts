/**
 * Game Logic for Form & Style Master
 * ID: listen-001
 * Unified Skill: Understanding musical form and style
 * Modes: forms, styles
 */

export interface GameRound {
  id: string;
  mode: string;
  question: string;
  correctAnswer: string;
  options: string[];
  description: string;
  difficulty: number;
}

const MODES = ["forms", "styles"] as const;

// Musical Forms
const MUSICAL_FORMS = {
  easy: [
    { name: "AB (Binary)", description: "Two distinct sections (A, then B)" },
    { name: "ABA (Ternary)", description: "Three sections where the first returns (A, B, A)" },
    { name: "Verse-Chorus", description: "Alternating verse and chorus sections" },
  ],
  medium: [
    { name: "AB (Binary)", description: "Two distinct sections (A, then B)" },
    { name: "ABA (Ternary)", description: "Three sections where the first returns (A, B, A)" },
    { name: "Rondo", description: "Recurring main theme with contrasting episodes (ABACA)" },
    { name: "Theme and Variations", description: "Main theme followed by modified versions" },
    { name: "Verse-Chorus-Bridge", description: "Song form with verse, chorus, and bridge" },
  ],
  hard: [
    { name: "AB (Binary)", description: "Two distinct sections (A, then B)" },
    { name: "ABA (Ternary)", description: "Three sections where the first returns (A, B, A)" },
    { name: "Rondo", description: "Recurring main theme with contrasting episodes (ABACA)" },
    { name: "Sonata Form", description: "Exposition, development, and recapitulation" },
    { name: "Theme and Variations", description: "Main theme followed by modified versions" },
    { name: "Fugue", description: "Contrapuntal form with imitative entries" },
  ],
};

// Musical Styles
const MUSICAL_STYLES = {
  easy: [
    { name: "Classical", description: "Balanced, elegant, clear form (Mozart, Haydn era)" },
    { name: "Jazz", description: "Syncopated rhythm, improvisation, swing feel" },
    { name: "Rock", description: "Strong beat, electric instruments, driving rhythm" },
    { name: "Pop", description: "Catchy melodies, verse-chorus form, accessible" },
  ],
  medium: [
    { name: "Baroque", description: "Ornate, contrapuntal, continuous motion (Bach era)" },
    { name: "Classical", description: "Balanced, elegant, clear form (Mozart, Haydn era)" },
    { name: "Romantic", description: "Expressive, emotional, rich harmonies (Chopin era)" },
    { name: "Jazz", description: "Syncopated rhythm, improvisation, swing feel" },
    { name: "Blues", description: "12-bar form, blue notes, call-and-response" },
  ],
  hard: [
    { name: "Baroque", description: "Ornate, contrapuntal, continuous motion (Bach era)" },
    { name: "Classical", description: "Balanced, elegant, clear form (Mozart, Haydn era)" },
    { name: "Romantic", description: "Expressive, emotional, rich harmonies (Chopin era)" },
    { name: "Impressionist", description: "Atmospheric, colorful harmonies (Debussy era)" },
    { name: "Minimalist", description: "Repetitive patterns, gradual changes (Glass, Reich)" },
    { name: "Bebop", description: "Fast tempo, complex harmonies, virtuosic improvisation" },
  ],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generateFormsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableForms = MUSICAL_FORMS[level];
  const correctForm = availableForms[Math.floor(Math.random() * availableForms.length)];

  const otherForms = availableForms
    .filter(f => f.name !== correctForm.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctForm, ...otherForms]
    .map(f => f.name)
    .sort(() => Math.random() - 0.5);

  const question = `A piece has the following structure: ${correctForm.description}. What form is this?`;

  return {
    id: `forms-${Date.now()}`,
    mode: "forms",
    question,
    correctAnswer: correctForm.name,
    options,
    description: correctForm.description,
    difficulty,
  };
}

function generateStylesRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableStyles = MUSICAL_STYLES[level];
  const correctStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];

  const otherStyles = availableStyles
    .filter(s => s.name !== correctStyle.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctStyle, ...otherStyles]
    .map(s => s.name)
    .sort(() => Math.random() - 0.5);

  const question = `A piece has these characteristics: ${correctStyle.description}. What style is this?`;

  return {
    id: `styles-${Date.now()}`,
    mode: "styles",
    question,
    correctAnswer: correctStyle.name,
    options,
    description: correctStyle.description,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "forms":
      return generateFormsRound(difficulty);
    case "styles":
      return generateStylesRound(difficulty);
    default:
      return generateFormsRound(difficulty);
  }
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
}

export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {
  if (!correct) return 0;
  const baseScore = 100 * difficulty;
  const timeBonus = Math.max(0, 50 - timeSpent / 100);
  return Math.round(baseScore + timeBonus);
}
