# Patrol Enemy Bump Behavior Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow goblins and skeletons to bump into the player during patrol and trigger a challenge modal, while ghosts retain their player-avoidance behavior.

**Architecture:** Two-file change. In `dungeonGenerator.ts`, the patrol player-position guard becomes subtype-conditioned (ghosts skip the player tile; goblins/skeletons can land on it). In `MelodyDungeonGame.tsx`, the dragon-specific catch ref and detection function are generalized to handle any catching enemy, with the HP penalty branching only for dragons.

**Tech Stack:** TypeScript, React (useRef, useEffect), Vitest

---

### Task 1: Write failing tests for patrol bump behavior

**Files:**
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

The `createTestFloor` helper and `TileType`/`Position` imports already exist in this file. Tests go inside the existing `describe('moveEnemies', ...)` block, after the last existing test.

**Step 1: Add three failing tests**

Open `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts` and append inside `describe('moveEnemies', ...)` after the last `it(...)` block (before the closing `}`):

```ts
  it('patrolling Goblin lands on player tile when adjacent', () => {
    // 3x1 corridor: [player] [goblin] [floor]
    const floor = createTestFloor(3, 1, (tiles) => {
      tiles[0][1] = {
        type: TileType.Enemy,
        enemySubtype: 'goblin' as const,
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
    expect(result.tiles[0][0].enemySubtype).toBe('goblin');
    expect(result.tiles[0][1].type).toBe(TileType.Floor);
  });

  it('patrolling Skeleton lands on player tile when adjacent', () => {
    // 3x1 corridor: [player] [skeleton] [floor]
    const floor = createTestFloor(3, 1, (tiles) => {
      tiles[0][1] = {
        type: TileType.Enemy,
        enemySubtype: 'skeleton' as const,
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
    expect(result.tiles[0][0].enemySubtype).toBe('skeleton');
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
  });
```

**Step 2: Run to verify all three fail**

```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
```

Expected: 3 new failures. Goblin and skeleton tests fail with `expected 'floor' to be 'enemy'`. Ghost test may pass by luck (50% chance of moving right); re-run a couple times or inspect — it'll become reliable after Task 2.

---

