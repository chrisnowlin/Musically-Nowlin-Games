## Why

Staff Wars currently uses hard-coded Treble Clef note ranges for all difficulty presets and the "Lines Only"/"Spaces Only" filtering modes. When a player selects Bass Clef or Alto Clef, the game spawns notes that are out of range or don't appear correctly on the staff because the note ranges (E4-F5 for treble) don't map to the visible staff area for other clefs.

This is a bug that prevents the game from being usable with Bass and Alto clefs as advertised.

## What Changes

- **Update range presets to be clef-aware**: The difficulty presets (Recruit, Cadet, Beginner, Intermediate, Advanced) will dynamically adjust their note ranges based on the selected clef
- **Update line/space note filtering to be clef-aware**: The "Lines Only" and "Spaces Only" modes will use the correct notes for each clef:
  - **Treble Clef Lines**: E4, G4, B4, D5, F5 (EGBDF)
  - **Treble Clef Spaces**: F4, A4, C5, E5 (FACE)
  - **Bass Clef Lines**: G2, B2, D3, F3, A3 (GBDFA)
  - **Bass Clef Spaces**: A2, C3, E3, G3 (ACEG)
  - **Alto Clef Lines**: F3, A3, C4, E4, G4 (FACEG)
  - **Alto Clef Spaces**: G3, B3, D4, F4 (GBDF)
- **Update mnemonic labels**: The setup screen will show clef-appropriate mnemonics:
  - Treble: "Lines Only (EGBDF)" / "Spaces Only (FACE)"
  - Bass: "Lines Only (GBDFA)" / "Spaces Only (ACEG)"
  - Alto: "Lines Only (FACEG)" / "Spaces Only (GBDF)"

## Impact

- **Affected specs**: `game-staff-wars` (Requirements: Note Range Configuration, Recruit Mode, Cadet Mode)
- **Affected code**:
  - `client/src/components/staff-wars/SetupScreen.tsx` - Range preset definitions and labels
  - `client/src/components/staff-wars/StaffCanvas.tsx` - `getNoteRange()` function with line/space filtering
- **User Impact**: Players selecting Bass or Alto clef will now see notes that correctly appear on the visible staff area
- **No breaking changes**: Treble Clef behavior remains unchanged
