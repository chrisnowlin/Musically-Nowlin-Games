# Ghost Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the ghost from a generic wildcard enemy into "The Phantom" — a wall-phasing, flickering trickster with hidden challenge types and a challenge-swap mechanic.

**Architecture:** Six sequential tasks modify the existing Melody Dungeon systems: types, generator (movement/spawning), grid rendering, challenge modal, game logic (rewards/materialization), and dev room updates. Each task adds one layer of the ghost identity, tested before moving to the next.

**Tech Stack:** React 18, TypeScript 5.6, Vitest, Tailwind CSS 4

**Design doc:** `docs/plans/2026-03-02-ghost-redesign-design.md`

---

### Task 1: Add Ghost Tile Fields to Type System

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts:24-33`
- Test: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`

**Step 1: Write the failing test**

Add a test to `dungeonGenerator.test.ts` that verifies ghost enemies spawn with `ghostVisible` initialized:

```typescript
it('ghost enemies spawn with ghostVisible set to true', () => {
  // Run many times to guarantee at least one ghost spawns
  for (let run = 0; run < 20; run++) {
    const floor = generateDungeon(1);
    const ghosts = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype === 'ghost'
    );
    for (const g of ghosts) {
      expect(g.ghostVisible).toBe(true);
    }
  }
});
```

**Step 2: Run test to verify it fails**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — `ghostVisible` is undefined on ghost tiles.

**Step 3: Add new fields to the Tile interface**

In `client/src/games/melody-dungeon/logic/dungeonTypes.ts`, add two optional fields to the `Tile` interface (after the existing `enemyLevel` field at line 32):

```typescript
export interface Tile {
  type: TileType;
  visible: boolean;
  visited: boolean;
  challengeType?: ChallengeType;
  cleared?: boolean;
  enemyState?: EnemyState;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
  ghostVisible?: boolean;
  ghostNearPlayerTurns?: number;
}
```

**Step 4: Initialize ghost fields during spawn**

In `client/src/games/melody-dungeon/logic/dungeonGenerator.ts`, in the regular enemy placement loop (around line 506-520), after setting `enemyState: 'patrolling'` on line 517, add ghost field initialization:

```typescript
if (subtype === 'ghost') {
  grid[pos.y][pos.x].ghostVisible = true;
  grid[pos.y][pos.x].ghostNearPlayerTurns = 0;
}
```

