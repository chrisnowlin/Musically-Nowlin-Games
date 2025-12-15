## MODIFIED Requirements

### Requirement: Animal Orchestra Conductor
The system SHALL provide a layering game where multiple orchestra sections can be started or stopped and their musical parts changed, presented as a conductor-perspective stage view.

#### Scenario: Start strings and winds, stop brass
- **WHEN** the learner cues the Strings and Woodwinds sections to play and cues Brass to stop
- **THEN** only Strings and Woodwinds SHALL be audible
- **AND** the system SHALL reflect toggled states visually and in audio

#### Scenario: Select a seat and change its part
- **WHEN** the learner selects an individual seat/section on the stage
- **AND** the learner chooses a different part variant (A–F)
- **THEN** the selected seat/section SHALL switch to the chosen part
- **AND** the system SHALL reflect the selection and part change visually

#### Scenario: Conductor podium controls remain available
- **WHEN** the learner uses conductor podium controls (tempo, master volume, play/stop all, presets)
- **THEN** those controls SHALL update playback and visuals consistently

#### Scenario: Placeholder art enables development before final assets
- **WHEN** placeholder assets are present following the asset manifest naming/paths
- **THEN** the redesigned UI SHALL function with placeholders
- **AND** final art SHALL be replaceable without code changes by swapping files

## ADDED Requirements

### Requirement: Expanded Orchestra Seating
The system SHALL provide an expanded orchestra with approximately 18 playable seats spanning strings, woodwinds, brass, and percussion/color.

#### Scenario: Full orchestra available
- **WHEN** the learner enters the game
- **THEN** the UI SHALL present a seated orchestra layout with all available seats

### Requirement: Conductor Perspective Stage Layout
The system SHALL present the orchestra in a semi-circular, seated arrangement with a conductor podium UI in the foreground.

#### Scenario: Conductor POV
- **WHEN** the learner views the main play screen
- **THEN** the stage layout SHALL visually communicate the perspective of a conductor facing the orchestra

