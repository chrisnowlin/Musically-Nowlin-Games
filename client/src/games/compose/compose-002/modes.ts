/**
 * Mode definitions for Orchestration & Style Studio (compose-002)
 */

export type Compose002ModeId =
  | "orchestration"
  | "style";

export interface Compose002Mode {
  id: Compose002ModeId;
  label: string;
  emoji: string;
  description: string;
  // Map a user-visible level to internal difficulty knobs
  difficultyCurve: (level: number) => { difficulty: number };
}

export const compose002Modes: Compose002Mode[] = [
  {
    id: "orchestration",
    label: "Orchestration",
    emoji: "🎻",
    description:
      "Arrange instruments and create balanced musical ensembles.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, level)), // steady ramp
    }),
  },
  {
    id: "style",
    label: "Style Studio",
    emoji: "🎨",
    description: "Explore and create different musical styles and genres.",
    difficultyCurve: (level: number) => ({
      difficulty: Math.min(5, Math.max(1, Math.ceil(level * 1.2))), // slightly faster ramp
    }),
  },
];

export const getCompose002Mode = (id: Compose002ModeId) =>
  compose002Modes.find((m) => m.id === id);