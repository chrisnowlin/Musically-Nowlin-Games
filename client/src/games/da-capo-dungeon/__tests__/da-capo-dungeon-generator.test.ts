import { describe, expect, it } from 'vitest';
import { generateDungeon } from '../logic/dungeonGenerator';
import { TileType, type DungeonFloor, type Position, type Tile } from '../logic/dungeonTypes';

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
      if (tile.type === TileType.Wall || tile.type === TileType.Chest || tile.type === TileType.MerchantStall) continue;

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

describe('Da Capo Dungeon generator placement rules', () => {
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

  it('places merchant and stall as adjacent pair', () => {
    let merchantFound = false;
    // Run enough times to hit the 40% spawn chance
    for (let attempt = 0; attempt < 200; attempt++) {
      const floor = generateDungeon(5);
      const merchants = getAllPositionsByType(floor, TileType.Merchant);
      const stalls = getAllPositionsByType(floor, TileType.MerchantStall);

      if (merchants.length === 0 && stalls.length === 0) continue;

      merchantFound = true;

      // Always paired: exactly 1 merchant and 1 stall
      expect(merchants).toHaveLength(1);
      expect(stalls).toHaveLength(1);

      // They must be cardinally adjacent
      const m = merchants[0];
      const s = stalls[0];
      const dist = Math.abs(m.x - s.x) + Math.abs(m.y - s.y);
      expect(dist).toBe(1);
    }
    expect(merchantFound).toBe(true);
  });

  it('never places merchants on floor 1', () => {
    for (let i = 0; i < 100; i++) {
      const floor = generateDungeon(1);
      const merchants = getAllPositionsByType(floor, TileType.Merchant);
      const stalls = getAllPositionsByType(floor, TileType.MerchantStall);
      expect(merchants).toHaveLength(0);
      expect(stalls).toHaveLength(0);
    }
  });

  it('always places a merchant on floor 2 (normal layout)', () => {
    for (let i = 0; i < 50; i++) {
      // Force normal layout since floor 2 is a lore gate floor by default
      const floor = generateDungeon(2, { forceSpecialFloorType: 'normal' });
      const merchants = getAllPositionsByType(floor, TileType.Merchant);
      const stalls = getAllPositionsByType(floor, TileType.MerchantStall);
      expect(merchants).toHaveLength(1);
      expect(stalls).toHaveLength(1);
    }
  });

  it('merchant stall does not block hallway reachability', () => {
    for (let floorNumber = 2; floorNumber <= 10; floorNumber++) {
      for (let i = 0; i < 40; i++) {
        const floor = generateDungeon(floorNumber);
        const reachable = getReachableWithoutKey(floor);

        for (let y = 0; y < floor.height; y++) {
          for (let x = 0; x < floor.width; x++) {
            const pos = { x, y };
            const tile = floor.tiles[y][x];
            if (!isNonWall(tile)) continue;
            if (tile.type === TileType.MerchantStall) continue;

            if (isStraightHallwayTile(floor, pos)) {
              expect(reachable.has(keyOf(pos))).toBe(true);
            }
          }
        }
      }
    }
  });

  it('chests never create a bottleneck for adjacent tiles', () => {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (let floorNumber = 1; floorNumber <= 10; floorNumber++) {
      for (let i = 0; i < 40; i++) {
        const floor = generateDungeon(floorNumber);
        const chests = getAllPositionsByType(floor, TileType.Chest);

        for (const chest of chests) {
          // Each walkable neighbor of the chest must still have >= 2
          // walkable neighbors (treating the chest as blocking).
          for (const d of dirs) {
            const nx = chest.x + d.x;
            const ny = chest.y + d.y;
            if (!inBounds(floor, nx, ny)) continue;
            if (!isNonWall(floor.tiles[ny][nx])) continue;

            let walkable = 0;
            for (const d2 of dirs) {
              const nnx = nx + d2.x;
              const nny = ny + d2.y;
              if (!inBounds(floor, nnx, nny)) continue;
              if (nnx === chest.x && nny === chest.y) continue;
              if (isNonWall(floor.tiles[nny][nnx])) walkable++;
            }

            expect(walkable).toBeGreaterThanOrEqual(2);
          }
        }
      }
    }
  });
});
