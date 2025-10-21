#!/usr/bin/env python3
"""
Generate 500 individual OpenSpec game proposals efficiently
"""

import os
import json
from pathlib import Path

def create_game_proposal(game_id, title, description, difficulty, age_range, mechanic, category):
    """Create a single game proposal with all required files"""
    
    # Create change ID from game ID
    change_id = f"add-{game_id}"
    base_path = f"openspec/changes/{change_id}"
    
    # Create directory structure
    spec_path = f"{base_path}/specs/game-{game_id}"
    os.makedirs(spec_path, exist_ok=True)
    
    # Determine tier based on difficulty
    tier = "beginner" if difficulty == "easy" else ("intermediate" if difficulty == "medium" else "advanced")
    
    # proposal.md
    proposal = f"""## Why
Enable music education through {title}, a focused game that teaches {description.lower()} with immediate feedback and age-appropriate difficulty ({tier} tier).

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
    tasks = f"""## 1. Implementation
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
    spec = f"""## ADDED Requirements

### Requirement: {title} Game
The system SHALL provide {title} game that teaches {description.lower()} at {tier} level for ages {age_range}.

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
        f.write(proposal)
    
    with open(f"{base_path}/tasks.md", "w") as f:
        f.write(tasks)
    
    with open(f"{spec_path}/spec.md", "w") as f:
        f.write(spec)
    
    return change_id

def main():
    """Generate all proposals from games database"""

    # Load games database
    with open("games_database_500.json", "r") as f:
        data = json.load(f)

    games = data["games"]
    created = 0
    failed = 0

    print(f"Generating {len(games)} game proposals...")
    print("=" * 60)

    for i, game in enumerate(games, 1):
        try:
            change_id = create_game_proposal(
                game["id"],
                game["title"],
                game["desc"],
                game["difficulty"],
                game["age"],
                game["mechanic"],
                game["category"]
            )
            created += 1

            # Progress indicator every 50 games
            if i % 50 == 0:
                print(f"✅ Created {i}/{len(games)} proposals ({change_id})")

        except Exception as e:
            failed += 1
            print(f"❌ Failed to create {game['id']}: {e}")

    print("=" * 60)
    print(f"\n✅ Successfully created: {created} proposals")
    print(f"❌ Failed: {failed} proposals")
    print(f"\nNext steps:")
    print("1. Run: openspec validate <change-id> --strict")
    print("2. Review proposals in: openspec/changes/")
    print("3. Commit changes to git")

if __name__ == "__main__":
    main()

