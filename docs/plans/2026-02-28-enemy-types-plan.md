# Enemy Types & Levels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic `TileType.Enemy`/`TileType.Dragon` system with typed, leveled enemies (Ghost, Skeleton, Dragon, Goblin) where each has a themed challenge pool and levels 1–3 scale HP with floor depth.

**Architecture:** Keep `TileType.Enemy` for all regular enemies; add `enemySubtype: EnemySubtype` and `enemyLevel: number` fields to `Tile`. Dragon becomes `TileType.Enemy` + `{ enemySubtype: 'dragon', enemyLevel: 3 }`. Level 2+ enemies use the existing `BossBattle` component (HP = level). `TileType.Dragon` is removed in the final task once all references are cleaned up.

**Tech Stack:** TypeScript, React, Vitest — run tests with `npx vitest run <path> --reporter=verbose`

---

### Task 1: Add EnemySubtype type and Tile fields to dungeonTypes.ts

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts:17-28`

No new tests needed — these are purely additive type definitions with no runtime behavior change.

**Step 1: Add EnemySubtype type after line 19 (after EnemyState)**

Current code at line 19:
```typescript
export type EnemyState = 'guarding' | 'chasing' | 'patrolling';
```

Add immediately after it:
```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin';
```

**Step 2: Add enemySubtype and enemyLevel to the Tile interface**

Current Tile interface (lines 21-28):
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

Replace with:
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
}
```

**Step 3: Verify TypeScript compiles cleanly for this file**

Run: `npx tsc --noEmit 2>&1 | grep dungeonTypes`
Expected: No errors

**Step 4: Commit**

```bash
git add client/src/lib/gameLogic/dungeonTypes.ts
git commit -m "feat: add EnemySubtype type and enemySubtype/enemyLevel fields to Tile"
```

---

### Task 2: Add subtype helpers and update dungeon generator

**Files:**
- Modify: `client/src/components/melody-dungeon/challengeHelpers.ts`
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts`
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Context:** `dungeonGenerator.ts` currently places Dragon tiles as `TileType.Dragon`. After this task, Dragons become `TileType.Enemy` with `enemySubtype: 'dragon'`. Regular enemies get `enemySubtype` (ghost/skeleton/goblin) and `enemyLevel` based on floor. `moveEnemies` uses `tile.type === TileType.Dragon` in 3 places — all must change to `tile.enemySubtype === 'dragon'`. **Do NOT remove `TileType.Dragon` from the enum yet** — other files still reference it and will be cleaned up in Tasks 3–5.

**Step 1: Add getSubtypeChallengePool to challengeHelpers.ts**

At the end of `client/src/components/melody-dungeon/challengeHelpers.ts`, add:

```typescript
import type { EnemySubtype } from '@/lib/gameLogic/dungeonTypes';

