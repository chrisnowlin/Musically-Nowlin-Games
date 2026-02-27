# Merchant System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a merchant character and shop system to Melody Dungeon where players spend score points on consumable items.

**Architecture:** Two new tile types (Merchant + MerchantStall) placed as adjacent pairs during dungeon generation. A MerchantModal component opens when the player steps on the Merchant tile, using a new `'shopping'` game phase. A new Shield Charm consumable is added to PlayerState. Items are defined in a pure-function catalog for easy testing.

**Tech Stack:** React 18, TypeScript (strict), Tailwind CSS, Vitest, Vite

---

## Task 1: Add Types and Enums

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts`

**Step 1: Add new TileType entries**

In `dungeonTypes.ts`, add two entries to the `TileType` enum:

```typescript
export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Dragon = 'dragon',
  Merchant = 'merchant',
  MerchantStall = 'merchantStall',
}
```

**Step 2: Add `'shopping'` to `GamePhase`**

```typescript
export type GamePhase = 'menu' | 'playing' | 'challenge' | 'shopping' | 'gameOver' | 'floorComplete' | 'victory';
```

**Step 3: Add `shieldCharm` to `PlayerState`**

```typescript
export interface PlayerState {
  position: Position;
  health: number;
  maxHealth: number;
  score: number;
  keys: number;
  potions: number;
  streak: number;
  shieldCharm: number;
}
```

**Step 4: Run existing tests to verify no breakage**

Run: `npx vitest run --reporter=verbose`
Expected: All existing tests still pass. The new enum values and fields don't break anything because nothing references them yet.

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/dungeonTypes.ts
git commit -m "feat(dungeon): add Merchant/MerchantStall tile types, shopping phase, and shieldCharm"
```

---

## Task 2: Create Merchant Item Catalog

**Files:**
- Create: `client/src/lib/gameLogic/merchantItems.ts`
- Create: `client/src/test/merchant-items.test.ts`

**Step 1: Write the failing tests**

Create `client/src/test/merchant-items.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { MERCHANT_ITEMS, getMerchantPrice } from '@/lib/gameLogic/merchantItems';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    position: { x: 0, y: 0 },
    health: 3,
    maxHealth: 5,
    score: 1000,
    keys: 0,
    potions: 0,
    streak: 0,
    shieldCharm: 0,
    ...overrides,
  };
}

describe('Merchant items', () => {
  it('has 4 items in the catalog', () => {
    expect(MERCHANT_ITEMS).toHaveLength(4);
  });

  it('prices scale with floor depth', () => {
    for (const item of MERCHANT_ITEMS) {
      const price1 = item.getPrice(1);
      const price10 = item.getPrice(10);
      expect(price10).toBeGreaterThan(price1);
    }
  });

  it('potion restores 1 potion', () => {
    const potion = MERCHANT_ITEMS.find((i) => i.id === 'potion')!;
    const player = makePlayer({ potions: 0 });
    const result = potion.apply(player);
    expect(result.potions).toBe(1);
  });

  it('key adds 1 key', () => {
    const key = MERCHANT_ITEMS.find((i) => i.id === 'key')!;
    const player = makePlayer({ keys: 0 });
    const result = key.apply(player);
    expect(result.keys).toBe(1);
  });

  it('potion bundle adds 3 potions', () => {
    const bundle = MERCHANT_ITEMS.find((i) => i.id === 'potion-bundle')!;
    const player = makePlayer({ potions: 1 });
    const result = bundle.apply(player);
    expect(result.potions).toBe(4);
  });

  it('shield charm sets shieldCharm to 1', () => {
    const charm = MERCHANT_ITEMS.find((i) => i.id === 'shield-charm')!;
    const player = makePlayer({ shieldCharm: 0 });
    const result = charm.apply(player);
    expect(result.shieldCharm).toBe(1);
  });

  it('shield charm cannot be bought if already held', () => {
    const charm = MERCHANT_ITEMS.find((i) => i.id === 'shield-charm')!;
    const player = makePlayer({ shieldCharm: 1 });
    expect(charm.canBuy(player)).toBe(false);
  });

  it('all items can be bought with sufficient score', () => {
    const player = makePlayer({ score: 10000 });
    for (const item of MERCHANT_ITEMS) {
      expect(item.canBuy(player)).toBe(true);
    }
  });

  it('items cannot be bought with insufficient score', () => {
    const player = makePlayer({ score: 0 });
    for (const item of MERCHANT_ITEMS) {
      expect(item.canBuy(player)).toBe(false);
    }
  });

  it('getMerchantPrice deducts score and applies item', () => {
    const potion = MERCHANT_ITEMS.find((i) => i.id === 'potion')!;
    const player = makePlayer({ score: 500, potions: 0 });
    const result = getMerchantPrice(player, potion, 1);
    expect(result.potions).toBe(1);
    expect(result.score).toBe(500 - potion.getPrice(1));
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run client/src/test/merchant-items.test.ts --reporter=verbose`
Expected: FAIL — module not found.

