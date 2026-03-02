import { describe, it, expect } from 'vitest';
import { generateDungeon, moveEnemies, getBossType } from '../logic/dungeonGenerator';
import { TileType } from '../logic/dungeonTypes';
import type { DungeonFloor, Position, Tile } from '../logic/dungeonTypes';

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

describe('getBossType', () => {
  it('returns null for non-boss floors', () => {
    expect(getBossType(1)).toBeNull();
    expect(getBossType(3)).toBeNull();
    expect(getBossType(7)).toBeNull();
    expect(getBossType(99)).toBeNull();
  });

  it('returns mini for floors divisible by 5 but not 10', () => {
    expect(getBossType(5)).toBe('mini');
    expect(getBossType(15)).toBe('mini');
    expect(getBossType(25)).toBe('mini');
    expect(getBossType(95)).toBe('mini');
  });

  it('returns big for floors divisible by 10', () => {
    expect(getBossType(10)).toBe('big');
    expect(getBossType(20)).toBe('big');
    expect(getBossType(50)).toBe('big');
    expect(getBossType(100)).toBe('big');
  });
});

describe('generateDungeon', () => {
  it('should set enemyState to guarding on dragons', () => {
    const floor = generateDungeon(4);
    const dragons = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype === 'dragon'
    );
    for (const d of dragons) {
      expect(d.enemyState).toBe('guarding');
    }
  });

  it('should set enemyState to patrolling on non-dragon enemies', () => {
    const floor = generateDungeon(4);
    const enemies = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
    );
    for (const e of enemies) {
      expect(e.enemyState).toBe('patrolling');
    }
  });

  it('assigns valid subtypes with level 1 on floor 1', () => {
    const floor = generateDungeon(1);
    const enemies = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
    );
    expect(enemies.length).toBeGreaterThan(0);
    // All 8 challenge types are unlocked from floor 1, so all subtypes are valid
    const validSubtypes = ['ghost', 'slime', 'bat', 'wraith', 'spider', 'skeleton', 'shade', 'goblin', 'siren'];
    for (const e of enemies) {
      expect(validSubtypes).toContain(e.enemySubtype);
      expect(e.enemyLevel).toBe(1);
    }
  });

  it('assigns dragon subtype with zone-based level +1 on floor 4', () => {
    // Floor 4 is in T1 pure zone, so getEnemyLevel(4) = 1, dragon = min(5, 1+1) = 2
    const floor = generateDungeon(4);
    const dragons = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype === 'dragon'
    );
    for (const d of dragons) {
      expect(d.enemyState).toBe('guarding');
      expect(d.enemyLevel).toBe(2);
    }
  });

  it('assigns level 1 on floor 8 (T1 pure zone)', () => {
    for (let run = 0; run < 5; run++) {
      const floor = generateDungeon(8);
      const enemies = floor.tiles.flat().filter(
        (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
      );
      for (const e of enemies) {
        expect(e.enemyLevel).toBe(1);
      }
    }
  });

  it('assigns level 1 or 2 on floor 15 (T1→T2 transition)', () => {
    for (let run = 0; run < 5; run++) {
      const floor = generateDungeon(15);
      const enemies = floor.tiles.flat().filter(
        (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
      );
      for (const e of enemies) {
        expect(e.enemyLevel).toBeGreaterThanOrEqual(1);
        expect(e.enemyLevel).toBeLessThanOrEqual(2);
      }
    }
  });

  it('assigns level 3 on floor 52 (T3 pure zone)', () => {
    for (let run = 0; run < 5; run++) {
      const floor = generateDungeon(52);
      const enemies = floor.tiles.flat().filter(
        (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
      );
      for (const e of enemies) {
        expect(e.enemyLevel).toBe(3);
      }
    }
  });

  it('dragon level is at most zone level + 1, capped at 5', () => {
    // Test across several floors that produce dragons (floor >= 3, non-boss)
    for (const floorNum of [3, 4, 8, 15, 50]) {
      for (let run = 0; run < 5; run++) {
        const floor = generateDungeon(floorNum);
        const dragons = floor.tiles.flat().filter(
          (t) => t.type === TileType.Enemy && t.enemySubtype === 'dragon'
        );
        for (const d of dragons) {
          expect(d.enemyLevel).toBeGreaterThanOrEqual(1);
          expect(d.enemyLevel).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('places 0 or 1 treasure tiles on non-boss, non-loot floors', () => {
    for (let run = 0; run < 20; run++) {
      const floor = generateDungeon(3);
      const treasures = findTiles(floor, TileType.Treasure);
      if (floor.isLootFloor) {
        // Loot floors place 15–20 treasure piles
        expect(treasures.length).toBeGreaterThanOrEqual(15);
        expect(treasures.length).toBeLessThanOrEqual(20);
      } else {
        expect(treasures.length).toBeGreaterThanOrEqual(0);
        expect(treasures.length).toBeLessThanOrEqual(1);
      }
    }
  });

  it('chests never block hallways or room entrances (all floor tiles reachable from player start)', () => {
    // BFS treating chests and merchant stalls as solid — mirrors getReachableWithoutKey.
    function reachableWithoutChests(floor: ReturnType<typeof generateDungeon>): Set<string> {
      const visited = new Set<string>();
      const queue: Array<{ x: number; y: number }> = [floor.playerStart];
      visited.add(`${floor.playerStart.x},${floor.playerStart.y}`);
      const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        for (const d of dirs) {
          const nx = cur.x + d.x;
          const ny = cur.y + d.y;
          if (ny < 0 || ny >= floor.height || nx < 0 || nx >= floor.width) continue;
          const t = floor.tiles[ny][nx];
          if (
            t.type === TileType.Wall ||
            t.type === TileType.Chest ||
            t.type === TileType.MerchantStall
          )
            continue;
          const key = `${nx},${ny}`;
          if (visited.has(key)) continue;
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
      return visited;
    }

    // Run across several floor numbers to exercise different dungeon layouts.
    for (const floorNum of [1, 2, 3, 4, 6, 8]) {
      for (let run = 0; run < 5; run++) {
        const floor = generateDungeon(floorNum);
        const reachable = reachableWithoutChests(floor);
        for (let y = 0; y < floor.height; y++) {
          for (let x = 0; x < floor.width; x++) {
            const t = floor.tiles[y][x];
            if (
              t.type === TileType.Wall ||
              t.type === TileType.Chest ||
              t.type === TileType.MerchantStall
            )
              continue;
            expect(reachable.has(`${x},${y}`)).toBe(true);
          }
        }
      }
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
    isLootFloor: false,
  };
}

describe('moveEnemies', () => {
  it('chasing Dragon moves toward the player', () => {
    // 5x1 corridor: [player] [floor] [floor] [dragon] [floor]
    const floor = createTestFloor(5, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
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
    expect(result.tiles[0][2].type).toBe(TileType.Enemy);
    expect(result.tiles[0][2].enemySubtype).toBe('dragon');
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
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
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
        if (result.tiles[0][x].type === TileType.Enemy && result.tiles[0][x].enemySubtype === 'dragon') dragonX = x;
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
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
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
      if (result.tiles[0][x].type === TileType.Enemy && result.tiles[0][x].enemySubtype === 'dragon') dragonX = x;
    }
    expect(dragonX).toBe(2); // Moved toward player from x=3
    expect(result.tiles[0][dragonX].enemyState).toBe('chasing');
  });

  it('chasing Dragon lands on player tile when adjacent (catch)', () => {
    // 3x1 corridor: [player] [dragon] [floor]
    const floor = createTestFloor(3, 1, (tiles) => {
      tiles[0][1] = {
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'chasing',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    // Dragon should occupy the player tile (catch triggered)
    expect(result.tiles[0][0].type).toBe(TileType.Enemy);
    expect(result.tiles[0][0].enemySubtype).toBe('dragon');
    expect(result.tiles[0][1].type).toBe(TileType.Floor);
  });

  it('Dragon transitions from guarding to chasing when no uncleared chests remain', () => {
    // 5x1 corridor: [player] [floor] [floor] [dragon] [floor]
    // No chests on the floor at all
    const floor = createTestFloor(5, 1, (tiles) => {
      tiles[0][3] = {
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
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
    expect(result.tiles[0][2].type).toBe(TileType.Enemy);
    expect(result.tiles[0][2].enemySubtype).toBe('dragon');
    expect(result.tiles[0][2].enemyState).toBe('chasing');
  });

  it.each([
    ['goblin' as const],
    ['skeleton' as const],
  ])('patrolling %s lands on player tile when adjacent', (subtype) => {
    // 2x1 corridor so the only valid move is onto the player tile — eliminates direction randomness
    const floor = createTestFloor(2, 1, (tiles) => {
      tiles[0][1] = {
        type: TileType.Enemy,
        enemySubtype: subtype,
        enemyLevel: 1,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'patrolling',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    expect(result.tiles[0][0].type).toBe(TileType.Enemy);
    expect(result.tiles[0][0].enemySubtype).toBe(subtype);
    expect(result.tiles[0][1].type).toBe(TileType.Floor);
  });

  it('patrolling Ghost does NOT land on player tile when adjacent', () => {
    // 3x1 corridor: [player] [ghost] [floor]
    // Ghost's only non-wall option other than player tile is x=2.
    const floor = createTestFloor(3, 1, (tiles) => {
      tiles[0][1] = {
        type: TileType.Enemy,
        enemySubtype: 'ghost' as const,
        enemyLevel: 1,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'patrolling',
      };
    });

    const playerPos: Position = { x: 0, y: 0 };
    const result = moveEnemies(floor, playerPos);

    // Ghost must never occupy the player tile
    expect(result.tiles[0][0].type).toBe(TileType.Floor);
    // Ghost must still exist somewhere on the board (stayed at x=1 or moved to x=2)
    const ghostExists =
      result.tiles[0][1].type === TileType.Enemy ||
      result.tiles[0][2].type === TileType.Enemy;
    expect(ghostExists).toBe(true);
  });
});

describe('boss floor generation', () => {
  it('places a MiniBoss tile on floor 5', () => {
    const floor = generateDungeon(5);
    const miniBosses = findTiles(floor, TileType.MiniBoss);
    expect(miniBosses.length).toBe(1);
    expect(miniBosses[0].pos).toEqual(floor.stairsPosition);
  });

  // UPDATE: remove position assertion since BigBoss anchor is now offset from center
  it('places a BigBoss tile on floor 10', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(10);
      const bigBosses = findTiles(floor, TileType.BigBoss);
      expect(bigBosses.length).toBe(1);
    }
  });

  // ADD: footprint size tests
  it('MiniBoss on floor 5 has a 2×2 footprint (1 anchor + 3 BossBody tiles)', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(5);
      expect(findTiles(floor, TileType.MiniBoss).length).toBe(1);
      expect(findTiles(floor, TileType.BossBody).length).toBe(3);
    }
  });

  it('BigBoss on floor 10 has a 3×3 footprint (1 anchor + 8 BossBody tiles)', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(10);
      expect(findTiles(floor, TileType.BigBoss).length).toBe(1);
      expect(findTiles(floor, TileType.BossBody).length).toBe(8);
      // Anchor is centered: offset (-1,-1) from stairsPosition
      const anchor = findTiles(floor, TileType.BigBoss)[0];
      expect(anchor.pos).toEqual({
        x: floor.stairsPosition.x - 1,
        y: floor.stairsPosition.y - 1,
      });
    }
  });

  it('non-boss floors have no BossBody tiles', () => {
    for (const floorNum of [1, 3, 4, 6, 7, 8, 9]) {
      const floor = generateDungeon(floorNum);
      expect(findTiles(floor, TileType.BossBody).length).toBe(0);
    }
  });

  it('has no enemies on boss floors', () => {
    const floor5 = generateDungeon(5);
    const floor10 = generateDungeon(10);
    expect(findTiles(floor5, TileType.Enemy).length).toBe(0);
    expect(findTiles(floor10, TileType.Enemy).length).toBe(0);
  });

  it('has no Stairs tile visible on boss floors (boss replaces it)', () => {
    const floor = generateDungeon(5);
    expect(findTiles(floor, TileType.Stairs).length).toBe(0);
  });

  it('has no chests on boss floors', () => {
    const floor5 = generateDungeon(5);
    const floor10 = generateDungeon(10);
    expect(findTiles(floor5, TileType.Chest).length).toBe(0);
    expect(findTiles(floor10, TileType.Chest).length).toBe(0);
  });

  it('does not generate boss tiles on non-boss floors', () => {
    const floor = generateDungeon(3);
    expect(findTiles(floor, TileType.MiniBoss).length).toBe(0);
    expect(findTiles(floor, TileType.BigBoss).length).toBe(0);
    expect(findTiles(floor, TileType.Stairs).length).toBe(1);
  });
});
