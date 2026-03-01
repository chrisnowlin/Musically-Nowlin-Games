/**
 * Game Logic for Note Reading Master
 * ID: theory-001
 * Unified Skill: Reading musical notation fluently
 * Modes: clefs, grand-staff, accidentals, advanced
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

const MODES = ["clefs", "grand-staff", "accidentals", "advanced"] as const;

// Note names
const NATURAL_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const ALL_NOTES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

// Clef types and their note ranges
const CLEFS = {
  easy: [
    { name: "Treble Clef", description: "Lines: E, G, B, D, F; Spaces: F, A, C, E", notes: ["E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5"] },
    { name: "Bass Clef", description: "Lines: G, B, D, F, A; Spaces: A, C, E, G", notes: ["G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"] },
  ],
  medium: [
    { name: "Treble Clef", description: "Lines: E, G, B, D, F; Spaces: F, A, C, E", notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"] },
    { name: "Bass Clef", description: "Lines: G, B, D, F, A; Spaces: A, C, E, G", notes: ["E2", "F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3"] },
    { name: "Alto Clef", description: "Middle C on middle line", notes: ["F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4"] },
  ],
  hard: [
    { name: "Treble Clef", description: "Lines: E, G, B, D, F; Spaces: F, A, C, E", notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"] },
    { name: "Bass Clef", description: "Lines: G, B, D, F, A; Spaces: A, C, E, G", notes: ["D2", "E2", "F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"] },
    { name: "Alto Clef", description: "Middle C on middle line", notes: ["E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"] },
    { name: "Tenor Clef", description: "Middle C on fourth line", notes: ["D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"] },
  ],
};

// Grand Staff scenarios
const GRAND_STAFF_SCENARIOS = {
  easy: [
    { description: "Reading middle C (between staffs)", answer: "C4" },
    { description: "Reading notes on treble staff", answer: "G4" },
    { description: "Reading notes on bass staff", answer: "F3" },
  ],
  medium: [
    { description: "Reading ledger lines above treble", answer: "A5" },
    { description: "Reading ledger lines below bass", answer: "E2" },
    { description: "Reading intervals spanning both staffs", answer: "Octave" },
    { description: "Identifying staff position for middle C", answer: "Between staffs" },
  ],
  hard: [
    { description: "Complex ledger line reading (treble)", answer: "C6" },
    { description: "Complex ledger line reading (bass)", answer: "C2" },
    { description: "Reading compound intervals", answer: "10th" },
    { description: "Cross-staff notation patterns", answer: "Crossing staffs" },
  ],
};

// Accidentals
const ACCIDENTALS = {
  easy: [
    { name: "Sharp", description: "Raises pitch by one half step", symbol: "#" },
    { name: "Flat", description: "Lowers pitch by one half step", symbol: "♭" },
    { name: "Natural", description: "Cancels previous sharp or flat", symbol: "♮" },
  ],
  medium: [
    { name: "Sharp", description: "Raises pitch by one half step", symbol: "#" },
    { name: "Flat", description: "Lowers pitch by one half step", symbol: "♭" },
    { name: "Natural", description: "Cancels previous sharp or flat", symbol: "♮" },
    { name: "Double Sharp", description: "Raises pitch by two half steps", symbol: "𝄪" },
    { name: "Double Flat", description: "Lowers pitch by two half steps", symbol: "𝄫" },
  ],
  hard: [
    { name: "Sharp", description: "Raises pitch by one half step", symbol: "#" },
    { name: "Flat", description: "Lowers pitch by one half step", symbol: "♭" },
    { name: "Natural", description: "Cancels previous sharp or flat", symbol: "♮" },
    { name: "Double Sharp", description: "Raises pitch by two half steps", symbol: "𝄪" },
    { name: "Double Flat", description: "Lowers pitch by two half steps", symbol: "𝄫" },
    { name: "Enharmonic", description: "Different notation, same pitch (e.g., C# = Db)", symbol: "=" },
  ],
};

// Advanced concepts
const ADVANCED_CONCEPTS = {
  easy: [
    { name: "Octave Identification", description: "Identifying which octave a note belongs to (e.g., C4, C5)" },
    { name: "Ledger Lines", description: "Reading notes above or below the staff on ledger lines" },
    { name: "Note Duration", description: "Identifying whole, half, quarter, eighth notes" },
  ],
  medium: [
    { name: "Compound Intervals", description: "Intervals larger than an octave" },
    { name: "Enharmonic Equivalents", description: "Notes with different names but same pitch" },
    { name: "Key Signature Reading", description: "Identifying key from sharps/flats at beginning" },
    { name: "Time Signature", description: "Understanding beat structure from time signature" },
  ],
  hard: [
    { name: "Transposition", description: "Reading notes in a different key than written" },
    { name: "Complex Rhythms", description: "Reading dotted notes, triplets, syncopation" },
    { name: "Multiple Clef Changes", description: "Following mid-piece clef changes" },
    { name: "Ornaments", description: "Reading trills, mordents, grace notes, turns" },
    { name: "Articulation Marks", description: "Understanding staccato, accent, fermata, etc." },
  ],
};

function getDifficultyLevel(difficulty: number): "easy" | "medium" | "hard" {
  if (difficulty <= 2) return "easy";
  if (difficulty <= 4) return "medium";
  return "hard";
}

function generateClefsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableClefs = CLEFS[level];
  const selectedClef = availableClefs[Math.floor(Math.random() * availableClefs.length)];
  const correctNote = selectedClef.notes[Math.floor(Math.random() * selectedClef.notes.length)];

  // Generate other note options
  const allPossibleNotes = [...new Set(availableClefs.flatMap(c => c.notes))];
  const otherNotes = allPossibleNotes
    .filter(n => n !== correctNote)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctNote, ...otherNotes].sort(() => Math.random() - 0.5);

  const question = `In ${selectedClef.name}, what note is shown? (${selectedClef.description})`;

  return {
    id: `clefs-${Date.now()}`,
    mode: "clefs",
    question,
    correctAnswer: correctNote,
    options,
    description: selectedClef.description,
    difficulty,
  };
}

function generateGrandStaffRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const scenarios = GRAND_STAFF_SCENARIOS[level];
  const correctScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  // Generate plausible wrong answers based on the correct answer type
  let otherOptions: string[] = [];
  if (correctScenario.answer.includes("C") && /\d/.test(correctScenario.answer)) {
    // It's a note name
    otherOptions = ["D4", "B3", "E4", "F3", "G4", "A3"].filter(n => n !== correctScenario.answer).slice(0, 3);
  } else if (correctScenario.answer.includes("th") || correctScenario.answer.includes("tave")) {
    // It's an interval
    otherOptions = ["5th", "6th", "7th", "9th", "11th"].filter(n => n !== correctScenario.answer).slice(0, 3);
  } else {
    // It's a position description
    otherOptions = ["On treble staff", "On bass staff", "Ledger line above", "Ledger line below"];
  }

  const options = [correctScenario.answer, ...otherOptions].sort(() => Math.random() - 0.5);

  const question = `On a grand staff: ${correctScenario.description}. What is the answer?`;

  return {
    id: `grand-staff-${Date.now()}`,
    mode: "grand-staff",
    question,
    correctAnswer: correctScenario.answer,
    options,
    description: correctScenario.description,
    difficulty,
  };
}

function generateAccidentalsRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableAccidentals = ACCIDENTALS[level];
  const correctAccidental = availableAccidentals[Math.floor(Math.random() * availableAccidentals.length)];

  const otherAccidentals = availableAccidentals
    .filter(a => a.name !== correctAccidental.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctAccidental, ...otherAccidentals]
    .map(a => a.name)
    .sort(() => Math.random() - 0.5);

  const question = `A note has this marking: ${correctAccidental.description}. What accidental is this?`;

  return {
    id: `accidentals-${Date.now()}`,
    mode: "accidentals",
    question,
    correctAnswer: correctAccidental.name,
    options,
    description: correctAccidental.description,
    difficulty,
  };
}

function generateAdvancedRound(difficulty: number): GameRound {
  const level = getDifficultyLevel(difficulty);
  const availableConcepts = ADVANCED_CONCEPTS[level];
  const correctConcept = availableConcepts[Math.floor(Math.random() * availableConcepts.length)];

  const otherConcepts = availableConcepts
    .filter(c => c.name !== correctConcept.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctConcept, ...otherConcepts]
    .map(c => c.name)
    .sort(() => Math.random() - 0.5);

  const question = `This notation concept: ${correctConcept.description}. What is this called?`;

  return {
    id: `advanced-${Date.now()}`,
    mode: "advanced",
    question,
    correctAnswer: correctConcept.name,
    options,
    description: correctConcept.description,
    difficulty,
  };
}

export function generateRound(mode: string, difficulty: number): GameRound {
  switch (mode) {
    case "clefs":
      return generateClefsRound(difficulty);
    case "grand-staff":
      return generateGrandStaffRound(difficulty);
    case "accidentals":
      return generateAccidentalsRound(difficulty);
    case "advanced":
      return generateAdvancedRound(difficulty);
    default:
      return generateClefsRound(difficulty);
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
