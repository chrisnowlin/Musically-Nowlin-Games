import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { BattleState, MusicChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import { processAnswer, toBattleCharacter } from '@shared/logic/battle-engine';
import { validateAnswer } from '@shared/logic/challenge-pool';
import { generateChallengeForRegion, generateChallenge } from '@shared/logic/challenge-pool';
import type { Character } from '@shared/types/cadence-quest';
import type { RegionEncounter } from '@shared/types/cadence-quest';
import BattleHUD from './BattleHUD';
import ChallengePanel from './ChallengePanel';
import { getEncounter } from './logic/region-encounters';
import { simulateAIAnswer } from './logic/ai-opponent';
import { useWebSocket } from './logic/useWebSocket';

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
  onVictory: (winner: 'player' | 'opponent') => void;
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
  const { emit, on } = useWebSocket();
  const encounter: RegionEncounter | null =
    type === 'pve' ? getEncounter(regionId!, encounterIndex!) : null;
  const disciplineFocus = encounter?.disciplineFocus ?? 'theory';
  const opponentName = encounter?.enemyName ?? opponent.name;

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

  const [resolving, setResolving] = useState(false);
  const roomIdRef = useRef(battleRoomId);

  const spawnChallenge = useCallback(() => {
    const difficulty = isBoss ? 'hard' : 'medium';
    const challenge = type === 'pve'
      ? generateChallengeForRegion(disciplineFocus, difficulty)
      : generateChallenge('theory', difficulty);
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
    if (state.phase === 'victory') onVictory('player');
    if (state.phase === 'defeat') onVictory('opponent');
  }, [state.phase, onVictory]);

  const handleAnswer = useCallback(
    (answer: ChallengeAnswer) => {
      if (!state.currentChallenge || resolving) return;

      if (type === 'pvp' && battleRoomId) {
        setResolving(true);
        emit('battle:answer', { battleRoomId, answer });
        return;
      }

      setResolving(true);
      const { result, nextState } = processAnswer(state, answer, validateAnswer);
      setState(nextState);
      setResolving(false);
      if (nextState.phase === 'victory' || nextState.phase === 'defeat') return;
      if (nextState.activeTurn === 'opponent') {
        setState((s) => ({ ...s, phase: 'waiting' }));
        const difficulty = isBoss ? 'hard' : 'medium';
        const aiChallenge = type === 'pve'
          ? generateChallengeForRegion(disciplineFocus, difficulty)
          : generateChallenge('theory', difficulty);
        const shownAt = Date.now();
        setState((s) => ({
          ...s,
          phase: 'challenge',
          currentChallenge: aiChallenge,
          challengeShownAt: shownAt,
          activeTurn: 'opponent',
        }));
        simulateAIAnswer(aiChallenge, difficulty, shownAt).then((aiAnswer) => {
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
    <div className="flex flex-col gap-6 p-4 max-w-lg mx-auto">
      <BattleHUD
        player={state.player}
        opponent={state.opponent}
        activeTurn={state.activeTurn}
        streak={state.player.streak}
      />
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
        <div className="bg-gray-800/80 rounded-xl p-6 border border-purple-500/30">
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
