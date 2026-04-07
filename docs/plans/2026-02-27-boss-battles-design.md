# Boss Battle System Design

## Goal

Add mini boss and big boss encounters at regular floor intervals in Melody Dungeon. Mini bosses appear every 5 floors, big bosses every 10 floors. Both block the stairs in a dedicated boss room and must be defeated to progress. Big bosses serve as difficulty transitions by previewing the next tier of questions.

## Boss Schedule

- **Mini Boss:** Floors 5, 15, 25, 35, 45, 55, 65, 75, 85, 95
- **Big Boss:** Floors 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
- Big boss takes priority on overlapping floors (multiples of 10)

Helper: `getBossType(floorNumber)` returns `'big' | 'mini' | null`.

## Types & Data Model

Two new tile types: `TileType.MiniBoss` and `TileType.BigBoss`.

No new tile properties needed. HP, rewards, and question pools are derived from the tile type. Bosses are stationary (no `enemyState` needed).

Constants:
- `MINI_BOSS_HP = 5`
- `BIG_BOSS_HP = 8`

## Dungeon Generation on Boss Floors

When `generateDungeon` detects a boss floor:

1. **No enemies or dragons** spawn on the floor
2. **Boss room** is the last room (where stairs are placed), enforced to maximum size (7x7)
3. **Boss tile** is placed in the center of the boss room, stairs behind it
4. **Boss room is cleared** of doors, chests, and treasures (clean arena)
5. **Other rooms** still contain doors, treasures, chests, and merchants for resource gathering
6. Boss tile has `cleared: false` and blocks passage until defeated

On non-boss floors, generation is completely unchanged.

## Battle Mechanics

Same fight-to-the-death HP system as existing Dragon battles:

- Each round: player answers a music challenge question
- Correct answer: boss takes 1 damage
- Wrong answer: player takes 1 damage (shield charm absorbs first hit)
- Battle ends when boss HP = 0 (victory) or player HP = 0 (game over)

### Item Usage Between Rounds

After each round result, during the 1.2s transition phase, the player can use items:
- **Potion** (heals 1 HP) — button with remaining count
- **Continue** — skip item use, proceed to next round
- Shield charm activates automatically (existing behavior)

### Streak Interaction

Correct answers during boss fights increment the player's streak. Wrong answers reset it. Streak bonus applies to score.

## Question Selection

### Mini Boss (5 HP)

All 5 questions from the current floor's challenge type pool (`getChallengeTypesForFloor(floorNumber)`). Uses player's current adaptive difficulty.

### Big Boss (8 HP)

6 standard questions + 2 preview questions:

| Big Boss Floor | Standard (6) | Preview (2) |
|---|---|---|
| 10 | noteReading, rhythmTap | `interval` (next challenge type) |
| 20+ | noteReading, rhythmTap, interval | `hard` difficulty params |
| 100 (final) | noteReading, rhythmTap, interval | `hard` difficulty params |

Preview questions are shuffled into the 8-question sequence at random positions.

New helper: `getBossChallengeConfig(floorNumber)` returns standard types, standard difficulty, preview types, and preview difficulty.

## Rewards

| Boss Type | Score | Keys | Potions | Special |
|---|---|---|---|---|
| Mini Boss | +750 | +2 | +2 | — |
| Big Boss | +1500 | +3 | +2 | Full health restore |

On defeat (player HP = 0): game over.

## Visual Theming

ChallengeModal TILE_THEME entries:
- MiniBoss: `{ title: 'Mini Boss!', borderColor: 'border-orange-500', bgColor: 'from-orange-950/90' }`
- BigBoss: `{ title: 'BOSS BATTLE!', borderColor: 'border-rose-500', bgColor: 'from-rose-950/90' }`

## Architecture

- Approach A selected: New TileTypes for MiniBoss and BigBoss (clean separation, distinct visuals, extensible)
- Extended BossBattle component with item usage UI and configurable HP
- Boss floor detection in dungeon generator with arena room generation
- Game state integration follows existing Dragon battle patterns
