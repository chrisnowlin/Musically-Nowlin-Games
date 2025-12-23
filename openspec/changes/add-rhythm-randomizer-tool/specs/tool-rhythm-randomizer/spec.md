# Rhythm Randomizer Tool

A standalone rhythm pattern generation tool for music educators, featuring worksheet export, ensemble mode, and multiple notation formats.

## ADDED Requirements

### Requirement: Rhythm Pattern Generation

The system SHALL generate random rhythm patterns based on configurable parameters including time signature, tempo, note values, and complexity settings.

#### Scenario: Generate basic pattern

- **GIVEN** the user has selected time signature 4/4, tempo 120 BPM, and allowed note values (quarter, eighth)
- **WHEN** the user clicks "Generate" or "Regenerate"
- **THEN** the system generates a rhythm pattern that fills the specified number of measures
- **AND** the pattern only contains the selected note values
- **AND** each measure correctly totals the beats required by the time signature

#### Scenario: Apply syncopation

- **GIVEN** the user has set syncopation probability to 50%
- **WHEN** a pattern is generated
- **THEN** approximately half of the rhythmic emphasis falls on off-beats
- **AND** the pattern remains musically valid within the time signature

#### Scenario: Difficulty presets

- **GIVEN** the user selects "Beginner" preset
- **WHEN** the preset is applied
- **THEN** settings are configured for simple patterns (quarter/half notes, no syncopation, 2 measures)
- **AND** the user can still modify individual settings after applying the preset

---

### Requirement: Dual Notation Display

The system SHALL display generated rhythm patterns in both standard staff notation and simplified grid notation, with the ability to toggle between views.

#### Scenario: Staff notation display

- **GIVEN** a rhythm pattern has been generated
- **WHEN** the user selects "Staff" notation mode
- **THEN** the pattern is rendered using VexFlow with a percussion clef
- **AND** note values are correctly represented with stems, flags, and beams
- **AND** rests are displayed in their proper notation

#### Scenario: Grid notation display

- **GIVEN** a rhythm pattern has been generated
- **WHEN** the user selects "Grid" notation mode
- **THEN** the pattern is rendered as a simplified horizontal grid
- **AND** beats are visually divided into subdivisions
- **AND** notes are represented as filled shapes and rests as empty spaces

#### Scenario: Toggle between modes

- **GIVEN** the user is viewing staff notation
- **WHEN** the user clicks the grid notation toggle
- **THEN** the display switches to grid notation without regenerating the pattern
- **AND** the same rhythm pattern is preserved

---

### Requirement: Counting Syllable Systems

The system SHALL support multiple counting syllable systems (Kodaly, Takadimi, Gordon, Numbers) and display syllables aligned with the notation.

#### Scenario: Kodaly syllables

- **GIVEN** the user has selected "Kodaly" syllable system
- **WHEN** a pattern containing quarter and eighth notes is displayed
- **THEN** quarter notes show "ta" syllables
- **AND** paired eighth notes show "ti-ti" syllables
- **AND** syllables are positioned below their corresponding notes

#### Scenario: Takadimi syllables

- **GIVEN** the user has selected "Takadimi" syllable system
- **WHEN** a pattern is displayed
- **THEN** beat 1 shows "ta", the "and" shows "di"
- **AND** sixteenth note subdivisions show "ta-ka-di-mi" pattern

#### Scenario: Hide syllables

- **GIVEN** syllables are currently displayed
- **WHEN** the user toggles syllables off
- **THEN** the notation is displayed without syllable labels

---

### Requirement: Audio Playback

The system SHALL play generated rhythm patterns with configurable tempo, count-in, loop, and instrument sound options.

#### Scenario: Play pattern

- **GIVEN** a rhythm pattern has been generated
- **WHEN** the user clicks "Play"
- **THEN** the pattern plays at the specified tempo
- **AND** notes are played with the selected instrument sound
- **AND** the current beat is visually highlighted during playback

#### Scenario: Count-in before playback

- **GIVEN** the user has enabled count-in (2 measures)
- **WHEN** the user clicks "Play"
- **THEN** a metronome click plays for 2 measures before the pattern begins
- **AND** the count-in uses the same tempo as the pattern

#### Scenario: Loop playback

- **GIVEN** the user has enabled loop mode
- **WHEN** the pattern finishes playing
- **THEN** playback restarts from the beginning without stopping
- **AND** playback continues until the user clicks "Stop"

#### Scenario: Multiple sound options

- **GIVEN** the sound selector offers drums, woodblock, claps, and piano
- **WHEN** the user selects "Woodblock"
- **THEN** subsequent playback uses woodblock sound samples

---

### Requirement: Ensemble Mode

The system SHALL generate coordinated multi-part rhythms (2-4 parts) for ensemble activities including call/response, layered parts, and body percussion.

#### Scenario: Call and response

