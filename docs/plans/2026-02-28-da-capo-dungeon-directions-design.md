# Melody Dungeon Directions Modal Design

**Date:** 2026-02-28  
**Feature:** Game directions button and modal for comprehensive gameplay help

## Overview

Add a "How to Play" button to the Melody Dungeon main menu that opens a comprehensive, scrollable modal explaining core mechanics, controls, items, buffs, enemy types, and strategy tips.

## User Goals

- New players can quickly learn how to interact with the dungeon game
- Information is organized logically and easy to scan
- Works smoothly on both desktop and mobile devices

## Design Approach

### Button Placement
- Location: Below the "Enter the Dungeon" button in the menu
- Styling: Uses HelpCircle icon from lucide-react
- Text: "How to Play"
- Color: Info blue or complementary purple to match existing UI theme

### Modal Structure

**Container:**
- Centered modal overlay with dark background (matching dungeon theme)
- Scrollable content area with reasonable max-height
- Close button (X) in top-right corner
- Optional bottom "Got it!" / "Close" button for mobile UX

**Content Sections (in order):**

1. **Controls** (intro)
   - Keyboard: Arrow keys or WASD to move
   - Mobile: D-pad on right side
   - Special keys: P for potion, U for inventory

2. **Core Mechanics**
   - Explore the dungeon floor by moving
   - Encounter different tile types: enemies, doors, chests, merchants, stairs
   - Defeat enemies with musical challenges to progress
   - Unlock doors with keys and gain rewards
   - Find merchants to buy helpful items
   - Reach stairs to advance to next floor

3. **Items & Inventory**
   - Keys: Used to open locked chests for potions and rewards
   - Potions: Restore 1 HP (use with P key or bag menu)
   - Persistent items: Held between challenges, used in inventory
   - How to access inventory: Press U key or click bag icon in HUD

4. **Persistent Buffs** (items you carry and activate)
   - Shield Charm: Absorbs 1 hit instead of losing health
   - Torch: Increases visibility radius
   - Map Scroll: Reveals entire floor
   - Compass: Shows stairs location on minimap
   - Streak Saver: Preserves win streak on wrong answer
   - Second Chance: Retry a challenge without penalty
   - Dragon Bane: Negate dragon catch penalty
   - Lucky Coin: Double score on enemy defeats
   - Treasure Magnet: Double potion rewards
   - Metronome: Slower tempo in musical challenges
   - Tuning Fork: Shows interval hints in challenges

5. **Armed Buffs** (activated buffs, consumed on use)
   - Armed buffs are like persistent buffs but auto-trigger during challenges
   - Consuming them: They activate automatically and are consumed after the challenge

6. **Enemy Types**
   - Regular Enemies (Ghost, Skeleton, Goblin): Levels 1-3, defeat for keys and score
   - Dragons: Special mechanics—may bypass some defenses, high rewards
   - Mini-Boss: Stronger enemy, grants more rewards on victory
   - Big-Boss: Floor boss, must defeat to access stairs

7. **Tips & Strategy**
   - Manage health carefully—use shields and potions strategically
   - Save keys for valuable chests
   - Buffs are valuable—use them on tough encounters
   - Streak bonuses reward consecutive correct answers
   - Some buffs work better on specific enemy types

## Implementation Details

### File Structure
- Create new component: `client/src/components/melody-dungeon/DirectionsModal.tsx`
- Update `MelodyDungeonGame.tsx` to:
  - Add state for modal visibility
  - Render "How to Play" button in menu phase
  - Render `DirectionsModal` when open

### Component Props
- `isOpen: boolean` — Controls modal visibility
- `onClose: () => void` — Callback to close modal

### Styling
- Use existing modal styling from `ChallengeModal` and `MerchantModal` as reference
- Dark theme (gray-900) with light text
- Scrollable container for content
- Responsive: Works on mobile and desktop
- Proper spacing and typography hierarchy

### Content Strategy
- Use short, clear paragraphs (2-3 sentences max per section)
- Include emoji for visual interest and recognition
- Use lists for clarity where appropriate
- Avoid jargon; explain game-specific terms on first mention

## Success Criteria

✓ Button visible and accessible on main menu  
✓ Modal opens/closes smoothly  
✓ Content is readable on all screen sizes  
✓ All gameplay mechanics explained clearly  
✓ New players can understand how to play from this modal  
✓ Matches existing visual theme and component styling  

## Future Enhancements (out of scope)

- Interactive tooltips in actual gameplay
- Video tutorials
- Progressive disclosure for advanced strategies
- Multilingual support
