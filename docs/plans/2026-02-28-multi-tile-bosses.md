# Multi-Tile Boss Footprints Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mini-boss enemies occupy a 2×2 tile footprint; big-boss enemies occupy a 3×3 tile footprint, each rendered as one large sprite spanning the full footprint.

**Architecture:** Add `TileType.BossBody` as a spatial placeholder tile. The top-left (anchor) tile of each boss stores `MiniBoss`/`BigBoss` type with cleared state; surrounding tiles get `BossBody`. Movement into any boss tile is blocked; encountering any boss tile triggers the encounter via the anchor. On defeat, all footprint tiles clear. The boss sprite is an absolutely-positioned percentage-sized overlay on the grid container, sized relative to the 7-tile viewport.

**Tech Stack:** TypeScript, React, Vitest (test runner: `npm test` from project root)

---

### Task 1: Add `BossBody` tile type

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts:1-14`

**Step 1: Add the new tile type enum value**

In `dungeonTypes.ts`, add `BossBody` after `BigBoss`:

```ts
export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Merchant = 'merchant',
  MerchantStall = 'merchantStall',
  MiniBoss = 'miniBoss',
  BigBoss = 'bigBoss',
  BossBody = 'bossBody',
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -20`
Expected: No type errors related to TileType.

**Step 3: Commit**

```bash
git add client/src/lib/gameLogic/dungeonTypes.ts
git commit -m "feat: add TileType.BossBody for multi-tile boss footprints"
```

---

### Task 2: Stamp boss footprint in the dungeon generator

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:376-384` (boss placement block)
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:385-387` (placedPositions init)
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Step 1: Write the failing tests**

In the `describe('boss floor generation', ...)` block (around line 383), add new tests and **update the failing BigBoss position assertion**:

```ts
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
  }
});

