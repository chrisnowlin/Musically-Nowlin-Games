## 1. Update Note Range Definitions

- [x] 1.1 Create clef-specific range preset configurations in `SetupScreen.tsx`
  - Define Treble Clef ranges: E4-F5 (staff), C4-A5 (extended), B3-B5 (full)
  - Define Bass Clef ranges: G2-A3 (staff), E2-C4 (extended), C2-D4 (full)
  - Define Alto Clef ranges: F3-G4 (staff), D3-B4 (extended), C3-C5 (full)

- [x] 1.2 Create clef-specific line and space note definitions
  - Treble Lines: E4, G4, B4, D5, F5
  - Treble Spaces: F4, A4, C5, E5
  - Bass Lines: G2, B2, D3, F3, A3
  - Bass Spaces: A2, C3, E3, G3
  - Alto Lines: F3, A3, C4, E4, G4
  - Alto Spaces: G3, B3, D4, F4

## 2. Update Setup Screen UI

- [x] 2.1 Modify `RANGE_PRESETS` to be a function that accepts clef and returns appropriate ranges
- [x] 2.2 Update Recruit/Cadet mode labels to show clef-appropriate mnemonics
- [x] 2.3 Ensure preset selection updates when clef selection changes

## 3. Update Game Logic

- [x] 3.1 Modify `getNoteRange()` in `StaffCanvas.tsx` to use clef-aware line/space filters
- [x] 3.2 Pass the selected clef to the filtering logic
- [x] 3.3 Verify notes spawn at correct positions for each clef

## 4. Testing

- [ ] 4.1 Test Treble Clef - all modes should work as before
- [ ] 4.2 Test Bass Clef - verify notes appear on correct staff positions
- [ ] 4.3 Test Alto Clef - verify notes appear on correct staff positions
- [ ] 4.4 Test Recruit mode (lines only) for each clef
- [ ] 4.5 Test Cadet mode (spaces only) for each clef
- [ ] 4.6 Verify mnemonic labels update correctly when switching clefs
