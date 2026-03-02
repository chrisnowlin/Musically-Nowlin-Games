# Phase 5: Melody Dungeon Notation Polish — Design

**Goal:** Unify notation display across Melody Dungeon challenges by extracting shared components, fixing VexFlow rendering issues, and standardizing sizing.

**Architecture:** Extract a reusable `NotationImage` component for static LilyPond SVGs and fix the VexFlow `StaffNote` component for dynamic rendering. Migrate three challenges to use the shared component.

**Scope:** Melody Dungeon only. No new LilyPond SVGs or game logic changes.

---

## Problems Addressed

1. **Inconsistent sizing** — Notation images use h-12, h-14, and h-16 across challenges with no shared standard.
2. **VexFlow overflow** — StaffNote renders a 200×120px SVG into a 112px-tall container (8px overflow).
3. **No shared notation image component** — Each challenge duplicates the `<img>` + `invert` + `onError` pattern.
4. **Double function call** — `getIntervalSvgUrl()` called twice per render in IntervalChallenge.
5. **Two dark-theme strategies** — CSS `invert` for LilyPond vs explicit VexFlow colors (architecturally correct but worth documenting).
6. **No error state on VexFlow** — SVG images gracefully hide on error, but StaffNote fails silently.

## Design

### 1. Shared `NotationImage` Component

**Location:** `client/src/common/notation/NotationImage.tsx`

A reusable component for displaying LilyPond-rendered SVG notation with consistent dark-theme styling.

```
Props:
  src: string                    — URL to the SVG image
  alt: string                    — Accessible alt text
  size?: 'sm' | 'md' | 'lg'     — sm=h-12, md=h-14 (default), lg=h-16
  className?: string             — Additional CSS classes
```

Behavior:
- Renders `<img>` with CSS `invert` filter, `mx-auto`, and size-based height
- On load error, hides the image via `display: none`
- Default size is `md` (h-14)

### 2. VexFlow StaffNote Fixes

**Fix 1 — Responsive sizing:** Read `el.clientWidth` and `el.clientHeight` instead of hard-coded 200×120. Falls back to 200×120 if the element hasn't been laid out.

**Fix 2 — Error boundary:** Wrap VexFlow rendering in try/catch. On error, set `hasError` state and render the note name as plain text fallback (e.g., "C4"). Log errors in DEV mode only.

### 3. Challenge Migration

| Challenge | Size | Notes |
|-----------|------|-------|
| RhythmTapChallenge | `sm` | Rhythm patterns are wide/short |
| IntervalChallenge | `md` (default) | Fix double `getIntervalSvgUrl` call |
| VocabularyChallenge | `lg` | Symbols need more height; remove local `NotationImage` |

### 4. Testing

- Unit tests for `NotationImage` (renders, applies invert, hides on error)
- Unit test for `StaffNote` error fallback
- Update `StaffNote` test to verify responsive sizing
- Existing challenge tests continue passing unchanged

## Not In Scope

- New LilyPond source files or SVG generation
- Game logic, scoring, or challenge mechanics
- Asset lookup modules (`notationAssets.ts`, `intervalAssets.ts`)
- Games outside Melody Dungeon
- Unifying VexFlow and LilyPond into a single rendering strategy (they serve different purposes)
