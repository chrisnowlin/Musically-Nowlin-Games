#!/usr/bin/env python3
"""
Generate comprehensive spec.md files for 31 consolidated games
"""

import json
import os

def create_spec(game):
    """Create comprehensive spec for consolidated game"""
    
    game_id = game['id']
    title = game['title']
    desc = game['desc']
    modes = game['modes']
    difficulty = game['difficulty']
    age = game['age']
    category = game['category']
    
    change_id = f"add-{game_id}-consolidated"
    base_path = f"openspec/changes/{change_id}"
    spec_path = f"{base_path}/specs/{game_id}"
    
    mode_count = len(modes)
    mode_list = ", ".join(modes)
    
    spec = f"""## ADDED Requirements

### Requirement: {title} Multi-Mode Game
The system SHALL provide {title} as a consolidated multi-mode game with {mode_count} distinct modes covering comprehensive {category.lower()} training for ages {age}.

#### Scenario: Game initialization
- **WHEN** {title} game loads
- **THEN** mode selection screen is displayed
- **AND** all {mode_count} modes are available
- **AND** progress indicators show completion per mode
- **AND** audio context is initialized
- **AND** game instructions are clear

#### Scenario: Mode selection
- **WHEN** user selects a mode
- **THEN** mode-specific interface loads
- **AND** mode instructions are displayed
- **AND** difficulty is set appropriately
- **AND** previous progress is loaded
- **AND** mode-specific audio is ready

#### Scenario: Mode switching
- **WHEN** user switches between modes
- **THEN** current progress is saved
- **AND** new mode loads smoothly
- **AND** state is preserved correctly
- **AND** no memory leaks occur
- **AND** transition is <500ms

#### Scenario: Multi-mode progress tracking
- **WHEN** user completes activities in any mode
- **THEN** progress is tracked per mode
- **AND** overall game progress is updated
- **AND** achievements are unlocked
- **AND** statistics are recorded
- **AND** data persists across sessions

### Requirement: Mode-Specific Gameplay
The system SHALL implement distinct gameplay mechanics for each of the {mode_count} modes: {mode_list}.

#### Scenario: Mode-specific round generation
- **WHEN** new round starts in any mode
- **THEN** mode-specific content is generated
- **AND** difficulty matches current level
- **AND** content is pedagogically appropriate
- **AND** variety is maintained
- **AND** no duplicate rounds in sequence

#### Scenario: Mode-specific answer validation
- **WHEN** user provides answer in any mode
- **THEN** mode-specific validation is applied
- **AND** feedback is immediate (<100ms)
- **AND** scoring is accurate
- **AND** difficulty adjusts appropriately
- **AND** next round is prepared

#### Scenario: Mode-specific audio synthesis
- **WHEN** audio plays in any mode
- **THEN** mode-specific audio patterns are used
- **AND** audio quality is consistent
- **AND** latency is <100ms
- **AND** audio context is reused efficiently
- **AND** no audio glitches occur

### Requirement: Progressive Difficulty System
The system SHALL implement progressive difficulty within each mode with adaptive adjustment based on performance.

#### Scenario: Initial difficulty setting
- **WHEN** user starts a mode for first time
- **THEN** difficulty is set to beginner level
- **AND** appropriate for age range ({age})
- **AND** scaffolding is provided
- **AND** instructions are clear

#### Scenario: Difficulty progression
- **WHEN** user demonstrates mastery
- **THEN** difficulty increases gradually
- **AND** progression is smooth
- **AND** user is notified of level up
- **AND** new challenges are introduced
- **AND** maximum difficulty is capped appropriately

#### Scenario: Adaptive difficulty adjustment
- **WHEN** user struggles with current level
- **THEN** difficulty decreases slightly
- **AND** additional support is provided
- **AND** user is not penalized
- **AND** confidence is maintained
- **AND** learning continues

### Requirement: Unified Scoring System
The system SHALL implement a unified scoring system that works consistently across all modes.

#### Scenario: Score calculation
- **WHEN** user answers correctly
- **THEN** score increments appropriately
- **AND** bonus points for speed/accuracy
- **AND** combo multipliers apply
- **AND** score is displayed immediately
- **AND** high score is tracked per mode

#### Scenario: Progress persistence
- **WHEN** user exits game
- **THEN** all progress is saved
- **AND** scores are persisted per mode
- **AND** difficulty levels are saved
- **AND** achievements are saved
- **AND** statistics are saved
- **AND** data loads correctly on return

#### Scenario: Statistics tracking
- **WHEN** user plays any mode
- **THEN** detailed statistics are tracked
- **AND** accuracy is calculated
- **AND** time spent is recorded
- **AND** attempts are counted
- **AND** trends are analyzed
- **AND** insights are provided

### Requirement: Mode Selection UI
The system SHALL provide an intuitive mode selection interface with clear visual hierarchy.

#### Scenario: Mode grid display
- **WHEN** mode selection screen loads
- **THEN** all modes are displayed in grid
- **AND** mode icons are clear
- **AND** mode names are visible
- **AND** progress indicators are shown
- **AND** locked modes are indicated

#### Scenario: Mode information
- **WHEN** user hovers over mode
- **THEN** mode description is shown
- **AND** difficulty level is indicated
- **AND** completion status is visible
- **AND** high score is displayed
- **AND** preview is available

#### Scenario: Mode filtering
- **WHEN** user filters modes
- **THEN** modes are filtered by criteria
- **AND** difficulty filter works
- **AND** completion filter works
- **AND** category filter works
- **AND** search works

### Requirement: Audio Synthesis
The system SHALL use Web Audio API to generate all musical sounds programmatically across all modes.

#### Scenario: Audio context management
- **WHEN** game initializes
- **THEN** single AudioContext is created
- **AND** context is reused across modes
- **AND** audio nodes are pooled
- **AND** cleanup is proper
- **AND** no memory leaks

#### Scenario: Mode-specific audio
- **WHEN** mode plays audio
- **THEN** mode-specific patterns are used
- **AND** frequencies are accurate
- **AND** envelopes are appropriate
- **AND** timing is precise
- **AND** quality is consistent

#### Scenario: Audio performance
- **WHEN** audio plays during gameplay
- **THEN** latency is <100ms
- **AND** no glitches or pops
- **AND** CPU usage is reasonable
- **AND** works on all browsers
- **AND** mobile performance is good

### Requirement: Accessibility
The system SHALL ensure {title} is accessible to all users following WCAG 2.1 AA standards across all modes.

#### Scenario: Keyboard navigation
- **WHEN** user navigates with keyboard
- **THEN** all modes are accessible via Tab
- **AND** mode selection works with keyboard
- **AND** gameplay works with keyboard
- **AND** focus indicators are visible
- **AND** shortcuts are available

#### Scenario: Screen reader support
- **WHEN** screen reader is active
- **THEN** mode names are announced
- **AND** mode descriptions are read
- **AND** game state is announced
- **AND** score updates are announced
- **AND** instructions are clear

#### Scenario: Visual accessibility
- **WHEN** game is displayed
- **THEN** color contrast meets WCAG AA
- **AND** information not by color alone
- **AND** text is resizable
- **AND** animations can be disabled
- **AND** high contrast mode works

### Requirement: Performance
The system SHALL maintain 60 FPS performance and <100ms audio latency across all {mode_count} modes.

#### Scenario: Rendering performance
- **WHEN** any mode is playing
- **THEN** frame rate stays at 60 FPS
- **AND** no dropped frames
- **AND** React DevTools shows minimal re-renders
- **AND** component updates are optimized
- **AND** mode switching is smooth

#### Scenario: Memory management
- **WHEN** switching between modes
- **THEN** previous mode is cleaned up
- **AND** no memory leaks
- **AND** audio nodes are disconnected
- **AND** event listeners are removed
- **AND** memory usage is stable

#### Scenario: Bundle size
- **WHEN** game is loaded
- **THEN** component is lazy loaded
- **AND** bundle size is <40KB gzipped
- **AND** initial load time is <500ms
- **AND** mode switching is instant
- **AND** no unnecessary dependencies

### Requirement: Testing
The system SHALL have comprehensive test coverage (>90%) for all {mode_count} modes.

#### Scenario: Unit test coverage
- **WHEN** tests are run
- **THEN** all mode logic is tested
- **AND** all edge cases are covered
- **AND** all error conditions are tested
- **AND** code coverage is >90%
- **AND** tests are maintainable

#### Scenario: Integration test coverage
- **WHEN** integration tests run
- **THEN** mode selection is tested
- **AND** mode switching is tested
- **AND** gameplay flow is tested
- **AND** progress persistence is tested
- **AND** all modes are tested

#### Scenario: Accessibility test coverage
- **WHEN** accessibility tests run
- **THEN** axe-core audit passes
- **AND** keyboard navigation is verified
- **AND** screen reader compatibility is tested
- **AND** ARIA labels are validated
- **AND** all modes are accessible
"""
    
    # Write spec file
    with open(f"{spec_path}/spec.md", "w") as f:
        f.write(spec)
    
    return change_id

def main():
    """Generate all spec files"""
    
    # Load consolidated games
    with open("games_consolidated_round2.json", "r") as f:
        data = json.load(f)
    
    games = data["games"]
    created = 0
    
    print(f"Generating spec.md files for {len(games)} consolidated games...")
    print("=" * 70)
    
    for i, game in enumerate(games, 1):
        try:
            change_id = create_spec(game)
            created += 1
            print(f"✅ Created spec {i}/{len(games)}: {change_id}")
        except Exception as e:
            print(f"❌ Failed to create spec for {game['id']}: {e}")
    
    print("=" * 70)
    print(f"\n✅ Successfully created: {created} spec files")

if __name__ == "__main__":
    main()

