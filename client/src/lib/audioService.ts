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
      } catch (error) {
        this.initializationError = error instanceof Error ? error : new AudioError('Failed to initialize audio context');
        console.error('Audio initialization failed:', this.initializationError);
      }
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
      } catch (error) {
        throw new AudioError('Failed to resume audio context. Please check your browser permissions.');
      }
    }
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

      // Cleanup on end
      oscillator.addEventListener('ended', () => {
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
   */
  async playCraneMoveSound(): Promise<void> {
    try {
       // Low frequency sawtooth for motor buzz
       await this.playNote(100, 0.2, 'sawtooth');
    } catch (e) { console.warn(e); }
  }

  /**
   * Play a sliding sound for crane dropping
   */
  async playCraneDropSound(): Promise<void> {
    try {
      await this.ensureAudioContext();
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, this.audioContext!.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext!.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.6);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start();
      oscillator.stop(this.audioContext!.currentTime + 0.6);
    } catch (e) { console.warn(e); }
  }

  /**
   * Play a metallic clank for grabbing
   */
  async playCraneGrabSound(): Promise<void> {
    try {
      // Short high pitch metallic ping
      await this.playNote(1200, 0.1, 'square');
    } catch (e) { console.warn(e); }
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

      // Cleanup on end
      oscillator.addEventListener('ended', () => {
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
        this.initializationError = null;
      } catch (error) {
        this.initializationError = error instanceof Error ? error : new AudioError('Failed to initialize audio');
        throw this.initializationError;
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