# Dragon Chase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Dragons chase the player when their guarded chest is stolen, with a 1-heart penalty + forced boss battle on catch.

**Architecture:** Add a generic `EnemyState` type to the tile system. Modify `moveEnemies` to dispatch movement by state (guarding/chasing/patrolling). Detect Dragon-on-player collision in `MelodyDungeonGame` after each enemy movement phase. The `moveEnemies` function gains a new return shape to signal Dragon catches.

**Tech Stack:** TypeScript, React, Vitest

---

### Task 1: Add EnemyState type to dungeonTypes.ts

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts:15-23`

**Step 1: Add the EnemyState type and update Tile interface**

Add `EnemyState` type after line 15 and add optional `enemyState` to the `Tile` interface:

```typescript
export type EnemyState = 'guarding' | 'chasing' | 'patrolling';
```

Update the `Tile` interface to include the optional property:

```typescript
export interface Tile {
  type: TileType;
  visible: boolean;
  visited: boolean;
  challengeType?: ChallengeType;
  cleared?: boolean;
  enemyState?: EnemyState;
}
```

**Step 2: Verify the project still compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors (new field is optional, all existing code is compatible)

**Step 3: Commit**

```bash
git add client/src/lib/gameLogic/dungeonTypes.ts
git commit -m "feat: add EnemyState type to tile system"
```

---

### Task 2: Set initial enemyState on Dragon and Enemy spawn

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:390-409`

**Step 1: Write failing test for initial enemy states**

Create test file `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — `enemyState` is `undefined`

**Step 3: Set enemyState during Dragon spawn (line ~394)**

In `generateDungeon`, where the Dragon tile is created (around line 391-394), add `enemyState`:

```typescript
grid[dragonPos.y][dragonPos.x].type = TileType.Dragon;
grid[dragonPos.y][dragonPos.x].challengeType =
  challengeTypes[rand(0, challengeTypes.length - 1)];
grid[dragonPos.y][dragonPos.x].cleared = false;
grid[dragonPos.y][dragonPos.x].enemyState = 'guarding';
```

**Step 4: Set enemyState during regular enemy spawn (line ~405-409)**

In the regular enemies loop, add `enemyState`:

```typescript
grid[pos.y][pos.x].type = TileType.Enemy;
grid[pos.y][pos.x].challengeType =
  challengeTypes[rand(0, challengeTypes.length - 1)];
grid[pos.y][pos.x].cleared = false;
grid[pos.y][pos.x].enemyState = 'patrolling';
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: set initial enemyState on Dragon and Enemy spawn"
```

---

### Task 3: Add direct pursuit movement for chasing Dragons

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:450-556` (the `moveEnemies` function)
- Test: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Step 1: Write failing test for chasing Dragon movement**

Add to the test file:

```typescript
import type { DungeonFloor, Tile } from '../dungeonTypes';

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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — Dragon moves randomly, not toward player

**Step 3: Implement state-based movement in moveEnemies**

Rewrite the movement logic inside the `for (const enemy of enemies)` loop in `moveEnemies`. The key changes are:

1. **Before the direction loop**, check if a Dragon should transition from guarding to chasing:
```typescript
// Dragon state transition: guarding → chasing when no uncleared chests.
if (tile.type === TileType.Dragon && tile.enemyState === 'guarding' && chests.length === 0) {
  tile.enemyState = 'chasing';
  tiles[pos.y][pos.x].enemyState = 'chasing';
}
```

2. **For chasing enemies**, replace the shuffled random direction with direct pursuit:
```typescript
if (tile.enemyState === 'chasing') {
  // Direct pursuit: pick the cardinal direction that minimizes Manhattan distance.
  const sorted = [...dirs].sort((a, b) => {
    const distA = Math.abs(pos.x + a.x - playerPos.x) + Math.abs(pos.y + a.y - playerPos.y);
    const distB = Math.abs(pos.x + b.x - playerPos.x) + Math.abs(pos.y + b.y - playerPos.y);
    return distA - distB;
  });

  for (const d of sorted) {
    const nx = pos.x + d.x;
    const ny = pos.y + d.y;
    if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

    const target = tiles[ny][nx];
    if (target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;

    const key = `${nx},${ny}`;
    if (occupied.has(key)) continue;

    // Allow chasing dragon to move onto player position
    // (collision is detected by caller)

    tiles[ny][nx] = {
      ...target,
      type: tile.type,
      challengeType: tile.challengeType,
      cleared: false,
      enemyState: tile.enemyState,
    };
    tiles[pos.y][pos.x] = {
      ...tiles[pos.y][pos.x],
      type: TileType.Floor,
      challengeType: undefined,
      cleared: undefined,
      enemyState: undefined,
    };

    occupied.delete(`${pos.x},${pos.y}`);
    occupied.add(key);
    moved = true;
    break;
  }

  if (moved) continue;
  // If no valid pursuit direction, fall through to stay put
  continue;
}
```

3. **For guarding/patrolling**, keep existing random + tether logic, and **preserve enemyState** during tile transfer:
```typescript
tiles[ny][nx] = {
  ...target,
  type: tile.type,
  challengeType: tile.challengeType,
  cleared: false,
  enemyState: tile.enemyState,  // ← ADD THIS
};
tiles[pos.y][pos.x] = {
  ...tiles[pos.y][pos.x],
  type: TileType.Floor,
  challengeType: undefined,
  cleared: undefined,
  enemyState: undefined,  // ← ADD THIS
};
```

4. **Remove player position from occupied set for chasing Dragons**: Currently line 478 adds `playerPos` to `occupied`. For chasing Dragons to catch the player, do NOT add player position to the main `occupied` set. Instead, non-chasing enemies still skip the player position via the existing `if (nx === playerPos.x && ny === playerPos.y) continue;` check (line 516). Chasing enemies skip that check.

**Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: add state-based movement with Dragon chase pursuit"
```

---

### Task 4: Detect Dragon-catches-player and trigger penalty + boss battle

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx`

This task modifies React component state logic. It does not have unit tests (React component with complex state is better verified manually).

**Step 1: Add a helper to detect Dragon at player position**

Add a utility function near the top of the file (after `updateVisibility`):

```typescript
/** Check if an uncleared Dragon occupies the given position. */
function findDragonAtPosition(floor: DungeonFloor, pos: Position): boolean {
  const tile = floor.tiles[pos.y]?.[pos.x];
  return tile?.type === TileType.Dragon && !tile.cleared;
}
```

**Step 2: Create a wrapper for moveEnemies that detects Dragon catch**

The tricky part is that `setFloor` is called with a function, and we need to know the result to trigger side effects. Add a ref to signal that a Dragon caught the player:

```typescript
const dragonCaughtRef = useRef(false);
```

Then create a wrapper function:

```typescript
/** Run moveEnemies and flag if a chasing Dragon lands on the player. */
function moveEnemiesAndDetectCatch(
  f: DungeonFloor,
  pos: Position
): DungeonFloor {
  const result = moveEnemies(f, pos);
  if (findDragonAtPosition(result, pos)) {
    dragonCaughtRef.current = true;
  }
  return result;
}
```

**Step 3: Replace all moveEnemies calls with the wrapper**

In `handleMove`, replace all `moveEnemies(...)` calls with `moveEnemiesAndDetectCatch(...)`. There are 3 occurrences:

1. Line 198 (chest opening): `moveEnemiesAndDetectCatch(updateVisibility({ ...f, tiles }, newPos), newPos)`
2. Line 228 (stairs): `moveEnemiesAndDetectCatch(updateVisibility(f, newPos), newPos)`
3. Line 233 (normal move): `moveEnemiesAndDetectCatch(updateVisibility(f, newPos), newPos)`

**Step 4: Add a useEffect to handle Dragon catch after state settles**

After the floor and player state updates settle, check the ref and trigger the penalty + boss battle:

```typescript
useEffect(() => {
  if (!dragonCaughtRef.current || phase !== 'playing') return;
  dragonCaughtRef.current = false;

  // Apply 1 heart penalty
  setPlayer((prev) => {
    const newHealth = Math.max(0, prev.health - 1);
    if (newHealth <= 0) {
      setPhase('gameOver');
      return { ...prev, health: 0 };
    }

    // Find the Dragon at player position to get its challenge type
    const tile = floor.tiles[prev.position.y]?.[prev.position.x];
    if (tile?.type === TileType.Dragon && !tile.cleared) {
      moveLockedRef.current = true;
      const challengeType: ChallengeType = tile.challengeType || 'noteReading';
      setActiveChallenge({ type: challengeType, tilePosition: prev.position });
      setActiveTileType(TileType.Dragon);
      setPhase('challenge');
    }

    return { ...prev, health: newHealth };
  });
}, [floor, phase]);
```

**Step 5: Verify the project compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: detect Dragon catch with 1-heart penalty and forced boss battle"
```

---

### Task 5: Manual playtest and final verification

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Playtest checklist**

- [ ] Start a game on floor 3+ (where Dragons appear)
- [ ] Verify Dragon patrols near its chest (guarding behavior unchanged)
- [ ] Open the chest with a key (without defeating the Dragon)
- [ ] Verify Dragon starts chasing the player
- [ ] Let the Dragon catch you — verify 1 heart of damage + boss battle triggers
- [ ] Win the boss battle — verify Dragon is cleared
- [ ] Verify regular enemies still move randomly (patrolling unchanged)
- [ ] Verify game over triggers correctly if you're at 1 health when caught

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 4: Final commit if any adjustments needed**

---

### Task 6: Commit all changes and clean up

**Step 1: Verify clean git state**

Run: `git status`
Expected: All changes committed, working tree clean

**Step 2: Run final type check**

Run: `cd client && npx tsc --noEmit`
Expected: No errors
