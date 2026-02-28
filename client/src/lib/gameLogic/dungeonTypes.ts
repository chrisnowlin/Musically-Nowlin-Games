export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Dragon = 'dragon',
  Merchant = 'merchant',
  MerchantStall = 'merchantStall',
  MiniBoss = 'miniBoss',
  BigBoss = 'bigBoss',
}

export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval';

export type EnemyState = 'guarding' | 'chasing' | 'patrolling';

export interface Tile {
  type: TileType;
  visible: boolean;
  visited: boolean;
  challengeType?: ChallengeType;
  cleared?: boolean;
  enemyState?: EnemyState;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface FloorBuffs {
  torch: boolean;
  mapRevealed: boolean;
  compass: boolean;
}

export interface PersistentBuffs {
  streakSaver: number;
  secondChance: number;
  dragonBane: number;
  luckyCoin: number;
  treasureMagnet: number;
  metronome: number;
  tuningFork: number;
  torch: number;
  mapScroll: number;
  compass: number;
}

export interface PlayerBuffs {
  floor: FloorBuffs;
  persistent: PersistentBuffs;
}

export interface PlayerState {
  position: Position;
  health: number;
  maxHealth: number;
  score: number;
  keys: number;
  potions: number;
  streak: number;
  shieldCharm: number;
  buffs: PlayerBuffs;
}

export const DEFAULT_FLOOR_BUFFS: FloorBuffs = {
  torch: false,
  mapRevealed: false,
  compass: false,
};

export const DEFAULT_PERSISTENT_BUFFS: PersistentBuffs = {
  streakSaver: 0,
  secondChance: 0,
  dragonBane: 0,
  luckyCoin: 0,
  treasureMagnet: 0,
  metronome: 0,
  tuningFork: 0,
  torch: 0,
  mapScroll: 0,
  compass: 0,
};

export const DEFAULT_BUFFS: PlayerBuffs = {
  floor: { ...DEFAULT_FLOOR_BUFFS },
  persistent: { ...DEFAULT_PERSISTENT_BUFFS },
};

export interface DungeonFloor {
  tiles: Tile[][];
  width: number;
  height: number;
  floorNumber: number;
  themeIndex: number;
  playerStart: Position;
  stairsPosition: Position;
}

export type GamePhase = 'menu' | 'playing' | 'challenge' | 'shopping' | 'inventory' | 'gameOver' | 'floorComplete' | 'victory';

export interface ActiveChallenge {
  type: ChallengeType;
  tilePosition: Position;
}

export interface GameState {
  phase: GamePhase;
  floor: DungeonFloor;
  player: PlayerState;
  activeChallenge: ActiveChallenge | null;
  difficulty: DifficultyLevel;
  floorsCleared: number;
  soundEnabled: boolean;
}

export const DUNGEON_BASE_SIZE = 12;
export const DUNGEON_MAX_SIZE = 20;

/** Dungeon dimensions grow with floor depth, starting at 12×12 and capping at 20×20. */
export function getDungeonSize(floorNumber: number): { width: number; height: number } {
  const size = Math.min(DUNGEON_BASE_SIZE + floorNumber - 1, DUNGEON_MAX_SIZE);
  return { width: size, height: size };
}

/** @deprecated Use getDungeonSize(floorNumber) instead */
export const DUNGEON_WIDTH = DUNGEON_BASE_SIZE;
/** @deprecated Use getDungeonSize(floorNumber) instead */
export const DUNGEON_HEIGHT = DUNGEON_BASE_SIZE;
export const VISIBILITY_RADIUS = 3;
export const MAX_HEALTH = 5;
