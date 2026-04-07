# Low-Power Device Performance Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site load and run on low-powered devices by reducing image payload ~90%, removing render-blocking fonts, lazy-loading VexFlow, and splitting vendor chunks.

**Architecture:** Five independent changes to the build pipeline and client entry point. No backend changes. A new `scripts/optimize-images.mjs` script compresses images post-build. Vite config gets additional manual chunks. VexFlow consumers switch to dynamic imports via a new lazy wrapper. Font loading moves from synchronous `<link>` to async preload pattern.

**Tech Stack:** sharp (image processing), Vite manual chunks, React.lazy, dynamic import()

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `scripts/optimize-images.mjs` | Build-time image compression script |
| Modify | `package.json` | Add sharp dep, `postbuild` script |
| Modify | `client/index.html` | Non-render-blocking font loading |
| Modify | `vite.config.ts` | Remove vexflow from optimizeDeps, add vendor chunks |
| Create | `client/src/common/notation/LazyStaffNote.tsx` | Lazy wrapper for StaffNote |
| Modify | `client/src/games/da-capo-dungeon/challenges/NoteReadingChallenge.tsx` | Use LazyStaffNote |
| Create | `client/src/games/tools/rhythm-randomizer/logic/lazyRhythmNotation.ts` | Lazy wrapper for rhythmNotation |
| Modify | `client/src/games/tools/rhythm-randomizer/Display/StaffNotation.tsx` | Use lazy rhythmNotation |
| Modify | `client/src/games/tools/sight-reading-randomizer/Display/StaffNotation.tsx` | Use lazy rhythmNotation |
| Modify | `client/src/common/ui/OptimizedImage.tsx` | Add decoding="async" |
| Modify | `client/src/games/da-capo-dungeon/HUD.tsx` | Add loading="lazy" to img tags |
| Modify | `client/src/games/da-capo-dungeon/MobileDPad.tsx` | Add loading="lazy" to img tags |
| Modify | `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx` | Add loading="lazy" to img tags |

---

### Task 1: Build-time image compression script

**Files:**
- Create: `scripts/optimize-images.mjs`
- Modify: `package.json`

- [ ] **Step 1: Install sharp**

```bash
bun add -d sharp
```

- [ ] **Step 2: Create the optimization script**

Create `scripts/optimize-images.mjs`:

```js
#!/usr/bin/env node
/**
 * Post-build image optimizer.
 * Converts PNG/JPEG in dist/images to WebP and compresses originals in-place.
 * Run automatically via the "postbuild" npm script.
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const DIST_IMAGES = 'dist/images';
const AOC_IMAGES = 'dist/aoc';
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const PNG_QUALITY_MIN = 65;

async function getImageFiles(dir) {
  const entries = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        entries.push(...await getImageFiles(fullPath));
      } else if (/\.(png|jpe?g)$/i.test(item.name)) {
        entries.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
  return entries;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const originalStat = await stat(filePath);
  const originalSize = originalStat.size;

  // Skip small images (under 50KB)
  if (originalSize < 50 * 1024) return;

  const image = sharp(filePath);
  const metadata = await image.metadata();

  // Resize if wider than MAX_WIDTH
  const needsResize = metadata.width && metadata.width > MAX_WIDTH;
  const pipeline = needsResize ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : image;

  // Generate WebP version
  const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
  await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  // Compress original in-place
  const tempPath = filePath + '.tmp';
  if (ext === '.png') {
    await pipeline.png({ quality: PNG_QUALITY_MIN, compressionLevel: 9, palette: true }).toFile(tempPath);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tempPath);
  }

  // Only replace if we actually saved space
  const newStat = await stat(tempPath);
  if (newStat.size < originalSize) {
    const { rename } = await import('node:fs/promises');
    await rename(tempPath, filePath);
    const saved = ((1 - newStat.size / originalSize) * 100).toFixed(0);
    console.log(`  ${basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newStat.size / 1024 / 1024).toFixed(1)}MB (-${saved}%)`);
  } else {
    await unlink(tempPath);
  }
}

async function main() {
  console.log('🖼️  Optimizing images...');
  const dirs = [DIST_IMAGES, AOC_IMAGES];
  let total = 0;

  for (const dir of dirs) {
    const files = await getImageFiles(dir);
    total += files.length;
    for (const file of files) {
      try {
        await optimizeImage(file);
      } catch (err) {
        console.warn(`  ⚠ Skipped ${basename(file)}: ${err.message}`);
      }
    }
  }

  console.log(`✅ Processed ${total} images`);
}

main().catch(console.error);
```

