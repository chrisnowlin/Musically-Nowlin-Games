## Why
Enable comprehensive beat and pulse training through Beat & Pulse Trainer, a focused game that develops rock-solid internal timing. This game addresses the need for:
- Active beat maintenance and internalization
- Steady beat keeping with and without metronome
- Internal pulse development
- Subdivision awareness
- Tempo stability without drifting

This game consolidates tempo-021 through tempo-030 into a cohesive beat training experience.

## What Changes
- Add new game: Beat & Pulse Trainer
- Implement multi-mode architecture with 5 modes:
  - Steady Beat Keeper (maintaining beat with metronome)
  - Beat Tapping (tapping along with music)
  - Internal Pulse (continuing beat without audio)
  - Subdivision Practice (feeling subdivisions)
  - Tempo Stability (maintaining tempo without drifting)
- Implement shared game component following existing patterns
- Add mode-specific logic and audio synthesis
- Implement unified scoring system across all modes
- Add progressive difficulty within each mode
- Implement mode selection UI
- Add state management for multi-mode gameplay
- Implement accessibility features (ARIA, keyboard nav, screen reader)
- Add comprehensive test coverage for all modes
- Implement mode persistence (save progress per mode)

## Impact
- Affected specs: rhythm-006 (new consolidated game)
- Affected code:
  - client/src/config/games.ts (add consolidated game registration)
  - client/src/components/BeatPulseTrainerGame.tsx (new multi-mode component)
  - client/src/pages/games/BeatPulseTrainerGamePage.tsx (new page wrapper)
  - client/src/lib/gameLogic/rhythm-006Logic.ts (mode-specific logic)
  - client/src/lib/gameLogic/rhythm-006Modes.ts (mode definitions)
  - client/src/test/rhythm-006.test.ts (comprehensive test suite)
  - client/src/App.tsx (add route)
- New dependencies: None (uses existing Web Audio API, React, Tailwind)
- Performance target: 60 FPS on modern browsers, <100ms audio latency
- Bundle size impact: ~30-40KB per game (lazy loaded, includes all modes)
- Replaces: 10 placeholder tempo proposals (tempo-021 through tempo-030)