**Step 3: Write the implementation**

Create `client/src/lib/gameLogic/merchantItems.ts`:

```typescript
import type { PlayerState } from './dungeonTypes';

export interface MerchantItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  getPrice: (floor: number) => number;
  canBuy: (player: PlayerState) => boolean;
  apply: (player: PlayerState) => PlayerState;
}

export const MERCHANT_ITEMS: MerchantItem[] = [
  {
    id: 'potion',
    name: 'Potion',
    description: 'Restores 1 HP',
    emoji: '\uD83E\uDDEA',
    getPrice: (floor) => 150 + floor * 10,
    canBuy: (player) => player.score >= 150,
    apply: (player) => ({ ...player, potions: player.potions + 1 }),
  },
  {
    id: 'key',
    name: 'Key',
    description: 'Opens one chest',
    emoji: '\uD83D\uDD11',
    getPrice: (floor) => 200 + floor * 15,
    canBuy: (player) => player.score >= 200,
    apply: (player) => ({ ...player, keys: player.keys + 1 }),
  },
  {
    id: 'potion-bundle',
    name: '3 Potions',
    description: 'Bulk healing deal',
    emoji: '\uD83C\uDF81',
    getPrice: (floor) => 400 + floor * 25,
    canBuy: (player) => player.score >= 400,
    apply: (player) => ({ ...player, potions: player.potions + 3 }),
  },
  {
    id: 'shield-charm',
    name: 'Shield Charm',
    description: 'Blocks next wrong-answer damage',
    emoji: '\uD83D\uDEE1\uFE0F',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300 && player.shieldCharm < 1,
    apply: (player) => ({ ...player, shieldCharm: 1 }),
  },
];

/** Deduct price and apply item effect to player state. */
export function getMerchantPrice(
  player: PlayerState,
  item: MerchantItem,
  floorNumber: number
): PlayerState {
  const price = item.getPrice(floorNumber);
  return item.apply({ ...player, score: player.score - price });
}
```

**Important note on `canBuy`:** The `canBuy` functions above use base price minimums for quick checks. In the actual UI, the buy button will check `player.score >= item.getPrice(floorNumber)` which accounts for floor scaling. This keeps the pure `canBuy` simple for testing while the UI handles the full check.

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/test/merchant-items.test.ts --reporter=verbose`
Expected: All 9 tests PASS.

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/merchantItems.ts client/src/test/merchant-items.test.ts
git commit -m "feat(dungeon): add merchant item catalog with pricing and tests"
```

---

## Task 3: Update Dungeon Generator — Merchant Pair Placement

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts`

**Step 1: Add MerchantStall to `getReachableWithoutKey` blockers**

In the `getReachableWithoutKey` function, update the tile type check at line ~202:

```typescript
// Before:
if (tile.type === TileType.Wall || tile.type === TileType.Chest) continue;

