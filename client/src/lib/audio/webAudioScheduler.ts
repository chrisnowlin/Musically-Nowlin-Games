/**
 * Web Audio Scheduler
 * 
 * Provides sample-accurate audio scheduling using the Web Audio API's
 * hardware-synchronized clock instead of JavaScript's setTimeout.
 * 
 * This solves timing issues that occur when using setTimeout for rhythm playback:
 * - JavaScript timers are non-deterministic and can drift 5-50ms per event
 * - Browser throttling can delay timers up to 1000ms in background tabs
 * - Production environments (like Vercel) have higher latency than local dev
 * 
 * The Web Audio API's audioContext.currentTime is synchronized to the audio
 * hardware and provides sub-millisecond precision regardless of browser state.
 * 
 * Pattern: "Two Clocks" approach
 * - Use Web Audio clock for sound timing (sample-accurate)
 * - Use requestAnimationFrame for UI updates (visual feedback)
 */

export interface ScheduledSound {
  /** Time in seconds (relative to audioContext.currentTime) when sound should play */
  time: number;
  /** Frequency in Hz (for oscillator-based sounds) */
  frequency?: number;
  /** Duration in seconds */
  duration: number;
  /** Volume/gain (0.0 - 1.0) */
  volume: number;
  /** Sample URL (for sample-based sounds) */
  sampleUrl?: string;
  /** Whether this is an accented note */
  isAccented?: boolean;
  /** Oscillator type for synthesized sounds */
  oscillatorType?: OscillatorType;
  /** Unique identifier for this event (for UI sync) */
  eventId?: string;
  /** Measure index for UI highlighting */
  measureIndex?: number;
  /** Beat index for UI highlighting */
  beatIndex?: number;
  /** Event index for UI highlighting */
  eventIndex?: number;
  /** Part index for ensemble mode */
  partIndex?: number;
}

export interface SchedulerCallbacks {
  /** Called when an event starts (for UI highlighting) */
  onEventStart?: (event: ScheduledSound) => void;
  /** Called when playback completes */
  onComplete?: () => void;
  /** Called on each animation frame with current playback time */
  onTick?: (currentTime: number, startTime: number) => void;
}

export interface AudioSchedulerState {
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number;
  pauseTime: number;
}

/**
 * Creates a Web Audio scheduler instance for precise audio timing
 */
