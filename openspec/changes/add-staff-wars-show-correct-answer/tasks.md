## 1. State Management

- [x] 1.1 Add `showCorrectAnswer` boolean to GameState interface in StaffWarsGame.tsx
- [x] 1.2 Add TOGGLE_SHOW_CORRECT_ANSWER action type to GameAction union
- [x] 1.3 Implement reducer case for toggling the setting
- [x] 1.4 Load showCorrectAnswer preference from localStorage on mount
- [x] 1.5 Persist showCorrectAnswer preference to localStorage when changed

## 2. Setup Screen UI

- [x] 2.1 Add "Show Correct Answer" toggle switch to SetupScreen.tsx
- [x] 2.2 Position toggle in Options section below difficulty selection
- [x] 2.3 Add descriptive label explaining the educational benefit
- [x] 2.4 Wire toggle to parent state via new prop/callback

## 3. Gameplay Feedback Display

- [x] 3.1 Pass showCorrectAnswer setting to GameplayScreen component
- [x] 3.2 Modify handleNoteAnswer to track the correct answer when wrong
- [x] 3.3 Add state for displaying the correct answer overlay
- [x] 3.4 Implement 1.5 second delay before dismissing incorrect answer

## 4. Visual Implementation

- [x] 4.1 Create visual indicator showing correct note name near the note position
- [x] 4.2 Style with contrasting color (e.g., green/cyan) for visibility
- [x] 4.3 Add subtle animation (fade-in, pulse, or glow effect)
- [x] 4.4 Ensure indicator is positioned clearly without obscuring gameplay

## 5. Testing

- [x] 5.1 Verify setting persists across page reloads
- [x] 5.2 Test correct answer display appears only when setting is enabled
- [x] 5.3 Test timing of display (visible for appropriate duration)
- [x] 5.4 Test accessibility of the feedback display (color contrast, readability)
- [x] 5.5 Test that game continues normally after feedback display
