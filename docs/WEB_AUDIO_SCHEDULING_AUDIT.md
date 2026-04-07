# Web Audio Scheduling Audit

## Overview
This document identifies games and components that would benefit from adopting Web Audio API scheduling (like the Rhythm Randomizer fix) instead of `setTimeout` or sequential `await` loops for audio playback.

## Problem
Games using `setTimeout` or sequential `await` loops for audio timing can experience:
- Timing drift (5-50ms per event)
- Browser throttling delays (up to 1000ms in background tabs)
- Inconsistent timing in production environments (CDN latency, edge runtime)
- Accumulated timing errors over sequences

## Solution
Use Web Audio API's `audioContext.currentTime` to pre-schedule all sounds with sample-accurate precision, similar to the implementation in `client/src/lib/audio/webAudioScheduler.ts`.

---

## High Priority (Rhythm/Timing Critical)

### 1. **FinishTheTuneGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/finish-the-tune/FinishTheTuneGame.tsx`
**Issue**: Sequential `await audio.playNoteWithDynamics()` in loop (lines 97-103)
**Impact**: Timing drift affects musical phrase perception and comparison accuracy
**Pattern**:
```typescript
for (let i = 0; i < notes.length; i++) {
  await audio.playNoteWithDynamics(notes[i].freq, duration, volume);
}
```

### 2. **RestFinderGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/RestFinderGame.tsx`
**Issue**: Sequential `await playNote()` with `setTimeout` for rests (lines 70-87)
**Impact**: Beat timing accuracy critical for rhythm recognition
**Pattern**:
```typescript
for (let i = 0; i < sequence.beats.length; i++) {
  if (beat.type === "note") {
    await playNote(beat.frequency, beatDuration);
  } else {
    await new Promise(resolve => setGameTimeout(resolve, beatDuration));
  }
}
```

### 3. **FastOrSlowRaceGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/FastOrSlowRaceGame.tsx`
**Issue**: Sequential `await audioService.playNote()` with `setTimeout` delays (lines 101-108)
**Impact**: Tempo comparison requires precise timing - drift affects game accuracy
**Pattern**:
```typescript
for (const freq of melody) {
  await audioService.playNote(freq, tempo * 0.8);
  await new Promise<void>(resolve => setTimeout(resolve, tempo * 200));
}
```

### 4. **MusicalSimonSaysGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/MusicalSimonSaysGame.tsx`
**Issue**: Sequential `await playNote()` in loop (lines 82-90)
**Impact**: Pattern recognition requires consistent timing between notes
**Pattern**:
```typescript
for (const noteId of sequence) {
  await playNote(noteId);
}
```

### 5. **MelodyMemoryMatchGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/MelodyMemoryMatchGame.tsx`
**Issue**: Sequential `await audioService.playNote()` with `setTimeout` (lines 65-72)
**Impact**: Melody memory requires consistent timing for accurate recall
**Pattern**:
```typescript
for (const freq of melody) {
  await audioService.playNote(freq, 0.3);
  await new Promise<void>(resolve => setTimeout(resolve, 100));
}
```

### 6. **RhythmEchoChallengeGame** ⚠️ HIGH PRIORITY
**File**: `client/src/components/RhythmEchoChallengeGame.tsx`
**Issue**: Uses `setTimeout` for beat timing (line 110)
**Impact**: Rhythm echo requires precise beat timing
**Pattern**:
```typescript
const delay = beatTime - (Date.now() - startTime);
if (delay > 0) {
  await new Promise(resolve => setTimeout(resolve, delay));
}
```

### 7. **OrchestraAudioService** ⚠️ HIGH PRIORITY
**File**: `client/src/lib/aoc-v2/OrchestraAudioService.ts`
**Issue**: Sequential `await this.playSound()` and `await this.delay()` (lines 148-170)
**Impact**: Animal Orchestra Conductor - ensemble coordination requires precise timing
**Pattern**:
```typescript
for (const event of events) {
  if (!isRest(event)) {
    await this.playSound(instrument, event);
  }
  await this.delay(tempoMs * durationMultiplier, signal);
}
```

