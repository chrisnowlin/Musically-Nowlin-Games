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
}

export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval';

export interface Tile {
  type: TileType;
  visible: boolean;
  visited: boolean;
  challengeType?: ChallengeType;
  cleared?: boolean;
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

export interface PlayerState {
  position: Position;
  health: number;
  maxHealth: number;
  score: number;
  keys: number;
  potions: number;
  streak: number;
  shieldCharm: number;
}

export interface DungeonFloor {
  tiles: Tile[][];
  width: number;
  height: number;
  floorNumber: number;
  themeIndex: number;
  playerStart: Position;
  stairsPosition: Position;
}

export type GamePhase = 'menu' | 'playing' | 'challenge' | 'shopping' | 'gameOver' | 'floorComplete' | 'victory';

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
