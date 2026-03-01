# Chest Rewards & Treasure Rarity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make treasure tiles rarer, add a weighted loot table to chests (65% potion / 20% special item / 15% core item), and show a popup modal when a chest is opened.

**Architecture:** Add a `ChestReward` tagged-union type and `rollChestReward()` function to `merchantItems.ts`. Update `dungeonGenerator.ts` to reduce treasure frequency. Create a `ChestRewardModal` component. Hook it all together in `MelodyDungeonGame.tsx` via a `pendingChestReward` state variable.

**Tech Stack:** React + TypeScript + Vitest. No new dependencies.

---

### Task 1: Add chest loot logic to `merchantItems.ts`

**Files:**
- Modify: `client/src/lib/gameLogic/merchantItems.ts`
- Test: `client/src/lib/gameLogic/__tests__/merchantItems.test.ts` (create)

**Step 1: Write the failing tests**

Create `client/src/lib/gameLogic/__tests__/merchantItems.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rollChestReward, CHEST_LOOT_ITEMS } from '../merchantItems';

describe('CHEST_LOOT_ITEMS', () => {
  it('excludes the key item', () => {
    expect(CHEST_LOOT_ITEMS.every((i) => i.id !== 'key')).toBe(true);
  });

  it('excludes the potion-bundle item', () => {
    expect(CHEST_LOOT_ITEMS.every((i) => i.id !== 'potion-bundle')).toBe(true);
  });
});

describe('rollChestReward', () => {
  it('returns kind potion or item', () => {
    for (let i = 0; i < 50; i++) {
      const reward = rollChestReward(1);
      expect(['potion', 'item']).toContain(reward.kind);
      if (reward.kind === 'item') {
        expect(reward.item).toBeDefined();
        expect(reward.item.id).not.toBe('key');
        expect(reward.item.id).not.toBe('potion-bundle');
      }
    }
  });

  it('statistically returns potion most of the time', () => {
    let potionCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      if (rollChestReward(1).kind === 'potion') potionCount++;
    }
    // Expect ~65% potions — allow ±5% tolerance
    expect(potionCount / runs).toBeGreaterThan(0.60);
    expect(potionCount / runs).toBeLessThan(0.70);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/cnowlin/Developer/Musically-Nowlin-Games && npm run test -- merchantItems
```

Expected: FAIL with import errors (`rollChestReward`, `CHEST_LOOT_ITEMS` not exported).

**Step 3: Add the loot logic to `merchantItems.ts`**

At the bottom of `client/src/lib/gameLogic/merchantItems.ts`, after the `MERCHANT_ITEMS` line and before the `mulberry32` function, add:

```ts
/** Items eligible for chest drops: SPECIAL_ITEMS + core items except key and potion-bundle. */
export const CHEST_LOOT_ITEMS = [
  ...SPECIAL_ITEMS,
  ...CORE_ITEMS.filter((i) => i.id !== 'key' && i.id !== 'potion-bundle'),
];

export type ChestReward =
  | { kind: 'potion' }
  | { kind: 'item'; item: MerchantItem };

/**
 * Roll a weighted chest reward:
 * 65% → potion, 20% → random SPECIAL_ITEM, 15% → random core item (potion or shield charm).
 */
export function rollChestReward(_floorNumber: number): ChestReward {
  const roll = Math.random();
  if (roll < 0.65) {
    return { kind: 'potion' };
  }
  const pool =
    roll < 0.85
      ? SPECIAL_ITEMS
      : CORE_ITEMS.filter((i) => i.id !== 'key' && i.id !== 'potion-bundle');
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { kind: 'item', item };
}
```

**Step 4: Run tests to verify they pass**

```bash
cd /Users/cnowlin/Developer/Musically-Nowlin-Games && npm run test -- merchantItems
```

Expected: All 3 tests PASS.

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/merchantItems.ts client/src/lib/gameLogic/__tests__/merchantItems.test.ts
git commit -m "feat: add ChestReward type and rollChestReward loot table to merchantItems"
```

---

### Task 2: Reduce treasure tile frequency in `dungeonGenerator.ts`

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts:525`

**Step 1: Find the treasure count line**

In `dungeonGenerator.ts`, find:
```ts
const treasureCount = rand(1, 2);
```
This is around line 525 in the `generateDungeon` function, just before the treasure placement loop.

**Step 2: Change `rand(1, 2)` to `rand(0, 1)`**

Replace:
```ts
const treasureCount = rand(1, 2);
```
with:
```ts
const treasureCount = rand(0, 1);
```

**Step 3: Verify existing tests still pass**

```bash
cd /Users/cnowlin/Developer/Musically-Nowlin-Games && npm run test -- dungeonGenerator
```

