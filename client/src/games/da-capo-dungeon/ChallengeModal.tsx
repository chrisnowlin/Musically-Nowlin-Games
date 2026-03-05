import React, { useState, useCallback, useMemo } from 'react';
import type { ChallengeType, EnemySubtype, Tier } from './logic/dungeonTypes';
import { TileType } from './logic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import VocabularyChallenge from './challenges/VocabularyChallenge';
import TimbreChallenge from './challenges/TimbreChallenge';
import CustomChallenge from './challenges/CustomChallenge';
import type { CustomQuestion } from './challenges/CustomChallenge';
import type { VocabCategory, VocabEntry } from './logic/vocabData';
import { getChallengeTypesForFloor, rollTier, pickRandom, generateBigBossSequence, getSubtypeChallengePool } from './challengeHelpers';
import type { LearningState } from './logic/learningState';

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
  overrideTier?: Tier;
  onExit?: () => void;
  customQuestions?: CustomQuestion[];
  poolVocabEntries?: VocabEntry[];
  poolUseDefaults?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
}

const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

const VOCAB_CATEGORIES = new Set<ChallengeType>(['dynamics', 'tempo', 'symbols', 'terms']);

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
    case 'siren': return 'Siren';
    case 'wizard': return 'Wizard';
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

const ENEMY_SPRITE: Record<string, string> = {
  ghost: '/images/da-capo-dungeon/ghost.png',
  skeleton: '/images/da-capo-dungeon/skeleton.png',
  dragon: '/images/da-capo-dungeon/dragon.png',
  goblin: '/images/da-capo-dungeon/goblin.png',
  slime: '/images/da-capo-dungeon/slime.png',
  bat: '/images/da-capo-dungeon/bat.png',
  wraith: '/images/da-capo-dungeon/wraith.png',
  spider: '/images/da-capo-dungeon/spider.png',
  shade: '/images/da-capo-dungeon/shade.png',
  siren: '/images/da-capo-dungeon/siren.png',
  wizard: '/images/da-capo-dungeon/wizard.png',
};

function getBigBossSprite(floorNumber: number): string {
  return floorNumber % 20 >= 10
    ? '/images/da-capo-dungeon/bigboss.png'
    : '/images/da-capo-dungeon/bigboss_2.png'
}

function getEncounterSprite(tileType: TileType, enemySubtype?: EnemySubtype, floorNumber?: number): string | null {
  if (tileType === TileType.BigBoss) return getBigBossSprite(floorNumber ?? 0);
  if (tileType === TileType.MiniBoss) return '/images/da-capo-dungeon/miniboss.png';
  if (tileType === TileType.Enemy && enemySubtype) {
    return ENEMY_SPRITE[enemySubtype] ?? null;
  }
  return null;
}

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
    case 'siren':
      return { title: 'Siren Encounter!', borderColor: 'border-teal-400', bgColor: 'from-teal-950/90 to-gray-900/95' };
    case 'ghost':
      return { title: 'Ghost Encounter!', borderColor: 'border-cyan-500', bgColor: 'from-cyan-950/90 to-gray-900/95' };
    case 'wizard':
      return { title: 'Wizard Encounter!', borderColor: 'border-violet-400', bgColor: 'from-violet-950/90 to-gray-900/95' };
    default:
      return TILE_THEME[TileType.Enemy] ?? DEFAULT_THEME;
  }
}

