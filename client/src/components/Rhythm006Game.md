# Rhythm006Game - Beat & Pulse Trainer

## Overview

The Beat & Pulse Trainer is a comprehensive rhythm training game designed to help users develop their sense of timing, tempo, and rhythmic precision. The game features five distinct modes that progressively challenge different aspects of rhythmic ability.

## Architecture

### Component Structure

```
Rhythm006Game/
├── Rhythm006Game.tsx          # Main game component
├── Rhythm006Page.tsx          # Page wrapper with lazy loading
├── rhythm-006Modes.ts         # Mode definitions and constants
├── rhythm-006Logic.ts         # Core game logic utilities
└── Tests/
    ├── rhythm-006.test.tsx            # Unit tests
    ├── rhythm-006.integration.test.ts # Integration tests
    ├── rhythm-006.a11y.test.tsx       # Accessibility tests
    └── rhythm-006.component.test.tsx  # Component tests
```

### State Management

The game uses a centralized state object with the following structure:

```typescript
interface GameState {
  currentMode: string;     // Active training mode
  score: number;          // Current score
  round: number;          // Current round number
  bpm: number;           // Beats per minute (40-200)
  isPlaying: boolean;     // Metronome state
  taps: number[];        // Timestamp array for tap analysis
  startMs: number | null; // Session start time
  subdiv: number;        // Subdivision for subdivision practice
  avgErrorMs: number | null;   // Average timing error
  ioiStdMs: number | null;     // Tempo stability metric
}
```

### Audio System

The game uses the Web Audio API for high-precision audio timing:

- **Audio Context**: Reused across the entire session
- **Metronome**: Optimized sine wave oscillator with efficient gain envelope
- **Timing**: Uses `requestAnimationFrame` for precise audio synchronization
- **Performance**: Nodes are created and destroyed efficiently to prevent memory leaks

## Game Modes

### 1. Steady Beat Keeper
**Purpose**: Develop basic sense of steady tempo
- Adjustable BPM (40-200)
- Visual and audio metronome feedback
- Start/stop controls

### 2. Beat Tapping
**Purpose**: Improve timing precision with metronome
- Tap in time with metronome
- Real-time timing error feedback
- 100ms accuracy window for scoring
- Average error calculation over last 8 taps

### 3. Internal Pulse
**Purpose**: Develop internal sense of tempo
- Listen to 2 bars of metronome (8 beats)
- Continue tapping after metronome stops
- 120ms accuracy window (more forgiving)
- Tests internal tempo maintenance

### 4. Subdivision Practice
**Purpose**: Master rhythmic subdivisions
- Choose subdivision level (1x-4x)
- Tap evenly on each sub-beat
- 80ms accuracy window
- Develops fine rhythmic control

### 5. Tempo Stability
**Purpose**: Improve consistency without external reference
- Tap steadily without metronome
- Calculates Inter-Onset Interval (IOI) standard deviation
- Scores based on consistency (≤40ms std dev)
- Tests internal tempo stability

## Performance Optimizations

### Rendering
- **useCallback**: All event handlers are memoized
- **useMemo**: Expensive calculations are cached
- **Minimal re-renders**: State updates are batched

### Audio
- **Node reuse**: Audio context is maintained across session
- **Efficient envelopes**: Optimized gain ramps
- **Precise timing**: `requestAnimationFrame` for sync
- **Memory management**: Proper cleanup on component unmount

### Bundle Size
- **Lazy loading**: Game component loaded on demand
- **Code splitting**: Separate bundle chunks
- **Suspense**: Loading states for better UX

## Scoring System

Each mode has specific scoring criteria:

- **Beat Tapping**: 1 point per tap within 100ms window
- **Internal Pulse**: 1 point per tap within 120ms window
- **Subdivisions**: 1 point per tap within 80ms window
- **Tempo Stability**: 1 point when IOI std dev ≤ 40ms

## Accessibility Features

- **Age-appropriate**: Designed for ages 6-12
- **Visual feedback**: Clear visual indicators alongside audio
- **Motor accessibility**: Large tap targets, simple controls
- **Cognitive load**: Progressive difficulty, clear instructions
- **Screen reader**: Semantic HTML structure

## Testing Coverage

- **Unit Tests**: 10 tests covering core logic functions
- **Integration Tests**: 9 tests covering full game flows
- **Accessibility Tests**: 10 tests covering WCAG compliance
- **Component Tests**: Rendering and interaction tests

Total: 29 passing tests

## Browser Compatibility

- **Modern browsers**: Full support with Web Audio API
- **Mobile**: Touch-optimized controls
- **Autoplay policy**: Proper context handling
- **Performance**: Optimized for 60fps on mobile devices

## Future Enhancements

- Visual waveform display
- More sophisticated timing analysis
- Adaptive difficulty based on performance
- Multiplayer rhythm challenges
- Custom rhythm patterns