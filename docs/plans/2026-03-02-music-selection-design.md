# Music Selection in Dev Room - Design

## Overview

Add a jukebox tile to the melody dungeon dev room that opens a modal allowing the user to select and play any of the game's music tracks.

## Track Configuration

New file: `client/src/games/melody-dungeon/logic/musicTracks.ts`

Defines a `MusicTrack` interface and `MUSIC_TRACKS` array:

```typescript
interface MusicTrack {
  id: string;
  name: string;
  emoji: string;
  path: string;           // relative to public/audio/
  category: 'ambient' | 'battle';
}
```

Initial tracks:
- Cathedral in the Cavern (ambient)
- Dungeon Run (battle)
- Dungeon Run: Bloodsteel (battle)
- Galactic Groove (ambient)
- Gentle Steps Through the Green (ambient)

Adding new tracks = adding one object to the array.

## Jukebox Tile

In `dungeonGenerator.ts`'s `generateDevRoom`:
- Place a jukebox tile east of the player (around position 17, 14), symmetrical to the merchant on the west side
- Use a special interactable marker on the tile (similar to how the merchant stall works)
- Render with a musical note emoji on the map

## MusicSelectModal Component

New file: `client/src/games/melody-dungeon/MusicSelectModal.tsx`

- Lists all tracks from `MUSIC_TRACKS`, grouped by category (Ambient / Battle)
- Each row: emoji, track name, play/stop button
- Highlights currently playing track
- "Stop Music" button to silence everything
- Uses existing `loadBgMusic`/`startBgMusic`/`stopBgMusic` from `dungeonAudio.ts`
- Closes on backdrop click or close button

## Integration in MelodyDungeonGame.tsx

- Detect player stepping on jukebox tile (like merchant detection)
- When `floor.floorNumber === 0` and player is on jukebox tile, show `MusicSelectModal`
- Track currently playing track ID in component state for "now playing" indicator

## Files to Create/Modify

- **Create**: `client/src/games/melody-dungeon/logic/musicTracks.ts`
- **Create**: `client/src/games/melody-dungeon/MusicSelectModal.tsx`
- **Modify**: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts` (add jukebox tile)
- **Modify**: `client/src/games/melody-dungeon/logic/dungeonTypes.ts` (add jukebox tile type if needed)
- **Modify**: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx` (jukebox interaction + modal state)
- **Modify**: Map renderer (render jukebox emoji on tile)
