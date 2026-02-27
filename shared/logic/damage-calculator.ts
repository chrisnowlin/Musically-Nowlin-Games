/**
 * Cadence Quest - Damage Calculation
 * Deterministic formulas for battle damage. Used by both client and server.
 */

import type {
  CharacterClass,
  MusicChallenge,
  MusicDiscipline,
  ChallengeResult,
} from '../types/cadence-quest';

const BASE_DAMAGE = 15;
const SELF_DAMAGE_PERCENT = 0.05;
const CLASS_BONUS_MULTIPLIER = 1.25;
const MIN_SPEED_BONUS = 1.0;
const MAX_SPEED_BONUS = 1.5;
/** Response time (ms) that gives max speed bonus - faster = capped at 1.5x */
const FAST_THRESHOLD_MS = 1500;
/** Response time (ms) that gives min speed bonus */
const SLOW_THRESHOLD_MS = 5000;
const STREAK_BASE = 3;
const STREAK_MULTIPLIER_PER_STREAK = 0.1;

/** Maps character class to their primary discipline for bonus damage */
const CLASS_DISCIPLINE: Record<CharacterClass, MusicDiscipline> = {
  bard: 'pitch',
  drummer: 'rhythm',
  harmonist: 'harmony',
  conductor: 'dynamics',
};

/**
 * Calculate speed bonus (1.0 - 1.5x) based on response time.
 * Faster answers = higher bonus.
 */
export function calculateSpeedBonus(responseTimeMs: number): number {
  if (responseTimeMs <= FAST_THRESHOLD_MS) return MAX_SPEED_BONUS;
  if (responseTimeMs >= SLOW_THRESHOLD_MS) return MIN_SPEED_BONUS;
  const t =
    (responseTimeMs - FAST_THRESHOLD_MS) /
    (SLOW_THRESHOLD_MS - FAST_THRESHOLD_MS);
  return MAX_SPEED_BONUS - t * (MAX_SPEED_BONUS - MIN_SPEED_BONUS);
}

/** Check if the challenge discipline matches the character's class specialty */
export function hasClassBonus(
  characterClass: CharacterClass,
  challenge: MusicChallenge
): boolean {
  return CLASS_DISCIPLINE[characterClass] === challenge.discipline;
}

/** Calculate streak multiplier: 1.0 base, +0.1 per streak above 2 (so 3+ gives bonus) */
export function calculateStreakMultiplier(streak: number): number {
  if (streak < STREAK_BASE) return 1.0;
  return 1.0 + (streak - STREAK_BASE + 1) * STREAK_MULTIPLIER_PER_STREAK;
}

/**
 * Calculate damage and result from a turn.
 * @param selfDamageMaxHp - Attacker's max HP (for wrong-answer self-damage)
 */
export function calculateTurnResult(
  correct: boolean,
  attackerClass: CharacterClass,
  challenge: MusicChallenge,
  streak: number,
  responseTimeMs: number,
  defenderMaxHp: number,
  selfDamageMaxHp?: number
): ChallengeResult {
  const speedBonus = calculateSpeedBonus(responseTimeMs);
  const classBonus = hasClassBonus(attackerClass, challenge) ? CLASS_BONUS_MULTIPLIER : 1.0;
  const streakMultiplier = calculateStreakMultiplier(streak);

  if (!correct) {
    const hpForSelfDamage = selfDamageMaxHp ?? defenderMaxHp;
    const selfDamage = Math.ceil(hpForSelfDamage * SELF_DAMAGE_PERCENT);
    return {
      correct: false,
      damage: 0,
      selfDamage,
      speedBonus,
      classBonus,
      streakMultiplier,
    };
  }

  const damage = Math.ceil(
    BASE_DAMAGE * speedBonus * classBonus * streakMultiplier
  );

  return {
    correct: true,
    damage,
    selfDamage: 0,
    speedBonus,
    classBonus,
    streakMultiplier,
  };
}
