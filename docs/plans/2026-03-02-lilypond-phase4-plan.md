# Phase 4: Intervals + VexFlow Upgrade — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add LilyPond-rendered interval reference images to the IntervalChallenge and upgrade NoteReadingChallenge from hand-coded SVG to VexFlow for reliable, professional-quality notation rendering.

**Architecture:** Two parallel tracks: (1) LilyPond generates 7 static interval SVGs showing canonical ascending intervals from C4, integrated into the StandardMode sub-component (T3-T5). (2) A new VexFlow-based `StaffNote` component replaces the hand-coded `StaffSVG` in NoteReadingChallenge, fixing cross-device Unicode clef rendering issues and leveraging VexFlow's automatic ledger line handling.

**Tech Stack:** LilyPond 2.24.4, VexFlow 5.0.0 (already installed), React/TypeScript, Vitest, Tailwind CSS

---

## Context

### Existing files you need to know about

- `lilypond/includes/musically-nowlin-style.ily` — House style include (A10 paper, no bar numbers, no time sig, staff size 18)
- `lilypond/scripts/build-notation.sh` — Build script: `find lilypond/ -name '*.ly'` → SVG to `client/public/images/notation/`
- `client/src/common/notation/notationAssets.ts` — Asset lookup module with `VOCAB_ASSET_MAP` and helper functions
- `client/src/common/notation/vexflowUtils.ts` — Canvas-based staff utils for Staff Invaders (NOT VexFlow library — hand-coded canvas). Has a `NOTE_MAP` record mapping "C4"→"c/4" format.
- `client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx` — Three mode sub-components: `HighLowMode` (T1), `StepSkipMode` (T2), `StandardMode` (T3-T5). All audio-only, no visual notation.
- `client/src/games/melody-dungeon/challenges/NoteReadingChallenge.tsx` — Uses hand-coded `StaffSVG` component with Unicode clef characters (`\uD834\uDD1E`). Renders single note on treble or bass staff.
- `client/src/games/melody-dungeon/logic/difficultyAdapter.ts` — `getIntervalParams(tier)` returns `{ mode, intervals: { name, semitones }[] }`. StandardMode intervals are always ascending (positive semitones).

### Key architectural decisions

1. **Interval SVGs show canonical examples only** — e.g., C4→E4 for a 3rd. The actual challenge plays random base notes, so the SVG is a reference card, not a depiction of the specific notes being played.
2. **Only ascending intervals** — StandardMode (T3-T5) always plays ascending intervals. Descending variants can be added later.
3. **Interval SVGs appear in feedback** — Shown after the student answers, as a "here's what that interval looks like on a staff" teaching moment. This avoids giving away answers to students who can read notation.
4. **VexFlow replaces only StaffSVG** — The `NoteReadingChallenge` component logic stays the same; only the rendering sub-component changes. VexFlow draws clefs as SVG paths (no Unicode dependency), handles ledger lines automatically, and produces professional notation.
5. **Dark theme via VexFlow styling API** — Set stroke/fill colors to match the existing game palette (gray staff lines `#94a3b8`, purple note heads `#a78bfa`).

---

### Task 1: Create interval LilyPond source files

**Files:**
- Create: `lilypond/challenges/intervals/unison.ly`
- Create: `lilypond/challenges/intervals/2nd.ly`
- Create: `lilypond/challenges/intervals/3rd.ly`
- Create: `lilypond/challenges/intervals/4th.ly`
- Create: `lilypond/challenges/intervals/5th.ly`
- Create: `lilypond/challenges/intervals/6th.ly`
- Create: `lilypond/challenges/intervals/octave.ly`

**Step 1: Create interval .ly files**

All 7 files follow the same template. Each shows two quarter notes on a treble clef staff using `\cadenzaOn` (no barlines). Use the existing house style.

LilyPond note names: `c'` = C4, `d'` = D4, `e'` = E4, `f'` = F4, `g'` = G4, `a'` = A4, `b'` = B4, `c''` = C5.

```lilypond
%% unison.ly — Unison: C4 to C4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 c'4
}
```

```lilypond
%% 2nd.ly — Major 2nd: C4 to D4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 d'4
}
```

```lilypond
%% 3rd.ly — Major 3rd: C4 to E4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 e'4
}
```

```lilypond
%% 4th.ly — Perfect 4th: C4 to F4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 f'4
}
```

