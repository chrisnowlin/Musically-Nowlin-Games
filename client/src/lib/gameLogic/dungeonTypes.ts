export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Boss = 'boss',
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

export type GamePhase = 'menu' | 'playing' | 'challenge' | 'gameOver' | 'floorComplete' | 'victory';

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

export const DUNGEON_WIDTH = 12;
export const DUNGEON_HEIGHT = 12;
export const VISIBILITY_RADIUS = 3;
export const MAX_HEALTH = 5;
