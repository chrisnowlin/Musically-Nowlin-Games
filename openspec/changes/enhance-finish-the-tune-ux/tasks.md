# Tasks: Enhance Finish the Tune UX

## Phase 1: Foundation Refactoring

- [x] Create `client/src/components/finish-the-tune/` directory structure
- [x] Create `types.ts` with shared TypeScript interfaces (Question, NoteEvent, GameState, etc.)
- [x] Extract `MelodyVisualizer` component from lines 110-151 to `MelodyVisualizer.tsx`
- [x] Extract `StartScreen` component from lines 314-374 to `StartScreen.tsx`
- [x] Extract `OptionsCard` component from lines 488-554 to `OptionsCard.tsx`
- [x] Create `finish-the-tune-Logic.ts` with MELODY_PATTERNS, NOTES, and helper functions
- [x] Create `useFinishTheTuneGame.ts` hook with useReducer pattern
- [x] Create `useFinishTheTunePersistence.ts` hook for localStorage
- [x] Create main `FinishTheTuneGame.tsx` orchestrator importing extracted components
- [x] Create `index.ts` re-exporting main component
- [x] Update `FinishTheTuneGamePage.tsx` to import from new location
- [x] Verify all existing functionality works with manual testing

## Phase 2: Learning Features

- [x] Add `showNoteNames` prop to `MelodyVisualizer` with note label rendering
- [x] Create note-to-name mapping utility in `finish-the-tune-Logic.ts`
- [x] Add correct answer highlighting in `OptionsCard` with green glow animation
- [x] Implement auto-play correct ending after wrong answer (1s delay, 4s total feedback)
- [x] Add `playbackSpeed` state to game reducer (0.5 = slow, 1.0 = normal)
- [x] Create `SettingsPanel.tsx` with slow mode toggle
- [x] Implement duration multiplication in `playMelody` based on speed setting
- [x] Add `difficulty` state with 'easy' | 'medium' | 'hard' options
- [x] Add difficulty selector to `StartScreen.tsx`
- [x] Modify `generateWrongEndings` to accept count parameter based on difficulty
- [x] Add `autoPlay` setting to state and settings panel
- [x] Implement auto-play useEffect triggering 500ms after new question
- [x] Add `wrongQuestionQueue` to state for retry feature
- [x] Implement queue management: push on wrong, pop after 2-3 correct

## Phase 3: Gamification Features

- [x] Add `streak` and `bestStreak` to game state
- [x] Create `StreakCounter.tsx` component with fire/sparkle effects
- [x] Add streak increment on correct, reset on wrong
- [x] Create `ConfettiOverlay.tsx` with DOM-based particle system
- [x] Import existing note particle SVGs from `/assets/aoc/overlays/`
- [x] Trigger confetti on correct answer with 12 particles max
- [x] Add melody name display to feedback state
- [x] Show melody pattern name (e.g., "Walking Home") in feedback UI
- [x] Add `completedMelodies: Set<string>` to game state
- [x] Create `ProgressTracker.tsx` using `@/components/ui/progress`
- [x] Track unique melody discoveries and persist to localStorage
- [x] Create `finish-the-tune-Achievements.ts` with achievement definitions
- [x] Create `AchievementBadge.tsx` component with unlock animation
- [x] Implement achievement unlock logic in game reducer
- [x] Add toast notification for achievement unlocks
- [x] Add `highScore` to persisted state
- [x] Display high score in header and start screen
- [x] Add `timedMode` and `timeRemaining` to state
- [x] Create `TimerDisplay.tsx` with 60-second countdown
- [x] Implement timer tick effect with red color under 10 seconds
- [x] Handle timer expiration with game end and score display

## Phase 4: Accessibility Features

- [x] Create `useKeyboardShortcuts.ts` hook
- [x] Implement 1-4 number key selection for options
- [x] Implement arrow key navigation with focus management
- [x] Implement Space key for play/replay melody
- [x] Implement Enter key for confirming focused option
- [x] Implement Escape key for exit to menu
- [x] Add `focusedOptionIndex` state for keyboard navigation
- [x] Add visible focus ring styling to `OptionsCard`
- [x] Audit and increase touch targets to minimum 44x44px
- [x] Add responsive padding: `px-4 md:px-6 py-4 md:py-3`
- [x] Add `aria-live="polite"` region for score/feedback announcements
- [x] Add `aria-label` to all interactive buttons
- [x] Add screen-reader-only keyboard instruction text

## Phase 5: Advanced Features

- [x] Create `PianoKeyboard.tsx` component with C-to-C octave
- [x] Implement note highlighting during playback on piano
- [x] Add tonic (C) indicator on piano keyboard
- [x] Define pitch-to-color mapping (C=red through C2=violet)
- [x] Apply color gradient to note circles in `MelodyVisualizer`
- [x] Apply color gradient to piano keys
- [x] Add compare functionality: select two options to play back-to-back
- [x] Implement 500ms pause between compared endings
- [x] Add `loopMelody` setting to state
- [x] Implement auto-repeat with 1-second pause between loops
- [x] Pause looping when user interacts with options
- [x] Add fullscreen toggle button using Fullscreen API
- [x] Handle Escape key and minimize button for exit

## Phase 6: Testing & Polish

- [x] Add unit tests for game reducer actions
- [x] Add unit tests for achievement unlock logic
- [x] Add unit tests for difficulty option generation
- [ ] Test keyboard navigation with screen reader
- [ ] Test on iOS Safari and Android Chrome
- [ ] Performance test particle effects on older devices
- [x] Verify localStorage persistence across sessions
- [ ] Manual QA of all 20 features

## Validation Checkpoints

After each phase, verify:
1. Existing functionality still works
2. New features match spec requirements
3. No console errors or warnings
4. Mobile responsiveness maintained
5. Accessibility features functional
