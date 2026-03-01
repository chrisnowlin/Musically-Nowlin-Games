import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import { TileType } from './logic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import VocabularyChallenge from './challenges/VocabularyChallenge';
import type { VocabCategory } from './logic/vocabData';
import { getChallengeTypesForFloor, getTierForChallenge, pickRandom, generateBigBossSequence, getSubtypeChallengePool } from './challengeHelpers';

export interface BossBattleMeta {
  damageDealt: number;
  shieldUsed: boolean;
  potionsUsed: number;
}

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  maxHealth?: number;
  shieldCharm?: number;
  potions?: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}

const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

const VOCAB_CATEGORIES: Record<string, VocabCategory> = {
  dynamics: 'dynamics',
  tempo: 'tempo',
  symbols: 'symbols',
  terms: 'terms',
};

function getBossHp(tileType: TileType, enemyLevel?: number): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  return enemyLevel ?? 1;
}

function getBossLabel(tileType: TileType, enemySubtype?: EnemySubtype): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  switch (enemySubtype) {
    case 'ghost': return 'Ghost';
    case 'skeleton': return 'Skeleton';
    case 'dragon': return 'Dragon';
    case 'goblin': return 'Goblin';
    case 'slime': return 'Slime';
    case 'bat': return 'Bat';
    case 'wraith': return 'Wraith';
    case 'spider': return 'Spider';
    case 'shade': return 'Shade';
    default: return 'Enemy';
  }
}

