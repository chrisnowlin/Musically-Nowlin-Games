import { CoreAudioEngine } from '../../../shared/audio/core-audio';

export type CharacterClass = 'bard' | 'drummer' | 'harmonist' | 'conductor';

export class BattleAudio {
  private core = new CoreAudioEngine();

  playAttackSound(characterClass: CharacterClass, isCorrect: boolean): void {
    switch (characterClass) {
      case 'bard':
        if (isCorrect) this.playHarpPhrase();
        else this.playDissonantString();
        break;
      case 'drummer':
        if (isCorrect) this.playRhythmHit();
        else this.playOffbeatThunk();
        break;
      case 'harmonist':
        if (isCorrect) this.playMajorChord();
        else this.playDiminishedChord();
        break;
      case 'conductor':
        if (isCorrect) this.playCrescendo();
        else this.playDecrescendo();
        break;
    }
  }

  playAbilityActivation(abilityName: string): void {
    switch (abilityName) {
      case 'Perfect Pitch':
        this.playPerfectPitchSound();
        break;
      case 'Double Time':
        this.playDoubleTimeSound();
        break;
      case 'Resonance':
        this.playResonanceHeal();
        break;
      case 'Crescendo':
        this.playCrescendoBurst();
        break;
    }
  }

  playVictoryFanfare(): void {
    const progression = [
      { notes: ['C4', 'E4', 'G4'], delay: 0 },
      { notes: ['F4', 'A4', 'C5'], delay: 300 },
      { notes: ['G4', 'B4', 'D5'], delay: 600 },
      { notes: ['C5', 'E5', 'G5'], delay: 900 },
    ];

    progression.forEach(({ notes, delay }) => {
      setTimeout(() => {
        this.core.playChord(notes, 0.6, 0.35, 'triangle');
      }, delay);
    });
  }

  playDefeatSound(): void {
    const notes = ['G4', 'Eb4', 'C4', 'Ab3'];
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.core.playNote(note, 0.5, 0.25, 'triangle');
      }, i * 200);
    });
  }

  private playHarpPhrase(): void {
    const phrase = ['C4', 'E4', 'G4', 'C5'];
    phrase.forEach((note, i) => {
      setTimeout(() => {
        this.core.playNote(note, 0.3, 0.25, 'sine');
      }, i * 120);
    });
  }

  private playDissonantString(): void {
    this.core.playChord(['C4', 'Db4', 'Eb4'], 0.4, 0.2, 'sawtooth');
  }

  private playRhythmHit(): void {
    this.core.playClick(0.4);
    setTimeout(() => this.core.playClick(0.3), 100);
    setTimeout(() => this.core.playClick(0.35), 200);
  }

  private playOffbeatThunk(): void {
    this.core.playClick(0.2);
  }

  private playMajorChord(): void {
    this.core.playChord(['C4', 'E4', 'G4'], 0.5, 0.3, 'triangle');
  }

  private playDiminishedChord(): void {
    this.core.playChord(['C4', 'Eb4', 'Gb4'], 0.4, 0.2, 'triangle');
  }

  private playCrescendo(): void {
    const notes = ['C4', 'E4', 'G4', 'C5'];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const volume = 0.15 + (i * 0.1);
        this.core.playNote(note, 0.6, volume, 'triangle');
      }, i * 150);
    });
  }

  private playDecrescendo(): void {
    const notes = ['C5', 'G4', 'E4', 'C4'];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const volume = 0.25 - (i * 0.05);
        this.core.playNote(note, 0.4, Math.max(0.05, volume), 'triangle');
      }, i * 120);
    });
  }

  private playPerfectPitchSound(): void {
    this.core.playNote('C5', 0.8, 0.3, 'sine');
    setTimeout(() => this.core.playNote('E5', 0.8, 0.3, 'sine'), 100);
  }

  private playDoubleTimeSound(): void {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.core.playClick(0.25), i * 80);
    }
  }

  private playResonanceHeal(): void {
    const overtones = ['C4', 'C5', 'E5', 'G5'];
    overtones.forEach((note, i) => {
      setTimeout(() => this.core.playNote(note, 0.6, 0.2, 'sine'), i * 100);
    });
  }

  private playCrescendoBurst(): void {
    this.core.playChord(['C4', 'E4', 'G4', 'C5', 'E5'], 1.0, 0.4, 'sawtooth');
  }
}