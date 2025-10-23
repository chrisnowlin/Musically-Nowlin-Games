/**
 * Mode definitions for Musical Skills Arena (challenge-001)
 * Multi-mode challenge game with speed, progressive, and competitive modes
 */

export type Challenge001ModeId =
  | "speed-challenges"
  | "progressive-mastery"
  | "competitive-play";

export interface Challenge001Mode {
  id: Challenge001ModeId;
  label: string;
  emoji: string;
  description: string;
  timeLimit: number; // seconds per question
  difficultyCurve: (level: number) => { 
    minDifficulty: number; 
    maxDifficulty: number;
  };
  scoringMultiplier: number; // base score multiplier
}

export const challenge001Modes: Challenge001Mode[] = [
  {
    id: "speed-challenges",
    label: "Speed Challenges",
    emoji: "⚡",
    description: "Answer questions quickly with time pressure. Speed bonuses for fast answers!",
    timeLimit: 10,
    difficultyCurve: (level: number) => ({
      minDifficulty: 1,
      maxDifficulty: Math.min(3, Math.max(1, Math.ceil(level / 3))),
    }),
    scoringMultiplier: 1.5,
  },
  {
    id: "progressive-mastery",
    label: "Progressive Mastery",
    emoji: "📈",
    description: "Build skills progressively with adaptive difficulty based on performance.",
    timeLimit: 20,
    difficultyCurve: (level: number) => ({
      minDifficulty: Math.min(3, Math.max(1, Math.floor(level / 3))),
      maxDifficulty: Math.min(3, Math.max(1, Math.ceil(level / 3))),
    }),
    scoringMultiplier: 1.0,
  },
  {
    id: "competitive-play",
    label: "Competitive Play",
    emoji: "🏆",
    description: "Compete for high scores with streak bonuses and accuracy tracking.",
    timeLimit: 15,
    difficultyCurve: (level: number) => {
      if (level <= 4) {
        return { minDifficulty: 1, maxDifficulty: 2 };
      } else {
        return { minDifficulty: 2, maxDifficulty: 3 };
      }
    },
    scoringMultiplier: 1.2,
  },
];

export const getChallenge001Mode = (id: Challenge001ModeId) =>
  challenge001Modes.find((m) => m.id === id);

export const getDefaultMode = (): Challenge001ModeId => "speed-challenges";

export const getModeTimeLimit = (modeId: Challenge001ModeId): number => {
  const mode = getChallenge001Mode(modeId);
  return mode?.timeLimit ?? 10;
};

export const getModeScoringMultiplier = (modeId: Challenge001ModeId): number => {
  const mode = getChallenge001Mode(modeId);
  return mode?.scoringMultiplier ?? 1.0;
};