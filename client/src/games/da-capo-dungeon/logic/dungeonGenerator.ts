import {
  type DungeonFloor,
  type Tile,
  type Position,
  type Rect,
  type EnemySubtype,
  type ChallengeType,
  type SpecialFloorType,
  TileType,
  getDungeonSize,
  DUNGEON_BASE_SIZE,
} from './dungeonTypes';
import { getChallengeTypesForFloor, getSubtypeChallengePool, getEnemySubtypesForFloor, getEnemyLevel, rollChallengeType } from '../challengeHelpers';
import { LORE_GATE_FLOORS } from './loreGates';

export function getBossType(floorNumber: number): 'big' | 'mini' | null {
  if (floorNumber % 10 === 0) return 'big';
  if (floorNumber % 5 === 0) return 'mini';
  return null;
}

export function rollSpecialFloorType(floorNumber: number): SpecialFloorType {
  if (floorNumber < 3) return 'normal';
  if (floorNumber % 5 === 0) return 'normal';
  
  if (Math.random() < 0.01) return 'healing';
  if (Math.random() < 0.01) return 'loot';
  if (Math.random() < 0.01) return 'fortune';
  if (Math.random() < 0.01) return 'challenge';
  
  return 'normal';
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const THEME_COUNT = 8;

/**
 * Return a consistent theme index for every floor within the same 10-floor
 * group (1-10, 11-20, 21-30 …).  The index is derived deterministically from
 * the group number so the theme feels "random" across groups but stays the
 * same for all floors within a group.
 */
function getThemeIndexForFloor(floorNumber: number): number {
  const group = Math.floor((floorNumber - 1) / 10);
  // Floors 1-10 always start with Stone Crypt (index 0).
  if (group === 0) return 0;
  // Remaining groups use a simple hash for variety.
  return (group * 7 + 3) % THEME_COUNT;
}

function createEmptyGrid(width: number, height: number): Tile[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      type: TileType.Wall,
      visible: false,
      visited: false,
    }))
  );
}

function carveRoom(grid: Tile[][], room: Rect) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }
}

function carveCorridor(grid: Tile[][], from: Position, to: Position) {
  let { x, y } = from;
  const dx = to.x > x ? 1 : -1;
  const dy = to.y > y ? 1 : -1;

  // Horizontal first, then vertical
  while (x !== to.x) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x].type = TileType.Floor;
    }
    x += dx;
  }
  while (y !== to.y) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x].type = TileType.Floor;
    }
    y += dy;
  }
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
    grid[y][x].type = TileType.Floor;
  }
}

function roomCenter(room: Rect): Position {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2),
  };
}

function roomsOverlap(a: Rect, b: Rect, padding: number = 1): boolean {
  return !(
    a.x + a.w + padding <= b.x ||
    b.x + b.w + padding <= a.x ||
    a.y + a.h + padding <= b.y ||
    b.y + b.h + padding <= a.y
  );
}

function getFloorTiles(grid: Tile[][]): Position[] {
  const floors: Position[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x].type === TileType.Floor) {
        floors.push({ x, y });
      }
    }
  }
  return floors;
}

function distanceSq(a: Position, b: Position): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function pickRandomFloorTile(
  grid: Tile[][],
  exclude: Position[],
  minDistFrom?: Position,
  minDist: number = 3
): Position | null {
  const floors = getFloorTiles(grid).filter(
    (p) =>
      !exclude.some((e) => e.x === p.x && e.y === p.y) &&
      (!minDistFrom || distanceSq(p, minDistFrom) >= minDist * minDist)
  );
  if (floors.length === 0) return null;
  return floors[rand(0, floors.length - 1)];
}

/**
 * Returns true if the tile has 3+ walkable cardinal neighbors,
 * meaning a blocking object here won't trap the player in a corridor.
 */
function isOpenEnough(grid: Tile[][], pos: Position): boolean {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  let walkable = 0;
  for (const d of dirs) {
    const nx = pos.x + d.x;
    const ny = pos.y + d.y;
    if (
      ny >= 0 &&
      ny < grid.length &&
      nx >= 0 &&
      nx < grid[0].length &&
      grid[ny][nx].type !== TileType.Wall
    ) {
      walkable++;
    }
  }
  return walkable >= 3;
}

/**
 * Returns true if placing a blocking tile at `pos` would leave any
 * adjacent walkable tile with fewer than 2 walkable cardinal neighbors.
 * This catches corridor-mouth placements where the chest would block
 * entry into a narrow passage.
 */
function wouldCreateBottleneck(grid: Tile[][], pos: Position): boolean {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  for (const d of dirs) {
    const nx = pos.x + d.x;
    const ny = pos.y + d.y;
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) continue;
    if (grid[ny][nx].type === TileType.Wall) continue;

    // Count how many walkable neighbors this neighbor would have
    // if we blocked pos (placed a chest there)
    let walkable = 0;
    for (const d2 of dirs) {
      const nnx = nx + d2.x;
      const nny = ny + d2.y;
      if (nny < 0 || nny >= grid.length || nnx < 0 || nnx >= grid[0].length) continue;
      if (nnx === pos.x && nny === pos.y) continue; // this tile would be blocked
      if (grid[nny][nnx].type !== TileType.Wall) {
        walkable++;
      }
    }

    if (walkable < 2) return true;
  }

  return false;
}

function getCardinalWalkableNeighbors(grid: Tile[][], pos: Position): Position[] {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  return dirs
    .map((d) => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter(
      (p) =>
        p.y >= 0 &&
        p.y < grid.length &&
        p.x >= 0 &&
        p.x < grid[0].length &&
        grid[p.y][p.x].type !== TileType.Wall
    );
}

function isStraightHallwayTile(grid: Tile[][], pos: Position): boolean {
  if (grid[pos.y][pos.x].type !== TileType.Floor) return false;

  const neighbors = getCardinalWalkableNeighbors(grid, pos);
  if (neighbors.length !== 2) return false;

  const [a, b] = neighbors;
  const sameX = a.x === pos.x && b.x === pos.x;
  const sameY = a.y === pos.y && b.y === pos.y;
  return sameX || sameY;
}

function keyOf(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function getReachableWithoutKey(grid: Tile[][], start: Position): Set<string> {
  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(keyOf(start));

  while (queue.length > 0) {
    const current = queue.shift() as Position;
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const d of dirs) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;
      if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) continue;

      const tile = grid[ny][nx];
      if (tile.type === TileType.Wall || tile.type === TileType.Chest || tile.type === TileType.MerchantStall) continue;

      const nextKey = `${nx},${ny}`;
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({ x: nx, y: ny });
    }
  }

  return visited;
}

