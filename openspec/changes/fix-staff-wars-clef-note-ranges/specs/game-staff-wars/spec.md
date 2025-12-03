## MODIFIED Requirements

### Requirement: Note Range Configuration

The system SHALL allow constraining the playable note range appropriate to learner level and ledger-line tolerance during pre-game setup, including specialized modes for line-only and space-only practice. Range presets SHALL be clef-aware and dynamically adjust based on the selected clef.

#### Scenario: Select beginner range for treble clef
- **WHEN** the player selects treble clef
- **AND** selects a beginner preset range
- **THEN** only notes within the treble staff range (E4-F5) SHALL spawn during gameplay
- **AND** ledger lines SHALL be minimized

#### Scenario: Select beginner range for bass clef
- **WHEN** the player selects bass clef
- **AND** selects a beginner preset range
- **THEN** only notes within the bass staff range (G2-A3) SHALL spawn during gameplay
- **AND** ledger lines SHALL be minimized

#### Scenario: Select beginner range for alto clef
- **WHEN** the player selects alto clef
- **AND** selects a beginner preset range
- **THEN** only notes within the alto staff range (F3-G4) SHALL spawn during gameplay
- **AND** ledger lines SHALL be minimized

#### Scenario: Custom range selection
- **WHEN** the player specifies a custom minimum and maximum note
- **THEN** the game SHALL validate the range is pedagogically appropriate
- **AND** only notes within that custom range SHALL spawn

#### Scenario: Select filtered mode (Recruit or Cadet)
- **WHEN** the player selects Recruit or Cadet mode
- **THEN** notes SHALL be filtered to only line notes or space notes respectively based on the selected clef
- **AND** the filtering SHALL take precedence over range constraints
- **AND** the mode label SHALL clearly indicate the filtering applied with clef-appropriate mnemonics

#### Scenario: Range presets update when clef changes
- **WHEN** the player changes the clef selection in the setup screen
- **THEN** the range preset values SHALL automatically adjust to the new clef's staff range
- **AND** the difficulty labels SHALL remain consistent (Recruit, Cadet, Beginner, etc.)

### Requirement: Recruit Mode - Line Notes Only

The system SHALL provide a "Recruit" difficulty mode that only spawns notes positioned on staff lines, allowing students to practice line note mnemonics in isolation. The specific notes SHALL be determined by the selected clef.

#### Scenario: Select Recruit mode with treble clef
- **WHEN** the player selects "Recruit" mode in the setup screen
- **AND** treble clef is selected
- **THEN** the game SHALL only spawn notes that fall on staff lines
- **AND** the available notes SHALL be limited to E4, G4, B4, D5, and F5
- **AND** the mode SHALL be labeled "Lines Only (EGBDF)"

#### Scenario: Select Recruit mode with bass clef
- **WHEN** the player selects "Recruit" mode in the setup screen
- **AND** bass clef is selected
- **THEN** the game SHALL only spawn notes that fall on staff lines
- **AND** the available notes SHALL be limited to G2, B2, D3, F3, and A3
- **AND** the mode SHALL be labeled "Lines Only (GBDFA)"

#### Scenario: Select Recruit mode with alto clef
- **WHEN** the player selects "Recruit" mode in the setup screen
- **AND** alto clef is selected
- **THEN** the game SHALL only spawn notes that fall on staff lines
- **AND** the available notes SHALL be limited to F3, A3, C4, E4, and G4
- **AND** the mode SHALL be labeled "Lines Only (FACEG)"

#### Scenario: Recruit mode note distribution
- **WHEN** gameplay is active in Recruit mode
- **THEN** notes SHALL be randomly selected from the clef-appropriate line notes only
- **AND** consecutive identical notes SHALL be avoided when possible
- **AND** all line notes for the selected clef SHALL have equal probability of appearing

### Requirement: Cadet Mode - Space Notes Only

The system SHALL provide a "Cadet" difficulty mode that only spawns notes positioned in staff spaces, allowing students to practice space note mnemonics in isolation. The specific notes SHALL be determined by the selected clef.

#### Scenario: Select Cadet mode with treble clef
- **WHEN** the player selects "Cadet" mode in the setup screen
- **AND** treble clef is selected
- **THEN** the game SHALL only spawn notes that fall in staff spaces
- **AND** the available notes SHALL be limited to F4, A4, C5, and E5
- **AND** the mode SHALL be labeled "Spaces Only (FACE)"

#### Scenario: Select Cadet mode with bass clef
- **WHEN** the player selects "Cadet" mode in the setup screen
- **AND** bass clef is selected
- **THEN** the game SHALL only spawn notes that fall in staff spaces
- **AND** the available notes SHALL be limited to A2, C3, E3, and G3
- **AND** the mode SHALL be labeled "Spaces Only (ACEG)"

#### Scenario: Select Cadet mode with alto clef
- **WHEN** the player selects "Cadet" mode in the setup screen
- **AND** alto clef is selected
- **THEN** the game SHALL only spawn notes that fall in staff spaces
- **AND** the available notes SHALL be limited to G3, B3, D4, and F4
- **AND** the mode SHALL be labeled "Spaces Only (GBDF)"

#### Scenario: Cadet mode note distribution
- **WHEN** gameplay is active in Cadet mode
- **THEN** notes SHALL be randomly selected from the clef-appropriate space notes only
- **AND** consecutive identical notes SHALL be avoided when possible
- **AND** all space notes for the selected clef SHALL have equal probability of appearing
