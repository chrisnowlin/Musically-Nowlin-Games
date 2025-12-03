## Why

Beginning music students often learn staff notes using two common mnemonics: "Every Good Boy Does Fine" (EGBDF) for line notes and "FACE" for space notes. By adding dedicated practice modes that focus exclusively on line notes or space notes, students can master each concept separately before combining them. This scaffolded approach reduces cognitive load and builds confidence.

## What Changes

- Add two new difficulty modes to Staff Wars before the existing "Beginner" level:
  - **Recruit** - "Lines Only (EGBDF)" - Only spawns notes that fall on staff lines: E4, G4, B4, D5, F5
  - **Cadet** - "Spaces Only (FACE)" - Only spawns notes that fall in staff spaces: F4, A4, C5, E5
- Update the difficulty selection UI to include these new modes with appropriate colors
- Modify note generation logic to support line-only and space-only filtering
- Default selection remains "Beginner" (now at index 2 after adding new modes)

## Impact

- Affected specs: `game-staff-wars`
- Affected code:
  - `client/src/components/staff-wars/SetupScreen.tsx` - Add new presets to RANGE_PRESETS
  - `client/src/components/staff-wars/StaffCanvas.tsx` - Potentially modify note generation to filter by line/space
  - `client/src/components/StaffWarsGame.tsx` - Update GameConfig to support note filtering mode
