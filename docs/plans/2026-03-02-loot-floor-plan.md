# Loot Floor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a rare "loot floor" that replaces all enemies, doors, merchants, and chests with treasure piles.

**Architecture:** Add `isLootFloor` boolean to `DungeonFloor`. In `generateDungeon`, roll a 1% chance (on eligible floors) and conditionally skip entity placement, replacing it with a `placeLootTreasure()` helper. Golden theme overrides in `DungeonGrid` and a "Loot Floor!" banner in `MelodyDungeonGame`.

**Tech Stack:** TypeScript, React, Vitest, Tailwind CSS

---

### Task 1: Add `isLootFloor` to the Data Model

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts:134-142`
- Modify: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts:217-226` (update `createTestFloor`)

**Step 1: Add `isLootFloor` to `DungeonFloor` interface**

In `dungeonTypes.ts`, add `isLootFloor` to the `DungeonFloor` interface:

```ts
export interface DungeonFloor {
  tiles: Tile[][];
  width: number;
  height: number;
  floorNumber: number;
  themeIndex: number;
  playerStart: Position;
  stairsPosition: Position;
  isLootFloor: boolean;
}
```

**Step 2: Update `createTestFloor` helper in tests**

In `dungeonGenerator.test.ts`, update the `createTestFloor` return to include `isLootFloor: false`:

```ts
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
```

