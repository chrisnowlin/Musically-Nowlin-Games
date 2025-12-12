## MODIFIED Requirements
### Requirement: Difficulty Progression
The system SHALL increase difficulty with correct answers by accelerating note travel speed and/or shortening allowed time, with levels advancing every 10 correct answers.

#### Scenario: Level up at 10 correct answers
- **WHEN** the player reaches 10 correct answers
- **THEN** the level SHALL increase from 1 to 2
- **AND** note travel speed SHALL increase according to the enhanced speed curve
- **AND** visual and audio feedback SHALL celebrate the level advancement
- **AND** the level indicator SHALL update prominently in the HUD

#### Scenario: Consistent level progression
- **WHEN** the player reaches 20, 30, 40, etc. correct answers
- **THEN** the level SHALL increase by 1 for each 10 correct answers
- **AND** difficulty SHALL scale smoothly across all levels
- **AND** level-up feedback SHALL repeat for each advancement

#### Scenario: Enhanced speed curve
- **WHEN** the player progresses through levels
- **THEN** note speed SHALL increase slightly with each level advancement
- **AND** speed increments SHALL be consistent and predictable (e.g., 10-15% increase per level)
- **AND** speed progression SHALL replace the current 5-step milestone system
- **AND** maximum speed SHALL remain achievable but challenging at higher levels

## ADDED Requirements
### Requirement: Level Progress Tracking
The system SHALL track the player's progress toward the next level and display this information prominently during gameplay.

#### Scenario: Progress toward next level
- **WHEN** the player has answered correctly 7 times in the current level
- **THEN** the HUD SHALL show "Level 2" with 7/10 progress
- **AND** a visual progress bar SHALL indicate 70% completion toward level 3
- **AND** the display SHALL update in real-time with each correct answer

#### Scenario: Level reset on new game
- **WHEN** the player starts a new game
- **THEN** the level SHALL reset to 1
- **AND** the progress counter SHALL reset to 0/10
- **AND** the speed SHALL return to the beginner level

### Requirement: Level-Up Celebration
The system SHALL provide celebratory visual and audio feedback when the player advances to a new level.

#### Scenario: Visual level-up effect
- **WHEN** the player advances to a new level
- **THEN** a brief animation SHALL play on the staff canvas
- **AND** the level number SHALL pulse or animate in the HUD
- **AND** particle effects SHALL indicate the achievement

#### Scenario: Audio level-up feedback
- **WHEN** the player advances to a new level and SFX is enabled
- **THEN** audioService SHALL play a celebratory tone sequence
- **AND** the sound SHALL be distinct from correct/incorrect answer sounds
- **AND** the audio SHALL not delay gameplay continuation