import {
  type DungeonFloor,
  type Tile,
  type Position,
  type Rect,
  type EnemySubtype,
  type ChallengeType,
  TileType,
  getDungeonSize,
  DUNGEON_BASE_SIZE,
} from './dungeonTypes';
import { getChallengeTypesForFloor, getSubtypeChallengePool, getEnemySubtypesForFloor, getEnemyLevel, rollChallengeType } from '../challengeHelpers';

export function getBossType(floorNumber: number): 'big' | 'mini' | null {
  if (floorNumber % 10 === 0) return 'big';
  if (floorNumber % 5 === 0) return 'mini';
  return null;
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
    return isOpenEnough(grid, p);
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

export function generateDungeon(floorNumber: number): DungeonFloor {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);
  const bossType = getBossType(floorNumber);

  // Scale room count and max room size with dungeon size
  const growth = width - DUNGEON_BASE_SIZE;
  const roomCount = rand(3, 5 + Math.floor(growth / 2));
  const maxRoomDim = Math.min(5 + Math.floor(growth / 3), 7);
  const rooms: Rect[] = [];
  const maxAttempts = 100;

  for (let i = 0; i < roomCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const w = rand(3, maxRoomDim);
      const h = rand(3, maxRoomDim);
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
      const w = 3;
      const h = 3;
      const x = rand(1, width - w - 1);
      const y = rand(1, height - h - 1);
      rooms.push({ x, y, w, h });
      carveRoom(grid, { x, y, w, h });
    }
  }

  // On boss floors, expand the last room to make space for the boss arena.
  if (bossType && rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    const targetSize = Math.min(7, Math.max(lastRoom.w, 5));
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
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      const adjacentCandidates = dirs
        .map((d) => ({ x: chest.x + d.x, y: chest.y + d.y }))
        .filter(
          (p) =>
            p.y >= 0 &&
            p.y < height &&
            p.x >= 0 &&
            p.x < width &&
            grid[p.y][p.x].type === TileType.Floor &&
            !placedPositions.some((e) => e.x === p.x && e.y === p.y) &&
            isOpenEnough(grid, p)
        );
      const dragonPos =
        adjacentCandidates.length > 0
          ? adjacentCandidates[rand(0, adjacentCandidates.length - 1)]
          : pickRandomFloorTile(grid, placedPositions, playerStart, 3);
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
    stairsPosition: playerStart, // No stairs in dev room
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

        tiles[ny][nx] = {
          ...target,
          type: tile.type,
          enemySubtype: tile.enemySubtype,
          enemyLevel: tile.enemyLevel,
          challengeType: tile.challengeType,
          cleared: false,
          enemyState: tile.enemyState,
        };
        tiles[pos.y][pos.x] = {
          ...tiles[pos.y][pos.x],
          type: TileType.Floor,
          enemySubtype: undefined,
          enemyLevel: undefined,
          challengeType: undefined,
          cleared: undefined,
          enemyState: undefined,
        };

        occupied.delete(`${pos.x},${pos.y}`);
        occupied.add(key);
        break;
      }
      continue; // Skip the default random movement
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
      if (isPlayerTile && tile.enemySubtype === 'ghost') continue;
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
      tiles[ny][nx] = {
        ...target,
        type: tile.type,
        enemySubtype: tile.enemySubtype,
        enemyLevel: tile.enemyLevel,
        challengeType: tile.challengeType,
        cleared: false,
        enemyState: tile.enemyState,
      };
      tiles[pos.y][pos.x] = {
        ...tiles[pos.y][pos.x],
        type: TileType.Floor,
        enemySubtype: undefined,
        enemyLevel: undefined,
        challengeType: undefined,
        cleared: undefined,
        enemyState: undefined,
      };

      // Update occupied set.
      occupied.delete(`${pos.x},${pos.y}`);
      occupied.add(key);
      moved = true;
      break;
    }

    if (!moved) {
      // Enemy stays; position already in occupied set.
    }
  }

  return { ...floor, tiles };
}