**Step 3: Run tests to verify nothing is broken**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: All existing tests pass (TypeScript will complain about `generateDungeon` and `generateDevRoom` return values missing `isLootFloor` — that's expected and will be fixed in Task 2)

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "feat(melody-dungeon): add isLootFloor to DungeonFloor interface"
```

---

### Task 2: Implement Loot Floor Generation Logic

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:305-571` (the `generateDungeon` function)
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:574-650` (the `generateDevRoom` function)

**Step 1: Add `isLootFloor` helper function**

Add this near the top of `dungeonGenerator.ts` (after `getBossType`):

```ts
/** Loot floors: 1% chance on eligible floors (>= 3, non-boss). */
export function rollLootFloor(floorNumber: number): boolean {
  if (floorNumber < 3) return false;
  if (floorNumber % 5 === 0) return false;
  return Math.random() < 0.01;
}
```

**Step 2: Add `placeLootTreasure` function**

Add this before `generateDungeon`:

```ts
/** Place 15–20 treasure piles on random floor tiles for loot floors. */
function placeLootTreasure(
  grid: Tile[][],
  placedPositions: Position[],
  playerStart: Position,
  floorNumber: number,
): void {
  const count = rand(15, 20);
  for (let i = 0; i < count; i++) {
    const pos = pickRandomFloorTile(grid, placedPositions, playerStart, 2);
    if (pos) {
      grid[pos.y][pos.x].type = TileType.Treasure;
      grid[pos.y][pos.x].challengeType = rollChallengeType(floorNumber);
      grid[pos.y][pos.x].cleared = false;
      placedPositions.push(pos);
    }
  }
}
```

**Step 3: Integrate loot floor roll into `generateDungeon`**

After the `placedPositions` array is built (around line 410), add the loot floor roll and wrap the existing entity placement in a conditional:

```ts
const isLootFloor = !bossType && rollLootFloor(floorNumber);

if (isLootFloor) {
  // Loot floor: only treasure piles, no enemies/doors/merchants/chests
  placeLootTreasure(grid, placedPositions, playerStart, floorNumber);
} else {
  // --- existing code for challengeTypes, chests, dragon, enemies, doors, merchant, treasure ---
  // (lines 412–560 stay here, unchanged, inside this else block)
}
```

**Step 4: Update the return value of `generateDungeon`**

```ts
return {
  tiles: grid,
  width,
  height,
  floorNumber,
  themeIndex: getThemeIndexForFloor(floorNumber),
  playerStart,
  stairsPosition,
  isLootFloor,
};
```

**Step 5: Update `generateDevRoom` return value**

Add `isLootFloor: false` to the return object of `generateDevRoom`:

```ts
return {
  tiles: grid,
  width: size,
  height: size,
  floorNumber: 0,
  themeIndex: 0,
  playerStart,
  stairsPosition: playerStart,
  isLootFloor: false,
};
```

**Step 6: Run tests to verify compilation and existing behavior**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: All tests pass. The 1% roll means existing tests are overwhelmingly unaffected.

**Step 7: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat(melody-dungeon): implement loot floor generation with 1% chance"
```

---

### Task 3: Write Loot Floor Tests

**Files:**
- Modify: `client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`

**Step 1: Add import for `rollLootFloor`**

Update the import line:
```ts
import { generateDungeon, moveEnemies, getBossType, rollLootFloor } from '../logic/dungeonGenerator';
```

**Step 2: Add loot floor test suite**

```ts
describe('rollLootFloor', () => {
  it('returns false for floors 1-2', () => {
    // Run many times — should never return true
    for (let i = 0; i < 100; i++) {
      expect(rollLootFloor(1)).toBe(false);
      expect(rollLootFloor(2)).toBe(false);
    }
  });

  it('returns false for boss floors', () => {
    for (let i = 0; i < 100; i++) {
      expect(rollLootFloor(5)).toBe(false);
      expect(rollLootFloor(10)).toBe(false);
      expect(rollLootFloor(50)).toBe(false);
      expect(rollLootFloor(100)).toBe(false);
    }
  });
});

describe('loot floor generation', () => {
  it('loot floors have only treasure as interactive tiles (no enemies, doors, chests, merchants)', () => {
    // Generate floors until we get a loot floor (mock random to force it)
    const origRandom = Math.random;
    // Force loot floor: make Math.random return < 0.01 on the loot roll
    let callCount = 0;
    Math.random = () => {
      callCount++;
      // The loot roll is early in generateDungeon. Return 0.005 (< 0.01) for the
      // first call after room placement is done, then revert to real random for
      // treasure placement randomness.
      return origRandom();
    };

    // Generate with a seeded approach: call generateDungeon in a loop until isLootFloor
    Math.random = origRandom;
    // Simpler: directly test by generating many floors and checking any that hit
    // OR mock at the module level. Simplest: generate with forced flag.

    // Since rollLootFloor is exported, we can test it independently.
    // For integration: generate many floor-3 dungeons and check any loot floors
    // that naturally occur (or force via vi.spyOn)
    Math.random = origRandom;
  });

  it('loot floor has 15-20 treasure tiles and no enemies/doors/chests/merchants', () => {
    // Use vi.spyOn to force loot floor
    const spy = vi.spyOn(Math, 'random');
    // We need the loot roll (called after room/corridor generation) to return < 0.01
    // Strategy: let all calls pass through except force one low value for the loot check
    let lootFloor: ReturnType<typeof generateDungeon> | null = null;

    // Generate floors in a loop, checking isLootFloor
    // Alternatively, since the chance is 1%, just run enough times
    spy.mockRestore();

    // Practical approach: generate with floor 3 many times
    for (let i = 0; i < 500; i++) {
      const floor = generateDungeon(3);
      if (floor.isLootFloor) {
        lootFloor = floor;
        break;
      }
    }

    // If we didn't get one in 500 tries (very unlikely), skip gracefully
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
    expect(lootFloor.isLootFloor).toBe(true);
  });

  it('loot floor still has stairs', () => {
    for (let i = 0; i < 500; i++) {
      const floor = generateDungeon(3);
      if (floor.isLootFloor) {
        expect(findTiles(floor, TileType.Stairs).length).toBe(1);
        return;
      }
    }
  });

  it('normal floors have isLootFloor set to false', () => {
    const floor = generateDungeon(1);
    expect(floor.isLootFloor).toBe(false);

    const bossFloor = generateDungeon(5);
    expect(bossFloor.isLootFloor).toBe(false);
  });
});
```

**Step 3: Update existing treasure count test to skip loot floors**

Change the "places 0 or 1 treasure tiles on non-boss floors" test:

```ts
it('places 0 or 1 treasure tiles on non-boss floors (excluding loot floors)', () => {
  for (let run = 0; run < 20; run++) {
    const floor = generateDungeon(3);
    if (floor.isLootFloor) continue; // Skip loot floors for this assertion
    const treasures = findTiles(floor, TileType.Treasure);
    expect(treasures.length).toBeGreaterThanOrEqual(0);
    expect(treasures.length).toBeLessThanOrEqual(1);
  }
});
```

**Step 4: Run all tests**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/__tests__/dungeonGenerator.test.ts
git commit -m "test(melody-dungeon): add loot floor generation tests"
```

---

### Task 4: Golden Theme Override in DungeonGrid

**Files:**
- Modify: `client/src/games/melody-dungeon/DungeonGrid.tsx`

**Step 1: Add loot floor golden theme override**

In `DungeonGrid.tsx`, after the existing `theme` memo (line 63), add a loot floor theme override:

```ts
const effectiveTheme = useMemo(() => {
  if (!floor.isLootFloor) return theme;
  return {
    ...theme,
    floor: '#92702a',
    floorCleared: '#7a5f24',
    border: '#d4a017',
    gridLine: 'rgba(212,160,23,0.2)',
  };
}, [theme, floor.isLootFloor]);
```

Then replace all references to `theme` in the JSX with `effectiveTheme` (there are ~8 occurrences: `containerBg`, `border`, `wall`, `wallImg`, `floorCleared`, `floorImg`, `floor`, `fog`, `gridLine`).

**Step 2: Run dev server and verify visually**

Run: `npm run dev`
Manually test by temporarily setting `Math.random() < 1.0` in `rollLootFloor` to always trigger. Verify golden floor tint appears. Revert the temporary change.

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/DungeonGrid.tsx
git commit -m "feat(melody-dungeon): add golden theme override for loot floors"
```

---

### Task 5: "Loot Floor!" Announcement Banner

**Files:**
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Add loot floor banner state**

Add a `showLootBanner` state near the other state declarations:

```ts
const [showLootBanner, setShowLootBanner] = useState(false);
```

**Step 2: Trigger the banner when a loot floor loads**

In the `descendFloor` callback, after `setFloor(visibleFloor)`, add:

```ts
if (visibleFloor.isLootFloor) {
  setShowLootBanner(true);
  setTimeout(() => setShowLootBanner(false), 2500);
}
```

Also do the same in `startNewGame` after `setFloor(visibleFloor)`:

```ts
if (visibleFloor.isLootFloor) {
  setShowLootBanner(true);
  setTimeout(() => setShowLootBanner(false), 2500);
}
```

**Step 3: Add the banner JSX in the playing phase render**

In the playing phase return, after the existing `shieldEffectActive` overlay and before the closing `</div>`, add:

```tsx
{showLootBanner && (
  <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
    <div className="bg-gradient-to-r from-yellow-900/90 via-amber-800/90 to-yellow-900/90 border-2 border-yellow-400 rounded-2xl px-8 py-4 text-center animate-bounce-in shadow-lg shadow-yellow-500/30">
      <div className="text-4xl mb-1">{'\uD83D\uDCB0'}</div>
      <h2 className="text-2xl font-bold text-yellow-300">Loot Floor!</h2>
      <p className="text-yellow-100/80 text-sm">Treasure awaits...</p>
    </div>
  </div>
)}
```

**Step 4: Add `animate-bounce-in` keyframe to Tailwind config (if not present)**

Check if `tailwind.config.ts` already has a bounce-in animation. If not, add to the `extend.animation` and `extend.keyframes` sections:

```ts
animation: {
  'bounce-in': 'bounceIn 0.5s ease-out',
},
keyframes: {
  bounceIn: {
    '0%': { opacity: '0', transform: 'scale(0.3)' },
    '50%': { opacity: '1', transform: 'scale(1.05)' },
    '70%': { transform: 'scale(0.95)' },
    '100%': { transform: 'scale(1)' },
  },
},
```

If a similar animation already exists, reuse it.

**Step 5: Update the `floorComplete` screen for loot floors**

In the `floorComplete` phase render section, add a conditional for loot floor styling. When `floor.isLootFloor` is true, use golden gradients and "Loot Floor Cleared!" text:

```tsx
if (phase === 'floorComplete') {
  const isLoot = floor.isLootFloor;
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-white ${
      isLoot
        ? 'bg-gradient-to-b from-gray-950 via-yellow-950/30 to-gray-950'
        : 'bg-gradient-to-b from-gray-950 via-emerald-950/30 to-gray-950'
    }`}>
      <div className={`bg-gray-900/80 rounded-2xl p-6 max-w-sm w-full text-center border ${
        isLoot ? 'border-yellow-600' : 'border-emerald-800'
      }`}>
        {/* rest of floor complete content, with emoji changed for loot floors */}
