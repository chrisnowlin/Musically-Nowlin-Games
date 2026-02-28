import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { TileType } from '@/lib/gameLogic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import { getChallengeTypesForFloor, pickRandom } from './challengeHelpers';

export interface BossBattleMeta {
  damageDealt: number;
  shieldUsed: boolean;
}

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  shieldCharm?: number;
}

const BOSS_HP = 3;

const TILE_THEME: Record<string, { title: string; borderColor: string; bgColor: string }> = {
  [TileType.Enemy]: {
    title: 'Enemy Encounter!',
    borderColor: 'border-red-500',
    bgColor: 'from-red-950/90 to-gray-900/95',
  },
  [TileType.Dragon]: {
    title: 'Dragon Battle!',
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

function ChallengeRenderer({ type, difficulty, floorNumber, onResult }: {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean) => void;
}) {
  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge floorNumber={floorNumber} onResult={onResult} />;
    case 'rhythmTap':
      return <RhythmTapChallenge difficulty={difficulty} onResult={onResult} />;
    case 'interval':
      return <IntervalChallenge difficulty={difficulty} onResult={onResult} />;
  }
}

const BossBattle: React.FC<{
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  shieldCharm: number;
}> = ({ difficulty, floorNumber, onResult, playerHealth, shieldCharm }) => {
  const challengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);
  const [currentRound, setCurrentRound] = useState(0);
  const [dragonHp, setDragonHp] = useState(BOSS_HP);
  const [effectiveHealth, setEffectiveHealth] = useState(playerHealth);
  const [shieldActive, setShieldActive] = useState(shieldCharm > 0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [roundTransition, setRoundTransition] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  const currentChallengeType = useMemo(
    () => pickRandom(challengeTypes),
    [challengeTypes, currentRound]
  );

  const handleRoundResult = useCallback((correct: boolean) => {
    setLastResult(correct);

    if (correct) {
      const newDragonHp = dragonHp - 1;
      setDragonHp(newDragonHp);
      if (newDragonHp <= 0) {
        // Dragon defeated
        setTimeout(() => onResult(true, { damageDealt, shieldUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => {
          setCurrentRound((r) => r + 1);
          setLastResult(null);
          setRoundTransition(false);
        }, 1200);
      }
    } else {
      // Wrong answer — player takes damage
      let newHealth = effectiveHealth;
      let newShieldUsed = shieldUsed;
      if (shieldActive) {
        setShieldActive(false);
        newShieldUsed = true;
        setShieldUsed(true);
      } else {
        newHealth = effectiveHealth - 1;
        setEffectiveHealth(newHealth);
        setDamageDealt((d) => d + 1);
      }

      if (newHealth <= 0) {
        // Player defeated
        setTimeout(() => onResult(false, { damageDealt: damageDealt + 1, shieldUsed: newShieldUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => {
          setCurrentRound((r) => r + 1);
          setLastResult(null);
          setRoundTransition(false);
        }, 1200);
      }
    }
  }, [dragonHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Health bars */}
      <div className="w-full max-w-[200px] space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Dragon HP</span>
            <span>{dragonHp}/{BOSS_HP}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500"
              style={{ width: `${(dragonHp / BOSS_HP) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Your HP{shieldActive ? ' (shielded)' : ''}</span>
            <span>{effectiveHealth}/{playerHealth}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${(effectiveHealth / playerHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge for current round */}
      {!roundTransition ? (
        <ChallengeRenderer
          key={currentRound}
          type={currentChallengeType}
          difficulty={difficulty}
          floorNumber={floorNumber}
          onResult={handleRoundResult}
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Next round...</p>
        </div>
      )}
    </div>
  );
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, floorNumber, onResult, playerHealth = 5, shieldCharm = 0 }) => {
  const theme = TILE_THEME[tileType] || DEFAULT_THEME;
  const isDragon = tileType === TileType.Dragon;

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

        {isDragon ? (
          <BossBattle difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} playerHealth={playerHealth} shieldCharm={shieldCharm} />
        ) : (
          <ChallengeRenderer type={challengeType} difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
