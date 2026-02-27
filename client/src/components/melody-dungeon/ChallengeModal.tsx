import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { TileType } from '@/lib/gameLogic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import DynamicsChallenge from './challenges/DynamicsChallenge';

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}

const ALL_CHALLENGE_TYPES: ChallengeType[] = ['noteReading', 'rhythmTap', 'interval', 'dynamics'];
const BOSS_ROUNDS = 3;

const TILE_THEME: Record<string, { title: string; borderColor: string; bgColor: string }> = {
  [TileType.Enemy]: {
    title: 'Enemy Encounter!',
    borderColor: 'border-red-500',
    bgColor: 'from-red-950/90 to-gray-900/95',
  },
  [TileType.Boss]: {
    title: 'Boss Battle!',
    borderColor: 'border-purple-500',
    bgColor: 'from-purple-950/90 to-gray-900/95',
  },
  [TileType.Door]: {
    title: 'Locked Door!',
    borderColor: 'border-amber-500',
    bgColor: 'from-amber-950/90 to-gray-900/95',
  },
  [TileType.Treasure]: {
    title: 'Treasure Found!',
    borderColor: 'border-yellow-500',
    bgColor: 'from-yellow-950/90 to-gray-900/95',
  },
};

const DEFAULT_THEME = {
  title: 'Music Challenge!',
  borderColor: 'border-indigo-500',
  bgColor: 'from-indigo-950/90 to-gray-900/95',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ChallengeRenderer({ type, difficulty, onResult }: {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}) {
  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge difficulty={difficulty} onResult={onResult} />;
    case 'rhythmTap':
      return <RhythmTapChallenge difficulty={difficulty} onResult={onResult} />;
    case 'interval':
      return <IntervalChallenge difficulty={difficulty} onResult={onResult} />;
    case 'dynamics':
      return <DynamicsChallenge difficulty={difficulty} onResult={onResult} />;
  }
}

const BossBattle: React.FC<{
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}> = ({ difficulty, onResult }) => {
  const rounds = useMemo(
    () => Array.from({ length: BOSS_ROUNDS }, () => pickRandom(ALL_CHALLENGE_TYPES)),
    []
  );
  const [currentRound, setCurrentRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [roundTransition, setRoundTransition] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  const handleRoundResult = useCallback((correct: boolean) => {
    const newHits = hits + (correct ? 1 : 0);
    const newMisses = misses + (correct ? 0 : 1);
    setHits(newHits);
    setMisses(newMisses);
    setLastResult(correct);

    const nextRound = currentRound + 1;
    if (nextRound >= BOSS_ROUNDS) {
      // Boss defeated if majority correct
      const won = newHits > newMisses;
      setTimeout(() => onResult(won), 1200);
    } else {
      setRoundTransition(true);
      setTimeout(() => {
        setCurrentRound(nextRound);
        setLastResult(null);
        setRoundTransition(false);
      }, 1200);
    }
  }, [currentRound, hits, misses, onResult]);

  const roundPips = Array.from({ length: BOSS_ROUNDS }, (_, i) => {
    if (i < currentRound) {
      // Past round
      const wasHit = i < hits + misses
        ? (i < hits || (i - hits) >= misses ? i < hits : false)
        : false;
      // Simplified: track results array
      return null; // handled below
    }
    return null;
  });

  // Build results array for pip display
  const results: (boolean | null)[] = [];
  let h = hits, m = misses;
  for (let i = 0; i < BOSS_ROUNDS; i++) {
    if (i < currentRound) {
      // We need to reconstruct — just use hits/misses in order
      results.push(null); // placeholder, will recalculate
    } else if (i === currentRound && lastResult !== null) {
      results.push(lastResult);
    } else {
      results.push(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Round indicator */}
      <div className="flex items-center gap-1.5">
        {rounds.map((_, i) => {
          let color = 'bg-gray-600';
          if (i < currentRound) {
            // Reconstruct: first `hits` correct rounds happened among the first currentRound rounds
            // Simpler: just show current round indicator
            color = 'bg-gray-500';
          }
          if (i === currentRound) color = 'ring-2 ring-purple-400 bg-purple-700';
          if (i > currentRound) color = 'bg-gray-700';
          return (
            <div key={i} className={`w-3 h-3 rounded-full ${color}`} />
          );
        })}
        <span className="text-xs text-gray-400 ml-2">
          Round {currentRound + 1}/{BOSS_ROUNDS}
        </span>
      </div>

      {/* Health bar for boss */}
      <div className="w-full max-w-[200px]">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Boss HP</span>
          <span>{Math.max(0, BOSS_ROUNDS - hits)}/{BOSS_ROUNDS}</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500"
            style={{ width: `${(Math.max(0, BOSS_ROUNDS - hits) / BOSS_ROUNDS) * 100}%` }}
          />
        </div>
      </div>

      {/* Challenge for current round */}
      {!roundTransition ? (
        <ChallengeRenderer
          key={currentRound}
          type={rounds[currentRound]}
          difficulty={difficulty}
          onResult={handleRoundResult}
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss!'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Next round...</p>
        </div>
      )}
    </div>
  );
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, onResult }) => {
  const theme = TILE_THEME[tileType] || DEFAULT_THEME;
  const isBoss = tileType === TileType.Boss;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-md rounded-2xl border-2 ${theme.borderColor}
          bg-gradient-to-b ${theme.bgColor} p-5 shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        <h2 className="text-center text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          {theme.title}
        </h2>

        {isBoss ? (
          <BossBattle difficulty={difficulty} onResult={onResult} />
        ) : (
          <ChallengeRenderer type={challengeType} difficulty={difficulty} onResult={onResult} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
