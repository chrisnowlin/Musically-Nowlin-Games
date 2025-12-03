## 1. Data Model & Part Definitions

- [x] 1.1 Define `PartVariation` interface with id, name, description, notes, and pattern
- [x] 1.2 Create 3 musical part variations for **Percussion** (timpani) layer
  - A: Steady quarter notes (current) - foundational beat keeper
  - B: Syncopated pattern - accented offbeats for energy
  - C: March pattern - strong downbeats with fills
- [x] 1.3 Create 3 musical part variations for **Melody** (flute) layer
  - A: Simple ascending phrase (current) - singable melody
  - B: Descending countermelody - melodic contrast
  - C: Ornamental flourish - decorative runs
- [x] 1.4 Create 3 musical part variations for **Harmony** (cello) layer
  - A: Root position arpeggios (current) - warm foundation
  - B: Sustained chords - long tones for atmosphere
  - C: Walking bass line - moving harmony
- [x] 1.5 Create 3 musical part variations for **Bass** (double-bass) layer
  - A: Root notes (current) - simple foundation
  - B: Octave jumps - more movement
  - C: Pedal drone - sustained root
- [x] 1.6 Create 3 musical part variations for **Sparkle** (glockenspiel) layer
  - A: Broken chord (current) - shimmering sparkle
  - B: Bell tones - single sustained notes
  - C: Cascading runs - fast descending patterns

## 2. UI Components

- [x] 2.1 Add part selector tabs/buttons to each animal card (A/B/C or visual icons)
- [x] 2.2 Display current part name and description on hover/tap
- [x] 2.3 Add visual indicator showing which variation is currently selected
- [x] 2.4 Ensure part selection works while layer is playing (seamless switch)
- [x] 2.5 Add keyboard shortcuts for quick part switching (e.g., Shift+1-5)

## 3. Audio Integration

- [x] 3.1 Update `playLayerPattern()` to use selected part's notes and pattern
- [x] 3.2 Ensure smooth transition when switching parts during playback
- [x] 3.3 Verify all note combinations work with existing Philharmonia samples
- [x] 3.4 Add any missing samples to instrumentLibrary if needed

## 4. Presets & Combinations

- [x] 4.1 Update preset arrangements to specify which part variation each layer uses
- [x] 4.2 Add new preset arrangements that showcase interesting part combinations
- [x] 4.3 Add "Random Mix" button to randomize all part selections

## 5. Educational Content

- [x] 5.1 Add learning tips explaining what makes each variation different
- [x] 5.2 Add tooltip explaining arrangement concepts (how parts work together)
- [x] 5.3 Update instructions to mention part selection feature

## 6. Testing & Polish

- [x] 6.1 Test all 243 possible combinations play correctly
- [x] 6.2 Verify keyboard shortcuts work as expected
- [x] 6.3 Test on mobile devices (touch-friendly part selection)
- [x] 6.4 Run accessibility tests on new UI elements
