# Melody Dungeon Special Floor Types

**Date:** 2026-03-03  
**Feature:** Three new special floor types with 1% spawn chance each  
**Status:** ✅ COMPLETED

## Overview

Add three new special floor types to Melody Dungeon, each with a 1% chance to appear on eligible floors (>= 3, non-boss). These floors offer unique gameplay experiences and rewards.

## Current State

- **Loot Floor:** 1% chance on floors >= 3 (non-boss), contains 15-20 treasure piles, no enemies/doors/merchants/chests
- Tracked via `specialFloorType: 'loot'` on `DungeonFloor` (replaced boolean `isLootFloor`)

## Implemented Changes

### Refactored: Floor Type Enum

Replaced the boolean `isLootFloor` with a floor type enum:

```typescript
export type SpecialFloorType = 
  | 'normal'      // Regular dungeon floor
  | 'loot'        // Treasure room (existing)
  | 'healing'     // Healing sanctuary (new)
  | 'fortune'     // Fortune teller room (new)
  | 'challenge';  // Combat challenge room (new)
```

### Spawn Mechanics

Each special floor type rolls independently with 1% chance:
- Floor must be >= 3
- Floor must not be a boss floor (multiples of 5)
- Only one special floor type can appear per floor
- Priority order if multiple roll: healing > loot > fortune > challenge

---

## 1. Healing Sanctuary ✅

### Concept
A peaceful room with mystical healing fountains and potion shrines. The player can recover health and stock up on potions without combat.

### Visual Theme
- Glowing blue/cyan healing pools
- Soft ambient particles
- Calm, ethereal atmosphere

### Generation
- **Floor tiles:** Open room layout (fewer walls)
- **Healing pools:** 3-5 tiles with `TileType.HealingPool`
- **Potion shrines:** 2-3 tiles with `TileType.PotionShrine`
- **No:** enemies, doors, chests, merchants

### Mechanics

**Healing Pool (`TileType.HealingPool`):**
- Stepping on tile restores 1 HP (if not at max)
- Tile disappears after use (becomes Floor)
- Visual: Glowing blue pool with sparkles
- Sound: E5 → G5 ascending notes

**Potion Shrine (`TileType.PotionShrine`):**
- Stepping on tile grants 1 potion
- Tile disappears after use (becomes Floor)
- Max potions still capped at player's potion limit
- Visual: Pedestal with glowing potion bottle
- Sound: A4 → C5 ascending notes

### Rewards
- 3-5 HP restored (if missing)
- 2-3 potions collected
- Zero risk, pure reward

### Player Experience
- "A peaceful sanctuary. The healing waters restore your strength."
- Provides a breather after tough floors
- Helps players recover before boss floors

---

## 2. Fortune Room ✅

### Concept
A mystical room with a fortune teller offering games of chance. Players can risk their gold for potentially massive rewards—or lose it all.

### Visual Theme
- Dim lighting with purple/mystical accents
- Crystal ball motifs
- Mysterious fortune teller NPC

### Generation
- **Floor tiles:** Open room with central fortune table
- **Fortune Teller:** 1 tile with `TileType.FortuneTeller`
- **No:** enemies, doors, chests, merchants

### Mechanics

**Fortune Teller NPC (`TileType.FortuneTeller`):**
- Interacting opens a fortune modal
- Player chooses a bet amount (10/25/50/100 gold or "All In")
- Three games available:

**Game 1: Coin Flip (50/50)**
- Heads: Double your bet
- Tails: Lose your bet

**Game 2: High/Low (Higher risk, higher reward)**
- Dealer shows a card (1-10)
- Player guesses if next card is higher or lower
- Correct: 1.5x bet
- Wrong: Lose bet
- Tie: Push (no gain/loss)

**Game 3: Lucky Number (High variance)**
- Pick a number 1-6
- Roll a d6
- Match: 5x bet
- No match: Lose bet

### Risk/Reward Balance
- Expected value slightly negative (house edge ~5%)
- High variance creates excitement
- "All In" option for thrill-seekers

### Safeguards
- Minimum bet: 10 gold
- Cannot bet more than current gold
- Modal shows current gold and potential outcomes
- Can leave without betting

### Player Experience
- "A shadowy figure offers you a game of chance..."
- Adds tension and player agency
- High stakes for risk-tolerant players

---

## 3. Challenge Arena ✅

### Concept
A combat arena filled with enemies. High risk, but clearing it yields exceptional rewards including bonus gold and keys.

### Visual Theme
- Arena-style open floor
- Torchlit battleground
- Victory chest at the center

### Generation
- **Floor tiles:** Large open arena (single room)
- **Enemies:** 6-8 enemies (double normal count)
- **Arena Chest:** 1 tile with `TileType.ArenaChest` at center
- **No:** regular doors, regular chests, merchants

### Enemy Composition
- Mix of all available enemy types for the floor level
- Includes at least 1 dragon if floor >= 3
- Enemies start in "guarding" state around the arena

