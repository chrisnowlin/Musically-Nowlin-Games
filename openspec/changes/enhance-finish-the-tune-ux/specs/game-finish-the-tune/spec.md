# game-finish-the-tune Spec Delta

## ADDED Requirements

### Requirement: Note Name Display
The system SHALL display the musical note name (C, D, E, F, G, A, B) on or near each note circle in the melody visualizer to reinforce note recognition.

#### Scenario: Note names visible during playback
- **WHEN** the melody visualizer displays notes
- **THEN** each note circle SHALL display its note name (C, D, E, etc.)
- **AND** the note name SHALL be legible at all device sizes
- **AND** the note name SHALL use a contrasting color for readability

#### Scenario: Note names on option previews
- **WHEN** answer options are displayed with mini visualizers
- **THEN** each option's notes SHALL display their note names
- **AND** the text size SHALL be appropriately scaled for the smaller visualizer

### Requirement: Correct Answer Feedback
The system SHALL display and play the correct ending when the learner answers incorrectly, reinforcing the correct musical resolution.

#### Scenario: Show correct answer after wrong guess
- **WHEN** the learner selects an incorrect ending
- **THEN** the correct option card SHALL be highlighted with a green glow
- **AND** the correct ending SHALL automatically play after a 1-second delay
- **AND** the feedback display SHALL remain visible for at least 4 seconds

#### Scenario: Visual distinction of correct answer
- **WHEN** the correct answer is revealed after a wrong guess
- **THEN** the correct card SHALL have a visually distinct highlight (green border/glow)
- **AND** the incorrect selected card SHALL show a red indicator
- **AND** both SHALL be clearly distinguishable

### Requirement: Playback Speed Control
The system SHALL provide a "Slow Mode" toggle that plays melodies at half speed for learners who need more time to process.

#### Scenario: Enable slow mode
- **WHEN** the learner toggles slow mode on
- **THEN** all melody playback SHALL occur at 50% of normal speed
- **AND** note durations SHALL be doubled proportionally
- **AND** the setting SHALL be clearly indicated in the UI

#### Scenario: Persist slow mode preference
- **WHEN** the learner enables slow mode
- **THEN** the preference SHALL be saved to localStorage
- **AND** the preference SHALL be restored on subsequent visits

### Requirement: Difficulty Levels
The system SHALL provide three difficulty levels that control the number of answer options presented.

#### Scenario: Easy difficulty
- **WHEN** the learner selects Easy difficulty
- **THEN** exactly 2 answer options SHALL be displayed (1 correct, 1 wrong)
- **AND** the game SHALL be labeled as "Easy"

#### Scenario: Medium difficulty
- **WHEN** the learner selects Medium difficulty
- **THEN** exactly 3 answer options SHALL be displayed (1 correct, 2 wrong)
- **AND** the game SHALL be labeled as "Medium"

#### Scenario: Hard difficulty
- **WHEN** the learner selects Hard difficulty
- **THEN** exactly 4 answer options SHALL be displayed (1 correct, 3 wrong)
- **AND** the game SHALL be labeled as "Hard"

#### Scenario: Persist difficulty preference
- **WHEN** the learner selects a difficulty level
- **THEN** the preference SHALL be saved to localStorage
- **AND** the preference SHALL be restored on subsequent visits

### Requirement: Auto-Play Melody Option
The system SHALL provide an option to automatically play the melody when a new question appears.

#### Scenario: Enable auto-play
- **WHEN** the learner enables auto-play in settings
- **THEN** the melody SHALL automatically begin playing 500ms after a new question loads
- **AND** the learner may still manually replay using the play button

#### Scenario: Auto-play with slow mode
- **WHEN** auto-play is enabled and slow mode is active
- **THEN** the auto-played melody SHALL respect the slow mode speed setting

### Requirement: Retry Wrong Questions
The system SHALL queue incorrectly answered questions and re-present them after subsequent correct answers.

#### Scenario: Queue wrong answer for retry
- **WHEN** the learner answers a question incorrectly
- **THEN** the question SHALL be added to a retry queue
- **AND** the learner SHALL proceed to a new question

#### Scenario: Present retry question
- **WHEN** the learner answers 2-3 subsequent questions correctly
- **AND** there are questions in the retry queue
- **THEN** a question from the retry queue SHALL be presented
- **AND** the queue position SHALL be updated

#### Scenario: Clear retry queue on correct answer
- **WHEN** a retried question is answered correctly
- **THEN** it SHALL be removed from the retry queue
- **AND** normal question flow SHALL resume

### Requirement: Streak Counter
The system SHALL track and display consecutive correct answers with visual feedback that escalates with streak length.

#### Scenario: Display streak count
- **WHEN** the learner answers correctly
- **THEN** the streak counter SHALL increment
- **AND** the current streak SHALL be displayed prominently