Expected: All existing tests PASS. (The treasure count change doesn't break any existing assertions — tests check structure not treasure count.)

**Step 4: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts
git commit -m "feat: reduce treasure tile frequency from 1-2 to 0-1 per floor"
```

---

### Task 3: Create `ChestRewardModal` component

**Files:**
- Create: `client/src/components/melody-dungeon/ChestRewardModal.tsx`

**Step 1: Write the component**

Create `client/src/components/melody-dungeon/ChestRewardModal.tsx`:

```tsx
import React from 'react';
import type { ChestReward } from '@/lib/gameLogic/merchantItems';

interface Props {
  reward: ChestReward;
  onClose: () => void;
}

const ChestRewardModal: React.FC<Props> = ({ reward, onClose }) => {
  const emoji = reward.kind === 'potion' ? '🧪' : reward.item.emoji;
  const name = reward.kind === 'potion' ? 'Potion' : reward.item.name;
  const description =
    reward.kind === 'potion' ? 'Restores 1 HP' : reward.item.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Chest Opened!
        </h2>
        <p className="text-center text-amber-400/70 text-xs mb-5 italic">
          You found something inside...
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-700 bg-amber-950/50 mb-5">
          <span className="text-4xl shrink-0">{emoji}</span>
          <div>
            <div className="font-semibold text-white">{name}</div>
            <div className="text-sm text-gray-400">{description}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChestRewardModal;
```

**Step 2: No test needed for this component** (it's a pure presentational component with no logic — all logic is tested in Task 1).

**Step 3: Commit**

```bash
git add client/src/components/melody-dungeon/ChestRewardModal.tsx
git commit -m "feat: add ChestRewardModal component for chest opening feedback"
```

---

### Task 4: Wire up chest rewards in `MelodyDungeonGame.tsx`

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Add the import for new exports and component**

At the top of the file, update the existing `merchantItems` import (around line 37):

```ts
// Before:
import type { MerchantItem } from '@/lib/gameLogic/merchantItems';

// After:
import type { MerchantItem } from '@/lib/gameLogic/merchantItems';
import { rollChestReward } from '@/lib/gameLogic/merchantItems';
import type { ChestReward } from '@/lib/gameLogic/merchantItems';
import ChestRewardModal from './ChestRewardModal';
```

**Step 2: Add `pendingChestReward` state**

In the component, after the `[facingLeft, setFacingLeft]` state line (around line 121), add:

```ts
const [pendingChestReward, setPendingChestReward] = useState<ChestReward | null>(null);
```

**Step 3: Replace the chest-opening reward block**

Find the chest opening block (around lines 289–312):

```ts
        // Locked chest -- requires a key, no challenge
        if (!tile.cleared && tile.type === TileType.Chest) {
          if (prev.keys <= 0) {
            // No key -- bump without moving
            return prev;
          }
          // Spend a key, open the chest, grant rewards
          setFloor((f) => {
            const tiles = f.tiles.map((row, ry) =>
              row.map((t, rx) =>
                rx === nx && ry === ny ? { ...t, cleared: true, type: TileType.Floor } : t
              )
            );
            return moveEnemiesAndDetectCatch(updateVisibility({ ...f, tiles }, newPos, getVisRadius()), newPos);
          });
          return {
            ...prev,
            position: newPos,
            keys: prev.keys - 1,
            potions: prev.potions + 1,
            score: prev.score + 200,
            health: Math.min(prev.maxHealth, prev.health + 1),
          };
        }
```

Replace it with:

```ts
        // Locked chest -- requires a key, no challenge
        if (!tile.cleared && tile.type === TileType.Chest) {
          if (prev.keys <= 0) {
            // No key -- bump without moving
            return prev;
          }
          // Spend a key, open the chest, grant rewards
          setFloor((f) => {
            const tiles = f.tiles.map((row, ry) =>
              row.map((t, rx) =>
                rx === nx && ry === ny ? { ...t, cleared: true, type: TileType.Floor } : t
              )
            );
            return moveEnemiesAndDetectCatch(updateVisibility({ ...f, tiles }, newPos, getVisRadius()), newPos);
          });
          const reward = rollChestReward(floorNumber);
          setPendingChestReward(reward);
          if (reward.kind === 'potion') {
            return {
              ...prev,
              position: newPos,
              keys: prev.keys - 1,
              potions: prev.potions + 1,
              score: prev.score + 200,
              health: Math.min(prev.maxHealth, prev.health + 1),
            };
          }
          // item reward: apply item effect + base bonus (no extra potion)
          const afterItem = reward.item.apply({
            ...prev,
            position: newPos,
            keys: prev.keys - 1,
            score: prev.score + 200,
            health: Math.min(prev.maxHealth, prev.health + 1),
          });
          return afterItem;
        }
```

**Step 4: Add the modal render**

Find where the other modals are rendered (around lines 963–977). After the `UseItemsModal` block, add:

```tsx
      {pendingChestReward && (
        <ChestRewardModal
          reward={pendingChestReward}
          onClose={() => setPendingChestReward(null)}
        />
      )}
```

**Step 5: Verify the full test suite passes**

```bash
cd /Users/cnowlin/Developer/Musically-Nowlin-Games && npm run test
```

Expected: All tests PASS.

**Step 6: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: wire ChestRewardModal and rollChestReward into chest opening flow"
```
