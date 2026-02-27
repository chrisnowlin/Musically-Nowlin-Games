/**
 * Cadence Quest - Battle Engine
 * Deterministic turn resolution, streak tracking, and special abilities.
 * Used by both client (PvE) and server (PvP arbitration).
 */

import type {
  BattleState,
  BattleCharacter,
  MusicChallenge,
  ChallengeAnswer,
  ChallengeResult,
  CharacterClass,
} from '../types/cadence-quest';
import {
  calculateTurnResult,
  calculateStreakMultiplier,
} from './damage-calculator';

export const MAX_HEALTH = 100;

/** Create a battle-ready character from base stats */
export function toBattleCharacter(
  id: string,
  name: string,
  characterClass: CharacterClass,
  maxHp: number = MAX_HEALTH,
  isPlayer?: boolean
): BattleCharacter {
  return {
    id,
    name,
    class: characterClass,
    hp: maxHp,
    maxHp: maxHp,
    streak: 0,
    isPlayer,
  };
}

/** Validator type for processAnswer - import validateAnswer from challenge-pool */
export type AnswerValidator = (
  challenge: MusicChallenge,
  answer: ChallengeAnswer
) => boolean;

/**
 * Process an answer and return the result, plus updated battle state.
 */
export function processAnswer(
  state: BattleState,
  answer: ChallengeAnswer,
  validateAnswer: (challenge: MusicChallenge, answer: ChallengeAnswer) => boolean
): {
  result: ChallengeResult;
  nextState: BattleState;
} {
  const challenge = state.currentChallenge;
  if (!challenge || challenge.id !== answer.challengeId) {
    throw new Error('Invalid challenge for answer');
  }

  const attacker = state.activeTurn === 'player' ? state.player : state.opponent;
  const defender = state.activeTurn === 'player' ? state.opponent : state.player;
  const correct = validateAnswer(challenge, answer);

  const result = calculateTurnResult(
    correct,
    attacker.class,
    challenge,
    attacker.streak,
    answer.responseTimeMs,
    defender.maxHp,
    attacker.maxHp
  );

  const newAttackerStreak = correct ? attacker.streak + 1 : 0;
  const newDefenderHp = Math.max(
    0,
    defender.hp - result.damage
  );
  const newAttackerHp = Math.max(
    0,
    attacker.hp - result.selfDamage
  );

  const updatedAttacker: BattleCharacter = {
    ...attacker,
    streak: newAttackerStreak,
    hp: newAttackerHp,
  };
  const updatedDefender: BattleCharacter = {
    ...defender,
    hp: newDefenderHp,
  };

  const player = state.activeTurn === 'player' ? updatedAttacker : updatedDefender;
  const opponent = state.activeTurn === 'player' ? updatedDefender : updatedAttacker;

  const battleOver = newDefenderHp <= 0 || newAttackerHp <= 0;
  const playerWins =
    (newDefenderHp <= 0 && state.activeTurn === 'player') ||
    (newAttackerHp <= 0 && state.activeTurn === 'opponent');
  const opponentWins =
    (newDefenderHp <= 0 && state.activeTurn === 'opponent') ||
    (newAttackerHp <= 0 && state.activeTurn === 'player');

  const nextState: BattleState = {
    ...state,
    phase: battleOver
      ? playerWins
        ? 'victory'
        : 'defeat'
      : 'resolving',
    player: state.activeTurn === 'player' ? updatedAttacker : updatedDefender,
    opponent: state.activeTurn === 'player' ? updatedDefender : updatedAttacker,
    currentChallenge: null,
    challengeShownAt: null,
    turnCount: state.turnCount + 1,
    activeTurn: state.activeTurn === 'player' ? 'opponent' : 'player',
  };

  return { result, nextState };
}

/**
 * Apply Resonance (Harmonist): correct answer heals 10% max HP
 */
export function applyResonanceHeal(
  character: BattleCharacter,
  healPercent: number = 0.1
): BattleCharacter {
  const heal = Math.ceil(character.maxHp * healPercent);
  return {
    ...character,
    hp: Math.min(character.maxHp, character.hp + heal),
  };
}

/**
 * Check if a special ability is available (streak >= required)
 */
export function canUseAbility(
  streak: number,
  streakRequired: number
): boolean {
  return streak >= streakRequired;
}

/**
 * Get streak multiplier for display
 */
export { calculateStreakMultiplier };