/** Returns the challenge type pool for a given enemy subtype. */
export function getSubtypeChallengePool(subtype: EnemySubtype | undefined, allFloorTypes: ChallengeType[]): ChallengeType[] {
  switch (subtype) {
    case 'ghost': return ['noteReading'];
    case 'skeleton': return ['rhythmTap'];
    case 'goblin': return ['interval'];
    case 'dragon': return allFloorTypes;
    default: return allFloorTypes;
  }
}
```

**Step 2: Write failing tests**

In `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`, add these new tests inside `describe('generateDungeon', ...)`:

```typescript
it('assigns ghost subtype with level 1 on floor 1', () => {
  const floor = generateDungeon(1);
  const enemies = floor.tiles.flat().filter(
    (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
  );
  expect(enemies.length).toBeGreaterThan(0);
  for (const e of enemies) {
    expect(e.enemySubtype).toBe('ghost');
    expect(e.enemyLevel).toBe(1);
  }
});

it('assigns dragon subtype with enemyLevel 3 on floor 4', () => {
  const floor = generateDungeon(4);
  const dragons = floor.tiles.flat().filter(
    (t) => t.type === TileType.Enemy && t.enemySubtype === 'dragon'
  );
  for (const d of dragons) {
    expect(d.enemyState).toBe('guarding');
    expect(d.enemyLevel).toBe(3);
  }
});

it('assigns level 1 or 2 on floor 8', () => {
  // Run multiple times to cover randomness
  for (let run = 0; run < 5; run++) {
    const floor = generateDungeon(8);
    const enemies = floor.tiles.flat().filter(
      (t) => t.type === TileType.Enemy && t.enemySubtype !== 'dragon'
    );
    for (const e of enemies) {
      expect(e.enemyLevel).toBeGreaterThanOrEqual(1);
      expect(e.enemyLevel).toBeLessThanOrEqual(2);
    }
  }
});
```

**Step 3: Run to verify they fail**

```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts --reporter=verbose
```
Expected: New tests FAIL with `expect(received).toBe(expected)` — `enemySubtype` is undefined

**Step 4: Update dungeonGenerator.ts imports**

Current import at lines 1-10:
```typescript
import {
  type DungeonFloor,
  type Tile,
  type Position,
  type Rect,
  TileType,
  getDungeonSize,
  DUNGEON_BASE_SIZE,
} from './dungeonTypes';
import { getChallengeTypesForFloor } from '@/components/melody-dungeon/challengeHelpers';
```

Replace with:
```typescript
import {
  type DungeonFloor,
  type Tile,
  type Position,
  type Rect,
  type ChallengeType,
  type EnemySubtype,
  TileType,
  getDungeonSize,
  DUNGEON_BASE_SIZE,
} from './dungeonTypes';
import { getChallengeTypesForFloor, getSubtypeChallengePool } from '@/components/melody-dungeon/challengeHelpers';
```

**Step 5: Add enemy helper functions to dungeonGenerator.ts**

After the `getBossType` function (after line 16), add:

```typescript
/** Returns which enemy subtypes can spawn on a given floor. */
function getEnemySubtypesForFloor(floorNumber: number): EnemySubtype[] {
  if (floorNumber <= 5) return ['ghost'];
  if (floorNumber <= 10) return ['ghost', 'skeleton'];
  return ['ghost', 'skeleton', 'goblin'];
}

/** Returns enemy level for a given floor (blends two adjacent levels for variety). */
function pickEnemyLevel(floorNumber: number): number {
  const maxLevel = Math.min(3, Math.floor((floorNumber - 1) / 5) + 1);
  const minLevel = Math.max(1, maxLevel - 1);
  return rand(minLevel, maxLevel);
}
```

**Step 6: Update Dragon placement (lines 411–418)**

Current code:
```typescript
      if (dragonPos) {
        grid[dragonPos.y][dragonPos.x].type = TileType.Dragon;
        grid[dragonPos.y][dragonPos.x].challengeType =
          challengeTypes[rand(0, challengeTypes.length - 1)];
        grid[dragonPos.y][dragonPos.x].cleared = false;
        grid[dragonPos.y][dragonPos.x].enemyState = 'guarding';
        placedPositions.push(dragonPos);
      }
```

Replace with:
```typescript
      if (dragonPos) {
        const dragonChallengePool = getSubtypeChallengePool('dragon', challengeTypes);
        grid[dragonPos.y][dragonPos.x].type = TileType.Enemy;
        grid[dragonPos.y][dragonPos.x].enemySubtype = 'dragon';
        grid[dragonPos.y][dragonPos.x].enemyLevel = 3;
        grid[dragonPos.y][dragonPos.x].challengeType =
          dragonChallengePool[rand(0, dragonChallengePool.length - 1)];
        grid[dragonPos.y][dragonPos.x].cleared = false;
        grid[dragonPos.y][dragonPos.x].enemyState = 'guarding';
        placedPositions.push(dragonPos);
      }
```

**Step 7: Update regular enemy placement (lines 422–434)**

Current code:
```typescript
    // Place regular enemies.
    const totalEnemies = Math.min(2 + floorNumber, 6);
    const regularCount = hasDragon ? totalEnemies - 1 : totalEnemies;
    for (let i = 0; i < regularCount; i++) {
      const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
      if (pos) {
        grid[pos.y][pos.x].type = TileType.Enemy;
        grid[pos.y][pos.x].challengeType =
          challengeTypes[rand(0, challengeTypes.length - 1)];
        grid[pos.y][pos.x].cleared = false;
        grid[pos.y][pos.x].enemyState = 'patrolling';
        placedPositions.push(pos);
      }
    }
```

Replace with:
```typescript
    // Place regular enemies.
    const totalEnemies = Math.min(2 + floorNumber, 6);
    const regularCount = hasDragon ? totalEnemies - 1 : totalEnemies;
    const availableSubtypes = getEnemySubtypesForFloor(floorNumber);
    for (let i = 0; i < regularCount; i++) {
      const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 3);
      if (pos) {
        const subtype = availableSubtypes[rand(0, availableSubtypes.length - 1)];
        const subtypePool = getSubtypeChallengePool(subtype, challengeTypes);
        grid[pos.y][pos.x].type = TileType.Enemy;
        grid[pos.y][pos.x].enemySubtype = subtype;
        grid[pos.y][pos.x].enemyLevel = pickEnemyLevel(floorNumber);
        grid[pos.y][pos.x].challengeType =
          subtypePool[rand(0, subtypePool.length - 1)];
        grid[pos.y][pos.x].cleared = false;
        grid[pos.y][pos.x].enemyState = 'patrolling';
        placedPositions.push(pos);
      }
    }