```lilypond
%% 5th.ly — Perfect 5th: C4 to G4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 g'4
}
```

```lilypond
%% 6th.ly — Major 6th: C4 to A4
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 a'4
}
```

```lilypond
%% octave.ly — Octave: C4 to C5
\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \clef treble
  \cadenzaOn
  c'4 c''4
}
```

**Step 2: Build and verify SVGs**

Run: `npm run build:notation`
Expected: 7 new SVGs in `client/public/images/notation/challenges/intervals/`

Verify: `ls client/public/images/notation/challenges/intervals/*.svg | wc -l` → 7

Verify total: `find client/public/images/notation -name '*.svg' | wc -l` → ~102 (95 existing + 7 new)

**Step 3: Commit**

```bash
git add lilypond/challenges/intervals/
git commit -m "feat(lilypond): add 7 interval reference SVGs (unison through octave)"
```

---

### Task 2: Interval asset lookup module (TDD)

**Files:**
- Create: `client/src/games/melody-dungeon/logic/intervalAssets.ts`
- Create: `client/src/games/melody-dungeon/__tests__/intervalAssets.test.ts`

**Step 1: Write the failing test**

```typescript
// client/src/games/melody-dungeon/__tests__/intervalAssets.test.ts
import { describe, it, expect } from 'vitest';
import { getIntervalSvgUrl, INTERVAL_ASSETS } from '../logic/intervalAssets';

describe('intervalAssets', () => {
  it('has an entry for each standard-mode interval name', () => {
    const expectedNames = ['Unison', '2nd', '3rd', '4th', '5th', '6th', 'Octave'];
    for (const name of expectedNames) {
      expect(INTERVAL_ASSETS[name]).toBeDefined();
    }
  });

  it('returns correct SVG URL for a known interval', () => {
    expect(getIntervalSvgUrl('3rd')).toBe(
      '/images/notation/challenges/intervals/3rd.svg'
    );
  });

  it('returns correct SVG URL for octave', () => {
    expect(getIntervalSvgUrl('Octave')).toBe(
      '/images/notation/challenges/intervals/octave.svg'
    );
  });

  it('returns undefined for unknown interval name', () => {
    expect(getIntervalSvgUrl('Unknown')).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/intervalAssets.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// client/src/games/melody-dungeon/logic/intervalAssets.ts

/**
 * Maps interval names (from getIntervalParams) to SVG file IDs
 * under lilypond/challenges/intervals/.
 */
export const INTERVAL_ASSETS: Record<string, string> = {
  'Unison':  'unison',
  '2nd':     '2nd',
  '3rd':     '3rd',
  '4th':     '4th',
  '5th':     '5th',
  '6th':     '6th',
  'Octave':  'octave',
};

/**
 * Get the public SVG URL for an interval reference image.
 * Returns undefined if no asset exists for the given interval name.
 */
export function getIntervalSvgUrl(intervalName: string): string | undefined {
  const fileId = INTERVAL_ASSETS[intervalName];
  if (!fileId) return undefined;
  return `/images/notation/challenges/intervals/${fileId}.svg`;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/intervalAssets.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/logic/intervalAssets.ts \
       client/src/games/melody-dungeon/__tests__/intervalAssets.test.ts
git commit -m "feat(melody-dungeon): add interval asset lookup module with tests"
```

---

### Task 3: Integrate interval notation into IntervalChallenge (TDD)

**Files:**
- Create: `client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx`
- Modify: `client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx`

**Step 1: Write the failing test**

```typescript
// client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import IntervalChallenge from '../challenges/IntervalChallenge';

// Mock dungeonAudio so no real audio plays
vi.mock('../dungeonAudio', () => ({
  playTwoNotes: vi.fn(),
  getFrequency: vi.fn((key: string) => 440),
  ALL_NOTE_KEYS: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
}));

describe('IntervalChallenge - notation', () => {
  it('renders a notation image in standard mode (tier 3)', () => {
    const { container } = render(
      <IntervalChallenge tier={3} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt*="interval"]');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toMatch(/challenges\/intervals/);
  });

  it('does NOT render notation in highLow mode (tier 1)', () => {
    const { container } = render(
      <IntervalChallenge tier={1} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt*="interval"]');
    expect(img).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx`
Expected: FAIL — no `img[alt*="interval"]` found (notation not yet added)

**Step 3: Implement — add notation image to StandardMode**

In `IntervalChallenge.tsx`, add import at the top:

```typescript
import { getIntervalSvgUrl } from '../logic/intervalAssets';
```

In the `StandardMode` component JSX, add the notation image between the title and the description text:

```tsx
<h3 className="text-lg font-bold text-cyan-200">Name the Interval!</h3>

{/* Interval reference notation */}
{getIntervalSvgUrl(challenge.interval.name) && (
  <img
    src={getIntervalSvgUrl(challenge.interval.name)}
    alt={`${challenge.interval.name} interval notation`}
    className="h-14 mx-auto mb-1 invert"
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
  />
)}

<p className="text-gray-400 text-sm">Listen to the two notes and identify the interval.</p>
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx`
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/IntervalChallenge.tsx \
       client/src/games/melody-dungeon/__tests__/IntervalChallenge.test.tsx
git commit -m "feat(melody-dungeon): add interval notation SVGs to StandardMode challenge"
```

---

### Task 4: Create VexFlow StaffNote component (TDD)

**Files:**
- Create: `client/src/common/notation/StaffNote.tsx`
- Create: `client/src/common/notation/__tests__/StaffNote.test.tsx`

**Step 1: Write the failing test**

Note: VexFlow renders SVG elements. In jsdom (Vitest), basic SVG operations work. If VexFlow fails in jsdom, we mock it.

```typescript
// client/src/common/notation/__tests__/StaffNote.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StaffNote from '../StaffNote';

