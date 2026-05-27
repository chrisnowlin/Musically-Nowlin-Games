# Site Migration Notice

## ADDED Requirements

### Requirement: Site-Wide Migration Popup

The system SHALL present a site-wide notification popup that tells visitors the current games site is planned for shutdown and directs them to the replacement Musically Nowlin site.

#### Scenario: Visitor sees migration notice
- **GIVEN** a visitor opens any route in the application
- **AND** the visitor has not previously dismissed the migration notice in the current browser
- **WHEN** the app shell renders
- **THEN** the system SHALL display a popup with a short shutdown message
- **AND** the popup SHALL include a primary action linking to `https://musicallynowlin.com`

#### Scenario: Visitor follows replacement site link
- **GIVEN** the migration notice is visible
- **WHEN** the visitor activates the primary replacement-site action
- **THEN** the browser SHALL navigate to `https://musicallynowlin.com`

#### Scenario: Visitor dismisses migration notice
- **GIVEN** the migration notice is visible
- **WHEN** the visitor dismisses the notice
- **THEN** the system SHALL hide the popup
- **AND** the system SHALL remember the dismissal in browser storage
- **AND** subsequent route visits in the same browser SHALL not show the popup again

### Requirement: Persistent Site Migration Banner

The system SHALL present a persistent site-wide banner that tells visitors the current games site is planned for shutdown and links to the replacement Musically Nowlin site.

#### Scenario: Visitor sees persistent banner
- **GIVEN** a visitor opens any route in the application
- **WHEN** the app shell renders
- **THEN** the system SHALL display a persistent banner with a short shutdown message
- **AND** the banner SHALL include a link to `https://musicallynowlin.com`

#### Scenario: Banner remains after popup dismissal
- **GIVEN** the visitor has dismissed the migration popup in the current browser
- **WHEN** the visitor opens or revisits an application route
- **THEN** the system SHALL continue to display the persistent banner
- **AND** the system SHALL not provide a dismiss control for the persistent banner
