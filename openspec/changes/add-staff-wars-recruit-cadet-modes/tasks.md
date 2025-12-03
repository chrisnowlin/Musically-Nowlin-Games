## 1. Data Model Updates

- [x] 1.1 Add `noteFilter` property to GameConfig interface ('all' | 'lines' | 'spaces')
- [x] 1.2 Update RANGE_PRESETS to include Recruit and Cadet modes with filter property
- [x] 1.3 Define note arrays for line notes (E4, G4, B4, D5, F5) and space notes (F4, A4, C5, E5)

## 2. Setup Screen UI

- [x] 2.1 Add Recruit mode preset: "Lines Only (EGBDF)" with appropriate styling
- [x] 2.2 Add Cadet mode preset: "Spaces Only (FACE)" with appropriate styling
- [x] 2.3 Order presets as: Recruit → Cadet → Beginner → Intermediate → Advanced
- [x] 2.4 Update default selection index to 2 (Beginner) to maintain current default

## 3. Note Generation Logic

- [x] 3.1 Modify generateNote() in StaffCanvas to accept noteFilter parameter
- [x] 3.2 Implement line-only filtering (notes on lines: E, G, B, D, F in octave 4-5)
- [x] 3.3 Implement space-only filtering (notes in spaces: F, A, C, E in octave 4-5)
- [x] 3.4 Pass noteFilter from GameConfig through to StaffCanvas

## 4. State Management

- [x] 4.1 Update GameConfig type to include optional noteFilter field
- [x] 4.2 Pass noteFilter through START_GAME action
- [x] 4.3 Ensure noteFilter is preserved during pause/resume

## 5. Testing

- [ ] 5.1 Verify Recruit mode only spawns line notes (E, G, B, D, F)
- [ ] 5.2 Verify Cadet mode only spawns space notes (F, A, C, E)
- [ ] 5.3 Verify existing modes (Beginner, Intermediate, Advanced) are unaffected
- [ ] 5.4 Test mode selection persists correctly through game flow
- [ ] 5.5 Verify note distribution is reasonable within filtered sets