#### Scenario: Streak visual escalation
- **WHEN** the streak reaches 3 or more
- **THEN** a fire/flame visual effect SHALL appear on the streak counter
- **WHEN** the streak reaches 5 or more
- **THEN** sparkle/star effects SHALL be added

#### Scenario: Reset streak on wrong answer
- **WHEN** the learner answers incorrectly
- **THEN** the streak counter SHALL reset to 0
- **AND** the best streak for the session SHALL be preserved

### Requirement: Celebration Effects
The system SHALL display confetti-style particle effects when the learner answers correctly to reinforce positive feedback.

#### Scenario: Trigger confetti on correct answer
- **WHEN** the learner selects the correct ending
- **THEN** particle effects SHALL animate from the selected card
- **AND** particles SHALL include musical note imagery
- **AND** particles SHALL animate upward and fade out

#### Scenario: Performance-safe particles
- **WHEN** confetti effects are triggered
- **THEN** no more than 12 particles SHALL be rendered
- **AND** particles SHALL use CSS animations for GPU acceleration
- **AND** particles SHALL be removed from DOM after animation completes

### Requirement: Melody Name Display
The system SHALL display the name of the melody pattern after the learner answers, providing educational context.

#### Scenario: Show melody name on correct answer
- **WHEN** the learner answers correctly
- **THEN** the melody name (e.g., "Walking Home", "Twinkle Pause") SHALL be displayed
- **AND** the display SHALL animate in smoothly

#### Scenario: Show melody name on wrong answer
- **WHEN** the learner answers incorrectly
- **THEN** the melody name SHALL be displayed along with the correct answer feedback
- **AND** both SHALL be visible for the feedback duration

### Requirement: Progress Tracker
The system SHALL track and display how many of the 8 unique melody patterns the learner has discovered.

#### Scenario: Track discovered melodies
- **WHEN** the learner encounters a melody pattern for the first time
- **THEN** it SHALL be marked as discovered
- **AND** the discovery SHALL be persisted to localStorage

#### Scenario: Display progress bar
- **WHEN** the game is active
- **THEN** a progress indicator SHALL show "X/8 melodies discovered"
- **AND** the progress bar SHALL fill proportionally

#### Scenario: Complete all melodies
- **WHEN** the learner has discovered all 8 melody patterns
- **THEN** the progress tracker SHALL indicate completion
- **AND** an achievement SHALL be unlocked

### Requirement: Achievement System
The system SHALL award achievements for reaching specific milestones and persist them to localStorage.

#### Scenario: First correct answer achievement
- **WHEN** the learner answers their first question correctly
- **THEN** the "First Note" achievement SHALL be unlocked
- **AND** a notification SHALL appear briefly

#### Scenario: Streak achievements
- **WHEN** the learner achieves a streak of 5 correct answers
- **THEN** the "Hot Streak" achievement SHALL be unlocked
- **WHEN** the learner achieves a streak of 10 correct answers
- **THEN** the "On Fire" achievement SHALL be unlocked

#### Scenario: Perfect accuracy achievement
- **WHEN** the learner completes 10 questions with 100% accuracy
- **THEN** the "Perfect Ten" achievement SHALL be unlocked

#### Scenario: Persist achievements
- **WHEN** an achievement is unlocked
- **THEN** it SHALL be saved to localStorage
- **AND** it SHALL remain unlocked on subsequent visits

### Requirement: High Score Tracking
The system SHALL track the highest score achieved and persist it to localStorage.

#### Scenario: Update high score
- **WHEN** the learner's current score exceeds their stored high score
- **THEN** the high score SHALL be updated
- **AND** a visual indicator SHALL appear briefly

#### Scenario: Display high score
- **WHEN** the game is active or on the start screen
- **THEN** the current high score SHALL be displayed
- **AND** the display SHALL include the best streak achieved

### Requirement: Timed Challenge Mode
The system SHALL provide an optional timed mode with a 60-second countdown where learners score as many correct answers as possible.

#### Scenario: Start timed mode
- **WHEN** the learner selects timed challenge mode
- **THEN** a 60-second countdown timer SHALL start
- **AND** the timer SHALL be prominently displayed

#### Scenario: Timer countdown
- **WHEN** timed mode is active
- **THEN** the timer SHALL decrement each second
- **AND** the timer color SHALL change to red when under 10 seconds

#### Scenario: Timer expiration
- **WHEN** the timer reaches 0
- **THEN** the game SHALL end
- **AND** the final score SHALL be displayed
- **AND** the score SHALL be compared to the timed mode high score

### Requirement: Keyboard Navigation
The system SHALL support keyboard navigation for accessibility and power users.

#### Scenario: Number key selection
- **WHEN** the learner presses keys 1, 2, 3, or 4
- **THEN** the corresponding answer option SHALL be selected
- **AND** the selection SHALL trigger answer validation

