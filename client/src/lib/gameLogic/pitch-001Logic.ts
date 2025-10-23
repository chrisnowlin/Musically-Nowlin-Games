/**
 * Pitch-001 Game Logic
 * Pitch & Interval Master - Multi-mode pitch training game
 */

import { pitch001Modes, Pitch001ModeConfig } from './pitch-001Modes';

export interface Pitch001Round {
  id: string;
  modeId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  options: string[];
  audioData: {
    type: string;
    frequencies: number[];
    duration: number;
    parameters?: any;
  };
  explanation: string;
  points: number;
}

export interface Pitch001GameState {
  currentRound: Pitch001Round | null;
  score: number;
  roundNumber: number;
  totalRounds: number;
  isPlaying: boolean;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean;
  streak: number;
  bestStreak: number;
}

// Musical note frequencies (A4 = 440Hz tuning)
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

// Interval ratios (just intonation)
const INTERVAL_RATIOS: { [key: string]: number } = {
  'unison': 1,
  'second': 9/8,
  'third': 5/4,
  'fourth': 4/3,
  'fifth': 3/2,
  'sixth': 5/3,
  'seventh': 15/8,
  'octave': 2
};

export class Pitch001Game {
  private modeConfig: Pitch001ModeConfig;
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(modeId: string, difficulty: 'easy' | 'medium' | 'hard') {
    const mode = pitch001Modes.find(m => m.id === modeId);
    if (!mode) {
      throw new Error(`Unknown mode: ${modeId}`);
    }
    this.modeConfig = mode;
    this.difficulty = difficulty;
  }

  generateRound(): Pitch001Round {
    const roundId = `${this.modeConfig.id}-${Date.now()}`;
    
    switch (this.modeConfig.id) {
      case 'octave':
        return this.generateOctaveRound(roundId);
      case 'interval':
        return this.generateIntervalRound(roundId);
      case 'bend':
        return this.generateBendRound(roundId);
      case 'vibrato':
        return this.generateVibratoRound(roundId);
      case 'glissando':
        return this.generateGlissandoRound(roundId);
      case 'portamento':
        return this.generatePortamentoRound(roundId);
      case 'envelope':
        return this.generateEnvelopeRound(roundId);
      case 'harmonic':
        return this.generateHarmonicRound(roundId);
      case 'relative':
        return this.generateRelativeRound(roundId);
      case 'absolute':
        return this.generateAbsoluteRound(roundId);
      default:
        throw new Error(`Unknown mode: ${this.modeConfig.id}`);
    }
  }

  private generateOctaveRound(roundId: string): Pitch001Round {
    const notes = Object.keys(NOTE_FREQUENCIES).filter((n: string) => n.includes('3') || n.includes('4'));
    const baseNote = notes[Math.floor(Math.random() * notes.length)];
    const baseFreq = NOTE_FREQUENCIES[baseNote];
    
    let question: string;
    let answer: string;
    let options: string[];
    let audioData: any;

    if (this.difficulty === 'easy') {
      // Same or different notes
      const isSame = Math.random() > 0.5;
      const secondNote = isSame ? baseNote : notes[Math.floor(Math.random() * notes.length)];
      
      question = `Are these two notes the same or different?`;
      answer = isSame ? 'Same' : 'Different';
      options = ['Same', 'Different'];
      
      audioData = {
        type: 'two-notes',
        frequencies: [baseFreq, NOTE_FREQUENCIES[secondNote]],
        duration: 0.5
      };
    } else if (this.difficulty === 'medium') {
      // Find the octave
      const octaveUp = baseNote.replace('3', '4').replace('4', '5');
      const octaveDown = baseNote.replace('4', '3').replace('5', '4');
      const targetOctave = Math.random() > 0.5 ? octaveUp : octaveDown;
      
      question = `Which note is the octave of ${baseNote}?`;
      answer = targetOctave;
      options = [targetOctave, baseNote, notes[Math.floor(Math.random() * notes.length)]];
      
      audioData = {
        type: 'reference-and-target',
        frequencies: [baseFreq, NOTE_FREQUENCIES[targetOctave]],
        duration: 0.6
      };
    } else {
      // Identify octave relationship
      const relationships = ['Same', 'Octave Higher', 'Octave Lower'];
      const relationship = relationships[Math.floor(Math.random() * relationships.length)];
      
      let secondFreq: number;
      if (relationship === 'Same') {
        secondFreq = baseFreq;
      } else if (relationship === 'Octave Higher') {
        secondFreq = baseFreq * 2;
      } else {
        secondFreq = baseFreq / 2;
      }
      
      question = `How does the second note relate to the first?`;
      answer = relationship;
      options = relationships;
      
      audioData = {
        type: 'two-notes',
        frequencies: [baseFreq, secondFreq],
        duration: 0.6
      };
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData,
      explanation: this.getOctaveExplanation(answer),
      points: this.calculatePoints()
    };
  }

