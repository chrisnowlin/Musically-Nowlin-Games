/**
 * Cadence Quest - Shared Type Definitions
 * Used by both client and server for type-safe game logic.
 */

// ============ CHARACTER ============

export type CharacterClass = 'bard' | 'drummer' | 'harmonist' | 'conductor';

export const CHARACTER_CLASSES: CharacterClass[] = [
  'bard',
  'drummer',
  'harmonist',
  'conductor',
];

export type MusicDiscipline = 'rhythm' | 'pitch' | 'harmony' | 'dynamics' | 'theory';

export const MUSIC_DISCIPLINES: MusicDiscipline[] = [
  'rhythm',
  'pitch',
  'harmony',
  'dynamics',
  'theory',
];

export interface CharacterStats {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  skillPoints: number;
  /** Branch -> tier (0-4), tracks unlocked skill nodes */
  skillTree: Record<MusicDiscipline, number[]>;
  /** Equipped items */
  equipment: CharacterEquipment;
}

export interface Character {
  id: string;
  userId?: string;
  name: string;
  class: CharacterClass;
  stats: CharacterStats;
  /** Region id -> encounter index completed (0 = not started) */
  regionProgress: Record<string, number>;
  /** Legacy fields - deprecated, use equipment.stats instead */
  equippedInstrument?: string | null;
  equippedSpells?: string[];
  ownedInstruments?: string[];
  ownedSpells?: string[];
  /** Inventory of owned equipment */
  inventory: Equipment[];
}

export interface BattleCharacter {
  id: string;
  name: string;
  class: CharacterClass;
  hp: number;
  maxHp: number;
  streak: number;
  /** For AI or display */
  isPlayer?: boolean;
}

// ============ CHALLENGES ============

export type ChallengeType =
  | 'noteReading'
  | 'rhythmTap'
  | 'interval'
  | 'chordIdentify'
  | 'scaleIdentify'
  | 'tempoIdentify'
  | 'listening';

export interface BaseChallenge {
  id: string;
  type: ChallengeType;
  discipline: MusicDiscipline;
  /** Difficulty affects params (notes range, tempo, etc.) */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Optional UI hints enabled by skills/classes */
  showHints?: boolean;
  showRangeIndicators?: boolean;
  showStaffHelpers?: boolean;
}

export interface NoteReadingChallenge extends BaseChallenge {
  type: 'noteReading';
  discipline: 'pitch';
  targetNote: string;
  options: string[];
  useBassClef?: boolean;
}

export interface RhythmTapChallenge extends BaseChallenge {
  type: 'rhythmTap';
  discipline: 'rhythm';
  pattern: { time: number; duration: number }[];
  bpm: number;
  toleranceMs: number;
}

export interface IntervalChallenge extends BaseChallenge {
  type: 'interval';
  discipline: 'pitch';
  note1: string;
  note2: string;
  intervalName: string;
  options: string[];
}

export interface ChordIdentifyChallenge extends BaseChallenge {
  type: 'chordIdentify';
  discipline: 'harmony';
  chordNotes: string[];
  chordName: string;
  options: string[];
}

export interface ScaleIdentifyChallenge extends BaseChallenge {
  type: 'scaleIdentify';
  discipline: 'harmony';
  scaleNotes: string[];
  scaleName: string;
  options: string[];
}

export interface TempoIdentifyChallenge extends BaseChallenge {
  type: 'tempoIdentify';
  discipline: 'rhythm';
  bpm: number;
  options: { label: string; bpm: number }[];
}

