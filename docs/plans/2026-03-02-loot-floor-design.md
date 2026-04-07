# Loot Floor Design

## Overview

A rare special floor type with a 1% chance of appearing that replaces all interactive tiles (enemies, doors, merchants, chests, dragon) with treasure piles. The player answers music questions for gold, keys, and potions with no combat risk beyond wrong-answer penalties.

## Eligibility

- Floor must be >= 3 (floors 1-2 are tutorial/intro)
- Floor must not be a boss floor (multiples of 5)
- Floor must not be the dev room (floor 0)
- 1% random chance: `floorNumber >= 3 && floorNumber % 5 !== 0 && Math.random() < 0.01`

## Data Model

Add `isLootFloor: boolean` to the `DungeonFloor` interface. Set once during `generateDungeon`, read by rendering and UI code.

## Generation (Approach 1: Loot Flag)

In `generateDungeon`, after room/corridor/player-start/stairs placement:

1. Roll the loot floor check
2. If loot floor: skip chest, dragon, enemy, door, merchant, and normal treasure placement steps
3. Instead call `placeLootTreasure(grid, rooms, playerStart, stairsPos, floorNumber)` which places 15-20 treasure tiles on valid floor positions using `pickRandomFloorTile` with min distance 2 from player start
4. Each treasure gets a `challengeType` via `rollChallengeType(floorNumber)`
5. If not loot floor: existing generation proceeds unchanged

## Visual Treatment

- **Golden theme override**: When `isLootFloor` is true, override floor theme colors with golden tints (floor → warm gold, border → golden). Walls keep the normal theme.
- **Announcement banner**: Show a "Loot Floor!" text with golden styling when the floor loads, either in the `floorComplete` transition screen or as a brief overlay.

## Rewards

Treasure tiles function identically to normal treasure:
- Correct: +50 gold (+ streak bonus), 40% key chance, +1 potion
- Wrong: -1 health (or shield absorb), streak resets
- Treasure Magnet buff applies normally
- No special multipliers — 15-20 piles instead of 0-1 is the reward

## Edge Cases

- Dev room (floor 0): never a loot floor
- Boss floors (multiples of 5): never a loot floor
- Floors 1-2: never a loot floor
- Fog of war: unchanged, player discovers piles as they explore
- Enemy movement: no enemies means `moveEnemies` is a no-op

## Files to Modify

1. `dungeonTypes.ts` — Add `isLootFloor` to `DungeonFloor`
2. `dungeonGenerator.ts` — Loot floor roll, `placeLootTreasure()`, conditional skip of entity placement
3. `DungeonGrid.tsx` — Golden theme color overrides when `isLootFloor`
4. `MelodyDungeonGame.tsx` — "Loot Floor!" announcement banner
