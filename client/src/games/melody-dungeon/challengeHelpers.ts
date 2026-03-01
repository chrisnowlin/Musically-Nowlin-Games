import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import { getChallengeTypesForFloor, getTierForChallenge } from './logic/difficultyAdapter';

export { getChallengeTypesForFloor, getTierForChallenge };

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

/** Generate the 8-round BigBoss sequence. All rounds use the floor's tier for each type. */
export function generateBigBossSequence(floorNumber: number): BossRoundConfig[] {
  const types = getChallengeTypesForFloor(floorNumber);
  const sequence: BossRoundConfig[] = [];

  for (let i = 0; i < 8; i++) {
    const type = pickRandom(types);
    sequence.push({ type, tier: getTierForChallenge(floorNumber, type) });
  }

  return shuffle(sequence);
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
    case 'ghost': return allFloorTypes; // Wildcard — any type on the floor
    case 'dragon': return allFloorTypes;
    default: return allFloorTypes;
  }
}

/** Returns enemy subtypes that can patrol on a given floor based on unlocked challenge types. */
export function getEnemySubtypesForFloor(floorNumber: number): EnemySubtype[] {
  const types = getChallengeTypesForFloor(floorNumber);
  const subtypes: EnemySubtype[] = ['ghost']; // Ghost always available

  if (types.includes('noteReading')) subtypes.push('slime');
  if (types.includes('dynamics')) subtypes.push('bat');
  if (types.includes('tempo')) subtypes.push('wraith');
  if (types.includes('symbols')) subtypes.push('spider');
  if (types.includes('rhythmTap')) subtypes.push('skeleton');
  if (types.includes('terms')) subtypes.push('shade');
  if (types.includes('interval')) subtypes.push('goblin');

  return subtypes;
}
