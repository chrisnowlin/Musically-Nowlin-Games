## 1. Specification + Planning
- [ ] 1.1 Confirm conductor-POV UI + 18-seat roster requirements in spec delta
- [ ] 1.2 Define acceptance criteria for selection, cueing, part changes, and controls

## 2. Placeholder Assets (to unblock implementation)
- [ ] 2.1 Create placeholder assets for every file in `docs/ANIMAL_ORCHESTRA_CONDUCTOR_UI_ASSET_MANIFEST.md`
- [ ] 2.2 Ensure placeholders use final filenames/paths so final art is a drop-in replacement

## 3. Expanded Orchestra Model
- [ ] 3.1 Refactor to config-driven seat/layer model (18 seats)
- [ ] 3.2 Update sample loading to load required instruments efficiently

## 4. Music Parts + Presets
- [ ] 4.1 Add part variations (A–F) for each instrument/seat
- [ ] 4.2 Update presets to orchestral presets (strings only, winds, brass, percussion, full orchestra)
- [ ] 4.3 Update randomization + keyboard shortcuts to support A–F and more seats

## 5. Conductor POV UI Implementation
- [ ] 5.1 Implement stage view (concert hall backdrop + semi-circular seating)
- [ ] 5.2 Implement seat interaction (select, play/stop, playing highlights)
- [ ] 5.3 Implement conductor podium UI (global controls + selected-seat inspector)

## 6. Accessibility + Responsiveness
- [ ] 6.1 Ensure minimum touch targets and keyboard accessibility
- [ ] 6.2 Ensure mobile layout supports stage navigation + pinned podium

## 7. QA
- [ ] 7.1 Verify sample loading / fallback works across all seats
- [ ] 7.2 Verify no missing assets and final art swap does not require code changes

