# Phase 2: Low-End Device Runtime Performance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce runtime CPU/GPU cost so the site runs smoothly on low-end devices after Phase 1 payload optimizations.

**Architecture:** Eight independent changes targeting CSS animation cost, React rendering waste, unnecessary network connections, and missing cache headers. No new dependencies, no architectural changes.

**Tech Stack:** React.memo, useCallback, CSS keyframes, dynamic import(), vercel.json headers

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Modify | `client/src/pages/LandingVariation2.tsx` | Reduce landing page animations |
| Modify | `client/src/games/da-capo-dungeon/HUD.tsx` | Wrap in React.memo |
| Modify | `client/src/games/da-capo-dungeon/MobileDPad.tsx` | Wrap in React.memo |
| Modify | `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx` | Extract inline callbacks |
| Modify | `client/src/index.css` | Fix sprite-hit filter, consolidate keyframes, add reduced-motion, remove print styles |
| Create | `client/public/print.css` | Extracted print styles |
| Modify | `client/src/games/cadence-quest/logic/useWebSocket.ts` | Accept type param, conditional socket |
| Modify | `client/src/games/cadence-quest/BattleScreen.tsx` | Pass type to useWebSocket |
| Modify | `vercel.json` | Add audio cache headers |

---

### Task 1: Landing page animation reduction

**Files:**
- Modify: `client/src/pages/LandingVariation2.tsx:47-70`

- [ ] **Step 1: Replace blur-xl backdrop circles with simple opacity circles**

In `client/src/pages/LandingVariation2.tsx`, replace lines 47-49:

```tsx
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-pulse delay-75" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-xl animate-pulse delay-150" />
```

With:

```tsx
      {/* Decorative Background Elements — no blur-xl, reduced animation */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/20 rounded-full" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/20 rounded-full" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-300/20 rounded-full" />
```

- [ ] **Step 2: Remove duplicate pulse animations from hero icons**

In the same file, replace lines 66 and 70:

```tsx
            <Music className="w-12 h-12 text-purple-600 animate-pulse" />
```

With:

```tsx
            <Music className="w-12 h-12 text-purple-600" />
```

And:

```tsx
            <Music className="w-12 h-12 text-pink-600 animate-pulse" />
```

With:

```tsx
            <Music className="w-12 h-12 text-pink-600" />
```

This reduces concurrent load animations from 7+ to 3 (the bouncing stars only).

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/LandingVariation2.tsx
git commit -m "perf: reduce landing page animations for low-end devices"
```

---

### Task 2: CSS filter brightness to opacity

**Files:**
- Modify: `client/src/index.css:477-481`

- [ ] **Step 1: Replace sprite-hit keyframe**

In `client/src/index.css`, replace lines 477-481:

```css
  @keyframes sprite-hit {
    0%, 100% { transform: translateX(0); filter: brightness(1); }
    15%, 45%, 75% { transform: translateX(-4px); filter: brightness(2.5); }
    30%, 60%, 90% { transform: translateX(4px); filter: brightness(1.5); }
  }
```

With:

```css
  @keyframes sprite-hit {
    0%, 100% { transform: translateX(0); opacity: 1; }
    15%, 45%, 75% { transform: translateX(-4px); opacity: 0.4; }
    30%, 60%, 90% { transform: translateX(4px); opacity: 0.7; }
  }
