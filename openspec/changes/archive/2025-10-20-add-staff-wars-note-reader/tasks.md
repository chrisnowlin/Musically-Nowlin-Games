## 1. Dependencies and Scaffolding
- [ ] 1.1 Add vexflow dependency to package.json (no audio dependencies needed)
- [ ] 1.2 Create client/src/pages/games/StaffWarsGamePage.tsx page component
- [ ] 1.3 Create client/src/components/StaffWarsGame.tsx main game component
- [ ] 1.4 Create client/src/lib/notation/ directory for VexFlow utilities
- [ ] 1.5 Register Staff Wars game in client/src/config/games.ts with metadata and route

## 2. VexFlow Integration and Notation Rendering
- [ ] 2.1 Create notation service utility for VexFlow initialization and Canvas setup
- [ ] 2.2 Implement staff rendering function with configurable clef (treble, bass, alto)
- [ ] 2.3 Implement single note rendering at specified vertical position on staff
- [ ] 2.4 Test notation rendering with different clefs and note positions
- [ ] 2.5 Create utility for note name to staff position conversion (accounting for ledger lines)

## 3. Setup Screen and Configuration
- [ ] 3.1 Create setup screen UI with clef selector (treble, bass, alto)
- [ ] 3.2 Add range picker with beginner/intermediate/advanced presets
- [ ] 3.3 Implement custom range input with validation
- [ ] 3.4 Add Start button with default selections preloaded
- [ ] 3.5 Persist last-used configuration in localStorage

## 4. Core Game Engine - Note Generation and Movement
- [ ] 4.1 Implement note generation logic within selected clef and range
- [ ] 4.2 Add anti-repeat logic to avoid spawning same note consecutively
- [ ] 4.3 Create game loop with requestAnimationFrame and delta time tracking
- [ ] 4.4 Implement note movement from right to left at configurable speed
- [ ] 4.5 Add collision detection for note reaching clef position (timeout)

## 5. Input Handling and Answer Checking
- [ ] 5.1 Create note-name button UI (C, D, E, F, G, A, B) with 44×44px minimum touch targets
- [ ] 5.2 Implement answer checking logic comparing button press to current note
- [ ] 5.3 Add visual feedback for correct answers (note disappears with animation)
- [ ] 5.4 Add visual feedback for incorrect answers (flash/shake animation)
- [ ] 5.5 Implement keyboard input support for desktop (C-B keys map to note names)

## 6. Scoring and Lives System
- [ ] 6.1 Initialize game state with score=0 and lives=3
- [ ] 6.2 Increment score on correct answer
- [ ] 6.3 Decrement lives on incorrect answer or timeout
- [ ] 6.4 Trigger game over when lives reach 0
- [ ] 6.5 Display score and lives in HUD at all times

## 7. Difficulty Progression
- [ ] 7.1 Define default speed curve configuration (JSON mapping milestones to px/second)
- [ ] 7.2 Implement speed escalation logic based on correct answer count
- [ ] 7.3 Add level indicator to HUD showing current difficulty
- [ ] 7.4 Test speed progression across multiple levels

## 8. HUD and UI Components
- [ ] 8.1 Create HUD component displaying score, lives, and level
- [ ] 8.2 Add Pause button to HUD with 44×44px minimum size
- [ ] 8.3 Ensure HUD updates in real-time as game state changes
- [ ] 8.4 Style HUD for high contrast and readability
- [ ] 8.5 Make HUD responsive for mobile and tablet viewports

## 9. Pause/Resume Functionality
- [ ] 9.1 Implement pause logic (stop game loop, disable input)
- [ ] 9.2 Create Pause overlay with Resume and Quit to Setup buttons
- [ ] 9.3 Implement resume logic (restart game loop from paused state)
- [ ] 9.4 Test state preservation during pause (score, lives, note position)
- [ ] 9.5 Handle orientation changes by auto-pausing and preserving state

## 10. Game Over and Restart
- [ ] 10.1 Create Game Over overlay displaying final score
- [ ] 10.2 Add Restart button returning to setup screen
- [ ] 10.3 Add View High Scores option on Game Over screen
- [ ] 10.4 Reset all game state on restart (score, lives, level, speed)
- [ ] 10.5 Test game over flow from lives=0 through restart

## 11. High Score Persistence
- [ ] 11.1 Implement localStorage read/write for high score list
- [ ] 11.2 Add new score to list and sort descending on game over
- [ ] 11.3 Display top 5 high scores on setup screen or game over screen
- [ ] 11.4 Test high score persistence across browser sessions

## 12. Audio Integration with Existing audioService
- [ ] 12.1 Import audioService from client/src/lib/audioService.ts
- [ ] 12.2 Call audioService.playSuccessTone() on correct answer
- [ ] 12.3 Call audioService.playErrorTone() on incorrect answer or timeout
- [ ] 12.4 Add SFX toggle control using audioService.setVolume(0) for mute
- [ ] 12.5 Persist SFX enabled/disabled state in localStorage
- [ ] 12.6 Ensure game is fully playable with SFX muted (no audio dependency - already supported)

## 13. Accessibility Features
- [ ] 13.1 Verify all touch targets meet 44×44px minimum size
- [ ] 13.2 Implement high-contrast theme meeting WCAG 2.1 AA standards
- [ ] 13.3 Add ARIA labels to all interactive elements
- [ ] 13.4 Test keyboard navigation for desktop users
- [ ] 13.5 Ensure color is not the only means of conveying information

## 14. Performance Optimization
- [ ] 14.1 Profile game loop to ensure 60 FPS at normal speeds
- [ ] 14.2 Optimize VexFlow render calls (minimize redraw regions)
- [ ] 14.3 Test performance on low-end tablet (iPad 6th gen or equivalent Android)
- [ ] 14.4 Ensure input latency is under 100ms
- [ ] 14.5 Implement frame pacing consistency across variable frame rates

## 15. Testing
- [ ] 15.1 Write unit tests for note generation logic (range validation, anti-repeat)
- [ ] 15.2 Write unit tests for answer checking (correct/incorrect scenarios)
- [ ] 15.3 Write unit tests for scoring and lives deduction
- [ ] 15.4 Write unit tests for difficulty progression (speed curve)
- [ ] 15.5 Write unit tests for high score persistence
- [ ] 15.6 Manual QA: test full gameplay loop on mobile and tablet
- [ ] 15.7 Manual QA: test accessibility features (touch targets, keyboard, muted mode)
- [ ] 15.8 Manual QA: test orientation change handling

## 16. Documentation
- [ ] 16.1 Add "How to Play" instructions to setup screen or help dialog
- [ ] 16.2 Document clef and range options for educators
- [ ] 16.3 Update project README with Staff Wars game description
- [ ] 16.4 Add classroom usage tips (projector mode, station rotation)

## 17. Validation
- [ ] 17.1 Run npm run check (TypeScript type checking)
- [ ] 17.2 Run npm test (all unit tests passing)
- [ ] 17.3 Verify no console errors or warnings during gameplay
- [ ] 17.4 Confirm WCAG 2.1 AA accessibility compliance
- [ ] 17.5 Validate performance benchmarks (60 FPS target, < 100ms input latency)
