import { describe, expect, it } from 'vitest';
import { generateDungeon } from '@/lib/gameLogic/dungeonGenerator';
import { TileType, type DungeonFloor, type Position, type Tile } from '@/lib/gameLogic/dungeonTypes';

function inBounds(floor: DungeonFloor, x: number, y: number): boolean {
  return y >= 0 && y < floor.height && x >= 0 && x < floor.width;
}

function isNonWall(tile: Tile): boolean {
  return tile.type !== TileType.Wall;
}

function getCardinalNonWallNeighbors(floor: DungeonFloor, pos: Position): Position[] {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  return dirs
    .map((d) => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter((p) => inBounds(floor, p.x, p.y) && isNonWall(floor.tiles[p.y][p.x]));
}

function isStraightHallwayTile(floor: DungeonFloor, pos: Position): boolean {
  const neighbors = getCardinalNonWallNeighbors(floor, pos);
  if (neighbors.length !== 2) return false;

  const [a, b] = neighbors;
  const sameX = a.x === pos.x && b.x === pos.x;
  const sameY = a.y === pos.y && b.y === pos.y;
  return sameX || sameY;
}

function keyOf(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function getReachableWithoutKey(floor: DungeonFloor): Set<string> {
  const visited = new Set<string>();
  const queue: Position[] = [floor.playerStart];
  visited.add(keyOf(floor.playerStart));

  while (queue.length > 0) {
    const current = queue.shift() as Position;
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const d of dirs) {
      const next = { x: current.x + d.x, y: current.y + d.y };
      if (!inBounds(floor, next.x, next.y)) continue;

      const tile = floor.tiles[next.y][next.x];
      if (tile.type === TileType.Wall || tile.type === TileType.Chest) continue;

      const nextKey = keyOf(next);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push(next);
    }
  }

  return visited;
}

function getAllPositionsByType(floor: DungeonFloor, type: TileType): Position[] {
  const out: Position[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      if (floor.tiles[y][x].type === type) out.push({ x, y });
    }
  }
  return out;
}

describe('Melody Dungeon generator placement rules', () => {
  it('places doors only on straight hallway tiles', () => {
    for (let floorNumber = 1; floorNumber <= 10; floorNumber++) {
      for (let i = 0; i < 40; i++) {
        const floor = generateDungeon(floorNumber);
        const doors = getAllPositionsByType(floor, TileType.Door);

        for (const door of doors) {
          expect(isStraightHallwayTile(floor, door)).toBe(true);
        }
      }
    }
  });

  it('keeps hallways and doors reachable without keys', () => {
    for (let floorNumber = 1; floorNumber <= 10; floorNumber++) {
      for (let i = 0; i < 40; i++) {
        const floor = generateDungeon(floorNumber);
        const reachable = getReachableWithoutKey(floor);
        const doors = getAllPositionsByType(floor, TileType.Door);

        for (let y = 0; y < floor.height; y++) {
          for (let x = 0; x < floor.width; x++) {
            const pos = { x, y };
            const tile = floor.tiles[y][x];
            if (!isNonWall(tile)) continue;

            if (isStraightHallwayTile(floor, pos)) {
              expect(reachable.has(keyOf(pos))).toBe(true);
            }
          }
        }

        for (const door of doors) {
          expect(reachable.has(keyOf(door))).toBe(true);
        }
      }
    }
  });
});
