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

// ── Background Music ──────────────────────────────────────────────
let bgBuffer: AudioBuffer | null = null;
let bgSource: AudioBufferSourceNode | null = null;
let bgGain: GainNode | null = null;
const BG_VOLUME = 0.18;       // normal playback volume
const BG_DUCK_VOLUME = 0.03;  // ducked volume during challenges
const DUCK_RAMP_S = 0.6;      // fade duration in seconds

/** Pre-load the background music MP3 into an AudioBuffer. */
export async function loadBgMusic(url: string): Promise<void> {
  if (bgBuffer) return;
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    if (!res.ok) return;
    const arr = await res.arrayBuffer();
    bgBuffer = await ctx.decodeAudioData(arr);
  } catch {
    // Audio load failed — game continues without music
  }
}

/** Start looping background music. Safe to call multiple times (no-op if already playing). */
export function startBgMusic(): void {
  if (bgSource || !bgBuffer) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    bgGain = ctx.createGain();
    bgGain.gain.value = BG_VOLUME;
    bgGain.connect(ctx.destination);

    bgSource = ctx.createBufferSource();
    bgSource.buffer = bgBuffer;
    bgSource.loop = true;
    bgSource.connect(bgGain);
    bgSource.start(0);

    bgSource.addEventListener('ended', () => {
      bgSource = null;
    });
  } catch {
    // Audio not available
  }
}

/** Stop background music with a short fade-out. */
export function stopBgMusic(): void {
  if (!bgSource || !bgGain) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    bgGain.gain.cancelScheduledValues(now);
    bgGain.gain.setValueAtTime(bgGain.gain.value, now);
    bgGain.gain.linearRampToValueAtTime(0, now + 0.3);
    const src = bgSource;
    const gain = bgGain;
    bgSource = null;
    bgGain = null;
    setTimeout(() => {
      try { src.stop(); src.disconnect(); gain.disconnect(); } catch {}
    }, 400);
  } catch {
    bgSource = null;
    bgGain = null;
  }
}

/** Duck background music volume for challenges. */
export function duckBgMusic(): void {
  if (!bgGain) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    bgGain.gain.cancelScheduledValues(now);
    bgGain.gain.setValueAtTime(bgGain.gain.value, now);
    bgGain.gain.linearRampToValueAtTime(BG_DUCK_VOLUME, now + DUCK_RAMP_S);
  } catch {}
}

/** Restore background music volume after a challenge. */
export function unduckBgMusic(): void {
  if (!bgGain) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    bgGain.gain.cancelScheduledValues(now);
    bgGain.gain.setValueAtTime(bgGain.gain.value, now);
    bgGain.gain.linearRampToValueAtTime(BG_VOLUME, now + DUCK_RAMP_S);
  } catch {}
}

// ── Battle Music ──────────────────────────────────────────────────
const battleBuffers = new Map<string, AudioBuffer>();
let battleSource: AudioBufferSourceNode | null = null;
let battleGain: GainNode | null = null;
const BATTLE_VOLUME = 0.25;
const BATTLE_FADE_S = 0.4;

/** Pre-load a battle music track by key (e.g. 'miniboss', 'bigboss'). */
export async function loadBattleMusic(key: string, url: string): Promise<void> {
  if (battleBuffers.has(key)) return;
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    if (!res.ok) return;
    const arr = await res.arrayBuffer();
    battleBuffers.set(key, await ctx.decodeAudioData(arr));
  } catch {
    // Load failed — boss fights continue without music
  }
}

/** Start looping battle music for the given key. Stops any currently playing battle track. */
export function startBattleMusic(key: string): void {
  stopBattleMusic();
  const buffer = battleBuffers.get(key);
  if (!buffer) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') void ctx.resume();

    battleGain = ctx.createGain();
    battleGain.gain.value = 0;
    battleGain.connect(ctx.destination);

    battleSource = ctx.createBufferSource();
    battleSource.buffer = buffer;
    battleSource.loop = true;
    battleSource.connect(battleGain);
    battleSource.start(0);

    // Fade in
    const now = ctx.currentTime;
    battleGain.gain.linearRampToValueAtTime(BATTLE_VOLUME, now + BATTLE_FADE_S);

    battleSource.addEventListener('ended', () => { battleSource = null; });
  } catch {
    // Audio not available
  }
}

/** Stop battle music with a fade-out. */
export function stopBattleMusic(): void {
  if (!battleSource || !battleGain) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    battleGain.gain.cancelScheduledValues(now);
    battleGain.gain.setValueAtTime(battleGain.gain.value, now);
    battleGain.gain.linearRampToValueAtTime(0, now + BATTLE_FADE_S);
    const src = battleSource;
    const gain = battleGain;
    battleSource = null;
    battleGain = null;
    setTimeout(() => {
      try { src.stop(); src.disconnect(); gain.disconnect(); } catch {}
    }, (BATTLE_FADE_S + 0.1) * 1000);
  } catch {
    battleSource = null;
    battleGain = null;
  }
}
