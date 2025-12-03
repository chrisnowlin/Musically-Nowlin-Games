## Why

Students learning note reading often make mistakes without understanding what the correct answer should have been. By temporarily displaying the correct answer when guessing incorrectly, students receive immediate educational feedback that reinforces learning and helps them build associations between note positions and note names. This feature is commonly found in educational software and aligns with the project's goal of providing immediate audio-visual feedback for learning reinforcement.

## What Changes

- Add a new "Show Correct Answer" toggle setting in the Staff Wars setup screen
- When enabled and a wrong answer is given, briefly display the correct note name on or near the note before dismissing it
- Persist the setting preference in localStorage alongside other settings
- Visual display should be clear, non-disruptive, and brief (1-1.5 seconds)

## Impact

- Affected specs: `game-staff-wars`
- Affected code:
  - `client/src/components/staff-wars/SetupScreen.tsx` - New toggle option
  - `client/src/components/staff-wars/GameplayScreen.tsx` - Correct answer display logic
  - `client/src/components/staff-wars/StaffCanvas.tsx` - Visual rendering of correct answer
  - `client/src/components/StaffWarsGame.tsx` - State management for new setting