- [ ] **Step 3: Add postbuild script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"postbuild": "node scripts/optimize-images.mjs"
```

This runs automatically after `bun run build` finishes.

- [ ] **Step 4: Test the script locally**

```bash
bun run build
```

Verify the script runs after the Vite build. Check that:
- `dist/images/` contains new `.webp` files alongside originals
- Large PNGs/JPEGs are smaller than before
- No images are corrupted (spot-check a few in the browser)

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-images.mjs package.json bun.lockb
git commit -m "feat: add build-time image optimization with sharp"
```

---

### Task 2: Non-render-blocking font loading

**Files:**
- Modify: `client/index.html`

- [ ] **Step 1: Replace the font `<link>` in client/index.html**

Replace lines 6-8 of `client/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Noto+Music&family=Nunito:wght@200..1000&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

With:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Noto+Music&family=Nunito:wght@200..1000&family=Poppins:wght@300;400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Noto+Music&family=Nunito:wght@200..1000&family=Poppins:wght@300;400;500;600;700&display=swap"></noscript>
```

- [ ] **Step 2: Verify fonts still load**

```bash
bun run dev
```

Open in browser. Verify:
- Page renders immediately with system fonts
- Web fonts swap in within 1-2 seconds
- No FOUT (flash of unstyled text) after fonts load — `display=swap` handles this

- [ ] **Step 3: Commit**

```bash
git add client/index.html
git commit -m "perf: make Google Fonts non-render-blocking"
```

---

### Task 3: Dynamic VexFlow import

**Files:**
- Modify: `vite.config.ts` (remove from optimizeDeps)
- Create: `client/src/common/notation/LazyStaffNote.tsx`
- Modify: `client/src/games/da-capo-dungeon/challenges/NoteReadingChallenge.tsx`

VexFlow is used in two areas:
1. `StaffNote.tsx` — used by NoteReadingChallenge in Da Capo Dungeon
2. `rhythmNotation.ts` — used by rhythm-randomizer and sight-reading-randomizer tools

Both are already behind `React.lazy()` page imports in App.tsx, so the page-level chunks already isolate them. The key change is removing VexFlow from `optimizeDeps.include` so Vite doesn't pre-bundle it into the shared dependency graph.

- [ ] **Step 1: Remove vexflow from optimizeDeps in vite.config.ts**

In `vite.config.ts`, change line 51:

```js
// Before
include: ["react", "react-dom", "wouter", "vexflow"],
// After
include: ["react", "react-dom", "wouter"],
```

- [ ] **Step 2: Add vexflow as its own manual chunk**

In `vite.config.ts`, add to the `manualChunks` object:

```js
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'radix-vendor': [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
  ],
  'vexflow-vendor': ['vexflow'],
},
```

This ensures VexFlow is isolated in its own chunk and only loaded when a notation-dependent page is visited.

- [ ] **Step 3: Create LazyStaffNote wrapper**

Create `client/src/common/notation/LazyStaffNote.tsx`:

