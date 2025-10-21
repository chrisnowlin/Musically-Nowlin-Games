## Why
Enable note reading fluency through an engaging, classroom-ready game that teaches staff notation recognition with configurable clef and range options, progressive difficulty, and immediate feedback.

## What Changes
- Add a new game: Staff Wars–style Note Reading
- Introduce VexFlow library for music notation rendering (TypeScript-native, Canvas output)
- Extend existing audioService for success/error feedback (no new audio dependencies)
- Implement scrolling note mechanic with tap-to-answer gameplay
- Add clef/range configuration screen (treble, bass, alto, optional grand staff)
- Add difficulty progression system with speed escalation
- Add three-lives game over system with scoring and optional high score persistence
- Add pause/resume functionality
- Implement accessibility features (touch targets ≥ 44×44px, high contrast, toggleable SFX)

## Impact
- Affected specs: game-staff-wars (new)
- Affected code:
  - client/src/config/games.ts (game registration)
  - client/src/pages/games/ (new StaffWarsGamePage.tsx)
  - client/src/components/ (new StaffWarsGame.tsx component)
  - client/src/lib/notation/ (new directory for VexFlow integration utilities)
  - client/src/lib/audioService.ts (minor extension - methods already exist)
  - client/src/test/ (new test files for game logic)
  - package.json (new dependency: vexflow only)
- New dependencies: VexFlow v5.x (MIT, TypeScript-native)
- Performance target: 60 FPS on modern mobile browsers with Canvas rendering and requestAnimationFrame loop
