/**
 * ViolinAudioService - Plays violin samples from the Philharmonia library
 * 
 * Sample naming: violin_{note}_{duration}_{dynamic}_{technique}.mp3
 * - note: G3, A4, C5 (s=sharp: Gs3=G#3, As4=A#4)
 * - duration: 025 (quarter), 05 (half), 1 (whole)
 * - dynamic: piano, mezzo-piano, mezzo-forte, forte, fortissimo
 * - technique: arco-normal (default bowed)
 * 
 * Uses Web Audio API scheduling for precise timing
 */
import { createWebAudioScheduler, WebAudioScheduler, ScheduledSound } from '@/lib/audio/webAudioScheduler';

export type NoteName = 'G' | 'Gs' | 'A' | 'As' | 'B' | 'C' | 'Cs' | 'D' | 'Ds' | 'E' | 'F' | 'Fs';
export type Octave = 3 | 4 | 5 | 6;
export type Duration = '025' | '05' | '1';
export type Dynamic = 'piano' | 'mezzo-piano' | 'mezzo-forte' | 'forte';

export interface Note {
  name: NoteName;
  octave: Octave;
  duration: Duration;
  dynamic?: Dynamic;
}

const AUDIO_BASE_PATH = '/audio/philharmonia/strings/violin';

class ViolinAudioService {
  private audioContext: AudioContext | null = null;
  private sampleCache: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;
  private gainNode: GainNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private abortController: AbortController | null = null;
  private scheduler: WebAudioScheduler | null = null;

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.scheduler = createWebAudioScheduler(this.audioContext, this.gainNode);
    this.isInitialized = true;
    console.log('[ViolinAudioService] Initialized');
  }

  /**
   * Set the volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Build the filename for a given note
   */
  private buildFilename(note: Note): string {
    const dynamic = note.dynamic || 'mezzo-forte';
    return `violin_${note.name}${note.octave}_${note.duration}_${dynamic}_arco-normal.mp3`;
  }

  /**
   * Load a sample into the cache
   */
  private async loadSample(note: Note): Promise<AudioBuffer> {
    const filename = this.buildFilename(note);
    const cacheKey = filename;
    
    if (this.sampleCache.has(cacheKey)) {
      return this.sampleCache.get(cacheKey)!;
    }

    if (!this.audioContext) {
      throw new Error('Audio context not initialized. Call initialize() first.');
    }

    const url = `${AUDIO_BASE_PATH}/${filename}`;
    console.log(`[ViolinAudioService] Loading: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load sample: ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.sampleCache.set(cacheKey, audioBuffer);
    return audioBuffer;
  }

  /**
   * Play a single note
   */
  async playNote(note: Note): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      await this.initialize();
    }

    const buffer = await this.loadSample(note);
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode!);

    // Track active source for stopping
    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
    };

    source.start();
  }

  /**
   * Play a sequence of notes with timing (can be aborted)
   */
  async playSequence(notes: Note[], tempoMs: number = 500, signal?: AbortSignal): Promise<void> {
    if (!this.audioContext || !this.scheduler) {
      await this.initialize();
    }
    if (!this.scheduler) {
      throw new Error('Failed to initialize scheduler');
    }

    // Check abort signal
    if (signal?.aborted) return;

    // Resume audio context if suspended
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Stop any existing playback
    this.scheduler.stop();

    // Build scheduled events
    const scheduledEvents: ScheduledSound[] = [];
    let currentTime = 0;

    for (let i = 0; i < notes.length; i++) {
      if (signal?.aborted) return;

      const note = notes[i];
      const durationMultiplier = note.duration === '025' ? 0.5 : note.duration === '05' ? 1 : 2;
      const durationSeconds = (tempoMs * durationMultiplier) / 1000;

      const filename = this.buildFilename(note);
      const sampleUrl = `${AUDIO_BASE_PATH}/${filename}`;

      scheduledEvents.push({
        time: currentTime,
        sampleUrl: sampleUrl,
        duration: durationSeconds,
        volume: 1.0,
        eventIndex: i,
      });

      currentTime += durationSeconds;
    }

    // Schedule all events - scheduler will handle loading samples
    await this.scheduler.scheduleSequence(scheduledEvents, {});
  }

  /**
   * Stop all currently playing sounds
   */
  stop(): void {
    // Stop all active sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeSources = [];
  }

  /**
   * Create an abort controller for cancellable playback
   */
  createAbortController(): AbortController {
    this.abortController = new AbortController();
    return this.abortController;
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve(); // Resolve instead of reject to allow graceful exit
      });
    });
  }

  /**
   * Preload a set of notes for faster playback
   */
  async preloadNotes(notes: Note[]): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }
    await Promise.all(notes.map(note => this.loadSample(note)));
  }
}

// Export singleton instance
export const violinAudioService = new ViolinAudioService();