function noKeyTraversalIsValid(grid: Tile[][], playerStart: Position): boolean {
  const reachable = getReachableWithoutKey(grid, playerStart);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const tile = grid[y][x];
      if (
        tile.type !== TileType.Wall &&
        tile.type !== TileType.Chest &&
        tile.type !== TileType.MerchantStall &&
        !reachable.has(`${x},${y}`)
      ) {
        return false;
      }
    }
  }
  return true;
}

function pickValidDoorTile(
  grid: Tile[][],
  exclude: Position[],
  playerStart: Position,
  floorNumber: number
): Position | null {
  const candidates = getFloorTiles(grid).filter((p) => {
    if (exclude.some((e) => e.x === p.x && e.y === p.y)) return false;
    if (distanceSq(p, playerStart) < 4) return false;
    return isStraightHallwayTile(grid, p);
  });

  while (candidates.length > 0) {
    const idx = rand(0, candidates.length - 1);
    const candidate = candidates.splice(idx, 1)[0];
    const previous = { ...grid[candidate.y][candidate.x] };

    grid[candidate.y][candidate.x].type = TileType.Door;
    grid[candidate.y][candidate.x].challengeType = rollChallengeType(floorNumber);
    grid[candidate.y][candidate.x].cleared = false;

    if (noKeyTraversalIsValid(grid, playerStart)) {
      return candidate;
    }

    grid[candidate.y][candidate.x] = previous;
  }

  return null;
}

function pickValidChestTile(
  grid: Tile[][],
  exclude: Position[],
  playerStart: Position
): Position | null {
  const candidates = getFloorTiles(grid).filter((p) => {
    if (exclude.some((e) => e.x === p.x && e.y === p.y)) return false;
    if (distanceSq(p, playerStart) < 4) return false;
    if (isStraightHallwayTile(grid, p)) return false;
    if (!isOpenEnough(grid, p)) return false;
    return !wouldCreateBottleneck(grid, p);
  });

  while (candidates.length > 0) {
    const idx = rand(0, candidates.length - 1);
    const candidate = candidates.splice(idx, 1)[0];
    const previous = { ...grid[candidate.y][candidate.x] };

    grid[candidate.y][candidate.x].type = TileType.Chest;
    grid[candidate.y][candidate.x].cleared = false;

    if (noKeyTraversalIsValid(grid, playerStart)) {
      return candidate;
    }

    grid[candidate.y][candidate.x] = previous;
  }

  return null;
}

/** Place 15–20 treasure piles on random floor tiles for loot floors. */
function placeLootTreasure(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
  floorNumber: number,
): void {
  const count = rand(15, 20);
  for (let i = 0; i < count; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Treasure;
      grid[pos.y][pos.x].challengeType = rollChallengeType(floorNumber);
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }
}

/** Place 3-5 healing pools and 2-3 potion shrines for healing floors. */
function placeHealingPools(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
): void {
  const poolCount = rand(3, 5);
  for (let i = 0; i < poolCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.HealingPool;
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }
  
  const shrineCount = rand(2, 3);
  for (let i = 0; i < shrineCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.PotionShrine;
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }
}

/** Place a fortune teller NPC for fortune floors. */
function placeFortuneTeller(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
): void {
  const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
  if (pos) {
    grid[pos.y][pos.x].type = TileType.FortuneTeller;
    grid[pos.y][pos.x].cleared = false;
    placedPositions.push(pos);
  }
}

/** Place 6-8 enemies for challenge arena floors. */
function placeChallengeEnemies(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
  floorNumber: number,
  hasCustomQuestions?: boolean,
): void {
  const enemyCount = rand(6, 8);
  const challengeTypes = getChallengeTypesForFloor(floorNumber);
  if (hasCustomQuestions) {
    challengeTypes.push('custom');
  }
  const availableSubtypes = getEnemySubtypesForFloor(floorNumber);
  if (hasCustomQuestions) {
    availableSubtypes.push('wizard');
  }
  
  for (let i = 0; i < enemyCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
    if (pos) {
      const subtype = availableSubtypes[rand(0, availableSubtypes.length - 1)];
      const subtypePool = getSubtypeChallengePool(subtype, challengeTypes);
      grid[pos.y][pos.x].type = TileType.Enemy;
      grid[pos.y][pos.x].enemySubtype = subtype;
      grid[pos.y][pos.x].enemyLevel = getEnemyLevel(floorNumber);
      grid[pos.y][pos.x].challengeType = subtypePool[rand(0, subtypePool.length - 1)];
      grid[pos.y][pos.x].cleared = false;
      grid[pos.y][pos.x].enemyState = 'guarding';
      if (subtype === 'ghost') {
        grid[pos.y][pos.x].ghostVisible = true;
        grid[pos.y][pos.x].ghostNearPlayerTurns = 0;
        grid[pos.y][pos.x].ghostMaterialized = false;
      }
      placedPositions.push(pos);
    }
  }
}

/** Place arena chest at the stairs position (will unlock when all enemies defeated). */
function placeArenaChest(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
  stairsPosition: Position,
): void {
  grid[stairsPosition.y][stairsPosition.x].type = TileType.ArenaChest;
  grid[stairsPosition.y][stairsPosition.x].cleared = false;
}

