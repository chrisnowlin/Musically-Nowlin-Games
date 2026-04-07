# Phase 5: Melody Dungeon Notation Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify notation display across Melody Dungeon challenges by extracting a shared `NotationImage` component, fixing VexFlow `StaffNote` rendering issues, and migrating three challenges.

**Architecture:** Two reusable components in `client/src/common/notation/` — `NotationImage` for static LilyPond SVGs and an improved `StaffNote` for VexFlow dynamic rendering. Three challenge files are migrated to use `NotationImage`. TDD throughout.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, VexFlow 5.0, Vitest, @testing-library/react

---

### Task 1: Create shared `NotationImage` component (TDD)

**Files:**
- Create: `client/src/common/notation/__tests__/NotationImage.test.tsx`
- Create: `client/src/common/notation/NotationImage.tsx`

**Step 1: Write the failing tests**

Create `client/src/common/notation/__tests__/NotationImage.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import NotationImage from '../NotationImage';

describe('NotationImage', () => {
  it('renders an img element with the correct src and alt', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test notation" />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('/images/test.svg');
    expect(img?.getAttribute('alt')).toBe('Test notation');
  });

  it('applies the invert filter class', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('invert')).toBe(true);
  });

  it('uses h-14 (md) size by default', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-14')).toBe(true);
  });

  it('uses h-12 for size="sm"', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" size="sm" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-12')).toBe(true);
  });

  it('uses h-16 for size="lg"', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" size="lg" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('h-16')).toBe(true);
  });

  it('hides the image on load error', () => {
    const { container } = render(
      <NotationImage src="/images/missing.svg" alt="Missing" />
    );
    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    expect(img.style.display).toBe('none');
  });

  it('passes additional className to the img', () => {
    const { container } = render(
      <NotationImage src="/images/test.svg" alt="Test" className="mb-2" />
    );
    const img = container.querySelector('img');
    expect(img?.classList.contains('mb-2')).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run client/src/common/notation/__tests__/NotationImage.test.tsx`
Expected: FAIL — `NotationImage` module not found.

**Step 3: Write the implementation**

Create `client/src/common/notation/NotationImage.tsx`:

```tsx
const SIZE_CLASSES = {
  sm: 'h-12',
  md: 'h-14',
  lg: 'h-16',
} as const;

interface NotationImageProps {
  /** URL to the SVG notation image. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Display size: sm=h-12, md=h-14 (default), lg=h-16. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes (e.g., margin). */
  className?: string;
}

/**
 * Displays a LilyPond-engraved SVG notation image with consistent
 * dark-theme styling (CSS invert filter) and error handling.
 */
export default function NotationImage({
  src,
  alt,
  size = 'md',
  className = '',
}: NotationImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${SIZE_CLASSES[size]} mx-auto invert ${className}`.trim()}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/common/notation/__tests__/NotationImage.test.tsx`
Expected: 7 tests PASS.

**Step 5: Commit**

```bash
git add client/src/common/notation/NotationImage.tsx client/src/common/notation/__tests__/NotationImage.test.tsx
git commit -m "feat(notation): add shared NotationImage component with size tiers"
```

---

### Task 2: Fix VexFlow StaffNote responsive sizing + error boundary (TDD)

**Files:**
- Modify: `client/src/common/notation/StaffNote.tsx`
- Modify: `client/src/common/notation/__tests__/StaffNote.test.tsx`
- Modify: `client/src/test/vexflowMock.ts`

**Step 1: Add failing tests for responsive sizing and error fallback**

Add the following tests to the existing `StaffNote.test.tsx` file, after the last `it(...)` block:

```tsx
  it('renders note name as text fallback when VexFlow throws', () => {
    // Override the mock to make Renderer throw
    const vexflow = await import('vexflow');
    const OrigRenderer = vexflow.Renderer;
    vexflow.Renderer = class {
      static Backends = { SVG: 'svg' };
      constructor() { throw new Error('VexFlow boom'); }
      resize() {}
      getContext() { return { setStrokeStyle() {}, setFillStyle() {} }; }
    } as any;

    const { container } = render(
      <StaffNote noteKey="C4" clef="treble" />
    );
    // Should show the note name as plain text fallback
    expect(container.textContent).toContain('C4');
    // No SVG should be rendered
    expect(container.querySelector('svg')).toBeNull();

    // Restore
    vexflow.Renderer = OrigRenderer;
  });
