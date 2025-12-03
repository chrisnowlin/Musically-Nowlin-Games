## ADDED Requirements

### Requirement: Recruit Mode - Line Notes Only

The system SHALL provide a "Recruit" difficulty mode that only spawns notes positioned on staff lines (E, G, B, D, F), allowing students to practice the "Every Good Boy Does Fine" mnemonic in isolation.

#### Scenario: Select Recruit mode
- **WHEN** the player selects "Recruit" mode in the setup screen
- **THEN** the game SHALL only spawn notes that fall on staff lines
- **AND** the available notes SHALL be limited to E4, G4, B4, D5, and F5 for treble clef
- **AND** the mode SHALL be labeled "Lines Only (EGBDF)"

#### Scenario: Recruit mode note distribution
- **WHEN** gameplay is active in Recruit mode
- **THEN** notes SHALL be randomly selected from the five line notes only
- **AND** consecutive identical notes SHALL be avoided when possible
- **AND** all five line notes SHALL have equal probability of appearing

### Requirement: Cadet Mode - Space Notes Only

The system SHALL provide a "Cadet" difficulty mode that only spawns notes positioned in staff spaces (F, A, C, E), allowing students to practice the "FACE" mnemonic in isolation.

#### Scenario: Select Cadet mode
- **WHEN** the player selects "Cadet" mode in the setup screen
- **THEN** the game SHALL only spawn notes that fall in staff spaces
- **AND** the available notes SHALL be limited to F4, A4, C5, and E5 for treble clef
- **AND** the mode SHALL be labeled "Spaces Only (FACE)"

#### Scenario: Cadet mode note distribution
- **WHEN** gameplay is active in Cadet mode
- **THEN** notes SHALL be randomly selected from the four space notes only
- **AND** consecutive identical notes SHALL be avoided when possible
- **AND** all four space notes SHALL have equal probability of appearing

## MODIFIED Requirements

### Requirement: Note Range Configuration

The system SHALL allow constraining the playable note range appropriate to learner level and ledger-line tolerance during pre-game setup, including specialized modes for line-only and space-only practice.

#### Scenario: Select beginner range
- **WHEN** the player selects a beginner preset range (e.g., C4-G4 for treble)
- **THEN** only notes within that range SHALL spawn during gameplay
- **AND** ledger lines SHALL be minimized

#### Scenario: Custom range selection
- **WHEN** the player specifies a custom minimum and maximum note
- **THEN** the game SHALL validate the range is pedagogically appropriate
- **AND** only notes within that custom range SHALL spawn

#### Scenario: Select filtered mode (Recruit or Cadet)
- **WHEN** the player selects Recruit or Cadet mode
- **THEN** notes SHALL be filtered to only line notes or space notes respectively
- **AND** the filtering SHALL take precedence over range constraints
- **AND** the mode label SHALL clearly indicate the filtering applied
