type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export const NOTE_FREQUENCIES: Record<string, number> = {
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0,
};

const SEMITONE_OFFSET: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

export class CoreAudioEngine {
  private audioCtx: AudioContext | null = null;
  private scratchBuffer: AudioBuffer | null = null;
  private isUnlocked = false;

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AC();
      this.scratchBuffer = this.audioCtx.createBuffer(1, 1, 22050);

      this.audioCtx.addEventListener('statechange', () => {
        if (this.audioCtx?.state === 'running') {
          this.isUnlocked = true;
        }
      });
    }
    return this.audioCtx;
  }

  private playScratch(ctx: AudioContext): void {
    if (!this.scratchBuffer) return;
    try {
      const source = ctx.createBufferSource();
      source.buffer = this.scratchBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
    }
  }

  async resumeAudioContext(): Promise<boolean> {
    try {
      let ctx = this.getAudioCtx();
      if (ctx.state === 'running') {
        this.isUnlocked = true;
        return true;
      }
      if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
        this.playScratch(ctx);
        try { await ctx.resume(); } catch {}
        if ((ctx.state as string) === 'running') {
          this.isUnlocked = true;
          return true;
        }
        try { ctx.close(); } catch {}
        this.audioCtx = null;
        this.scratchBuffer = null;
        ctx = this.getAudioCtx();
        this.playScratch(ctx);
        try { await ctx.resume(); } catch {}
        const running = ctx.state === 'running';
        if (running) this.isUnlocked = true;
        return running;
      }
    } catch {
    }
    return false;
  }

  noteKeyToFrequency(noteKey: string): number {
    const cached = NOTE_FREQUENCIES[noteKey];
    if (cached != null) return cached;
    const match = noteKey.match(/^([A-G][#b]?)(\d+)$/i);
    if (!match) return 440;
    const [_, name, oct] = match;
    const semitone = SEMITONE_OFFSET[name] ?? 0;
    const octave = parseInt(oct, 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  getFrequency(noteKey: string): number {
    return NOTE_FREQUENCIES[noteKey] ?? 440;
  }

  playNote(noteKey: string, duration = 0.4, volume = 0.3, waveType: OscillatorType = 'triangle'): void {
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state !== 'running') {
        void this.resumeAudioContext().then((ok) => {
          if (ok) this.playNote(noteKey, duration, volume, waveType);
        });
        return;
      }
      const freq = NOTE_FREQUENCIES[noteKey];
      if (!freq) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = waveType;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
    }
  }

  playNoteAtFrequency(freq: number, duration = 0.4, volume = 0.3, waveType: OscillatorType = 'triangle'): void {
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state !== 'running') {
        void this.resumeAudioContext().then((ok) => {
          if (ok) this.playNoteAtFrequency(freq, duration, volume, waveType);
        });
        return;
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = waveType;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
    }
  }

  playChord(noteKeys: string[], duration = 0.8, volume = 0.25, waveType: OscillatorType = 'triangle'): void {
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state !== 'running') {
        void this.resumeAudioContext().then((ok) => {
          if (ok) this.playChord(noteKeys, duration, volume, waveType);
        });
        return;
      }
      const now = ctx.currentTime;
      for (const key of noteKeys) {
        const freq = NOTE_FREQUENCIES[key] ?? this.noteKeyToFrequency(key);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = waveType;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.start(now);
        osc.stop(now + duration);
      }
    } catch {
    }
  }

  playScale(noteKeys: string[], gap = 0.35, duration = 0.35, volume = 0.3, waveType: OscillatorType = 'triangle'): void {
    noteKeys.forEach((key, i) => {
      setTimeout(() => {
        const freq = NOTE_FREQUENCIES[key] ?? this.noteKeyToFrequency(key);
        this.playNoteAtFrequency(freq, duration, volume, waveType);
      }, i * gap * 1000);
    });
  }

  playClick(volume = 0.2): void {
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state !== 'running') {
        void this.resumeAudioContext().then((ok) => {
          if (ok) this.playClick(volume);
        });
        return;
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 800;
      osc.type = 'square';
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
    }
  }
}