describe('StaffNote', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <StaffNote noteKey="C4" clef="treble" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with bass clef without crashing', () => {
    const { container } = render(
      <StaffNote noteKey="G2" clef="bass" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StaffNote noteKey="E4" clef="treble" className="my-custom-class" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('my-custom-class')).toBe(true);
  });

  it('re-renders when noteKey changes', () => {
    const { container, rerender } = render(
      <StaffNote noteKey="C4" clef="treble" />
    );
    const svg1 = container.querySelector('svg');
    expect(svg1).toBeInTheDocument();

    rerender(<StaffNote noteKey="G4" clef="treble" />);
    const svg2 = container.querySelector('svg');
    expect(svg2).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/common/notation/__tests__/StaffNote.test.tsx`
Expected: FAIL — module not found

**Step 3: Write the VexFlow StaffNote component**

```typescript
// client/src/common/notation/StaffNote.tsx
import { useRef, useEffect } from 'react';
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
  if (!match) return 'b/4';
  return `${match[1].toLowerCase()}/${match[2]}`;
}

/**
 * Renders a single note on a 5-line staff with clef using VexFlow.
 * Dark-theme styled: gray staff lines, purple note head.
 */
export default function StaffNote({ noteKey, clef, className }: StaffNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous render
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(200, 120);
    const context = renderer.getContext();

    // Dark theme: gray staff lines
    context.setStrokeStyle('#94a3b8');
    context.setFillStyle('#94a3b8');

    const stave = new Stave(10, 10, 170);
    stave.addClef(clef);
    stave.setStyle({ strokeStyle: '#94a3b8', fillStyle: '#94a3b8' });
    stave.draw(context);

    // Create the note
    const vexKey = toVexFlowKey(noteKey);
    const note = new StaveNote({
      keys: [vexKey],
      duration: 'q',
      clef: clef,
    });
    // Purple note head
    note.setStyle({ fillStyle: '#a78bfa', strokeStyle: '#a78bfa' });

    const voice = new Voice({ num_beats: 1, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables([note]);

    new Formatter().joinVoices([voice]).format([voice], 100);
    voice.draw(context, stave);

    return () => {
      el.innerHTML = '';
    };
  }, [noteKey, clef]);

  return <div ref={containerRef} className={className} />;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/common/notation/__tests__/StaffNote.test.tsx`
Expected: 4 tests PASS

If VexFlow fails in jsdom (missing DOM APIs), create a mock:
```typescript
vi.mock('vexflow', () => {
  // Minimal mock that creates an SVG element
  const mockContext = {
    setStrokeStyle: vi.fn(),
    setFillStyle: vi.fn(),
  };
  return {
    Renderer: class {
      static Backends = { SVG: 'svg' };
      constructor(el: HTMLElement) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        el.appendChild(svg);
      }
      resize() {}
      getContext() { return mockContext; }
    },
    Stave: class {
      addClef() { return this; }
      setStyle() {}
      draw() {}
    },
    StaveNote: class {
      setStyle() {}
    },
    Voice: class {
      setStrict() {}
      addTickables() {}
      draw() {}
    },
    Formatter: class {
      joinVoices() { return this; }
      format() { return this; }
    },
  };
});
```

**Step 5: Commit**

```bash
git add client/src/common/notation/StaffNote.tsx \
       client/src/common/notation/__tests__/StaffNote.test.tsx
git commit -m "feat(notation): add VexFlow StaffNote component for single-note staff rendering"
```

---

### Task 5: Upgrade NoteReadingChallenge to use VexFlow StaffNote (TDD)

**Files:**
- Create: `client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx`
- Modify: `client/src/games/melody-dungeon/challenges/NoteReadingChallenge.tsx`

**Step 1: Write the failing test**

```typescript
// client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import NoteReadingChallenge from '../challenges/NoteReadingChallenge';

// Mock dungeonAudio
vi.mock('../dungeonAudio', () => ({
  playNote: vi.fn(),
  noteKeyToName: (key: string) => key.replace(/\d+/, ''),
}));

describe('NoteReadingChallenge', () => {
  it('renders an SVG for the staff notation (VexFlow)', () => {
    const { container } = render(
      <NoteReadingChallenge tier={1} onResult={() => {}} />
    );
    // VexFlow renders to SVG inside a div
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders 7 note-name buttons', () => {
    const { container } = render(
      <NoteReadingChallenge tier={1} onResult={() => {}} />
    );
    const buttons = container.querySelectorAll('button');
    // 7 note buttons + 1 "Hear it again" text link/button = 8
    expect(buttons.length).toBeGreaterThanOrEqual(7);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx`
Expected: Test 1 likely FAILS because the current `StaffSVG` renders `<svg>` via JSX (might pass). If it passes, that's fine — the test serves as a regression guard.

**Step 3: Replace StaffSVG with VexFlow StaffNote**

In `NoteReadingChallenge.tsx`:

1. Remove the entire `StaffSVG` component and its supporting constants (`TREBLE_NOTE_POSITIONS`, `BASS_NOTE_POSITIONS`, `TREBLE_CLEF_NOTES`, `BASS_CLEF_NOTES`, `TREBLE_CLEF`, `BASS_CLEF`, `StaffProps`).

2. Replace with the VexFlow import:

```typescript
import StaffNote from '@/common/notation/StaffNote';
```

3. Keep: `TREBLE_CLEF_NOTES` and `BASS_CLEF_NOTES` sets since they're used in the `mixed` mode note-pool filtering.

Redefine them without the position maps:

```typescript
const TREBLE_CLEF_NOTES = new Set([
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5',
]);
const BASS_CLEF_NOTES = new Set([
  'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4',
]);
```

4. In the JSX, replace:

```tsx
{targetNote && <StaffSVG noteKey={targetNote} useBassClef={activeClef === 'bass'} />}
```

with:

```tsx
{targetNote && (
  <StaffNote
    noteKey={targetNote}
    clef={activeClef}
    className="w-full max-w-[240px] h-28 mx-auto"
  />
)}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx`
Expected: 2 tests PASS

Also run all melody-dungeon tests to check for regressions:
Run: `npx vitest run client/src/games/melody-dungeon`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/NoteReadingChallenge.tsx \
       client/src/games/melody-dungeon/__tests__/NoteReadingChallenge.test.tsx
git commit -m "feat(melody-dungeon): upgrade NoteReadingChallenge to VexFlow StaffNote"
```

---

### Task 6: Full verification

**Step 1: Run all melody-dungeon and notation tests**

Run: `npx vitest run client/src/games/melody-dungeon client/src/common/notation`
Expected: All tests PASS (should be ~190+ tests)

**Step 2: TypeScript check**

Run: `cd client && npx tsc --noEmit 2>&1 | grep -v 'challenge-pool.ts'`
Expected: No new errors (existing `challenge-pool.ts` errors are pre-existing)

**Step 3: Verify SVG count**

Run: `find client/public/images/notation -name '*.svg' | wc -l`
Expected: ~102 SVGs (95 existing + 7 interval)

**Step 4: Visual check (optional)**

Open a few interval SVGs in a browser to confirm they render two notes on a staff:
- `client/public/images/notation/challenges/intervals/3rd.svg`
- `client/public/images/notation/challenges/intervals/octave.svg`

**Step 5: Commit if any final fixes were needed**
