import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { TileType } from '@/lib/gameLogic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import { getChallengeTypesForFloor, pickRandom, generateBigBossSequence } from './challengeHelpers';

export interface BossBattleMeta {
  damageDealt: number;
  shieldUsed: boolean;
  potionsUsed: number;
}

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  maxHealth?: number;
  shieldCharm?: number;
  potions?: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
}

const BOSS_HP = 3;
const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

function getBossHp(tileType: TileType): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  return BOSS_HP;
}

function getBossLabel(tileType: TileType): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  return 'Dragon';
}

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
  [TileType.MiniBoss]: {
    title: 'Mini Boss!',
    borderColor: 'border-orange-500',
    bgColor: 'from-orange-950/90 to-gray-900/95',
  },
  [TileType.BigBoss]: {
    title: 'BOSS BATTLE!',
    borderColor: 'border-rose-500',
    bgColor: 'from-rose-950/90 to-gray-900/95',
  },
};

const DEFAULT_THEME = {
  title: 'Music Challenge!',
  borderColor: 'border-indigo-500',
  bgColor: 'from-indigo-950/90 to-gray-900/95',
};

function ChallengeRenderer({ type, difficulty, floorNumber, onResult, slowRhythm, showIntervalHint }: {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean) => void;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
}) {
  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge floorNumber={floorNumber} onResult={onResult} />;
    case 'rhythmTap':
      return <RhythmTapChallenge difficulty={difficulty} onResult={onResult} slowMode={slowRhythm} />;
    case 'interval':
      return <IntervalChallenge difficulty={difficulty} onResult={onResult} showHint={showIntervalHint} />;
  }
}

const BossBattle: React.FC<{
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  maxHealth: number;
  shieldCharm: number;
  potions: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
}> = ({ tileType, difficulty, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions, dragonBane, slowRhythm, showIntervalHint }) => {
  const maxBossHp = useMemo(() => getBossHp(tileType), [tileType]);
  const bossLabel = useMemo(() => getBossLabel(tileType), [tileType]);

  // For Dragon/MiniBoss: random challenge each round
  const challengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);

  // For BigBoss: pre-generated 8-question sequence
  const bigBossSequence = useMemo(
    () => tileType === TileType.BigBoss ? generateBigBossSequence(floorNumber, difficulty) : null,
    [tileType, floorNumber, difficulty]
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [bossHp, setBossHp] = useState(() => {
    if (dragonBane && tileType === TileType.Dragon) {
      return Math.max(1, maxBossHp - 1);
    }
    return maxBossHp;
  });
  const [effectiveHealth, setEffectiveHealth] = useState(playerHealth);
  const [shieldActive, setShieldActive] = useState(shieldCharm > 0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [potionsRemaining, setPotionsRemaining] = useState(potions);
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [roundTransition, setRoundTransition] = useState(false);
  const [showItemPhase, setShowItemPhase] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  // Determine current challenge based on boss type
  const currentChallenge = useMemo(() => {
    if (bigBossSequence) {
      // BigBoss uses pre-generated sequence
      return bigBossSequence[currentRound % bigBossSequence.length];
    }
    // Dragon/MiniBoss: random type, player's difficulty
    return { type: pickRandom(challengeTypes), difficulty };
  }, [bigBossSequence, challengeTypes, difficulty, currentRound]);

  const handleUsePotion = useCallback(() => {
    if (potionsRemaining > 0 && effectiveHealth < maxHealth) {
      setPotionsRemaining((p) => p - 1);
      setPotionsUsed((p) => p + 1);
      setEffectiveHealth((h) => Math.min(h + 1, maxHealth));
    }
  }, [potionsRemaining, effectiveHealth, maxHealth]);

  const proceedToNextRound = useCallback(() => {
    setCurrentRound((r) => r + 1);
    setLastResult(null);
    setShowItemPhase(false);
    setRoundTransition(false);
  }, []);

  const handleRoundResult = useCallback((correct: boolean) => {
    setLastResult(correct);

    if (correct) {
      const newBossHp = bossHp - 1;
      setBossHp(newBossHp);
      if (newBossHp <= 0) {
        // Boss defeated — skip item phase
        setRoundTransition(true);
        setTimeout(() => onResult(true, { damageDealt, shieldUsed, potionsUsed }), 1200);
      } else {
        // Boss still alive — show result then item phase
        setRoundTransition(true);
        setTimeout(() => {
          setShowItemPhase(true);
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
        // Player defeated — skip item phase
        setRoundTransition(true);
        setTimeout(() => onResult(false, { damageDealt: damageDealt + 1, shieldUsed: newShieldUsed, potionsUsed }), 1200);
      } else {
        // Player still alive — show result then item phase
        setRoundTransition(true);
        setTimeout(() => {
          setShowItemPhase(true);
        }, 1200);
      }
    }
  }, [bossHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, potionsUsed, onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Health bars */}
      <div className="w-full max-w-[200px] space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{bossLabel} HP</span>
            <span>{bossHp}/{maxBossHp}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Your HP{shieldActive ? ' (shielded)' : ''}</span>
            <span>{effectiveHealth}/{maxHealth}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${(effectiveHealth / maxHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge for current round */}
      {showItemPhase ? (
        <div className="py-6 text-center space-y-3">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < playerHealth && (
              <button
                onClick={handleUsePotion}
                className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors"
              >
                Use Potion ({potionsRemaining})
              </button>
            )}
            <button
              onClick={proceedToNextRound}
              className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : !roundTransition ? (
        <ChallengeRenderer
          key={currentRound}
          type={currentChallenge.type}
          difficulty={currentChallenge.difficulty}
          floorNumber={floorNumber}
          onResult={handleRoundResult}
          slowRhythm={slowRhythm}
          showIntervalHint={showIntervalHint}
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Preparing...</p>
        </div>
      )}
    </div>
  );
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0, dragonBane, slowRhythm, showIntervalHint }) => {
  const theme = TILE_THEME[tileType] || DEFAULT_THEME;
  const isBoss = tileType === TileType.Dragon || tileType === TileType.MiniBoss || tileType === TileType.BigBoss;

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
          <BossBattle
            tileType={tileType}
            difficulty={difficulty}
            floorNumber={floorNumber}
            onResult={onResult}
            playerHealth={playerHealth}
            maxHealth={maxHealth}
            shieldCharm={shieldCharm}
            potions={potions}
            dragonBane={dragonBane}
            slowRhythm={slowRhythm}
            showIntervalHint={showIntervalHint}
          />
        ) : (
          <ChallengeRenderer type={challengeType} difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} slowRhythm={slowRhythm} showIntervalHint={showIntervalHint} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
