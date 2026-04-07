# Codebase Reorganization Design

**Date**: 2026-03-01
**Status**: Approved

## Problem

The codebase has 80+ games with code split across 3 flat directories (`components/`, `lib/gameLogic/`, `pages/games/`). This makes it hard to navigate, maintain, and extend both simple and complex games.

## Solution: Full Game-Centric Reorganization

Reorganize into a `src/games/` directory organized by category with full co-location, and move shared code into `src/common/`.

## Target Structure

### `src/games/` — All Game Code

Each game gets its own folder under its category:

```
src/games/
├── instruments/
│   ├── crane-game/
│   ├── family-sorter/
│   └── detective/
├── pitch/
│   ├── pitch-001/
│   │   ├── Pitch001Game.tsx
│   │   ├── logic.ts
│   │   ├── modes.ts
│   │   ├── page.tsx
│   │   └── __tests__/
│   ├── pitch-003/
│   ├── pitch-004/
│   ├── pitch-005/
│   └── pitch-006/
├── rhythm/
│   ├── rhythm-001/ through rhythm-007/
│   └── fast-or-slow-race/
├── harmony/
│   ├── harmony-001/
│   ├── harmony-003/
│   └── harmony-004/
├── timbre/
│   ├── timbre-001/ through timbre-003/
├── dynamics/
│   ├── dynamics-001/ through dynamics-003/
├── theory/
│   ├── theory-001/ through theory-004/
├── listen/
│   ├── listen-001/ through listen-004/
│   └── same-or-different/
├── compose/
│   ├── compose-001/
│   └── compose-002/
├── cross-curricular/
│   ├── cross-001/ through cross-003/
├── advanced/
│   ├── advanced-001/
│   └── challenge-001/
├── melody-dungeon/
│   ├── components/
│   ├── logic/
│   ├── MelodyDungeonGame.tsx
│   ├── page.tsx
│   └── __tests__/
├── cadence-quest/
│   ├── components/
│   ├── logic/
│   ├── CadenceQuestGame.tsx
│   ├── page.tsx
│   └── __tests__/
├── finish-the-tune/
│   ├── components/
│   ├── logic/
│   ├── FinishTheTuneGame.tsx
│   ├── page.tsx
│   └── __tests__/
├── staff-invaders/
├── staff-wars/
├── treble-runner/
└── tools/
    ├── sight-reading-randomizer/
    └── rhythm-randomizer/
```

**Simple games**: Flat files (component + logic + modes + page + tests).
**Complex games**: Subdirectories for `components/` and `logic/` within their folder.
**Standalone complex games**: Sit at the category level (they are their own category).

### `src/common/` — Shared Code

```
src/common/
├── ui/                    # Was components/ui/
├── hooks/                 # Was hooks/
├── audio/                 # audioService.ts
├── utils/                 # gameUtils, imageUtils, utils, schema
├── characters/            # Was components/characters/
├── instruments/           # instrumentLibrary.ts
├── music/                 # melodyLibrary.ts
├── icons/                 # Was components/icons/
├── difficulty/            # difficultyAdapter.ts
└── query/                 # queryClient.ts
```

### What Stays Outside

- `src/pages/` — Non-game pages only (Home, Landing, UnderDevelopment)
- `src/config/` — Game registry (games.ts) and route config
- `src/theme/` — Tailwind theme
- `src/assets/` — Static assets
- `src/App.tsx`, `src/main.tsx` — App entry points

## Import Path Strategy

The `@/` alias continues to point to `src/`. Example changes:

| Before | After |
|--------|-------|
| `@/components/Pitch001Game` | `@/games/pitch/pitch-001/Pitch001Game` |
| `@/lib/gameLogic/pitch-001Logic` | `@/games/pitch/pitch-001/logic` |
| `@/lib/audioService` | `@/common/audio/audioService` |
| `@/components/ui/button` | `@/common/ui/button` |
| `@/hooks/useAudioService` | `@/common/hooks/useAudioService` |

Each game folder exports its page component via `index.ts` for the router.

## Migration Strategy

Incremental, one category at a time:

1. **Create `src/common/`** — Move shared code, update all imports, verify build
2. **Move games by category** — Start with small categories (dynamics, timbre), then larger ones
3. **Move complex games last** — melody-dungeon, cadence-quest, finish-the-tune
4. **Clean up** — Remove empty directories, delete backup files
5. **Update router** — Point all routes to new page locations
6. **Update game registry** — Update `games.ts` if it references file paths

Each step is committed separately so issues can be isolated.

## Testing

After each migration step:
- App builds without errors (`npm run build`)
- All existing tests pass
- Spot-check affected games in the browser

## Risks

- **Import breakage**: Mitigated by incremental migration and build verification after each step
- **Git history**: File moves may complicate `git blame`. Using `git mv` preserves rename tracking
- **Merge conflicts**: If other work is in progress on game files, coordinate timing