### 8. **ViolinAudioService** ⚠️ HIGH PRIORITY
**File**: `client/src/lib/aoc-v2/ViolinAudioService.ts`
**Issue**: Sequential `await this.playNote()` and `await this.delay()` (lines 119-142)
**Impact**: Musical phrase playback requires precise timing
**Pattern**:
```typescript
for (let i = 0; i < notes.length; i++) {
  await this.playNote(note);
  await this.delay(tempoMs * durationMultiplier, signal);
}
```

---

## Medium Priority (Less Critical but Would Improve)

### 9. **InstrumentCraneGame**
**File**: `client/src/components/InstrumentCraneGame.tsx`
**Issue**: Sequential `await audioService.playSample()` with `setTimeout` (lines 448-463)
**Impact**: Sample playback sequences could be more consistent
**Note**: Less critical as it's for sound recognition, not rhythm

### 10. **SameOrDifferentGame**
**File**: `client/src/components/SameOrDifferentGame.tsx`
**Issue**: Uses `setTimeout` for pauses between phrases (line 61)
**Impact**: Phrase comparison timing could be more consistent

### 11. **ScaleClimberGame**
**File**: `client/src/components/ScaleClimberGame.tsx`
**Issue**: Uses Web Audio scheduling but with `setTimeout` for completion (line 95)
**Impact**: Already mostly correct, but completion timing could be improved

### 12. **Various Game Components** (Cross001Game, Theory003Game, Rhythm003Game, etc.)
**Files**: Multiple game components
**Issue**: Sequential `await` loops with `setTimeout` pauses
**Impact**: Less critical - mostly for sound effects, not rhythm

---

## Already Using Web Audio Scheduling ✅

### **HowManyNotesGame**
**File**: `client/src/components/HowManyNotesGame.tsx`
**Status**: ✅ Already correctly uses `audioContext.currentTime` for scheduling (lines 62-81)
**Note**: Good example to reference!

---

## Implementation Strategy

### Phase 1: High Priority Games (Rhythm/Timing Critical)
1. FinishTheTuneGame
2. RestFinderGame
3. FastOrSlowRaceGame
4. MusicalSimonSaysGame
5. MelodyMemoryMatchGame
6. RhythmEchoChallengeGame

### Phase 2: Audio Services (Used by Multiple Games)
1. OrchestraAudioService (affects Animal Orchestra Conductor)
2. ViolinAudioService

### Phase 3: Medium Priority Games
- InstrumentCraneGame
- SameOrDifferentGame
- ScaleClimberGame (minor improvements)

---

## Migration Pattern

For each game, follow this pattern:

1. **Import the scheduler**:
   ```typescript
   import { createWebAudioScheduler, ScheduledSound } from '@/lib/audio/webAudioScheduler';
   ```

2. **Create scheduler instance**:
   ```typescript
   const schedulerRef = useRef<WebAudioScheduler | null>(null);
   const audioContextRef = useRef<AudioContext | null>(null);
   const masterGainRef = useRef<GainNode | null>(null);
   
   const getScheduler = useCallback(() => {
     if (!schedulerRef.current) {
       // Initialize AudioContext and scheduler
     }
     return schedulerRef.current;
   }, []);
   ```

3. **Convert sequential playback to scheduled events**:
   ```typescript
   // OLD: Sequential await
   for (const note of notes) {
     await audio.playNote(note.freq, duration);
   }
   
   // NEW: Pre-schedule all events
   const events: ScheduledSound[] = notes.map((note, i) => ({
     time: i * noteSpacing,
     frequency: note.freq,
     duration: duration,
     volume: 0.7,
   }));
   await scheduler.scheduleSequence(events, { onEventStart: updateUI });
   ```

4. **Use callbacks for UI updates**:
   ```typescript
   await scheduler.scheduleSequence(events, {
     onEventStart: (event) => {
       // Update UI highlighting
     },
     onComplete: () => {
       // Handle completion
     },
   });
   ```

---

## Testing Checklist

For each migrated game:
- [ ] Test playback timing precision (compare local vs production)
- [ ] Verify UI highlighting syncs with audio
- [ ] Test pause/resume functionality
- [ ] Test stop functionality
- [ ] Verify no audio artifacts or clicks
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)

---

## Notes

- The `webAudioScheduler.ts` utility is already created and tested with Rhythm Randomizer
- Some games may need custom scheduling logic (e.g., tempo changes, dynamic sequences)
- Consider creating game-specific scheduler wrappers for common patterns
- Keep backward compatibility with existing audio service methods where possible

