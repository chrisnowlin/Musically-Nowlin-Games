## ADDED Requirements
### Requirement: Low-Power Device Startup Efficiency
The application SHALL keep initial route startup work bounded so playable routes remain responsive on low-power target devices such as Chromebooks and SMARTBoards.

#### Scenario: Export dependencies stay out of the default tool path
- **WHEN** a player opens Rhythm Randomizer or Sight Reading Randomizer and does not open worksheet export controls
- **THEN** the application SHALL avoid loading worksheet export dependencies required only for PDF generation

#### Scenario: Media-heavy pages do not block on non-essential preload
- **WHEN** a player opens Animal Orchestra
- **THEN** the landing experience SHALL render before the application completes loading every playable sample for the route

### Requirement: Low-Power Gameplay Runtime Efficiency
The application SHALL avoid avoidable runtime allocation churn in active gameplay loops for low-power target devices.

#### Scenario: Repeated gameplay sound effects reuse audio resources
- **WHEN** a game triggers short repeated sound effects during active play
- **THEN** the game SHALL reuse route-level audio resources instead of creating a new audio context for each effect

#### Scenario: Shared responsive hooks do not duplicate viewport listeners
- **WHEN** a page consumes shared responsive layout hooks
- **THEN** the application SHALL avoid installing redundant viewport resize subscriptions for the same consumer
