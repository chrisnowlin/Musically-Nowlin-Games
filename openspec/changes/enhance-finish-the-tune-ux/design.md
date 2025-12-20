# Design: Enhance Finish the Tune UX

## Overview
This document describes the architectural decisions for enhancing the Finish the Tune game with 20 new features across learning, gamification, accessibility, and advanced modes.

## Architecture

### Component Structure
The current monolithic 630-line component will be refactored into a modular structure following the pattern established by `staff-invaders/`:

```
client/src/components/finish-the-tune/
  index.ts                    # Re-export main component
  FinishTheTuneGame.tsx       # Main orchestrator
  StartScreen.tsx             # Landing/instructions with difficulty selection
  GameplayScreen.tsx          # Main game area
  OptionsCard.tsx             # Individual answer option
  MelodyVisualizer.tsx        # Note visualization (existing, extracted)
  PianoKeyboard.tsx           # Visual piano feedback
  ConfettiOverlay.tsx         # Celebration particle effects
  StreakCounter.tsx           # Combo display with fire/sparkle
  ProgressTracker.tsx         # Melody discovery progress bar
  SettingsPanel.tsx           # Speed, autoplay, fullscreen settings
  AchievementBadge.tsx        # Badge display with unlock animation
  TimerDisplay.tsx            # Countdown for timed mode
  types.ts                    # Shared TypeScript interfaces

client/src/hooks/
  useFinishTheTuneGame.ts       # Main game state (useReducer)
  useFinishTheTunePersistence.ts # localStorage persistence
  useKeyboardShortcuts.ts       # Keyboard navigation

client/src/lib/gameLogic/
  finish-the-tune-Logic.ts       # Melody patterns, note helpers
  finish-the-tune-Modes.ts       # Difficulty configurations
  finish-the-tune-Achievements.ts # Achievement definitions
```

### State Management

Following the `Challenge001Game.tsx` pattern, use `useReducer` for complex state:

```typescript
interface FinishTheTuneState {
  // Core game
  currentQuestion: Question | null;
  shuffledOptions: NoteEvent[][];
  score: number;
  totalQuestions: number;

  // Playback
  isPlaying: boolean;
  hasPlayedMelody: boolean;
  activeNoteIndex: number;
  playingSequenceId: string | null;
  selectedOptionIndex: number | null;
  feedback: FeedbackState | null;

  // Gamification
  streak: number;
  bestStreak: number;
  completedMelodies: Set<string>;
  wrongQuestionQueue: Question[];
  achievements: string[];
  highScore: number;

  // Settings
  difficulty: 'easy' | 'medium' | 'hard';
  playbackSpeed: number;  // 0.5 = slow, 1.0 = normal
  autoPlay: boolean;
  volume: number;
  loopMelody: boolean;

  // Timed mode
  timedMode: boolean;
  timeRemaining: number;
}

type GameAction =
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<FinishTheTuneState> }
  | { type: 'NEW_QUESTION'; payload: Question }
  | { type: 'SELECT_ANSWER'; payload: { index: number; isCorrect: boolean } }
  | { type: 'PLAY_MELODY'; payload: { sequenceId: string } }
  | { type: 'UPDATE_ACTIVE_NOTE'; payload: number }
  | { type: 'STOP_PLAYING' }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_DIFFICULTY'; payload: 'easy' | 'medium' | 'hard' }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'TOGGLE_TIMED_MODE' }
  | { type: 'TICK_TIMER' }
  | { type: 'RESET_GAME' };
```

### Persistence Strategy

Using localStorage with a namespaced key following `Challenge001Game.tsx`:

```typescript
const STORAGE_KEY = 'finish-the-tune-progress';

interface PersistedState {
  highScore: number;
  bestStreak: number;
  achievements: string[];
  completedMelodies: string[];  // Serialized from Set
  perfectGames: number;
  settings: {
    difficulty: 'easy' | 'medium' | 'hard';
    playbackSpeed: number;
    autoPlay: boolean;
    volume: number;
  };
}
```

### Particle System Design

Use DOM-based particles with CSS animations (simpler than canvas, sufficient for celebration effects):

