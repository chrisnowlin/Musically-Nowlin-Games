# Phase 2: Low-End Device Runtime Performance

**Date:** 2026-04-07
**Branch:** `perf/low-power-runtime-optimization`
**Problem:** After Phase 1 payload reductions, low-end devices still suffer from runtime performance issues: excessive CSS animations, React re-rendering waste, unnecessary network connections, and filter-based repaints.

## Changes

### 1. Landing page animation reduction (LandingVariation2.tsx)

- Remove `blur-xl` from decorative backdrop circles, replace with solid low-opacity backgrounds
- Reduce concurrent load animations from 7+ to 3 max
- Simplify card hover effects

### 2. Da Capo Dungeon React.memo + useCallback

- Wrap HUD, MobileDPad, and modal child components in `React.memo`
- Memoize event handlers passed as props with `useCallback`
- Targeted optimization only, no component splitting

### 3. CSS filter: brightness() to opacity (index.css)

- Replace `filter: brightness(1.5)` in `sprite-hit` keyframe with opacity-based approach
- Remove all `filter` usage from animation keyframes
- Use only `transform` and `opacity` in animations (GPU-composited, no repaints)

### 4. Socket.io conditional loading (useWebSocket.ts, BattleScreen.tsx)

- Guard socket creation: `if (type !== 'pvp') return;`
- Dynamically `import('socket.io-client')` only when entering PVP mode
- PVE battles create no socket connection

### 5. Replace Framer Motion on landing page

- Replace `framer-motion` hover/animation usage in landing page with CSS `transition` properties
- Framer Motion stays available for games, just not loaded by the landing page
- Prevents 114KB motion-vendor chunk from loading on first visit

### 6. Extract print styles

- Move `@media print` rules (~90 lines) from `index.css` into `print.css`
- Load via `<link rel="stylesheet" media="print" href="/print.css">` only in pages that need it (Rhythm Randomizer)
- Reduces main CSS parse cost for all other pages

### 7. Audio cache headers (vercel.json)

- Add `Cache-Control: public, max-age=31536000, immutable` for `/audio/**` paths
- Matches existing `/assets/**` caching pattern

### 8. Consolidate CSS keyframes (index.css)

- Merge near-duplicate keyframes (sprite-float/sprite-attack variants)
- Replace any remaining `filter`-based animation properties with `transform`/`opacity`
- Target: reduce from 40+ keyframes to ~25-30

### 9. prefers-reduced-motion support (index.css)

- Add global `@media (prefers-reduced-motion: reduce)` rule
- Disable decorative animations: backdrop pulses, bounces, floats, sprite-float
- Preserve functional animations: challenge feedback, timer indicators, progress bars

## Out of Scope

- Service worker / offline caching (separate effort)
- Da Capo Dungeon component split/refactor
- Removing Framer Motion from the project entirely
- Audio file optimization
