import {
  type DungeonFloor,
  type Tile,
  type Position,
  type Rect,
  type ChallengeType,
  TileType,
  DUNGEON_WIDTH,
  DUNGEON_HEIGHT,
} from './dungeonTypes';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function isStraightHallwayNonWallTile(grid: Tile[][], pos: Position): boolean {
  if (grid[pos.y][pos.x].type === TileType.Wall) return false;

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
      if (tile.type === TileType.Wall || tile.type === TileType.Chest) continue;

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
      const pos = { x, y };
      const tile = grid[y][x];
      if (tile.type === TileType.Door && !reachable.has(keyOf(pos))) return false;
      if (isStraightHallwayNonWallTile(grid, pos) && !reachable.has(keyOf(pos))) return false;
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
  const challengeTypes = getChallengeTypesForFloor(floorNumber);
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
    grid[candidate.y][candidate.x].challengeType =
      challengeTypes[rand(0, challengeTypes.length - 1)];
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

function getChallengeTypesForFloor(floorNumber: number): ChallengeType[] {
  // Keep early floors simpler, then gradually introduce harder question types.
  if (floorNumber <= 5) return ['noteReading', 'dynamics'];
  if (floorNumber <= 10) return ['noteReading', 'dynamics', 'rhythmTap'];
  return ['noteReading', 'dynamics', 'rhythmTap', 'interval'];
}

export function generateDungeon(floorNumber: number): DungeonFloor {
  const width = DUNGEON_WIDTH;
  const height = DUNGEON_HEIGHT;
  const grid = createEmptyGrid(width, height);

  const roomCount = rand(3, 5);
  const rooms: Rect[] = [];
  const maxAttempts = 100;

  for (let i = 0; i < roomCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const w = rand(3, 5);
      const h = rand(3, 5);
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

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    carveCorridor(grid, roomCenter(rooms[i - 1]), roomCenter(rooms[i]));
  }

  // Place player start in first room
  const playerStart = roomCenter(rooms[0]);
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  // Place stairs in last room, far from player
  const stairsPosition = roomCenter(rooms[rooms.length - 1]);
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

  const placedPositions = [playerStart, stairsPosition];
  const challengeTypes = getChallengeTypesForFloor(floorNumber);

  // Place enemies
  const enemyCount = Math.min(2 + floorNumber, 6);
  for (let i = 0; i < enemyCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
    if (pos) {
      const isBoss = floorNumber >= 3 && i === 0;
      grid[pos.y][pos.x].type = isBoss ? TileType.Boss : TileType.Enemy;
      grid[pos.y][pos.x].challengeType = isBoss
        ? challengeTypes[rand(0, challengeTypes.length - 1)]
        : challengeTypes[rand(0, challengeTypes.length - 1)];
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
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

  // Place treasure (free pickup)
  const treasureCount = rand(1, 2);
  for (let i = 0; i < treasureCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Treasure;
      grid[pos.y][pos.x].challengeType =
        challengeTypes[rand(0, challengeTypes.length - 1)];
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }

  // Place locked chests only where they cannot block no-key hallway traversal.
  const chestCount = rand(1, Math.min(2, 1 + Math.floor(floorNumber / 2)));
  for (let i = 0; i < chestCount; i++) {
    const pos = pickValidChestTile(grid, placedPositions, playerStart);
    if (pos) {
      placedPositions.push(pos);
    }
  }

  return {
    tiles: grid,
    width,
    height,
    floorNumber,
    themeIndex: rand(0, 7),
    playerStart,
    stairsPosition,
  };
}
