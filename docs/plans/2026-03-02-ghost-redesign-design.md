# Ghost Redesign: "The Phantom"

**Date:** 2026-03-02
**Goal:** Transform the ghost from the least interesting enemy into a distinctive trickster with a full identity — classic ghost-fantasy movement, stalker tension, and disruptive encounter mechanics.

**Design principles:**
- Annoying trickster, not a heavy threat
- Classic ghost fantasy (phasing, invisibility, materializing)
- No new item types
- Fits within existing systems (moveEnemies, ChallengeModal, reward pipeline)

---

## Movement & Grid Behavior

### Wall-Phasing

The ghost is the only enemy that ignores wall collision during `moveEnemies()`. When evaluating candidate movement directions, ghosts skip the wall check — they can path through wall tiles to reach open floor on the other side.

- Ghost still cannot move off-grid (boundary check remains)
- Ghost stops on floor tiles — it phases *through* walls, not *into* them (walls are transit, not destination)
- Destination tile must be a walkable floor/door tile

### Visibility Flickering

Ghosts alternate between visible and invisible states on a turn-based cycle.

- Each ghost tracks a `ghostVisible` boolean on its tile (new field on `Tile`)
- On each `moveEnemies()` call, ghosts have a chance to toggle visibility (e.g. 30% chance to flip state each turn)
- **Visible state:** renders normally with ghost sprite + `animate-sprite-float`
- **Invisible state:** sprite is hidden; a faint translucent shimmer effect renders on the tile when within the player's visibility radius (CSS opacity ~0.15 with a pulse animation)
- Invisible ghosts still move, still occupy their tile, still block movement — they're just visually hidden

### Materialization (Stalker Mechanic)

When an invisible ghost spends several consecutive turns within the player's visibility radius, it materializes — becomes visible and forces an encounter.

- Track a `ghostNearPlayerTurns` counter on the tile (new field)
- Increments each turn the ghost is invisible AND within `VISIBILITY_RADIUS` of the player
- At threshold (e.g. 3 turns), the ghost materializes:
  - Sets `ghostVisible = true`
  - If adjacent to the player (Manhattan distance 1), forces an encounter on the player's next move processing
- Counter resets when the ghost moves out of visibility radius or becomes visible naturally

---

## Encounter & Challenge Mechanics

### Hidden Challenge Type

The ghost's challenge type is hidden on the grid tile.

- In `DungeonGrid.tsx`, ghost enemy tiles show a "???" indicator instead of the challenge type icon
- The actual `challengeType` is still stored on the tile — it's only hidden visually
- Revealed when the `ChallengeModal` opens

### Challenge Swap (First Wrong Answer)

On the player's first wrong answer during a ghost encounter, the challenge "flickers" — swaps to a different type.

- Only triggers once per round (flag tracked in ChallengeModal state)
- When triggered:
  1. Current challenge is discarded (no damage for that wrong answer)
  2. A new challenge type is randomly selected from the floor's pool (excluding the current type)
  3. The round restarts with the new challenge type
- For multi-round encounters (level 2+ ghosts), the swap can happen once per round
- Visual feedback: brief flicker animation on the modal before the new challenge renders

### Modal Theme

Ghost gets a dedicated theme in `getEnemyTheme()`:

- Title: "Ghost Encounter!"
- Border: `border-cyan-500`
- Background: dark translucent gradient (spectral feel)

Replaces the current fallthrough to generic red "Enemy Encounter!"

---

## Rewards

Ghosts are tricksters — disruptive but not lucrative.

| Reward | Value | Notes |
|--------|-------|-------|
| Gold | 50 (flat) | Lower than standard 100-150 for regular enemies |
| Keys | 1 | Standard drop |
| Potions | 0 | No potion (lower than dragon) |
| Streak | +2 total | +1 standard + 1 bonus for dealing with the trickster |

---

## New Tile Fields

Two new optional fields on the `Tile` interface:

```typescript
export interface Tile {
  // ... existing fields ...
  ghostVisible?: boolean;         // visibility flicker state
  ghostNearPlayerTurns?: number;  // materialization counter
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `dungeonTypes.ts` | Add `ghostVisible` and `ghostNearPlayerTurns` to `Tile` |
| `dungeonGenerator.ts` | Ghost wall-phasing in `moveEnemies()`, visibility flickering logic, materialization counter, ghost spawn initialization |
| `DungeonGrid.tsx` | Hidden "???" challenge indicator for ghosts, shimmer effect for invisible ghosts, visibility-based sprite rendering |
| `ChallengeModal.tsx` | Ghost theme in `getEnemyTheme()`, challenge swap on first wrong answer |
| `MelodyDungeonGame.tsx` | Ghost reward values (50 gold, +1 streak bonus), materialization encounter trigger |
| `challengeHelpers.ts` | No changes needed (ghost wildcard pool stays the same) |

---

## What's NOT Changing

- Ghost's challenge pool (wildcard — all floor types) stays the same
- Ghost sprite asset (`ghost.png`) stays the same
- Ghost spawn frequency / floor availability stays the same
- No new item types
- No changes to other enemy subtypes