### Mechanics

**Arena Chest (`TileType.ArenaChest`):**
- Locked until all enemies defeated
- Contains guaranteed rewards:
  - 100 gold
  - 1 key
  - 1 potion
- Unlocks and becomes Stairs when all enemies cleared

**Challenge Rules:**
- Player must defeat ALL enemies to unlock chest
- Cannot leave floor until challenge complete (stairs blocked)
- No retreat—full commitment required

### Visual Indicators
- Arena chest shows locked state
- Stairs appear when all enemies defeated
- Victory fanfare when last enemy falls

### Rewards
- Standard enemy rewards (gold, keys, score)
- Bonus arena chest with guaranteed loot
- Higher score multiplier for the floor

### Player Experience
- "An arena of champions. Defeat all enemies to claim the legendary chest!"
- Optional challenge (player chose to enter)
- Feels like an achievement when completed

---

## Implementation Details ✅

### Phase 1: Type System Updates ✅

**File:** `dungeonTypes.ts`
```typescript
export type SpecialFloorType = 'normal' | 'loot' | 'healing' | 'fortune' | 'challenge';

// Updated DungeonFloor
export interface DungeonFloor {
  // ... existing fields
  specialFloorType: SpecialFloorType; // replaced isLootFloor
}

// New tile types
export enum TileType {
  // ... existing types
  HealingPool = 'healingPool',
  PotionShrine = 'potionShrine',
  FortuneTeller = 'fortuneTeller',
  ArenaChest = 'arenaChest',
}
```

### Phase 2: Generator Updates ✅

**File:** `dungeonGenerator.ts`

```typescript
export function rollSpecialFloorType(floorNumber: number): SpecialFloorType {
  if (floorNumber < 3) return 'normal';
  if (floorNumber % 5 === 0) return 'normal';
  
  // Each type has 1% chance, priority order prevents conflicts
  if (Math.random() < 0.01) return 'healing';
  if (Math.random() < 0.01) return 'loot';
  if (Math.random() < 0.01) return 'fortune';
  if (Math.random() < 0.01) return 'challenge';
  
  return 'normal';
}

// Added generation functions:
// - placeHealingPools()
// - placeFortuneTeller()
// - placeChallengeEnemies()
// - placeArenaChest()
```

### Phase 3: Interaction Handlers ✅

**File:** `MelodyDungeonGame.tsx`

```typescript
// HealingPool: restore 1 HP and disappear
// PotionShrine: grant 1 potion and disappear
// FortuneTeller: open fortune modal
// ArenaChest: locked until all enemies defeated, then grants rewards
```

### Phase 4: UI Components ✅

**New Components:**
- `FortuneModal.tsx` - Fortune games interface with 3 game types
- Updated `SpecialFloorBanner` - Shows unique banner for each type
- Updated `DevToolbar` - Quick access buttons for all special floors

### Phase 5: Visual Assets ✅

**New Tile Sprites:**
- `/images/melody-dungeon/healing-pool.png`
- `/images/melody-dungeon/potion-shrine.png`
- `/images/melody-dungeon/fortune-teller.png`
- `/images/melody-dungeon/arena-chest.png`

---

## Balance Considerations

### Spawn Rates
- 4% total chance of special floor (1% each × 4 types)
- On a 100-floor run, expect ~4 special floors
- Keeps them rare but memorable

### Reward Scaling
| Floor Type | Risk Level | Average Reward |
|------------|-----------|----------------|
| Healing    | None      | ~3 HP + 2 potions |
| Loot       | None      | ~17 treasure pickups |
| Fortune    | Variable  | -5% to +500% gold |
| Challenge  | High      | ~8 enemy rewards + 100 gold + 1 key + 1 potion |

### Player Choice
- Special floors are rolled, not chosen
- Fortune and Challenge can be skipped (don't interact)
- Healing and Loot are pure benefit

---

## Testing Strategy ✅

### Unit Tests
- `rollSpecialFloorType()` distribution
- Each floor type generates correct tile counts
- Arena chest unlocks when all enemies defeated
- Fortune games have correct odds

### Integration Tests
- Special floors appear on eligible floors
- No special floors on boss floors
- Only one special type per floor
- All tile interactions work correctly

---

## Dev Room Access ✅

All special floor types accessible via DevToolbar:
- 💰 Loot Floor button
- 🧪 Healing Sanctuary button
- 🔮 Fortune Room button
- ⚔️ Challenge Arena button

---

## Success Criteria ✅

✓ All four special floor types spawn correctly at ~1% rate  
✓ Healing floor restores HP and grants potions  
✓ Fortune floor offers 3 games with fair odds  
✓ Challenge floor locks until all enemies defeated  
✓ Arena chest provides meaningful rewards  
✓ UI clearly communicates special floor mechanics  
✓ No regressions in normal floor generation  
✓ Build succeeds without errors  
✓ Dev room provides access to all special floors  
