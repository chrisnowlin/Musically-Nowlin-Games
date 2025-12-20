/**
 * OrchestraAudioService - Unified audio service for all orchestra instruments
 * 
 * Supports: violin, flute, clarinet, trumpet, tuba, bass drum
 */

export type NoteName = 'G' | 'Gs' | 'A' | 'As' | 'B' | 'C' | 'Cs' | 'D' | 'Ds' | 'E' | 'F' | 'Fs';
export type Octave = 1 | 2 | 3 | 4 | 5 | 6;
export type Duration = '025' | '05' | '1';
export type Dynamic = 'piano' | 'mezzo-piano' | 'mezzo-forte' | 'forte' | 'fortissimo' | 'pianissimo';

export type InstrumentType = 'violin' | 'flute' | 'clarinet' | 'trumpet' | 'tuba' | 'bass-drum';

export interface Note {
  name: NoteName;
  octave: Octave;
  duration: Duration;
  dynamic?: Dynamic;
}

// For bass drum, we use a special "hit" type instead of notes
export interface DrumHit {
  duration: Duration;
  dynamic?: Dynamic;
  technique?: 'bass-drum-mallet' | 'struck-singly';
}

export type SoundEvent = Note | DrumHit;

const INSTRUMENT_PATHS: Record<InstrumentType, string> = {
  'violin': '/audio/philharmonia/strings/violin',
  'flute': '/audio/philharmonia/woodwinds/flute',
  'clarinet': '/audio/philharmonia/woodwinds/clarinet',
  'trumpet': '/audio/philharmonia/brass/trumpet',
  'tuba': '/audio/philharmonia/brass/tuba',
  'bass-drum': '/audio/philharmonia/percussion/bass drum',
};

// Default techniques/suffixes for each instrument
const INSTRUMENT_SUFFIXES: Record<InstrumentType, string> = {
  'violin': 'arco-normal',
  'flute': 'normal',
  'clarinet': 'normal',
  'trumpet': 'normal',
  'tuba': 'normal',
  'bass-drum': 'bass-drum-mallet',
};

class OrchestraAudioService {
  private audioContext: AudioContext | null = null;
  private sampleCache: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;
  private gainNode: GainNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.isInitialized = true;
    console.log('[OrchestraAudioService] Initialized');
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private buildFilename(instrument: InstrumentType, event: SoundEvent): string {
    // Default dynamics vary by instrument (clarinet/trumpet don't have mezzo-forte for regular durations)
    const instrumentsWithForteDefault = ['clarinet', 'trumpet'];
    const defaultDynamic = instrumentsWithForteDefault.includes(instrument) ? 'forte' : 'mezzo-forte';
    const dynamic = event.dynamic || defaultDynamic;
    const suffix = INSTRUMENT_SUFFIXES[instrument];

    if (instrument === 'bass-drum') {
      const hit = event as DrumHit;
      const technique = hit.technique || 'bass-drum-mallet';
      return `bass-drum__${event.duration}_${dynamic}_${technique}.mp3`;
    }

    const note = event as Note;
    return `${instrument}_${note.name}${note.octave}_${event.duration}_${dynamic}_${suffix}.mp3`;
  }

  private async loadSample(instrument: InstrumentType, event: SoundEvent): Promise<AudioBuffer> {
    const filename = this.buildFilename(instrument, event);
    const cacheKey = `${instrument}/${filename}`;
    
    if (this.sampleCache.has(cacheKey)) {
      return this.sampleCache.get(cacheKey)!;
    }

    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const url = `${INSTRUMENT_PATHS[instrument]}/${filename}`;
    console.log(`[OrchestraAudioService] Loading: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load sample: ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sampleCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.error(`[OrchestraAudioService] Failed to decode: ${url}`, e);
      throw e;
    }
  }

  async playSound(instrument: InstrumentType, event: SoundEvent): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      await this.initialize();
    }

    const buffer = await this.loadSample(instrument, event);
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode!);

    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
    };

    source.start();
  }

  async playSequence(
    instrument: InstrumentType,
    events: SoundEvent[],
    tempoMs: number = 500,
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.audioContext) await this.initialize();
    
    // Preload all samples
    await Promise.all(events.map(e => this.loadSample(instrument, e)));

    for (const event of events) {
      if (signal?.aborted) return;
      
      await this.playSound(instrument, event);
      const durationMultiplier = event.duration === '025' ? 0.5 : event.duration === '05' ? 1 : 2;
      await this.delay(tempoMs * durationMultiplier, signal);
    }
  }

  stop(): void {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch { /* Already stopped */ }
    });
    this.activeSources = [];
  }

  async preloadInstrument(instrument: InstrumentType, events: SoundEvent[]): Promise<void> {
    if (!this.audioContext) await this.initialize();
    await Promise.all(events.map(e => this.loadSample(instrument, e)));
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => { clearTimeout(timeout); resolve(); });
    });
  }
}

export const orchestraAudioService = new OrchestraAudioService();

