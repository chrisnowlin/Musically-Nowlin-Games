import { describe, it, expect } from 'vitest';
import { generateDungeon, moveEnemies, getBossType, rollSpecialFloorType } from '../logic/dungeonGenerator';
import { TileType, MAX_HEALTH } from '../logic/dungeonTypes';
import type { DungeonFloor, Position, Tile } from '../logic/dungeonTypes';

function findTiles(floor: ReturnType<typeof generateDungeon>, type: TileType) {
  const results: { pos: Position; tile: (typeof floor.tiles)[1][0] }[] = [];
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
    expect(getBossType(3)).toBeNull()
    expect(getBossType(7)).toBeNull()
    expect(getBossType(99)).toBeNull();
  });

  it('returns mini for floors divisible by 5 but not 10', () => {
    expect(getBossType(5)).toBe('mini')
    expect(getBossType(15)).toBe('mini')
    expect(getBossType(25)).toBe('mini')
    expect(getBossType(95)).toBe('mini');
  });

  it('returns big for floors divisible by 10', () => {
    expect(getBossType(10)).toBe('big')
    expect(getBossType(20)).toBe('big')
    expect(getBossType(50)).toBe('big')
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
    const validSubtypes = ['ghost', 'slime', 'bat', 'wraith', 'spider', 'skeleton', 'shade', 'goblin', 'siren'];
    for (const e of enemies) {
      expect(validSubtypes).toContain(e.enemySubtype);
      expect(e.enemyLevel).toBe(1);
    }
  });

  it('assigns dragon subtype with zone-based level +1 on floor 4', () => {
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
      if (floor.specialFloorType === 'loot') {
        expect(treasures.length).toBeGreaterThanOrEqual(15);
        expect(treasures.length).toBeLessThanOrEqual(20);
      } else {
        expect(treasures.length).toBeGreaterThanOrEqual(0);
        expect(treasures.length).toBeLessThanOrEqual(1);
      }
    }
  });

  it('ghost enemies spawn with ghostVisible set to true', () => {
    for (let run = 0; run < 20; run++) {
      const floor = generateDungeon(1);
      const ghosts = floor.tiles.flat().filter(
        (t) => t.type === TileType.Enemy && t.enemySubtype === 'ghost'
      );
      for (const g of ghosts) {
        expect(g.ghostVisible).toBe(true);
        expect(g.ghostNearPlayerTurns).toBe(0);
      }
    }
  });

  it('chests never block hallways or room entrances (all floor tiles reachable from player start)', () => {
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
    specialFloorType: 'normal',
  };
}

 describe('moveEnemies', () => {
  it('chasing Dragon moves toward player', () => {
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
    
    expect(result.tiles[0][2].type).toBe(TileType.Enemy);
    expect(result.tiles[0][2].enemySubtype).toBe('dragon');
    expect(result.tiles[0][3].type).toBe(TileType.Floor);
  });

  it('guarding Dragon stays tethered to chest', () => {
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
    
    for (let i = 0; i < 20; i++) {
      const result = moveEnemies(floor, playerPos);
      
      let dragonX = -1;
      for (let x = 0; x < 7; x++) {
        if (result.tiles[0][x].type === TileType.Enemy && result.tiles[0][x].enemySubtype === 'dragon') dragonX = x;
      }
      
      expect(Math.abs(dragonX - 3)).toBeLessThanOrEqual(2);
    }
  });

  it('Dragon transitions to chasing when nearby chest opened (distant chest remains guarding)', () => {
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
    
    let dragonX = -1;
    for (let x = 0; x < 10; x++) {
      if (result.tiles[0][x].type === TileType.Enemy && result.tiles[0][x].enemySubtype === 'dragon') dragonX = x;
    }
    
    expect(dragonX).toBe(2);
    expect(result.tiles[0][dragonX].enemyState).toBe('chasing');
  });

  it('chasing Dragon lands on player tile when adjacent (catch)', () => {
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
    
    expect(result.tiles[0][0].type).toBe(TileType.Enemy);
    expect(result.tiles[0][0].enemySubtype).toBe('dragon');
    expect(result.tiles[0][1].type).toBe(TileType.Floor);
  });

  it('Dragon transitions from guarding to chasing when no uncleared chests remain', () => {
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
    
    expect(result.tiles[0][2].type).toBe(TileType.Enemy);
    expect(result.tiles[0][2].enemySubtype).toBe('dragon');
    expect(result.tiles[0][2].enemyState).toBe('chasing');
  });

  for (const subtype of ['goblin', 'skeleton'] as const) {
    it(`patrolling ${subtype} lands on player tile when adjacent (catch)`, () => {
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
  }

  it('patrolling Ghost does NOT land on player tile when adjacent', () => {
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
    
    expect(result.tiles[0][0].type).toBe(TileType.Floor);
    
    const ghostExists =
      result.tiles[0][1].type === TileType.Enemy ||
      result.tiles[0][2].type === TileType.Enemy;
    expect(ghostExists).toBe(true);
  });

  it('patrolling Ghost can phase through a wall to reach floor on the other side', () => {
    const floor = createTestFloor(5, 1, (tiles) => {
      tiles[0][0] = { type: TileType.Floor, visible: false, visited: false };
      tiles[0][1] = { type: TileType.Wall, visible: false, visited: false };
      tiles[0][2] = {
        type: TileType.Enemy,
        enemySubtype: 'ghost' as const,
        enemyLevel: 1,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'patrolling',
        ghostVisible: true,
        ghostNearPlayerTurns: 0,
      };
      tiles[0][3] = { type: TileType.Wall, visible: false, visited: false };
      tiles[0][4] = { type: TileType.Floor, visible: false, visited: false };
    });
    
    const playerPos: Position = { x: 0, y: 0 };
    let reachedFarSide = false;
    for (let i = 0; i < 50; i++) {
      const result = moveEnemies(floor, playerPos);
      if (result.tiles[0][4].type === TileType.Enemy && result.tiles[0][4].enemySubtype === 'ghost') {
        reachedFarSide = true;
        break;
      }
    }
    
    expect(reachedFarSide).toBe(true);
  });

  it('ghost visibility can toggle after moveEnemies (30% flip chance)', () => {
    let sawInvisible = false;
    for (let i = 0; i < 100; i++) {
      const floor = createTestFloor(5, 5, (tiles) => {
        tiles[2][2] = {
          type: TileType.Enemy,
          enemySubtype: 'ghost' as const,
          enemyLevel: 1,
          visible: false,
          visited: false,
          challengeType: 'noteReading',
          cleared: false,
          enemyState: 'patrolling',
          ghostVisible: true,
          ghostNearPlayerTurns: 0,
        };
      });
      
      const result = moveEnemies(floor, { x: 0, y: 0 });
      
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if (result.tiles[y][x].type === TileType.Enemy && result.tiles[y][x].enemySubtype === 'ghost') {
            if (result.tiles[y][x].ghostVisible === false) sawInvisible = true;
          }
        }
      }
      
      if (sawInvisible) break;
    }
    
    expect(sawInvisible).toBe(true);
  });

  it('invisible ghost near player increments ghostNearPlayerTurns', () => {
    const floor = createTestFloor(7, 1, (tiles) => {
      tiles[0][2] = {
        type: TileType.Enemy,
        enemySubtype: 'ghost' as const,
        enemyLevel: 1,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'patrolling',
        ghostVisible: false,
        ghostNearPlayerTurns: 2,
      };
    });
    
    const origRandom = Math.random;
    Math.random = () => 0.3;
    
    const result = moveEnemies(floor, { x: 0, y: 0 });
    
    let found = false;
    try {
      for (let y = 0; y < 1; y++) {
        for (let x = 0; x < 7; x++) {
          const t = result.tiles[y][x];
          if (t.type === TileType.Enemy && t.enemySubtype === 'ghost') {
            expect(t.ghostVisible).toBe(true);
            expect(t.ghostMaterialized).toBe(true);
            expect(t.ghostNearPlayerTurns).toBe(0);
            found = true;
          }
        }
      }
      
      expect(found).toBe(true);
    } finally {
      Math.random = origRandom;
    }
  });

  it('patrolling Ghost does not stop on a wall tile (phases through not into)', () => {
    const floor = createTestFloor(3, 1, (tiles) => {
      tiles[0][0] = { type: TileType.Floor, visible: false, visited: false };
      tiles[0][1] = { type: TileType.Wall, visible: false, visited: false };
      tiles[0][2] = {
        type: TileType.Enemy,
        enemySubtype: 'ghost' as const,
        enemyLevel: 1,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'patrolling',
        ghostVisible: true,
        ghostNearPlayerTurns: 0,
      };
    });
    
    const playerPos: Position = { x: 0, y: 0 };
    for (let i = 0; i < 20; i++) {
      const result = moveEnemies(floor, playerPos);
      expect(result.tiles[0][1].type).toBe(TileType.Wall);
      expect(result.tiles[0][2].type).toBe(TileType.Enemy);
    }
  });
});

