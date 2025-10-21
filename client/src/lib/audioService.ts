// Web Audio API service for playing musical notes

export class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.3; // 0..1

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext!.createGain();
        this.masterGain.gain.value = this.currentVolume; // Reduced volume for children's ears
        this.masterGain.connect(this.audioContext!.destination);
      }
    }
  }

  // Ensure audio context is resumed (needed for some browsers)
  async ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Play a note with given frequency
  async playNote(frequency: number, duration: number = 1.5): Promise<void> {
    await this.ensureAudioContext();

    if (!this.audioContext || !this.masterGain) {
      console.error('Audio context not available');
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lowShelf = this.audioContext.createBiquadFilter();

    // Oscillator settings
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Subtle low-frequency boost using a lowshelf filter
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250; // Shelf start around 250 Hz
    lowShelf.gain.value = this.getLowBoostDb(frequency);

    // ADSR envelope for smooth sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // Decay
    gainNode.gain.setValueAtTime(0.2, now + duration - 0.2); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

    // Connect nodes: osc -> gain -> lowshelf -> master
    oscillator.connect(gainNode);
    gainNode.connect(lowShelf);
    lowShelf.connect(this.masterGain);

    // Cleanup on end
    oscillator.addEventListener('ended', () => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        lowShelf.disconnect();
      } catch {}
    });
    oscillator.start(now);
    oscillator.stop(now + duration);

    // Return a promise that resolves when the note finishes
    return new Promise((resolve) => {
      setTimeout(resolve, duration * 1000);
    });
  }

  // Play two notes sequentially
  async playSequence(frequency1: number, frequency2: number, duration: number = 1.5, gap: number = 0.5): Promise<void> {
    await this.playNote(frequency1, duration);
    await new Promise(resolve => setTimeout(resolve, gap * 1000));
    await this.playNote(frequency2, duration);
  }

  // Play a phrase (sequence of notes) with individual durations and dynamics
  async playPhrase(
    frequencies: number[],
    durations: number[],
    dynamics: number[] = [],
    gap: number = 0.1
  ): Promise<void> {
    await this.ensureAudioContext();

    for (let i = 0; i < frequencies.length; i++) {
      const frequency = frequencies[i];
      const duration = durations[i] / 1000; // Convert ms to seconds
      const volume = dynamics[i] || 0.7; // Default to 70% if not specified

      // Play with adjusted volume
      await this.playNoteWithDynamics(frequency, duration, volume);

      // Gap between notes
      if (i < frequencies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, gap * 1000));
      }
    }
  }

  // Play a note with custom volume/dynamics
  async playNoteWithDynamics(frequency: number, duration: number = 1.5, volumeScale: number = 0.7): Promise<void> {
    await this.ensureAudioContext();

    if (!this.audioContext || !this.masterGain) {
      console.error('Audio context not available');
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lowShelf = this.audioContext.createBiquadFilter();

    // Oscillator settings
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Subtle low-frequency boost
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250;
    lowShelf.gain.value = this.getLowBoostDb(frequency);

    // ADSR envelope with volume scaling
    const now = this.audioContext.currentTime;
    const sustainVolume = 0.2 * volumeScale;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3 * volumeScale, now + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(sustainVolume, now + 0.1); // Decay
    gainNode.gain.setValueAtTime(sustainVolume, now + duration - 0.2); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(lowShelf);
    lowShelf.connect(this.masterGain);

    // Cleanup on end
    oscillator.addEventListener('ended', () => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        lowShelf.disconnect();
      } catch {}
    });

    oscillator.start(now);
    oscillator.stop(now + duration);

    // Return a promise that resolves when note finishes
    return new Promise((resolve) => {
      setTimeout(resolve, duration * 1000);
    });
  }

  // Simple feedback sounds
  async playSuccessTone(): Promise<void> {
    // Two short ascending beeps
    await this.ensureAudioContext();
    await this.playNote(660, 0.14);
    await new Promise(resolve => setTimeout(resolve, 70));
    await this.playNote(880, 0.14);
  }

  async playErrorTone(): Promise<void> {
    // Two short descending beeps
    await this.ensureAudioContext();
    await this.playNote(300, 0.16);
    await new Promise(resolve => setTimeout(resolve, 60));
    await this.playNote(200, 0.18);
  }

  // Initialize audio context on user interaction
  async initialize(): Promise<void> {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext!.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(this.audioContext!.destination);
      }
    }
    await this.ensureAudioContext();
  }

  // Set master volume (0..1)
  setVolume(volume: number) {
    const v = Math.min(1, Math.max(0, volume));
    this.currentVolume = v;
    if (this.audioContext && this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(v, now + 0.05);
    }
  }

  getVolume(): number {
    return this.currentVolume;
  }

  // Return a subtle boost for low frequencies (in dB)
  private getLowBoostDb(freq: number): number {
    if (freq < 180) return 5; // very low
    if (freq < 300) return 3; // low
    if (freq < 500) return 1; // lower mids
    return 0; // no boost for higher notes
  }
}

// Singleton instance
export const audioService = new AudioService();