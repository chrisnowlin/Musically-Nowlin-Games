#!/usr/bin/env python3
"""
Generate 500 individual OpenSpec game proposals
"""

import os
import json
from pathlib import Path

# Game data from GAME_IDEAS.md
GAMES = {
    "pitch": [
        {"id": "pitch-001", "title": "Octave Leap Detective", "desc": "Identify if two notes are in same octave or different octaves", "difficulty": "easy", "age": "5-8", "mechanic": "Multiple Choice"},
        {"id": "pitch-002", "title": "Micro-Interval Matcher", "desc": "Distinguish between semitone and whole tone intervals", "difficulty": "hard", "age": "8-12", "mechanic": "Comparison"},
        {"id": "pitch-003", "title": "Pitch Contour Tracer", "desc": "Draw the shape of a melody as it plays", "difficulty": "medium", "age": "6-10", "mechanic": "Drawing"},
        {"id": "pitch-004", "title": "Relative Pitch Master", "desc": "Identify intervals without reference note", "difficulty": "hard", "age": "9-12", "mechanic": "Naming"},
        {"id": "pitch-005", "title": "Absolute Pitch Trainer", "desc": "Name individual notes without reference", "difficulty": "hard", "age": "10-12", "mechanic": "Naming"},
        {"id": "pitch-006", "title": "Pitch Bend Detector", "desc": "Identify if pitch slides up, down, or stays steady", "difficulty": "easy", "age": "5-8", "mechanic": "Multiple Choice"},
        {"id": "pitch-007", "title": "Harmonic Series Explorer", "desc": "Identify overtones in a complex tone", "difficulty": "hard", "age": "9-12", "mechanic": "Identification"},
        {"id": "pitch-008", "title": "Pitch Vibrato Detector", "desc": "Identify vibrato presence and speed", "difficulty": "medium", "age": "7-10", "mechanic": "Analysis"},
        {"id": "pitch-009", "title": "Pitch Glissando Tracker", "desc": "Follow smooth pitch transitions", "difficulty": "medium", "age": "6-10", "mechanic": "Tracking"},
        {"id": "pitch-010", "title": "Pitch Portamento Identifier", "desc": "Distinguish portamento from staccato", "difficulty": "medium", "age": "7-10", "mechanic": "Comparison"},
    ]
}

def create_proposal(game_id, title, description, difficulty, age_range, mechanic):
    """Create a single game proposal"""
    
    change_id = f"add-{game_id.replace('-', '-game-')}"
    base_path = f"openspec/changes/{change_id}"
    
    # Create directory structure
    os.makedirs(f"{base_path}/specs/game-{game_id}", exist_ok=True)
    
    # proposal.md
    proposal_content = f"""## Why
Enable music education through {title}, a focused game that teaches {description.lower()} with immediate feedback and age-appropriate difficulty.

## What Changes
- Add new game: {title}
- Implement game mechanics: {mechanic}
- Add audio synthesis for {title.lower()}
- Implement scoring and feedback system
- Add difficulty progression
- Implement accessibility features

## Impact
- Affected specs: game-{game_id} (new)
- Affected code:
  - client/src/config/games.ts (game registration)
  - client/src/components/ (new game component)
  - client/src/lib/ (game logic)
  - client/src/test/ (test coverage)
- New dependencies: None
- Performance target: 60 FPS on modern browsers
"""
    
    # tasks.md
    tasks_content = f"""## 1. Implementation
- [ ] 1.1 Create game component ({title})
- [ ] 1.2 Implement game logic
- [ ] 1.3 Add audio synthesis
- [ ] 1.4 Implement scoring system
- [ ] 1.5 Add difficulty progression
- [ ] 1.6 Implement accessibility features

## 2. Testing
- [ ] 2.1 Write unit tests for game logic
- [ ] 2.2 Write component tests
- [ ] 2.3 Test audio synthesis
- [ ] 2.4 Test scoring accuracy
- [ ] 2.5 Accessibility testing

## 3. Integration
- [ ] 3.1 Register game in config
- [ ] 3.2 Add game route
- [ ] 3.3 Update landing page
- [ ] 3.4 Test game navigation

## 4. Documentation
- [ ] 4.1 Document game mechanics
- [ ] 4.2 Document scoring rules
- [ ] 4.3 Update README
"""
    
    # spec.md
    spec_content = f"""## ADDED Requirements

### Requirement: {title} Game
The system SHALL provide {title} game that teaches {description.lower()}.

#### Scenario: Game initialization
- **WHEN** {title} game loads
- **THEN** game interface is displayed
- **AND** audio is initialized
- **AND** scoring system is ready

#### Scenario: Game play
- **WHEN** player interacts with game
- **THEN** audio feedback is provided
- **AND** score is updated
- **AND** difficulty adjusts based on performance

#### Scenario: Game completion
- **WHEN** game ends
- **THEN** final score is displayed
- **AND** feedback is provided
- **AND** progress is saved

### Requirement: Accessibility
The system SHALL ensure {title} is accessible to all users.

#### Scenario: Keyboard navigation
- **WHEN** user navigates with keyboard
- **THEN** all controls are accessible
- **AND** focus is visible
- **AND** shortcuts are available

#### Scenario: Screen reader support
- **WHEN** screen reader is active
- **THEN** all content is announced
- **AND** instructions are clear
- **AND** feedback is descriptive
"""
    
    # Write files
    with open(f"{base_path}/proposal.md", "w") as f:
        f.write(proposal_content)
    
    with open(f"{base_path}/tasks.md", "w") as f:
        f.write(tasks_content)
    
    with open(f"{base_path}/specs/game-{game_id}/spec.md", "w") as f:
        f.write(spec_content)
    
    return change_id

# Generate first 10 proposals as test
if __name__ == "__main__":
    count = 0
    for game in GAMES["pitch"][:10]:
        change_id = create_proposal(
            game["id"],
            game["title"],
            game["desc"],
            game["difficulty"],
            game["age"],
            game["mechanic"]
        )
        print(f"✅ Created: {change_id}")
        count += 1
    
    print(f"\n✅ Generated {count} proposals")
    print("Run: openspec validate <change-id> --strict")

