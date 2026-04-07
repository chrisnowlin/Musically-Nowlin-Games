import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { BattleState, MusicChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import { processAnswer, toBattleCharacter } from '@shared/logic/battle-engine';
import { validateAnswer } from '@shared/logic/challenge-pool';
import type { Character } from '@shared/types/cadence-quest';
import type { RegionEncounter } from '@shared/types/cadence-quest';
import BattleMap from './BattleMap';
import ChallengePanel from './ChallengePanel';
import { getEncounter } from './logic/region-encounters';
import { simulateAIAnswer } from './logic/ai-opponent';
import { useWebSocket } from './logic/useWebSocket';
import { BattleAudio } from './audio/battle-audio';
import { CadenceChallengeAdapter, mergeSkillTreeEffects } from './logic/challenge-adapter';
import { xpRewardForBattle, goldRewardForBattle, processXpGain } from './logic/experience-system';
import { generateBossDrops } from './logic/boss-drops';
import { BOSSES } from './logic/boss-data';

interface BattleScreenProps {
  battleId: string;
  type: 'pve' | 'pvp';
  playerCharacter: Character;
  opponent: { name: string; class: Character['class']; maxHp: number };
  regionId?: string;
  encounterIndex?: number;
  isBoss?: boolean;
  battleRoomId?: string;
  initialChallenge?: MusicChallenge;
  challengeShownAt?: number;
  onVictory: (winner: 'player' | 'opponent', details?: {
    xpEarned: number;
    goldEarned: number;
    itemsDropped?: any[];
    leveledUp?: boolean;
    newLevel?: number;
  }) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({
  battleId,
  type,
  playerCharacter,
  opponent,
  regionId = 'rhythm-realm',
  encounterIndex = 0,
  isBoss = false,
  battleRoomId,
  initialChallenge,
  challengeShownAt,
  onVictory,
}) => {
  const { emit, on } = useWebSocket(type);
  const encounter: RegionEncounter | null =
    type === 'pve' ? getEncounter(regionId!, encounterIndex!) : null;
  const disciplineFocus = encounter?.disciplineFocus ?? 'theory';
  const opponentName = encounter?.enemyName ?? opponent.name;
  const battleAudio = useRef(new BattleAudio());

  const skillTreeEffects = useRef(
    mergeSkillTreeEffects(playerCharacter.stats.skillTree)
  );
  const challengeAdapter = useRef(
    new CadenceChallengeAdapter(
      playerCharacter.class,
      playerCharacter.stats.level,
      skillTreeEffects.current
    )
  );

  useEffect(() => {
    void battleAudio.current['core'].resumeAudioContext();
  }, []);

  const [state, setState] = useState<BattleState>(() => {
    const player = toBattleCharacter(
      playerCharacter.id,
      playerCharacter.name,
      playerCharacter.class,
      playerCharacter.stats.maxHp,
      true
    );
    const opp = toBattleCharacter(
      `opp-${battleId}`,
      opponentName,
      opponent.class,
      opponent.maxHp,
      false
    );
    const initial: BattleState = {
      id: battleId,
      type,
      phase: type === 'pvp' && initialChallenge ? 'challenge' : 'challenge',
      player,
      opponent: opp,
      activeTurn: 'player',
      currentChallenge: type === 'pvp' && initialChallenge ? initialChallenge : null,
      challengeShownAt: type === 'pvp' && challengeShownAt ? challengeShownAt : null,
      turnCount: 1,
      regionId: type === 'pve' ? regionId : 'pvp-arena',
      isBoss,
    };
    return initial;
  });

  const [sessionStats, setSessionStats] = useState<{
    correct: number;
    total: number;
    maxCombo: number;
    totalResponseTime: number;
  }>({
    correct: 0,
    total: 0,
    maxCombo: 0,
    totalResponseTime: 0,
  });

  const [resolving, setResolving] = useState(false);
  const roomIdRef = useRef(battleRoomId);

  const spawnChallenge = useCallback(() => {
    const challenge = type === 'pve'
      ? challengeAdapter.current.generateChallengeForRegion(disciplineFocus, isBoss)
      : challengeAdapter.current.generateChallenge(disciplineFocus, isBoss);
    setState((s) => ({
      ...s,
      phase: 'challenge',
      currentChallenge: challenge,
      challengeShownAt: Date.now(),
    }));
  }, [disciplineFocus, type, isBoss]);

  useEffect(() => {
    if (type === 'pvp' && battleRoomId) {
      roomIdRef.current = battleRoomId;
      emit('battle:join', { battleRoomId });
    }
  }, [type, battleRoomId, emit]);

  useEffect(() => {
    if (type === 'pvp') {
      const unsubResult = on('battle:result', (payload: unknown) => {
        const p = payload as { state: BattleState };
        setState(p.state);
        setResolving(false);
      });
      const unsubChallenge = on('battle:challenge', (payload: unknown) => {
        const p = payload as { challenge: MusicChallenge; shownAt: number; state: BattleState };
        setState(p.state);
      });
      const unsubEnded = on('battle:ended', (payload: unknown) => {
        const p = payload as { state: BattleState };
        setState(p.state);
      });
      const unsubLeft = on('battle:opponent_left', () => {
        onVictory('player');
      });
      return () => {
        unsubResult();
        unsubChallenge();
        unsubEnded();
        unsubLeft();
      };
    }
  }, [type, on, onVictory]);

  useEffect(() => {
    if (type === 'pve' && state.phase === 'challenge' && !state.currentChallenge) {
      spawnChallenge();
    }
  }, [type, state.phase, state.currentChallenge, spawnChallenge]);

  useEffect(() => {
    if (state.phase === 'victory') {
      battleAudio.current.playVictoryFanfare();

      const xpEarned = xpRewardForBattle(isBoss, playerCharacter.stats.level);
      const goldEarned = goldRewardForBattle(isBoss, playerCharacter.stats.level);

      let itemsDropped: any[] = [];
      let leveledUp = false;
      let newLevel: number | undefined;

      if (isBoss && regionId) {
        const boss = BOSSES.find(b => b.regionId === regionId);
        if (boss) {
          itemsDropped = generateBossDrops(boss);
        }
      }

      const xpResult = processXpGain(playerCharacter, xpEarned);
      if (xpResult.leveledUp) {
        leveledUp = true;
        newLevel = xpResult.newLevel;
      }

      onVictory('player', {
        xpEarned,
        goldEarned,
        itemsDropped,
        leveledUp,
        newLevel,
      });
    }
    if (state.phase === 'defeat') {
      battleAudio.current.playDefeatSound();
      onVictory('opponent', {
        xpEarned: Math.floor(xpRewardForBattle(isBoss, playerCharacter.stats.level) * 0.5),
        goldEarned: Math.floor(goldRewardForBattle(isBoss, playerCharacter.stats.level) * 0.25),
      });
    }
  }, [state.phase, isBoss, regionId, playerCharacter, onVictory]);

  const handleAnswer = useCallback(
    (answer: ChallengeAnswer) => {
      if (!state.currentChallenge || resolving) return;

      if (type === 'pvp' && battleRoomId) {
        setResolving(true);
        emit('battle:answer', { battleRoomId, answer });
        return;
      }

      setResolving(true);

      const responseTime = state.challengeShownAt ? Date.now() - state.challengeShownAt : 0;
      const isCorrect = validateAnswer(state.currentChallenge, answer);

      setSessionStats(prev => ({
        total: prev.total + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        maxCombo: isCorrect ? Math.max(prev.maxCombo, state.player.streak + 1) : prev.maxCombo,
        totalResponseTime: prev.totalResponseTime + responseTime,
      }));

      const { result, nextState } = processAnswer(state, answer, validateAnswer);

      battleAudio.current.playAttackSound(playerCharacter.class, isCorrect);

      setState(nextState);
      setResolving(false);
      if (nextState.phase === 'victory' || nextState.phase === 'defeat') return;
      if (nextState.activeTurn === 'opponent') {
        setState((s) => ({ ...s, phase: 'waiting' }));
        const aiChallenge = type === 'pve'
          ? challengeAdapter.current.generateChallengeForRegion(disciplineFocus, isBoss)
          : challengeAdapter.current.generateChallenge(disciplineFocus, isBoss);
        const shownAt = Date.now();
        setState((s) => ({
          ...s,
          phase: 'challenge',
          currentChallenge: aiChallenge,
          challengeShownAt: shownAt,
          activeTurn: 'opponent',
        }));
        simulateAIAnswer(aiChallenge, aiChallenge.difficulty, shownAt).then((aiAnswer) => {
          const aiState = { ...nextState, phase: 'challenge' as const, currentChallenge: aiChallenge, challengeShownAt: shownAt };
          const { nextState: aiNextState } = processAnswer(aiState, aiAnswer, validateAnswer);
          setState(aiNextState);
          if (aiNextState.phase === 'victory' || aiNextState.phase === 'defeat') return;
          setTimeout(() => {
            setState((s) => ({
              ...s,
              ...aiNextState,
              phase: 'challenge' as const,
              currentChallenge: null,
              challengeShownAt: null,
              activeTurn: 'player' as const,
            }));
            spawnChallenge();
          }, 800);
        });
      } else {
        setTimeout(spawnChallenge, 800);
      }
    },
    [state, resolving, spawnChallenge, type, battleRoomId, emit, disciplineFocus, isBoss]
  );

  if (state.phase === 'victory' || state.phase === 'defeat') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className={`text-3xl font-bold drop-shadow-sm ${state.phase === 'victory' ? 'text-amber-600' : 'text-slate-600'}`}>
          {state.phase === 'victory' ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="text-purple-800">
          {state.phase === 'victory'
            ? 'You won the battle!'
            : 'Better luck next time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <BattleMap
        player={state.player}
        opponent={state.opponent}
        activeTurn={state.activeTurn}
        playerClass={playerCharacter.class}
        opponentClass={opponent.class}
        isBoss={isBoss}
        regionId={regionId}
      />
      
      <div className="flex justify-between items-center text-sm">
        <div className="bg-black/30 px-3 py-1 rounded text-purple-300">
          Streak: <span className="font-bold text-yellow-300">{state.player.streak}</span>
        </div>
        <div className="bg-black/30 px-3 py-1 rounded text-purple-300">
          Turn: <span className="font-bold">{state.turnCount}</span>
        </div>
      </div>
      
      {state.phase === 'waiting' && (
        <p className="text-center text-purple-800 animate-pulse">
          Opponent&apos;s turn...
        </p>
      )}
      {state.phase === 'challenge' && state.activeTurn === 'opponent' && (
        <p className="text-center text-purple-800 animate-pulse py-8">
          Opponent is answering...
        </p>
      )}
      {state.phase === 'challenge' && state.activeTurn === 'player' && state.currentChallenge && (
        <div className="w-[900px] bg-gray-800/80 rounded-xl p-6 border border-purple-500/30">
          <ChallengePanel
            challenge={state.currentChallenge as MusicChallenge}
            shownAt={state.challengeShownAt ?? Date.now()}
            onAnswer={handleAnswer}
            disabled={resolving}
          />
        </div>
      )}
    </div>
  );
};

export default BattleScreen;