  private generateIntervalRound(roundId: string): Pitch001Round {
    const intervals = this.modeConfig.parameters.intervals[this.difficulty];
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    const baseNote = 'C4';
    const baseFreq = NOTE_FREQUENCIES[baseNote];
    const ratio = INTERVAL_RATIOS[interval];
    const secondFreq = baseFreq * ratio;

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Do the notes go up, down, or stay the same?`;
      const directions = ['Up', 'Down', 'Same'];
      answer = interval === 'unison' ? 'Same' : 'Up';
      options = directions;
    } else {
      question = `What interval do you hear?`;
      answer = interval;
      options = intervals.slice(0, Math.min(4, intervals.length));
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'interval',
        frequencies: [baseFreq, secondFreq],
        duration: 0.5
      },
      explanation: this.getIntervalExplanation(interval),
      points: this.calculatePoints()
    };
  }

  private generateBendRound(roundId: string): Pitch001Round {
    const bendRange = this.modeConfig.parameters.bendRange[this.difficulty];
    const bendAmount = bendRange[0] + Math.random() * (bendRange[1] - bendRange[0]);
    const bendDirection = Math.random() > 0.5 ? 'up' : 'down';
    
    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Does the pitch bend up or down?`;
      answer = bendDirection === 'up' ? 'Up' : 'Down';
      options = ['Up', 'Down'];
    } else if (this.difficulty === 'medium') {
      question = `How much does the pitch bend?`;
      const sizes = bendAmount < 1 ? 'Small' : bendAmount < 2 ? 'Medium' : 'Large';
      answer = sizes;
      options = ['Small', 'Medium', 'Large'];
    } else {
      question = `Recreate the pitch bend you hear`;
      answer = `${bendDirection}-${bendAmount.toFixed(2)}`;
      options = ['Match the bend'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'pitch-bend',
        frequencies: [440], // A4
        duration: 1.0,
        parameters: {
          bendAmount,
          bendDirection,
          bendType: 'exponential'
        }
      },
      explanation: this.getBendExplanation(bendDirection, bendAmount),
      points: this.calculatePoints()
    };
  }

  private generateVibratoRound(roundId: string): Pitch001Round {
    const vibratoRate = this.modeConfig.parameters.vibratoRate[this.difficulty];
    const vibratoDepth = this.modeConfig.parameters.vibratoDepth[this.difficulty];
    const rate = vibratoRate[0] + Math.random() * (vibratoRate[1] - vibratoRate[0]);
    const depth = vibratoDepth[0] + Math.random() * (vibratoDepth[1] - vibratoDepth[0]);
    const hasVibrato = Math.random() > 0.3;

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Does the note have vibrato (wobble) or is it steady?`;
      answer = hasVibrato ? 'Vibrato' : 'Steady';
      options = ['Vibrato', 'Steady'];
    } else if (this.difficulty === 'medium') {
      if (!hasVibrato) {
        question = `Is this note steady or does it have vibrato?`;
        answer = 'Steady';
        options = ['Steady', 'Slow Vibrato', 'Fast Vibrato'];
      } else {
        question = `Is the vibrato slow, medium, or fast?`;
        const speed = rate < 4 ? 'Slow' : rate < 7 ? 'Medium' : 'Fast';
        answer = `${speed} Vibrato`;
        options = ['Slow Vibrato', 'Medium Vibrato', 'Fast Vibrato'];
      }
    } else {
      question = `Match the vibrato you hear`;
      answer = `rate-${rate.toFixed(1)}-depth-${depth.toFixed(2)}`;
      options = ['Match the vibrato'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'vibrato',
        frequencies: [440],
        duration: 2.0,
        parameters: {
          hasVibrato,
          rate,
          depth,
          vibratoType: 'sine'
        }
      },
      explanation: this.getVibratoExplanation(hasVibrato, rate, depth),
      points: this.calculatePoints()
    };
  }

  private generateGlissandoRound(roundId: string): Pitch001Round {
    const glissandoRange = this.modeConfig.parameters.glissandoRange[this.difficulty];
    const range = glissandoRange[0] + Math.random() * (glissandoRange[1] - glissandoRange[0]);
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const speed = ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)];

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Does the glissando go up or down?`;
      answer = direction === 'up' ? 'Up' : 'Down';
      options = ['Up', 'Down'];
    } else {
      question = `How long is the glissando?`;
      const length = range < 2 ? 'Short' : range < 4 ? 'Medium' : 'Long';
      answer = length;
      options = ['Short', 'Medium', 'Long'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'glissando',
        frequencies: [440, 440 * Math.pow(2, range/12 * (direction === 'up' ? 1 : -1))],
        duration: speed === 'slow' ? 2.0 : speed === 'medium' ? 1.0 : 0.5,
        parameters: {
          range,
          direction,
          speed,
          glissandoType: 'continuous'
        }
      },
      explanation: this.getGlissandoExplanation(direction, range),
      points: this.calculatePoints()
    };
  }

  private generatePortamentoRound(roundId: string): Pitch001Round {
    const portamentoTime = this.modeConfig.parameters.portamentoTime[this.difficulty];
    const time = portamentoTime[0] + Math.random() * (portamentoTime[1] - portamentoTime[0]);
    const hasPortamento = Math.random() > 0.3;

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Do the notes connect smoothly or jump?`;
      answer = hasPortamento ? 'Smooth' : 'Jump';
      options = ['Smooth', 'Jump'];
    } else {
      question = `How fast is the portamento?`;
      const speed = time < 0.1 ? 'Fast' : time < 0.3 ? 'Medium' : 'Slow';
      answer = speed;
      options = ['Fast', 'Medium', 'Slow'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'portamento',
        frequencies: [440, 554.37], // A4 to C#5
        duration: 1.0,
        parameters: {
          hasPortamento,
          portamentoTime: time,
          curve: 'exponential'
        }
      },
      explanation: this.getPortamentoExplanation(hasPortamento, time),
      points: this.calculatePoints()
    };
  }

  private generateEnvelopeRound(roundId: string): Pitch001Round {
    const envelopeTypes = this.modeConfig.parameters.envelopeTypes[this.difficulty];
    const envelopeType = envelopeTypes[Math.floor(Math.random() * envelopeTypes.length)];

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Does the sound start suddenly or fade in?`;
      answer = envelopeType === 'percussive' ? 'Sudden' : 'Fade In';
      options = ['Sudden', 'Fade In'];
    } else if (this.difficulty === 'medium') {
      question = `What part of the sound is most prominent?`;
      const parts = ['Attack', 'Decay', 'Sustain', 'Release'];
      answer = parts[Math.floor(Math.random() * parts.length)];
      options = parts;
    } else {
      question = `Match the envelope shape you hear`;
      answer = envelopeType;
      options = ['Match the envelope'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'envelope',
        frequencies: [440],
        duration: 2.0,
        parameters: {
          envelopeType,
          attackTime: envelopeType === 'percussive' ? 0.01 : 0.5,
          decayTime: 0.2,
          sustainLevel: 0.7,
          releaseTime: 0.3
        }
      },
      explanation: this.getEnvelopeExplanation(envelopeType),
      points: this.calculatePoints()
    };
  }

  private generateHarmonicRound(roundId: string): Pitch001Round {
    const harmonicSeries = this.modeConfig.parameters.harmonicSeries[this.difficulty];
    const numHarmonics = harmonicSeries[1];
    const hasHarmonics = Math.random() > 0.3;

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Is this a pure tone or does it have overtones?`;
      answer = hasHarmonics ? 'Overtones' : 'Pure Tone';
      options = ['Pure Tone', 'Overtones'];
    } else {
      question = `How many harmonics do you hear?`;
      const count = hasHarmonics ? Math.floor(Math.random() * 4) + 1 : 0;
      answer = count.toString();
      options = ['0', '1', '2', '3', '4+'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'harmonics',
        frequencies: hasHarmonics ? [220, 440, 660, 880].slice(0, numHarmonics) : [440],
        duration: 1.5,
        parameters: {
          hasHarmonics,
          harmonicType: 'sawtooth',
          fundamentalFreq: 220
        }
      },
      explanation: this.getHarmonicExplanation(hasHarmonics),
      points: this.calculatePoints()
    };
  }

  private generateRelativeRound(roundId: string): Pitch001Round {
    const referenceTypes = this.modeConfig.parameters.referenceTypes;
    const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
    const intervalComplexity = this.modeConfig.parameters.intervalComplexity[this.difficulty];
    const complexity = intervalComplexity[Math.floor(Math.random() * intervalComplexity.length)];

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `Is the second note higher or lower than the first?`;
      answer = Math.random() > 0.5 ? 'Higher' : 'Lower';
      options = ['Higher', 'Lower', 'Same'];
    } else {
      question = `What interval is between the notes?`;
      const intervals = ['Second', 'Third', 'Fourth', 'Fifth'];
      answer = intervals[Math.floor(Math.random() * intervals.length)];
      options = intervals;
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'relative-pitch',
        frequencies: [440, 440 * INTERVAL_RATIOS['third']],
        duration: 0.5
      },
      explanation: this.getRelativeExplanation(answer),
      points: this.calculatePoints()
    };
  }

  private generateAbsoluteRound(roundId: string): Pitch001Round {
    const noteSet: string[] = this.modeConfig.parameters.noteSet[this.difficulty];
    const note = noteSet[Math.floor(Math.random() * noteSet.length)];
    const octaveRange: number[] = this.modeConfig.parameters.octaveRange[this.difficulty];
    const octave = octaveRange[0] + Math.floor(Math.random() * (octaveRange[1] - octaveRange[0] + 1));
    const fullNote = `${note}${octave}`;

    let question: string;
    let answer: string;
    let options: string[];

    if (this.difficulty === 'easy') {
      question = `What note are you hearing?`;
      answer = note;
      options = noteSet.slice(0, Math.min(4, noteSet.length));
    } else if (this.difficulty === 'medium') {
      question = `Identify the exact note (including octave)?`;
      answer = fullNote;
      options = noteSet.map(n => `${n}${octave}`).slice(0, 4);
    } else {
      question = `What note and chord quality are you hearing?`;
      answer = `${note} Major`;
      options = ['C Major', 'D Minor', 'E Major', 'F Minor'];
    }

    return {
      id: roundId,
      modeId: this.modeConfig.id,
      difficulty: this.difficulty,
      question,
      answer,
      options,
      audioData: {
        type: 'absolute-pitch',
        frequencies: [NOTE_FREQUENCIES[fullNote] || 440],
        duration: 1.0
      },
      explanation: this.getAbsoluteExplanation(fullNote),
      points: this.calculatePoints()
    };
  }

  private calculatePoints(): number {
    const basePoints = { easy: 10, medium: 20, hard: 30 };
    return basePoints[this.difficulty];
  }

  private getOctaveExplanation(answer: string): string {
    const explanations: { [key: string]: string } = {
      'Same': 'Both notes are exactly the same pitch.',
      'Different': 'The notes have different pitches.',
      'Octave Higher': 'The second note is one octave higher - double the frequency.',
      'Octave Lower': 'The second note is one octave lower - half the frequency.'
    };
    return explanations[answer] || 'Listen carefully to the relationship between the notes.';
  }

  private getIntervalExplanation(interval: string): string {
    const explanations: { [key: string]: string } = {
      'unison': 'Both notes are the same pitch.',
      'second': 'A small step between notes.',
      'third': 'A medium leap that creates harmony.',
      'fourth': 'A strong, stable interval.',
      'fifth': 'A powerful, consonant interval.',
      'sixth': 'A melodic, pleasing interval.',
      'seventh': 'A tense interval that wants to resolve.',
      'octave': 'The same note but higher or lower.'
    };
    return explanations[interval] || `This is a ${interval} interval.`;
  }

  private getBendExplanation(direction: string, amount: number): string {
    return `The pitch bends ${direction} by ${amount.toFixed(1)} semitones, creating a expressive effect.`;
  }

  private getVibratoExplanation(hasVibrato: boolean, rate: number, depth: number): string {
    if (hasVibrato) {
      return `The note has vibrato - a rapid pulsing at ${rate.toFixed(1)} Hz with ${depth.toFixed(2)} semitone depth.`;
    }
    return 'The note is steady without vibrato.';
  }

  private getGlissandoExplanation(direction: string, range: number): string {
    return `The glissando slides ${direction} through ${range.toFixed(1)} semitones, creating a smooth pitch transition.`;
  }

  private getPortamentoExplanation(hasPortamento: boolean, time: number): string {
    if (hasPortamento) {
      return `The notes connect with portamento over ${time.toFixed(2)} seconds, creating a smooth glide.`;
    }
    return 'The notes jump between pitches without connecting.';
  }

  private getEnvelopeExplanation(envelopeType: string): string {
    const explanations: { [key: string]: string } = {
      'percussive': 'A sharp attack with quick decay, like a drum or plucked string.',
      'smooth': 'A gentle attack with sustained sound, like a bowed string.',
      'sustained': 'A long-held sound with steady amplitude.',
      'complex': 'Multiple phases with changing dynamics.'
    };
    return explanations[envelopeType] || `This sound has a ${envelopeType} envelope.`;
  }

  private getHarmonicExplanation(hasHarmonics: boolean): string {
    if (hasHarmonics) {
      return 'The tone contains overtones - additional frequencies that give it richness and character.';
    }
    return 'This is a pure sine wave with no overtones.';
  }

  private getRelativeExplanation(answer: string): string {
    return `The interval between the notes creates the musical relationship of ${answer}.`;
  }

  private getAbsoluteExplanation(note: string): string {
    return `This is the note ${note}, which has a frequency of ${NOTE_FREQUENCIES[note]?.toFixed(2) || '440.00'} Hz.`;
  }

  validateAnswer(selectedAnswer: string, correctAnswer: string): boolean {
    return selectedAnswer === correctAnswer;
  }

  getModeConfig(): Pitch001ModeConfig {
    return this.modeConfig;
  }
}

export function createPitch001Game(modeId: string, difficulty: 'easy' | 'medium' | 'hard'): Pitch001Game {
  return new Pitch001Game(modeId, difficulty);
}

export function getPitch001ModeConfig(modeId: string): Pitch001ModeConfig | undefined {
  return pitch001Modes.find(mode => mode.id === modeId);
}