```

The low opacity flashes create a visual "hit" effect similar to brightness, but using only GPU-composited properties (transform + opacity).

- [ ] **Step 2: Commit**

```bash
git add client/src/index.css
git commit -m "perf: replace filter:brightness with opacity in sprite-hit animation"
```

---

### Task 3: Da Capo Dungeon React.memo + useCallback

**Files:**
- Modify: `client/src/games/da-capo-dungeon/HUD.tsx:1,119`
- Modify: `client/src/games/da-capo-dungeon/MobileDPad.tsx:90`
- Modify: `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx:1704,1719-1722,1737-1743`

- [ ] **Step 1: Wrap HUD in React.memo**

In `client/src/games/da-capo-dungeon/HUD.tsx`, replace line 119:

```tsx
export default HUD;
```

With:

```tsx
export default React.memo(HUD);
```

- [ ] **Step 2: Wrap MobileDPad in React.memo**

In `client/src/games/da-capo-dungeon/MobileDPad.tsx`, replace line 90:

```tsx
export default MobileDPad;
```

With:

```tsx
export default React.memo(MobileDPad);
```

(React is already imported at the top of both files.)

- [ ] **Step 3: Extract inline callbacks in MelodyDungeonGame.tsx**

In `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx`, add these callbacks near the other `useCallback` declarations (around line 1085):

```tsx
  const handleBackToMenu = useCallback(() => setPhase('menu'), []);

  const handleDevBackToMenu = useCallback(() => {
    setDevMode({ ...DEFAULT_DEV_MODE });
    setPhase('menu');
  }, []);

  const hasBagItems = useMemo(() => {
    const p = player.buffs.persistent;
    return p.shieldCharm > 0 ||
      p.torch > 0 || p.mapScroll > 0 || p.compass > 0 ||
      p.streakSaver > 0 || p.secondChance > 0 || p.dragonBane > 0 ||
      p.luckyCoin > 0 || p.treasureMagnet > 0 || p.metronome > 0 || p.tuningFork > 0;
  }, [player.buffs.persistent]);
```

Then update the HUD usage on line 1704, replacing:

```tsx
<HUD player={player} floorNumber={floorNumber} themeName={themeName} onOpenBag={openBag} specialFloorType={floor.specialFloorType} onBackToMenu={() => setPhase('menu')} />
```

With:

```tsx
<HUD player={player} floorNumber={floorNumber} themeName={themeName} onOpenBag={openBag} specialFloorType={floor.specialFloorType} onBackToMenu={handleBackToMenu} />
```

Update DevToolbar on lines 1719-1722, replacing:

```tsx
            onBackToMenu={() => {
              setDevMode({ ...DEFAULT_DEV_MODE });
              setPhase('menu');
            }}
```

With:

```tsx
            onBackToMenu={handleDevBackToMenu}
```

Update MobileDPad on lines 1737-1743, replacing:

```tsx
            hasBagItems={(() => {
              const p = player.buffs.persistent;
              return p.shieldCharm > 0 ||
                p.torch > 0 || p.mapScroll > 0 || p.compass > 0 ||
                p.streakSaver > 0 || p.secondChance > 0 || p.dragonBane > 0 ||
                p.luckyCoin > 0 || p.treasureMagnet > 0 || p.metronome > 0 || p.tuningFork > 0;
            })()}
```

With:

```tsx
            hasBagItems={hasBagItems}
```

Add `useMemo` to the import on line 1 if not already present.

- [ ] **Step 4: Commit**

```bash
git add client/src/games/da-capo-dungeon/HUD.tsx client/src/games/da-capo-dungeon/MobileDPad.tsx client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx
git commit -m "perf: add React.memo to HUD/MobileDPad, extract inline callbacks"
```

---

### Task 4: Socket.io conditional loading

**Files:**
- Modify: `client/src/games/cadence-quest/logic/useWebSocket.ts`
- Modify: `client/src/games/cadence-quest/BattleScreen.tsx:51`

- [ ] **Step 1: Rewrite useWebSocket to accept a type parameter**

Replace the entire content of `client/src/games/cadence-quest/logic/useWebSocket.ts` with:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Conditionally creates a WebSocket connection.
 * Only connects when type is 'pvp' — PVE battles create no socket.
 */
export function useWebSocket(type: 'pve' | 'pvp' = 'pve') {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (type !== 'pvp') return;

    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(API_URL, { autoConnect: true, withCredentials: true });
      socketRef.current = socket;
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [type]);

  const emit = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback((event: string, handler: (payload: unknown) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event);
  }, []);

  return { connected, emit, on };
}
```

- [ ] **Step 2: Pass type to useWebSocket in BattleScreen**

In `client/src/games/cadence-quest/BattleScreen.tsx`, replace line 51:

```tsx
  const { emit, on } = useWebSocket();
```

With:

```tsx
  const { emit, on } = useWebSocket(type);
```

- [ ] **Step 3: Commit**

```bash
git add client/src/games/cadence-quest/logic/useWebSocket.ts client/src/games/cadence-quest/BattleScreen.tsx
git commit -m "perf: lazy-load socket.io-client, skip connection for PVE battles"
```

---

### Task 5: Extract print styles

**Files:**
- Create: `client/public/print.css`
- Modify: `client/src/index.css:641-733`

- [ ] **Step 1: Create client/public/print.css**