function ChallengeRenderer({ type, tier, floorNumber, onResult, slowRhythm, showIntervalHint, customQuestions, poolVocabEntries, poolUseDefaults, onListeningChange, learningState, onLearningUpdate }: {
  type: ChallengeType;
  tier: Tier;
  floorNumber: number;
  onResult: (correct: boolean) => void;
  slowRhythm?: boolean;
  showIntervalHint?: boolean;
  customQuestions?: CustomQuestion[];
  poolVocabEntries?: VocabEntry[];
  poolUseDefaults?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
}) {
  if (VOCAB_CATEGORIES.has(type)) {
    return (
      <VocabularyChallenge
        category={type as VocabCategory}
        tier={tier}
        onResult={onResult}
        poolEntries={poolVocabEntries}
        useDefaults={poolUseDefaults}
        learningState={learningState}
        onLearningUpdate={onLearningUpdate}
        floorNumber={floorNumber}
      />
    );
  }

  switch (type) {
    case 'noteReading':
      return <NoteReadingChallenge tier={tier} onResult={onResult} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'rhythmTap':
      return <RhythmTapChallenge tier={tier} onResult={onResult} slowMode={slowRhythm} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'interval':
      return <IntervalChallenge tier={tier} onResult={onResult} showHint={showIntervalHint} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'timbre':
      return <TimbreChallenge tier={tier} onResult={onResult} slowMode={slowRhythm} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'custom':
      return <CustomChallenge questions={customQuestions ?? []} tier={tier} onResult={onResult} />;
    default:
      return <NoteReadingChallenge tier={tier} onResult={onResult} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
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
  overrideTier?: Tier;
  onExit?: () => void;
  customQuestions?: CustomQuestion[];
  poolVocabEntries?: VocabEntry[];
  poolUseDefaults?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
}> = ({ tileType, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel, overrideTier, onExit, customQuestions, poolVocabEntries, poolUseDefaults, onListeningChange, learningState, onLearningUpdate }) => {
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
  const [lastShieldBlocked, setLastShieldBlocked] = useState(false);
  const [ghostSwapUsed, setGhostSwapUsed] = useState(false);
  const [showPrefight, setShowPrefight] = useState(
    playerHealth < maxHealth && potions > 0
  );

  const currentChallenge = useMemo(() => {
    if (bigBossSequence) {
      const round = bigBossSequence[currentRound % bigBossSequence.length];
      return overrideTier ? { ...round, tier: overrideTier } : round;
    }
    const type = pickRandom(challengeTypes);
    return { type, tier: overrideTier ?? rollTier(floorNumber) };
  }, [bigBossSequence, challengeTypes, floorNumber, currentRound, overrideTier]);

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
    setLastShieldBlocked(false);
    setShowItemPhase(false);
    setRoundTransition(false);
    setGhostSwapUsed(false);
  }, []);

  const handleRoundResult = useCallback((correct: boolean) => {
    if (!correct && enemySubtype === 'ghost' && !ghostSwapUsed) {
      setGhostSwapUsed(true);
      setCurrentRound((r) => r + 1); // Force re-roll of challenge type via the useMemo
      setLastResult(null);
      setRoundTransition(false);
      return;
    }

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
        setLastShieldBlocked(true);
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
  }, [bossHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, potionsUsed, onResult, enemySubtype, ghostSwapUsed]);

  const spriteSrc = useMemo(() => getEncounterSprite(tileType, enemySubtype, floorNumber), [tileType, enemySubtype, floorNumber]);
  const isReacting = roundTransition && !showItemPhase;
  const spriteAnimClass = isReacting
    ? (lastResult ? 'animate-sprite-hit' : 'animate-sprite-attack')
    : 'animate-sprite-float';

  return (
    <div className="flex flex-col items-center gap-3">
      {spriteSrc && (
        <img
          key={isReacting ? `react-${currentRound}` : 'idle'}
          src={spriteSrc}
          alt={bossLabel}
          className={`w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] ${spriteAnimClass}`}
          draggable={false}
        />
      )}
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
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : lastShieldBlocked ? 'text-blue-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : lastShieldBlocked ? '\uD83D\uDEE1\uFE0F Blocked!' : 'Miss! -1 HP'}
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
          customQuestions={customQuestions}
          poolVocabEntries={poolVocabEntries}
          poolUseDefaults={poolUseDefaults}
          onListeningChange={onListeningChange}
          /* Boss battles are true assessments — no guided hints */
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : lastShieldBlocked ? 'text-blue-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : lastShieldBlocked ? '\uD83D\uDEE1\uFE0F Blocked!' : 'Miss! -1 HP'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Preparing...</p>
        </div>
      )}

      {onExit && (
        <button
          onClick={onExit}
          className="mt-2 w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Exit Encounter
        </button>
      )}
    </div>
  );
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0, dragonBane, slowRhythm, showIntervalHint, enemySubtype, enemyLevel = 1, overrideTier, onExit, customQuestions, poolVocabEntries, poolUseDefaults, onListeningChange, learningState, onLearningUpdate }) => {
  const theme = tileType === TileType.Enemy
    ? getEnemyTheme(enemySubtype)
    : (TILE_THEME[tileType] || DEFAULT_THEME);
  const isMultiRound =
    (tileType === TileType.Enemy && enemyLevel > 1) ||
    tileType === TileType.MiniBoss ||
    tileType === TileType.BigBoss;

  const tier = useMemo(() => overrideTier ?? rollTier(floorNumber), [overrideTier, floorNumber]);
  const headerSprite = !isMultiRound ? getEncounterSprite(tileType, enemySubtype, floorNumber) : null;

  const [ghostSwapped, setGhostSwapped] = useState(false);
  const [swappedChallengeType, setSwappedChallengeType] = useState<ChallengeType | null>(null);
  const effectiveChallengeType = swappedChallengeType ?? challengeType;

  const handleSingleRoundResult = useCallback((correct: boolean) => {
    if (!correct && enemySubtype === 'ghost' && !ghostSwapped) {
      setGhostSwapped(true);
      const floorTypes = getChallengeTypesForFloor(floorNumber);
      const alternatives = floorTypes.filter(t => t !== effectiveChallengeType);
      const newType = alternatives.length > 0
        ? alternatives[Math.floor(Math.random() * alternatives.length)]
        : effectiveChallengeType;
      setSwappedChallengeType(newType);
      return;
    }
    onResult(correct);
  }, [enemySubtype, ghostSwapped, effectiveChallengeType, floorNumber, onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-md rounded-2xl border-2 ${theme.borderColor}
          bg-gradient-to-b ${theme.bgColor} p-5 shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {headerSprite && (
          <div className="flex justify-center mb-2">
            <img
              src={headerSprite}
              alt={theme.title}
              className="w-14 h-14 object-contain animate-sprite-float drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              draggable={false}
            />
          </div>
        )}
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
            overrideTier={overrideTier}
            onExit={onExit}
            customQuestions={customQuestions}
            poolVocabEntries={poolVocabEntries}
            poolUseDefaults={poolUseDefaults}
            onListeningChange={onListeningChange}
            learningState={learningState}
            onLearningUpdate={onLearningUpdate}
          />
        ) : (
          <>
            <ChallengeRenderer key={ghostSwapped ? 'swapped' : 'initial'} type={effectiveChallengeType} tier={tier} floorNumber={floorNumber} onResult={handleSingleRoundResult} slowRhythm={slowRhythm} showIntervalHint={showIntervalHint} customQuestions={customQuestions} poolVocabEntries={poolVocabEntries} poolUseDefaults={poolUseDefaults} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} />
            {onExit && (
              <button
                onClick={onExit}
                className="mt-3 w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Exit Encounter
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