describe('boss floor generation', () => {
  it('places a MiniBoss tile on floor 5', () => {
    const floor = generateDungeon(5);
    const miniBosses = findTiles(floor, TileType.MiniBoss);
    expect(miniBosses.length).toBe(1);
    expect(miniBosses[0].pos).toEqual(floor.stairsPosition);
  });

  it('places a BigBoss tile on floor 10', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(10);
      const bigBosses = findTiles(floor, TileType.BigBoss);
      expect(bigBosses.length).toBe(1);
    }
  });
  
  it('MiniBoss on floor 5 has a 2x2 footprint (1 anchor + 3 BossBody tiles)', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(5);
      expect(findTiles(floor, TileType.MiniBoss).length).toBe(1);
      expect(findTiles(floor, TileType.BossBody).length).toBe(3);
    }
  });
  
  it('BigBoss on floor 10 has a 3x3 footprint (1 anchor + 8 BossBody tiles)', () => {
    for (let run = 0; run < 10; run++) {
      const floor = generateDungeon(10);
      expect(findTiles(floor, TileType.BigBoss).length).toBe(1);
      expect(findTiles(floor, TileType.BossBody).length).toBe(8);
      
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

describe('rollSpecialFloorType', () => {
  it('returns normal for floors 1-2', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollSpecialFloorType(1)).toBe('normal');
      expect(rollSpecialFloorType(2)).toBe('normal');
    }
  });

  it('returns normal for boss floors', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollSpecialFloorType(5)).toBe('normal');
      expect(rollSpecialFloorType(10)).toBe('normal');
      expect(rollSpecialFloorType(50)).toBe('normal');
      expect(rollSpecialFloorType(100)).toBe('normal');
    }
  });
});