Create `client/public/print.css` with the print styles extracted from index.css:

```css
/* Print styles for Rhythm Randomizer worksheets */
@media print {
  header {
    display: none !important;
  }

  button {
    display: none !important;
  }

  .lg\:col-span-1 {
    display: none !important;
  }

  .sticky {
    display: none !important;
  }

  [data-radix-popper-content-wrapper] {
    display: none !important;
  }

  body {
    background: white !important;
  }

  .min-h-screen {
    background: white !important;
    min-height: auto !important;
  }

  main {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .grid {
    display: block !important;
  }

  .print-pattern {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print-pattern > div:first-child {
    display: none !important;
  }

  .print-pattern > div:last-child {
    padding: 0 !important;
  }

  svg {
    max-width: 100% !important;
    height: auto !important;
  }

  * {
    color: black !important;
  }

  @page {
    margin: 1cm;
    size: A4;
  }

  .lg\:col-span-2 {
    grid-column: span 3 !important;
  }

  .space-y-2 > *:not(.print-pattern) {
    display: none !important;
  }
}
```

- [ ] **Step 2: Remove print styles from index.css**

In `client/src/index.css`, delete lines 641-733 (the comment block and the entire `@media print { ... }` block).

- [ ] **Step 3: Add print.css link to index.html**

In `client/index.html`, add inside the `<head>` tag (after the font preload line):

```html
    <link rel="stylesheet" href="/print.css" media="print">
```

- [ ] **Step 4: Commit**

```bash
git add client/public/print.css client/src/index.css client/index.html
git commit -m "perf: extract print styles to separate media=print stylesheet"
```

---

### Task 6: Audio cache headers

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add audio cache header rule**

In `vercel.json`, add a second entry to the `headers` array after the existing `/assets/(.*)` rule:

```json
    {
      "source": "/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
```

The full `headers` array should now have two entries (for `/assets/(.*)` and `/audio/(.*)`).

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "perf: add immutable cache headers for audio files"
```

---

### Task 7: Consolidate CSS keyframes

**Files:**
- Modify: `client/src/index.css:449-639`

- [ ] **Step 1: Merge sprite-float and bounce-subtle**

These two keyframes are nearly identical (both translate Y by a small percentage). In `client/src/index.css`, delete the `bounce-subtle` keyframe (lines 459-465) and update its class to use `sprite-float`:

Replace:

```css
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5%); }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 1s infinite;
  }
```

With:

```css
  .animate-bounce-subtle {
    animation: sprite-float 1s ease-in-out infinite;
  }
```

- [ ] **Step 2: Merge healing-fade and dragon-fire**

Both are simple opacity fade-in/fade-out with similar timing. Delete `healing-fade` (lines 539-544) and repoint its class:

Replace:

```css
  @keyframes healing-fade {
    0% { opacity: 0; }
    15% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
  .animate-healing-fade {
    animation: healing-fade 800ms ease-out forwards;
  }
```

With:

```css
  .animate-healing-fade {
    animation: dragon-fire 800ms ease-out forwards;
  }
```

- [ ] **Step 3: Merge shield-flash and dragon-fire**

`shield-flash` is also a simple opacity fade with the same pattern. Delete `shield-flash` (lines 515-520) and repoint:

Replace:

```css
  @keyframes shield-flash {
    0% { opacity: 0; }
    20% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
  .animate-shield-flash {
    animation: shield-flash 600ms ease-out forwards;
  }
```

With:

```css
  .animate-shield-flash {
    animation: dragon-fire 600ms ease-out forwards;
  }
```

- [ ] **Step 4: Commit**

```bash
git add client/src/index.css
git commit -m "perf: consolidate duplicate CSS keyframes"
```

---

### Task 8: prefers-reduced-motion support

**Files:**
- Modify: `client/src/index.css` (add at end of file, before the closing `}` of the `@layer utilities` block or at the very end)

- [ ] **Step 1: Add reduced motion media query**

Add the following at the end of `client/src/index.css`:

```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This disables all decorative and functional animations when the user has requested reduced motion. Using `0.01ms` instead of `0s` ensures `animationend` events still fire (important for JS that listens for animation completion).

- [ ] **Step 2: Commit**

```bash
git add client/src/index.css
git commit -m "a11y: add prefers-reduced-motion support to disable animations"
```