it('non-boss floors have no BossBody tiles', () => {
  for (const floorNum of [1, 3, 4, 6, 7, 8, 9]) {
    const floor = generateDungeon(floorNum);
    expect(findTiles(floor, TileType.BossBody).length).toBe(0);
  }
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --reporter=verbose 2>&1 | grep -E "FAIL|BossBody|footprint"`
Expected: New footprint tests fail; updated BigBoss test passes.

**Step 3: Implement boss footprint stamping**

Replace the boss placement block in `generateDungeon` (currently lines 376–383):

```ts
// Current:
if (bossType) {
  const bossTileType = bossType === 'big' ? TileType.BigBoss : TileType.MiniBoss;
  grid[stairsPosition.y][stairsPosition.x].type = bossTileType;
  grid[stairsPosition.y][stairsPosition.x].cleared = false;
} else {
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;
}

// Replace with:
if (bossType) {
  const bossTileType = bossType === 'big' ? TileType.BigBoss : TileType.MiniBoss;
  const bossSize = bossType === 'big' ? 3 : 2;
  // Center the footprint on stairsPosition: BigBoss offsets anchor by (-1,-1), MiniBoss uses stairsPosition as anchor
  const anchorOffset = bossType === 'big' ? 1 : 0;
  const ax = stairsPosition.x - anchorOffset;
  const ay = stairsPosition.y - anchorOffset;
  for (let dy = 0; dy < bossSize; dy++) {
    for (let dx = 0; dx < bossSize; dx++) {
      const tx = ax + dx;
      const ty = ay + dy;
      if (ty >= 0 && ty < height && tx >= 0 && tx < width) {
        const isAnchor = dx === 0 && dy === 0;
        grid[ty][tx].type = isAnchor ? bossTileType : TileType.BossBody;
        if (isAnchor) grid[ty][tx].cleared = false;
      }
    }
  }
} else {
  grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;
}
```

Also update the `placedPositions` initialisation (currently `const placedPositions = [playerStart, stairsPosition]` around line 385):

```ts
// Replace with:
const placedPositions: Position[] = [playerStart, stairsPosition];
if (bossType) {
  const bossSize = bossType === 'big' ? 3 : 2;
  const anchorOffset = bossType === 'big' ? 1 : 0;
  for (let dy = 0; dy < bossSize; dy++) {
    for (let dx = 0; dx < bossSize; dx++) {
      const tx = stairsPosition.x - anchorOffset + dx;
      const ty = stairsPosition.y - anchorOffset + dy;
      if (tx !== stairsPosition.x || ty !== stairsPosition.y) {
        placedPositions.push({ x: tx, y: ty });
      }
    }
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --reporter=verbose 2>&1 | grep -E "PASS|FAIL|BossBody|footprint|boss floor"`
Expected: All boss floor generation tests pass.

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts \
        client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: stamp 2x2 miniboss and 3x3 bigboss footprints in dungeon generator"
```

---

### Task 3: Block movement into BossBody tiles

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx:280`

**Step 1: Find the wall-blocking line**

In `handleMove`, there's a single wall check:
```ts
if (tile.type === TileType.Wall) return prev;
```
This is around line 280. Add BossBody alongside it:

```ts
if (tile.type === TileType.Wall || tile.type === TileType.BossBody) return prev;
```

Wait — BossBody blocks MOVEMENT but should still trigger the encounter. See Task 4 for the encounter trigger. This `return prev` is for the case where the player bumps into a body tile with NO encounter (e.g., the boss is already cleared). After the boss is cleared, BossBody tiles become Floor. So if we see BossBody here, the boss is always uncleared — safe to `return prev` here and handle the encounter via a dedicated check above this line.

Actually, the BossBody encounter trigger (Task 4) must be placed BEFORE this blocking line. The order in the handler will be:
1. BossBody encounter check (Task 4) — comes first
2. Wall/BossBody block — falls through to here only if BossBody check already returned

So leave this as:
```ts
if (tile.type === TileType.Wall) return prev;
```
…and Task 4 places the BossBody check above it. Do NOT add BossBody here; Task 4 handles it.

**Step 1 (revised): No change to wall blocking needed — skip to commit.**

This task is actually done as part of Task 4's ordering. Mark it complete as a no-op and move on.

---

### Task 4: Trigger boss encounter from any boss tile; keep player outside footprint

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx` (handleMove callback)

**Step 1: Understand the current encounter trigger (no code change yet)**

Currently, around line 333–350:
```ts
if (
  !tile.cleared &&
  (tile.type === TileType.Enemy ||
    tile.type === TileType.Treasure ||
    tile.type === TileType.MiniBoss ||
    tile.type === TileType.BigBoss)
) {
  // ...
  return { ...prev, position: newPos }; // player moves to boss tile
}
```

**Step 2: Add a helper function above the component (or inside it as a local const)**

Add this helper before the `handleMove` callback definition (or at module scope above the component — either works):

```ts
/** Finds the boss anchor tile (MiniBoss or BigBoss) in the floor. Returns null if none exists. */
function findBossAnchor(
  tiles: Tile[][],
): { pos: Position; type: TileType.MiniBoss | TileType.BigBoss } | null {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const t = tiles[y][x];
      if (t.type === TileType.MiniBoss) return { pos: { x, y }, type: TileType.MiniBoss };
      if (t.type === TileType.BigBoss) return { pos: { x, y }, type: TileType.BigBoss };
    }
  }
  return null;
}
```

Make sure to import `Tile` and `Position` types if they aren't already imported in MelodyDungeonGame.tsx (they likely already are).

**Step 3: Replace the boss encounter block inside handleMove**

In `handleMove`, split the combined enemy/treasure/boss check into two parts.

**Before (single combined block):**
```ts
if (
  !tile.cleared &&
  (tile.type === TileType.Enemy ||
    tile.type === TileType.Treasure ||
    tile.type === TileType.MiniBoss ||
    tile.type === TileType.BigBoss)
) {
  setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
  moveLockedRef.current = true;
  const challengeType: ChallengeType = tile.challengeType || 'noteReading';
  setActiveChallenge({ type: challengeType, tilePosition: newPos });
  setActiveTileType(tile.type);
  setActiveTileSubtype(tile.enemySubtype);
  setActiveTileLevel(tile.enemyLevel ?? 1);
  activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
  setPhase('challenge');
  return { ...prev, position: newPos };
}
```

**After (split into three checks — in this exact order):**

```ts
// Boss body: find anchor, stay outside footprint, trigger encounter
if (tile.type === TileType.BossBody) {
  const bossAnchor = findBossAnchor(floor.tiles);
  if (!bossAnchor) return prev;
  const anchorTile = floor.tiles[bossAnchor.pos.y][bossAnchor.pos.x];
  if (anchorTile.cleared) return prev;
  setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
  moveLockedRef.current = true;
  const challengeType: ChallengeType = anchorTile.challengeType || 'noteReading';
  setActiveChallenge({ type: challengeType, tilePosition: bossAnchor.pos });
  setActiveTileType(bossAnchor.type);
  setActiveTileSubtype(anchorTile.enemySubtype);
  setActiveTileLevel(anchorTile.enemyLevel ?? 1);
  activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
  setPhase('challenge');
  return prev; // player stays outside the footprint
}

// Boss anchor: stay outside footprint, trigger encounter
if (!tile.cleared && (tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss)) {
  setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
  moveLockedRef.current = true;
  const challengeType: ChallengeType = tile.challengeType || 'noteReading';
  setActiveChallenge({ type: challengeType, tilePosition: newPos });
  setActiveTileType(tile.type);
  setActiveTileSubtype(tile.enemySubtype);
  setActiveTileLevel(tile.enemyLevel ?? 1);
  activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
  setPhase('challenge');
  return prev; // player stays outside the footprint
}

// Encounter uncleared interactive tile (enemy, treasure)
if (
  !tile.cleared &&
  (tile.type === TileType.Enemy || tile.type === TileType.Treasure)
) {
  setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
  moveLockedRef.current = true;
  const challengeType: ChallengeType = tile.challengeType || 'noteReading';
  setActiveChallenge({ type: challengeType, tilePosition: newPos });
  setActiveTileType(tile.type);
  setActiveTileSubtype(tile.enemySubtype);
  setActiveTileLevel(tile.enemyLevel ?? 1);
  activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
  setPhase('challenge');
  return { ...prev, position: newPos };
}
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`
Expected: No errors. (Tests for this are integration-level; manual testing is needed.)

**Step 5: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: trigger boss encounter from any boss tile; player stays outside footprint"
```

---

### Task 5: Clear all BossBody tiles on boss defeat

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx` (handleChallengeResult, tile-clearing setFloor block)

**Step 1: Find the tile-clearing block in handleChallengeResult**

Around line 548–565, there is:
```ts
setFloor((prev) => {
  const { x, y } = activeChallenge.tilePosition;
  const tiles = prev.tiles.map((row, ry) =>
    row.map((tile, rx) => {
      if (rx === x && ry === y) {
        if (tile.type === TileType.Door) {
          return { ...tile, cleared: correct, type: correct ? TileType.Floor : TileType.Door };
        }
        if (tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss) {
          return { ...tile, cleared: true, type: correct ? TileType.Stairs : tile.type };
        }
        return { ...tile, cleared: true, type: correct ? TileType.Floor : tile.type };
      }
      return tile;
    })
  );
  return { ...prev, tiles };
});
```

**Step 2: Add BossBody clearing alongside the boss anchor clear**

```ts
// Replace the map callback with:
setFloor((prev) => {
  const { x, y } = activeChallenge.tilePosition;
  const isBossVictory =
    correct &&
    (activeTileType === TileType.MiniBoss || activeTileType === TileType.BigBoss);
  const tiles = prev.tiles.map((row, ry) =>
    row.map((tile, rx) => {
      if (rx === x && ry === y) {
        if (tile.type === TileType.Door) {
          return { ...tile, cleared: correct, type: correct ? TileType.Floor : TileType.Door };
        }
        if (tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss) {
          return { ...tile, cleared: true, type: correct ? TileType.Stairs : tile.type };
        }
        return { ...tile, cleared: true, type: correct ? TileType.Floor : tile.type };
      }
      // On boss victory, clear all BossBody tiles (there is only one boss per floor)
      if (isBossVictory && tile.type === TileType.BossBody) {
        return { ...tile, type: TileType.Floor };
      }
      return tile;
    })
  );
  return { ...prev, tiles };
});
```

Note: `activeTileType` is captured from the outer component scope (it's a `useState` variable, same as the existing code references it at line 400).

**Step 3: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -20`
Expected: No errors.

**Step 4: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: clear all BossBody tiles when boss is defeated"
```

---

### Task 6: Render multi-tile boss sprite as an absolute overlay

**Files:**
- Modify: `client/src/components/melody-dungeon/DungeonGrid.tsx`

**Step 1: Understand the current grid structure**

The grid container is a `<div>` with `className="grid..."`. The tile loop produces a flat list of `<div>` children (one per cell). Boss anchor tiles (MiniBoss/BigBoss) currently render a small per-tile sprite via `TILE_SPRITE`. BossBody tiles aren't in `TILE_SPRITE`, so they render no sprite (just floor background).

The plan:
1. Add `position: 'relative'` to the grid container.
2. Suppress the per-tile sprite for MiniBoss/BigBoss anchor tiles (the overlay replaces it).
3. Make BossBody tiles render as floor-like (so they look like floor under the boss sprite).
4. After the tile loop, render one absolutely-positioned `<img>` per visible, uncleared boss anchor tile.

**Step 2: Make `isFloorLike` include BossBody**

Find the `isFloorLike` definition (around line 90):
```ts
const isFloorLike =
  !isWall &&
  (cleared ||
    tile.type === TileType.Floor ||
    tile.type === TileType.PlayerStart);
```

Replace with:
```ts
const isFloorLike =
  !isWall &&
  (cleared ||
    tile.type === TileType.Floor ||
    tile.type === TileType.PlayerStart ||
    tile.type === TileType.BossBody);
```

**Step 3: Suppress per-tile boss anchor sprite**

Find the `spriteSrc` definition (around line 111):
```ts
const spriteSrc =
  showContent &&
  !isPlayer &&
  !cleared &&
  (tile.type === TileType.Enemy
    ? ENEMY_SPRITE[tile.enemySubtype ?? 'dragon']
    : TILE_SPRITE[tile.type]);
```

Replace with (add boss anchor exclusion):
```ts
const isBossAnchor =
  tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss;
const spriteSrc =
  showContent &&
  !isPlayer &&
  !cleared &&
  !isBossAnchor &&
  (tile.type === TileType.Enemy
    ? ENEMY_SPRITE[tile.enemySubtype ?? 'dragon']
    : TILE_SPRITE[tile.type]);
```

**Step 4: Add `position: 'relative'` to the grid container**

Find the grid container `<div>` style (around line 66):
```tsx
style={{
  gridTemplateColumns: `repeat(${viewWidth}, 1fr)`,
  width: '100%',
  maxWidth: 'min(90vw, calc(100vh - 60px))',
  aspectRatio: '1 / 1',
  backgroundColor: theme.containerBg,
  borderWidth: '1px',
  borderColor: theme.border,
  borderStyle: 'solid',
}}
```

Add `position: 'relative'`:
```tsx
style={{
  gridTemplateColumns: `repeat(${viewWidth}, 1fr)`,
  width: '100%',
  maxWidth: 'min(90vw, calc(100vh - 60px))',
  aspectRatio: '1 / 1',
  backgroundColor: theme.containerBg,
  borderWidth: '1px',
  borderColor: theme.border,
  borderStyle: 'solid',
  position: 'relative',
}}
```

**Step 5: Add boss sprite overlay after the tile loop**

After the closing `})}` of the tile loop (around line 181, just before `</div>`), add:

```tsx
{/* Multi-tile boss sprite overlays — rendered on top of the tile grid */}
{floor.tiles.slice(startY, endY).flatMap((row, rowIndex) => {
  const y = startY + rowIndex;
  return row.slice(startX, endX).flatMap((tile, colIndex) => {
    const x = startX + colIndex;
    if (tile.type !== TileType.MiniBoss && tile.type !== TileType.BigBoss) return [];
    if (tile.cleared) return [];

    const vis = getTileVisibility(x, y, playerPosition.x, playerPosition.y, tile.visited);
    if (vis === 'dark') return [];

    const vx = x - startX; // position in viewport grid (0-based)
    const vy = y - startY;
    const bossSize = tile.type === TileType.BigBoss ? 3 : 2;
    const spriteSrc = TILE_SPRITE[tile.type];
    if (!spriteSrc) return [];

    const dist = Math.max(Math.abs(x - playerPosition.x), Math.abs(y - playerPosition.y));
    const fogOpacity = getFogOverlayOpacity(vis, dist);

    return [
      <div
        key={`boss-overlay-${x}-${y}`}
        className="absolute pointer-events-none"
        style={{
          left: `${(vx / viewWidth) * 100}%`,
          top: `${(vy / viewWidth) * 100}%`,
          width: `${(bossSize / viewWidth) * 100}%`,
          height: `${(bossSize / viewWidth) * 100}%`,
          zIndex: 15,
        }}
      >
        <img
          src={spriteSrc}
          alt={tile.type}
          className="w-full h-full object-contain animate-sprite-float"
          style={{ animationDelay: `${((x * 7 + y * 13) % 10) * 0.24}s` }}
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{ opacity: fogOpacity, backgroundColor: theme.fog }}
        />
      </div>,
    ];
  });
})}
```

Note: `viewWidth` is already defined in the component (`const viewWidth = endX - startX`). The overlay uses percentage units relative to the grid container (which has `aspectRatio: 1/1`), making the sizing screen-size-independent.

**Step 6: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -20`
Expected: No errors.

**Step 7: Run all tests**

Run: `npm test`
Expected: All tests pass.

**Step 8: Commit**

```bash
git add client/src/components/melody-dungeon/DungeonGrid.tsx
git commit -m "feat: render multi-tile boss sprite as absolute overlay spanning 2x2 or 3x3 tiles"
```

---

### Task 7: Smoke test and final verification

**Step 1: Run all tests one final time**

Run: `npm test`
Expected: All tests pass.

**Step 2: Manual verification checklist**

Start the dev server (`npm run dev`) and navigate to Melody Dungeon.

- [ ] Floor 5: Boss arena has a MiniBoss sprite spanning 2×2 tiles.
- [ ] Floor 10: Boss arena has a BigBoss sprite spanning 3×3 tiles.
- [ ] Player cannot walk into any boss tile before the challenge.
- [ ] Walking into any tile of the boss footprint (anchor or body) opens the ChallengeModal.
- [ ] Defeating the boss clears all boss tiles and shows floorComplete.
- [ ] Non-boss floors have no BossBody tiles visible.
- [ ] Fog overlays apply correctly on the boss sprite overlay.

**Step 3: Final commit if any fixes were made**

```bash
git add -p
git commit -m "fix: address smoke test issues with multi-tile bosses"
```
