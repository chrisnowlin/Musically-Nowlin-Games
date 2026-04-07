# Merchant System Design — Melody Dungeon

## Overview

Add a merchant character that appears as an optional encounter on some dungeon floors. Players can trade their score points for consumable items, creating a points sink that gives score strategic value beyond high-score tracking.

## Tile Types & Generation

Two new `TileType` entries: `Merchant` (interactive) and `MerchantStall` (decorative/impassable).

- Merchants spawn on ~40% of floors (randomized), never on floor 1
- The generator places the MerchantStall first in an open room area (using `isOpenEnough`), then the Merchant on an adjacent cardinal floor tile
- Mirrors the existing dragon-adjacent-to-chest placement pattern
- Placed after chests/dragons but before enemies in generation order
- The stall is impassable (like a wall); the merchant tile is walkable/interactive
- The merchant does not move and is never cleared — revisitable on the same floor

## Merchant Inventory & Pricing

Consumables only. Prices scale linearly with floor depth.

| Item | Description | Price Formula |
|------|-------------|---------------|
| Potion | Restores 1 HP | `150 + (floor * 10)` |
| Key | Opens one chest | `200 + (floor * 15)` |
| 3 Potions (bundle) | Bulk heal | `400 + (floor * 25)` |
| Shield Charm | Blocks next wrong-answer damage (1 use, max 1 held) | `300 + (floor * 20)` |

### Shield Charm mechanics

- Stored as `shieldCharm: number` (0 or 1) in `PlayerState`
- Automatically consumed when the player answers incorrectly on Enemy/Dragon/Treasure tiles (the ones that normally cost HP)
- Max stack of 1 — buy button disabled if already held
- HUD displays a shield icon when held

## Interaction Flow

1. Player steps on Merchant tile
2. Movement locks (`moveLockedRef`)
3. Game phase becomes `'shopping'`
4. `MerchantModal` opens with green/gold theme
5. Modal shows: merchant greeting, player's current score, item grid with prices and Buy buttons
6. Buy buttons disabled when player can't afford or at max capacity
7. Purchases update score/inventory instantly
8. "Leave Shop" button returns to `'playing'` phase
9. Merchant tile is NOT cleared — player can revisit

## Data Model Changes

### dungeonTypes.ts
- `TileType`: add `Merchant = 'merchant'`, `MerchantStall = 'merchantStall'`
- `GamePhase`: add `'shopping'`
- `PlayerState`: add `shieldCharm: number`

### New types
```typescript
interface MerchantItem {
  id: string;
  name: string;
  description: string;
  getPrice: (floor: number) => number;
  canBuy: (player: PlayerState) => boolean;
  apply: (player: PlayerState) => PlayerState;
}
```

## Impact on Existing Systems

- **moveEnemies**: No changes needed — only iterates Enemy/Dragon tiles
- **getReachableWithoutKey**: MerchantStall treated as impassable (added to BFS blockers)
- **handleChallengeResult**: Shield charm check — if player has charm and answers wrong on damageable tile, consume charm instead of HP
- **DungeonGrid**: Two new TILE_SPRITE entries
- **HUD**: Shield charm indicator
- **createPlayer**: Initialize `shieldCharm: 0`

## Files Touched

1. `dungeonTypes.ts` — types, enums, player state
2. `dungeonGenerator.ts` — merchant pair placement
3. `MelodyDungeonGame.tsx` — shopping phase, merchant tile interaction, shield charm in challenge result
4. `DungeonGrid.tsx` — sprite map entries
5. `HUD.tsx` — shield charm display
6. `MerchantModal.tsx` — new component (shop UI)
7. `merchantItems.ts` — new file (item catalog and pricing)
