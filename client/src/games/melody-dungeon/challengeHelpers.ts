import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import {
  getChallengeTypesForFloor,
  rollTier,
  getFloorZone,
  getEnemyLevel,
  getChallengeTypeWeight,
  rollChallengeType,
} from './logic/difficultyAdapter';

export {
  getChallengeTypesForFloor,
  rollTier,
  getFloorZone,
  getEnemyLevel,
  getChallengeTypeWeight,
  rollChallengeType,
};

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface BossRoundConfig {
  type: ChallengeType;
  tier: Tier;
}

/** Generate the 8-round BigBoss sequence. Guarantees each available type appears at least once. */
export function generateBigBossSequence(floorNumber: number): BossRoundConfig[] {
  const types = getChallengeTypesForFloor(floorNumber);
  const sequence: BossRoundConfig[] = [];

  // Ensure each available type appears at least once
  for (const type of types) {
    sequence.push({ type, tier: rollTier(floorNumber) });
  }

  // Pad to 8 rounds with random picks
  while (sequence.length < 8) {
    const type = pickRandom(types);
    sequence.push({ type, tier: rollTier(floorNumber) });
  }

  return shuffle(sequence.slice(0, 8));
}

/** Enemy subtype → challenge affinity. Ghost and Dragon draw from the full floor pool. */
export function getSubtypeChallengePool(
  subtype: EnemySubtype | undefined,
  allFloorTypes: ChallengeType[]
): ChallengeType[] {
  switch (subtype) {
    case 'slime': return allFloorTypes.includes('noteReading') ? ['noteReading'] : allFloorTypes;
    case 'skeleton': return allFloorTypes.includes('rhythmTap') ? ['rhythmTap'] : allFloorTypes;
    case 'goblin': return allFloorTypes.includes('interval') ? ['interval'] : allFloorTypes;
    case 'bat': return allFloorTypes.includes('dynamics') ? ['dynamics'] : allFloorTypes;
    case 'wraith': return allFloorTypes.includes('tempo') ? ['tempo'] : allFloorTypes;
    case 'spider': return allFloorTypes.includes('symbols') ? ['symbols'] : allFloorTypes;
    case 'shade': return allFloorTypes.includes('terms') ? ['terms'] : allFloorTypes;
    case 'siren': return allFloorTypes.includes('timbre') ? ['timbre'] : allFloorTypes;
    case 'ghost': return allFloorTypes; // Wildcard — any type on the floor
    case 'dragon': return allFloorTypes;
    default: return allFloorTypes;
  }
}

/** Returns all enemy subtypes — every subtype is available from floor 1. */
export function getEnemySubtypesForFloor(_floorNumber: number): EnemySubtype[] {
  return ['ghost', 'slime', 'bat', 'wraith', 'spider', 'skeleton', 'shade', 'goblin', 'siren'];
}