export function createWebAudioScheduler(audioContext: AudioContext, masterGain: GainNode) {
  let scheduledSources: Array<{
    source: AudioBufferSourceNode | OscillatorNode;
    stopTime: number;
  }> = [];
  let animationFrameId: number | null = null;
  let state: AudioSchedulerState = {
    isPlaying: false,
    isPaused: false,
    startTime: 0,
    pauseTime: 0,
  };
  let currentCallbacks: SchedulerCallbacks = {};
  let scheduledEvents: ScheduledSound[] = [];
  let lastTriggeredEventIndex = -1;
  let audioBufferCache: Map<string, AudioBuffer> = new Map();

  /**
   * Pre-fetch and decode an audio sample
   */
  async function loadSample(url: string): Promise<AudioBuffer> {
    if (audioBufferCache.has(url)) {
      return audioBufferCache.get(url)!;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache.set(url, audioBuffer);
    return audioBuffer;
  }

  /**
   * Preload multiple samples for faster playback
   */
  async function preloadSamples(urls: string[]): Promise<void> {
    const loadPromises = urls.map(url => loadSample(url).catch(() => null));
    await Promise.all(loadPromises);
  }

  /**
   * Schedule an oscillator-based sound at a precise time
   */
  function scheduleOscillator(
    startTime: number,
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
  ): OscillatorNode {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lowShelf = audioContext.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Low-frequency boost
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250;
    lowShelf.gain.value = frequency < 180 ? 5 : frequency < 300 ? 3 : frequency < 500 ? 1 : 0;

    // ADSR envelope with proper timing
    const peakVolume = 0.3 * volume;
    const sustainVolume = Math.max(0.01, 0.2 * volume);
    
    const attackTime = Math.min(0.02, duration * 0.15);
    const decayTime = Math.min(0.05, duration * 0.2);
    const releaseTime = Math.min(0.1, duration * 0.3);
    const sustainEnd = Math.max(attackTime + decayTime + 0.001, duration - releaseTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakVolume, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(sustainVolume, startTime + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainVolume, startTime + sustainEnd);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(lowShelf);
    lowShelf.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    const stopTime = startTime + duration;
    scheduledSources.push({ source: oscillator, stopTime });

    // Cleanup after playback
    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        lowShelf.disconnect();
      } catch {
        // Ignore cleanup errors
      }
      scheduledSources = scheduledSources.filter(s => s.source !== oscillator);
    };

    return oscillator;
  }

  /**
   * Schedule a sample-based sound at a precise time
   *
   * For instrument samples (like Philharmonia), we let the sample play its natural
   * duration rather than cutting it to the rhythm duration. This allows samples to
   * ring out naturally - the rhythm duration only controls WHEN notes start, not
   * how long they play. This is especially important for short notes (eighth notes)
   * where cutting the sample would make it sound unnatural.
   */
  async function scheduleSample(
    startTime: number,
    buffer: AudioBuffer,
    duration?: number,
    volume: number = 1.0
  ): Promise<AudioBufferSourceNode> {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, startTime);

    // Let the sample play its natural duration - don't cut it short based on rhythm
    // The natural decay of instrument samples sounds much better than abrupt cutoffs
    // Only add a gentle fade at the very end of the sample's natural duration
    const playDuration = buffer.duration;
    const fadeOutStart = Math.max(0, playDuration - 0.05);
    gainNode.gain.setValueAtTime(volume, startTime + fadeOutStart);
    gainNode.gain.linearRampToValueAtTime(0.01, startTime + playDuration);

    source.connect(gainNode);
    gainNode.connect(masterGain);

    // Play the full sample - don't pass duration parameter to avoid cutting it short
    source.start(startTime);

    const stopTime = startTime + playDuration;
    scheduledSources.push({ source, stopTime });

    source.onended = () => {
      try {
        source.disconnect();
        gainNode.disconnect();
      } catch {
        // Ignore cleanup errors
      }
      scheduledSources = scheduledSources.filter(s => s.source !== source);
    };

    return source;
  }

  /**
   * Animation frame loop for UI synchronization
   */
  function animationLoop() {
    if (!state.isPlaying || state.isPaused) {
      return;
    }

    const currentTime = audioContext.currentTime;
    const elapsedTime = currentTime - state.startTime;

    // Call tick callback
    currentCallbacks.onTick?.(currentTime, state.startTime);

    // Check for events that should trigger UI updates
    // We look slightly ahead (10ms) to account for visual sync
    const lookAheadTime = 0.01;
    
    for (let i = lastTriggeredEventIndex + 1; i < scheduledEvents.length; i++) {
      const event = scheduledEvents[i];
      if (elapsedTime + lookAheadTime >= event.time) {
        lastTriggeredEventIndex = i;
        currentCallbacks.onEventStart?.(event);
      } else {
        break; // Events are sorted by time, so we can stop early
      }
    }

    // Check if playback is complete
    const lastEvent = scheduledEvents[scheduledEvents.length - 1];
    if (lastEvent && elapsedTime > lastEvent.time + lastEvent.duration + 0.1) {
      stop();
      currentCallbacks.onComplete?.();
      return;
    }

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  /**
   * Schedule and play a sequence of sounds with precise timing
   * @param stopExisting - If true, stops existing playback before scheduling (default: true)
   * @returns Promise that resolves when playback completes
   */
  async function scheduleSequence(
    events: ScheduledSound[],
    callbacks: SchedulerCallbacks = {},
    options: { stopExisting?: boolean } = {}
  ): Promise<void> {
    const { stopExisting = true } = options;
    
    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Stop any existing playback (unless we're adding to concurrent playback)
    if (stopExisting) {
      stop();
    }

    // Preload any samples first (before updating state)
    const sampleUrls = events
      .filter(e => e.sampleUrl)
      .map(e => e.sampleUrl!);
    
    if (sampleUrls.length > 0) {
      await preloadSamples([...new Set(sampleUrls)]);
    }

    // Calculate start time with a small buffer for scheduling
    const scheduleAheadTime = 0.025; // 25ms buffer
    const sequenceStartTime = audioContext.currentTime + scheduleAheadTime;
    
    // Calculate sequence duration for this sequence
    const lastEvent = events[events.length - 1];
    const sequenceDuration = lastEvent ? lastEvent.time + lastEvent.duration : 0;
    
    // Track whether this is the first sequence in a concurrent batch
    const isFirstSequence = stopExisting || !state.isPlaying;
    
    if (isFirstSequence) {
      // First sequence - initialize state
      state.startTime = sequenceStartTime;
      state.isPlaying = true;
      state.isPaused = false;
      
      // Store callbacks and events
      currentCallbacks = callbacks;
      scheduledEvents = [...events].sort((a, b) => a.time - b.time);
      lastTriggeredEventIndex = -1;
      
      // Start animation loop for UI updates
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(animationLoop);
      }
    } else {
      // Concurrent sequence - merge events to track the longest sequence for completion
      // Add new events with adjusted times (relative to original start time)
      const timeOffset = sequenceStartTime - state.startTime;
      const adjustedEvents = events.map(e => ({
        ...e,
        time: e.time + timeOffset
      }));
      scheduledEvents = [...scheduledEvents, ...adjustedEvents].sort((a, b) => a.time - b.time);
    }

    // Schedule all sounds
    for (const event of events) {
      const absoluteTime = sequenceStartTime + event.time;

      if (event.sampleUrl) {
        // Sample-based sound
        const buffer = audioBufferCache.get(event.sampleUrl);
        if (buffer) {
          await scheduleSample(absoluteTime, buffer, event.duration, event.volume);
        }
      } else if (event.frequency) {
        // Oscillator-based sound
        scheduleOscillator(
          absoluteTime,
          event.frequency,
          event.duration,
          event.volume,
          event.oscillatorType || 'sine'
        );
      }
    }

    // Return a promise that resolves when this sequence's playback completes
    return new Promise<void>((resolve) => {
      const checkCompletion = () => {
        const elapsed = audioContext.currentTime - sequenceStartTime;
        if (elapsed >= sequenceDuration) {
          resolve();
        } else {
          // Check again next frame
          requestAnimationFrame(checkCompletion);
        }
      };
      
      // Start checking for completion
      if (sequenceDuration > 0) {
        requestAnimationFrame(checkCompletion);
      } else {
        resolve();
      }
    });
  }

  /**
   * Stop all scheduled sounds immediately
   */
  function stop() {
    state.isPlaying = false;
    state.isPaused = false;

    // Cancel animation frame
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Stop all scheduled sources
    const now = audioContext.currentTime;
    for (const { source } of scheduledSources) {
      try {
        source.stop(now);
      } catch {
        // Source may already be stopped
      }
    }
    scheduledSources = [];
    scheduledEvents = [];
    lastTriggeredEventIndex = -1;
  }

  /**
   * Pause playback (note: Web Audio doesn't truly pause, so we stop and track position)
   */
  function pause() {
    if (!state.isPlaying || state.isPaused) return;
    
    state.pauseTime = audioContext.currentTime;
    state.isPaused = true;
    
    // Stop animation frame
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Stop all sources
    const now = audioContext.currentTime;
    for (const { source } of scheduledSources) {
      try {
        source.stop(now);
      } catch {
        // Source may already be stopped
      }
    }
    scheduledSources = [];
  }

  /**
   * Get current scheduler state
   */
  function getState(): AudioSchedulerState {
    return { ...state };
  }

  /**
   * Get elapsed time since playback started
   */
  function getElapsedTime(): number {
    if (!state.isPlaying) return 0;
    if (state.isPaused) return state.pauseTime - state.startTime;
    return audioContext.currentTime - state.startTime;
  }

  /**
   * Clear the audio buffer cache
   */
  function clearCache() {
    audioBufferCache.clear();
  }

  return {
    scheduleSequence,
    scheduleOscillator,
    scheduleSample,
    loadSample,
    preloadSamples,
    stop,
    pause,
    getState,
    getElapsedTime,
    clearCache,
  };
}

export type WebAudioScheduler = ReturnType<typeof createWebAudioScheduler>;