const TILE_THEME: Record<string, { title: string; borderColor: string; bgColor: string }> = {
  [TileType.Enemy]: {
    title: 'Enemy Encounter!',
    borderColor: 'border-red-500',
    bgColor: 'from-red-950/90 to-gray-900/95',
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

function getEnemyTheme(enemySubtype?: EnemySubtype): { title: string; borderColor: string; bgColor: string } {
  switch (enemySubtype) {
    case 'dragon':
      return { title: 'Dragon Battle!', borderColor: 'border-purple-500', bgColor: 'from-purple-950/90 to-gray-900/95' };
    case 'skeleton':
      return { title: 'Skeleton Encounter!', borderColor: 'border-gray-400', bgColor: 'from-gray-950/90 to-gray-900/95' };
    case 'goblin':
      return { title: 'Goblin Encounter!', borderColor: 'border-green-500', bgColor: 'from-green-950/90 to-gray-900/95' };
    case 'slime':
      return { title: 'Slime Encounter!', borderColor: 'border-lime-500', bgColor: 'from-lime-950/90 to-gray-900/95' };
    case 'bat':
      return { title: 'Bat Encounter!', borderColor: 'border-rose-400', bgColor: 'from-rose-950/90 to-gray-900/95' };
    case 'wraith':
      return { title: 'Wraith Encounter!', borderColor: 'border-cyan-400', bgColor: 'from-cyan-950/90 to-gray-900/95' };
    case 'spider':
      return { title: 'Spider Encounter!', borderColor: 'border-indigo-400', bgColor: 'from-indigo-950/90 to-gray-900/95' };
    case 'shade':
      return { title: 'Shade Encounter!', borderColor: 'border-amber-400', bgColor: 'from-amber-950/90 to-gray-900/95' };
    default:
      return TILE_THEME[TileType.Enemy] ?? DEFAULT_THEME;
  }
}

function ChallengeRenderer({ type, tier, floorNumber, onResult, slowRhythm, showIntervalHint }: {
  type: ChallengeType;
  tier: Tier;
  floorNumber: number;
  onResult: (correct: boolean) => void;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
}) {
  const vocabCategory = VOCAB_CATEGORIES[type];
  if (vocabCategory) {
    return <VocabularyChallenge category={vocabCategory} tier={tier} onResult={onResult} />;
  }

  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge tier={tier} onResult={onResult} />;
    case 'rhythmTap':
      return <RhythmTapChallenge tier={tier} onResult={onResult} slowMode={slowRhythm} />;
    case 'interval':
      return <IntervalChallenge tier={tier} onResult={onResult} showHint={showIntervalHint} />;
    default:
      return <NoteReadingChallenge tier={tier} onResult={onResult} />;
  }
}

const BossBattle: React.FC<{
  tileType: TileType;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  maxHealth: number;
  shieldCharm: number;
  potions: number;
  dragonBane?: boolean;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}> = ({ tileType, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel }) => {
  const maxBossHp = useMemo(
    () => Math.max(1, getBossHp(tileType, enemyLevel) - (dragonBane ? 1 : 0)),
    [tileType, enemyLevel, dragonBane]
  );
  const bossLabel = useMemo(() => getBossLabel(tileType, enemySubtype), [tileType, enemySubtype]);

  const floorChallengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);
  const challengeTypes = useMemo(
    () => tileType === TileType.Enemy
      ? getSubtypeChallengePool(enemySubtype, floorChallengeTypes)
      : floorChallengeTypes,
    [tileType, enemySubtype, floorChallengeTypes]
  );

  const bigBossSequence = useMemo(
    () => tileType === TileType.BigBoss ? generateBigBossSequence(floorNumber) : null,
    [tileType, floorNumber]
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [bossHp, setBossHp] = useState(() =>
    Math.max(1, getBossHp(tileType, enemyLevel) - (dragonBane ? 1 : 0))
  );
  const [effectiveHealth, setEffectiveHealth] = useState(playerHealth);
  const [shieldActive, setShieldActive] = useState(shieldCharm > 0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [potionsRemaining, setPotionsRemaining] = useState(potions);
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [roundTransition, setRoundTransition] = useState(false);
  const [showItemPhase, setShowItemPhase] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [showPrefight, setShowPrefight] = useState(
    playerHealth < maxHealth && potions > 0
  );

  const currentChallenge = useMemo(() => {
    if (bigBossSequence) {
      return bigBossSequence[currentRound % bigBossSequence.length];
    }
    const type = pickRandom(challengeTypes);
    return { type, tier: getTierForChallenge(floorNumber, type) };
  }, [bigBossSequence, challengeTypes, floorNumber, currentRound]);

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
        setRoundTransition(true);
        setTimeout(() => onResult(true, { damageDealt, shieldUsed, potionsUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    } else {
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
        setRoundTransition(true);
        setTimeout(() => onResult(false, { damageDealt: damageDealt + 1, shieldUsed: newShieldUsed, potionsUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    }
  }, [bossHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, potionsUsed, onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
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

      {showPrefight ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-lg font-bold text-amber-400">Prepare for Battle!</p>
          <p className="text-sm text-gray-400">You can use potions before the fight begins.</p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < maxHealth && (
              <button
                onClick={handleUsePotion}
                className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors"
              >
                Use Potion ({potionsRemaining})
              </button>
            )}
            <button
              onClick={() => setShowPrefight(false)}
              className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              {effectiveHealth < maxHealth && potionsRemaining > 0 ? 'Fight!' : 'Begin!'}
            </button>
          </div>
        </div>
      ) : showItemPhase ? (
        <div className="py-6 text-center space-y-3">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < maxHealth && (
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
          tier={currentChallenge.tier}
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

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel = 1 }) => {
  const theme = tileType === TileType.Enemy
    ? getEnemyTheme(enemySubtype)
    : (TILE_THEME[tileType] || DEFAULT_THEME);
  const isMultiRound =
    (tileType === TileType.Enemy && enemyLevel > 1) ||
    tileType === TileType.MiniBoss ||
    tileType === TileType.BigBoss;

  const tier = getTierForChallenge(floorNumber, challengeType);

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

        {isMultiRound ? (
          <BossBattle
            tileType={tileType}
            floorNumber={floorNumber}
            onResult={onResult}
            playerHealth={playerHealth}
            maxHealth={maxHealth}
            shieldCharm={shieldCharm}
            potions={potions}
            dragonBane={dragonBane}
            slowRhythm={slowRhythm}
            showIntervalHint={showIntervalHint}
            enemySubtype={enemySubtype}
            enemyLevel={enemyLevel}
          />
        ) : (
          <ChallengeRenderer type={challengeType} tier={tier} floorNumber={floorNumber} onResult={onResult} slowRhythm={slowRhythm} showIntervalHint={showIntervalHint} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