**Step 5: Run test to verify it passes**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/logic/dungeonGenerator.ts client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "feat(melody-dungeon): add ghostVisible and ghostNearPlayerTurns tile fields"
```

---

### Task 2: Ghost Wall-Phasing Movement

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:805-858` (the patrolling movement block inside `moveEnemies`)
- Test: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`

**Step 1: Write failing tests**

Add two tests to the `moveEnemies` describe block in `dungeonGenerator.test.ts`:

```typescript
it('patrolling Ghost can phase through a wall to reach floor on the other side', () => {
  // 5x1 corridor: [player] [wall] [ghost] [wall] [floor]
  // Ghost's only non-wall neighbor is its current position or through the wall.
  // With wall-phasing, ghost should be able to move to x=4 through the wall at x=3.
  const floor = createTestFloor(5, 1, (tiles) => {
    tiles[0][0] = { type: TileType.Floor, visible: false, visited: false }; // player pos
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
  // Run multiple times — ghost should sometimes reach x=4 by phasing through wall at x=3
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

it('patrolling Ghost does NOT stop on a wall tile (phases through, not into)', () => {
  // 3x1: [player] [wall] [ghost]
  // Ghost cannot go left (wall destination is player tile, blocked for ghosts).
  // Ghost cannot stop on wall. Ghost stays in place.
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
    // Ghost should never end up on the wall tile
    expect(result.tiles[0][1].type).toBe(TileType.Wall);
    // Ghost should stay at x=2 (no valid destination exists)
    expect(result.tiles[0][2].type).toBe(TileType.Enemy);
  }
});
```

**Step 2: Run tests to verify they fail**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: First test FAILS (ghost can't reach x=4 through wall). Second test may pass trivially.

**Step 3: Implement wall-phasing in moveEnemies**

In the patrolling movement block of `moveEnemies()` (lines 805-858 in `dungeonGenerator.ts`), modify the ghost's movement logic. Currently on line 820-821, the ghost check is:

```typescript
if (isPlayerTile && tile.enemySubtype === 'ghost') continue;
if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
```

Replace these two lines with ghost wall-phasing logic:

```typescript
if (isPlayerTile && tile.enemySubtype === 'ghost') continue;
if (tile.enemySubtype === 'ghost') {
  // Ghost phases through walls: skip wall check on the immediate neighbor,
  // but the DESTINATION must be a walkable tile (floor/door/playerStart).
  // If the neighbor is a wall, look one tile further in the same direction
  // for a floor tile to land on.
  if (target.type === TileType.Wall) {
    const beyondX = nx + d.x;
    const beyondY = ny + d.y;
    if (beyondX < 0 || beyondX >= floor.width || beyondY < 0 || beyondY >= floor.height) continue;
    const beyondTile = tiles[beyondY][beyondX];
    const isBeyondPlayer = beyondX === playerPos.x && beyondY === playerPos.y;
    if (isBeyondPlayer) continue; // ghost still can't land on player
    if (beyondTile.type !== TileType.Floor && beyondTile.type !== TileType.PlayerStart) continue;
    const beyondKey = `${beyondX},${beyondY}`;
    if (occupied.has(beyondKey)) continue;

    // Phase through wall: move to the tile beyond
    tiles[beyondY][beyondX] = {
      ...beyondTile,
      type: tile.type,
      enemySubtype: tile.enemySubtype,
      enemyLevel: tile.enemyLevel,
      challengeType: tile.challengeType,
      cleared: false,
      enemyState: tile.enemyState,
      ghostVisible: tile.ghostVisible,
      ghostNearPlayerTurns: tile.ghostNearPlayerTurns,
    };
    tiles[pos.y][pos.x] = {
      ...tiles[pos.y][pos.x],
      type: TileType.Floor,
      enemySubtype: undefined,
      enemyLevel: undefined,
      challengeType: undefined,
      cleared: undefined,
      enemyState: undefined,
      ghostVisible: undefined,
      ghostNearPlayerTurns: undefined,
    };
    occupied.delete(`${pos.x},${pos.y}`);
    occupied.add(beyondKey);
    moved = true;
    break;
  }
  // Non-wall neighbor for ghost: normal floor check
  if (target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
} else {
  if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
}
```

Also ensure ghost fields are preserved during normal (non-wall-phasing) movement. In the "Execute move" block (lines 835-852), after setting `enemyState`, add:

```typescript
ghostVisible: tile.ghostVisible,
ghostNearPlayerTurns: tile.ghostNearPlayerTurns,
```

And in the old-tile cleanup, add:

```typescript
ghostVisible: undefined,
ghostNearPlayerTurns: undefined,
```

**Step 4: Run tests to verify they pass**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "feat(melody-dungeon): ghost wall-phasing movement in moveEnemies"
```

---

### Task 3: Ghost Visibility Flickering & Materialization in moveEnemies

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:695-867`
- Test: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`

**Step 1: Write failing tests**

Add tests to the `moveEnemies` describe block:

```typescript
it('ghost visibility can toggle after moveEnemies (30% flip chance)', () => {
  // Create a ghost that starts visible. Over many runs, at least one should flip.
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
    // Find ghost in result
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
  // Ghost invisible, within VISIBILITY_RADIUS (3) of player
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
      ghostNearPlayerTurns: 0,
    };
  });
  // Mock Math.random to prevent visibility flip (needs to be > 0.3 to stay invisible)
  const origRandom = Math.random;
  Math.random = () => 0.5; // > 0.3, so ghost stays invisible; also controls movement direction
  try {
    const result = moveEnemies(floor, { x: 0, y: 0 });
    // Find ghost
    for (let y = 0; y < 1; y++) {
      for (let x = 0; x < 7; x++) {
        if (result.tiles[y][x].type === TileType.Enemy && result.tiles[y][x].enemySubtype === 'ghost') {
          expect(result.tiles[y][x].ghostNearPlayerTurns).toBeGreaterThanOrEqual(1);
        }
      }
    }
  } finally {
    Math.random = origRandom;
  }
});
```

**Step 2: Run tests to verify they fail**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — ghostVisible never changes, ghostNearPlayerTurns stays 0.

**Step 3: Implement visibility flickering and materialization counter**

In `moveEnemies()`, after the movement loop completes (after line 863), add a ghost-specific post-move pass. Add this before the return statement at line 866:

```typescript
// Ghost visibility flickering and materialization counter
for (const enemy of enemies) {
  // Find the ghost's current position (it may have moved)
  let ghostTile: Tile | null = null;
  let ghostPos: Position | null = null;
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const t = tiles[y][x];
      if (
        t.type === TileType.Enemy &&
        t.enemySubtype === 'ghost' &&
        !t.cleared &&
        t.challengeType === enemy.tile.challengeType &&
        t.enemyLevel === enemy.tile.enemyLevel
      ) {
        ghostTile = t;
        ghostPos = { x, y };
      }
    }
  }
  if (!ghostTile || !ghostPos || ghostTile.enemySubtype !== 'ghost') continue;

  // 30% chance to flip visibility
  if (Math.random() < 0.3) {
    ghostTile.ghostVisible = !ghostTile.ghostVisible;
  }

  // Materialization counter: increment when invisible and near player
  const distToPlayer = Math.max(
    Math.abs(ghostPos.x - playerPos.x),
    Math.abs(ghostPos.y - playerPos.y)
  );
  if (!ghostTile.ghostVisible && distToPlayer <= 3) {
    ghostTile.ghostNearPlayerTurns = (ghostTile.ghostNearPlayerTurns ?? 0) + 1;
    // Materialize after 3 turns near player
    if (ghostTile.ghostNearPlayerTurns >= 3) {
      ghostTile.ghostVisible = true;
      ghostTile.ghostNearPlayerTurns = 0;
    }
  } else {
    ghostTile.ghostNearPlayerTurns = 0;
  }
}
```

Note: The above approach iterates enemies again, which is simple but has a matching problem for multiple ghosts. A cleaner approach: instead of re-searching, track ghost positions during the main movement loop. Refactor by storing the final position in the enemy array entry during movement, then use that. For now, the simpler approach works since there are at most 6 enemies per floor.

**Step 4: Run tests to verify they pass**

Run: `bun test client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: PASS

**Step 5: Run full test suite**

Run: `bun test`
Expected: All existing tests still pass.

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "feat(melody-dungeon): ghost visibility flickering and materialization counter"
```

---

### Task 4: Ghost Modal Theme and Challenge Swap in ChallengeModal

**Files:**
- Modify: `client/src/games/melody-dungeon/ChallengeModal.tsx:121-144` (getEnemyTheme) and BossBattle component
- Test: `client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx`

**Step 1: Read and understand existing ChallengeModal tests**

Read `client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx` to understand test patterns.

**Step 2: Write failing tests**

Add tests to `ChallengeModal.test.tsx`:

```typescript
it('renders "Ghost Encounter!" title for ghost enemy', () => {
  render(
    <ChallengeModal
      challengeType="noteReading"
      tileType={TileType.Enemy}
      floorNumber={1}
      onResult={() => {}}
      enemySubtype="ghost"
      enemyLevel={1}
    />
  );
  expect(screen.getByText('Ghost Encounter!')).toBeInTheDocument();
});
```

**Step 3: Run test to verify it fails**

Run: `bun test client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx`
Expected: FAIL — renders "Enemy Encounter!" instead of "Ghost Encounter!"

**Step 4: Add ghost theme to getEnemyTheme**

In `ChallengeModal.tsx`, add a `case 'ghost'` to the `getEnemyTheme` switch (line 122), before the `default`:

```typescript
case 'ghost':
  return { title: 'Ghost Encounter!', borderColor: 'border-cyan-500', bgColor: 'from-cyan-950/90 to-gray-900/95' };
```

**Step 5: Run test to verify it passes**

Run: `bun test client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx`
Expected: PASS

**Step 6: Implement challenge swap for ghost encounters**

This is the trickiest part. In the `BossBattle` component, add ghost-specific challenge swap logic. When `enemySubtype === 'ghost'` and the player gets a wrong answer, instead of dealing damage, swap the challenge type and restart the round. This only happens once per round.

In the `BossBattle` component (starting around line 172), add state for tracking the swap:

```typescript
const [ghostSwapUsed, setGhostSwapUsed] = useState(false);
```

Reset `ghostSwapUsed` in `proceedToNextRound`:

```typescript
const proceedToNextRound = useCallback(() => {
  setCurrentRound((r) => r + 1);
  setLastResult(null);
  setLastShieldBlocked(false);
  setShowItemPhase(false);
  setRoundTransition(false);
  setGhostSwapUsed(false); // Reset swap for new round
}, []);
```

In `handleRoundResult`, before the `else` (wrong answer) branch, add the ghost swap check:

```typescript
if (!correct) {
  // Ghost challenge swap: first wrong answer swaps challenge type instead of dealing damage
  if (enemySubtype === 'ghost' && !ghostSwapUsed) {
    setGhostSwapUsed(true);
    setCurrentRound((r) => r + 1); // Force re-roll of challenge type
    setLastResult(null);
    setRoundTransition(false);
    return; // No damage, no shield consumption
  }
  // ... existing wrong-answer logic
}
```

For single-round ghost encounters (level 1), add the same swap logic in the `ChallengeModal` component's non-multi-round path. Pass a new `ghostSwap` prop or handle it via a wrapper. The simplest approach: add a `ghostSwapped` state to ChallengeModal, and when `enemySubtype === 'ghost'` and the single-round challenge reports wrong, re-render with a new challenge type instead of calling `onResult(false)`:

In the `ChallengeModal` component (around line 405):

```typescript
const [ghostSwapped, setGhostSwapped] = useState(false);
const [swappedChallengeType, setSwappedChallengeType] = useState<ChallengeType | null>(null);

const effectiveChallengeType = swappedChallengeType ?? challengeType;
```

In the single-round path, replace the direct `onResult` with a wrapper:

```typescript
const handleSingleRoundResult = useCallback((correct: boolean) => {
  if (!correct && enemySubtype === 'ghost' && !ghostSwapped) {
    // Swap challenge type
    setGhostSwapped(true);
    const floorTypes = getChallengeTypesForFloor(floorNumber);
    const alternatives = floorTypes.filter(t => t !== effectiveChallengeType);
    const newType = alternatives[Math.floor(Math.random() * alternatives.length)] ?? effectiveChallengeType;
    setSwappedChallengeType(newType);
    return; // Don't report result yet
  }
  onResult(correct);
}, [enemySubtype, ghostSwapped, effectiveChallengeType, floorNumber, onResult]);
```

Then use `effectiveChallengeType` and `handleSingleRoundResult` in the single-round ChallengeRenderer.

**Step 7: Run tests**

Run: `bun test client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx`
Expected: PASS

**Step 8: Commit**

```bash
git add client/src/games/melody-dungeon/ChallengeModal.tsx client/src/games/melody-dungeon/__tests__/ChallengeModal.test.tsx
git commit -m "feat(melody-dungeon): ghost encounter theme and challenge swap mechanic"
```

---

### Task 5: Ghost Rendering in DungeonGrid (Shimmer + Hidden Challenge)

**Files:**
- Modify: `client/src/games/melody-dungeon/DungeonGrid.tsx:130-184`

**Step 1: Add shimmer effect for invisible ghosts**

In `DungeonGrid.tsx`, modify the sprite rendering logic (around line 132-139) to handle ghost visibility:

Currently:
```typescript
const spriteSrc =
  showContent &&
  !isPlayer &&
  !cleared &&
  !isBossAnchor &&
  (tile.type === TileType.Enemy
    ? ENEMY_SPRITE[tile.enemySubtype ?? 'dragon']
    : TILE_SPRITE[tile.type]);
```

Replace with:
```typescript
const isInvisibleGhost = tile.type === TileType.Enemy &&
  tile.enemySubtype === 'ghost' &&
  tile.ghostVisible === false &&
  !cleared;
const spriteSrc =
  showContent &&
  !isPlayer &&
  !cleared &&
  !isBossAnchor &&
  !isInvisibleGhost &&
  (tile.type === TileType.Enemy
    ? ENEMY_SPRITE[tile.enemySubtype ?? 'dragon']
    : TILE_SPRITE[tile.type]);
```

Then, after the sprite `<div>` (after line 183), add a shimmer effect for invisible ghosts within visibility radius:

```tsx
{showContent && isInvisibleGhost && (
  <div
    className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden p-[8%]"
  >
    <img
      src={ENEMY_SPRITE['ghost']}
      alt="shimmer"
      className="w-full h-full object-contain animate-pulse"
      style={{ opacity: 0.12, filter: 'brightness(2) blur(1px)' }}
      draggable={false}
    />
  </div>
)}
```

**Step 2: Verify visually**

Run the dev server: `bun run dev`
Navigate to Melody Dungeon, start a floor. Find a ghost and observe:
- When `ghostVisible` is true: normal ghost sprite with float animation
- When `ghostVisible` is false: faint shimmer pulse on the tile

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/DungeonGrid.tsx
git commit -m "feat(melody-dungeon): ghost shimmer effect for invisible state"
```

---

### Task 6: Ghost Rewards and Materialization Trigger in MelodyDungeonGame

**Files:**
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Add ghost-specific rewards**

In the `handleChallengeResult` callback, there are two places to add ghost reward logic:

**For boss (multi-round) path** — around the line that handles "Regular level 2-3 enemy" rewards (the `else` branch after `activeTileSubtype === 'dragon'`):

Find the block (around line 604-610):
```typescript
} else {
  // Regular level 2–3 enemy (ghost/skeleton/goblin)
  updated.health = battleHealth;
  const levelGold = activeTileLevel === 3 ? 150 : 100;
  updated.gold += levelGold + streakBonus;
  updated.keys += 1;
}
```

Replace with:
```typescript
} else if (activeTileSubtype === 'ghost') {
  // Ghost trickster: lower gold, +1 bonus streak
  updated.health = battleHealth;
  updated.gold += 50 + streakBonus;
  updated.keys += 1;
  updated.streak += 1; // +1 bonus on top of the +1 already applied above
} else {
  // Regular level 2–3 enemy (skeleton/goblin/etc.)
  updated.health = battleHealth;
  const levelGold = activeTileLevel === 3 ? 150 : 100;
  updated.gold += levelGold + streakBonus;
  updated.keys += 1;
}
```

**For single-round (non-boss) correct path** — around the line that handles non-boss correct answers (around line 645-666):

After `updated.streak += 1;`, add ghost-specific reward logic:

```typescript
if (activeTileType === TileType.Enemy && activeTileSubtype === 'ghost') {
  // Ghost trickster bonus: override base gold to 50, add +1 streak bonus
  const ghostGold = (prev.buffs.armed.luckyCoin > 0) ? 100 : 50;
  updated.gold = prev.gold + ghostGold + streakBonus; // Override the base gold calc
  updated.streak += 1; // +1 bonus streak
}
```

Wait — the base gold is already computed. Let's be more precise. The non-boss correct path computes `baseGold` at line 647:

```typescript
const baseGold = (activeTileType === TileType.Enemy && prev.buffs.armed.luckyCoin > 0) ? 100 : 50;
```

For ghosts, the base gold is already 50 (same as a non-Lucky-Coin enemy). So we just need to add the +1 bonus streak for ghost encounters. After `updated.streak += 1;`:

```typescript
// Ghost trickster: +1 bonus streak
if (activeTileType === TileType.Enemy && activeTileSubtype === 'ghost') {
  updated.streak += 1;
}
```

**Step 2: Add materialization encounter trigger**

In the `moveEnemiesAndDetectCatch` callback (around line 165-179), after `moveEnemies` returns the result, also check for materialized ghosts that are adjacent to the player. If a ghost just materialized (ghostVisible=true, ghostNearPlayerTurns=0 after reset) and is within Manhattan distance 1, force the encounter:

Actually, the simpler approach: the materialization is already handled in `moveEnemies` by setting `ghostVisible = true`. The encounter only triggers when an enemy lands on the player tile (via `findCatchingEnemyAtPosition`). Since ghosts can't step on the player, and materialization happens after movement, we need to add a secondary check after `moveEnemies` that detects a materialized ghost adjacent to the player and triggers the encounter.

In `MelodyDungeonGame.tsx`, modify `moveEnemiesAndDetectCatch` (around line 165-179):

```typescript
const moveEnemiesAndDetectCatch = useCallback(
  (f: DungeonFloor, pos: Position): DungeonFloor => {
    const result = moveEnemies(f, pos);
    const caught = findCatchingEnemyAtPosition(result, pos);
    if (caught) {
      enemyCaughtRef.current = {
        challengeType: caught.challengeType || 'noteReading',
        subtype: caught.enemySubtype || 'ghost',
        level: caught.enemyLevel || 1,
      };
    } else {
      // Check for materialized ghost adjacent to player (Manhattan distance 1)
      const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
      for (const d of dirs) {
        const nx = pos.x + d.x;
        const ny = pos.y + d.y;
        if (ny < 0 || ny >= result.height || nx < 0 || nx >= result.width) continue;
        const tile = result.tiles[ny][nx];
        if (
          tile.type === TileType.Enemy &&
          tile.enemySubtype === 'ghost' &&
          !tile.cleared &&
          tile.ghostVisible === true &&
          tile.ghostNearPlayerTurns === 0 // just materialized (counter was reset)
        ) {
          enemyCaughtRef.current = {
            challengeType: tile.challengeType || 'noteReading',
            subtype: 'ghost',
            level: tile.enemyLevel || 1,
          };
          break;
        }
      }
    }
    return result;
  },
  []
);
```

Note: `ghostNearPlayerTurns === 0` is used as the signal that the ghost just materialized (counter resets to 0 on materialization). However, this also matches newly spawned ghosts. To avoid false triggers on the very first turn, we need a more robust signal. Better approach: add a `ghostMaterialized` boolean flag to Tile that gets set to `true` in `moveEnemies` when materialization happens, and reset after the encounter triggers. Let's use that:

Add to `dungeonTypes.ts` Tile interface:
```typescript
ghostMaterialized?: boolean;
```

In `moveEnemies`, when the ghost materializes (the `ghostNearPlayerTurns >= 3` block), also set:
```typescript
ghostTile.ghostMaterialized = true;
```

In `moveEnemiesAndDetectCatch`, check for `ghostMaterialized === true` instead of the counter check. After triggering the encounter, clear the flag on the result tiles.

**Step 3: Run tests**

Run: `bun test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/MelodyDungeonGame.tsx client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat(melody-dungeon): ghost trickster rewards and materialization encounter trigger"
```

---

### Task 7: Update Dev Room and Run Full Verification

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:612-689` (generateDevRoom)

**Step 1: Initialize ghost fields in dev room**

In `generateDevRoom()`, the ghost entry at line 646 needs ghost fields initialized. Update the ghost enemy setup (around line 649-657 where `forEach` runs):

After line 656 (`grid[18][x].enemyState = 'guarding';`), add:

```typescript
if (subtype === 'ghost') {
  grid[18][x].ghostVisible = true;
  grid[18][x].ghostNearPlayerTurns = 0;
}
```

**Step 2: Run full test suite**

Run: `bun test`
Expected: All tests pass (existing + new ghost tests).

**Step 3: Manual verification in dev room**

Run: `bun run dev`
1. Open Melody Dungeon, enter dev room (password: `musicgames123`)
2. Walk to the ghost in the enemy row at y=18
3. Verify ghost renders with sprite
4. Walk into the ghost — should see "Ghost Encounter!" with cyan theme
5. Answer wrong on purpose — challenge should swap to a different type

**Step 4: Manual verification on regular floor**

1. Start a new game from floor 1
2. Play until you encounter a ghost
3. Observe: ghost may flicker invisible (shimmer effect)
4. After defeating ghost: verify 50 gold reward and +2 streak

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat(melody-dungeon): initialize ghost fields in dev room"
```

**Step 6: Final integration commit**

Run `bun test` one final time to confirm everything passes, then you're done.