```

**Step 8: Update moveEnemies — enemy collection (line 537)**

Current:
```typescript
      if (!t.cleared && (t.type === TileType.Enemy || t.type === TileType.Dragon)) {
```

Replace with:
```typescript
      if (!t.cleared && t.type === TileType.Enemy) {
```

**Step 9: Update moveEnemies — dragon state transition (line 579)**

Current:
```typescript
    if (tile.type === TileType.Dragon && tile.enemyState === 'guarding') {
```

Replace with:
```typescript
    if (tile.enemySubtype === 'dragon' && tile.enemyState === 'guarding') {
```

**Step 10: Update moveEnemies — dragon tether check (line 653)**

Current:
```typescript
      if (tile.type === TileType.Dragon && chests.length > 0) {
```

Replace with:
```typescript
      if (tile.enemySubtype === 'dragon' && chests.length > 0) {
```

**Step 11: Update moveEnemies — carry enemySubtype/enemyLevel on tile move**

There are two places where a tile transfer happens (chasing branch ~lines 609–622, and patrolling branch ~lines 661–674). Both need `enemySubtype` and `enemyLevel` carried over.

For the **chasing branch** destination tile (around line 609):
```typescript
        tiles[ny][nx] = {
          ...target,
          type: tile.type,
          challengeType: tile.challengeType,
          cleared: false,
          enemyState: tile.enemyState,
        };
```
Replace with:
```typescript
        tiles[ny][nx] = {
          ...target,
          type: tile.type,
          enemySubtype: tile.enemySubtype,
          enemyLevel: tile.enemyLevel,
          challengeType: tile.challengeType,
          cleared: false,
          enemyState: tile.enemyState,
        };
```

For the **chasing branch** source tile (around line 616):
```typescript
        tiles[pos.y][pos.x] = {
          ...tiles[pos.y][pos.x],
          type: TileType.Floor,
          challengeType: undefined,
          cleared: undefined,
          enemyState: undefined,
        };
```
Replace with:
```typescript
        tiles[pos.y][pos.x] = {
          ...tiles[pos.y][pos.x],
          type: TileType.Floor,
          enemySubtype: undefined,
          enemyLevel: undefined,
          challengeType: undefined,
          cleared: undefined,
          enemyState: undefined,
        };
```

Apply the **same two changes** to the patrolling branch (around lines 661–674).

**Step 12: Update existing tests in dungeonGenerator.test.ts**

Update the two `generateDungeon` tests (lines 43–58) to use subtype-based checks:
```typescript
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
```

Update the four `moveEnemies` tests (lines 87–194) — all four use `type: TileType.Dragon` when creating test tiles and check `result.tiles[...].type === TileType.Dragon`. Replace each Dragon tile creation with:
```typescript
      tiles[0][3] = {
        type: TileType.Enemy,
        enemySubtype: 'dragon' as const,
        enemyLevel: 3,
        visible: false,
        visited: false,
        challengeType: 'noteReading',
        cleared: false,
        enemyState: 'chasing', // or 'guarding' depending on the test
      };
```

And replace each `TileType.Dragon` check in assertions:
```typescript
// BEFORE: expect(result.tiles[0][2].type).toBe(TileType.Dragon);
// AFTER:
expect(result.tiles[0][2].type).toBe(TileType.Enemy);
expect(result.tiles[0][2].enemySubtype).toBe('dragon');
```

Update the boss floor test "has no enemies or dragons" (lines 212–219):
```typescript
  it('has no enemies on boss floors', () => {
    const floor5 = generateDungeon(5);
    const floor10 = generateDungeon(10);
    expect(findTiles(floor5, TileType.Enemy).length).toBe(0);
    expect(findTiles(floor10, TileType.Enemy).length).toBe(0);
  });
```
(Remove the `TileType.Dragon` lines — they're obsolete since Dragon is now TileType.Enemy.)

**Step 13: Run tests to verify all pass**

```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts client/src/components/melody-dungeon/__tests__/challengeHelpers.test.ts --reporter=verbose
```
Expected: All tests pass (21 existing + 3 new = 24 total)

**Step 14: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts \
        client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts \
        client/src/components/melody-dungeon/challengeHelpers.ts
git commit -m "feat: add enemy subtypes/levels and migrate Dragon to TileType.Enemy subtype"
```

---

### Task 3: Update DungeonGrid — enemy sprites by subtype

**Files:**
- Modify: `client/src/components/melody-dungeon/DungeonGrid.tsx`
- Create: 4 placeholder sprite image files

**Context:** `DungeonGrid.tsx` currently maps `TileType.Dragon` to a sprite via `TILE_SPRITE`. Since Dragon is now `TileType.Enemy`, the sprite lookup must branch on `tile.enemySubtype`. The `isEnemy` check includes `TileType.Dragon` — that needs to be removed.

**Step 1: Create placeholder sprite files**

```bash
cp client/public/images/melody-dungeon-enemy.png client/public/images/melody-dungeon-ghost.png
cp client/public/images/melody-dungeon-enemy.png client/public/images/melody-dungeon-skeleton.png
cp client/public/images/melody-dungeon-enemy.png client/public/images/melody-dungeon-goblin.png
cp client/public/images/melody-dungeon-boss.png client/public/images/melody-dungeon-dragon.png
```

**Step 2: Add ENEMY_SPRITE map in DungeonGrid.tsx**

After the `TILE_SPRITE` constant (after line 48), add:

```typescript
const ENEMY_SPRITE: Record<string, string> = {
  ghost: '/images/melody-dungeon-ghost.png',
  skeleton: '/images/melody-dungeon-skeleton.png',
  dragon: '/images/melody-dungeon-dragon.png',
  goblin: '/images/melody-dungeon-goblin.png',
};
```

**Step 3: Remove TileType.Dragon from TILE_SPRITE**

Current TILE_SPRITE (lines 37-48):
```typescript
const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon-door.png',
  [TileType.Enemy]: '/images/melody-dungeon-enemy.png',
  [TileType.Treasure]: '/images/melody-dungeon-treasure.png',
  [TileType.Chest]: '/images/melody-dungeon-chest.png',
  [TileType.Stairs]: '/images/melody-dungeon-stairs.png',
  [TileType.Dragon]: '/images/melody-dungeon-boss.png',
  [TileType.MiniBoss]: '/images/melody-dungeon-miniboss.png',
  [TileType.BigBoss]: '/images/melody-dungeon-bigboss.png',
  [TileType.Merchant]: '/images/melody-dungeon-merchant.png',
  [TileType.MerchantStall]: '/images/melody-dungeon-stall.png',
};
```

Replace with (remove the Dragon entry, keep Enemy as fallback):
```typescript
const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon-door.png',
  [TileType.Treasure]: '/images/melody-dungeon-treasure.png',
  [TileType.Chest]: '/images/melody-dungeon-chest.png',
  [TileType.Stairs]: '/images/melody-dungeon-stairs.png',
  [TileType.MiniBoss]: '/images/melody-dungeon-miniboss.png',
  [TileType.BigBoss]: '/images/melody-dungeon-bigboss.png',
  [TileType.Merchant]: '/images/melody-dungeon-merchant.png',
  [TileType.MerchantStall]: '/images/melody-dungeon-stall.png',
};
```

**Step 4: Update sprite lookup to use enemySubtype for Enemy tiles**

Current sprite lookup (lines 106–110):
```typescript
          const spriteSrc =
            showContent &&
            !isPlayer &&
            !cleared &&
            TILE_SPRITE[tile.type];
```

Replace with:
```typescript
          const spriteSrc =
            showContent &&
            !isPlayer &&
            !cleared &&
            (tile.type === TileType.Enemy
              ? ENEMY_SPRITE[tile.enemySubtype ?? 'ghost']
              : TILE_SPRITE[tile.type]);
```

**Step 5: Remove TileType.Dragon from isEnemy check (lines 113–117)**

Current:
```typescript
          const isEnemy =
            tile.type === TileType.Enemy ||
            tile.type === TileType.Dragon ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss;
```

Replace with:
```typescript
          const isEnemy =
            tile.type === TileType.Enemy ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss;
```

**Step 6: Add EnemySubtype import to DungeonGrid.tsx**

Current import at line 2:
```typescript
import { TileType, VISIBILITY_RADIUS } from '@/lib/gameLogic/dungeonTypes';
```

Replace with:
```typescript
import { TileType, VISIBILITY_RADIUS } from '@/lib/gameLogic/dungeonTypes';
import type { EnemySubtype } from '@/lib/gameLogic/dungeonTypes';
```

Wait — `EnemySubtype` is needed for the ENEMY_SPRITE Record type if typed. Actually `Record<string, string>` is fine without the import. Skip this unless TypeScript requires it.

**Step 7: Verify TypeScript compiles for DungeonGrid.tsx**

```bash
npx tsc --noEmit 2>&1 | grep DungeonGrid
```
Expected: No errors

**Step 8: Commit**

```bash
git add client/src/components/melody-dungeon/DungeonGrid.tsx \
        client/public/images/melody-dungeon-ghost.png \
        client/public/images/melody-dungeon-skeleton.png \
        client/public/images/melody-dungeon-goblin.png \
        client/public/images/melody-dungeon-dragon.png
git commit -m "feat: add enemy type sprites and update DungeonGrid to render by enemySubtype"
```

---

### Task 4: Update ChallengeModal — multi-round fights for level 2+ enemies

**Files:**
- Modify: `client/src/components/melody-dungeon/ChallengeModal.tsx`

**Context:** Currently `isBoss` triggers `BossBattle` for Dragon/MiniBoss/BigBoss. After this task:
- Level 2+ `TileType.Enemy` tiles also trigger `BossBattle` (HP = `enemyLevel`)
- Level 1 `TileType.Enemy` tiles keep using single-question `ChallengeRenderer`
- `TileType.Dragon` references are removed (Dragon is now `TileType.Enemy`)
- Each enemy subtype gets a themed encounter title and border color

**Step 1: Add EnemySubtype import**

Add to the existing import at line 2:
```typescript
import type { ChallengeType, DifficultyLevel, EnemySubtype } from '@/lib/gameLogic/dungeonTypes';
```

**Step 2: Add enemySubtype and enemyLevel to Props interface (lines 15–24)**

Current:
```typescript
interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  maxHealth?: number;
  shieldCharm?: number;
  potions?: number;
}
```

Replace with:
```typescript
interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  maxHealth?: number;
  shieldCharm?: number;
  potions?: number;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}
```

**Step 3: Update getBossHp to use enemyLevel for TileType.Enemy (lines 30–34)**

Current:
```typescript
const BOSS_HP = 3;
const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

function getBossHp(tileType: TileType): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  return BOSS_HP;
}
```

Replace with:
```typescript
const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

function getBossHp(tileType: TileType, enemyLevel?: number): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  // TileType.Enemy: level IS the HP (dragon=3, ghost/skeleton/goblin=1–3)
  return enemyLevel ?? 1;
}
```

**Step 4: Update getBossLabel to use enemySubtype (lines 36–40)**

Current:
```typescript
function getBossLabel(tileType: TileType): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  return 'Dragon';
}
```

Replace with:
```typescript
function getBossLabel(tileType: TileType, enemySubtype?: EnemySubtype): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  switch (enemySubtype) {
    case 'ghost': return 'Ghost';
    case 'skeleton': return 'Skeleton';
    case 'dragon': return 'Dragon';
    case 'goblin': return 'Goblin';
    default: return 'Enemy';
  }
}
```

**Step 5: Remove TileType.Dragon from TILE_THEME and add getEnemyTheme helper**

Current TILE_THEME has a `[TileType.Dragon]` entry (lines 48–52):
```typescript
  [TileType.Dragon]: {
    title: 'Dragon Battle!',
    borderColor: 'border-purple-500',
    bgColor: 'from-purple-950/90 to-gray-900/95',
  },
```

Remove that entry from the TILE_THEME Record.

Then add a `getEnemyTheme` function after `DEFAULT_THEME`:
```typescript
function getEnemyTheme(enemySubtype?: EnemySubtype): { title: string; borderColor: string; bgColor: string } {
  switch (enemySubtype) {
    case 'dragon':
      return { title: 'Dragon Battle!', borderColor: 'border-purple-500', bgColor: 'from-purple-950/90 to-gray-900/95' };
    case 'skeleton':
      return { title: 'Skeleton Encounter!', borderColor: 'border-gray-400', bgColor: 'from-gray-950/90 to-gray-900/95' };
    case 'goblin':
      return { title: 'Goblin Encounter!', borderColor: 'border-green-500', bgColor: 'from-green-950/90 to-gray-900/95' };
    default:
      return TILE_THEME[TileType.Enemy]!; // Ghost uses the red enemy theme
  }
}
```

**Step 6: Add enemySubtype and enemyLevel props to BossBattle component**

Current BossBattle FC type (lines 97–105):
```typescript
const BossBattle: React.FC<{
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  maxHealth: number;
  shieldCharm: number;
  potions: number;
}> = ({ tileType, difficulty, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions }) => {
```

Replace with:
```typescript
const BossBattle: React.FC<{
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  maxHealth: number;
  shieldCharm: number;
  potions: number;
  enemySubtype?: EnemySubtype;
  enemyLevel?: number;
}> = ({ tileType, difficulty, floorNumber, onResult, playerHealth, maxHealth, shieldCharm, potions, enemySubtype, enemyLevel }) => {
```

**Step 7: Update BossBattle useMemo calls**

Current (lines 106–107):
```typescript
  const maxBossHp = useMemo(() => getBossHp(tileType), [tileType]);
  const bossLabel = useMemo(() => getBossLabel(tileType), [tileType]);
```

Replace with:
```typescript
  const maxBossHp = useMemo(() => getBossHp(tileType, enemyLevel), [tileType, enemyLevel]);
  const bossLabel = useMemo(() => getBossLabel(tileType, enemySubtype), [tileType, enemySubtype]);
```

**Step 8: Update BossBattle challenge selection to use subtype pool**

Current (lines 109–138):
```typescript
  // For Dragon/MiniBoss: random challenge each round
  const challengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);
```

Replace with:
```typescript
  // Floor challenge types (used by MiniBoss/BigBoss and Dragon)
  const floorChallengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);
  // For TileType.Enemy: use subtype-specific pool; for bosses: use floor pool
  const challengeTypes = useMemo(
    () => tileType === TileType.Enemy
      ? getSubtypeChallengePool(enemySubtype, floorChallengeTypes)
      : floorChallengeTypes,
    [tileType, enemySubtype, floorChallengeTypes]
  );
```

Add `getSubtypeChallengePool` to the import from challengeHelpers:
```typescript
import { getChallengeTypesForFloor, pickRandom, generateBigBossSequence, getSubtypeChallengePool } from './challengeHelpers';
```

**Step 9: Update ChallengeModal component — theme, isMultiRound, new props**

Current ChallengeModal signature (line 273):
```typescript
const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0 }) => {
  const theme = TILE_THEME[tileType] || DEFAULT_THEME;
  const isBoss = tileType === TileType.Dragon || tileType === TileType.MiniBoss || tileType === TileType.BigBoss;
```

Replace with:
```typescript
const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, floorNumber, onResult, playerHealth = 5, maxHealth = 5, shieldCharm = 0, potions = 0, enemySubtype, enemyLevel = 1 }) => {
  const theme = tileType === TileType.Enemy
    ? getEnemyTheme(enemySubtype)
    : (TILE_THEME[tileType] || DEFAULT_THEME);
  const isMultiRound =
    (tileType === TileType.Enemy && enemyLevel > 1) ||
    tileType === TileType.MiniBoss ||
    tileType === TileType.BigBoss;
```

**Step 10: Pass enemySubtype/enemyLevel into BossBattle and rename isBoss → isMultiRound**

Current render (lines 290–301):
```typescript
        {isBoss ? (
          <BossBattle
            tileType={tileType}
            difficulty={difficulty}
            floorNumber={floorNumber}
            onResult={onResult}
            playerHealth={playerHealth}
            maxHealth={maxHealth}
            shieldCharm={shieldCharm}
            potions={potions}
          />
        ) : (
          <ChallengeRenderer type={challengeType} difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} />
        )}
```

Replace with:
```typescript
        {isMultiRound ? (
          <BossBattle
            tileType={tileType}
            difficulty={difficulty}
            floorNumber={floorNumber}
            onResult={onResult}
            playerHealth={playerHealth}
            maxHealth={maxHealth}
            shieldCharm={shieldCharm}
            potions={potions}
            enemySubtype={enemySubtype}
            enemyLevel={enemyLevel}
          />
        ) : (
          <ChallengeRenderer type={challengeType} difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} />
        )}
```

**Step 11: Verify TypeScript compiles for ChallengeModal.tsx**

```bash
npx tsc --noEmit 2>&1 | grep ChallengeModal
```
Expected: No errors

**Step 12: Commit**

```bash
git add client/src/components/melody-dungeon/ChallengeModal.tsx
git commit -m "feat: update ChallengeModal to support enemy subtypes and level-based multi-round fights"
```

---

### Task 5: Update MelodyDungeonGame + remove TileType.Dragon

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx`
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts`

**Context:** `MelodyDungeonGame.tsx` has multiple `TileType.Dragon` references:
1. `isBoss` check (line 337–340): Dragon is now handled via `activeTileLevel > 1`
2. Dragon rewards (line 370–374): now triggered by `activeTileSubtype === 'dragon'`
3. Dragon Bane buff (line 396): now triggered by `activeTileSubtype === 'dragon'`
4. Encounter detection (line 274): remove `TileType.Dragon`
5. New state vars needed: `activeTileSubtype` and `activeTileLevel`

**Step 1: Add EnemySubtype import to MelodyDungeonGame.tsx**

Find the existing import from dungeonTypes (it imports TileType and others). Add `EnemySubtype` to it:
```typescript
import type { ..., EnemySubtype } from '@/lib/gameLogic/dungeonTypes';
```

**Step 2: Add activeTileSubtype and activeTileLevel state**

Near the existing `activeTileType` state, add:
```typescript
const [activeTileSubtype, setActiveTileSubtype] = useState<EnemySubtype | undefined>(undefined);
const [activeTileLevel, setActiveTileLevel] = useState<number>(1);
```

**Step 3: Set activeTileSubtype and activeTileLevel in handleMove**

Find where `setActiveTileType(tile.type)` is called (line ~283). After it, add:
```typescript
          setActiveTileSubtype(tile.enemySubtype);
          setActiveTileLevel(tile.enemyLevel ?? 1);
```

**Step 4: Remove TileType.Dragon from encounter detection (lines 271–277)**

Current:
```typescript
        if (
          !tile.cleared &&
          (tile.type === TileType.Enemy ||
            tile.type === TileType.Dragon ||
            tile.type === TileType.Treasure ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss)
        ) {
```

Replace with (remove `tile.type === TileType.Dragon`):
```typescript
        if (
          !tile.cleared &&
          (tile.type === TileType.Enemy ||
            tile.type === TileType.Treasure ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss)
        ) {
```

**Step 5: Update isBoss check (lines 337–340)**

Current:
```typescript
      const isBoss =
        activeTileType === TileType.Dragon ||
        activeTileType === TileType.MiniBoss ||
        activeTileType === TileType.BigBoss;
```

Replace with:
```typescript
      const isBoss =
        (activeTileType === TileType.Enemy && activeTileLevel > 1) ||
        activeTileType === TileType.MiniBoss ||
        activeTileType === TileType.BigBoss;
```

**Step 6: Update Dragon rewards (lines 369–374)**

Current:
```typescript
            } else {
              // Dragon
              updated.health = battleHealth;
              updated.score += 500 + streakBonus;
              updated.keys += 2;
              updated.potions += 1; // reward (after battle consumption deducted above)
            }
```

Replace with:
```typescript
            } else if (activeTileSubtype === 'dragon') {
              // Dragon
              updated.health = battleHealth;
              updated.score += 500 + streakBonus;
              updated.keys += 2;
              updated.potions += 1; // reward (after battle consumption deducted above)
            } else {
              // Regular level 2–3 enemy (ghost/skeleton/goblin)
              updated.health = battleHealth;
              const levelScore = activeTileLevel === 3 ? 250 : 175;
              updated.score += levelScore + streakBonus;
              updated.keys += activeTileLevel === 3 ? 2 : 1;
            }
```

**Step 7: Update Dragon Bane buff check (line ~396)**

Current:
```typescript
          // Dragon Bane: consume one charge after dragon battle
          if (activeTileType === TileType.Dragon && prev.buffs.persistent.dragonBane > 0) {
```

Replace with:
```typescript
          // Dragon Bane: consume one charge after dragon battle
          if (activeTileSubtype === 'dragon' && prev.buffs.persistent.dragonBane > 0) {
```

**Step 8: Pass enemySubtype and enemyLevel to ChallengeModal (lines ~710–719)**

Current:
```typescript
        <ChallengeModal
          challengeType={activeChallenge.type}
          tileType={activeTileType}
          difficulty={difficulty}
          floorNumber={floorNumber}
          onResult={handleChallengeResult}
          playerHealth={player.health}
          maxHealth={player.maxHealth}
          shieldCharm={player.shieldCharm}
          potions={player.potions}
        />
```

Replace with:
```typescript
        <ChallengeModal
          challengeType={activeChallenge.type}
          tileType={activeTileType}
          difficulty={difficulty}
          floorNumber={floorNumber}
          onResult={handleChallengeResult}
          playerHealth={player.health}
          maxHealth={player.maxHealth}
          shieldCharm={player.shieldCharm}
          potions={player.potions}
          enemySubtype={activeTileSubtype}
          enemyLevel={activeTileLevel}
        />
```

**Step 9: Verify TypeScript compiles for MelodyDungeonGame.tsx**

```bash
npx tsc --noEmit 2>&1 | grep MelodyDungeonGame
```
Expected: No errors (if TileType.Dragon still exists in the enum, there should be no errors at this point)

**Step 10: Remove TileType.Dragon from dungeonTypes.ts**

In `client/src/lib/gameLogic/dungeonTypes.ts`, remove line 10:
```typescript
  Dragon = 'dragon',
```

**Step 11: Verify TypeScript finds no remaining TileType.Dragon references**

```bash
npx tsc --noEmit 2>&1 | grep -i dragon
```
Expected: No errors. If there are errors, they point to files that still reference `TileType.Dragon` — fix them.

Also run:
```bash
npx vitest run client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts client/src/components/melody-dungeon/__tests__/challengeHelpers.test.ts --reporter=verbose
```
Expected: All tests pass

**Step 12: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx \
        client/src/lib/gameLogic/dungeonTypes.ts
git commit -m "feat: wire enemy subtypes/levels into game state and remove TileType.Dragon"
```
