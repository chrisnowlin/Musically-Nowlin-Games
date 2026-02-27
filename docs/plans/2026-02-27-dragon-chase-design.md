# Dragon Chase Design

## Summary

When a Dragon's guarded chest is opened (stolen), the Dragon transitions from patrolling near the chest to actively chasing the player. If the Dragon catches the player, it deals 1 heart of penalty damage and forces a boss battle.

## Enemy State System

A generic `EnemyState` type is added to `dungeonTypes.ts`, usable by all enemy tile types:

```typescript
export type EnemyState = 'guarding' | 'chasing' | 'patrolling';
```

Added as an optional `enemyState` property on the `Tile` interface.

### State Meanings

- **guarding** — Tethered to a point of interest (chest). Current Dragon patrol behavior within Chebyshev distance 2.
- **chasing** — Direct pursuit of the player. Picks the cardinal direction that minimizes Manhattan distance each turn.
- **patrolling** — Random movement. Current regular enemy behavior.

### Initial States

- Dragons spawn with `enemyState: 'guarding'`
- Regular enemies spawn with `enemyState: 'patrolling'`
- Treasure tiles: no enemy state (not mobile)

## Movement Logic

In `moveEnemies` (dungeonGenerator.ts), movement is dispatched by `enemyState`:

- **guarding**: Random direction, tethered within Chebyshev distance 2 of nearest uncleared chest (current behavior).
- **chasing**: Calculate which cardinal direction most reduces Manhattan distance to player. Move there if valid. Skip walls, other enemies, doors.
- **patrolling**: Random cardinal direction movement (current behavior).

### State Transition

Before moving a Dragon each turn, check if any uncleared chests exist on the floor. If none remain, transition `guarding` -> `chasing`. This is checked every turn in `moveEnemies`.

## Dragon Catches Player

After `moveEnemies` runs (triggered by every player action), check if any Dragon tile occupies the player's position.

### On Catch

1. Player loses 1 heart immediately (theft penalty)
2. If player dies from the penalty: game over, no battle
3. Otherwise: boss battle triggered (same multi-round fight)
4. Win: Dragon cleared, game continues
5. Lose: normal loss handling (additional damage, potential game over)

### Detection Location

In `MelodyDungeonGame.tsx`, after every `moveEnemies` call, scan for Dragon-at-player-position collision.

## Chase Movement: Direct Pursuit

Same speed as player (1 tile per player turn). For each cardinal direction `[up, down, left, right]`:
1. Calculate Manhattan distance from candidate position to player
2. Pick the direction with minimum distance
3. Validate target tile is walkable and unoccupied by other enemies
4. If all directions blocked, stay put

Player can outmaneuver the Dragon by pathing around walls since there is no pathfinding — only greedy cardinal movement.

## Files Changed

| File | Changes |
|------|---------|
| `dungeonTypes.ts` | Add `EnemyState` type, add optional `enemyState` to `Tile` |
| `dungeonGenerator.ts` | Set initial `enemyState` on spawn. State-based movement dispatch. Guarding->chasing transition. Direct pursuit logic. |
| `MelodyDungeonGame.tsx` | Post-moveEnemies Dragon collision detection. 1-heart penalty. Boss battle trigger. |
