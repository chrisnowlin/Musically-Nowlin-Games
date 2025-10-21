# game-melody-memory-match Specification

## Purpose
TBD - created by archiving change add-melody-memory-match. Update Purpose after archive.
## Requirements
### Requirement: Melody Memory Match
The system SHALL provide a memory game where cards each play a short melody; the learner flips cards and matches identical melodies.

#### Scenario: Match pairs on a 4x2 grid
- **WHEN** the learner starts a beginner round
- **THEN** the game presents 8 cards with 4 melody pairs, face-down
- **AND** tapping a card SHALL play its melody and reveal it
- **AND** matching two identical melodies SHALL keep them revealed and increment score

