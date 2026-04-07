## Why
Chromebooks and SMARTBoards are a primary target environment, but several current routes still spend too much CPU, memory, and bandwidth on first load and during gameplay. The recent low-power image and motion work helps, but the heaviest runtime and bundle bottlenecks are still present in a few high-traffic games and tools.

## What Changes
- Reuse long-lived audio resources for Treble Runner sound effects instead of creating a new `AudioContext` per event.
- Defer worksheet export code until the user explicitly opens export functionality in the rhythm and sight-reading randomizers.
- Reduce Animal Orchestra startup cost by deferring non-essential sample loading and using optimized background assets.
- Remove redundant viewport subscriptions from shared responsive hooks.
- Bring `develop` up to the current `main` baseline before applying the optimization pass.

## Impact
- Affected spec: `low-power-performance`
- Affected code:
  - `client/src/games/treble-runner/page.tsx`
  - `client/src/games/tools/rhythm-randomizer/**`
  - `client/src/games/tools/sight-reading-randomizer/**`
  - `client/src/games/animal-orchestra/**`
  - `client/src/common/hooks/useViewport.ts`

