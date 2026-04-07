# Low-Power Device Performance Optimization

**Date:** 2026-04-07
**Branch:** `perf/low-power-device-optimization`
**Problem:** Site fails to load on low-powered devices (budget Chromebooks, older iPads, budget Android phones) due to massive asset payloads and render-blocking resources.

## Root Cause Analysis

| Category | Current Size | Issue |
|----------|-------------|-------|
| Images | 185 MB in dist | 20+ files over 1 MB, backgrounds up to 7.9 MB |
| VexFlow JS | 1.1 MB | Bundled eagerly, most games don't need it |
| Google Fonts | 4 families | Render-blocking `<link>` in `<head>` |
| Vendor chunks | ~600 KB shared | Recharts, Framer Motion, html2canvas bundled together |
| Total JS | 3.8 MB | Heavy parse burden on low-power CPUs |

## Changes

### 1. Build-time image compression (scripts/optimize-images.mjs)

- Uses `sharp` to convert PNG/JPEG to WebP at quality 80-85
- Resizes to max 1920px width
- Runs as a pre-build step (`prebuild` npm script)
- Processes `dist/images/` after Vite copies public assets
- Originals in `client/public/` are untouched
- Expected: 185 MB -> ~15-20 MB

### 2. Non-render-blocking fonts (client/index.html)

- Replace synchronous `<link rel="stylesheet">` with preload + swap pattern
- `media="print"` with `onload` swap to `media="all"`
- `<noscript>` fallback for non-JS environments
- System fonts render instantly; web fonts swap in when ready

### 3. Dynamic VexFlow import (vite.config.ts + lazy wrapper)

- Remove `vexflow` from `optimizeDeps.include`
- Create `useVexFlow` hook or lazy wrapper component
- Only notation-dependent games load VexFlow
- 1.1 MB removed from critical rendering path

### 4. Vendor chunk splitting (vite.config.ts)

- Add `recharts-vendor`, `motion-vendor`, `export-vendor` manual chunks
- Each library loads only when its consuming page is visited
- Reduces initial JS parse from 3.8 MB

### 5. Lazy image loading audit (OptimizedImage + img tags)

- Ensure `loading="lazy"` and `decoding="async"` on all game images
- Only above-the-fold landing page images load eagerly

## Out of Scope

- Service worker / offline caching
- Audio file optimization (loaded per-game, not upfront)
- Dependency removal or replacement
- Responsive `<picture>` with multiple resolutions (future work)