- **GIVEN** the user selects "Call & Response" ensemble mode
- **WHEN** a pattern is generated
- **THEN** Part A (call) and Part B (response) are generated
- **AND** Part B complements Part A with contrasting rhythmic characteristics
- **AND** both parts are displayed stacked vertically

#### Scenario: Layered parts

- **GIVEN** the user selects "Layered Parts" with 3 parts
- **WHEN** a pattern is generated
- **THEN** Part 1 contains a sparse foundational rhythm
- **AND** Part 2 adds moderate complexity
- **AND** Part 3 contains the most complex syncopation
- **AND** all parts are rhythmically compatible

#### Scenario: Body percussion labels

- **GIVEN** the user selects "Body Percussion" mode
- **WHEN** parts are generated
- **THEN** each part is labeled with a body percussion type (stomp, clap, snap, pat)
- **AND** playback uses appropriate sounds for each body part

#### Scenario: Multi-part playback

- **GIVEN** an ensemble pattern with 3 parts has been generated
- **WHEN** the user clicks "Play"
- **THEN** all parts play simultaneously with different timbres
- **AND** each part can be muted or soloed individually

---

### Requirement: Worksheet PDF Export

The system SHALL export generated patterns as printable PDF worksheets with configurable formats including answer keys, blank completion exercises, and multiple difficulty versions.

#### Scenario: Standard worksheet export

- **GIVEN** a rhythm pattern has been generated
- **WHEN** the user clicks "Export PDF" with standard format
- **THEN** a PDF is generated containing the rhythm notation
- **AND** the PDF includes a title, date, and student name field
- **AND** the PDF is formatted for standard letter paper

#### Scenario: Blank completion exercise

- **GIVEN** the user selects "Blank Completion" worksheet format
- **WHEN** the PDF is exported
- **THEN** some measures are displayed with notation
- **AND** remaining measures are blank with measure lines only
- **AND** an instruction prompt is included for students

#### Scenario: Answer key generation

- **GIVEN** the user enables "Include Answer Key"
- **WHEN** the PDF is exported
- **THEN** the answer key is generated on a separate page
- **AND** the answer key shows the complete notation with syllables
- **AND** the answer key page is marked "ANSWER KEY"

#### Scenario: Difficulty variants

- **GIVEN** the user selects "Generate 3 Difficulty Versions"
- **WHEN** the PDF is exported
- **THEN** the PDF contains three variations of the pattern
- **AND** each variation increases in complexity (note values, syncopation)
- **AND** each variation is clearly labeled with its difficulty level

---

### Requirement: Time Signature Support

The system SHALL support simple, compound, and irregular time signatures commonly used in music education.

#### Scenario: Simple time signatures

- **GIVEN** the time signature selector is displayed
- **WHEN** the user views available options
- **THEN** 2/4, 3/4, and 4/4 are available
- **AND** selecting 3/4 generates patterns with 3 beats per measure

#### Scenario: Compound time signatures

- **GIVEN** the user selects 6/8 time signature
- **WHEN** a pattern is generated
- **THEN** the pattern contains 6 eighth note beats per measure
- **AND** triplet groupings are handled appropriately
- **AND** the notation correctly beams notes in groups of 3

#### Scenario: Irregular time signatures

- **GIVEN** the user selects 5/4 or 7/8 time signature
- **WHEN** a pattern is generated
- **THEN** the pattern correctly fills the asymmetric measure length
- **AND** beat groupings reflect common practice (e.g., 3+2 for 5/4)

---

### Requirement: Pattern Sharing

The system SHALL allow users to share generated patterns via URL, preserving all settings and the specific pattern.

#### Scenario: Generate shareable URL

- **GIVEN** a rhythm pattern has been generated with specific settings
- **WHEN** the user clicks "Share"
- **THEN** a URL is generated encoding the current settings and pattern
- **AND** the URL is copied to the clipboard
- **AND** a confirmation message is displayed

#### Scenario: Load shared pattern

- **GIVEN** a user navigates to a shared URL
- **WHEN** the page loads
- **THEN** the settings from the URL are applied
- **AND** the exact same pattern is regenerated
- **AND** the user can modify settings or regenerate

---

### Requirement: Responsive Layout

The system SHALL provide a responsive layout that works on desktop, tablet, and mobile devices.

#### Scenario: Desktop layout

- **GIVEN** the user accesses the tool on a desktop browser (>1024px)
- **WHEN** the page loads
- **THEN** the control panel is displayed on the left
- **AND** the notation display is on the right
- **AND** all controls are visible without scrolling

#### Scenario: Mobile layout

- **GIVEN** the user accesses the tool on a mobile device (<768px)
- **WHEN** the page loads
- **THEN** controls are stacked vertically above the notation
- **AND** the notation scales to fit the screen width
- **AND** touch-friendly button sizes are used
