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

function pickOpenFloorTile(
  grid: Tile[][],
  exclude: Position[],
  minDistFrom?: Position,
  minDist: number = 3
): Position | null {
  const floors = getFloorTiles(grid).filter(
    (p) =>
      !exclude.some((e) => e.x === p.x && e.y === p.y) &&
      (!minDistFrom || distanceSq(p, minDistFrom) >= minDist * minDist) &&
      isOpenEnough(grid, p)
  );
  if (floors.length === 0) return null;
  return floors[rand(0, floors.length - 1)];
}

function getChallengeTypesForFloor(floorNumber: number): ChallengeType[] {
  if (floorNumber <= 1) return ['noteReading'];
  if (floorNumber === 2) return ['noteReading', 'rhythmTap'];
  if (floorNumber === 3) return ['noteReading', 'rhythmTap', 'interval'];
  return ['noteReading', 'rhythmTap', 'interval', 'dynamics'];
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
        ? 'dynamics'
        : challengeTypes[rand(0, challengeTypes.length - 1)];
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }

  // Place doors between corridors if possible
  const doorCount = Math.min(1 + Math.floor(floorNumber / 2), 3);
  for (let i = 0; i < doorCount; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Door;
      grid[pos.y][pos.x].challengeType =
        floorNumber >= 2 ? 'rhythmTap' : 'noteReading';
      grid[pos.y][pos.x].cleared = false;
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
        floorNumber >= 3 ? 'interval' : 'noteReading';
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }

  // Place locked chests only in open areas so they can't block corridors
  const chestCount = rand(1, Math.min(2, 1 + Math.floor(floorNumber / 2)));
  for (let i = 0; i < chestCount; i++) {
    const pos = pickOpenFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Chest;
      grid[pos.y][pos.x].cleared = false;
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
