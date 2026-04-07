import type { Character } from '@shared/types/cadence-quest';

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  newSkillPoints: number;
  unlockedAbilities: string[];
}

export function calculateLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpNeededForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function processXpGain(
  character: Character,
  xpGained: number
): LevelUpResult {
  const currentXp = character.stats.xp + xpGained;
  const currentLevel = character.stats.level;
  const newLevel = calculateLevelFromXp(currentXp);

  const leveledUp = newLevel > currentLevel;
  const levelDiff = newLevel - currentLevel;

  const newSkillPoints = leveledUp ? levelDiff : 0;

  const unlockedAbilities: string[] = [];
  if (leveledUp) {
    for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
      const abilities = ABILITIES_UNLOCKED_AT_LEVEL[lvl];
      if (abilities) {
        unlockedAbilities.push(...abilities);
      }
    }
  }

  return {
    leveledUp,
    newLevel,
    newSkillPoints,
    unlockedAbilities,
  };
}

const ABILITIES_UNLOCKED_AT_LEVEL: Record<number, string[]> = {
  5: ['perfect_pitch'],
  10: ['class_ability_2'],
  15: ['class_ability_3'],
  20: ['crescendo'],
};

export function xpRewardForBattle(isBoss: boolean, playerLevel: number): number {
  const baseXp = isBoss ? 500 : 100;
  const levelMultiplier = 1 + (playerLevel - 1) * 0.1;
  return Math.floor(baseXp * levelMultiplier);
}

export function goldRewardForBattle(isBoss: boolean, playerLevel: number): number {
  const baseGold = isBoss ? 300 : 50;
  const levelMultiplier = 1 + (playerLevel - 1) * 0.15;
  return Math.floor(baseGold * levelMultiplier);
}

export function xpToNextLevel(currentLevel: number): number {
  return xpNeededForLevel(currentLevel + 1) - xpNeededForLevel(currentLevel);
}