// After:
if (tile.type === TileType.Wall || tile.type === TileType.Chest || tile.type === TileType.MerchantStall) continue;
```

**Step 2: Add merchant pair placement in `generateDungeon`**

Insert after the door placement block (after line ~420) and before the treasure placement block:

```typescript
  // Place merchant pair (stall + merchant) on ~40% of floors, never on floor 1.
  if (floorNumber > 1 && Math.random() < 0.4) {
    // Place stall first: needs open room tile (not hallway).
    const stallCandidates = getFloorTiles(grid).filter((p) => {
      if (placedPositions.some((e) => e.x === p.x && e.y === p.y)) return false;
      if (distanceSq(p, playerStart) < 4) return false;
      if (isStraightHallwayTile(grid, p)) return false;
      return isOpenEnough(grid, p);
    });

    if (stallCandidates.length > 0) {
      const stallPos = stallCandidates[rand(0, stallCandidates.length - 1)];

      // Find adjacent floor tile for the merchant character.
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      const merchantCandidates = dirs
        .map((d) => ({ x: stallPos.x + d.x, y: stallPos.y + d.y }))
        .filter(
          (p) =>
            p.y >= 0 &&
            p.y < height &&
            p.x >= 0 &&
            p.x < width &&
            grid[p.y][p.x].type === TileType.Floor &&
            !placedPositions.some((e) => e.x === p.x && e.y === p.y)
        );

      if (merchantCandidates.length > 0) {
        const merchantPos = merchantCandidates[rand(0, merchantCandidates.length - 1)];

        grid[stallPos.y][stallPos.x].type = TileType.MerchantStall;
        grid[merchantPos.y][merchantPos.x].type = TileType.Merchant;
        placedPositions.push(stallPos, merchantPos);
      }
    }
  }
```

**Step 3: Run existing generator tests to verify no breakage**

Run: `npx vitest run client/src/test/melody-dungeon-generator.test.ts --reporter=verbose`
Expected: All existing tests still PASS. The merchant tiles don't violate door/hallway placement rules.

**Step 4: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts
git commit -m "feat(dungeon): place merchant+stall pairs in dungeon generation"
```

---

## Task 4: Add Merchant Placement Tests

**Files:**
- Modify: `client/src/test/melody-dungeon-generator.test.ts`

**Step 1: Write merchant placement tests**

Add to the existing describe block in `melody-dungeon-generator.test.ts`:

```typescript
  it('places merchant and stall as adjacent pair', () => {
    let merchantFound = false;
    // Run enough times to hit the 40% spawn chance
    for (let attempt = 0; attempt < 200; attempt++) {
      const floor = generateDungeon(5);
      const merchants = getAllPositionsByType(floor, TileType.Merchant);
      const stalls = getAllPositionsByType(floor, TileType.MerchantStall);

      if (merchants.length === 0 && stalls.length === 0) continue;

      merchantFound = true;

      // Always paired: exactly 1 merchant and 1 stall
      expect(merchants).toHaveLength(1);
      expect(stalls).toHaveLength(1);

      // They must be cardinally adjacent
      const m = merchants[0];
      const s = stalls[0];
      const dist = Math.abs(m.x - s.x) + Math.abs(m.y - s.y);
      expect(dist).toBe(1);
    }
    expect(merchantFound).toBe(true);
  });

  it('never places merchants on floor 1', () => {
    for (let i = 0; i < 100; i++) {
      const floor = generateDungeon(1);
      const merchants = getAllPositionsByType(floor, TileType.Merchant);
      const stalls = getAllPositionsByType(floor, TileType.MerchantStall);
      expect(merchants).toHaveLength(0);
      expect(stalls).toHaveLength(0);
    }
  });

  it('merchant stall does not block hallway reachability', () => {
    for (let floorNumber = 2; floorNumber <= 10; floorNumber++) {
      for (let i = 0; i < 40; i++) {
        const floor = generateDungeon(floorNumber);
        const reachable = getReachableWithoutKey(floor);

        for (let y = 0; y < floor.height; y++) {
          for (let x = 0; x < floor.width; x++) {
            const pos = { x, y };
            const tile = floor.tiles[y][x];
            if (!isNonWall(tile)) continue;
            if (tile.type === TileType.MerchantStall) continue;

            if (isStraightHallwayTile(floor, pos)) {
              expect(reachable.has(keyOf(pos))).toBe(true);
            }
          }
        }
      }
    }
  });
```

