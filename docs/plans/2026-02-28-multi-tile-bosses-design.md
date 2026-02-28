# Multi-Tile Boss Footprints — Design

**Date:** 2026-02-28
**Status:** Approved

## Overview

Mini-boss enemies occupy a 2×2 tile footprint. Big-boss enemies occupy a 3×3 tile footprint. Bosses are solid obstacles — the player cannot walk into any tile of the footprint. The boss sprite visually spans the entire footprint as a single large image.

## Approach

Anchor + BossBody tile model. The top-left tile of the footprint holds the `MiniBoss` or `BigBoss` type with all challenge/cleared data. The remaining N×N-1 tiles hold a new `TileType.BossBody` with no challenge data — pure spatial placeholders.

## Files Changed

### `dungeonTypes.ts`
- Add `TileType.BossBody = 'bossBody'`

### `dungeonGenerator.ts`
- After picking boss anchor position (centered in boss arena), place footprint tiles:
  - **MiniBoss (2×2):** Anchor = `center - {0,0}`. Mark `{0,0},{1,0},{0,1},{1,1}` offsets — anchor gets `MiniBoss`, others get `BossBody`.
  - **BigBoss (3×3):** Anchor = `center - {1,1}`. Mark all 9 offsets — anchor gets `BigBoss`, 8 others get `BossBody`.
- Add all footprint positions to `placedPositions` exclusion list.
- Boss arena room minimum is 7×7 (already enforced), fits 3×3 with 2 walkable tiles on each side.

### `DungeonGrid.tsx`
- `BossBody` tiles render as plain floor (no sprite — not in `TILE_SPRITE`).
- Grid container gets `position: relative`.
- After tile loop, render one absolutely positioned `<img>` per visible boss anchor:
  - `left = (vx / viewportSize) * 100%`
  - `top = (vy / viewportSize) * 100%`
  - `width = height = (bossSize / viewportSize) * 100%` (bossSize = 2 or 3)
  - Fog applied via `opacity` from anchor tile's visibility.
  - z-index above tiles, below HUD.

### `MelodyDungeonGame.tsx`
- Movement blocking: add `TileType.BossBody` to the set of impassable tile types.
- Encounter trigger: when player steps adjacent to `MiniBoss`, `BigBoss`, or `BossBody`, find the anchor tile (search footprint for `MiniBoss`/`BigBoss` type) and use its challenge/cleared data.
- Challenge cleared: only anchor tile's `cleared` is set to `true`. Win condition checks on `MiniBoss`/`BigBoss` type are unchanged.

## Non-Goals

- No changes to `moveEnemies` (boss tiles are never `TileType.Enemy`).
- No changes to challenge types or difficulty scaling.
- No changes to MiniMap (renders from tile types; BossBody shows as floor which is fine).
