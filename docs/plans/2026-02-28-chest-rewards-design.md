# Chest Rewards & Treasure Rarity Design

Date: 2026-02-28

## Goal

- Make treasure less common (currently guaranteed 1–2 per floor)
- Give chests a weighted loot table that can drop merchant items, not just potions
- Add a popup modal showing what the player received from a chest

---

## Changes

### 1. Treasure Rarity (`dungeonGenerator.ts`)

Change `const treasureCount = rand(1, 2)` to `const treasureCount = rand(0, 1)`.

Treasure becomes a pleasant surprise rather than a guarantee.

### 2. Chest Loot Table (`merchantItems.ts`)

Add a `CHEST_LOOT_ITEMS` export: all SPECIAL_ITEMS plus CORE_ITEMS excluding `key` and `potion-bundle`.

Add a `rollChestReward(floorNumber)` function that returns a tagged union:
```ts
type ChestReward =
  | { kind: 'potion' }
  | { kind: 'item'; item: MerchantItem };
```

Weighted draw:
- 65% → `{ kind: 'potion' }`
- 20% → random SPECIAL_ITEM
- 15% → random CORE_ITEM (potion or shield charm)

### 3. Chest Opening Logic (`MelodyDungeonGame.tsx`)

Replace the inline chest reward with:
1. Call `rollChestReward(floorNumber)` to determine the reward
2. Apply base rewards (+200 score, +1 HP) plus the rolled reward
3. Store the reward in a `pendingChestReward` state variable
4. Set phase to `'chestReward'` to show the popup (or use a separate flag)

### 4. `ChestRewardModal` component

New file: `client/src/components/melody-dungeon/ChestRewardModal.tsx`

Props:
```ts
interface Props {
  reward: ChestReward;
  onClose: () => void;
}
```

Display:
- Header: "Chest Opened!"
- Reward row: emoji + name + description
- For `kind: 'potion'`: show 🧪 Potion / "Restores 1 HP"
- "Continue" button to dismiss

Styled to match MerchantModal (dark bg, amber/yellow border for treasure theme).

### 5. Game phase or flag

Add `pendingChestReward: ChestReward | null` to local state (not GameState — it's transient UI).
When non-null, render `<ChestRewardModal>` over the game.
On close, clear `pendingChestReward` and return phase to `'playing'`.

---

## Files Changed

| File | Change |
|---|---|
| `client/src/lib/gameLogic/merchantItems.ts` | Add `CHEST_LOOT_ITEMS`, `ChestReward` type, `rollChestReward()` |
| `client/src/lib/gameLogic/dungeonGenerator.ts` | `rand(1, 2)` → `rand(0, 1)` for treasureCount |
| `client/src/components/melody-dungeon/MelodyDungeonGame.tsx` | Use `rollChestReward`, set `pendingChestReward`, render modal |
| `client/src/components/melody-dungeon/ChestRewardModal.tsx` | New component |