**Important:** Also update the existing `getReachableWithoutKey` test helper in the test file to include `MerchantStall` as impassable, matching the generator:

In the test file's `getReachableWithoutKey` function (~line 59), change:

```typescript
// Before:
if (tile.type === TileType.Wall || tile.type === TileType.Chest) continue;

// After:
if (tile.type === TileType.Wall || tile.type === TileType.Chest || tile.type === TileType.MerchantStall) continue;
```

**Step 2: Run the tests**

Run: `npx vitest run client/src/test/melody-dungeon-generator.test.ts --reporter=verbose`
Expected: All tests PASS (including the 3 new merchant tests).

**Step 3: Commit**

```bash
git add client/src/test/melody-dungeon-generator.test.ts
git commit -m "test(dungeon): add merchant placement tests"
```

---

## Task 5: Generate Sprite Assets

**Files:**
- Create: `client/public/images/melody-dungeon-merchant.png`
- Create: `client/public/images/melody-dungeon-stall.png`

**Step 1: Generate merchant and stall sprites**

Generate two pixel-art sprite images that match the existing dungeon sprite style (32x32 or 64x64, transparent background, similar aesthetic to the existing enemy/boss/chest sprites). Use an image generation tool or create simple placeholder PNGs.

- **Merchant sprite:** A friendly character figure (hooded trader, cloaked figure, or musical shopkeeper — consistent with the musical dungeon theme)
- **Stall sprite:** A small market stall, cart, or table with items displayed

Save to:
- `client/public/images/melody-dungeon-merchant.png`
- `client/public/images/melody-dungeon-stall.png`

**Step 2: Commit**

```bash
git add client/public/images/melody-dungeon-merchant.png client/public/images/melody-dungeon-stall.png
git commit -m "art(dungeon): add merchant and stall sprite assets"
```

---

## Task 6: Update DungeonGrid Renderer

**Files:**
- Modify: `client/src/components/melody-dungeon/DungeonGrid.tsx`

**Step 1: Add sprite entries to TILE_SPRITE map**

In `DungeonGrid.tsx`, add two entries to the `TILE_SPRITE` object (around line 37):

```typescript
const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon-door.png',
  [TileType.Enemy]: '/images/melody-dungeon-enemy.png',
  [TileType.Treasure]: '/images/melody-dungeon-treasure.png',
  [TileType.Chest]: '/images/melody-dungeon-chest.png',
  [TileType.Stairs]: '/images/melody-dungeon-stairs.png',
  [TileType.Dragon]: '/images/melody-dungeon-boss.png',
  [TileType.Merchant]: '/images/melody-dungeon-merchant.png',
  [TileType.MerchantStall]: '/images/melody-dungeon-stall.png',
};
```

**Step 2: Ensure MerchantStall renders as a solid tile and Merchant has float animation**

In the rendering logic (~line 80-110), update:

- The `isFloorLike` check should NOT include `Merchant` or `MerchantStall` — they should use the non-cleared floor color (same as enemies/chests)
- The `fullTileSprite` check (for tiles that fill the cell with no padding): add `MerchantStall`:

```typescript
const fullTileSprite =
  tile.type === TileType.Door || tile.type === TileType.Stairs || tile.type === TileType.MerchantStall;
```

- The merchant character should have the float animation like enemies:

```typescript
const isEnemy =
  tile.type === TileType.Enemy || tile.type === TileType.Dragon;
const isAnimated = isEnemy || tile.type === TileType.Merchant;
```

Then update the img className and style to use `isAnimated` instead of `isEnemy`:

```typescript
className={`w-full h-full object-contain ${isAnimated ? 'animate-sprite-float' : ''}`}
style={isAnimated ? { animationDelay: `${((x * 7 + y * 13) % 10) * 0.24}s` } : undefined}
```

