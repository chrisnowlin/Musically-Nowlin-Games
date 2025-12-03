## ADDED Requirements

### Requirement: Show Correct Answer Setting

The system SHALL provide a toggleable "Show Correct Answer" setting that, when enabled, displays the correct note name temporarily after an incorrect guess, providing immediate educational feedback to the student.

#### Scenario: Enable show correct answer in setup

- **WHEN** the player enables the "Show Correct Answer" toggle in the setup screen
- **THEN** the setting SHALL be stored as enabled for the game session
- **AND** the preference SHALL be persisted to localStorage

#### Scenario: Disable show correct answer in setup

- **WHEN** the player disables the "Show Correct Answer" toggle in the setup screen
- **THEN** the setting SHALL be stored as disabled for the game session
- **AND** the preference SHALL be persisted to localStorage

#### Scenario: Load saved preference

- **WHEN** the setup screen loads
- **THEN** the "Show Correct Answer" toggle SHALL reflect the previously saved preference from localStorage
- **AND** if no preference exists, the toggle SHALL default to enabled

### Requirement: Correct Answer Display on Wrong Guess

The system SHALL temporarily display the correct note name near the note position when the player guesses incorrectly and the "Show Correct Answer" setting is enabled, before dismissing the note and spawning a new one.

#### Scenario: Display correct answer after wrong guess

- **WHEN** the player provides an incorrect answer
- **AND** the "Show Correct Answer" setting is enabled
- **THEN** the correct note name SHALL be displayed prominently near the note position on the staff
- **AND** the display SHALL remain visible for approximately 1.5 seconds
- **AND** the note SHALL remain in position during the display period
- **AND** a new note SHALL spawn only after the display period ends

#### Scenario: Skip correct answer display when disabled

- **WHEN** the player provides an incorrect answer
- **AND** the "Show Correct Answer" setting is disabled
- **THEN** no correct answer display SHALL appear
- **AND** the note SHALL be dismissed immediately
- **AND** gameplay SHALL continue as normal with a new note spawning

#### Scenario: Visual styling of correct answer display

- **WHEN** the correct answer is displayed
- **THEN** the note name text SHALL be clearly visible with high contrast
- **AND** the display SHALL include visual emphasis (such as a glow, pulse, or distinct background)
- **AND** the display SHALL not obstruct the player's view of the HUD or note buttons

#### Scenario: Correct answer display accessibility

- **WHEN** the correct answer display appears
- **THEN** the text contrast ratio SHALL meet WCAG 2.1 AA standards
- **AND** the display duration SHALL be sufficient for the student to read and process the information
- **AND** color SHALL not be the only means of identifying the correct answer
