# game-staff-wars Specification

## Purpose
TBD - created by archiving change add-staff-wars-note-reader. Update Purpose after archive.
## Requirements
### Requirement: Clef Selection
The system SHALL provide pre-game setup allowing the player to select a clef option from treble, bass, alto, and optionally grand staff when enabled.

#### Scenario: Select treble clef
- **WHEN** the player selects treble clef in the setup screen
- **THEN** the game SHALL display the treble clef on the staff
- **AND** notes SHALL be generated within the treble clef range

#### Scenario: Select bass clef
- **WHEN** the player selects bass clef in the setup screen
- **THEN** the game SHALL display the bass clef on the staff
- **AND** notes SHALL be generated within the bass clef range

#### Scenario: Select alto clef
- **WHEN** the player selects alto clef in the setup screen
- **THEN** the game SHALL display the alto clef on the staff
- **AND** notes SHALL be generated within the alto clef range

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

### Requirement: Note Spawning and Movement
The system SHALL spawn a single note at a time on the right side of the screen and animate it toward the clef on the left at a speed determined by the current level.

#### Scenario: Initial note spawn
- **WHEN** gameplay begins or a note is answered
- **THEN** a new note SHALL appear at the right margin within the selected range
- **AND** the note SHALL move left at the current level's speed

#### Scenario: Note reaches clef (timeout)
- **WHEN** a note reaches the clef position without a correct answer
- **THEN** one life SHALL be deducted
- **AND** the note SHALL disappear
- **AND** a new note SHALL spawn

### Requirement: Answer Input and Checking
The system SHALL allow the player to answer by tapping or clicking note-name buttons, and SHALL mark correct answers by destroying the note and adding to the score.

#### Scenario: Correct answer
- **WHEN** the player taps the button matching the current note's name (e.g., "C" for a C4 note)
- **THEN** the note SHALL disappear with visual feedback
- **AND** the score SHALL increment by 1
- **AND** a new note SHALL spawn

#### Scenario: Wrong answer
- **WHEN** the player taps a button that does NOT match the current note's name
- **THEN** one life SHALL be deducted
- **AND** the note SHALL continue moving
- **AND** visual feedback SHALL indicate the incorrect answer

### Requirement: Lives System
The system SHALL provide three lives at the start of gameplay and SHALL deduct one life for each wrong answer or timeout, ending the game when lives reach zero.

#### Scenario: Lose a life on wrong answer
- **WHEN** the player provides an incorrect answer
- **THEN** lives SHALL decrease from 3 to 2 (or 2 to 1, or 1 to 0)
- **AND** the remaining lives SHALL be displayed in the HUD

#### Scenario: Game over after three mistakes
- **WHEN** lives reach zero
- **THEN** the game SHALL transition to the Game Over state
- **AND** the final score SHALL be displayed
- **AND** a Restart option SHALL be presented

### Requirement: Difficulty Progression
The system SHALL increase difficulty with correct answers by accelerating note travel speed and/or shortening allowed time.

#### Scenario: Speed increase after milestone
- **WHEN** the player reaches a correct-answer milestone (e.g., 5 correct answers)
- **THEN** note travel speed SHALL increase according to the configured speed curve
- **AND** the level indicator SHALL update in the HUD

#### Scenario: Progressive acceleration
- **WHEN** the player continues to answer correctly
- **THEN** speed SHALL continue to escalate at subsequent milestones
- **AND** the game SHALL become progressively more challenging

### Requirement: Score Tracking
The system SHALL track and display the player's score, incrementing by 1 for each correct answer.

#### Scenario: Score increment on correct answer
- **WHEN** a correct answer is provided
- **THEN** the score SHALL increase by 1
- **AND** the updated score SHALL be immediately visible in the HUD

#### Scenario: Score persists during session
- **WHEN** the player pauses and resumes
- **THEN** the score SHALL remain unchanged
- **AND** continue incrementing with correct answers

### Requirement: HUD Display
The system SHALL display current score, level/speed indicator, and remaining lives at all times during gameplay.

