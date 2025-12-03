## ADDED Requirements

### Requirement: Part Variation Selection
The system SHALL allow users to select from 3 different musical part variations for each instrument layer.

#### Scenario: User selects a different part variation
- **WHEN** the user taps on variation B for the melody layer
- **THEN** the melody layer SHALL switch to playing the variation B pattern
- **AND** the UI SHALL indicate variation B is now selected
- **AND** the layer SHALL continue playing without interruption if already active

#### Scenario: Default part selection on game start
- **WHEN** the game starts
- **THEN** all layers SHALL default to variation A (current patterns)
- **AND** the part selector SHALL show variation A as selected for each layer

### Requirement: Musically Coherent Part Variations
Each instrument layer SHALL have 3 musically distinct variations that harmonize well when combined.

#### Scenario: Percussion layer variations
- **WHEN** the user views percussion part options
- **THEN** the system SHALL offer:
  - Variation A: Steady foundation pattern (quarter notes on beats 1, 2, 3, 4)
  - Variation B: Syncopated pattern (accented offbeats for rhythmic interest)
  - Variation C: March pattern (strong downbeats with rhythmic fills)

#### Scenario: Melody layer variations
- **WHEN** the user views melody part options
- **THEN** the system SHALL offer:
  - Variation A: Ascending phrase (simple, singable melody)
  - Variation B: Descending countermelody (melodic contrast)
  - Variation C: Ornamental flourish (decorative runs)

#### Scenario: Harmony layer variations
- **WHEN** the user views harmony part options
- **THEN** the system SHALL offer:
  - Variation A: Arpeggiated chords (broken chord patterns)
  - Variation B: Sustained pads (long held tones)
  - Variation C: Walking line (stepwise moving harmony)

#### Scenario: Bass layer variations
- **WHEN** the user views bass part options
- **THEN** the system SHALL offer:
  - Variation A: Root notes (simple foundational pattern)
  - Variation B: Octave jumps (more rhythmic movement)
  - Variation C: Pedal drone (sustained root tone)

#### Scenario: Sparkle layer variations
- **WHEN** the user views sparkle part options
- **THEN** the system SHALL offer:
  - Variation A: Broken chord (shimmering arpeggio)
  - Variation B: Bell tones (sustained single notes)
  - Variation C: Cascading runs (fast descending patterns)

### Requirement: Part Selection UI
The system SHALL provide intuitive controls for selecting part variations.

#### Scenario: Visual part selector display
- **WHEN** viewing an instrument layer card
- **THEN** the system SHALL display 3 selectable options (A, B, C)
- **AND** the currently selected variation SHALL be visually highlighted
- **AND** hovering/tapping SHALL show the variation name and description

#### Scenario: Keyboard shortcuts for part selection
- **WHEN** the user presses Shift + 1 through Shift + 5
- **THEN** the corresponding layer SHALL cycle to the next part variation
- **AND** the UI SHALL reflect the new selection

### Requirement: Preset Arrangements with Part Variations
Preset arrangements SHALL specify which part variation each layer uses.

#### Scenario: Applying a preset with specific variations
- **WHEN** the user selects a preset arrangement
- **THEN** each layer SHALL switch to the specified part variation
- **AND** layers SHALL turn on/off according to the preset configuration

#### Scenario: New preset combinations
- **WHEN** the user views available presets
- **THEN** the system SHALL include presets that showcase interesting part variation combinations
- **AND** at least one preset SHALL use all variation C parts

### Requirement: Random Mix Feature
The system SHALL provide a way to randomize part selections for creative exploration.

#### Scenario: User triggers random mix
- **WHEN** the user activates the "Random Mix" feature
- **THEN** each layer SHALL randomly select one of its 3 part variations
- **AND** the UI SHALL update to show the new selections
- **AND** currently playing layers SHALL transition to their new patterns

## MODIFIED Requirements

### Requirement: Animal Orchestra Conductor
The system SHALL provide a layering game where multiple animals can be started or stopped to create textures and simple polyrhythms, with selectable part variations for each instrument layer.

#### Scenario: Start percussion and melody, stop harmony
- **WHEN** the learner toggles percussion and melody on and harmony off
- **THEN** only percussion and melody SHALL be audible
- **AND** the system SHALL reflect toggled states visually and in audio

#### Scenario: Mix and match different part variations
- **WHEN** the learner selects variation B for percussion and variation C for melody
- **THEN** the percussion SHALL play the syncopated pattern
- **AND** the melody SHALL play the ornamental flourish pattern
- **AND** both patterns SHALL stay musically synchronized
