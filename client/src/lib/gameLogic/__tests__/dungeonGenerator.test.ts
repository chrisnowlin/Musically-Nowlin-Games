import { describe, it, expect } from 'vitest';
import { generateDungeon, moveEnemies } from '../dungeonGenerator';
import { TileType } from '../dungeonTypes';
import type { DungeonFloor, Position, Tile } from '../dungeonTypes';

/** Scan the grid and return all tiles matching the given type. */
function findTiles(floor: ReturnType<typeof generateDungeon>, type: TileType) {
  const results: { pos: Position; tile: (typeof floor.tiles)[0][0] }[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      if (floor.tiles[y][x].type === type) {
        results.push({ pos: { x, y }, tile: floor.tiles[y][x] });
      }
    }
  }
  return results;
}

describe('generateDungeon', () => {
  it('should set enemyState to guarding on Dragons', () => {
    // Floor 3+ guarantees a dragon spawn attempt
    const floor = generateDungeon(5);
    const dragons = findTiles(floor, TileType.Dragon);
    for (const d of dragons) {
      expect(d.tile.enemyState).toBe('guarding');
    }
  });

  it('should set enemyState to patrolling on regular enemies', () => {
    const floor = generateDungeon(5);
    const enemies = findTiles(floor, TileType.Enemy);
    for (const e of enemies) {
      expect(e.tile.enemyState).toBe('patrolling');
    }
  });
});

/** Create a minimal floor grid for testing movement. */
function createTestFloor(
  width: number,
  height: number,
  setup: (grid: Tile[][]) => void
): DungeonFloor {
  const tiles: Tile[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      type: TileType.Floor,
      visible: false,
      visited: false,
    }))
  );
  setup(tiles);
  return {
    tiles,
    width,
    height,
    floorNumber: 5,
    themeIndex: 0,
    playerStart: { x: 0, y: 0 },
    stairsPosition: { x: width - 1, y: height - 1 },
  };
}

describe('moveEnemies', () => {
  it('chasing Dragon moves toward the player', () => {
    // 5x1 corridor: [player] [floor] [floor] [dragon] [floor]
    const floor = createTestFloor(5, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Dragon,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'chasing',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    // Dragon should have moved from x=3 toward player at x=0, so now at x=2
    expect(result.tiles[0][2].type).toBe(TileType.Dragon);
    expect(result.tiles[0][3].type).toBe(TileType.Floor);
  });

  it('guarding Dragon stays tethered to chest', () => {
    // 7x1 corridor: [player] [floor] [floor] [chest] [dragon] [floor] [floor]
    const floor = createTestFloor(7, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Chest,
        visible: false,
        visited: false,
        cleared: false,
      };
      tiles[0][4] = {
        type: TileType.Dragon,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'guarding',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    // Run multiple times; dragon should never go beyond Chebyshev distance 2 from chest
    for (let i = 0; i < 20; i++) {
      const result = moveEnemies(floor, playerPos);
      // Find where dragon ended up
      let dragonX = -1;
      for (let x = 0; x < 7; x++) {
        if (result.tiles[0][x].type === TileType.Dragon) dragonX = x;
      }
      // Chebyshev distance from chest at x=3 should be <= 2
      expect(Math.abs(dragonX - 3)).toBeLessThanOrEqual(2);
    }
  });

  it('Dragon transitions to chasing when its nearby chest is opened but a distant chest remains', () => {
    // 10x1 corridor: [player] ... [dragon at x=3] ... [distant chest at x=9]
    // Dragon's nearby chest was opened (not present). Distant chest is beyond tether range.
    const floor = createTestFloor(10, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Dragon,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'guarding',
      };
      tiles[0][9] = {
        type: TileType.Chest,
        visible: false,
        visited: false,
        cleared: false,
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    // Dragon should transition to chasing (distant chest is beyond Chebyshev distance 2)
    // and move toward the player, NOT freeze in place
    let dragonX = -1;
    for (let x = 0; x < 10; x++) {
      if (result.tiles[0][x].type === TileType.Dragon) dragonX = x;
    }
    expect(dragonX).toBe(2); // Moved toward player from x=3
    expect(result.tiles[0][dragonX].enemyState).toBe('chasing');
  });

  it('Dragon transitions from guarding to chasing when no uncleared chests remain', () => {
    // 5x1 corridor: [player] [floor] [floor] [dragon] [floor]
    // No chests on the floor at all
    const floor = createTestFloor(5, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Dragon,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'guarding',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    // Dragon should have transitioned to chasing and moved toward player
    expect(result.tiles[0][2].type).toBe(TileType.Dragon);
    expect(result.tiles[0][2].enemyState).toBe('chasing');
  });
});