function generateFortuneFloorLayout(floorNumber: number): { grid: Tile[][]; playerStart: Position; stairsPosition: Position } {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const roomSize = Math.min(11, Math.floor(Math.min(width, height) / 2));
  const roomStartX = Math.floor((width - roomSize) / 2);
  const roomStartY = Math.floor((height - roomSize) / 2);
  const roomEndX = roomStartX + roomSize - 1;
  const roomEndY = roomStartY + roomSize - 1;

  for (let dy = 0; dy < roomSize; dy++) {
    for (let dx = 0; dx < roomSize; dx++) {
      const x = roomStartX + dx;
      const y = roomStartY + dy;
      if (x >= 1 && x < width - 1 && y >= 1 && y < height - 1) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }

  const pillars: Position[] = [
    { x: roomStartX + 2, y: roomStartY + 2 },
    { x: roomEndX - 2, y: roomStartY + 2 },
    { x: roomStartX + 2, y: roomEndY - 2 },
    { x: roomEndX - 2, y: roomEndY - 2 },
  ];
  for (const pillar of pillars) {
    grid[pillar.y][pillar.x].type = TileType.Wall;
  }

  const innerPillars: Position[] = [
    { x: centerX - 2, y: centerY },
    { x: centerX + 2, y: centerY },
  ];
  for (const pillar of innerPillars) {
    if (pillar.x > roomStartX && pillar.x < roomEndX) {
      grid[pillar.y][pillar.x].type = TileType.Wall;
    }
  }

  const entryX = 1;
  const entryY = centerY;
  for (let x = 1; x <= roomStartX; x++) {
    grid[entryY][x].type = TileType.Floor;
  }

  const exitX = width - 2;
  const exitY = centerY;
  for (let x = roomEndX; x < width - 1; x++) {
    grid[exitY][x].type = TileType.Floor;
  }

  const playerStart: Position = { x: entryX, y: entryY };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  grid[centerY][centerX].type = TileType.FortuneTeller;
  grid[centerY][centerX].cleared = false;

  const stairsPosition: Position = { x: exitX, y: exitY };
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

  return { grid, playerStart, stairsPosition };
}

function generateHealingFloorLayout(floorNumber: number): { grid: Tile[][]; playerStart: Position; stairsPosition: Position } {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const roomSize = Math.min(11, Math.floor(Math.min(width, height) / 2));
  const roomStartX = Math.floor((width - roomSize) / 2);
  const roomStartY = Math.floor((height - roomSize) / 2);
  const roomEndX = roomStartX + roomSize - 1;
  const roomEndY = roomStartY + roomSize - 1;

  for (let dy = 0; dy < roomSize; dy++) {
    for (let dx = 0; dx < roomSize; dx++) {
      const x = roomStartX + dx;
      const y = roomStartY + dy;
      if (x >= 1 && x < width - 1 && y >= 1 && y < height - 1) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }

  const cornerPillars: Position[] = [
    { x: roomStartX + 1, y: roomStartY + 1 },
    { x: roomEndX - 1, y: roomStartY + 1 },
    { x: roomStartX + 1, y: roomEndY - 1 },
    { x: roomEndX - 1, y: roomEndY - 1 },
  ];
  for (const pillar of cornerPillars) {
    grid[pillar.y][pillar.x].type = TileType.Wall;
  }

  const pools: Position[] = [
    { x: roomStartX + 2, y: centerY - 1 },
    { x: roomStartX + 2, y: centerY },
    { x: roomStartX + 2, y: centerY + 1 },
    { x: roomEndX - 2, y: centerY - 1 },
    { x: roomEndX - 2, y: centerY },
    { x: roomEndX - 2, y: centerY + 1 },
  ];
  for (const pool of pools) {
    grid[pool.y][pool.x].type = TileType.HealingPool;
    grid[pool.y][pool.x].cleared = false;
  }

  const shrines: Position[] = [
    { x: centerX, y: roomStartY + 2 },
    { x: centerX, y: roomEndY - 2 },
  ];
  for (const shrine of shrines) {
    grid[shrine.y][shrine.x].type = TileType.PotionShrine;
    grid[shrine.y][shrine.x].cleared = false;
  }

  const entryX = 1;
  const entryY = centerY;
  for (let x = 1; x <= roomStartX; x++) {
    grid[entryY][x].type = TileType.Floor;
  }

  const playerStart: Position = { x: entryX, y: entryY };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  const exitX = width - 2;
  const exitY = centerY;
  for (let x = roomEndX; x < width - 1; x++) {
    grid[exitY][x].type = TileType.Floor;
  }

  const stairsPosition: Position = { x: exitX, y: exitY };
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

  return { grid, playerStart, stairsPosition };
}

function generateLootFloorLayout(floorNumber: number): { grid: Tile[][]; playerStart: Position; stairsPosition: Position; treasurePositions: Position[] } {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  const centerY = Math.floor(height / 2);

  const roomSize = Math.min(12, Math.floor(Math.min(width, height) / 2));
  const roomStartX = Math.floor((width - roomSize) / 2);
  const roomStartY = Math.floor((height - roomSize) / 2);
  const roomEndX = roomStartX + roomSize - 1;
  const roomEndY = roomStartY + roomSize - 1;
  const centerX = roomStartX + Math.floor(roomSize / 2);

  for (let dy = 0; dy < roomSize; dy++) {
    for (let dx = 0; dx < roomSize; dx++) {
      const x = roomStartX + dx;
      const y = roomStartY + dy;
      if (x >= 1 && x < width - 1 && y >= 1 && y < height - 1) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }

  const treasurePositions: Position[] = [];
  const treasureCount = rand(15, 20);
  const usedPositions = new Set<string>();

  const prioritySpots: Position[] = [];
  for (let dx = 1; dx < roomSize - 1; dx += 2) {
    prioritySpots.push({ x: roomStartX + dx, y: roomStartY + 1 });
    prioritySpots.push({ x: roomStartX + dx, y: roomEndY - 1 });
  }
  for (let dy = 2; dy < roomSize - 2; dy += 2) {
    prioritySpots.push({ x: roomStartX + 1, y: roomStartY + dy });
    prioritySpots.push({ x: roomEndX - 1, y: roomStartY + dy });
  }
  prioritySpots.push({ x: centerX, y: centerY });

  for (const spot of prioritySpots) {
    if (treasurePositions.length >= treasureCount) break;
    const key = `${spot.x},${spot.y}`;
    if (!usedPositions.has(key) && grid[spot.y][spot.x].type === TileType.Floor) {
      grid[spot.y][spot.x].type = TileType.Treasure;
      treasurePositions.push(spot);
      usedPositions.add(key);
    }
  }

  while (treasurePositions.length < treasureCount) {
    const tx = roomStartX + rand(1, roomSize - 2);
    const ty = roomStartY + rand(1, roomSize - 2);
    const key = `${tx},${ty}`;
    if (!usedPositions.has(key) && grid[ty][tx].type === TileType.Floor) {
      grid[ty][tx].type = TileType.Treasure;
      treasurePositions.push({ x: tx, y: ty });
      usedPositions.add(key);
    }
  }

  const entranceX = 1;
  const entranceY = centerY;
  for (let x = 1; x <= roomStartX; x++) {
    grid[entranceY][x].type = TileType.Floor;
  }

  const playerStart: Position = { x: entranceX, y: entranceY };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  const exitX = width - 2;
  const exitY = centerY;
  for (let x = roomEndX; x < width - 1; x++) {
    grid[exitY][x].type = TileType.Floor;
  }

  const stairsPosition: Position = { x: exitX, y: exitY };
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

  return { grid, playerStart, stairsPosition, treasurePositions };
}

/**
 * Lore floor layout — a small, atmospheric library room.
 *
 * The player enters from the left corridor. A LoreBook sits in the center of
 * the room — interacting with it opens the lore lesson modal. The stairs are
 * on the far-right side so the player can skip the book and proceed directly.
 *
 * Layout (conceptual, scaled to dungeon size):
 *   corridor → [pillar  book  pillar] → corridor → stairs
 *
 * No enemies. The room is safe and contemplative.
 */
function generateLoreFloorLayout(floorNumber: number): {
  grid: Tile[][];
  playerStart: Position;
  stairsPosition: Position;
  loreBookPosition: Position;
} {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  // A cozy room — smaller than other special rooms
  const roomSize = Math.min(9, Math.max(7, Math.floor(Math.min(width, height) * 0.6)));
  const roomStartX = Math.floor((width - roomSize) / 2);
  const roomStartY = Math.floor((height - roomSize) / 2);
  const roomEndX = roomStartX + roomSize - 1;
  const roomEndY = roomStartY + roomSize - 1;

  // Carve the room
  for (let dy = 0; dy < roomSize; dy++) {
    for (let dx = 0; dx < roomSize; dx++) {
      const x = roomStartX + dx;
      const y = roomStartY + dy;
      if (x >= 1 && x < width - 1 && y >= 1 && y < height - 1) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }

  // Decorative corner pillars
  const pillars: Position[] = [
    { x: roomStartX + 1, y: roomStartY + 1 },
    { x: roomEndX - 1, y: roomStartY + 1 },
    { x: roomStartX + 1, y: roomEndY - 1 },
    { x: roomEndX - 1, y: roomEndY - 1 },
  ];
  for (const pillar of pillars) {
    if (pillar.x > 0 && pillar.x < width - 1 && pillar.y > 0 && pillar.y < height - 1) {
      grid[pillar.y][pillar.x].type = TileType.Wall;
    }
  }

  // Entry corridor from left
  const entryX = 1;
  const entryY = centerY;
  for (let x = 1; x <= roomStartX; x++) {
    grid[entryY][x].type = TileType.Floor;
  }

  // Exit corridor to right
  const exitX = width - 2;
  const exitY = centerY;
  for (let x = roomEndX; x < width - 1; x++) {
    grid[exitY][x].type = TileType.Floor;
  }

  // Player start
  const playerStart: Position = { x: entryX, y: entryY };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  // Lore book in the center
  const loreBookPosition: Position = { x: centerX, y: centerY };
  grid[centerY][centerX].type = TileType.LoreBook;
  grid[centerY][centerX].cleared = false;

  // Stairs at the exit
  const stairsPosition: Position = { x: exitX, y: exitY };
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

  return { grid, playerStart, stairsPosition, loreBookPosition };
}

function generateChallengeFloorLayout(floorNumber: number, hasCustomQuestions?: boolean): { 
  grid: Tile[][]; 
  playerStart: Position; 
  stairsPosition: Position;
  enemies: Array<{ pos: Position; subtype: EnemySubtype; level: number; challengeType: ChallengeType }>
} {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  const centerY = Math.floor(height / 2);
  const arenaSize = Math.min(12, Math.floor(Math.min(width, height) / 2));
  const offsetX = Math.floor((width - arenaSize) / 2);
  const offsetY = Math.floor((height - arenaSize) / 2);

  for (let dy = 0; dy < arenaSize; dy++) {
    for (let dx = 0; dx < arenaSize; dx++) {
      const x = offsetX + dx;
      const y = offsetY + dy;
      if (x >= 1 && x < width - 1 && y >= 1 && y < height - 1) {
        grid[y][x].type = TileType.Floor;
      }
    }
  }

  const entranceX = 1;
  const entranceY = centerY;
  for (let x = 1; x <= offsetX; x++) {
    grid[entranceY][x].type = TileType.Floor;
  }

  const playerStart: Position = { x: entranceX, y: entranceY };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  const enemies: Array<{ pos: Position; subtype: EnemySubtype; level: number; challengeType: ChallengeType }> = [];
  const challengeTypes = getChallengeTypesForFloor(floorNumber);
  if (hasCustomQuestions) {
    challengeTypes.push('custom');
  }
  const availableSubtypes = getEnemySubtypesForFloor(floorNumber);
  if (hasCustomQuestions) {
    availableSubtypes.push('wizard');
  }

  const enemyCount = rand(6, 8);
  const usedPositions = new Set<string>();

  while (enemies.length < enemyCount) {
    const ex = offsetX + rand(2, arenaSize - 3);
    const ey = offsetY + rand(2, arenaSize - 3);
    const key = `${ex},${ey}`;
    
    if (!usedPositions.has(key) && grid[ey][ex].type === TileType.Floor) {
      const subtype = availableSubtypes[rand(0, availableSubtypes.length - 1)];
      const subtypePool = getSubtypeChallengePool(subtype, challengeTypes);
      const level = getEnemyLevel(floorNumber);
      const challengeType = subtypePool[rand(0, subtypePool.length - 1)];

      grid[ey][ex].type = TileType.Enemy;
      grid[ey][ex].enemySubtype = subtype;
      grid[ey][ex].enemyLevel = level;
      grid[ey][ex].challengeType = challengeType;
      grid[ey][ex].cleared = false;
      grid[ey][ex].enemyState = 'guarding';

      if (subtype === 'ghost') {
        grid[ey][ex].ghostVisible = true;
        grid[ey][ex].ghostNearPlayerTurns = 0;
        grid[ey][ex].ghostMaterialized = false;
      }

      enemies.push({ pos: { x: ex, y: ey }, subtype, level, challengeType });
      usedPositions.add(key);
    }
  }

  const exitX = width - 2;
  const exitY = centerY;
  for (let x = offsetX + arenaSize - 1; x < width - 1; x++) {
    grid[exitY][x].type = TileType.Floor;
  }

  const stairsPosition: Position = { x: exitX, y: exitY };
  grid[stairsPosition.y][stairsPosition.x].type = TileType.ArenaChest;
  grid[stairsPosition.y][stairsPosition.x].cleared = false;

  return { grid, playerStart, stairsPosition, enemies };
}

export interface GenerateDungeonOptions {
  forceSpecialFloorType?: SpecialFloorType;
  hasCustomQuestions?: boolean;
}

export function generateDungeon(floorNumber: number, options?: GenerateDungeonOptions): DungeonFloor {
  const bossType = getBossType(floorNumber);
  // Lore gate floors become lore rooms (unless a specific type is forced).
  const isLoreGate = !options?.forceSpecialFloorType && !bossType && LORE_GATE_FLOORS.has(floorNumber);
  const specialFloorType = options?.forceSpecialFloorType
    ?? (isLoreGate ? 'lore' as SpecialFloorType : (!bossType ? rollSpecialFloorType(floorNumber) : 'normal'));

  if (specialFloorType === 'lore') {
    const { grid, playerStart, stairsPosition } = generateLoreFloorLayout(floorNumber);
    const { width, height } = getDungeonSize(floorNumber);
    return {
      tiles: grid,
      width,
      height,
      floorNumber,
      themeIndex: getThemeIndexForFloor(floorNumber),
      playerStart,
      stairsPosition,
      specialFloorType: 'lore',
    };
  }

  if (specialFloorType === 'fortune') {
    const { grid, playerStart, stairsPosition } = generateFortuneFloorLayout(floorNumber);
    const { width, height } = getDungeonSize(floorNumber);
    return {
      tiles: grid,
      width,
      height,
      floorNumber,
      themeIndex: getThemeIndexForFloor(floorNumber),
      playerStart,
      stairsPosition,
      specialFloorType: 'fortune',
    };
  }

  if (specialFloorType === 'healing') {
    const { grid, playerStart, stairsPosition } = generateHealingFloorLayout(floorNumber);
    const { width, height } = getDungeonSize(floorNumber);
    return {
      tiles: grid,
      width,
      height,
      floorNumber,
      themeIndex: getThemeIndexForFloor(floorNumber),
      playerStart,
      stairsPosition,
      specialFloorType: 'healing',
    };
  }

  if (specialFloorType === 'loot') {
    const { grid, playerStart, stairsPosition } = generateLootFloorLayout(floorNumber);
    const { width, height } = getDungeonSize(floorNumber);
    return {
      tiles: grid,
      width,
      height,
      floorNumber,
      themeIndex: getThemeIndexForFloor(floorNumber),
      playerStart,
      stairsPosition,
      specialFloorType: 'loot',
    };
  }

  if (specialFloorType === 'challenge') {
    const { grid, playerStart, stairsPosition } = generateChallengeFloorLayout(floorNumber, options?.hasCustomQuestions);
    const { width, height } = getDungeonSize(floorNumber);
    return {
      tiles: grid,
      width,
      height,
      floorNumber,
      themeIndex: getThemeIndexForFloor(floorNumber),
      playerStart,
      stairsPosition,
      specialFloorType: 'challenge',
    };
  }

  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);

  // Scale room count and max room size with dungeon size
  const growth = width - DUNGEON_BASE_SIZE;
  const roomCount = rand(4, 6 + Math.floor(growth / 2));
  const maxRoomDim = Math.min(7 + Math.floor(growth / 2), 10);
  const rooms: Rect[] = [];
  const maxAttempts = 150;

  for (let i = 0; i < roomCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const w = rand(4, maxRoomDim);
      const h = rand(4, maxRoomDim);
      const x = rand(1, width - w - 1);
      const y = rand(1, height - h - 1);
      const room: Rect = { x, y, w, h };

      if (!rooms.some((r) => roomsOverlap(r, room))) {
        rooms.push(room);
        carveRoom(grid, room);
        placed = true;
        break;
      }
    }
    if (!placed && rooms.length < 2) {
      // Force at least 2 rooms
      const w = 4;
      const h = 4;
      const x = rand(1, width - w - 1);
      const y = rand(1, height - h - 1);
      rooms.push({ x, y, w, h });
      carveRoom(grid, { x, y, w, h });
    }
  }

  // On boss floors, expand the last room to make space for the boss arena.
  if (bossType && rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    const targetSize = Math.min(10, Math.max(lastRoom.w, 6));
    if (lastRoom.w < targetSize || lastRoom.h < targetSize) {
      const newW = Math.min(targetSize, width - lastRoom.x - 1);
      const newH = Math.min(targetSize, height - lastRoom.y - 1);
      lastRoom.w = Math.max(lastRoom.w, newW);
      lastRoom.h = Math.max(lastRoom.h, newH);
      carveRoom(grid, lastRoom);
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    carveCorridor(grid, roomCenter(rooms[i - 1]), roomCenter(rooms[i]));
  }

  // Place player start in first room
  const playerStart = roomCenter(rooms[0]);
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  // Place stairs (or boss) in last room, far from player
  const stairsPosition = roomCenter(rooms[rooms.length - 1]);
  if (bossType) {
    const bossTileType = bossType === 'big' ? TileType.BigBoss : TileType.MiniBoss;
    const bossSize = bossType === 'big' ? 3 : 2;
    // Center the footprint on stairsPosition: BigBoss offsets anchor by (-1,-1), MiniBoss uses stairsPosition as anchor
    const anchorOffset = bossType === 'big' ? 1 : 0;
    const ax = stairsPosition.x - anchorOffset;
    const ay = stairsPosition.y - anchorOffset;
    for (let dy = 0; dy < bossSize; dy++) {
      for (let dx = 0; dx < bossSize; dx++) {
        const tx = ax + dx;
        const ty = ay + dy;
        if (ty >= 0 && ty < height && tx >= 0 && tx < width) {
          const isAnchor = dx === 0 && dy === 0;
          grid[ty][tx].type = isAnchor ? bossTileType : TileType.BossBody;
          if (isAnchor) grid[ty][tx].cleared = false;
        }
      }
    }
  } else {
    grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;
  }

  // stairsPosition is the boss room center (a BossBody or anchor tile on boss floors).
  // The loop below adds the remaining footprint tiles; stairsPosition is excluded from
  // the push since it is already present from initialization.
  const placedPositions: Position[] = [playerStart, stairsPosition];
  if (bossType) {
    const bossSize = bossType === 'big' ? 3 : 2;
    const anchorOffset = bossType === 'big' ? 1 : 0;
    for (let dy = 0; dy < bossSize; dy++) {
      for (let dx = 0; dx < bossSize; dx++) {
        const tx = stairsPosition.x - anchorOffset + dx;
        const ty = stairsPosition.y - anchorOffset + dy;
        if (
          ty >= 0 && ty < height &&
          tx >= 0 && tx < width &&
          (tx !== stairsPosition.x || ty !== stairsPosition.y)
        ) {
          placedPositions.push({ x: tx, y: ty });
        }
      }
    }
  }

  const challengeTypes = getChallengeTypesForFloor(floorNumber);
  if (options?.hasCustomQuestions) {
    challengeTypes.push('custom');
  }

  // Chests, dragons, and enemies do NOT spawn on boss floors.
  if (!bossType) {
    // Place locked chests first so dragons can spawn adjacent to them.
    const chestCount = rand(1, Math.min(2, 1 + Math.floor(floorNumber / 2)));
    const chestPositions: Position[] = [];
    for (let i = 0; i < chestCount; i++) {
      const pos = pickValidChestTile(grid, placedPositions, playerStart);
      if (pos) {
        placedPositions.push(pos);
        chestPositions.push(pos);
      }
    }

    // Place dragon adjacent to a chest (floor >= 3).
    const hasDragon = floorNumber >= 3;
    if (hasDragon && chestPositions.length > 0) {
      const chest = chestPositions[rand(0, chestPositions.length - 1)];
      // Search all tiles within Chebyshev-2 of the chest so the dragon always
      // starts within tether range. Cardinal neighbors are preferred; the outer
      // ring is a fallback. A random far-away tile must never be used, because
      // that causes the dragon to immediately transition to 'chasing' and deal
      // fire damage even when the chest is still unopened.
      const dragonSpawnCandidates: Position[] = [];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const p = { x: chest.x + dx, y: chest.y + dy };
          if (p.y < 0 || p.y >= height || p.x < 0 || p.x >= width) continue;
          if (grid[p.y][p.x].type !== TileType.Floor) continue;
          if (placedPositions.some((e) => e.x === p.x && e.y === p.y)) continue;
          if (isOpenEnough(grid, p)) dragonSpawnCandidates.push(p);
        }
      }
      const dragonPos =
        dragonSpawnCandidates.length > 0
          ? dragonSpawnCandidates[rand(0, dragonSpawnCandidates.length - 1)]
          : null;
      if (dragonPos) {
        const dragonChallengePool = getSubtypeChallengePool('dragon', challengeTypes);
        grid[dragonPos.y][dragonPos.x].type = TileType.Enemy;
        grid[dragonPos.y][dragonPos.x].enemySubtype = 'dragon';
        grid[dragonPos.y][dragonPos.x].enemyLevel = Math.min(5, getEnemyLevel(floorNumber) + 1);
        grid[dragonPos.y][dragonPos.x].challengeType =
          dragonChallengePool[rand(0, dragonChallengePool.length - 1)];
        grid[dragonPos.y][dragonPos.x].cleared = false;
        grid[dragonPos.y][dragonPos.x].enemyState = 'guarding';
        placedPositions.push(dragonPos);
      }
    }

    // Place regular enemies.
    const totalEnemies = Math.min(2 + floorNumber, 6);
    const regularCount = hasDragon ? totalEnemies - 1 : totalEnemies;
    const availableSubtypes = getEnemySubtypesForFloor(floorNumber);
    if (options?.hasCustomQuestions) {
      availableSubtypes.push('wizard');
    }
    for (let i = 0; i < regularCount; i++) {
      const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
      if (pos) {
        const subtype = availableSubtypes[rand(0, availableSubtypes.length - 1)];
        const subtypePool = getSubtypeChallengePool(subtype, challengeTypes);
        grid[pos.y][pos.x].type = TileType.Enemy;
        grid[pos.y][pos.x].enemySubtype = subtype;
        grid[pos.y][pos.x].enemyLevel = getEnemyLevel(floorNumber);
        grid[pos.y][pos.x].challengeType =
          subtypePool[rand(0, subtypePool.length - 1)];
        grid[pos.y][pos.x].cleared = false;
        grid[pos.y][pos.x].enemyState = 'patrolling';
        if (subtype === 'ghost') {
          grid[pos.y][pos.x].ghostVisible = true;
          grid[pos.y][pos.x].ghostNearPlayerTurns = 0;
          grid[pos.y][pos.x].ghostMaterialized = false;
        }
        placedPositions.push(pos);
      }
    }
  }

  // Place doors only on straight hallway choke points.
  const doorCount = Math.min(1 + Math.floor(floorNumber / 2), 3);
  for (let i = 0; i < doorCount; i++) {
    const pos = pickValidDoorTile(grid, placedPositions, playerStart, floorNumber);
    if (pos) {
      placedPositions.push(pos);
    }
  }

  // Place merchant pair (stall + merchant): always on floor 2, ~40% on later floors.
  if (floorNumber === 2 || (floorNumber > 2 && Math.random() < 0.4)) {
    // Place stall first: needs open room tile (not hallway).
    const stallCandidates = getFloorTiles(grid).filter((p) => {
      if (placedPositions.some((e) => e.x === p.x && e.y === p.y)) return false;
      if (distanceSq(p, playerStart) < 4) return false;
      if (isStraightHallwayTile(grid, p)) return false;
      return isOpenEnough(grid, p);
    });

    while (stallCandidates.length > 0) {
      const idx = rand(0, stallCandidates.length - 1);
      const stallPos = stallCandidates.splice(idx, 1)[0];

      // Find adjacent floor tile for the merchant character.
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      const merchantCandidates = dirs
        .map((d) => ({ x: stallPos.x + d.x, y: stallPos.y + d.y }))
        .filter(
          (p) =>
            p.y >= 0 &&
            p.y < height &&
            p.x >= 0 &&
            p.x < width &&
            grid[p.y][p.x].type === TileType.Floor &&
            !placedPositions.some((e) => e.x === p.x && e.y === p.y)
        );

      if (merchantCandidates.length > 0) {
        const merchantPos = merchantCandidates[rand(0, merchantCandidates.length - 1)];

        const previousStall = { ...grid[stallPos.y][stallPos.x] };
        const previousMerchant = { ...grid[merchantPos.y][merchantPos.x] };

        grid[stallPos.y][stallPos.x].type = TileType.MerchantStall;
        grid[merchantPos.y][merchantPos.x].type = TileType.Merchant;

        if (noKeyTraversalIsValid(grid, playerStart)) {
          placedPositions.push(stallPos, merchantPos);
          break;
        }

        // Revert placement if it breaks reachability
        grid[stallPos.y][stallPos.x] = previousStall;
        grid[merchantPos.y][merchantPos.x] = previousMerchant;
      }
    }
  }

  // Place treasure (free pickup)
  const treasureCount = rand(0, 1);
  for (let i = 0; i < treasureCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Treasure;
      grid[pos.y][pos.x].challengeType = rollChallengeType(floorNumber);
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }

  return {
    tiles: grid,
    width,
    height,
    floorNumber,
    themeIndex: getThemeIndexForFloor(floorNumber),
    playerStart,
    stairsPosition,
    specialFloorType: 'normal',
  };
}

/** Generate a fixed 30×30 open room for dev/testing. All tiles visible, no fog of war. */
export function generateDevRoom(): DungeonFloor {
  const size = 30;
  const grid = createEmptyGrid(size, size);

  // Carve a single open room (the entire interior)
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      grid[y][x].type = TileType.Floor;
      grid[y][x].visible = true;
      grid[y][x].visited = true;
    }
  }

  const playerStart: Position = { x: 15, y: 15 };
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  // Place merchant pair northwest of player
  grid[13][13].type = TileType.MerchantStall;
  grid[13][14].type = TileType.Merchant;

  // Place jukebox east of player (symmetrical to merchant on west side)
  grid[14][17].type = TileType.Jukebox;

  // Place one of each enemy type in a row south of player at y=18
  // Each subtype gets its signature challenge type matching normal gameplay
  const enemySubtypes: { subtype: EnemySubtype; challengeType: ChallengeType }[] = [
    { subtype: 'slime', challengeType: 'noteReading' },
    { subtype: 'skeleton', challengeType: 'rhythmTap' },
    { subtype: 'goblin', challengeType: 'interval' },
    { subtype: 'bat', challengeType: 'dynamics' },
    { subtype: 'wraith', challengeType: 'tempo' },
    { subtype: 'spider', challengeType: 'symbols' },
    { subtype: 'shade', challengeType: 'terms' },
    { subtype: 'siren', challengeType: 'timbre' },
    { subtype: 'ghost', challengeType: 'noteReading' },
    { subtype: 'dragon', challengeType: 'noteReading' },
  ];
  enemySubtypes.forEach(({ subtype, challengeType }, i) => {
    const x = 10 + i;
    grid[18][x].type = TileType.Enemy;
    grid[18][x].enemySubtype = subtype;
    grid[18][x].enemyLevel = 3;
    grid[18][x].challengeType = challengeType;
    grid[18][x].cleared = false;
    grid[18][x].enemyState = 'guarding';
    if (subtype === 'ghost') {
      grid[18][x].ghostVisible = true;
      grid[18][x].ghostNearPlayerTurns = 0;
      grid[18][x].ghostMaterialized = false;
    }
  });

  // Place MiniBoss (2×2 footprint) south of enemy row, left side
  const miniBossAnchor: Position = { x: 11, y: 21 };
  for (let dy = 0; dy < 2; dy++) {
    for (let dx = 0; dx < 2; dx++) {
      const isAnchor = dx === 0 && dy === 0;
      grid[miniBossAnchor.y + dy][miniBossAnchor.x + dx].type = isAnchor ? TileType.MiniBoss : TileType.BossBody;
      if (isAnchor) grid[miniBossAnchor.y][miniBossAnchor.x].cleared = false;
    }
  }

  // Place BigBoss (3×3 footprint) south of enemy row, right side
  const bigBossAnchor: Position = { x: 16, y: 21 };
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 3; dx++) {
      const isAnchor = dx === 0 && dy === 0;
      grid[bigBossAnchor.y + dy][bigBossAnchor.x + dx].type = isAnchor ? TileType.BigBoss : TileType.BossBody;
      if (isAnchor) grid[bigBossAnchor.y][bigBossAnchor.x].cleared = false;
    }
  }

  return {
    tiles: grid,
    width: size,
    height: size,
    floorNumber: 0,
    themeIndex: 0,
    playerStart,
    stairsPosition: playerStart,
    specialFloorType: 'normal',
  };
}