#### Scenario: HUD always visible
- **WHEN** the game is in the playing state
- **THEN** the HUD SHALL show score, level, and lives
- **AND** all HUD elements SHALL be clearly readable

#### Scenario: HUD updates in real-time
- **WHEN** score, level, or lives change
- **THEN** the HUD SHALL immediately reflect the updated values
- **AND** visual transitions SHALL be smooth

### Requirement: Pause and Resume
The system SHALL provide pause/resume functionality during gameplay, and SHALL display the Game Over screen with final score and Restart option when the game ends.

#### Scenario: Pause during gameplay
- **WHEN** the player activates the pause control
- **THEN** note movement SHALL stop
- **AND** input SHALL be disabled except for Resume
- **AND** a Pause overlay SHALL be displayed

#### Scenario: Resume from pause
- **WHEN** the player activates the Resume control
- **THEN** note movement SHALL continue from the paused position
- **AND** input SHALL be re-enabled
- **AND** the game timer SHALL resume

#### Scenario: State-safe pause
- **WHEN** the game is paused and resumed
- **THEN** no game state SHALL be lost (score, lives, note position)
- **AND** gameplay SHALL continue seamlessly

### Requirement: Game Over and Restart
The system SHALL present a Game Over screen displaying the final score with a Restart option when lives reach zero.

#### Scenario: Game over display
- **WHEN** lives reach zero
- **THEN** a Game Over overlay SHALL appear
- **AND** the final score SHALL be displayed prominently
- **AND** a Restart button SHALL be presented

#### Scenario: Restart game
- **WHEN** the player taps Restart from Game Over
- **THEN** the game SHALL return to the setup screen
- **AND** all game state SHALL be reset (score to 0, lives to 3, level to 1)

### Requirement: High Score Persistence
The system SHALL optionally persist a local high score list within the browser for replay motivation.

#### Scenario: Save high score
- **WHEN** a game ends with a score higher than previous scores
- **THEN** the score SHALL be added to the local high score list
- **AND** the list SHALL be stored in localStorage

#### Scenario: Display high scores
- **WHEN** the player views the setup or game over screen
- **THEN** the top 5 high scores SHALL be displayed
- **AND** scores SHALL be sorted in descending order

### Requirement: Quick Start Flow
The system SHALL enable the player to start gameplay in under 10 seconds from page load with intuitive defaults preselected.

#### Scenario: Default configuration
- **WHEN** the setup screen loads
- **THEN** default clef (treble) and range (C4-C5) SHALL be preselected
- **AND** the Start button SHALL be immediately tappable

#### Scenario: Rapid start
- **WHEN** the player taps Start without changing defaults
- **THEN** gameplay SHALL begin within 1 second
- **AND** the first note SHALL spawn immediately

### Requirement: Accessibility - Touch Targets
The system SHALL provide touch targets of at least 44×44 pixels for all interactive elements to support touch input on mobile devices.

#### Scenario: Note-name buttons meet minimum size
- **WHEN** the gameplay screen is rendered on a mobile device
- **THEN** all note-name buttons (C, D, E, F, G, A, B) SHALL be at least 44×44 pixels
- **AND** buttons SHALL have adequate spacing to prevent mis-taps

#### Scenario: Pause and Restart buttons meet minimum size
- **WHEN** pause or game over overlays are displayed
- **THEN** Pause, Resume, and Restart buttons SHALL be at least 44×44 pixels
- **AND** buttons SHALL be easily tappable with fingers

### Requirement: Accessibility - Audio Toggle
The system SHALL provide toggleable sound effects and SHALL NOT require audio for gameplay functionality.

#### Scenario: Mute sound effects
- **WHEN** the player toggles the SFX off
- **THEN** all sound effects SHALL be muted
- **AND** visual feedback SHALL remain fully functional
- **AND** the muted state SHALL persist in localStorage

#### Scenario: Gameplay without audio
- **WHEN** sound is muted or unavailable
- **THEN** the game SHALL remain fully playable
- **AND** all feedback SHALL be provided visually

### Requirement: Accessibility - High Contrast Theme
The system SHALL use a high-contrast UI theme to ensure readability for all learners.