**Step 3: Mark Merchant tiles as never "cleared"**

The existing `cleared` logic already handles this — merchant tiles don't have `cleared` set, and the sprite rendering checks `!cleared`. Since we never set `cleared` on merchant tiles, they'll always render their sprites. No change needed here.

**Step 4: Commit**

```bash
git add client/src/components/melody-dungeon/DungeonGrid.tsx
git commit -m "feat(dungeon): render merchant and stall sprites in dungeon grid"
```

---

## Task 7: Update HUD with Shield Charm

**Files:**
- Modify: `client/src/components/melody-dungeon/HUD.tsx`

**Step 1: Add shield charm indicator**

In `HUD.tsx`, add a shield charm display in the items row (after the potions span, around line 41):

```typescript
{player.shieldCharm > 0 && (
  <span className="flex items-center gap-0.5 text-cyan-400" title="Shield Charm">
    {'\uD83D\uDEE1\uFE0F'} 1
  </span>
)}
```

**Step 2: Commit**

```bash
git add client/src/components/melody-dungeon/HUD.tsx
git commit -m "feat(dungeon): show shield charm indicator in HUD"
```

---

## Task 8: Create MerchantModal Component

**Files:**
- Create: `client/src/components/melody-dungeon/MerchantModal.tsx`

**Step 1: Create the MerchantModal component**

Create `client/src/components/melody-dungeon/MerchantModal.tsx`:

```tsx
import React from 'react';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';
import { MERCHANT_ITEMS, getMerchantPrice } from '@/lib/gameLogic/merchantItems';
import type { MerchantItem } from '@/lib/gameLogic/merchantItems';

interface Props {
  player: PlayerState;
  floorNumber: number;
  onBuy: (updatedPlayer: PlayerState) => void;
  onClose: () => void;
}

const MerchantModal: React.FC<Props> = ({ player, floorNumber, onBuy, onClose }) => {
  const handleBuy = (item: MerchantItem) => {
    const price = item.getPrice(floorNumber);
    if (player.score < price || !item.canBuy(player)) return;
    onBuy(getMerchantPrice(player, item, floorNumber));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Wandering Merchant
        </h2>
        <p className="text-center text-emerald-400/70 text-xs mb-4 italic">
          &quot;What catches your eye?&quot;
        </p>

        <div className="flex justify-center mb-4">
          <span className="text-amber-400 font-bold text-lg">
            {'\u2B50'} {player.score} pts
          </span>
        </div>

        <div className="grid gap-2 mb-4">
          {MERCHANT_ITEMS.map((item) => {
            const price = item.getPrice(floorNumber);
            const canAfford = player.score >= price;
            const canBuy = canAfford && item.canBuy(player);

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  canBuy
                    ? 'border-emerald-700 bg-emerald-950/50'
                    : 'border-gray-700 bg-gray-900/50 opacity-60'
                }`}
              >
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canBuy}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    canBuy
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {price} pts
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-sm transition-colors"
        >
          Leave Shop
        </button>
      </div>
    </div>
  );
};

export default MerchantModal;
```

**Step 2: Commit**

```bash
git add client/src/components/melody-dungeon/MerchantModal.tsx
git commit -m "feat(dungeon): create MerchantModal shop UI component"
```

---

## Task 9: Integrate Merchant into Main Game Loop

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Import MerchantModal**

Add to the imports at the top of `MelodyDungeonGame.tsx`:

```typescript
import MerchantModal from './MerchantModal';
```

**Step 2: Initialize `shieldCharm` in `createPlayer`**

Update the `createPlayer` function:

```typescript
function createPlayer(start: Position): PlayerState {
  return {
    position: { ...start },
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    score: 0,
    keys: 0,
    potions: 0,
    streak: 0,
    shieldCharm: 0,
  };
}
```

**Step 3: Handle Merchant tile in `handleMove`**

In the `handleMove` callback, add a new case **before** the stairs check (after the Enemy/Dragon/Treasure block, around line 224). Insert:

```typescript
        // Merchant: open the shop (no challenge, not cleared)
        if (tile.type === TileType.Merchant) {
          setFloor((f) => moveEnemies(updateVisibility(f, newPos), newPos));
          moveLockedRef.current = true;
          setPhase('shopping');
          return { ...prev, position: newPos };
        }
