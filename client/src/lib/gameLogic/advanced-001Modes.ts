/**
 * Mode definitions for Advanced Music Analyzer (advanced-001)
 */

export type Advanced001ModeId =
  | "advanced-harmony"
  | "advanced-rhythm"
  | "advanced-form";

export interface Advanced001Mode {
  id: Advanced001ModeId;
  label: string;
  emoji: string;
  description: string;
  // Map a user-visible level to internal difficulty knobs
  difficultyCurve: (level: number) => { difficulty: number };
}

export const advanced001Modes: Advanced001Mode[] = [
  {
    id: "advanced-harmony",
    label: "Advanced Harmony",
    emoji: "🎹",
    description:
      "Identify chord qualities, progressions, and harmonic functions.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, level)), // steady ramp
    }),
  },
  {
    id: "advanced-rhythm",
    label: "Advanced Rhythm",
    emoji: "🥁",
    description: "Analyze complex rhythms, meters, and syncopations.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, Math.ceil(level * 1.2))), // slightly faster ramp
    }),
  },
  {
    id: "advanced-form",
    label: "Advanced Form",
    emoji: "📊",
    description: "Recognize musical forms and developmental techniques.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, Math.ceil(level * 1.1))), // medium ramp
    }),
  },
];

export const getAdvanced001Mode = (id: Advanced001ModeId) =>
  advanced001Modes.find((m) => m.id === id);