#### Scenario: High contrast staff rendering
- **WHEN** the staff and notes are rendered
- **THEN** the contrast ratio SHALL meet WCAG 2.1 AA standards
- **AND** notes SHALL be clearly distinguishable from the staff

#### Scenario: High contrast UI controls
- **WHEN** buttons and HUD elements are displayed
- **THEN** text and background SHALL have sufficient contrast
- **AND** color SHALL not be the only means of conveying information

### Requirement: State Preservation on Orientation Change
The system SHALL be recoverable from orientation changes without losing session state unintentionally.

#### Scenario: Orientation change during gameplay
- **WHEN** the device orientation changes from portrait to landscape or vice versa
- **THEN** the game SHALL automatically pause
- **AND** score, lives, level, and note position SHALL be preserved
- **AND** the player can resume when ready

### Requirement: Performance - Smooth Animation
The system SHALL maintain smooth animation and input response on current iOS/Android Chrome/Safari browsers with consistent frame pacing targeting 60 FPS.

#### Scenario: 60 FPS at normal speed
- **WHEN** the game is running at beginner or intermediate speed
- **THEN** animation SHALL maintain 60 FPS
- **AND** input latency SHALL be under 100ms

#### Scenario: Performance at maximum speed
- **WHEN** the game reaches maximum difficulty speed
- **THEN** animation SHALL maintain at least 30 FPS on target devices
- **AND** note movement SHALL remain smooth and predictable

### Requirement: Notation Rendering with VexFlow
The system SHALL use VexFlow for rendering staff, clef, and notes to Canvas or SVG layers with SMuFL-compatible glyphs.

#### Scenario: Render staff with clef
- **WHEN** gameplay begins
- **THEN** VexFlow SHALL render a staff with the selected clef on the left
- **AND** the staff SHALL be clearly visible and properly formatted

#### Scenario: Render moving note
- **WHEN** a note spawns
- **THEN** VexFlow SHALL render the note at the correct vertical position on the staff
- **AND** the note SHALL move smoothly across the Canvas

### Requirement: Optional Audio Feedback with Existing audioService
The system SHALL provide optional audio feedback using the existing Web Audio API-based audioService with volume toggle, with no gameplay dependency on audio.

#### Scenario: Correct answer sound effect
- **WHEN** a correct answer is given and SFX is enabled
- **THEN** audioService.playSuccessTone() SHALL be called
- **AND** the sound SHALL not block or delay gameplay

#### Scenario: Incorrect answer sound effect
- **WHEN** an incorrect answer is given and SFX is enabled
- **THEN** audioService.playErrorTone() SHALL be called
- **AND** the sound SHALL not block or delay gameplay

#### Scenario: Volume control
- **WHEN** the player adjusts the volume control
- **THEN** audioService.setVolume() SHALL adjust the playback volume
- **AND** the volume setting SHALL persist in localStorage

### Requirement: No External Telemetry by Default
The system SHALL NOT collect external telemetry by default, using local-only storage for high scores and settings unless explicitly enabled later.

#### Scenario: Local storage only
- **WHEN** the game runs in default configuration
- **THEN** no network requests SHALL be made for analytics or tracking
- **AND** all data SHALL be stored in localStorage only

#### Scenario: Privacy-focused behavior
- **WHEN** a player completes a session
- **THEN** no personally identifiable information SHALL be collected or transmitted
- **AND** the game SHALL function entirely offline after initial load

### Requirement: Future Mode Exclusions
The system SHALL exclude microphone/MIDI input and instrument modes in MVP but SHALL reserve a feature flag for future "Live" mode.

#### Scenario: No microphone permissions requested
- **WHEN** the game loads
- **THEN** no browser microphone permissions SHALL be requested
- **AND** the game SHALL be clearly labeled as "classic" tap-to-answer mode

#### Scenario: Feature flag for Live mode
- **WHEN** a future Live mode is implemented
- **THEN** a feature flag in configuration SHALL control its availability
- **AND** the default MVP SHALL remain classic tap-to-answer mode

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

