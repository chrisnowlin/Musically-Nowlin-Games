# Patrol Enemy Bump Behavior Design

**Date:** 2026-02-28
**Status:** Approved

## Problem

All patrol enemies (ghosts, goblins, skeletons) share an identical player-avoidance guard that prevents any of them from ever landing on the player tile during their random movement. This is correct for ghosts (they pass through) but goblins and skeletons should be able to bump into the player and trigger a challenge encounter.

## Goal

- **Ghosts** — keep the player-avoidance guard; they never bump
- **Goblins and Skeletons** — can land on the player tile during patrol, triggering a challenge modal (no HP penalty)
- **Dragon** — existing catch behavior unchanged (1 HP penalty + challenge)

## Approach: Single Generic `enemyCaughtRef` (Approach A)

Generalize the existing dragon-specific catch mechanism to cover all catching enemies. One ref, one effect, one branch for HP penalty.

## Section 1: `dungeonGenerator.ts`

In the patrol/guarding random movement block, replace the blanket player-position guard with a subtype-conditioned version:

```ts
const isPlayerTile = nx === playerPos.x && ny === playerPos.y;
if (isPlayerTile && tile.enemySubtype === 'ghost') continue;
if (!isPlayerTile && target.type !== TileType.Floor && target.type !== TileType.PlayerStart) continue;
```

Ghosts skip the player tile. Goblins and skeletons can land on it (same tile-type bypass pattern used in the dragon chase fix).

## Section 2: `MelodyDungeonGame.tsx`

- Replace `findDragonAtPosition` with `findCatchingEnemyAtPosition(floor, pos): Tile | null` — returns the tile for any uncleared enemy on the player position
- Rename `dragonCaughtRef` → `enemyCaughtRef`, typed as `{ challengeType: ChallengeType; subtype: EnemySubtype; level: number } | false`
- Update `moveEnemiesAndDetectCatch` to call the new function and store full tile info
- Update the catch effect: apply 1 HP penalty only for dragon; open challenge modal directly for goblin/skeleton

## Section 3: Testing

New tests in `dungeonGenerator.test.ts`:

1. **Goblin lands on player tile when adjacent** — goblin at x=1, player at x=0 → goblin ends at x=0
2. **Skeleton lands on player tile when adjacent** — skeleton at x=1, player at x=0 → skeleton ends at x=0
3. **Ghost does NOT land on player tile when adjacent** — ghost at x=1, player at x=0 → ghost never at x=0

Existing dragon catch test and tether tests unchanged.
