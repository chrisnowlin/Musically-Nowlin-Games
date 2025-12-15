## Why
The current Animal Orchestra Conductor UI is a simple card grid that does not convey an orchestra setting or the perspective of a conductor. Expanding the playable sections and presenting them in a seated, semi-circular orchestra layout will improve clarity, immersion, and learning value.

## What Changes
- Redesign the game UI to a **conductor POV** stage view with seated orchestra sections.
- Expand from 5 layers to an **18-seat orchestra** (strings, woodwinds, brass, percussion/color).
- Keep existing controls (tempo, master volume, per-seat volume, presets, random mix) but present them as a **conductor podium** + **score/inspector**.
- Add a placeholder-asset pipeline so engineering can implement the UI before final art is delivered.

## Impact
- Affected spec: `game-animal-orchestra-conductor`
- Affected code:
  - `client/src/components/AnimalOrchestraConductorGameWithSamples.tsx`
  - new assets under `client/src/assets/aoc/` and `client/public/aoc/`
  - `docs/ANIMAL_ORCHESTRA_CONDUCTOR_UI_ASSET_MANIFEST.md`

## Notes
- Audio remains sample-first with synthesized fallback for notes without matching samples.
- Final art must be swappable without code changes by adhering to the asset manifest naming and structure.