```tsx
import { lazy, Suspense } from 'react';

const StaffNote = lazy(() => import('./StaffNote'));

interface LazyStaffNoteProps {
  noteKey: string;
  clef: 'treble' | 'bass';
  className?: string;
}

/**
 * Lazy-loaded wrapper for StaffNote.
 * Defers VexFlow download until this component is actually rendered.
 */
export default function LazyStaffNote(props: LazyStaffNoteProps) {
  return (
    <Suspense fallback={
      <div className={`flex items-center justify-center text-slate-400 text-lg font-mono ${props.className ?? ''}`}>
        {props.noteKey}
      </div>
    }>
      <StaffNote {...props} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Update NoteReadingChallenge to use LazyStaffNote**

In `client/src/games/da-capo-dungeon/challenges/NoteReadingChallenge.tsx`, change the import on line 5:

```tsx
// Before
import StaffNote from '@/common/notation/StaffNote';
// After
import StaffNote from '@/common/notation/LazyStaffNote';
```

- [ ] **Step 5: Build and verify**

```bash
bun run build
```

Check that:
- `dist/assets/vexflow-vendor-*.js` exists as a separate chunk
- The main `index-*.js` bundle is smaller
- VexFlow chunk is NOT listed in the HTML `<script>` tags (it's loaded on demand)

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts client/src/common/notation/LazyStaffNote.tsx client/src/games/da-capo-dungeon/challenges/NoteReadingChallenge.tsx
git commit -m "perf: lazy-load VexFlow, remove from critical path"
```

---

### Task 4: Additional vendor chunk splitting

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add recharts, framer-motion, and export vendor chunks**

In `vite.config.ts`, expand the `manualChunks` object (building on Task 3):

```js
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'radix-vendor': [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
  ],
  'vexflow-vendor': ['vexflow'],
  'recharts-vendor': ['recharts'],
  'motion-vendor': ['framer-motion'],
  'export-vendor': ['html2canvas', 'jspdf'],
},
```

- [ ] **Step 2: Build and verify chunk output**

```bash
bun run build
```

Check `dist/assets/` for separate chunk files:
- `recharts-vendor-*.js`
- `motion-vendor-*.js`
- `export-vendor-*.js`

Each should only load when a page that uses that library is visited.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "perf: split recharts, framer-motion, html2canvas into separate vendor chunks"
```

---

### Task 5: Lazy image loading audit

**Files:**
- Modify: `client/src/common/ui/OptimizedImage.tsx`
- Modify: `client/src/games/da-capo-dungeon/HUD.tsx`
- Modify: `client/src/games/da-capo-dungeon/MobileDPad.tsx`
- Modify: `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx`

- [ ] **Step 1: Add decoding="async" to OptimizedImage**

In `client/src/common/ui/OptimizedImage.tsx`, add `decoding="async"` to both `<img>` elements:

For the WebP-only branch (line 47):
```tsx
<img
  src={src}
  alt={alt}
  loading={loading}
  decoding="async"
  {...imgProps}
/>
```

For the `<picture>` fallback (line 57):
```tsx
<img
  src={src}
  alt={alt}
  loading={loading}
  decoding="async"
  {...imgProps}
/>
```

- [ ] **Step 2: Add loading="lazy" and decoding="async" to da-capo-dungeon img tags**

In `client/src/games/da-capo-dungeon/HUD.tsx`, add to both `<img>` tags (lines 31, 35):
```tsx
<img src="/images/da-capo-dungeon/key.png" alt="Key" className="w-5 h-5 object-contain" loading="lazy" decoding="async" />
<img src="/images/da-capo-dungeon/potion.png" alt="Potion" className="w-5 h-5 object-contain" loading="lazy" decoding="async" />
```

In `client/src/games/da-capo-dungeon/MobileDPad.tsx`, line 70:
```tsx
<img src="/images/da-capo-dungeon/potion.png" alt="Potion" className="w-8 h-8 object-contain" loading="lazy" decoding="async" />
```

In `client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx`, line 1444:
```tsx
<img src={src} alt={label} className="w-full h-full object-contain" draggable={false} loading="lazy" decoding="async" />
```

- [ ] **Step 3: Verify images still display correctly**

```bash
bun run dev
```

Navigate to Da Capo Dungeon. Verify all game images load properly and there are no visual glitches.

- [ ] **Step 4: Commit**

```bash
git add client/src/common/ui/OptimizedImage.tsx client/src/games/da-capo-dungeon/HUD.tsx client/src/games/da-capo-dungeon/MobileDPad.tsx client/src/games/da-capo-dungeon/MelodyDungeonGame.tsx
git commit -m "perf: add lazy loading and async decoding to all game images"
```