### Task 2: Fix the patrol guard in `dungeonGenerator.ts`

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:672-674`

**Step 1: Replace the blanket guard with a subtype-conditioned one**

Find this block (around line 667–675):

```ts
    let moved = false;
    for (const d of shuffled) {
      const nx = pos.x + d.x;
      const ny = pos.y + d.y;
      if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

      const target = tiles[ny][nx];
      if (target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
      if (nx === playerPos.x && ny === playerPos.y) continue;
```

Replace with:

```ts
    let moved = false;
    for (const d of shuffled) {
      const nx = pos.x + d.x;
      const ny = pos.y + d.y;
      if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) continue;

      const isPlayerTile = nx === playerPos.x && ny === playerPos.y;
      const target = tiles[ny][nx];
      if (isPlayerTile && tile.enemySubtype === 'ghost') continue;
      if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
```

**Step 2: Run tests to verify all pass**

```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
```

Expected: all 22 tests pass (19 prior + 3 new).

**Step 3: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: allow goblins and skeletons to bump into the player during patrol"
```

---

### Task 3: Generalize catch detection in `MelodyDungeonGame.tsx`

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx:55-59, 116, 125-136, 196-220`

**Step 1: Replace `findDragonAtPosition` with `findCatchingEnemyAtPosition`**

Find (lines 55–59):

```ts
/** Check if an uncleared Dragon (enemy with subtype 'dragon') occupies the given position. */
function findDragonAtPosition(floor: DungeonFloor, pos: Position): boolean {
  const tile = floor.tiles[pos.y]?.[pos.x];
  return tile?.type === TileType.Enemy && tile.enemySubtype === 'dragon' && !tile.cleared;
}
```

Replace with:

```ts
/** Return the tile if any uncleared enemy occupies the player's position (i.e. it bumped into them), otherwise null. */
function findCatchingEnemyAtPosition(floor: DungeonFloor, pos: Position): Tile | null {
  const tile = floor.tiles[pos.y]?.[pos.x];
  if (tile?.type === TileType.Enemy && !tile.cleared) return tile;
  return null;
}
```

**Step 2: Update `enemyCaughtRef` type and rename**

Find (line 116):

```ts
  const dragonCaughtRef = useRef<ChallengeType | false>(false);
```

Replace with:

```ts
  const enemyCaughtRef = useRef<{ challengeType: ChallengeType; subtype: EnemySubtype; level: number } | false>(false);
```

**Step 3: Update `moveEnemiesAndDetectCatch`**

Find (lines 125–136):

```ts
  /** Run moveEnemies and flag if a chasing Dragon lands on the player. */
  function moveEnemiesAndDetectCatch(
    f: DungeonFloor,
    pos: Position
  ): DungeonFloor {
    const result = moveEnemies(f, pos);
    if (findDragonAtPosition(result, pos)) {
      const tile = result.tiles[pos.y][pos.x];
      dragonCaughtRef.current = tile.challengeType || 'noteReading';
    }
    return result;
  }
```

Replace with:

```ts
  /** Run moveEnemies and flag if any enemy lands on the player tile. */
  function moveEnemiesAndDetectCatch(
    f: DungeonFloor,
    pos: Position
  ): DungeonFloor {
    const result = moveEnemies(f, pos);
    const caught = findCatchingEnemyAtPosition(result, pos);
    if (caught) {
      enemyCaughtRef.current = {
        challengeType: caught.challengeType || 'noteReading',
        subtype: caught.enemySubtype || 'ghost',
        level: caught.enemyLevel || 1,
      };
    }
    return result;
  }
```

**Step 4: Update the catch effect**

Find (lines 196–220):

```ts
  // Detect Dragon catch after state settles
  useEffect(() => {
    if (!dragonCaughtRef.current || phase !== 'playing') return;
    const challengeType = dragonCaughtRef.current;
    dragonCaughtRef.current = false;

    // Apply 1 heart penalty
    setPlayer((prev) => {
      const newHealth = Math.max(0, prev.health - 1);
      if (newHealth <= 0) {
        setPhase('gameOver');
        return { ...prev, health: 0 };
      }

      moveLockedRef.current = true;
      setActiveChallenge({ type: challengeType, tilePosition: prev.position });
      setActiveTileType(TileType.Enemy);
      setActiveTileSubtype('dragon');
      setActiveTileLevel(3);
      activeChallengeBuffsRef.current = { metronome: prev.buffs.armed.metronome > 0, tuningFork: prev.buffs.armed.tuningFork > 0 };
      setPhase('challenge');

      return { ...prev, health: newHealth };
    });
  }, [floor, phase]);
```

Replace with:

```ts
  // Detect enemy catch after state settles
  useEffect(() => {
    if (!enemyCaughtRef.current || phase !== 'playing') return;
    const { challengeType, subtype, level } = enemyCaughtRef.current;
    enemyCaughtRef.current = false;

    setPlayer((prev) => {
      // Dragons deal 1 HP on catch; other enemies go straight to challenge
      const newHealth = subtype === 'dragon' ? Math.max(0, prev.health - 1) : prev.health;
      if (newHealth <= 0) {
        setPhase('gameOver');
        return { ...prev, health: 0 };
      }

      moveLockedRef.current = true;
      setActiveChallenge({ type: challengeType, tilePosition: prev.position });
      setActiveTileType(TileType.Enemy);
      setActiveTileSubtype(subtype);
      setActiveTileLevel(level);
      activeChallengeBuffsRef.current = { metronome: prev.buffs.armed.metronome > 0, tuningFork: prev.buffs.armed.tuningFork > 0 };
      setPhase('challenge');

      return { ...prev, health: newHealth };
    });
  }, [floor, phase]);
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p client/tsconfig.json
```

Expected: no errors.

**Step 6: Run all tests**

```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts client/src/test/merchant-items.test.ts
```

Expected: all tests pass.

**Step 7: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: generalize enemy catch detection to trigger challenge for goblin and skeleton bumps"
```