describe('loot floor generation', () => {
  it('loot floor has 15-20 treasure tiles and no enemies/doors/chests/merchants', () => {
    let lootFloor: ReturnType<typeof generateDungeon> | null = null;
    for (let i = 0; i < 500; i++) {
      const floor = generateDungeon(3);
      if (floor.specialFloorType === 'loot') {
        lootFloor = floor;
        break;
      }
    }
    
    if (!lootFloor) return;
    
    const treasures = findTiles(lootFloor, TileType.Treasure);
    const enemies = findTiles(lootFloor, TileType.Enemy);
    const doors = findTiles(lootFloor, TileType.Door);
    const chests = findTiles(lootFloor, TileType.Chest);
    const merchants = findTiles(lootFloor, TileType.Merchant);
    const stalls = findTiles(lootFloor, TileType.MerchantStall);
    
    expect(treasures.length).toBeGreaterThanOrEqual(15);
    expect(treasures.length).toBeLessThanOrEqual(20);
    expect(enemies.length).toBe(0);
    expect(doors.length).toBe(0);
    expect(chests.length).toBe(0);
    expect(merchants.length).toBe(0);
    expect(stalls.length).toBe(0);
    expect(lootFloor.specialFloorType).toBe('loot');
  });
  
  it('loot floor still has stairs', () => {
    for (let i = 0; i < 500; i++) {
      const floor = generateDungeon(3);
      if (floor.specialFloorType === 'loot') {
        expect(findTiles(floor, TileType.Stairs).length).toBe(1);
        return;
      }
    }
  });
  
  it('normal floors have specialFloorType set to normal', () => {
    const floor = generateDungeon(1);
    expect(floor.specialFloorType).toBe('normal');
  });
  
  it('boss floors have specialFloorType set to normal', () => {
    const bossFloor = generateDungeon(5);
    expect(bossFloor.specialFloorType).toBe('normal');
  });
});

describe('healing floor generation', () => {
  it('places healing pools and potion shrines', () => {
    const floor = generateDungeon(3, { forceSpecialFloorType: 'healing' });
    expect(floor.specialFloorType).toBe('healing');
    
    const healingPools = findTiles(floor, TileType.HealingPool);
    const potionShrines = findTiles(floor, TileType.PotionShrine);
    const enemies = findTiles(floor, TileType.Enemy);
    
    expect(healingPools.length).toBeGreaterThanOrEqual(3);
    expect(healingPools.length).toBeLessThanOrEqual(5);
    expect(potionShrines.length).toBeGreaterThanOrEqual(2);
    expect(potionShrines.length).toBeLessThanOrEqual(3);
    expect(enemies.length).toBe(0);
  });
});

describe('fortune floor generation', () => {
  it('places a fortune teller NPC', () => {
    const floor = generateDungeon(3, { forceSpecialFloorType: 'fortune' });
    expect(floor.specialFloorType).toBe('fortune');
    
    const fortuneTellers = findTiles(floor, TileType.FortuneTeller);
    const enemies = findTiles(floor, TileType.Enemy);
    
    expect(fortuneTellers.length).toBe(1);
    expect(enemies.length).toBe(0);
  });
});

describe('challenge floor generation', () => {
  it('places enemies and arena chest', () => {
    const floor = generateDungeon(3, { forceSpecialFloorType: 'challenge' });
    expect(floor.specialFloorType).toBe('challenge');
    
    const enemies = findTiles(floor, TileType.Enemy);
    const arenaChests = findTiles(floor, TileType.ArenaChest);
    
    expect(enemies.length).toBeGreaterThanOrEqual(6);
    expect(enemies.length).toBeLessThanOrEqual(8);
    expect(arenaChests.length).toBe(1);
  });
});
