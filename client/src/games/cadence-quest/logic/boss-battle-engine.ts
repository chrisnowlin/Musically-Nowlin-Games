import {
  BattleState,
  MusicChallenge,
  ChallengeResult,
  BossEncounter,
  BossStage,
  BossAbility,
} from '@shared/types/cadence-quest';
import { generateChallenge } from '@shared/logic/challenge-pool';
import { BOSSES, getBossById } from './boss-data';

export interface BossBattleState extends BattleState {
  boss: BossEncounter;
  currentStageIndex: number;
  bossHp: number;
  playerHp: number;
  activeAbilities: BossAbilityEffect[];
  stageCombo: number;
}

export interface BossAbilityEffect {
  abilityId: string;
  type: 'buff_self' | 'debuff_player' | 'environment_change' | 'heal';
  duration: number;
  value?: number;
  appliesToPlayer: boolean;
}

export function createBossBattle(
  baseBattle: BattleState,
  bossId: string,
  playerMaxHp: number
): BossBattleState {
  const boss = getBossById(bossId);
  if (!boss) {
    throw new Error(`Boss not found: ${bossId}`);
  }

  return {
    ...baseBattle,
    boss,
    currentStageIndex: 0,
    bossHp: boss.maxHp,
    playerHp: playerMaxHp,
    activeAbilities: [],
    stageCombo: 0,
    isBoss: true,
  };
}

export function getCurrentStage(battle: BossBattleState): BossStage {
  return battle.boss.stages[battle.currentStageIndex];
}

export function generateBossChallenge(
  battle: BossBattleState,
  playerStats: any
): MusicChallenge {
  const stage = getCurrentStage(battle);

  const challenge = generateChallenge(stage.discipline, stage.difficulty);

  return challenge;
}

export function resolveBossChallenge(
  battle: BossBattleState,
  correct: boolean,
  responseTimeMs: number
): ChallengeResult & {
  battleState: BossBattleState;
  stageProgressed: boolean;
} {
  const stage = getCurrentStage(battle);
  const result: ChallengeResult & {
    battleState: BossBattleState;
    stageProgressed: boolean;
  } = {
    correct,
    damage: correct ? stage.correctAnswerDamage : 0,
    selfDamage: correct ? 0 : stage.wrongAnswerDamage,
    speedBonus: 0,
    classBonus: 0,
    streakMultiplier: 1,
    battleState: { ...battle },
    stageProgressed: false,
  };

  result.battleState.stageCombo = correct ? battle.stageCombo + 1 : 0;

  if (correct) {
    result.battleState.bossHp = Math.max(0, battle.bossHp - result.damage);

    const correctAbilities = battle.boss.abilities.filter(
      a => a.trigger === 'on_correct'
    );
    for (const ability of correctAbilities) {
      result.battleState = applyAbility(result.battleState, ability);
    }
  } else {
    result.battleState.playerHp = Math.max(0, battle.playerHp - result.selfDamage);

    const wrongAbilities = battle.boss.abilities.filter(
      a => a.trigger === 'on_wrong'
    );
    for (const ability of wrongAbilities) {
      result.battleState = applyAbility(result.battleState, ability);
    }
  }

  const hpThresholdAbilities = battle.boss.abilities.filter(
    a =>
      a.trigger === 'on_hp_threshold' &&
      a.triggerValue !== undefined &&
      battle.bossHp > a.triggerValue &&
      result.battleState.bossHp <= a.triggerValue
  );
  for (const ability of hpThresholdAbilities) {
    result.battleState = applyAbility(result.battleState, ability);
  }

  const bossHpPercent = result.battleState.bossHp / battle.boss.maxHp;
  const stageTargetHp = 1 - (battle.currentStageIndex + 1) / battle.boss.stages.length;

  if (bossHpPercent <= stageTargetHp && battle.currentStageIndex < battle.boss.stages.length - 1) {
    result.stageProgressed = true;
    result.battleState.currentStageIndex++;
    result.battleState.stageCombo = 0;

    const newStage = getCurrentStage(result.battleState);
    if (newStage.abilityTrigger) {
      const ability = battle.boss.abilities.find(a => a.id === newStage.abilityTrigger);
      if (ability) {
        result.battleState = applyAbility(result.battleState, ability);
      }
    }
  }

  result.battleState.activeAbilities = result.battleState.activeAbilities
    .map(a => ({ ...a, duration: a.duration - 1 }))
    .filter(a => a.duration > 0);

  return result;
}

function applyAbility(battle: BossBattleState, ability: BossAbility): BossBattleState {
  const newState = { ...battle };

  switch (ability.effect.type) {
    case 'buff_self':
      newState.activeAbilities.push({
        abilityId: ability.id,
        type: 'buff_self',
        duration: ability.effect.duration || 99,
        value: ability.effect.value,
        appliesToPlayer: false,
      });
      break;

    case 'debuff_player':
      newState.activeAbilities.push({
        abilityId: ability.id,
        type: 'debuff_player',
        duration: ability.effect.duration || 1,
        value: ability.effect.value,
        appliesToPlayer: true,
      });
      break;

    case 'environment_change':
      if (ability.effect.value && typeof ability.effect.value === 'number') {
        newState.activeAbilities.push({
          abilityId: ability.id,
          type: 'environment_change',
          duration: ability.effect.duration || 1,
          value: ability.effect.value,
          appliesToPlayer: false,
        });
      }
      break;

    case 'heal':
      if (ability.effect.value) {
        newState.bossHp = Math.min(
          battle.boss.maxHp,
          battle.bossHp + Math.floor(battle.boss.maxHp * ability.effect.value)
        );
      }
      break;
  }

  return newState;
}

export function calculateModifiedDamage(
  baseDamage: number,
  battle: BossBattleState
): { damageToBoss: number; damageToPlayer: number } {
  let damageToBoss = baseDamage;
  let damageToPlayer = 0;

  for (const effect of battle.activeAbilities) {
    if (effect.type === 'buff_self' && !effect.appliesToPlayer && effect.value) {
      damageToBoss *= (1 - effect.value);
    }
    if (effect.type === 'debuff_player' && !effect.appliesToPlayer && effect.value) {
      damageToPlayer += baseDamage * effect.value;
    }
  }

  return {
    damageToBoss: Math.max(0, Math.floor(damageToBoss)),
    damageToPlayer: Math.max(0, Math.floor(damageToPlayer)),
  };
}

export function isBossDefeated(battle: BossBattleState): boolean {
  return battle.bossHp <= 0;
}

export function isPlayerDefeated(battle: BossBattleState): boolean {
  return battle.playerHp <= 0;
}