export interface ListeningChallenge extends BaseChallenge {
  type: 'listening';
  discipline: 'theory';
  /** Description of what to identify */
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export type MusicChallenge =
  | NoteReadingChallenge
  | RhythmTapChallenge
  | IntervalChallenge
  | ChordIdentifyChallenge
  | ScaleIdentifyChallenge
  | TempoIdentifyChallenge
  | ListeningChallenge;

export interface ChallengeAnswer {
  challengeId: string;
  /** For multiple choice: selected option. For rhythm: JSON of tap times. */
  value: string | number[];
  /** Client timestamp when answer was submitted (ms since challenge shown) */
  responseTimeMs: number;
}

export interface ChallengeResult {
  correct: boolean;
  /** Actual damage dealt (0 if wrong) */
  damage: number;
  /** Self-damage if wrong (e.g. 5% max HP) */
  selfDamage: number;
  speedBonus: number;
  classBonus: number;
  streakMultiplier: number;
}

// ============ BATTLE ============

export type BattleType = 'pve' | 'pvp';
export type BattlePhase = 'waiting' | 'challenge' | 'resolving' | 'victory' | 'defeat';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BattleState {
  id: string;
  type: BattleType;
  phase: BattlePhase;
  player: BattleCharacter;
  opponent: BattleCharacter;
  /** Whose turn: 'player' | 'opponent' */
  activeTurn: 'player' | 'opponent';
  /** Current challenge (when phase is 'challenge') */
  currentChallenge: MusicChallenge | null;
  /** Challenge shown at timestamp for speed calculation */
  challengeShownAt: number | null;
  /** Turn count (1-based) */
  turnCount: number;
  /** Region id for PvE (determines challenge focus) */
  regionId?: string;
  /** Is this a boss encounter? */
  isBoss?: boolean;
}

export interface BattleAction {
  type: 'ANSWER' | 'USE_ABILITY';
  payload: ChallengeAnswer | { abilityId: string };
}

// ============ SPECIAL ABILITIES ============

export type SpecialAbilityId =
  | 'perfect_pitch'    // Bard: auto-correct one wrong
  | 'double_time'      // Drummer: two challenges in one turn
  | 'resonance'        // Harmonist: correct answer heals 10%
  | 'crescendo';       // Conductor: damage increases each turn

export interface SpecialAbility {
  id: SpecialAbilityId;
  class: CharacterClass;
  name: string;
  description: string;
  /** Streak required to unlock (3, 5, or 7) */
  streakRequired: number;
  /** Cooldown in turns after use */
  cooldownTurns: number;
}

// ============ ITEMS ============

export type ItemType = 'instrument' | 'spell';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface Instrument {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  /** Stat modifiers, e.g. { pitchAccuracy: 0.1 } = +10% */
  modifiers: Record<string, number>;
  /** Region/boss that drops it */
  source?: string;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  /** Battle effect, e.g. freeze opponent timer, heal, double damage */
  effect: string;
  /** One-time use per battle */
  usesPerBattle: number;
  source?: string;
}

export type CollectibleItem = Instrument | Spell;

// ============ REGIONS ============

export interface Region {
  id: string;
  name: string;
  description: string;
  /** Primary discipline focus */
  discipline: MusicDiscipline;
  /** Total encounters including boss */
  encounterCount: number;
  /** Is this the PvP arena? */
  isArena?: boolean;
  /** Unlock requirement: previous region id */
  requiresRegionId?: string;
}

export interface RegionEncounter {
  index: number;
  isBoss: boolean;
  /** Enemy name/type for display */
  enemyName: string;
  /** Challenge discipline focus for this encounter */
  disciplineFocus: MusicDiscipline;
  /** Possible drops (instrument/spell ids) */
  drops?: string[];
}

// ============ SKILL TREE ============

export interface SkillNode {
  id: string;
  branch: MusicDiscipline;
  tier: number; // 0-4
  name: string;
  description: string;
  /** Required parent node ids (empty for tier 0) */
  requires: string[];
  /** Effect applied when unlocked */
  effect: Record<string, unknown>;
}

export interface SkillTreeData {
  branches: Record<MusicDiscipline, SkillNode[]>;
}

// ============ BOSSES ============

export interface BossStage {
  order: number;
  discipline: MusicDiscipline;
  difficulty: Difficulty;
  correctAnswerDamage: number;
  wrongAnswerDamage: number;
  timeLimit?: number;
  comboRequired?: number;
  abilityTrigger?: string;
}

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  trigger: 'on_stage_start' | 'on_correct' | 'on_wrong' | 'on_hp_threshold';
  triggerValue?: number;
  effect: {
    type: 'buff_self' | 'debuff_player' | 'environment_change' | 'heal';
    duration?: number;
    value?: number;
  };
  soundEffect?: string;
}

export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  regionId: string;
  description: string;
  spritePath: string;
  emoji: string;
  maxHp: number;
  level: number;
  stages: BossStage[];
  abilities: BossAbility[];
  guaranteedDrops: string[];
  possibleDrops: string[];
  xpReward: number;
  goldReward: number;
  flavorText?: string;
  defeatQuote?: string;
}

// ============ EQUIPMENT ============

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  emoji: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;

  /** Passive effects (always active while equipped) */
  passiveEffects: {
    damageModifier?: number;
    classBonus?: {
      class: CharacterClass;
      bonus: number;
    };
    disciplineBonus?: {
      discipline: MusicDiscipline;
      bonus: number;
    };
    maxHpBonus?: number;
    accuracyBonus?: number;
    criticalChance?: number;
    healOnCorrect?: number;
    streakProtection?: number;
  };

  /** Visual representation */
  spritePath: string;

  /** Lore/flavor */
  flavorText?: string;
  source: 'drop' | 'quest' | 'shop' | 'boss';
}

export interface CharacterEquipment {
  weapon: Equipment | null;
  armor: Equipment | null;
  accessory: Equipment | null;
}

// ============ PROGRESSION ============

export interface XpReward {
  xp: number;
  /** Item drops */
  items?: string[];
}

export interface BattleReward {
  xp: number;
  items: string[];
  /** Skill points for leveling up */
  skillPoints?: number;
}

// ============ ORACLES ============

export interface OracleBlessing {
  id: string;
  name: string;
  description: string;
  emoji: string;

  effect: {
    type: 'damage_boost' | 'accuracy_boost' | 'heal' | 'insight' | 'luck';
    discipline?: MusicDiscipline;
    value: number;
    duration: 'next_battle' | 'permanent' | 'next_3_battles';
  };

  flavorText: string;
}

export interface OracleEncounter {
  id: string;
  name: string;
  description: string;
  spritePath: string;
  emoji: string;

  /** Oracle offers 3 blessings, player picks 1 */
  blessings: OracleBlessing[];

  /** Lore */
  flavorText: string;
}

// ============ MATCHMAKING ============

export type MatchmakingStatus = 'idle' | 'searching' | 'matched';

export interface MatchmakingState {
  status: MatchmakingStatus;
  /** When matched, the battle room id */
  battleRoomId?: string;
  /** Opponent info when matched */
  opponent?: BattleCharacter;
}
