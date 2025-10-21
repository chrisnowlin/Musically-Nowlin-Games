## ADDED Requirements
### Requirement: Musical Simon Says
The system SHALL provide a sequence imitation game where the learner repeats increasingly long sequences combining pitch and rhythm.

#### Scenario: Grow from 3 to 4 notes on success
- **WHEN** the learner correctly echoes a 3-note sequence
- **THEN** the next round SHALL increase to 4 notes
- **AND** an incorrect attempt SHALL allow a retry with the same length

