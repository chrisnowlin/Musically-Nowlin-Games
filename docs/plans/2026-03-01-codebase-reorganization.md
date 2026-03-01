# Codebase Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the codebase from a flat file structure into a game-centric directory layout with `src/games/` (by category) and `src/common/` (shared code), with full co-location of each game's component, logic, modes, page, and tests.

**Architecture:** Each game becomes a self-contained folder under its category in `src/games/`. Shared code (UI, hooks, audio, utils) moves to `src/common/`. All imports use the `@/` path alias which maps to `client/src/`. The migration is incremental — one phase at a time, verified by a build after each.

**Tech Stack:** React, TypeScript, Vite, wouter (router), vitest, Tailwind CSS, shadcn/ui

---

## Game-to-Category Mapping

This table maps every standalone game to its target category. Numbered series (pitch-001, rhythm-001, etc.) naturally belong to their named category.

| Game ID | Component File | Category |
|---------|---------------|----------|
| instrument-crane | InstrumentCraneGame.tsx | instruments |
| instrument-family-sorter | InstrumentFamilySorterGame.tsx | instruments |
| instrument-detective | InstrumentDetectiveGame.tsx | instruments |
| pitch-match | Game.tsx (PitchMatchGame in pages) | pitch |
| pitch-ladder-jump | PitchLadderJumpGame.tsx | pitch |
| pitch-perfect-path | PitchPerfectPathGame.tsx | pitch |
| pitch-001 through pitch-006 | Pitch001Game.tsx etc. | pitch |
| scale-climber | ScaleClimberGame.tsx | pitch |
| rhythm-echo-challenge | RhythmEchoChallengeGame.tsx | rhythm |
| fast-or-slow-race | FastOrSlowRaceGame.tsx | rhythm |
| beat-keeper-challenge | BeatKeeperChallengeGame.tsx | rhythm |
| steady-or-bouncy-beat | SteadyOrBouncyBeatGame.tsx | rhythm |
| rhythm-puzzle-builder | RhythmPuzzleBuilderGame.tsx | rhythm |
| rest-finder | RestFinderGame.tsx | rhythm |
| musical-freeze-dance | MusicalFreezeDanceGame.tsx | rhythm |
| rhythm-001 through rhythm-007 | Rhythm001Game.tsx etc. | rhythm |
| harmony-helper | HarmonyHelperGame.tsx | harmony |
| harmony-001 (no component, modes only) | — | harmony |
| harmony-002 through harmony-004 | Harmony002Game.tsx etc. | harmony |
| happy-or-sad-melodies | HappyOrSadMelodiesGame.tsx | harmony |
| timbre-001 through timbre-003 | Timbre001Game.tsx etc. | timbre |
| tone-color-match | ToneColorMatchGame.tsx | timbre |
| dynamics-001 through dynamics-003 | Dynamics001Game.tsx etc. | dynamics |
| loud-or-quiet-safari | LoudOrQuietSafariGame.tsx | dynamics |
| long-or-short-notes | LongOrShortNotesGame.tsx | dynamics |
| theory-001 through theory-004 | Theory001Game.tsx etc. | theory |
| compose-001 | Compose001Game.tsx | compose |
| compose-002 | Compose002Game.tsx | compose |
| compose-your-song | ComposeYourSongGame.tsx | compose |
| listen-001 through listen-004 | Listen001Game.tsx etc. | listen |
| same-or-different | SameOrDifferentGame.tsx | listen |
| echo-location-challenge | EchoLocationChallengeGame.tsx | listen |
| melody-memory-match | MelodyMemoryMatchGame.tsx | listen |
| musical-simon-says | MusicalSimonSaysGame.tsx | listen |
| musical-pattern-detective | MusicalPatternDetectiveGame.tsx | listen |
| name-that-animal-tune | NameThatAnimalTuneGame.tsx | listen |
| how-many-notes | HowManyNotesGame.tsx | listen |
| musical-opposites | MusicalOppositesGame.tsx | listen |
| cross-001 through cross-003 | Cross001Game.tsx etc. | cross-curricular |
| musical-math | MusicalMathGame.tsx | cross-curricular |
| musical-story-time | MusicalStoryTimeGame.tsx | cross-curricular |
| world-music-explorer | WorldMusicExplorerGame.tsx | cross-curricular |
| advanced-001 | Advanced001Game.tsx | advanced |
| challenge-001 | Challenge001Game.tsx | advanced |
| melody-dungeon | MelodyDungeonGame.tsx | melody-dungeon |
| cadence-quest | CadenceQuestGame.tsx | cadence-quest |
| finish-the-tune | FinishTheTuneGame.tsx | finish-the-tune |
| staff-invaders | StaffInvadersGame.tsx | staff-invaders |
| treble-runner | (page only, TrebleRunnerGamePage) | treble-runner |
| animal-orchestra-conductor | AnimalOrchestraConductorV2.tsx | animal-orchestra |
| sight-reading-randomizer | SightReadingRandomizerTool.tsx | tools |
| rhythm-randomizer | RhythmRandomizerTool.tsx | tools |

**Uncategorized components** (shared, not games — move to `common/`):
- `Game.tsx` — base game wrapper
- `ResponsiveGameLayout.tsx` — layout container
- `ScoreDisplay.tsx` — score display
- `ErrorBoundary.tsx` — error boundary
- `AudioErrorFallback.tsx` — audio error UI
- `AnimalCharacter.tsx` — character component (duplicate of characters/)

