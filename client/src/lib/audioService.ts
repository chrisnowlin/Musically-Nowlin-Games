// Web Audio API service for playing musical notes

/**
 * Valid frequency range for musical notes (20Hz - 20kHz)
 * Human hearing range, also prevents audio artifacts
 */
const MIN_FREQUENCY = 20;
const MAX_FREQUENCY = 20000;

/**
 * Valid duration range in seconds
 */
const MIN_DURATION = 0.01; // 10ms minimum
const MAX_DURATION = 30; // 30 seconds maximum

/**
 * Valid volume range (0.0 - 1.0)
 */
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

/**
 * Custom error class for audio-related errors
 */
export class AudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioError';
  }
}

/**
 * Validates and clamps a frequency value to safe range
 * @param frequency - Frequency in Hz
 * @returns Clamped frequency value
 * @throws AudioError if frequency is invalid
 */
function validateFrequency(frequency: number): number {
  if (typeof frequency !== 'number' || isNaN(frequency)) {
    throw new AudioError(`Invalid frequency: ${frequency}. Must be a number.`);
  }

  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    console.warn(`Frequency ${frequency}Hz is outside safe range (${MIN_FREQUENCY}-${MAX_FREQUENCY}Hz). Clamping.`);
    return Math.max(MIN_FREQUENCY, Math.min(MAX_FREQUENCY, frequency));
  }

  return frequency;
}

/**
 * Validates and clamps a duration value to safe range
 * @param duration - Duration in seconds
 * @returns Clamped duration value
 * @throws AudioError if duration is invalid
 */
function validateDuration(duration: number): number {
  if (typeof duration !== 'number' || isNaN(duration)) {
    throw new AudioError(`Invalid duration: ${duration}. Must be a number.`);
  }

  if (duration < MIN_DURATION || duration > MAX_DURATION) {
    console.warn(`Duration ${duration}s is outside safe range (${MIN_DURATION}-${MAX_DURATION}s). Clamping.`);
    return Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));
  }

  return duration;
}

/**
 * Validates and clamps a volume value to safe range
 * @param volume - Volume level (0.0 - 1.0)
 * @returns Clamped volume value
 * @throws AudioError if volume is invalid
 */
function validateVolume(volume: number): number {
  if (typeof volume !== 'number' || isNaN(volume)) {
    throw new AudioError(`Invalid volume: ${volume}. Must be a number.`);
  }

  return Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));
}

