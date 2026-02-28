# Enemy Types & Levels Design

## Goal

Expand the Melody Dungeon enemy system from a single generic enemy tile into a typed, leveled system. Rename the current enemy as "Ghost" and introduce Skeleton, Goblin, and Dragon as named subtypes. Each type has a themed challenge pool and unique flavor; levels scale HP with floor depth.

## Enemy Roster

| Subtype | Challenge Pool | Appears On | Behavior |
|---------|---------------|-----------|---------|
| Ghost | `noteReading` | Floor 1+ | Patrolling |
| Skeleton | `rhythmTap` | Floor 6+ | Patrolling |
| Dragon | All floor types | Floor 3+ | Guarding chests → chasing |
| Goblin | `interval` | Floor 11+ | Patrolling |

Enemy types align with the existing challenge type unlock schedule (`getChallengeTypesForFloor`), so each new enemy type introduces itself alongside its challenge type.

## Level System

Ghost, Skeleton, and Goblin have levels 1–3. Level determines HP (number of questions to defeat). Dragon is always 3 HP — level does not apply.

| Level | HP | Fight Format |
|-------|----|-------------|
| 1 | 1 HP | Single question, immediate result (current behavior) |
| 2 | 2 HP | Multi-round fight via BossBattle component |
| 3 | 3 HP | Multi-round fight via BossBattle component |

### Floor Scaling Formula

```
maxLevel = min(3, floor((floorNumber - 1) / 5) + 1)
minLevel = max(1, maxLevel - 1)
enemyLevel = random(minLevel, maxLevel)
```

Results:
- Floors 1–5: always level 1
- Floors 6–10: mix of level 1 and 2
- Floor 11+: mix of level 2 and 3 (level 1 phases out)

## Architecture

### Approach: Keep `TileType.Enemy`, add subtype + level fields to Tile

`TileType` describes the *category* of encounter (enemy, boss, door, etc.). Subtype and level are *data* on the tile — consistent with how `challengeType` is already stored on the tile rather than encoded in the TileType enum.

`TileType.Dragon` is **removed**. Dragons become `TileType.Enemy` with `enemySubtype: 'dragon'`.

### New Types (`dungeonTypes.ts`)

```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin';

// Added to Tile interface:
enemySubtype?: EnemySubtype;
enemyLevel?: number; // 1 | 2 | 3 (undefined for non-enemy tiles)
```

### Files Changed

**`dungeonTypes.ts`**
- Add `EnemySubtype` type
- Add `enemySubtype?: EnemySubtype` and `enemyLevel?: number` to `Tile` interface
- Remove `TileType.Dragon`

**`dungeonGenerator.ts`**
- Enemy placement: assign `enemySubtype` based on floor (ghost floor 1+, skeleton floor 6+, goblin floor 11+), pick randomly from available subtypes; assign `enemyLevel` using the floor scaling formula
- Dragon placement: use `TileType.Enemy` + `{ enemySubtype: 'dragon', enemyLevel: 3 }`
- `moveEnemies`: branch on `tile.enemySubtype === 'dragon'` instead of `tile.type === TileType.Dragon`
- Boss floor guard: already uses `if (!bossType)` — no change needed

**`DungeonGrid.tsx`**
- Sprite lookup uses `enemySubtype` for `TileType.Enemy` tiles
- Add `TILE_SPRITE` entries: ghost, skeleton, dragon, goblin
- `isEnemy` animation check: unchanged (still `TileType.Enemy`)

**`ChallengeModal.tsx`**
- Add `enemySubtype?: EnemySubtype` and `enemyLevel?: number` props to `Props` and `BossBattle`
- `isMultiRound` replaces `isBoss` for triggering `BossBattle`: includes level 2+ enemies
- Battle title shows enemy subtype name (e.g. "Ghost Encounter!", "Skeleton Battle!")
- `BossBattle` HP: use `enemyLevel` directly for regular enemies; existing `getBossHp()` for Dragon/MiniBoss/BigBoss

**`MelodyDungeonGame.tsx`**
- Encounter detection: remove `TileType.Dragon` references, use `TileType.Enemy`
- Dragon reward logic: check `tile.enemySubtype === 'dragon'`
- Patrol enemy rewards scale by `enemyLevel` (see Rewards section)
- Pass `enemySubtype` and `enemyLevel` to `ChallengeModal`

**New sprite files** (placeholders)
- `client/public/images/melody-dungeon-ghost.png`
- `client/public/images/melody-dungeon-skeleton.png`
- `client/public/images/melody-dungeon-goblin.png`
- `client/public/images/melody-dungeon-dragon.png` (rename from boss.png)

## Rewards

| Enemy | HP | Score | Keys | Extra |
|-------|-----|-------|------|-------|
| Ghost / Skeleton / Goblin — Level 1 | 1 | +100 | +1 | — |
| Ghost / Skeleton / Goblin — Level 2 | 2 | +175 | +1 | — |
| Ghost / Skeleton / Goblin — Level 3 | 3 | +250 | +2 | — |
| Dragon | 3 | +500 | +2 | +1 health, +1 potion |

Streak bonus applies to all enemies: `floor(streak / 3) * 25`.

## Out of Scope

- Enemy-specific movement patterns beyond Dragon (all patrol enemies use existing patrolling logic)
- Visual animations per enemy type (sprites are static placeholders to start)
- Enemy levels for Dragon (always 3 HP)
- Boss enemy types (MiniBoss/BigBoss are unchanged)