```

**Step 4: Add `handleMerchantBuy` and `handleMerchantClose` callbacks**

Add after the `handleChallengeResult` callback:

```typescript
  const handleMerchantBuy = useCallback((updatedPlayer: PlayerState) => {
    setPlayer(updatedPlayer);
  }, []);

  const handleMerchantClose = useCallback(() => {
    moveLockedRef.current = false;
    setPhase('playing');
  }, []);
```

**Step 5: Add shield charm logic to `handleChallengeResult`**

In `handleChallengeResult`, in the `else` branch where the player answers wrong (around line 267), update to check for shield charm:

```typescript
        } else {
          // Doors allow unlimited attempts: wrong answers do not punish health.
          if (activeTileType !== TileType.Door) {
            if (prev.shieldCharm > 0) {
              updated.shieldCharm = 0;
            } else {
              updated.health = Math.max(0, prev.health - 1);
            }
            updated.streak = 0;
          }
        }
```

**Step 6: Render MerchantModal in the playing view**

In the JSX return for the playing phase (at the bottom of the component), add the MerchantModal alongside the ChallengeModal (after line ~596):

```tsx
      {phase === 'shopping' && (
        <MerchantModal
          player={player}
          floorNumber={floorNumber}
          onBuy={handleMerchantBuy}
          onClose={handleMerchantClose}
        />
      )}
```

**Step 7: Ensure keyboard input doesn't trigger during shopping**

The existing keyboard handler already checks `if (phase !== 'playing') return;` (line 99), so keyboard movement is blocked during shopping. No change needed.

**Step 8: Ensure the `'shopping'` phase renders the game view (not a separate screen)**

The current component renders screens for `menu`, `gameOver`, `victory`, and `floorComplete` as early returns. The `playing` phase and `challenge` phase fall through to the main game view. We need `shopping` to also fall through to the game view.

The existing code structure already handles this — `shopping` is not one of the early-return phases, so it renders the main game layout. However, the MobileDPad disabled check needs updating:

```typescript
// Before:
disabled={phase !== 'playing'}

// This already works — DPad is disabled during shopping, which is correct.
```

**Step 9: Run all tests**

Run: `npx vitest run --reporter=verbose`
Expected: All tests PASS.

**Step 10: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat(dungeon): integrate merchant shop, shield charm, and shopping phase"
```

---

## Task 10: Manual Testing Checklist

**Step 1: Start the dev server**

Run: `npx vite dev`

**Step 2: Verify the following in-browser:**

- [ ] Start a new game on floor 2+. Explore until you find a merchant (may need to try multiple floors due to 40% spawn rate)
- [ ] The merchant and stall render as two adjacent tiles with sprites
- [ ] Walking onto the merchant tile opens the shop modal
- [ ] The shop shows 4 items with correct floor-scaled prices
- [ ] Buying an item deducts score and grants the item (check HUD updates)
- [ ] Items you can't afford have disabled buy buttons
- [ ] Shield charm shows in HUD when purchased, and the buy button is disabled for a second one
- [ ] Closing the shop returns to normal gameplay
- [ ] You can re-enter the shop by walking back to the merchant
- [ ] The merchant stall tile is impassable (can't walk through it)
- [ ] Getting a wrong answer with a shield charm consumes the charm instead of HP
- [ ] The merchant does not move when other enemies move
- [ ] Floor 1 never has a merchant
- [ ] Existing gameplay (enemies, dragons, doors, chests, stairs) still works normally

**Step 3: Run the full test suite one final time**

Run: `npx vitest run --reporter=verbose`
Expected: All tests PASS.

**Step 4: Final commit (if any manual fixes were needed)**

```bash
git add -A
git commit -m "fix(dungeon): address merchant integration issues from manual testing"
```
