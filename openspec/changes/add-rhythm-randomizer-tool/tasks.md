# Implementation Tasks

## 1. Core Infrastructure

- [ ] 1.1 Create `/client/src/lib/rhythmRandomizer/types.ts` with all TypeScript interfaces
- [ ] 1.2 Implement `/client/src/lib/rhythmRandomizer/rhythmGenerator.ts` for pattern generation
- [ ] 1.3 Create `/client/src/hooks/useRhythmRandomizer.ts` state management hook
- [ ] 1.4 Create `/client/src/pages/tools/RhythmRandomizerPage.tsx` page component
- [ ] 1.5 Add route `/tools/rhythm-randomizer` to `/client/src/App.tsx`
- [ ] 1.6 Create basic `RhythmRandomizerTool.tsx` container component

## 2. Control Panel & Playback

- [ ] 2.1 Build `TimeSignatureSelector.tsx` component
- [ ] 2.2 Build `TempoControl.tsx` with BPM slider and tap tempo
- [ ] 2.3 Build `NoteValueSelector.tsx` checkbox grid
- [ ] 2.4 Build `DensityControls.tsx` sliders (syncopation, density, rests)
- [ ] 2.5 Build `PresetSelector.tsx` (Beginner/Intermediate/Advanced)
- [ ] 2.6 Build `SoundSelector.tsx` instrument dropdown
- [ ] 2.7 Create `/client/src/lib/rhythmRandomizer/rhythmPlayback.ts` scheduler
- [ ] 2.8 Build `PlaybackControls.tsx` (play/stop/loop/count-in/volume)
- [ ] 2.9 Integrate playback with existing `audioService.ts`

## 3. Notation Display

- [ ] 3.1 Create `/client/src/lib/rhythmRandomizer/rhythmNotation.ts` VexFlow utilities
- [ ] 3.2 Build `StaffNotation.tsx` using VexFlow percussion clef
- [ ] 3.3 Build `GridNotation.tsx` simplified visual notation
- [ ] 3.4 Build `NotationToggle.tsx` switch component
- [ ] 3.5 Implement beat highlighting during playback
- [ ] 3.6 Create `/client/src/lib/rhythmRandomizer/countingSyllables.ts`
- [ ] 3.7 Build `SyllableDisplay.tsx` overlay component

## 4. Ensemble Mode

- [ ] 4.1 Create `/client/src/lib/rhythmRandomizer/ensembleGenerator.ts`
- [ ] 4.2 Implement Call & Response pattern generation
- [ ] 4.3 Implement Layered Parts generation (2-4 complementary rhythms)
- [ ] 4.4 Implement Body Percussion mode (stomp/clap/snap/pat labels)
- [ ] 4.5 Build `EnsembleModeSelector.tsx` component
- [ ] 4.6 Build `EnsembleDisplay.tsx` multi-part notation
- [ ] 4.7 Implement multi-track playback with different sounds per part

## 5. Worksheet Generator

- [ ] 5.1 Install `jsPDF` dependency
- [ ] 5.2 Create `/client/src/lib/rhythmRandomizer/worksheetGenerator.ts`
- [ ] 5.3 Implement standard display worksheet format
- [ ] 5.4 Implement blank completion exercise format
- [ ] 5.5 Implement answer key generation (separate page)
- [ ] 5.6 Implement difficulty variant generation (2-4 versions)
- [ ] 5.7 Build `WorksheetBuilder.tsx` options UI
- [ ] 5.8 Build `WorksheetPreview.tsx` component
- [ ] 5.9 Build `ExportPdfButton.tsx` with download

## 6. Polish & Refinement

- [ ] 6.1 Build `AdvancedSettings.tsx` collapsible panel (swing, ties, pickup)
- [ ] 6.2 Implement quiz mode format with numbered questions
- [ ] 6.3 Create `/client/src/lib/rhythmRandomizer/shareUtils.ts` for URL encoding
- [ ] 6.4 Implement URL state persistence for shareable patterns
- [ ] 6.5 Add print-friendly CSS
- [ ] 6.6 Responsive design for mobile/tablet
- [ ] 6.7 Keyboard shortcuts (Space for play/pause)
- [ ] 6.8 Add to landing page or tools section

## 7. Testing

- [ ] 7.1 Unit tests for `rhythmGenerator.ts`
- [ ] 7.2 Unit tests for `ensembleGenerator.ts`
- [ ] 7.3 Unit tests for `countingSyllables.ts`
- [ ] 7.4 Component tests for control panel
- [ ] 7.5 E2E test for generate → play → export flow
