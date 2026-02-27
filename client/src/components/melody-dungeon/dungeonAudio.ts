const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0,
};

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

export function playNote(noteKey: string, duration = 0.4, volume = 0.3): void {
  try {
    const ctx = getAudioCtx();
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

export function playPassageAtDynamic(dynamicLevel: string, duration = 1.5): void {
  const volumeMap: Record<string, number> = {
    pianissimo: 0.05,
    piano: 0.1,
    'mezzo-piano': 0.18,
    'mezzo-forte': 0.3,
    forte: 0.45,
    fortissimo: 0.6,
  };
  const vol = volumeMap[dynamicLevel] ?? 0.3;
  const notes = ['C4', 'E4', 'G4', 'C5'];
  notes.forEach((n, i) => {
    setTimeout(() => playNote(n, duration / notes.length, vol), i * (duration / notes.length) * 1000);
  });
}

export function getFrequency(noteKey: string): number {
  return NOTE_FREQUENCIES[noteKey] ?? 440;
}

export function noteKeyToName(noteKey: string): string {
  return noteKey.replace(/\d+/, '');
}

export const ALL_NOTE_KEYS = Object.keys(NOTE_FREQUENCIES);
