// Enhanced Audio Service with Sample Loading Support
// Supports both synthesized audio (fallback) and real instrument samples

export interface InstrumentSample {
  name: string;
  url: string;
  note?: string;
  pitch?: number;
}

export interface InstrumentBank {
  percussion: InstrumentSample[];
  melody: InstrumentSample[];
  harmony: InstrumentSample[];
}

export class SampleAudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.3;
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(this.audioContext.destination);
      }
    }
  }

  async initialize(): Promise<void> {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(this.audioContext.destination);
      }
    }
    await this.ensureAudioContext();
  }

  async ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load a single audio sample into memory
   */
  async loadSample(url: string, name: string): Promise<AudioBuffer | null> {
    // Check if already loaded
    if (this.sampleBuffers.has(name)) {
      return this.sampleBuffers.get(name)!;
    }

    // Check if currently loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // Start loading
    const loadingPromise = this._fetchAndDecodeAudio(url, name);
    this.loadingPromises.set(name, loadingPromise);

    try {
      const buffer = await loadingPromise;
      this.sampleBuffers.set(name, buffer);
      this.loadingPromises.delete(name);
      return buffer;
    } catch (error) {
      console.error(`Failed to load sample ${name} from ${url}:`, error);
      this.loadingPromises.delete(name);
      return null;
    }
  }

  private async _fetchAndDecodeAudio(url: string, name: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    console.log(`✅ Loaded sample: ${name} (${audioBuffer.duration.toFixed(2)}s)`);
    return audioBuffer;
  }

  /**
   * Load multiple samples (instrument bank)
   */
  async loadSamples(samples: InstrumentSample[]): Promise<void> {
    const loadPromises = samples.map(sample =>
      this.loadSample(sample.url, sample.name)
    );

    await Promise.all(loadPromises);
    console.log(`✅ Loaded ${samples.length} samples`);
  }

  /**
   * Play a loaded sample
   */
  async playSample(
    name: string,
    options: {
      volume?: number;
      playbackRate?: number;
      loop?: boolean;
      startTime?: number;
      duration?: number;
    } = {}
  ): Promise<AudioBufferSourceNode | null> {
    await this.ensureAudioContext();

    if (!this.audioContext || !this.masterGain) {
      console.error('Audio context not available');
      return null;
    }

    const buffer = this.sampleBuffers.get(name);
    if (!buffer) {
      console.warn(`Sample ${name} not loaded`);
      return null;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.playbackRate.value = options.playbackRate ?? 1.0;
    source.loop = options.loop ?? false;

    gainNode.gain.value = options.volume ?? 1.0;

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Track active source
    this.activeSources.add(source);

    // Cleanup on end
    source.addEventListener('ended', () => {
      try {
        source.disconnect();
        gainNode.disconnect();
        this.activeSources.delete(source);
      } catch (e) {
        // Already disconnected
      }
    });

    // Start playback
    const startTime = options.startTime ?? 0;
    if (options.duration) {
      source.start(this.audioContext.currentTime, 0, options.duration);
    } else {
      source.start(this.audioContext.currentTime, startTime);
    }

    return source;
  }

  /**
   * Play a looping sample (for orchestra layers)
   */
  async playLoopingSample(
    name: string,
    volume: number = 1.0,
    playbackRate: number = 1.0
  ): Promise<AudioBufferSourceNode | null> {
    return this.playSample(name, {
      volume,
      playbackRate,
      loop: true
    });
  }

  /**
   * Stop a specific audio source
   */
  stopSource(source: AudioBufferSourceNode): void {
    if (!source) return;

    try {
      // Fade out for smooth stop
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        // Note: We need to get the gain node from the source's connections
        // For now, just stop immediately
        source.stop();
      }
    } catch (e) {
      // Already stopped
    }
  }

  /**
   * Stop all playing samples
   */
  stopAllSources(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeSources.clear();
  }

  /**
   * Fallback: Play synthesized note (when samples not available)
   */
  async playNote(frequency: number, duration: number = 1.5): Promise<void> {
    await this.ensureAudioContext();

    if (!this.audioContext || !this.masterGain) {
      console.error('Audio context not available');
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lowShelf = this.audioContext.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250;
    lowShelf.gain.value = this.getLowBoostDb(frequency);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now + duration - 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(lowShelf);
    lowShelf.connect(this.masterGain);

    oscillator.addEventListener('ended', () => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        lowShelf.disconnect();
      } catch {}
    });

    oscillator.start(now);
    oscillator.stop(now + duration);

    return new Promise((resolve) => {
      setTimeout(resolve, duration * 1000);
    });
  }

  /**
   * Play success tone
   */
  async playSuccessTone(): Promise<void> {
    await this.ensureAudioContext();
    await this.playNote(660, 0.14);
    await new Promise(resolve => setTimeout(resolve, 70));
    await this.playNote(880, 0.14);
  }

  /**
   * Play error tone
   */
  async playErrorTone(): Promise<void> {
    await this.ensureAudioContext();
    await this.playNote(300, 0.16);
    await new Promise(resolve => setTimeout(resolve, 60));
    await this.playNote(200, 0.18);
  }

  /**
   * Set master volume
   */
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

  /**
   * Check if a sample is loaded
   */
  isSampleLoaded(name: string): boolean {
    return this.sampleBuffers.has(name);
  }

  /**
   * Get number of loaded samples
   */
  getLoadedSampleCount(): number {
    return this.sampleBuffers.size;
  }

  /**
   * Clear all loaded samples from memory
   */
  clearSamples(): void {
    this.stopAllSources();
    this.sampleBuffers.clear();
    this.loadingPromises.clear();
  }

  private getLowBoostDb(freq: number): number {
    if (freq < 180) return 5;
    if (freq < 300) return 3;
    if (freq < 500) return 1;
    return 0;
  }
}

// Singleton instance
export const sampleAudioService = new SampleAudioService();

// Helper to create instrument banks
export const createInstrumentBank = (): InstrumentBank => {
  return {
    percussion: [
      { name: 'bass-drum', url: '/sounds/percussion/bass-drum.mp3' },
      { name: 'snare-drum', url: '/sounds/percussion/snare-drum.mp3' },
      { name: 'timpani-c', url: '/sounds/percussion/timpani-c.mp3' },
    ],
    melody: [
      { name: 'flute-c5', url: '/sounds/melody/flute-c5.mp3', note: 'C5', pitch: 523 },
      { name: 'flute-d5', url: '/sounds/melody/flute-d5.mp3', note: 'D5', pitch: 587 },
      { name: 'flute-e5', url: '/sounds/melody/flute-e5.mp3', note: 'E5', pitch: 659 },
      { name: 'violin-c5', url: '/sounds/melody/violin-c5.mp3', note: 'C5', pitch: 523 },
    ],
    harmony: [
      { name: 'cello-c3', url: '/sounds/harmony/cello-c3.mp3', note: 'C3', pitch: 262 },
      { name: 'cello-e3', url: '/sounds/harmony/cello-e3.mp3', note: 'E3', pitch: 330 },
      { name: 'cello-g3', url: '/sounds/harmony/cello-g3.mp3', note: 'G3', pitch: 392 },
    ],
  };
};