---

## Target Directory Structure

```
client/src/
├── games/
│   ├── instruments/
│   │   ├── crane-game/
│   │   │   ├── InstrumentCraneGame.tsx
│   │   │   └── page.tsx
│   │   ├── family-sorter/
│   │   └── detective/
│   ├── pitch/
│   │   ├── pitch-match/
│   │   │   ├── Game.tsx (the PitchMatchGame)
│   │   │   └── page.tsx
│   │   ├── pitch-001/
│   │   │   ├── Pitch001Game.tsx
│   │   │   ├── logic.ts
│   │   │   ├── modes.ts
│   │   │   ├── page.tsx
│   │   │   └── __tests__/
│   │   ├── pitch-003/ through pitch-006/
│   │   ├── pitch-ladder-jump/
│   │   ├── pitch-perfect-path/
│   │   └── scale-climber/
│   ├── rhythm/
│   │   ├── rhythm-001/ through rhythm-007/
│   │   ├── rhythm-echo-challenge/
│   │   ├── fast-or-slow-race/
│   │   ├── beat-keeper-challenge/
│   │   ├── steady-or-bouncy-beat/
│   │   ├── rhythm-puzzle-builder/
│   │   ├── rest-finder/
│   │   └── musical-freeze-dance/
│   ├── harmony/
│   │   ├── harmony-001/ through harmony-004/
│   │   ├── harmony-helper/
│   │   └── happy-or-sad-melodies/
│   ├── timbre/
│   │   ├── timbre-001/ through timbre-003/
│   │   └── tone-color-match/
│   ├── dynamics/
│   │   ├── dynamics-001/ through dynamics-003/
│   │   ├── loud-or-quiet-safari/
│   │   └── long-or-short-notes/
│   ├── theory/
│   │   └── theory-001/ through theory-004/
│   ├── compose/
│   │   ├── compose-001/
│   │   ├── compose-002/
│   │   └── compose-your-song/
│   ├── listen/
│   │   ├── listen-001/ through listen-004/
│   │   ├── same-or-different/
│   │   ├── echo-location-challenge/
│   │   ├── melody-memory-match/
│   │   ├── musical-simon-says/
│   │   ├── musical-pattern-detective/
│   │   ├── name-that-animal-tune/
│   │   ├── how-many-notes/
│   │   └── musical-opposites/
│   ├── cross-curricular/
│   │   ├── cross-001/ through cross-003/
│   │   ├── musical-math/
│   │   ├── musical-story-time/
│   │   └── world-music-explorer/
│   ├── advanced/
│   │   ├── advanced-001/
│   │   └── challenge-001/
│   ├── melody-dungeon/
│   │   ├── components/
│   │   │   ├── DungeonGrid.tsx
│   │   │   ├── HUD.tsx
│   │   │   ├── MiniMap.tsx
│   │   │   ├── ChallengeModal.tsx
│   │   │   ├── MerchantModal.tsx
│   │   │   ├── ChestRewardModal.tsx
│   │   │   ├── UseItemsModal.tsx
│   │   │   ├── DirectionsModal.tsx
│   │   │   ├── MobileDPad.tsx
│   │   │   └── challenges/
│   │   ├── logic/
│   │   │   ├── dungeonGenerator.ts
│   │   │   ├── dungeonTypes.ts
│   │   │   ├── merchantItems.ts
│   │   │   ├── challengeHelpers.ts
│   │   │   └── difficultyAdapter.ts
│   │   ├── audio/
│   │   │   └── dungeonAudio.ts
│   │   ├── theme/
│   │   │   └── dungeonThemes.ts
│   │   ├── MelodyDungeonGame.tsx
│   │   ├── page.tsx
│   │   └── __tests__/
│   ├── cadence-quest/
│   │   ├── components/ (existing 10 files)
│   │   ├── logic/ (existing 10 files from lib/cadence-quest/)
│   │   ├── CadenceQuestGame.tsx
│   │   ├── page.tsx
│   │   └── __tests__/
│   ├── finish-the-tune/
│   │   ├── components/ (existing component files)
│   │   ├── logic/
│   │   ├── FinishTheTuneGame.tsx
│   │   ├── page.tsx
│   │   └── __tests__/
│   ├── staff-invaders/
│   │   ├── components/ (existing 5 files)
│   │   ├── StaffInvadersGame.tsx
│   │   ├── page.tsx
│   │   └── __tests__/
│   ├── treble-runner/
│   │   └── page.tsx
│   ├── animal-orchestra/
│   │   ├── components/ (existing aoc-v2/ files)
│   │   ├── logic/ (existing lib/aoc-v2/ files)
│   │   ├── AnimalOrchestraConductorV2.tsx
│   │   └── page.tsx
│   ├── staff-wars/
│   │   └── StaffCanvas.tsx
│   └── tools/
│       ├── sight-reading-randomizer/
│       │   ├── components/ (existing SightReadingRandomizer/ files)
│       │   ├── logic/ (existing lib/sightReadingRandomizer/ files)
│       │   ├── hooks/
│       │   │   └── useSightReadingRandomizer.ts
│       │   ├── SightReadingRandomizerTool.tsx
│       │   └── page.tsx
│       └── rhythm-randomizer/
│           ├── components/ (existing RhythmRandomizer/ files)
│           ├── logic/ (existing lib/rhythmRandomizer/ files)
│           ├── hooks/
│           │   └── useRhythmRandomizer.ts
│           ├── RhythmRandomizerTool.tsx
│           └── page.tsx
│
├── common/
│   ├── ui/ (48 shadcn components, moved from components/ui/)
│   ├── hooks/
│   │   ├── useAudioService.ts
│   │   ├── useGameCleanup.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── usePhilharmoniaInstruments.ts
│   │   ├── useViewport.ts
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── __tests__/
│   ├── audio/
│   │   ├── audioService.ts
│   │   ├── sampleAudioService.ts
│   │   └── webAudioScheduler.ts
│   ├── utils/
│   │   ├── gameUtils.ts
│   │   ├── imageUtils.ts
│   │   ├── utils.ts
│   │   └── schema.ts
│   ├── characters/ (6 files from components/characters/)
│   ├── instruments/
│   │   └── instrumentLibrary.ts
│   ├── music/
│   │   └── melodyLibrary.ts
│   ├── notation/
│   │   └── vexflowUtils.ts
│   ├── icons/ (from components/icons/)
│   ├── game-shell/
│   │   ├── Game.tsx
│   │   ├── ResponsiveGameLayout.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── AudioErrorFallback.tsx
│   │   └── AnimalCharacter.tsx
│   └── query/
│       └── queryClient.ts
│
├── pages/ (non-game pages only)
│   ├── LandingPage.tsx
│   ├── LandingVariation2.tsx
│   ├── Home.tsx
│   ├── UnderDevelopmentPage.tsx
│   └── not-found.tsx
│
├── config/
│   └── games.ts
├── theme/
│   └── playful.ts
├── assets/
├── App.tsx
├── main.tsx
└── index.css
```

