const NOTE_FREQUENCIES: Record<string, number> = {
  // Bass clef range
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94,
  // Treble clef range
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0,
};

const SEMITONE_OFFSET: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

/** Resume AudioContext if suspended (required after user interaction) */
export function resumeAudioContext(): Promise<boolean> {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'running') return Promise.resolve(true);
    if (ctx.state === 'suspended') {
      return ctx
        .resume()
        .then(() => getAudioCtx().state === 'running')
        .catch(() => false);
    }
  } catch {
    // ignore
  }
  return Promise.resolve(false);
}

/** Get frequency for any note key (e.g. C4, C#4, Gb5) */
export function noteKeyToFrequency(noteKey: string): number {
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

export function playNote(noteKey: string, duration = 0.4, volume = 0.3): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      void resumeAudioContext().then((ok) => {
        if (ok) playNote(noteKey, duration, volume);
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
    osc.type = 'triangle';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playNoteAtFrequency(freq: number, duration = 0.4, volume = 0.3): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      void resumeAudioContext().then((ok) => {
        if (ok) playNoteAtFrequency(freq, duration, volume);
      });
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playTwoNotes(
  note1: string,
  note2: string,
  gap = 0.6,
  duration = 0.4
): void {
  playNote(note1, duration);
  setTimeout(() => playNote(note2, duration), gap * 1000);
}

export function playClick(volume = 0.2): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      void resumeAudioContext().then((ok) => {
        if (ok) playClick(volume);
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
    // Audio not available
  }
}

/** Play a chord (all notes simultaneously) */
export function playChord(noteKeys: string[], duration = 0.8, volume = 0.25): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      void resumeAudioContext().then((ok) => {
        if (ok) playChord(noteKeys, duration, volume);
      });
      return;
    }
    const now = ctx.currentTime;
    for (const key of noteKeys) {
      const freq = NOTE_FREQUENCIES[key] ?? noteKeyToFrequency(key);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    }
  } catch {
    // Audio not available
  }
}

/** Play a scale (notes in sequence) */
export function playScale(noteKeys: string[], gap = 0.35, duration = 0.35, volume = 0.3): void {
  noteKeys.forEach((key, i) => {
    setTimeout(() => {
      const freq = NOTE_FREQUENCIES[key] ?? noteKeyToFrequency(key);
      playNoteAtFrequency(freq, duration, volume);
    }, i * gap * 1000);
  });
}

/** Play a phrase for listening challenges (ascending, descending, or interval) */
export function playListeningPhrase(correctAnswer: string): void {
  if (correctAnswer === 'Ascending') {
    const notes = ['C4', 'E4', 'G4', 'C5'];
    notes.forEach((n, i) => setTimeout(() => playNote(n, 0.4), i * 400));
  } else if (correctAnswer === 'Descending') {
    const notes = ['C5', 'G4', 'E4', 'C4'];
    notes.forEach((n, i) => setTimeout(() => playNote(n, 0.4), i * 400));
  } else if (correctAnswer === 'Same') {
    playNote('C4', 0.5);
    setTimeout(() => playNote('C4', 0.5), 600);
  } else if (correctAnswer === '3rd') {
    playTwoNotes('C4', 'E4', 0.5);
  } else if (correctAnswer === '2nd') {
    playTwoNotes('C4', 'D4', 0.5);
  } else if (correctAnswer === '5th') {
    playTwoNotes('C4', 'G4', 0.5);
  } else if (correctAnswer === '4' || correctAnswer === '2' || correctAnswer === '3') {
    const beats = parseInt(correctAnswer, 10);
    const interval = 450;
    for (let m = 0; m < 2; m++) {
      for (let i = 0; i < beats; i++) {
        setTimeout(() => playClick(0.3), (m * beats + i) * interval);
      }
    }
  }
}

export function getFrequency(noteKey: string): number {
  return NOTE_FREQUENCIES[noteKey] ?? 440;
}

export function noteKeyToName(noteKey: string): string {
  return noteKey.replace(/\d+/, '');
}

export const ALL_NOTE_KEYS = Object.keys(NOTE_FREQUENCIES);