```typescript
interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  imageSrc: string;  // Note SVG from /assets/aoc/overlays/
}
```

Particles use existing `animate-float-up` CSS animation with randomized positions and delays.

### Keyboard Navigation

Following `Challenge001Game.tsx` lines 294-341:

| Key | Action |
|-----|--------|
| 1-4 | Select option directly |
| Arrow Up/Left | Navigate to previous option |
| Arrow Down/Right | Navigate to next option |
| Space | Play/replay melody |
| Enter | Confirm focused option |
| Escape | Exit to menu |

### Difficulty Levels

| Level | Options | Wrong Endings Generated |
|-------|---------|------------------------|
| Easy | 2 | 1 |
| Medium | 3 | 2 |
| Hard | 4 | 3 |

### Achievement Definitions

| ID | Name | Condition |
|----|------|-----------|
| `first_correct` | First Note | Answer first question correctly |
| `streak_5` | Hot Streak | 5 correct in a row |
| `streak_10` | On Fire | 10 correct in a row |
| `perfect_10` | Perfect Ten | 10/10 accuracy in a session |
| `all_melodies` | Melody Master | Discover all 8 melody patterns |
| `speed_demon` | Speed Demon | Answer within 3 seconds of melody end |

## Key Decisions

### Decision 1: DOM Particles vs Canvas
**Choice**: DOM-based particles with CSS animations
**Rationale**:
- Simpler implementation
- Existing CSS animations available (`animate-float-up`)
- Existing SVG note assets in `/assets/aoc/overlays/`
- Canvas particle system in `StaffCanvas.tsx` is complex and game-specific
- Adequate performance for 12-particle celebrations

### Decision 2: useReducer vs useState
**Choice**: useReducer for main game state
**Rationale**:
- Complex state with many interdependencies
- Clear action types for state transitions
- Easier testing with pure reducer functions
- Consistent with `Challenge001Game.tsx` pattern

### Decision 3: Modular Architecture
**Choice**: Extract to ~15 components in `finish-the-tune/` folder
**Rationale**:
- Current 630 lines will grow to 1000+ with new features
- Follows successful `staff-invaders/` pattern
- Enables parallel work on different features
- Improves testability and maintainability

### Decision 4: Framer Motion for Complex Animations
**Choice**: Framer Motion for component transitions, CSS for particles
**Rationale**:
- Already installed (v11.13.1)
- Used successfully in `Timbre001Game.tsx`
- Declarative API for enter/exit animations
- CSS animations better for performance-critical particles

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FinishTheTuneGame                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ useFinishTheTuneGame (useReducer)                   │   │
│  │   state, dispatch                                    │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │ useFinishTheTunePersistence                         │   │
│  │   Load on mount, save on change                     │   │
│  │   localStorage: 'finish-the-tune-progress'          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌───────────┐      ┌──────────────┐      ┌───────────┐
   │StartScreen│      │GameplayScreen│      │ Settings  │
   │           │      │              │      │  Panel    │
   │ Difficulty│      │ OptionsCards │      │           │
   │ Selection │      │ Visualizer   │      │ Speed     │
   └───────────┘      │ Piano        │      │ AutoPlay  │
                      │ Confetti     │      │ Fullscreen│
                      └──────────────┘      └───────────┘
```

## Performance Considerations

1. **Particle limit**: Max 12 particles per celebration to prevent lag
2. **CSS transforms**: Use `transform` for particle movement (GPU accelerated)
3. **Memo components**: Memoize OptionsCard to prevent re-renders during playback
4. **Cleanup timeouts**: Use `useGameCleanup` hook for all setTimeout calls
5. **Debounce settings**: Debounce localStorage writes for volume/speed changes

## Accessibility Compliance

Following `Challenge001Game.tsx` accessibility patterns:

1. **ARIA live regions**: Announce score changes and feedback
2. **Screen reader instructions**: Hidden `.sr-only` text for keyboard shortcuts
3. **Focus management**: Arrow key navigation with visible focus ring
4. **Touch targets**: Minimum 44x44px for all interactive elements
5. **Color independence**: Never use color alone to convey information
