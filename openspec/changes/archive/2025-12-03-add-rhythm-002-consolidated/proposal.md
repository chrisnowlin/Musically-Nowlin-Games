## Why
Enable comprehensive music education through Tempo & Pulse Master, an ultra-dense multi-mode game that consolidates multiple related concepts into a single, cohesive learning experience. This game addresses the need for:
- Comprehensive coverage of rhythm & timing concepts
- Progressive difficulty from beginner to advanced
- Multiple learning modes within a single interface
- Reduced cognitive load through consistent UI/UX
- Efficient implementation and maintenance

This consolidated game replaces 15-30 individual games while maintaining full pedagogical coverage through 3 distinct modes.

## What Changes
- Add new consolidated game: Tempo & Pulse Master
- Implement multi-mode architecture with mode switching
- Add 3 distinct game modes:
  - tempo-changes
  - pulse-subdivisions
  - analysis
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
- Affected specs: rhythm-002 (new consolidated game)
- Affected code:
  - client/src/config/games.ts (add consolidated game registration)
  - client/src/components/Tempo&PulseMasterGame.tsx (new multi-mode component)
  - client/src/pages/games/Tempo&PulseMasterGamePage.tsx (new page wrapper)
  - client/src/lib/gameLogic/rhythm-002Logic.ts (mode-specific logic)
  - client/src/lib/gameLogic/rhythm-002Modes.ts (mode definitions)
  - client/src/test/rhythm-002.test.ts (comprehensive test suite)
  - client/src/App.tsx (add route)
- New dependencies: None (uses existing Web Audio API, React, Tailwind)
- Performance target: 60 FPS on modern browsers, <100ms audio latency
- Bundle size impact: ~30-40KB per game (lazy loaded, includes all modes)
- Replaces: 15-30 individual game proposals
