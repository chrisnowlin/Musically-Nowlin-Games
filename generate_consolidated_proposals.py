#!/usr/bin/env python3
"""
Generate comprehensive OpenSpec proposals for 31 consolidated games
"""

import json
import os

def get_mode_details(game_id, modes):
    """Get detailed mode descriptions"""
    mode_details = {
        "pitch-001": {
            "octave": "Identify if notes are in same/different octaves",
            "interval": "Distinguish semitone vs whole tone intervals",
            "bend": "Identify pitch slides up/down/steady",
            "vibrato": "Identify vibrato presence and speed",
            "glissando": "Follow smooth pitch transitions",
            "portamento": "Distinguish portamento from staccato",
            "envelope": "Identify attack, sustain, release",
            "harmonic": "Identify overtones in complex tones",
            "relative": "Identify intervals without reference",
            "absolute": "Name notes without reference"
        },
        "pitch-002": {
            "transformations": "Transposition, inversion, retrograde, augmentation, diminution, ornamentation",
            "patterns": "Variations, combinations, echoes, sequences, modulations, fragmentations",
            "articulations": "Legato, staccato, dynamics"
        },
        # Add more as needed...
    }
    return mode_details.get(game_id, {})

def create_proposal(game):
    """Create comprehensive proposal for consolidated game"""
    
    game_id = game['id']
    title = game['title']
    desc = game['desc']
    modes = game['modes']
    difficulty = game['difficulty']
    age = game['age']
    category = game['category']
    
    # Create change ID
    change_id = f"add-{game_id}-consolidated"
    base_path = f"openspec/changes/{change_id}"
    
    # Create directories
    os.makedirs(f"{base_path}/specs/{game_id}", exist_ok=True)
    
    # Generate mode list
    mode_list = "\n".join([f"  - {mode}" for mode in modes])
    mode_count = len(modes)
    
    # proposal.md
    proposal = f"""## Why
Enable comprehensive music education through {title}, an ultra-dense multi-mode game that consolidates multiple related concepts into a single, cohesive learning experience. This game addresses the need for:
- Comprehensive coverage of {category.lower()} concepts
- Progressive difficulty from beginner to advanced
- Multiple learning modes within a single interface
- Reduced cognitive load through consistent UI/UX
- Efficient implementation and maintenance

This consolidated game replaces 15-30 individual games while maintaining full pedagogical coverage through {mode_count} distinct modes.

## What Changes
- Add new consolidated game: {title}
- Implement multi-mode architecture with mode switching
- Add {mode_count} distinct game modes:
{mode_list}
- Implement shared game component following existing patterns
- Add mode-specific logic and audio synthesis
- Implement unified scoring system across all modes
- Add progressive difficulty within each mode
- Implement mode selection UI
- Add state management for multi-mode gameplay
- Implement accessibility features (ARIA, keyboard nav, screen reader)
- Add comprehensive test coverage for all modes
- Implement mode persistence (save progress per mode)

## Impact
- Affected specs: {game_id} (new consolidated game)
- Affected code:
  - client/src/config/games.ts (add consolidated game registration)
  - client/src/components/{title.replace(' ', '')}Game.tsx (new multi-mode component)
  - client/src/pages/games/{title.replace(' ', '')}GamePage.tsx (new page wrapper)
  - client/src/lib/gameLogic/{game_id}Logic.ts (mode-specific logic)
  - client/src/lib/gameLogic/{game_id}Modes.ts (mode definitions)
  - client/src/test/{game_id}.test.ts (comprehensive test suite)
  - client/src/App.tsx (add route)
- New dependencies: None (uses existing Web Audio API, React, Tailwind)
- Performance target: 60 FPS on modern browsers, <100ms audio latency
- Bundle size impact: ~30-40KB per game (lazy loaded, includes all modes)
- Replaces: 15-30 individual game proposals
"""
    
    # tasks.md
    tasks = f"""## 1. Architecture & Setup
- [ ] 1.1 Design multi-mode architecture
  - Define mode interface and structure
  - Design mode switching mechanism
  - Plan shared vs mode-specific components
  - Design state management for multi-mode
- [ ] 1.2 Create mode definitions ({game_id}Modes.ts)
  - Define all {mode_count} modes with metadata
  - Specify mode-specific parameters
  - Define difficulty curves per mode
  - Add mode descriptions and instructions
- [ ] 1.3 Create base game component ({title}Game.tsx)
  - Implement mode selection UI
  - Create shared game interface
  - Add mode switching logic
  - Implement progress tracking per mode

## 2. Mode Implementation
- [ ] 2.1 Implement mode-specific logic ({game_id}Logic.ts)
  - Create round generation for each mode
  - Implement answer validation per mode
  - Add scoring calculation per mode
  - Implement difficulty progression per mode
- [ ] 2.2 Implement audio synthesis per mode
  - Use audioService for all modes
  - Implement mode-specific audio patterns
  - Add success/error tones
  - Optimize audio performance
- [ ] 2.3 Implement UI components per mode
  - Create mode-specific interfaces
  - Add visual feedback per mode
  - Implement interactive elements
  - Ensure consistent styling

## 3. State Management
- [ ] 3.1 Implement multi-mode state management
  - Track current mode
  - Manage mode-specific state
  - Implement mode switching
  - Add state persistence
- [ ] 3.2 Implement progress tracking
  - Track progress per mode
  - Save high scores per mode
  - Implement achievement system
  - Add statistics dashboard
- [ ] 3.3 Implement difficulty progression
  - Progressive difficulty per mode
  - Adaptive difficulty based on performance
  - Mode-specific difficulty curves
  - Difficulty bounds per mode

## 4. Testing
- [ ] 4.1 Write unit tests for all modes
  - Test round generation per mode
  - Test answer validation per mode
  - Test score calculation per mode
  - Test difficulty progression per mode
- [ ] 4.2 Write component tests
  - Test mode selection
  - Test mode switching
  - Test UI rendering per mode
  - Test user interactions
- [ ] 4.3 Write integration tests
  - Test complete gameplay flow
  - Test mode transitions
  - Test progress persistence
  - Test audio synthesis
- [ ] 4.4 Accessibility testing
  - Test keyboard navigation
  - Test screen reader compatibility
  - Test focus management
  - Run axe-core audit

## 5. Integration
- [ ] 5.1 Register consolidated game in config
  - Add GameConfig entry
  - Set route, status, icon, color
  - Add difficulty and age range
  - Mark as consolidated game
- [ ] 5.2 Add game route
  - Import game page component
  - Add Route with path
  - Ensure lazy loading
- [ ] 5.3 Update landing page
  - Verify game appears in grid
  - Test navigation
  - Verify game card display
- [ ] 5.4 Test navigation
  - Test direct URL access
  - Test from landing page
  - Test back button
  - Test browser history

## 6. Performance Optimization
- [ ] 6.1 Optimize rendering
  - Use React.memo for expensive components
  - Implement useCallback for handlers
  - Use useMemo for computed values
  - Minimize re-renders
- [ ] 6.2 Optimize audio
  - Reuse audio context across modes
  - Implement audio node pooling
  - Minimize audio latency
  - Test on low-end devices
- [ ] 6.3 Optimize bundle size
  - Ensure lazy loading works
  - Minimize dependencies
  - Use tree shaking
  - Target <40KB gzipped

## 7. Documentation
- [ ] 7.1 Document game architecture
  - Document multi-mode design
  - Document mode definitions
  - Document state management
  - Add architecture diagrams
- [ ] 7.2 Document each mode
  - Document mode mechanics
  - Document scoring rules
  - Document difficulty progression
  - Add JSDoc comments
- [ ] 7.3 Update README
  - Add consolidated game to list
  - Document mode count
  - Document age range and difficulty
  - Update game count

## 8. Quality Assurance
- [ ] 8.1 Cross-browser testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test on mobile browsers
  - Verify audio works on all browsers
  - Test touch interactions
- [ ] 8.2 Performance testing
  - Verify 60 FPS during gameplay
  - Test audio latency (<100ms)
  - Test on low-end devices
  - Profile with React DevTools
- [ ] 8.3 User testing
  - Test with target age group ({age})
  - Gather feedback on all modes
  - Test mode switching UX
  - Verify engagement across modes
"""
    
    # Write files
    with open(f"{base_path}/proposal.md", "w") as f:
        f.write(proposal)
    
    with open(f"{base_path}/tasks.md", "w") as f:
        f.write(tasks)
    
    # Generate spec (will be added in next part due to length)
    return change_id

def main():
    """Generate all consolidated proposals"""
    
    # Load consolidated games
    with open("games_consolidated_round2.json", "r") as f:
        data = json.load(f)
    
    games = data["games"]
    created = 0
    
    print(f"Generating OpenSpec proposals for {len(games)} consolidated games...")
    print("=" * 70)
    
    for i, game in enumerate(games, 1):
        try:
            change_id = create_proposal(game)
            created += 1
            print(f"✅ Created {i}/{len(games)}: {change_id}")
        except Exception as e:
            print(f"❌ Failed to create {game['id']}: {e}")
    
    print("=" * 70)
    print(f"\n✅ Successfully created: {created} proposals")
    print(f"\nNext steps:")
    print("1. Generate spec.md files for each proposal")
    print("2. Run: openspec validate <change-id> --strict")
    print("3. Review proposals in: openspec/changes/")

if __name__ == "__main__":
    main()

