// Enhanced Audio Service with Sample Loading Support
// Supports both synthesized audio (fallback) and real instrument samples
//
// IMPORTANT: This service does NOT create its own AudioContext. It uses the
// shared context from dungeonAudio.ts which has full iOS recovery (scratch
// buffer unlock, visibility listeners, force-recreation). This prevents the
// dual-context bug where one context recovers from interruptions and the
// other stays permanently suspended.

import { getSharedAudioCtx, resumeAudioContext } from '@/games/da-capo-dungeon/dungeonAudio';

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
  private masterGain: GainNode | null = null;
  private lastCtxId: number = 0; // track context identity for reconnection
  private currentVolume: number = 0.3;
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  /**
   * Get the shared AudioContext (lazily from dungeonAudio).
   * If the context was force-recreated (e.g. after iOS interruption),
   * reconnect the master gain node to the new context's destination.
   */
  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const ctx = getSharedAudioCtx();
      const ctxId = (ctx as any).__id ?? ((ctx as any).__id = ++this.lastCtxId);
      if (ctxId !== this.lastCtxId) {
        // Context was recreated — rebuild the master gain node
        this.lastCtxId = ctxId;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(ctx.destination);
      }
      if (!this.masterGain) {
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = this.currentVolume;
        this.masterGain.connect(ctx.destination);
      }
      return ctx;
    } catch {
      return null;
    }
  }

  async initialize(): Promise<void> {
    await this.ensureAudioContext();
  }

  async ensureAudioContext() {
    await resumeAudioContext();
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
      // Sample failed to load, will use fallback
      this.loadingPromises.delete(name);
      return null;
    }
  }

  private async _fetchAndDecodeAudio(url: string, name: string): Promise<AudioBuffer> {
    const ctx = this.getCtx();
    if (!ctx) {
      throw new Error('Audio context not available');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Safari: decodeAudioData can fail if the context is in a transitional
    // state. Try the main context first, then fall back to OfflineAudioContext.
    try {
      return await ctx.decodeAudioData(arrayBuffer);
    } catch {
      // ArrayBuffer is now detached — we can't retry with it.
      // Re-fetch and try with an OfflineAudioContext (Safari fallback).
      const retryRes = await fetch(url);
      if (!retryRes.ok) throw new Error(`HTTP retry error: ${retryRes.status}`);
      const retryBuf = await retryRes.arrayBuffer();
      const offlineCtx = new OfflineAudioContext(2, 1, ctx.sampleRate || 44100);
      return await offlineCtx.decodeAudioData(retryBuf);
    }
  }

  /**
   * Load multiple samples (instrument bank)
   */
  async loadSamples(samples: InstrumentSample[]): Promise<void> {
    const loadPromises = samples.map(sample =>
      this.loadSample(sample.url, sample.name)
    );

    await Promise.all(loadPromises);
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

    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return null;
    }

    const buffer = this.sampleBuffers.get(name);
    if (!buffer) {
      return null;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

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
      source.start(ctx.currentTime, 0, options.duration);
    } else {
      source.start(ctx.currentTime, startTime);
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
      source.stop();
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

    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const lowShelf = ctx.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 250;
    lowShelf.gain.value = this.getLowBoostDb(frequency);

    const now = ctx.currentTime;
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
    const ctx = this.getCtx();
    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
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
