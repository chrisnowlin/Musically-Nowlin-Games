# Music Selection Dev Room Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a jukebox tile to the melody dungeon dev room that opens a modal for selecting and playing music tracks.

**Architecture:** New `Jukebox` tile type rendered with a sprite on the dev room map. Walking into it opens a `MusicSelectModal` that lists all tracks from a config array. The modal uses existing `dungeonAudio.ts` functions to load and play tracks. A new `loadAndPlayBgMusic` wrapper handles the stop → load → start cycle.

**Tech Stack:** React, TypeScript, Tailwind CSS, Web Audio API (via existing `dungeonAudio.ts`)

---

### Task 1: Add Jukebox TileType and music track config

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts:1-15` (TileType enum)
- Create: `client/src/games/melody-dungeon/logic/musicTracks.ts`

**Step 1: Add Jukebox to TileType enum**

In `dungeonTypes.ts`, add `Jukebox = 'jukebox'` to the `TileType` enum after `MerchantStall`:

```typescript
export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Merchant = 'merchant',
  MerchantStall = 'merchantStall',
  Jukebox = 'jukebox',
  MiniBoss = 'miniBoss',
  BigBoss = 'bigBoss',
  BossBody = 'bossBody',
}
```

**Step 2: Create `musicTracks.ts`**

```typescript
export interface MusicTrack {
  id: string;
  name: string;
  emoji: string;
  filename: string;
  category: 'ambient' | 'battle';
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'cathedral', name: 'Cathedral in the Cavern', emoji: '🏰', filename: 'Cathedral in the Cavern.mp3', category: 'ambient' },
  { id: 'galactic', name: 'Galactic Groove', emoji: '🌌', filename: 'Galactic Groove.mp3', category: 'ambient' },
  { id: 'gentle-steps', name: 'Gentle Steps Through the Green', emoji: '🌿', filename: 'gentle-steps-through-the-green.mp3', category: 'ambient' },
  { id: 'dungeon-run', name: 'Dungeon Run', emoji: '⚔️', filename: 'Dungeon Run.mp3', category: 'battle' },
  { id: 'bloodsteel', name: 'Dungeon Run: Bloodsteel', emoji: '🩸', filename: 'Dungeon Run_ Bloodsteel.mp3', category: 'battle' },
];
```

**Step 3: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/logic/musicTracks.ts
git commit -m "feat(melody-dungeon): add Jukebox tile type and music track config"
```

---

### Task 2: Add `loadAndPlayBgMusic` to dungeonAudio

**Files:**
- Modify: `client/src/games/melody-dungeon/dungeonAudio.ts:292-381` (background music section)

**Step 1: Add `loadAndPlayBgMusic` function**

The existing `loadBgMusic` caches a single buffer and returns early if one already exists (`if (bgBuffer) return;`). For the jukebox, we need to load a *different* track and start playing it. Add this function after `stopBgMusic`:

```typescript
/** Stop current background music, load a new track, and start playing it. */
export async function loadAndPlayBgMusic(url: string): Promise<void> {
  stopBgMusic();
  bgBuffer = null; // clear cached buffer so loadBgMusic fetches the new URL
  await loadBgMusic(url);
  startBgMusic();
}
```

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/dungeonAudio.ts
git commit -m "feat(melody-dungeon): add loadAndPlayBgMusic for track switching"
```

---

### Task 3: Place jukebox tile in dev room

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts:574-647` (generateDevRoom)

**Step 1: Add jukebox tile placement**

After the merchant pair placement (line 592), add the jukebox tile east of the player at position (17, 14), symmetrical to the merchant:

```typescript
  // Place jukebox east of player (symmetrical to merchant on west side)
  grid[14][17].type = TileType.Jukebox;
```

Import `TileType.Jukebox` is already available since `TileType` is already imported from `dungeonTypes`.

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat(melody-dungeon): place jukebox tile in dev room"
```

---

### Task 4: Render jukebox tile on the dungeon grid

**Files:**
- Modify: `client/src/games/melody-dungeon/DungeonGrid.tsx`

**Step 1: Add jukebox to TILE_SPRITE map**

There are two options: use a sprite image file, or render an emoji. Since we don't have a jukebox sprite image, render the jukebox as a text emoji on the tile. Find where tiles without a sprite are handled and add a special case for Jukebox:

In the `TILE_SPRITE` map, we won't add an entry since there's no image. Instead, add a text fallback for Jukebox tiles. Find the rendering section where `showContent && !isPlayer && !cleared && !isBossAnchor` is checked. After the sprite `<img>` rendering, add an emoji fallback for Jukebox tiles:

```typescript
// Inside the tile rendering, after the sprite image block:
{showContent && !isPlayer && tile.type === TileType.Jukebox && (
  <span className="absolute inset-0 flex items-center justify-center text-lg select-none">
    🎵
  </span>
)}
```

Import `TileType` if not already imported (it should be).

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/DungeonGrid.tsx
git commit -m "feat(melody-dungeon): render jukebox emoji on dungeon grid"
```