#### Scenario: Arrow key navigation
- **WHEN** the learner presses arrow up/left
- **THEN** focus SHALL move to the previous option
- **WHEN** the learner presses arrow down/right
- **THEN** focus SHALL move to the next option

#### Scenario: Space key playback
- **WHEN** the learner presses the space bar
- **THEN** the melody SHALL play or replay
- **AND** focus SHALL not be lost

#### Scenario: Enter key confirmation
- **WHEN** an option is focused and the learner presses Enter
- **THEN** the focused option SHALL be selected
- **AND** the selection SHALL trigger answer validation

### Requirement: Touch Target Accessibility
The system SHALL provide touch targets of at least 44x44 pixels for all interactive elements on mobile devices.

#### Scenario: Option card touch targets
- **WHEN** the game is rendered on a mobile device
- **THEN** all option cards and buttons SHALL be at least 44x44 pixels
- **AND** adequate spacing SHALL prevent accidental mis-taps

#### Scenario: Control button touch targets
- **WHEN** play, settings, or navigation buttons are displayed
- **THEN** all buttons SHALL meet the 44x44 pixel minimum

### Requirement: Screen Reader Support
The system SHALL provide ARIA labels and live regions for screen reader users.

#### Scenario: Announce score changes
- **WHEN** the score changes
- **THEN** the change SHALL be announced via an aria-live region
- **AND** the announcement SHALL include "Correct!" or "Incorrect"

#### Scenario: Keyboard instruction availability
- **WHEN** the game is active
- **THEN** a screen-reader-only element SHALL describe available keyboard shortcuts

### Requirement: Piano Keyboard Visual
The system SHALL display a visual piano keyboard that highlights notes as they play.

#### Scenario: Display piano during playback
- **WHEN** a melody is playing
- **THEN** a piano keyboard visual SHALL highlight each note as it sounds
- **AND** the keyboard SHALL show one octave (C to C)

#### Scenario: Color-coded keys
- **WHEN** notes are highlighted on the piano
- **THEN** the highlight color SHALL match the pitch-based color gradient
- **AND** the tonic (C) SHALL have a distinct indicator

### Requirement: Pitch-Based Color Gradient
The system SHALL use a consistent color gradient based on pitch to reinforce the relationship between pitch height and visual position.

#### Scenario: Apply color gradient to notes
- **WHEN** notes are displayed in the visualizer
- **THEN** lower pitches SHALL use warmer colors (red, orange)
- **AND** higher pitches SHALL use cooler colors (blue, violet)
- **AND** the gradient SHALL be consistent across all visualizations

### Requirement: Compare Endings Feature
The system SHALL allow the learner to play two endings back-to-back for direct comparison.

#### Scenario: Compare two options
- **WHEN** the learner initiates a compare action between two options
- **THEN** the first ending SHALL play
- **AND** after a 500ms pause, the second ending SHALL play
- **AND** both options SHALL be visually indicated during playback

### Requirement: Loop Melody Option
The system SHALL provide an option to continuously loop the melody until the learner answers or disables looping.

#### Scenario: Enable loop mode
- **WHEN** the learner enables loop mode in settings
- **THEN** the melody SHALL replay automatically after a 1-second pause
- **AND** looping SHALL continue until an answer is submitted

#### Scenario: Loop pause on focus change
- **WHEN** the learner interacts with answer options while looping
- **THEN** looping SHALL pause to avoid audio overlap during preview

### Requirement: Fullscreen Mode
The system SHALL provide a fullscreen toggle for immersive gameplay.

#### Scenario: Enter fullscreen
- **WHEN** the learner activates fullscreen mode
- **THEN** the game SHALL enter fullscreen using the Fullscreen API
- **AND** a minimize button SHALL be displayed

#### Scenario: Exit fullscreen
- **WHEN** the learner presses Escape or the minimize button
- **THEN** the game SHALL exit fullscreen
- **AND** game state SHALL be preserved

## MODIFIED Requirements

### Requirement: Finish the Tune (MODIFIED)
The system SHALL provide a melody completion game where the learner hears a beginning phrase and selects the correct ending from 2-4 options based on difficulty level.

#### Scenario: Choose the correct ending
- **WHEN** the opening phrase is played and answer options are offered
- **THEN** selecting the matching melodic ending SHALL be marked correct
- **AND** the system SHALL play celebration effects and display the melody name
- **AND** the streak counter SHALL increment

#### Scenario: Choose an incorrect ending
- **WHEN** the opening phrase is played and an incorrect ending is selected
- **THEN** the selection SHALL be marked incorrect
- **AND** the correct ending SHALL be highlighted and played
- **AND** the question SHALL be queued for retry
- **AND** the streak counter SHALL reset to 0
