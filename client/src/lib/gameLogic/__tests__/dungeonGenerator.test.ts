import { describe, it, expect } from 'vitest';
import { generateDungeon, moveEnemies } from '../dungeonGenerator';
import { TileType } from '../dungeonTypes';
import type { Position } from '../dungeonTypes';

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