---

### Task 5: Create MusicSelectModal component

**Files:**
- Create: `client/src/games/melody-dungeon/MusicSelectModal.tsx`

**Step 1: Create the modal component**

Follow the same styling patterns as `MerchantModal` and `DevChallengeConfigModal`:

```tsx
import React from 'react';
import { MUSIC_TRACKS } from './logic/musicTracks';
import type { MusicTrack } from './logic/musicTracks';

interface Props {
  currentTrackId: string | null;
  onPlay: (track: MusicTrack) => void;
  onStop: () => void;
  onClose: () => void;
}

const MusicSelectModal: React.FC<Props> = ({ currentTrackId, onPlay, onStop, onClose }) => {
  const ambientTracks = MUSIC_TRACKS.filter((t) => t.category === 'ambient');
  const battleTracks = MUSIC_TRACKS.filter((t) => t.category === 'battle');

  const renderTrack = (track: MusicTrack) => {
    const isPlaying = currentTrackId === track.id;
    return (
      <button
        key={track.id}
        onClick={() => (isPlaying ? onStop() : onPlay(track))}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
          isPlaying
            ? 'bg-purple-700/50 border border-purple-500'
            : 'bg-gray-800/60 hover:bg-gray-700/60 border border-transparent'
        }`}
      >
        <span className="text-xl shrink-0">{track.emoji}</span>
        <span className="flex-1 text-sm font-medium truncate">{track.name}</span>
        <span className="text-xs shrink-0">
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-5 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🎵 Jukebox</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ambient</h3>
          <div className="flex flex-col gap-1.5">
            {ambientTracks.map(renderTrack)}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Battle</h3>
          <div className="flex flex-col gap-1.5">
            {battleTracks.map(renderTrack)}
          </div>
        </div>

        <button
          onClick={onStop}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          🔇 Stop Music
        </button>
      </div>
    </div>
  );
};

export default MusicSelectModal;
```

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/MusicSelectModal.tsx
git commit -m "feat(melody-dungeon): add MusicSelectModal component"
```

---

### Task 6: Integrate jukebox interaction in MelodyDungeonGame

**Files:**
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`

**Step 1: Add imports**

Add at top of file:
```typescript
import MusicSelectModal from './MusicSelectModal';
import type { MusicTrack } from './logic/musicTracks';
import { loadAndPlayBgMusic } from './dungeonAudio';
```

**Step 2: Add jukebox state**

Near the other `useState` declarations (around line 144), add:
```typescript
const [showJukebox, setShowJukebox] = useState(false);
const [currentTrackId, setCurrentTrackId] = useState<string | null>('cathedral');
```

**Step 3: Add jukebox tile interaction in handleMove**

In the `handleMove` callback, after the `Merchant` tile handling block (around line 509-514), add a similar block for `Jukebox`:

```typescript
        // Jukebox: open music selection (dev room only)
        if (tile.type === TileType.Jukebox) {
          setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
          moveLockedRef.current = true;
          setShowJukebox(true);
          return { ...prev, position: newPos };
        }
```

**Step 4: Add jukebox handlers**

After `handleMerchantClose` (around line 848), add:

```typescript
  const handleJukeboxPlay = useCallback((track: MusicTrack) => {
    const basePath = import.meta.env.BASE_URL || '/';
    void loadAndPlayBgMusic(`${basePath}audio/${track.filename}`);
    setCurrentTrackId(track.id);
  }, []);

  const handleJukeboxStop = useCallback(() => {
    stopBgMusic();
    setCurrentTrackId(null);
  }, []);

  const handleJukeboxClose = useCallback(() => {
    setShowJukebox(false);
    moveLockedRef.current = false;
  }, []);
```

**Step 5: Add MusicSelectModal to render**

In the playing phase render section, after the `MerchantModal` block (around line 1354), add:

```tsx
      {showJukebox && (
        <MusicSelectModal
          currentTrackId={currentTrackId}
          onPlay={handleJukeboxPlay}
          onStop={handleJukeboxStop}
          onClose={handleJukeboxClose}
        />
      )}
```

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat(melody-dungeon): integrate jukebox tile and music select modal"
```

---

### Task 7: Visual verification and polish

**Step 1: Run dev server and verify**

Run: `npm run dev` (or the project's dev command)

Verify in browser:
1. Enter the dev room (password: musicgames123)
2. The jukebox emoji (🎵) appears at position (17, 14), east of the player
3. Walk into the jukebox tile — the MusicSelectModal opens
4. Click a track — it starts playing
5. Click the same track — it stops
6. Click a different track — it switches
7. Click "Stop Music" — silence
8. Close the modal — player can move again
9. Re-enter the jukebox — modal shows correct "now playing" state

**Step 2: Commit any polish fixes**

```bash
git add -A
git commit -m "fix(melody-dungeon): polish jukebox UI and interactions"
```