---

## Phase 0: Preparation

### Task 0.1: Create a feature branch

**Step 1: Create and switch to feature branch**

Run: `git checkout -b refactor/codebase-reorganization`

**Step 2: Verify clean working state**

Run: `git status`
Expected: Clean working directory (stash or commit any in-progress work first)

---

## Phase 1: Create `src/common/` and Move Shared Code

This phase MUST be done first because all game files import from shared code. After this phase, game files will import from `@/common/` instead of `@/components/ui/`, `@/hooks/`, `@/lib/`, etc.

### Task 1.1: Create common/ directory structure

**Step 1: Create all common/ subdirectories**

```bash
mkdir -p client/src/common/{ui,hooks/__tests__,audio,utils,characters,instruments,music,notation,icons,game-shell,query}
```

**Step 2: Verify directories exist**

Run: `ls -la client/src/common/`

---

### Task 1.2: Move UI components to common/ui/

**Step 1: Move all files from components/ui/ to common/ui/**

```bash
git mv client/src/components/ui/* client/src/common/ui/
```

**Step 2: Update all imports across the codebase**

Find and replace in all `.ts` and `.tsx` files:
- `@/components/ui/` → `@/common/ui/`

This is a global find-and-replace. Use your editor or a script:
```bash
find client/src -name '*.tsx' -o -name '*.ts' | xargs sed -i '' 's|@/components/ui/|@/common/ui/|g'
```

**Step 3: Verify build**

Run: `npx vite build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: move ui/ to common/ui/"
```

---

### Task 1.3: Move hooks to common/hooks/

**Step 1: Move shared hooks** (NOT game-specific hooks like useFinishTheTuneGame)

Move these files from `client/src/hooks/` to `client/src/common/hooks/`:
- `useAudioService.ts`
- `useGameCleanup.ts`
- `useKeyboardShortcuts.ts`
- `usePhilharmoniaInstruments.ts`
- `useViewport.ts`
- `use-mobile.tsx`
- `use-toast.ts`
- `__tests__/useAudioService.test.ts`
- `__tests__/useGameCleanup.test.ts`

Leave these for later (game-specific, will move with their games):
- `useFinishTheTuneGame.ts` → finish-the-tune/
- `useFinishTheTunePersistence.ts` → finish-the-tune/
- `useRhythmRandomizer.ts` → tools/rhythm-randomizer/
- `useSightReadingRandomizer.ts` → tools/sight-reading-randomizer/

```bash
git mv client/src/hooks/useAudioService.ts client/src/common/hooks/
git mv client/src/hooks/useGameCleanup.ts client/src/common/hooks/
git mv client/src/hooks/useKeyboardShortcuts.ts client/src/common/hooks/
git mv client/src/hooks/usePhilharmoniaInstruments.ts client/src/common/hooks/
git mv client/src/hooks/useViewport.ts client/src/common/hooks/
git mv client/src/hooks/use-mobile.tsx client/src/common/hooks/
git mv client/src/hooks/use-toast.ts client/src/common/hooks/
git mv client/src/hooks/__tests__ client/src/common/hooks/
```

**Step 2: Update all imports**

- `@/hooks/useAudioService` → `@/common/hooks/useAudioService`
- `@/hooks/useGameCleanup` → `@/common/hooks/useGameCleanup`
- `@/hooks/useKeyboardShortcuts` → `@/common/hooks/useKeyboardShortcuts`
- `@/hooks/usePhilharmoniaInstruments` → `@/common/hooks/usePhilharmoniaInstruments`
- `@/hooks/useViewport` → `@/common/hooks/useViewport`
- `@/hooks/use-mobile` → `@/common/hooks/use-mobile`
- `@/hooks/use-toast` → `@/common/hooks/use-toast`

**Step 3: Verify build**

Run: `npx vite build`

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: move shared hooks to common/hooks/"
```

---

### Task 1.4: Move shared lib files to common/

**Step 1: Move audio files**

```bash
git mv client/src/lib/audioService.ts client/src/common/audio/
git mv client/src/lib/sampleAudioService.ts client/src/common/audio/
git mv client/src/lib/audio/webAudioScheduler.ts client/src/common/audio/
```

**Step 2: Move utility files**

```bash
git mv client/src/lib/gameUtils.ts client/src/common/utils/
git mv client/src/lib/imageUtils.ts client/src/common/utils/
git mv client/src/lib/utils.ts client/src/common/utils/
git mv client/src/lib/schema.ts client/src/common/utils/
```

**Step 3: Move music/instrument files**

```bash
git mv client/src/lib/instrumentLibrary.ts client/src/common/instruments/
git mv client/src/lib/melodyLibrary.ts client/src/common/music/
git mv client/src/lib/notation/vexflowUtils.ts client/src/common/notation/
```

**Step 4: Move query client**

```bash
git mv client/src/lib/queryClient.ts client/src/common/query/
```

**Step 5: Update all imports**

Global replacements:
- `@/lib/audioService` → `@/common/audio/audioService`
- `@/lib/sampleAudioService` → `@/common/audio/sampleAudioService`
- `@/lib/audio/webAudioScheduler` → `@/common/audio/webAudioScheduler`
- `@/lib/gameUtils` → `@/common/utils/gameUtils`
- `@/lib/imageUtils` → `@/common/utils/imageUtils`
- `@/lib/utils` → `@/common/utils/utils`
- `@/lib/schema` → `@/common/utils/schema`
- `@/lib/instrumentLibrary` → `@/common/instruments/instrumentLibrary`
- `@/lib/melodyLibrary` → `@/common/music/melodyLibrary`
- `@/lib/notation/vexflowUtils` → `@/common/notation/vexflowUtils`
- `@/lib/queryClient` → `@/common/query/queryClient`
- Also fix relative imports like `../lib/audioService` → `@/common/audio/audioService`

**Step 6: Verify build**

Run: `npx vite build`

**Step 7: Commit**

```bash
git add -A && git commit -m "refactor: move shared libs to common/"
```

---

### Task 1.5: Move shared components to common/

**Step 1: Move characters**

```bash
git mv client/src/components/characters/* client/src/common/characters/
```

**Step 2: Move icons**

```bash
git mv client/src/components/icons/* client/src/common/icons/
```

**Step 3: Move game-shell components**

```bash
git mv client/src/components/Game.tsx client/src/common/game-shell/
git mv client/src/components/ResponsiveGameLayout.tsx client/src/common/game-shell/
git mv client/src/components/ScoreDisplay.tsx client/src/common/game-shell/
git mv client/src/components/ErrorBoundary.tsx client/src/common/game-shell/
git mv client/src/components/AudioErrorFallback.tsx client/src/common/game-shell/
git mv client/src/components/AnimalCharacter.tsx client/src/common/game-shell/
```

**Step 4: Update all imports**

- `@/components/characters/` → `@/common/characters/`
- `@/components/icons/` → `@/common/icons/`
- `@/components/Game` → `@/common/game-shell/Game`
- `@/components/ResponsiveGameLayout` → `@/common/game-shell/ResponsiveGameLayout`
- `@/components/ScoreDisplay` → `@/common/game-shell/ScoreDisplay`
- `@/components/ErrorBoundary` → `@/common/game-shell/ErrorBoundary`
- `@/components/AudioErrorFallback` → `@/common/game-shell/AudioErrorFallback`
- `@/components/AnimalCharacter` → `@/common/game-shell/AnimalCharacter`

**Step 5: Verify build**

Run: `npx vite build`

**Step 6: Commit**

```bash
git add -A && git commit -m "refactor: move shared components to common/"
```

---

### Task 1.6: Update vitest config

**Step 1: Update setup file path in vitest.config.ts**

The test setup file at `client/src/test/setup.ts` should move to `client/src/common/test-setup.ts` (or stay — we'll move it when we relocate tests).

For now, just verify tests still pass:

Run: `npx vitest run`

**Step 2: Commit if any changes needed**

---

## Phase 2: Move Dynamics Games (3 numbered + 2 standalone)

Start with a small category to validate the pattern.

### Task 2.1: Create dynamics directory structure and move files

**Step 1: Create directories**

```bash
mkdir -p client/src/games/dynamics/{dynamics-001,dynamics-002,dynamics-003,loud-or-quiet-safari,long-or-short-notes}
```

**Step 2: Move dynamics-001**

```bash
git mv client/src/components/Dynamics001Game.tsx client/src/games/dynamics/dynamics-001/
git mv client/src/lib/gameLogic/dynamics-001Logic.ts client/src/games/dynamics/dynamics-001/logic.ts
git mv client/src/lib/gameLogic/dynamics-001Modes.ts client/src/games/dynamics/dynamics-001/modes.ts
git mv client/src/pages/games/Dynamics001Page.tsx client/src/games/dynamics/dynamics-001/page.tsx
```

**Step 3: Move dynamics-002**

```bash
git mv client/src/components/Dynamics002Game.tsx client/src/games/dynamics/dynamics-002/
git mv client/src/lib/gameLogic/dynamics-002Logic.ts client/src/games/dynamics/dynamics-002/logic.ts
git mv client/src/lib/gameLogic/dynamics-002Modes.ts client/src/games/dynamics/dynamics-002/modes.ts
git mv client/src/pages/games/Dynamics002Page.tsx client/src/games/dynamics/dynamics-002/page.tsx
```

**Step 4: Move dynamics-003**

```bash
git mv client/src/components/Dynamics003Game.tsx client/src/games/dynamics/dynamics-003/
git mv client/src/lib/gameLogic/dynamics-003Logic.ts client/src/games/dynamics/dynamics-003/logic.ts
git mv client/src/lib/gameLogic/dynamics-003Modes.ts client/src/games/dynamics/dynamics-003/modes.ts
git mv client/src/pages/games/Dynamics003Page.tsx client/src/games/dynamics/dynamics-003/page.tsx
```

**Step 5: Move standalone dynamics games**

```bash
git mv client/src/components/LoudOrQuietSafariGame.tsx client/src/games/dynamics/loud-or-quiet-safari/
git mv client/src/pages/games/LoudOrQuietSafariGamePage.tsx client/src/games/dynamics/loud-or-quiet-safari/page.tsx

git mv client/src/components/LongOrShortNotesGame.tsx client/src/games/dynamics/long-or-short-notes/
git mv client/src/pages/games/LongOrShortNotesGamePage.tsx client/src/games/dynamics/long-or-short-notes/page.tsx
```

**Step 6: Move related test files**

```bash
mkdir -p client/src/games/dynamics/dynamics-001/__tests__
git mv client/src/test/dynamics-001.test.ts client/src/games/dynamics/dynamics-001/__tests__/
git mv client/src/test/dynamics-001.a11y.simple.test.tsx client/src/games/dynamics/dynamics-001/__tests__/

mkdir -p client/src/games/dynamics/dynamics-002/__tests__
git mv client/src/test/dynamics-002.test.ts client/src/games/dynamics/dynamics-002/__tests__/

mkdir -p client/src/games/dynamics/dynamics-003/__tests__
git mv client/src/test/dynamics-003.test.ts client/src/games/dynamics/dynamics-003/__tests__/
```

**Step 7: Update internal imports within moved files**

Each game component file needs its imports updated:
- Relative `../lib/gameLogic/dynamics-001Modes` → `./modes`
- Relative `../lib/gameLogic/dynamics-001Logic` → `./logic`
- Relative `../lib/audioService` → `@/common/audio/audioService`
- (Other `@/common/` imports should already be correct from Phase 1)

Each page file needs its import updated:
- `@/components/Dynamics001Game` → `@/games/dynamics/dynamics-001/Dynamics001Game`

**Step 8: Update App.tsx lazy imports**

Change the lazy import paths for dynamics pages:
- `@/pages/games/Dynamics001Page` → `@/games/dynamics/dynamics-001/page`
- `@/pages/games/Dynamics002Page` → `@/games/dynamics/dynamics-002/page`
- `@/pages/games/Dynamics003Page` → `@/games/dynamics/dynamics-003/page`
- `@/pages/games/LoudOrQuietSafariGamePage` → `@/games/dynamics/loud-or-quiet-safari/page`
- `@/pages/games/LongOrShortNotesGamePage` → `@/games/dynamics/long-or-short-notes/page`

**Step 9: Verify build**

Run: `npx vite build`

**Step 10: Run tests**

Run: `npx vitest run` (to verify test paths are correct)

**Step 11: Commit**

```bash
git add -A && git commit -m "refactor: move dynamics games to games/dynamics/"
```

---

## Phase 3: Move Timbre Games (3 numbered + 1 standalone)

### Task 3.1: Create and move timbre games

Follow the same pattern as Phase 2:

**Files to move:**

| Source | Destination |
|--------|-------------|
| `components/Timbre001Game.tsx` | `games/timbre/timbre-001/` |
| `lib/gameLogic/timbre-001Logic.ts` | `games/timbre/timbre-001/logic.ts` |
| `lib/gameLogic/timbre-001Modes.ts` | `games/timbre/timbre-001/modes.ts` |
| `pages/games/Timbre001Page.tsx` | `games/timbre/timbre-001/page.tsx` |
| `test/timbre-001.test.ts` | `games/timbre/timbre-001/__tests__/` |
| (same pattern for timbre-002, timbre-003) | |
| `components/ToneColorMatchGame.tsx` | `games/timbre/tone-color-match/` |
| `pages/games/ToneColorMatchGamePage.tsx` | `games/timbre/tone-color-match/page.tsx` |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move timbre games to games/timbre/"
```

---

## Phase 4: Move Theory Games (4 numbered)

### Task 4.1: Create and move theory games

| Source | Destination |
|--------|-------------|
| `components/Theory001Game.tsx` | `games/theory/theory-001/` |
| `lib/gameLogic/theory-001Logic.ts` | `games/theory/theory-001/logic.ts` |
| `lib/gameLogic/theory-001Modes.ts` | `games/theory/theory-001/modes.ts` |
| `pages/games/Theory001Page.tsx` | `games/theory/theory-001/page.tsx` |
| `test/theory-002.test.tsx` | `games/theory/theory-002/__tests__/` |
| `test/theory-003.test.tsx` | `games/theory/theory-003/__tests__/` |
| (same pattern for theory-002 through theory-004) | |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move theory games to games/theory/"
```

---

## Phase 5: Move Compose Games (2 numbered + 1 standalone)

### Task 5.1: Create and move compose games

| Source | Destination |
|--------|-------------|
| `components/Compose001Game.tsx` | `games/compose/compose-001/` |
| `lib/gameLogic/compose-001Logic.ts` | `games/compose/compose-001/logic.ts` |
| `lib/gameLogic/compose-001Modes.ts` | `games/compose/compose-001/modes.ts` |
| `pages/games/Compose001Page.tsx` | `games/compose/compose-001/page.tsx` |
| `test/compose-001.test.tsx` | `games/compose/compose-001/__tests__/` |
| (same for compose-002) | |
| `components/ComposeYourSongGame.tsx` | `games/compose/compose-your-song/` |
| `pages/games/ComposeYourSongGamePage.tsx` | `games/compose/compose-your-song/page.tsx` |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move compose games to games/compose/"
```

---

## Phase 6: Move Harmony Games (4 numbered + 2 standalone)

### Task 6.1: Create and move harmony games

| Source | Destination |
|--------|-------------|
| `lib/gameLogic/harmony-001Modes.ts` | `games/harmony/harmony-001/modes.ts` |
| (harmony-001 has modes only, no component/logic) | |
| `components/Harmony002Game.tsx` | `games/harmony/harmony-002/` |
| `lib/gameLogic/harmony-002Logic.ts` | `games/harmony/harmony-002/logic.ts` |
| `lib/gameLogic/harmony-002Modes.ts` | `games/harmony/harmony-002/modes.ts` |
| `pages/games/Harmony002Page.tsx` | `games/harmony/harmony-002/page.tsx` |
| `test/harmony-002.test.ts` | `games/harmony/harmony-002/__tests__/` |
| (same for harmony-003, harmony-004) | |
| `components/HarmonyHelperGame.tsx` | `games/harmony/harmony-helper/` |
| `pages/games/HarmonyHelperGamePage.tsx` | `games/harmony/harmony-helper/page.tsx` |
| `components/HappyOrSadMelodiesGame.tsx` | `games/harmony/happy-or-sad-melodies/` |
| `pages/games/HappyOrSadMelodiesGamePage.tsx` | `games/harmony/happy-or-sad-melodies/page.tsx` |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move harmony games to games/harmony/"
```

---

## Phase 7: Move Listen Games (4 numbered + 8 standalone)

### Task 7.1: Create and move listen games

**Numbered series:** listen-001 through listen-004 (with Logic and Modes files)

**Standalone games:**
| Source | Destination |
|--------|-------------|
| `components/SameOrDifferentGame.tsx` | `games/listen/same-or-different/` |
| `lib/sameOrDifferentLogic.ts` | `games/listen/same-or-different/logic.ts` |
| `test/sameOrDifferentLogic.test.ts` | `games/listen/same-or-different/__tests__/` |
| `components/EchoLocationChallengeGame.tsx` | `games/listen/echo-location-challenge/` |
| `components/MelodyMemoryMatchGame.tsx` | `games/listen/melody-memory-match/` |
| `components/MusicalSimonSaysGame.tsx` | `games/listen/musical-simon-says/` |
| `components/MusicalPatternDetectiveGame.tsx` | `games/listen/musical-pattern-detective/` |
| `components/NameThatAnimalTuneGame.tsx` | `games/listen/name-that-animal-tune/` |
| `components/HowManyNotesGame.tsx` | `games/listen/how-many-notes/` |
| `components/MusicalOppositesGame.tsx` | `games/listen/musical-opposites/` |

Plus their corresponding page files from `pages/games/`.

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move listen games to games/listen/"
```

---

## Phase 8: Move Pitch Games (5 numbered + 3 standalone)

### Task 8.1: Create and move pitch games

**Numbered:** pitch-001, pitch-003 through pitch-006 (pitch-002 has modes only via `pitch-002Modes.ts`)

**Standalone:**
| Source | Destination |
|--------|-------------|
| `components/Game.tsx` (PitchMatch) | `games/pitch/pitch-match/Game.tsx` |
| `pages/games/PitchMatchGame.tsx` | `games/pitch/pitch-match/page.tsx` |
| `components/PitchLadderJumpGame.tsx` | `games/pitch/pitch-ladder-jump/` |
| `components/PitchPerfectPathGame.tsx` | `games/pitch/pitch-perfect-path/` |
| `components/ScaleClimberGame.tsx` | `games/pitch/scale-climber/` |
| `components/PitchIntervalMasterGame.tsx` | `games/pitch/pitch-interval-master/` |
| `components/ScaleBuilderGame.tsx` | `games/pitch/scale-builder/` |

Plus their page files and test files.

**Note:** `Game.tsx` is a special case — it's the original "pitch match" game. Verify its usage before moving, as it may also serve as a base component. If it's only used as the pitch-match game, move it to `games/pitch/pitch-match/Game.tsx`. If it's a shared base, move to `common/game-shell/` instead.

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move pitch games to games/pitch/"
```

---

## Phase 9: Move Rhythm Games (7 numbered + 6 standalone)

### Task 9.1: Create and move rhythm games

**Numbered:** rhythm-001 through rhythm-007

**Standalone:**
| Source | Destination |
|--------|-------------|
| `components/RhythmEchoChallengeGame.tsx` | `games/rhythm/rhythm-echo-challenge/` |
| `components/FastOrSlowRaceGame.tsx` | `games/rhythm/fast-or-slow-race/` |
| `components/BeatKeeperChallengeGame.tsx` | `games/rhythm/beat-keeper-challenge/` |
| `components/SteadyOrBouncyBeatGame.tsx` | `games/rhythm/steady-or-bouncy-beat/` |
| `components/RhythmPuzzleBuilderGame.tsx` | `games/rhythm/rhythm-puzzle-builder/` |
| `components/RestFinderGame.tsx` | `games/rhythm/rest-finder/` |
| `components/MusicalFreezeDanceGame.tsx` | `games/rhythm/musical-freeze-dance/` |
| `components/TempoPulseMasterGame.tsx` | `games/rhythm/tempo-pulse-master/` |

Plus page files and test files (rhythm-002.test.tsx, rhythm-003.test.tsx, etc.)

**Delete backup files during this phase:**
```bash
rm client/src/components/FastOrSlowRaceGame.tsx.bak
```

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move rhythm games to games/rhythm/"
```

---

## Phase 10: Move Cross-Curricular Games (3 numbered + 3 standalone)

### Task 10.1: Create and move cross-curricular games

**Numbered:** cross-001, cross-002, cross-003

**Standalone:**
| Source | Destination |
|--------|-------------|
| `components/MusicalMathGame.tsx` | `games/cross-curricular/musical-math/` |
| `components/MusicalStoryTimeGame.tsx` | `games/cross-curricular/musical-story-time/` |
| `components/WorldMusicExplorerGame.tsx` | `games/cross-curricular/world-music-explorer/` |
| `components/CrossCurricularMusicMasterGame.tsx` | (verify if this is cross-001's component) |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move cross-curricular games to games/cross-curricular/"
```

---

## Phase 11: Move Advanced Games (2 games)

### Task 11.1: Create and move advanced games

| Source | Destination |
|--------|-------------|
| `components/Advanced001Game.tsx` | `games/advanced/advanced-001/` |
| `lib/gameLogic/advanced-001Logic.ts` | `games/advanced/advanced-001/logic.ts` |
| `lib/gameLogic/advanced-001Modes.ts` | `games/advanced/advanced-001/modes.ts` |
| `pages/games/Advanced001Page.tsx` | `games/advanced/advanced-001/page.tsx` |
| `test/advanced-001.test.ts` | `games/advanced/advanced-001/__tests__/` |
| `test/advanced-001.component.test.tsx` | `games/advanced/advanced-001/__tests__/` |
| `test/advanced-001.a11y.test.tsx` | `games/advanced/advanced-001/__tests__/` |
| `test/advanced-001.modes.test.ts` | `games/advanced/advanced-001/__tests__/` |
| `test/app-routing-advanced-001.test.tsx` | `games/advanced/advanced-001/__tests__/` |
| (same pattern for challenge-001) | |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move advanced games to games/advanced/"
```

---

## Phase 12: Move Instruments Games (3 standalone)

### Task 12.1: Create and move instrument games

| Source | Destination |
|--------|-------------|
| `components/InstrumentCraneGame.tsx` | `games/instruments/crane-game/` |
| `pages/games/InstrumentCraneGamePage.tsx` | `games/instruments/crane-game/page.tsx` |
| `components/InstrumentFamilySorterGame.tsx` | `games/instruments/family-sorter/` |
| `pages/games/InstrumentFamilySorterGamePage.tsx` | `games/instruments/family-sorter/page.tsx` |
| `components/InstrumentDetectiveGame.tsx` | `games/instruments/detective/` |
| `pages/games/InstrumentDetectiveGamePage.tsx` | `games/instruments/detective/page.tsx` |

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move instrument games to games/instruments/"
```

---

## Phase 13: Move Complex Games

### Task 13.1: Move Melody Dungeon

Melody Dungeon is already partially organized in `components/melody-dungeon/`. We need to:

1. Create `games/melody-dungeon/`
2. Move component files from `components/melody-dungeon/` to `games/melody-dungeon/components/`
3. Move `MelodyDungeonGame.tsx` to `games/melody-dungeon/`
4. Move logic files from `lib/gameLogic/` to `games/melody-dungeon/logic/`:
   - `dungeonGenerator.ts`
   - `dungeonTypes.ts`
   - `merchantItems.ts`
   - `difficultyAdapter.ts`
5. Move `dungeonAudio.ts` and `dungeonThemes.ts` within the new structure
6. Move `challengeHelpers.ts` within the new structure
7. Move page from `pages/games/MelodyDungeonPage.tsx`
8. Move tests from `test/melody-dungeon*.test.ts` and `lib/gameLogic/__tests__/`

**Update all internal imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move melody-dungeon to games/melody-dungeon/"
```

### Task 13.2: Move Cadence Quest

1. Create `games/cadence-quest/`
2. Move `components/cadence-quest/` contents to `games/cadence-quest/components/`
3. Move `CadenceQuestGame.tsx` to `games/cadence-quest/`
4. Move `lib/cadence-quest/` to `games/cadence-quest/logic/`
5. Move page from `pages/games/CadenceQuestPage.tsx`

**Update all internal imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move cadence-quest to games/cadence-quest/"
```

### Task 13.3: Move Finish the Tune

1. Create `games/finish-the-tune/`
2. Move `components/finish-the-tune/` contents appropriately
3. Move game-specific hooks from `hooks/`:
   - `useFinishTheTuneGame.ts` → `games/finish-the-tune/hooks/`
   - `useFinishTheTunePersistence.ts` → `games/finish-the-tune/hooks/`
4. Move page and tests

**Update all imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move finish-the-tune to games/finish-the-tune/"
```

### Task 13.4: Move Staff Invaders

1. Create `games/staff-invaders/`
2. Move `components/staff-invaders/` contents to `games/staff-invaders/components/`
3. Move the root-level `StaffInvadersGame.tsx` component
4. Move page

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move staff-invaders to games/staff-invaders/"
```

### Task 13.5: Move Animal Orchestra Conductor

1. Create `games/animal-orchestra/`
2. Move `components/aoc-v2/` to `games/animal-orchestra/components/`
3. Move `lib/aoc-v2/` to `games/animal-orchestra/logic/`
4. Move page

**Update imports, App.tsx, verify build, commit.**

```bash
git add -A && git commit -m "refactor: move animal-orchestra to games/animal-orchestra/"
```

### Task 13.6: Move remaining standalone complex games

- Treble Runner: Move page to `games/treble-runner/page.tsx`
- Staff Wars: Move `components/staff-wars/StaffCanvas.tsx` to `games/staff-wars/`

**Commit each separately.**

---

## Phase 14: Move Tools (Randomizers)

### Task 14.1: Move Sight Reading Randomizer

1. Create `games/tools/sight-reading-randomizer/`
2. Move `components/SightReadingRandomizer/` to `games/tools/sight-reading-randomizer/components/`
3. Move `lib/sightReadingRandomizer/` to `games/tools/sight-reading-randomizer/logic/`
4. Move `hooks/useSightReadingRandomizer.ts` to `games/tools/sight-reading-randomizer/hooks/`
5. Move `pages/tools/SightReadingRandomizerPage.tsx` to `games/tools/sight-reading-randomizer/page.tsx`

**Update imports, App.tsx, verify build, commit.**

### Task 14.2: Move Rhythm Randomizer

Same pattern as Sight Reading Randomizer.

**Update imports, App.tsx, verify build, commit.**

---

## Phase 15: Final Cleanup

### Task 15.1: Remove empty directories

```bash
rmdir client/src/components/ui
rmdir client/src/components/characters
rmdir client/src/components/icons
rmdir client/src/components/melody-dungeon
rmdir client/src/components/cadence-quest
rmdir client/src/components/finish-the-tune
rmdir client/src/components/staff-invaders
rmdir client/src/components/staff-wars
rmdir client/src/components/aoc-v2
rmdir client/src/components/SightReadingRandomizer
rmdir client/src/components/RhythmRandomizer
rmdir client/src/components  # should be empty now
rmdir client/src/lib/gameLogic
rmdir client/src/lib/cadence-quest
rmdir client/src/lib/aoc-v2
rmdir client/src/lib/sightReadingRandomizer
rmdir client/src/lib/rhythmRandomizer
rmdir client/src/lib/notation
rmdir client/src/lib/audio
rmdir client/src/lib  # should be empty now
rmdir client/src/pages/games
rmdir client/src/pages/tools
rmdir client/src/hooks  # should be empty now
rmdir client/src/test  # should be empty now
```

### Task 15.2: Delete backup files

```bash
rm -f client/src/components/Dynamics003Game.tsx.backup
rm -f client/src/components/Dynamics003Game.tsx.pre-fix
```
(FastOrSlowRaceGame.tsx.bak should have been deleted in Phase 9)

### Task 15.3: Move remaining test utility files

Move any remaining test utilities from `client/src/test/`:
- `setup.ts` → `client/src/common/test-setup.ts`
- `test-games-detailed-ux.ts` → appropriate location
- `test-games-simple.ts` → appropriate location
- `test-games-ux.ts` → appropriate location
- `gameLogic.test.ts` → appropriate location

Update `vitest.config.ts` setupFiles path if moved.

### Task 15.4: Final verification

**Step 1: Full build**

Run: `npx vite build`
Expected: Clean build, no errors

**Step 2: Full test suite**

Run: `npx vitest run`
Expected: All tests pass

**Step 3: Dev server check**

Run: `npx vite dev`
Expected: App loads, navigate to a few games to verify routing works

**Step 4: Final commit**

```bash
git add -A && git commit -m "refactor: clean up empty directories and backup files"
```

---

## Phase 16: Squash or Keep Commits

After all phases complete:

- Option A: Keep granular commits (recommended for traceability)
- Option B: Squash into a single commit with `git rebase -i`

The user decides.

---

## Notes

- **PlaceholderGame.tsx** (`pages/games/PlaceholderGame.tsx`): This is a catch-all for `/games/:slug` routes. Move to `games/PlaceholderGame.tsx` or keep in pages.
- **`sameOrDifferentLogic.ts`** in `lib/`: This is game-specific logic for same-or-different, should move with it.
- **Harmony-001**: Only has a `harmony-001Modes.ts` file (no component or logic). Still create the directory and move the modes file.
- **Pitch-002**: Only has a `pitch-002Modes.ts` file. Same treatment.
- **Relative vs absolute imports**: Some game components use relative imports (`../lib/...`) while others use `@/lib/...`. Normalize all to `@/` style during migration.
- **Game.tsx**: Verify whether this is used as the pitch-match game or as a shared base. It appears to be the pitch-match game based on its content.