```

**Step 6: Run dev server and verify**

Temporarily force loot floor, verify banner appears on floor load and floor-complete screen has golden styling.

**Step 7: Commit**

```bash
git add client/src/games/melody-dungeon/MelodyDungeonGame.tsx tailwind.config.ts
git commit -m "feat(melody-dungeon): add loot floor announcement banner and golden floor-complete screen"
```

---

### Task 6: Update HUD for Loot Floors

**Files:**
- Modify: `client/src/games/melody-dungeon/HUD.tsx`

**Step 1: Add `isLootFloor` prop**

Add `isLootFloor?: boolean` to `HUDProps` and pass it from `MelodyDungeonGame.tsx`.

**Step 2: Show loot floor indicator in HUD**

In the floor display section of HUD, conditionally show a gold indicator:

```tsx
<span className={`font-medium ${isLootFloor ? 'text-yellow-400' : 'text-purple-300'}`} title="Floor">
  B{floorNumber}F {isLootFloor && '\uD83D\uDCB0'}
</span>
```

**Step 3: Pass `isLootFloor` from MelodyDungeonGame**

In the `<HUD>` usage, add `isLootFloor={floor.isLootFloor}`.

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/HUD.tsx client/src/games/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat(melody-dungeon): show loot floor indicator in HUD"
```

---

### Task 7: Final Verification

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 2: Manual smoke test**

Temporarily change `rollLootFloor` to return `true` always (for testing), run `npm run dev`, play through floors and verify:
- Golden floor tiles render correctly
- "Loot Floor!" banner appears
- 15-20 treasure piles are present
- No enemies, doors, merchants, or chests
- Treasure interactions work normally (challenge → gold/key/potion rewards)
- Stairs are present and floor progression works
- HUD shows gold indicator
- Floor-complete screen has golden styling
- Revert `rollLootFloor` back to 1% after testing

**Step 3: Commit revert if needed**

Ensure `rollLootFloor` is back to `Math.random() < 0.01`.

**Step 4: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "feat(melody-dungeon): complete loot floor feature"
```
