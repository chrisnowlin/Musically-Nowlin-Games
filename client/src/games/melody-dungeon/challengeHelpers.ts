import type { ChallengeType, DifficultyLevel, EnemySubtype } from './logic/dungeonTypes';

export function getChallengeTypesForFloor(floorNumber: number): ChallengeType[] {
  if (floorNumber <= 5) return ['noteReading'];
  if (floorNumber <= 10) return ['noteReading', 'rhythmTap'];
  return ['noteReading', 'rhythmTap', 'interval'];
}

export function getBossChallengeConfig(floorNumber: number): {
  standardTypes: ChallengeType[];
  previewTypes: ChallengeType[];
  previewDifficulty: DifficultyLevel;
} {
  const currentTypes = getChallengeTypesForFloor(floorNumber);

  if (!currentTypes.includes('rhythmTap')) {
    return {
      standardTypes: currentTypes,
      previewTypes: ['rhythmTap'],
      previewDifficulty: 'easy',
    };
  }
  if (!currentTypes.includes('interval')) {
    return {
      standardTypes: currentTypes,
      previewTypes: ['interval'],
      previewDifficulty: 'easy',
    };
  }

  return {
    standardTypes: currentTypes,
    previewTypes: currentTypes,
    previewDifficulty: 'hard',
  };
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface BossRoundConfig {
  type: ChallengeType;
  difficulty: DifficultyLevel;
}

export function generateBigBossSequence(
  floorNumber: number,
  playerDifficulty: DifficultyLevel
): BossRoundConfig[] {
  const config = getBossChallengeConfig(floorNumber);
  const sequence: BossRoundConfig[] = [];

  for (let i = 0; i < 6; i++) {
    sequence.push({
      type: pickRandom(config.standardTypes),
      difficulty: playerDifficulty,
    });
  }

  for (let i = 0; i < 2; i++) {
    sequence.push({
      type: pickRandom(config.previewTypes),
      difficulty: config.previewDifficulty,
    });
  }

  return shuffle(sequence);
}

/** Returns the challenge type pool for a given enemy subtype. */
export function getSubtypeChallengePool(subtype: EnemySubtype | undefined, allFloorTypes: ChallengeType[]): ChallengeType[] {
  switch (subtype) {
    case 'ghost': return ['noteReading'];
    case 'skeleton': return ['rhythmTap'];
    case 'goblin': return ['interval'];
    case 'dragon': return allFloorTypes;
    default: return allFloorTypes;
  }
}
