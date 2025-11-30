# Custom Hooks Documentation

This directory contains custom React hooks for common game patterns in the Musically Nowlin Games project.

---

## 🎵 useAudioService

**File:** `useAudioService.ts`

Provides access to the singleton AudioService with automatic initialization and error handling.

### Usage

```tsx
import { useAudioService } from '@/hooks/useAudioService';

function MyGame() {
  const { audio, isReady, error, initialize } = useAudioService();
  
  const handleStartGame = async () => {
    if (!isReady) {
      await initialize();
    }
    // Audio is now ready to use
  };
  
  const handlePlayNote = async () => {
    try {
      await audio.playNote(440, 1.0); // A4 for 1 second
    } catch (err) {
      console.error('Failed to play note:', err);
    }
  };
  
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }
  
  return (
    <div>
      <button onClick={handleStartGame}>Start Game</button>
      <button onClick={handlePlayNote} disabled={!isReady}>Play Note</button>
    </div>
  );
}
```

### API

- **`audio`**: The singleton AudioService instance
- **`isReady`**: Boolean indicating if audio is initialized and ready
- **`error`**: Any initialization error that occurred (or null)
- **`initialize()`**: Function to initialize/reinitialize audio (must be called from user interaction)

### Methods on `audio` object

- `playNote(frequency, duration)` - Play a single note
- `playSequence(freq1, freq2, duration, gap)` - Play two notes sequentially
- `playPhrase(frequencies, durations, dynamics, gap)` - Play a sequence of notes
- `playNoteWithDynamics(frequency, duration, volumeScale)` - Play note with custom volume
- `playSuccessTone()` - Play success feedback sound
- `playErrorTone()` - Play error feedback sound
- `setVolume(volume)` - Set master volume (0.0-1.0)
- `getVolume()` - Get current master volume

---

## 🎉 useAudioFeedback

**File:** `useAudioService.ts`

Simplified hook for playing success/error feedback sounds.

### Usage

```tsx
import { useAudioFeedback } from '@/hooks/useAudioService';

function MyGame() {
  const { playSuccess, playError } = useAudioFeedback();
  
  const handleCorrectAnswer = () => {
    playSuccess(); // Plays ascending beeps
    // ... update score
  };
  
  const handleWrongAnswer = () => {
    playError(); // Plays descending beeps
    // ... show feedback
  };
  
  return (
    <div>
      <button onClick={handleCorrectAnswer}>Correct</button>
      <button onClick={handleWrongAnswer}>Wrong</button>
    </div>
  );
}
```

### API

- **`playSuccess()`**: Play success tone (two ascending beeps)
- **`playError()`**: Play error tone (two descending beeps)

**Note:** These functions fail silently if audio is unavailable (non-critical feedback).

---

## 🧹 useGameCleanup

**File:** `useGameCleanup.ts`

Manages automatic cleanup of timeouts and intervals to prevent memory leaks.

### Usage

```tsx
import { useGameCleanup } from '@/hooks/useGameCleanup';

function MyGame() {
  const { setTimeout, setInterval, clearAll } = useGameCleanup();
  
  const handlePlaySequence = () => {
    // These will auto-cleanup on unmount
    setTimeout(() => {
      console.log('Note 1');
    }, 1000);
    
    setTimeout(() => {
      console.log('Note 2');
    }, 2000);
  };
  
  const handleStartMetronome = () => {
    setInterval(() => {
      console.log('Tick');
    }, 500);
  };
  
  const handleStop = () => {
    clearAll(); // Manually clear all timeouts/intervals
  };
  
  return (
    <div>
      <button onClick={handlePlaySequence}>Play Sequence</button>
      <button onClick={handleStartMetronome}>Start Metronome</button>
      <button onClick={handleStop}>Stop All</button>
    </div>
  );
}
```

### API

- **`setTimeout(callback, delay)`**: Create auto-cleaning timeout
- **`setInterval(callback, delay)`**: Create auto-cleaning interval
- **`clearTimeout(id)`**: Clear specific timeout
- **`clearInterval(id)`**: Clear specific interval
- **`clearAll()`**: Clear all timeouts and intervals

**Benefits:**
- Prevents "setState on unmounted component" warnings
- Prevents memory leaks from lingering timers
- Automatic cleanup on component unmount

---

## 🎯 Migration Guide

### Migrating from Direct AudioContext Usage

**Before:**
```tsx
const audioContext = useRef<AudioContext | null>(null);

useEffect(() => {
  audioContext.current = new AudioContext();
  return () => {
    audioContext.current?.close();
  };
}, []);

const playNote = () => {
  if (!audioContext.current) return;
  const osc = audioContext.current.createOscillator();
  // ... manual audio node setup
};
```

**After:**
```tsx
const { audio, isReady, initialize } = useAudioService();

const handleStartGame = async () => {
  await initialize();
};

const playNote = async () => {
  await audio.playNote(440, 1.0);
};
```

### Migrating from Manual Timeout Cleanup

**Before:**
```tsx
const timeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

const delayedAction = () => {
  timeoutRef.current = setTimeout(() => {
    // action
  }, 1000);
};
```

**After:**
```tsx
const { setTimeout } = useGameCleanup();

const delayedAction = () => {
  setTimeout(() => {
    // action
  }, 1000);
  // Auto-cleanup on unmount!
};
```

---

## 📚 Additional Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Error Handling Best Practices](../components/ErrorBoundary.tsx)

