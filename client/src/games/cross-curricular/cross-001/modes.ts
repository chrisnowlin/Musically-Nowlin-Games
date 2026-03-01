/**
 * Mode definitions for Cross-Curricular Music Master (cross-001)
 * Multi-mode game covering math, language, and movement connections to music
 */

export type Cross001ModeId =
  | "math"
  | "language"
  | "movement";

export interface Cross001Mode {
  id: Cross001ModeId;
  label: string;
  emoji: string;
  description: string;
  instructions: string;
  // Map a user-visible level to internal difficulty knobs
  difficultyCurve: (level: number) => { 
    difficulty: number;
    questionComplexity: number;
    timeLimit: number;
  };
}

export const cross001Modes: Cross001Mode[] = [
  {
    id: "math",
    label: "Music Math",
    emoji: "🔢",
    description: "Explore mathematical patterns in music through counting, fractions, and patterns.",
    instructions: "Listen to the musical example and answer the math-related question. Count beats, identify patterns, or solve musical math problems!",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, level)),
      questionComplexity: Math.min(3, Math.max(1, Math.ceil(level / 2))),
      timeLimit: Math.max(15, 30 - level * 2), // Decreases with level
    }),
  },
  {
    id: "language",
    label: "Musical Language",
    emoji: "📝",
    description: "Discover connections between music and language through rhythm, rhyme, and storytelling.",
    instructions: "Listen to the musical example and explore how it relates to language concepts like rhythm, rhyme patterns, and musical storytelling.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, level)),
      questionComplexity: Math.min(3, Math.max(1, Math.ceil(level / 2))),
      timeLimit: Math.max(20, 35 - level * 2),
    }),
  },
  {
    id: "movement",
    label: "Music & Movement",
    emoji: "🕺",
    description: "Learn how music inspires movement through dance, rhythm, and physical expression.",
    instructions: "Listen to the musical example and choose how it makes you want to move! Explore tempo, dynamics, and mood through movement.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, level)),
      questionComplexity: Math.min(3, Math.max(1, Math.ceil(level / 2))),
      timeLimit: Math.max(15, 30 - level * 2),
    }),
  },
];

export const getCross001Mode = (id: Cross001ModeId) =>
  cross001Modes.find((m) => m.id === id);

export const getCross001ModeById = (id: string): Cross001Mode | undefined =>
  cross001Modes.find((m) => m.id === id);