export class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.3; // 0..1
  private initializationError: Error | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private currentSampleSource: AudioBufferSourceNode | null = null;
  private isUnlocked: boolean = false; // Track if audio has been unlocked by user gesture
  private scratchBuffer: AudioBuffer | null = null; // Silent buffer for iOS unlock
  private html5AudioPool: HTMLAudioElement[] = []; // Pool of unlocked HTML5 Audio elements
  private unlockListenersAttached: boolean = false;
  private activeOscillators: Set<OscillatorNode> = new Set(); // Track active oscillators for cleanup

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          this.initializationError = new AudioError('Web Audio API is not supported in this browser');
          return;
        }

        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.currentVolume; // Reduced volume for children's ears
        this.masterGain.connect(this.audioContext.destination);

        // Create a scratch buffer for iOS unlock (1 sample of silence at 22050Hz)
        // This is the Howler.js pattern that actually works on iOS
        this.scratchBuffer = this.audioContext.createBuffer(1, 1, 22050);

        // Attach unlock listeners for iOS Safari
        this.attachUnlockListeners();
      } catch (error) {
        this.initializationError = error instanceof Error ? error : new AudioError('Failed to initialize audio context');
        console.error('Audio initialization failed:', this.initializationError);
      }
    }
  }

  /**
   * Attach event listeners to unlock audio on first user interaction
   * This is required for iOS Safari - based on Howler.js implementation
   */
  private attachUnlockListeners(): void {
    if (this.unlockListenersAttached || typeof document === 'undefined') return;

    const unlock = () => {
      // Already unlocked
      if (this.isUnlocked) return;

      // Try to unlock Web Audio by playing a scratch buffer
      this.unlockWebAudio();

      // Create pool of unlocked HTML5 Audio elements as fallback
      this.createHtml5AudioPool();
    };

    // Listen for multiple event types - iOS has been picky about which events work
    // touchend is most reliable on iOS, but we listen to all for maximum compatibility
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('touchend', unlock, true);
    document.addEventListener('click', unlock, true);
    document.addEventListener('keydown', unlock, true);

    this.unlockListenersAttached = true;
  }

  /**
   * Unlock Web Audio by playing a silent scratch buffer
   * This is the key technique from Howler.js that makes iOS work
   */
  private unlockWebAudio(): void {
    if (!this.audioContext || !this.scratchBuffer) return;

    try {
      // Create and play an empty buffer
      const source = this.audioContext.createBufferSource();
      source.buffer = this.scratchBuffer;
      source.connect(this.audioContext.destination);

      // Use noteOn for older iOS, start for modern browsers
      if (typeof source.start === 'undefined') {
        (source as any).noteOn(0);
      } else {
        source.start(0);
      }

      // Also call resume() for good measure
      if (typeof this.audioContext.resume === 'function') {
        this.audioContext.resume();
      }

      // Check if we're actually unlocked
      source.onended = () => {
        source.disconnect(0);

        if (this.audioContext && this.audioContext.state === 'running') {
          this.isUnlocked = true;
          console.log('Web Audio unlocked successfully');

          // Remove unlock listeners now that we're unlocked
          this.removeUnlockListeners();
        }
      };
    } catch (e) {
      console.warn('Failed to unlock Web Audio:', e);
    }
  }

  /**
   * Create a pool of unlocked HTML5 Audio elements for fallback playback
   */
  private createHtml5AudioPool(): void {
    const poolSize = 5;
    while (this.html5AudioPool.length < poolSize) {
      try {
        const audio = new Audio();
        // Load a tiny data URI to "unlock" the audio element
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.load();
        (audio as any)._unlocked = true;
        this.html5AudioPool.push(audio);
      } catch (e) {
        break;
      }
    }
  }

  /**
   * Remove unlock event listeners after successful unlock
   */
  private removeUnlockListeners(): void {
    if (typeof document === 'undefined') return;

    const noop = () => {};
    document.removeEventListener('touchstart', noop, true);
    document.removeEventListener('touchend', noop, true);
    document.removeEventListener('click', noop, true);
    document.removeEventListener('keydown', noop, true);
  }

  /**
   * Get an HTML5 Audio element from the pool (for fallback playback)
   */
  private getHtml5Audio(): HTMLAudioElement {
    if (this.html5AudioPool.length > 0) {
      return this.html5AudioPool.pop()!;
    }
    return new Audio();
  }

  /**
   * Return an HTML5 Audio element to the pool
   */
  private releaseHtml5Audio(audio: HTMLAudioElement): void {
    if ((audio as any)._unlocked && this.html5AudioPool.length < 5) {
      audio.pause();
      audio.currentTime = 0;
      this.html5AudioPool.push(audio);
    }
  }

  /**
   * Check if audio is available and throw helpful error if not
   * @throws AudioError if audio context is not available
   */
  private ensureAudioAvailable(): void {
    if (this.initializationError) {
      throw this.initializationError;
    }

    if (!this.audioContext || !this.masterGain) {
      throw new AudioError('Audio context not available. Please try refreshing the page.');
    }
  }

  /**
   * Ensure audio context is resumed (needed for some browsers)
   * @throws AudioError if resume fails
   */
  async ensureAudioContext(): Promise<void> {
    this.ensureAudioAvailable();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        // Mark as unlocked once context is successfully resumed
        if (this.audioContext.state === 'running') {
          this.isUnlocked = true;
        }
      } catch (error) {
        throw new AudioError('Failed to resume audio context. Please check your browser permissions.');
      }
    } else if (this.audioContext && this.audioContext.state === 'running') {
      this.isUnlocked = true;
    }
  }

  /**
   * Check if audio has been unlocked by user gesture
   */
  isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Clear the audio buffer cache (useful when re-initializing after user gesture)
   */
  clearCache(): void {
    this.audioBufferCache.clear();
  }

  /**
   * Play a note with given frequency and optional wave type
   * @param frequency - Frequency in Hz (20-20000)
   * @param duration - Duration in seconds (0.01-30)
   * @param type - Oscillator type (sine, square, sawtooth, triangle)
   * @throws AudioError if parameters are invalid or audio fails
   */
  async playNote(frequency: number, duration: number = 1.5, type: OscillatorType = 'sine'): Promise<void> {
    // Validate inputs
    const validFreq = validateFrequency(frequency);
    const validDuration = validateDuration(duration);

    await this.ensureAudioContext();
    this.ensureAudioAvailable();

    try {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      const lowShelf = this.audioContext!.createBiquadFilter();

      // Oscillator settings
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(validFreq, this.audioContext!.currentTime);

      // Subtle low-frequency boost using a lowshelf filter
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 250; // Shelf start around 250 Hz
      lowShelf.gain.value = this.getLowBoostDb(validFreq);

      // ADSR envelope for smooth sound
      const now = this.audioContext!.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // Decay
      gainNode.gain.setValueAtTime(0.2, now + validDuration - 0.2); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + validDuration); // Release

      // Connect nodes: osc -> gain -> lowshelf -> master
      oscillator.connect(gainNode);
      gainNode.connect(lowShelf);
      lowShelf.connect(this.masterGain!);

      // Track this oscillator for cleanup
      this.activeOscillators.add(oscillator);

      // Cleanup on end
      oscillator.addEventListener('ended', () => {
        this.activeOscillators.delete(oscillator);
        try {
          oscillator.disconnect();
          gainNode.disconnect();
          lowShelf.disconnect();
        } catch (error) {
          // Ignore cleanup errors - nodes may already be disconnected
        }
      });

      oscillator.start(now);
      oscillator.stop(now + validDuration);

      // Return a promise that resolves when the note finishes
      return new Promise((resolve) => {
        setTimeout(resolve, validDuration * 1000);
      });
    } catch (error) {
      throw new AudioError(`Failed to play note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ... (keep existing methods)

  /**
   * Play a short UI click sound
   */
  async playClickSound(): Promise<void> {
    try {
      await this.playNote(800, 0.05, 'sine');
    } catch (e) { console.warn(e); }
  }

  /**
   * Play a mechanical motor sound for crane movement
   * Volume reduced by a third for better balance with instrument sounds
   */
  async playCraneMoveSound(): Promise<void> {
    try {
      await this.ensureAudioContext();
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      // Low frequency sawtooth for motor buzz
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, this.audioContext!.currentTime);
      
      // Reduced volume (0.13 instead of 0.2 - reduced by a third)
      const now = this.audioContext!.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.13, now + 0.03); // Attack
      gainNode.gain.setValueAtTime(0.13, now + 0.15); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2); // Release
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (e) { console.warn(e); }
  }

  /**
   * Play a sliding sound for crane dropping
   * Volume reduced by a third for better balance with instrument sounds
   */
  async playCraneDropSound(): Promise<void> {
    try {
      await this.ensureAudioContext();
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, this.audioContext!.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext!.currentTime + 0.6);
      
      // Reduced volume (0.13 instead of 0.2 - reduced by a third)
      gainNode.gain.setValueAtTime(0.13, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.6);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start();
      oscillator.stop(this.audioContext!.currentTime + 0.6);
    } catch (e) { console.warn(e); }
  }

  /**
   * Play a metallic clank for grabbing
   * Volume reduced by a third for better balance with instrument sounds
   */
  async playCraneGrabSound(): Promise<void> {
    try {
      await this.ensureAudioContext();
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      // Short high pitch metallic ping
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1200, this.audioContext!.currentTime);
      
      // Reduced volume (0.13 instead of 0.2 - reduced by a third)
      const now = this.audioContext!.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.13, now + 0.01); // Fast attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1); // Quick decay
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (e) { console.warn(e); }
  }

  /**
   * Helper to decode audio data with compatibility for older Safari
   */
  private decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      // Use the promise-based syntax if supported, otherwise fall back to callbacks
      // @ts-ignore - Safari signature difference
      const result = this.audioContext!.decodeAudioData(arrayBuffer, resolve, reject);
      // If a promise was returned (modern browsers), handle it
      if (result && typeof result.then === 'function') {
        result.catch(reject);
      }
    });
  }

  /**
   * Play an audio sample file using Web Audio API with HTML5 Audio fallback
   * @param url - URL path to the audio file (e.g., '/audio/strings/violin/violin_A4.mp3')
   * @param repeatCount - Number of times to play the sample (default 1)
   * @returns Promise that resolves when playback completes
   */
  async playSample(url: string, repeatCount: number = 1): Promise<void> {
    // Try Web Audio API first, fall back to HTML5 Audio if it fails
    try {
      await this.playSampleWebAudio(url, repeatCount);
    } catch (webAudioError) {
      console.warn('Web Audio failed, trying HTML5 Audio fallback:', webAudioError);
      try {
        await this.playSampleHtml5(url, repeatCount);
      } catch (html5Error) {
        console.error('Both Web Audio and HTML5 Audio failed:', html5Error);
        throw new AudioError(`Failed to play sample: ${url}`);
      }
    }
  }

  /**
   * Play sample using Web Audio API
   */
  private async playSampleWebAudio(url: string, repeatCount: number): Promise<void> {
    await this.ensureAudioContext();
    this.ensureAudioAvailable();

    // Stop any currently playing sample
    if (this.currentSampleSource) {
      try {
        this.currentSampleSource.stop();
        this.currentSampleSource.disconnect();
      } catch (e) {
        // Ignore - source may already be stopped
      }
      this.currentSampleSource = null;
    }

    // Check cache first
    let audioBuffer = this.audioBufferCache.get(url);

    if (!audioBuffer) {
      // Fetch and decode the audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new AudioError(`Failed to fetch audio file: ${url}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await this.decodeAudioData(arrayBuffer);

      // Cache the buffer for future use
      this.audioBufferCache.set(url, audioBuffer);
    }

    // Play the sample the specified number of times
    let playCount = 0;

    const playOnce = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          const source = this.audioContext!.createBufferSource();
          source.buffer = audioBuffer!;
          source.connect(this.masterGain!);

          this.currentSampleSource = source;

          source.onended = () => {
            playCount++;
            if (playCount < repeatCount) {
              // Small delay between repeats
              setTimeout(() => {
                playOnce().then(resolve).catch(reject);
              }, 100);
            } else {
              this.currentSampleSource = null;
              resolve();
            }
          };

          source.start(0);
        } catch (e) {
          reject(e);
        }
      });
    };

    await playOnce();
  }

  /**
   * Play sample using HTML5 Audio (fallback for iOS Safari issues)
   */
  private async playSampleHtml5(url: string, repeatCount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.getHtml5Audio();
      let playCount = 0;

      const playOnce = () => {
        audio.src = url;
        audio.volume = this.currentVolume;

        const onEnded = () => {
          playCount++;
          if (playCount < repeatCount) {
            setTimeout(() => {
              audio.currentTime = 0;
              audio.play().catch(reject);
            }, 100);
          } else {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            this.releaseHtml5Audio(audio);
            resolve();
          }
        };

        const onError = (e: Event) => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          this.releaseHtml5Audio(audio);
          reject(new AudioError(`HTML5 Audio error: ${(e as ErrorEvent).message || 'unknown'}`));
        };

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        audio.play().catch((e) => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          this.releaseHtml5Audio(audio);
          reject(e);
        });
      };

      playOnce();
    });
  }

  /**
   * Stop any currently playing sample
   */
  stopSample(): void {
    if (this.currentSampleSource) {
      try {
        this.currentSampleSource.stop();
        this.currentSampleSource.disconnect();
      } catch (e) {
        // Ignore - source may already be stopped
      }
      this.currentSampleSource = null;
    }
  }

  /**
   * Stop all currently playing oscillator notes
   * Call this on component unmount to prevent sounds from continuing
   */
  stopAllNotes(): void {
    this.activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        // Ignore - oscillator may already be stopped
      }
    });
    this.activeOscillators.clear();
  }

  /**
   * Stop all audio (samples and notes)
   * Call this on game/component unmount to fully clean up audio
   */
  stopAll(): void {
    this.stopSample();
    this.stopAllNotes();
  }

  /**
   * Preload audio samples into cache for faster playback
   * @param urls - Array of audio file URLs to preload
   */
  async preloadSamples(urls: string[]): Promise<void> {
    // On iOS Safari, preloading before user gesture will fail
    // Skip preloading if the audio context is suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      // Don't even try - it won't work on iOS Safari
      return;
    }

    try {
      await this.ensureAudioContext();
    } catch {
      // Can't resume context yet, skip preloading
      return;
    }

    const loadPromises = urls.map(async (url) => {
      if (this.audioBufferCache.has(url)) {
        return; // Already cached
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to preload audio: ${url}`);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(url, audioBuffer);
      } catch (e) {
        console.warn(`Failed to preload audio: ${url}`, e);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Play two notes sequentially
   * @param frequency1 - First note frequency in Hz
   * @param frequency2 - Second note frequency in Hz
   * @param duration - Duration of each note in seconds
   * @param gap - Gap between notes in seconds
   * @throws AudioError if parameters are invalid or audio fails
   */
  async playSequence(frequency1: number, frequency2: number, duration: number = 1.5, gap: number = 0.5): Promise<void> {
    const validGap = validateDuration(gap);

    await this.playNote(frequency1, duration);
    await new Promise(resolve => setTimeout(resolve, validGap * 1000));
    await this.playNote(frequency2, duration);
  }

  /**
   * Play a phrase (sequence of notes) with individual durations and dynamics
   * @param frequencies - Array of frequencies in Hz
   * @param durations - Array of durations in milliseconds
   * @param dynamics - Optional array of volume levels (0.0-1.0)
   * @param gap - Gap between notes in seconds
   * @throws AudioError if parameters are invalid or audio fails
   */
  async playPhrase(
    frequencies: number[],
    durations: number[],
    dynamics: number[] = [],
    gap: number = 0.1
  ): Promise<void> {
    if (!Array.isArray(frequencies) || frequencies.length === 0) {
      throw new AudioError('Frequencies must be a non-empty array');
    }

    if (!Array.isArray(durations) || durations.length !== frequencies.length) {
      throw new AudioError('Durations array must match frequencies array length');
    }

    const validGap = validateDuration(gap);
    await this.ensureAudioContext();

    for (let i = 0; i < frequencies.length; i++) {
      const frequency = frequencies[i];
      const duration = durations[i] / 1000; // Convert ms to seconds
      const volume = dynamics[i] !== undefined ? dynamics[i] : 0.7; // Default to 70% if not specified

      // Play with adjusted volume
      await this.playNoteWithDynamics(frequency, duration, volume);

      // Gap between notes
      if (i < frequencies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, validGap * 1000));
      }
    }
  }

  /**
   * Play a note with custom volume/dynamics
   * @param frequency - Frequency in Hz (20-20000)
   * @param duration - Duration in seconds (0.01-30)
   * @param volumeScale - Volume scale (0.0-1.0)
   * @throws AudioError if parameters are invalid or audio fails
   */
  async playNoteWithDynamics(frequency: number, duration: number = 1.5, volumeScale: number = 0.7): Promise<void> {
    // Validate inputs
    const validFreq = validateFrequency(frequency);
    const validDuration = validateDuration(duration);
    const validVolume = validateVolume(volumeScale);

    await this.ensureAudioContext();
    this.ensureAudioAvailable();

    try {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      const lowShelf = this.audioContext!.createBiquadFilter();

      // Oscillator settings
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(validFreq, this.audioContext!.currentTime);

      // Subtle low-frequency boost
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 250;
      lowShelf.gain.value = this.getLowBoostDb(validFreq);

      // ADSR envelope with volume scaling
      const now = this.audioContext!.currentTime;
      const sustainVolume = 0.2 * validVolume;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3 * validVolume, now + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(sustainVolume, now + 0.1); // Decay
      gainNode.gain.setValueAtTime(sustainVolume, now + validDuration - 0.2); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + validDuration); // Release

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(lowShelf);
      lowShelf.connect(this.masterGain!);

      // Track this oscillator for cleanup
      this.activeOscillators.add(oscillator);

      // Cleanup on end
      oscillator.addEventListener('ended', () => {
        this.activeOscillators.delete(oscillator);
        try {
          oscillator.disconnect();
          gainNode.disconnect();
          lowShelf.disconnect();
        } catch (error) {
          // Ignore cleanup errors - nodes may already be disconnected
        }
      });

      oscillator.start(now);
      oscillator.stop(now + validDuration);

      // Return a promise that resolves when note finishes
      return new Promise((resolve) => {
        setTimeout(resolve, validDuration * 1000);
      });
    } catch (error) {
      throw new AudioError(`Failed to play note with dynamics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Play success feedback sound (two ascending beeps)
   * @throws AudioError if audio fails
   */
  async playSuccessTone(): Promise<void> {
    try {
      await this.ensureAudioContext();
      await this.playNote(660, 0.14);
      await new Promise(resolve => setTimeout(resolve, 70));
      await this.playNote(880, 0.14);
    } catch (error) {
      console.error('Failed to play success tone:', error);
      // Don't throw - feedback sounds are non-critical
    }
  }

  /**
   * Play error feedback sound (two descending beeps)
   * @throws AudioError if audio fails
   */
  async playErrorTone(): Promise<void> {
    try {
      await this.ensureAudioContext();
      await this.playNote(300, 0.16);
      await new Promise(resolve => setTimeout(resolve, 60));
      await this.playNote(200, 0.18);
    } catch (error) {
      console.error('Failed to play error tone:', error);
      // Don't throw - feedback sounds are non-critical
    }
  }

  /**
   * Play level up sound (ascending arpeggio)
   * @throws AudioError if audio fails
   */
  async playLevelUpSound(): Promise<void> {
    try {
      await this.ensureAudioContext();
      const notes = [440, 554, 659, 880]; // A major arpeggio
      const duration = 0.1;
      const gap = 0.05;

      for (const note of notes) {
        this.playNote(note, duration); // Fire and forget for overlapping sound
        await new Promise(resolve => setTimeout(resolve, gap * 1000));
      }
    } catch (error) {
      console.error('Failed to play level up sound:', error);
    }
  }

  /**
   * Initialize audio context on user interaction
   * Required for browsers that block audio until user gesture
   * MUST be called from a user gesture (click/touch) handler on iOS Safari
   * @throws AudioError if initialization fails
   */
  async initialize(): Promise<void> {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          throw new AudioError('Web Audio API is not supported in this browser');
        }

        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(this.audioContext.destination);

        // Create scratch buffer for iOS unlock
        this.scratchBuffer = this.audioContext.createBuffer(1, 1, 22050);

        this.initializationError = null;
      } catch (error) {
        this.initializationError = error instanceof Error ? error : new AudioError('Failed to initialize audio');
        throw this.initializationError;
      }
    }

    // CRITICAL: On iOS Safari, we must play a scratch buffer AND call resume()
    // Just calling resume() is not enough!
    if (this.audioContext && this.scratchBuffer && !this.isUnlocked) {
      try {
        // Play silent scratch buffer - this is what actually unlocks iOS audio
        const source = this.audioContext.createBufferSource();
        source.buffer = this.scratchBuffer;
        source.connect(this.audioContext.destination);

        if (typeof source.start === 'undefined') {
          (source as any).noteOn(0);
        } else {
          source.start(0);
        }

        // Also resume the context
        if (typeof this.audioContext.resume === 'function') {
          await this.audioContext.resume();
        }

        // Create HTML5 Audio pool as fallback
        this.createHtml5AudioPool();

        // Check state after a brief moment
        await new Promise(resolve => setTimeout(resolve, 10));

        if (this.audioContext.state === 'running') {
          this.isUnlocked = true;
          console.log('Audio initialized and unlocked');
        }
      } catch (e) {
        console.warn('Failed to unlock audio during initialize:', e);
      }
    }

    await this.ensureAudioContext();
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0-1.0)
   */
  setVolume(volume: number): void {
    const v = validateVolume(volume);
    this.currentVolume = v;

    if (this.audioContext && this.masterGain) {
      try {
        const now = this.audioContext.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(v, now + 0.05);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }

  /**
   * Get current master volume
   * @returns Current volume level (0.0-1.0)
   */
  getVolume(): number {
    return this.currentVolume;
  }

  /**
   * Check if audio is initialized and available
   * @returns True if audio is ready to use
   */
  isAvailable(): boolean {
    return this.audioContext !== null && this.masterGain !== null && this.initializationError === null;
  }

  /**
   * Get initialization error if any
   * @returns Error object or null if no error
   */
  getInitializationError(): Error | null {
    return this.initializationError;
  }

  /**
   * Return a subtle boost for low frequencies (in dB)
   * @param freq - Frequency in Hz
   * @returns Boost amount in dB
   */
  private getLowBoostDb(freq: number): number {
    if (freq < 180) return 5; // very low
    if (freq < 300) return 3; // low
    if (freq < 500) return 1; // lower mids
    return 0; // no boost for higher notes
  }
}

// Singleton instance
export const audioService = new AudioService();