```

> **Note to implementer:** The above test approach (overriding the mock inline) may not work cleanly with Vitest's hoisted `vi.mock`. An alternative is to make the `Renderer` mock constructor conditionally throw based on a module-scoped flag. Use whichever approach makes the test reliably pass. The key assertion is: when VexFlow rendering throws, the component shows the noteKey as text and does not show an `<svg>`.

**Step 2: Run tests to verify the new test fails**

Run: `npx vitest run client/src/common/notation/__tests__/StaffNote.test.tsx`
Expected: The error fallback test FAILS (currently no try/catch or fallback).

**Step 3: Implement the fixes in StaffNote.tsx**

Replace the full content of `client/src/common/notation/StaffNote.tsx` with:

```tsx
import { useRef, useEffect, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

interface StaffNoteProps {
  /** Note in "C4" format (letter + octave). */
  noteKey: string;
  /** Which clef to render. */
  clef: 'treble' | 'bass';
  /** Optional CSS class for the container div. */
  className?: string;
}

/** Convert "C4" → "c/4", "F#4" → "f#/4" for VexFlow. */
function toVexFlowKey(noteKey: string): string {
  const match = noteKey.match(/^([A-Ga-g][#b]?)(\d)$/);
  if (!match) {
    if (import.meta.env.DEV) {
      console.warn(`StaffNote: invalid noteKey "${noteKey}", falling back to b/4`);
    }
    return 'b/4';
  }
  return `${match[1].toLowerCase()}/${match[2]}`;
}

/**
 * Renders a single note on a 5-line staff with clef using VexFlow.
 * Dark-theme styled: gray staff lines, purple note head.
 * Falls back to plain-text note name if VexFlow rendering fails.
 */
export default function StaffNote({ noteKey, clef, className }: StaffNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous render and reset error state
    el.innerHTML = '';
    setHasError(false);

    try {
      const w = el.clientWidth || 200;
      const h = el.clientHeight || 120;

      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(w, h);
      const context = renderer.getContext();

      // Dark theme: gray staff lines
      context.setStrokeStyle('#94a3b8');
      context.setFillStyle('#94a3b8');

      const staveWidth = Math.max(100, w - 30);
      const stave = new Stave(10, 10, staveWidth);
      stave.addClef(clef);
      stave.setStyle({ strokeStyle: '#94a3b8', fillStyle: '#94a3b8' });
      stave.setContext(context).draw();

      // Create the note
      const vexKey = toVexFlowKey(noteKey);
      const note = new StaveNote({
        keys: [vexKey],
        duration: 'q',
        clef: clef,
      });
      // Purple note head
      note.setStyle({ fillStyle: '#a78bfa', strokeStyle: '#a78bfa' });

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables([note]);

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 70);
      voice.draw(context, stave);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('StaffNote: VexFlow rendering failed', err);
      }
      setHasError(true);
    }

    return () => {
      el.innerHTML = '';
    };
  }, [noteKey, clef]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center text-slate-400 text-lg font-mono ${className ?? ''}`}>
        {noteKey}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
```

Key changes from the previous version:
- `renderer.resize(w, h)` reads from `el.clientWidth` / `el.clientHeight` (falls back to 200/120)
- `staveWidth` computed from container width instead of hard-coded 170
- `format([voice], staveWidth - 70)` adapts to available width
- `try/catch` around all VexFlow logic sets `hasError` state
- Error fallback renders `noteKey` as plain text in a styled div
- DEV-only `console.warn` on error

**Step 4: Update the mock if needed**

The existing `client/src/test/vexflowMock.ts` mock should work for the responsive sizing changes (the `resize()` method is already a no-op). For the error test, the implementer may need to adjust the test approach depending on how Vitest handles module override. The mock itself does not need changes for the responsive sizing feature.

**Step 5: Run all StaffNote tests**

Run: `npx vitest run client/src/common/notation/__tests__/StaffNote.test.tsx`
Expected: All tests PASS (existing 4 + new error fallback test).

**Step 6: Run NoteReadingChallenge tests to verify no regression**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx`
Expected: 2 tests PASS.

**Step 7: Commit**

```bash
git add client/src/common/notation/StaffNote.tsx client/src/common/notation/__tests__/StaffNote.test.tsx
git commit -m "fix(notation): add responsive sizing and error fallback to StaffNote"
```

---

### Task 3: Migrate RhythmTapChallenge to use NotationImage

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx` (lines ~271-276)

**Step 1: Run existing tests to capture baseline**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/RhythmTapChallenge.test.tsx`
Expected: 3 tests PASS.

**Step 2: Add the import and replace the inline img**

At the top of `RhythmTapChallenge.tsx`, add this import alongside the existing ones:

```tsx
import NotationImage from '@/common/notation/NotationImage';
```

Then replace lines 271-276 (the `<img>` block):

```tsx
      <img
        src={`/images/notation/challenges/rhythm-patterns/${curatedPattern.id}.svg`}
        alt="Rhythm pattern notation"
        className="h-12 mx-auto mb-2 invert"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
```

With:

```tsx
      <NotationImage
        src={`/images/notation/challenges/rhythm-patterns/${curatedPattern.id}.svg`}
        alt="Rhythm pattern notation"
        size="sm"
        className="mb-2"
      />
```

**Step 3: Run tests to verify no regression**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/RhythmTapChallenge.test.tsx`
Expected: 3 tests PASS. The tests query by `img[alt="Rhythm pattern notation"]` and `img[src*="/images/notation/"]`, which will still match.

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/RhythmTapChallenge.tsx
git commit -m "refactor(melody-dungeon): migrate RhythmTapChallenge to shared NotationImage"
```

---

### Task 4: Migrate IntervalChallenge to use NotationImage + fix double call

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx` (lines ~5, ~294-301)

**Step 1: Run existing tests to capture baseline**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx`
Expected: 2 tests PASS.

**Step 2: Add the import and replace the inline img**

At the top of `IntervalChallenge.tsx`, add this import:

```tsx
import NotationImage from '@/common/notation/NotationImage';
```

Then replace lines 293-301 (the comment + conditional `<img>` block):

```tsx
      {/* Interval reference notation */}
      {getIntervalSvgUrl(challenge.interval.name) && (
        <img
          src={getIntervalSvgUrl(challenge.interval.name)}
          alt={`${challenge.interval.name} interval notation`}
          className="h-14 mx-auto mb-1 invert"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
```

With (using a local variable to fix the double call):

```tsx
      {/* Interval reference notation */}
      {(() => {
        const url = getIntervalSvgUrl(challenge.interval.name);
        return url ? (
          <NotationImage
            src={url}
            alt={`${challenge.interval.name} interval notation`}
            className="mb-1"
          />
        ) : null;
      })()}
```

> **Alternative (cleaner):** Extract the URL into a variable before the JSX return. The implementer should check if this is easy to do within the `StandardMode` component's render body. If `challenge` is available as a variable before the return, compute `const intervalUrl = getIntervalSvgUrl(challenge.interval.name);` once and use `{intervalUrl && <NotationImage src={intervalUrl} ... />}` in the JSX.

**Step 3: Run tests to verify no regression**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx`
Expected: 2 tests PASS. The test queries `img[alt*="interval"]` which still matches.

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx
git commit -m "refactor(melody-dungeon): migrate IntervalChallenge to NotationImage, fix double call"
```

---

### Task 5: Migrate VocabularyChallenge to use shared NotationImage

**Files:**
- Modify: `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx` (lines ~131-143, ~164, ~217)

**Step 1: Run existing tests to capture baseline**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx`
Note the number of passing tests.

**Step 2: Replace the local NotationImage with the shared one**

At the top of `VocabularyChallenge.tsx`, add this import:

```tsx
import NotationImage from '@/common/notation/NotationImage';
```

Then delete the local `NotationImage` function (lines 131-143):

```tsx
/** Displays LilyPond-engraved notation if an asset exists for this term. */
function NotationImage({ term }: { term: string }) {
  const src = getVocabNotationAsset(term);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${term} notation`}
      className="h-16 mx-auto mb-2 invert"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
```

The two usage sites (lines ~164 and ~217) currently call `<NotationImage term={...} />`. These need to change because the shared component takes `src` + `alt` props instead of `term`. Replace them.

In `StandardView` (around line 164), replace:

```tsx
      <NotationImage term={challenge.target.term} />
```

With:

```tsx
      {(() => {
        const notationSrc = getVocabNotationAsset(challenge.target.term);
        return notationSrc ? (
          <NotationImage src={notationSrc} alt={`${challenge.target.term} notation`} size="lg" className="mb-2" />
        ) : null;
      })()}
```

In `OppositesView` (around line 217), replace:

```tsx
      <NotationImage term={challenge.correctEntry.term} />
```

With:

```tsx
      {(() => {
        const notationSrc = getVocabNotationAsset(challenge.correctEntry.term);
        return notationSrc ? (
          <NotationImage src={notationSrc} alt={`${challenge.correctEntry.term} notation`} size="lg" className="mb-2" />
        ) : null;
      })()}
```

> **Alternative (cleaner):** Create a thin local wrapper function at the top of the file instead of using IIFEs:
> ```tsx
> function VocabNotation({ term }: { term: string }) {
>   const src = getVocabNotationAsset(term);
>   if (!src) return null;
>   return <NotationImage src={src} alt={`${term} notation`} size="lg" className="mb-2" />;
> }
> ```
> Then usage stays clean: `<VocabNotation term={challenge.target.term} />`. This is the **recommended approach** — it preserves the same usage pattern while delegating to the shared component.

**Step 3: Run tests to verify no regression**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/VocabularyChallenge.test.tsx`
Expected: Same number of passing tests as Step 1.

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx
git commit -m "refactor(melody-dungeon): migrate VocabularyChallenge to shared NotationImage"
```

---

### Task 6: Full verification

**Files:** None (read-only verification)

**Step 1: Run all melody-dungeon tests**

Run: `npx vitest run client/src/games/melody-dungeon/`
Expected: All tests pass (180+ tests).

**Step 2: Run all common/notation tests**

Run: `npx vitest run client/src/common/notation/`
Expected: All tests pass (existing StaffNote tests + new NotationImage tests).

**Step 3: TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -i "notation\|StaffNote\|NotationImage\|RhythmTap\|IntervalChallenge\|VocabularyChallenge"`
Expected: No output (no TypeScript errors in Phase 5 files). Pre-existing errors in other games are expected and not in scope.

**Step 4: Commit any remaining fixes**

If any tests fail or TypeScript issues appear in Phase 5 files, fix them and commit.

```bash
git commit -m "fix(notation): address Phase 5 verification issues"
```