/**
 * Move all uncleared enemies one step in a random cardinal direction.
 * Dragons stay within Chebyshev distance 2 of the nearest uncleared chest.
 */
export function moveEnemies(floor: DungeonFloor, playerPos: Position): DungeonFloor {
  // Dev room: enemies don't move
  if (floor.floorNumber === 0) return floor;

  const tiles = floor.tiles.map((row) => row.map((t) => ({ ...t })));

  // Collect enemies and uncleared chests.
  const enemies: { pos: Position; tile: Tile }[] = [];
  const chests: Position[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const t = tiles[y][x];
      if (!t.cleared && t.type === TileType.Enemy) {
        enemies.push({ pos: { x, y }, tile: t });
      }
      if (t.type === TileType.Chest && !t.cleared) {
        chests.push({ x, y });
      }
    }
  }

  if (enemies.length === 0) return floor;

  // Fisher-Yates shuffle to avoid processing-order bias.
  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }

  // Track positions that are already claimed (non-floor entities).
  const occupied = new Set<string>();
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const t = tiles[y][x];
      if (
        t.type !== TileType.Floor &&
        t.type !== TileType.PlayerStart
      ) {
        occupied.add(`${x},${y}`);
      }
    }
  }

  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  /** Transfer an enemy from one tile to another, updating the occupied set. */
  function transferEnemy(
    tiles: Tile[][],
    from: Position,
    to: Position,
    enemyTile: Tile,
    occupied: Set<string>
  ): void {
    const target = tiles[to.y][to.x];
    tiles[to.y][to.x] = {
      ...target,
      type: enemyTile.type,
      enemySubtype: enemyTile.enemySubtype,
      enemyLevel: enemyTile.enemyLevel,
      challengeType: enemyTile.challengeType,
      cleared: false,
      enemyState: enemyTile.enemyState,
      ghostVisible: enemyTile.ghostVisible,
      ghostNearPlayerTurns: enemyTile.ghostNearPlayerTurns,
      ghostMaterialized: enemyTile.ghostMaterialized,
    };
    tiles[from.y][from.x] = {
      ...tiles[from.y][from.x],
      type: TileType.Floor,
      enemySubtype: undefined,
      enemyLevel: undefined,
      challengeType: undefined,
      cleared: undefined,
      enemyState: undefined,
      ghostVisible: undefined,
      ghostNearPlayerTurns: undefined,
      ghostMaterialized: undefined,
    };
    occupied.delete(`${from.x},${from.y}`);
    occupied.add(`${to.x},${to.y}`);
  }

  for (const enemy of enemies) {
    const { pos, tile } = enemy;

    // Dragon state transition: guarding → chasing when no uncleared chests are nearby.
    if (tile.enemySubtype === 'dragon' && tile.enemyState === 'guarding') {
      const hasNearbyChest = chests.some(
        (c) => Math.max(Math.abs(pos.x - c.x), Math.abs(pos.y - c.y)) <= 2
      );
      if (!hasNearbyChest) {
        tile.enemyState = 'chasing';
        tiles[pos.y][pos.x].enemyState = 'chasing';
      }
    }

    if (tile.enemyState === 'chasing') {
      // Direct pursuit: pick the cardinal direction that minimizes Manhattan distance to player.
      const sorted = [...dirs].sort((a, b) => {
        const distA = Math.abs(pos.x + a.x - playerPos.x) + Math.abs(pos.y + a.y - playerPos.y);
        const distB = Math.abs(pos.x + b.x - playerPos.x) + Math.abs(pos.y + b.y - playerPos.y);
        return distA - distB;
      });

      for (const d of sorted) {
        const nx = pos.x + d.x;
        const ny = pos.y + d.y;
        if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

        const isPlayerTile = nx === playerPos.x && ny === playerPos.y;
        const target = tiles[ny][nx];
        if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;

        const key = `${nx},${ny}`;
        if (occupied.has(key)) continue;

        transferEnemy(tiles, pos, { x: nx, y: ny }, tile, occupied);
        break;
      }
      continue; // Skip the default random movement
    }

    // Ghosts stalk the player: always move toward the player, phasing through walls.
    // They cannot land on the player tile; the encounter triggers via ghostMaterialized.
    if (tile.enemySubtype === 'ghost') {
      const sorted = [...dirs].sort((a, b) => {
        const distA = Math.abs(pos.x + a.x - playerPos.x) + Math.abs(pos.y + a.y - playerPos.y);
        const distB = Math.abs(pos.x + b.x - playerPos.x) + Math.abs(pos.y + b.y - playerPos.y);
        return distA - distB;
      });

      for (const d of sorted) {
        const nx = pos.x + d.x;
        const ny = pos.y + d.y;
        if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

        const isPlayerTile = nx === playerPos.x && ny === playerPos.y;
        if (isPlayerTile) continue;

        const target = tiles[ny][nx];

        if (target.type === TileType.Wall) {
          const beyondX = nx + d.x;
          const beyondY = ny + d.y;
          if (beyondX < 0 || beyondX >= floor.width || beyondY < 0 || beyondY >= floor.height) continue;
          const beyondTile = tiles[beyondY][beyondX];
          if (beyondX === playerPos.x && beyondY === playerPos.y) continue;
          if (beyondTile.type !== TileType.Floor && beyondTile.type !== TileType.PlayerStart) continue;
          const beyondKey = `${beyondX},${beyondY}`;
          if (occupied.has(beyondKey)) continue;
          transferEnemy(tiles, pos, { x: beyondX, y: beyondY }, tile, occupied);
          break;
        }

        if (target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
        const key = `${nx},${ny}`;
        if (occupied.has(key)) continue;
        transferEnemy(tiles, pos, { x: nx, y: ny }, tile, occupied);
        break;
      }
      continue; // Skip general patrolling movement for ghosts
    }

    // Shuffle directions for this enemy.
    const shuffled = [...dirs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let moved = false;
    for (const d of shuffled) {
      const nx = pos.x + d.x;
      const ny = pos.y + d.y;
      if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

      const isPlayerTile = nx === playerPos.x && ny === playerPos.y;
      const target = tiles[ny][nx];
      // Skip player tile and non-floor tiles
      if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;

      const key = `${nx},${ny}`;
      if (occupied.has(key)) continue;

      // Dragon tether: stay within Chebyshev distance 2 of nearest uncleared chest.
      if (tile.enemySubtype === 'dragon' && chests.length > 0) {
        const nearestDist = Math.min(
          ...chests.map((c) => Math.max(Math.abs(nx - c.x), Math.abs(ny - c.y)))
        );
        if (nearestDist > 2) continue;
      }

      // Execute move: transfer entity to new tile, old tile becomes floor.
      transferEnemy(tiles, pos, { x: nx, y: ny }, tile, occupied);
      moved = true;
      break;
    }

    if (!moved) {
      // Enemy stays; position already in occupied set.
    }
  }

  // Ghost visibility flickering and materialization
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const t = tiles[y][x];
      if (t.type !== TileType.Enemy || t.enemySubtype !== 'ghost' || t.cleared) continue;

      // 30% chance to flip visibility
      if (Math.random() < 0.3) {
        t.ghostVisible = !t.ghostVisible;
      }

      // Materialization counter
      const distToPlayer = Math.max(Math.abs(x - playerPos.x), Math.abs(y - playerPos.y));
      if (!t.ghostVisible && distToPlayer <= 3) {
        t.ghostNearPlayerTurns = (t.ghostNearPlayerTurns ?? 0) + 1;
        if (t.ghostNearPlayerTurns >= 3) {
          t.ghostVisible = true;
          t.ghostMaterialized = true;
          t.ghostNearPlayerTurns = 0;
        }
      } else {
        t.ghostNearPlayerTurns = 0;
      }
    }
  }

  return { ...floor, tiles };
}
