// Universal Instrument Library for Educational Music Games
// Manages Philharmonia Orchestra samples and provides easy access across all games

export type InstrumentFamily = 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'keyboards';
export type Note = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Accidental = '' | 'sharp' | 'flat';
export type Dynamic = 'piano' | 'mezzo-piano' | 'mezzo-forte' | 'forte' | 'fortissimo';
export type Articulation = 'normal' | 'staccato' | 'legato' | 'pizzicato' | 'tremolo';

export interface InstrumentSample {
  instrument: string;
  family: InstrumentFamily;
  note: string;         // e.g., "C5", "E4"
  octave: Octave;
  frequency: number;    // Hz
  dynamic: Dynamic;
  articulation: Articulation;
  filename: string;
  path: string;         // Relative to /audio/
  duration?: number;    // In seconds (if known)
  animalCharacter?: string; // For kids' games (e.g., "Bird", "Bear")
  emoji?: string;       // For visual representation
}

export interface Instrument {
  name: string;
  family: InstrumentFamily;
  displayName: string;
  description: string;
  range: { low: string; high: string }; // Note range (e.g., "C2" to "C7")
  animalCharacter?: string;
  emoji?: string;
  samples: InstrumentSample[];
}

/**
 * Complete Philharmonia Orchestra Instrument Library
 */
export class InstrumentLibrary {
  private static instance: InstrumentLibrary;
  private instruments: Map<string, Instrument> = new Map();

  private constructor() {
    this.initializeLibrary();
  }

  public static getInstance(): InstrumentLibrary {
    if (!InstrumentLibrary.instance) {
      InstrumentLibrary.instance = new InstrumentLibrary();
    }
    return InstrumentLibrary.instance;
  }

  private initializeLibrary() {
    // STRINGS FAMILY
    this.registerInstrument({
      name: 'violin',
      family: 'strings',
      displayName: 'Violin',
      description: 'High-pitched string instrument, played with a bow',
      range: { low: 'G3', high: 'A7' },
      animalCharacter: 'Bird',
      emoji: '🐦',
      samples: [
        {
          instrument: 'violin',
          family: 'strings',
          note: 'C5',
          octave: 5,
          frequency: 523,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'violin_C5_05_forte_arco-normal.mp3',
          path: 'philharmonia/strings/violin/violin_C5_05_forte_arco-normal.mp3',
        },
        {
          instrument: 'violin',
          family: 'strings',
          note: 'D5',
          octave: 5,
          frequency: 587,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'violin_D5_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/violin/violin_D5_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'violin',
          family: 'strings',
          note: 'E5',
          octave: 5,
          frequency: 659,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'violin_E5_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/violin/violin_E5_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'violin',
          family: 'strings',
          note: 'G4',
          octave: 4,
          frequency: 392,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'violin_G4_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/violin/violin_G4_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'violin',
          family: 'strings',
          note: 'A4',
          octave: 4,
          frequency: 440,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'violin_A4_05_forte_arco-normal.mp3',
          path: 'philharmonia/strings/violin/violin_A4_05_forte_arco-normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'cello',
      family: 'strings',
      displayName: 'Cello',
      description: 'Low-pitched string instrument, warm and rich tone',
      range: { low: 'C2', high: 'C6' },
      animalCharacter: 'Bear',
      emoji: '🐻',
      samples: [
        // Full diatonic scale in cello range for rich harmonies
        {
          instrument: 'cello',
          family: 'strings',
          note: 'A2',
          octave: 2,
          frequency: 110,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_A2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_A2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'B2',
          octave: 2,
          frequency: 123,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_B2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_B2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'C3',
          octave: 3,
          frequency: 131,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_C3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_C3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'D3',
          octave: 3,
          frequency: 147,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_D3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_D3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'E3',
          octave: 3,
          frequency: 165,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_E3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_E3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'F3',
          octave: 3,
          frequency: 175,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_F3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_F3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'G3',
          octave: 3,
          frequency: 196,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_G3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_G3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'A3',
          octave: 3,
          frequency: 220,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_A3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_A3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'cello',
          family: 'strings',
          note: 'C4',
          octave: 4,
          frequency: 262,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'cello_C4_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/cello/cello_C4_1_forte_arco-normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'viola',
      family: 'strings',
      displayName: 'Viola',
      description: 'Mid-range string instrument with a warm, mellow tone',
      range: { low: 'C3', high: 'E6' },
      animalCharacter: 'Fox',
      emoji: '🦊',
      samples: [
        {
          instrument: 'viola',
          family: 'strings',
          note: 'C3',
          octave: 3,
          frequency: 131,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'viola_C3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/viola/viola_C3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'viola',
          family: 'strings',
          note: 'A3',
          octave: 3,
          frequency: 220,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'viola_A3_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/viola/viola_A3_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'viola',
          family: 'strings',
          note: 'C5',
          octave: 5,
          frequency: 523,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'viola_C5_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/viola/viola_C5_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'viola',
          family: 'strings',
          note: 'A4',
          octave: 4,
          frequency: 440,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'viola_A4_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/viola/viola_A4_1_forte_arco-normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'double-bass',
      family: 'strings',
      displayName: 'Double Bass',
      description: 'Deepest string instrument, provides the foundation',
      range: { low: 'E1', high: 'G4' },
      animalCharacter: 'Whale',
      emoji: '🐋',
      samples: [
        // Expanded bass range for chord progressions
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'A1',
          octave: 1,
          frequency: 55,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_A1_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_A1_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'B1',
          octave: 1,
          frequency: 62,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_B1_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_B1_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'C2',
          octave: 2,
          frequency: 65,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_C2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_C2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'D2',
          octave: 2,
          frequency: 73,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_D2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_D2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'E2',
          octave: 2,
          frequency: 82,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_E2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_E2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'F2',
          octave: 2,
          frequency: 87,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_F2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_F2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'G2',
          octave: 2,
          frequency: 98,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_G2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_G2_1_forte_arco-normal.mp3',
        },
        {
          instrument: 'double-bass',
          family: 'strings',
          note: 'A2',
          octave: 2,
          frequency: 110,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'double-bass_A2_1_forte_arco-normal.mp3',
          path: 'philharmonia/strings/double bass/double-bass_A2_1_forte_arco-normal.mp3',
        },
      ],
    });

    // WOODWINDS FAMILY
    this.registerInstrument({
      name: 'flute',
      family: 'woodwinds',
      displayName: 'Flute',
      description: 'High, bright woodwind instrument',
      range: { low: 'C4', high: 'D7' },
      animalCharacter: 'Butterfly',
      emoji: '🦋',
      samples: [
        // Full diatonic scale plus common chord tones for rich harmonies
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'C5',
          octave: 5,
          frequency: 523,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_C5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_C5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'D5',
          octave: 5,
          frequency: 587,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_D5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_D5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'E5',
          octave: 5,
          frequency: 659,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_E5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_E5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'F5',
          octave: 5,
          frequency: 698,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_F5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_F5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'G5',
          octave: 5,
          frequency: 784,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_G5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_G5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'A5',
          octave: 5,
          frequency: 880,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_A5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_A5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'B5',
          octave: 5,
          frequency: 988,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_B5_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_B5_1_forte_normal.mp3',
        },
        {
          instrument: 'flute',
          family: 'woodwinds',
          note: 'C6',
          octave: 6,
          frequency: 1047,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'flute_C6_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/flute/flute_C6_1_forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'clarinet',
      family: 'woodwinds',
      displayName: 'Clarinet',
      description: 'Versatile woodwind with a warm, woody tone',
      range: { low: 'D3', high: 'A6' },
      animalCharacter: 'Cat',
      emoji: '🐱',
      samples: [
        {
          instrument: 'clarinet',
          family: 'woodwinds',
          note: 'C4',
          octave: 4,
          frequency: 262,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'clarinet_C4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/clarinet/clarinet_C4_1_forte_normal.mp3',
        },
        {
          instrument: 'clarinet',
          family: 'woodwinds',
          note: 'E4',
          octave: 4,
          frequency: 330,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'clarinet_E4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/clarinet/clarinet_E4_1_forte_normal.mp3',
        },
        {
          instrument: 'clarinet',
          family: 'woodwinds',
          note: 'G4',
          octave: 4,
          frequency: 392,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'clarinet_G4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/clarinet/clarinet_G4_1_forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'oboe',
      family: 'woodwinds',
      displayName: 'Oboe',
      description: 'Double-reed woodwind with a distinctive, penetrating tone',
      range: { low: 'B3', high: 'G6' },
      animalCharacter: 'Duck',
      emoji: '🦆',
      samples: [
        {
          instrument: 'oboe',
          family: 'woodwinds',
          note: 'C4',
          octave: 4,
          frequency: 262,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'oboe_C4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/oboe/oboe_C4_1_forte_normal.mp3',
        },
        {
          instrument: 'oboe',
          family: 'woodwinds',
          note: 'E4',
          octave: 4,
          frequency: 330,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'oboe_E4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/oboe/oboe_E4_1_forte_normal.mp3',
        },
        {
          instrument: 'oboe',
          family: 'woodwinds',
          note: 'G4',
          octave: 4,
          frequency: 392,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'oboe_G4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/oboe/oboe_G4_1_forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'bassoon',
      family: 'woodwinds',
      displayName: 'Bassoon',
      description: 'Deep, rich double-reed woodwind with a distinctive voice',
      range: { low: 'Bb1', high: 'Eb5' },
      animalCharacter: 'Owl',
      emoji: '🦉',
      samples: [
        {
          instrument: 'bassoon',
          family: 'woodwinds',
          note: 'A2',
          octave: 2,
          frequency: 110,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'bassoon_A2_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/bassoon/bassoon_A2_1_forte_normal.mp3',
        },
        {
          instrument: 'bassoon',
          family: 'woodwinds',
          note: 'C3',
          octave: 3,
          frequency: 131,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'bassoon_C3_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/bassoon/bassoon_C3_1_forte_normal.mp3',
        },
        {
          instrument: 'bassoon',
          family: 'woodwinds',
          note: 'E3',
          octave: 3,
          frequency: 165,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'bassoon_E3_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/bassoon/bassoon_E3_1_forte_normal.mp3',
        },
        {
          instrument: 'bassoon',
          family: 'woodwinds',
          note: 'G3',
          octave: 3,
          frequency: 196,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'bassoon_G3_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/bassoon/bassoon_G3_1_forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'saxophone',
      family: 'woodwinds',
      displayName: 'Saxophone',
      description: 'Expressive brass-bodied woodwind with a rich, smooth tone',
      range: { low: 'Bb3', high: 'F6' },
      animalCharacter: 'Peacock',
      emoji: '🦚',
      samples: [
        {
          instrument: 'saxophone',
          family: 'woodwinds',
          note: 'C4',
          octave: 4,
          frequency: 262,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'saxophone_C4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/saxophone/saxophone_C4_1_forte_normal.mp3',
        },
        {
          instrument: 'saxophone',
          family: 'woodwinds',
          note: 'E4',
          octave: 4,
          frequency: 330,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'saxophone_E4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/saxophone/saxophone_E4_1_forte_normal.mp3',
        },
        {
          instrument: 'saxophone',
          family: 'woodwinds',
          note: 'G4',
          octave: 4,
          frequency: 392,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'saxophone_G4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/saxophone/saxophone_G4_1_forte_normal.mp3',
        },
        {
          instrument: 'saxophone',
          family: 'woodwinds',
          note: 'A4',
          octave: 4,
          frequency: 440,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'saxophone_A4_1_forte_normal.mp3',
          path: 'philharmonia/woodwinds/saxophone/saxophone_A4_1_forte_normal.mp3',
        },
      ],
    });

    // BRASS FAMILY
    this.registerInstrument({
      name: 'trumpet',
      family: 'brass',
      displayName: 'Trumpet',
      description: 'Bright, powerful brass instrument',
      range: { low: 'E3', high: 'C6' },
      animalCharacter: 'Rooster',
      emoji: '🐓',
      samples: [
        {
          instrument: 'trumpet',
          family: 'brass',
          note: 'C4',
          octave: 4,
          frequency: 262,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'trumpet_C4_1_forte_normal.mp3',
          path: 'philharmonia/brass/trumpet/trumpet_C4_1_forte_normal.mp3',
        },
        {
          instrument: 'trumpet',
          family: 'brass',
          note: 'E4',
          octave: 4,
          frequency: 330,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'trumpet_E4_1_forte_normal.mp3',
          path: 'philharmonia/brass/trumpet/trumpet_E4_1_forte_normal.mp3',
        },
        {
          instrument: 'trumpet',
          family: 'brass',
          note: 'G4',
          octave: 4,
          frequency: 392,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'trumpet_G4_1_forte_normal.mp3',
          path: 'philharmonia/brass/trumpet/trumpet_G4_1_forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'french-horn',
      family: 'brass',
      displayName: 'French Horn',
      description: 'Mellow brass instrument with a noble sound',
      range: { low: 'B1', high: 'F5' },
      animalCharacter: 'Deer',
      emoji: '🦌',
      samples: [
        {
          instrument: 'french-horn',
          family: 'brass',
          note: 'C3',
          octave: 3,
          frequency: 131,
          dynamic: 'mezzo-forte',
          articulation: 'normal',
          filename: 'french-horn_C3_1_mezzo-forte_normal.mp3',
          path: 'philharmonia/brass/french horn/french-horn_C3_1_mezzo-forte_normal.mp3',
        },
        {
          instrument: 'french-horn',
          family: 'brass',
          note: 'E3',
          octave: 3,
          frequency: 165,
          dynamic: 'mezzo-forte',
          articulation: 'normal',
          filename: 'french-horn_E3_1_mezzo-forte_normal.mp3',
          path: 'philharmonia/brass/french horn/french-horn_E3_1_mezzo-forte_normal.mp3',
        },
        {
          instrument: 'french-horn',
          family: 'brass',
          note: 'G3',
          octave: 3,
          frequency: 196,
          dynamic: 'mezzo-forte',
          articulation: 'normal',
          filename: 'french-horn_G3_1_mezzo-forte_normal.mp3',
          path: 'philharmonia/brass/french horn/french-horn_G3_1_mezzo-forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'trombone',
      family: 'brass',
      displayName: 'Trombone',
      description: 'Powerful bass brass instrument with a slide',
      range: { low: 'E2', high: 'F5' },
      animalCharacter: 'Lion',
      emoji: '🦁',
      samples: [
        {
          instrument: 'trombone',
          family: 'brass',
          note: 'C3',
          octave: 3,
          frequency: 131,
          dynamic: 'mezzo-forte',
          articulation: 'normal',
          filename: 'trombone_C3_1_mezzo-forte_normal.mp3',
          path: 'philharmonia/brass/trombone/trombone_C3_1_mezzo-forte_normal.mp3',
        },
        {
          instrument: 'trombone',
          family: 'brass',
          note: 'E3',
          octave: 3,
          frequency: 165,
          dynamic: 'mezzo-forte',
          articulation: 'normal',
          filename: 'trombone_E3_1_mezzo-forte_normal.mp3',
          path: 'philharmonia/brass/trombone/trombone_E3_1_mezzo-forte_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'tuba',
      family: 'brass',
      displayName: 'Tuba',
      description: 'Deep, powerful brass instrument providing the foundation',
      range: { low: 'E1', high: 'F4' },
      animalCharacter: 'Elephant',
      emoji: '🐘',
      samples: [
        {
          instrument: 'tuba',
          family: 'brass',
          note: 'A1',
          octave: 1,
          frequency: 55,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'tuba_A1_1_forte_normal.mp3',
          path: 'philharmonia/brass/tuba/tuba_A1_1_forte_normal.mp3',
        },
        {
          instrument: 'tuba',
          family: 'brass',
          note: 'A2',
          octave: 2,
          frequency: 110,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'tuba_A2_1_forte_normal.mp3',
          path: 'philharmonia/brass/tuba/tuba_A2_1_forte_normal.mp3',
        },
      ],
    });

    // PERCUSSION FAMILY
    this.registerInstrument({
      name: 'timpani',
      family: 'percussion',
      displayName: 'Timpani',
      description: 'Large tuned drums, dramatic and powerful',
      range: { low: 'D2', high: 'A3' },
      animalCharacter: 'Elephant',
      emoji: '🐘',
      samples: [
        {
          instrument: 'timpani',
          family: 'percussion',
          note: 'C2',
          octave: 2,
          frequency: 65,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'timpani_C2_forte_hits_normal.mp3',
          path: 'philharmonia/percussion/timpani/timpani_C2_forte_hits_normal.mp3',
        },
        {
          instrument: 'timpani',
          family: 'percussion',
          note: 'E2',
          octave: 2,
          frequency: 82,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'timpani_E2_forte_hits_normal.mp3',
          path: 'philharmonia/percussion/timpani/timpani_E2_forte_hits_normal.mp3',
        },
        {
          instrument: 'timpani',
          family: 'percussion',
          note: 'G2',
          octave: 2,
          frequency: 98,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'timpani_G2_forte_hits_normal.mp3',
          path: 'philharmonia/percussion/timpani/timpani_G2_forte_hits_normal.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'bass-drum',
      family: 'percussion',
      displayName: 'Bass Drum',
      description: 'Large, deep drum providing powerful accents',
      range: { low: 'A0', high: 'A0' },
      animalCharacter: 'Hippo',
      emoji: '🦛',
      samples: [
        {
          instrument: 'bass-drum',
          family: 'percussion',
          note: 'A0',
          octave: 0,
          frequency: 27.5,
          dynamic: 'fortissimo',
          articulation: 'normal',
          filename: 'bass-drum__1_fortissimo_struck-singly.mp3',
          path: 'philharmonia/percussion/bass drum/bass-drum__1_fortissimo_struck-singly.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'snare-drum',
      family: 'percussion',
      displayName: 'Snare Drum',
      description: 'Crisp, sharp drum with rattling wires',
      range: { low: 'A1', high: 'A1' },
      animalCharacter: 'Monkey',
      emoji: '🐵',
      samples: [
        {
          instrument: 'snare-drum',
          family: 'percussion',
          note: 'A1',
          octave: 1,
          frequency: 55,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'snare-drum__025_forte_with-snares.mp3',
          path: 'philharmonia/percussion/snare drum/snare-drum__025_forte_with-snares.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'glockenspiel',
      family: 'percussion',
      displayName: 'Glockenspiel',
      description: 'Bright, bell-like metallic percussion',
      range: { low: 'G5', high: 'C8' },
      animalCharacter: 'Fairy',
      emoji: '🧚',
      samples: [
        {
          instrument: 'glockenspiel',
          family: 'percussion',
          note: 'C6',
          octave: 6,
          frequency: 1047,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'glockenspiel_C6_forte.mp3',
          path: 'philharmonia/percussion/glockenspiel/glockenspiel_C6_forte.mp3',
        },
        {
          instrument: 'glockenspiel',
          family: 'percussion',
          note: 'E6',
          octave: 6,
          frequency: 1319,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'glockenspiel_E6_forte.mp3',
          path: 'philharmonia/percussion/glockenspiel/glockenspiel_E6_forte.mp3',
        },
        {
          instrument: 'glockenspiel',
          family: 'percussion',
          note: 'G6',
          octave: 6,
          frequency: 1568,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'glockenspiel_G6_forte.mp3',
          path: 'philharmonia/percussion/glockenspiel/glockenspiel_G6_forte.mp3',
        },
      ],
    });

    this.registerInstrument({
      name: 'xylophone',
      family: 'percussion',
      displayName: 'Xylophone',
      description: 'Bright wooden percussion, cheerful and clear',
      range: { low: 'C4', high: 'C7' },
      animalCharacter: 'Parrot',
      emoji: '🦜',
      samples: [
        {
          instrument: 'xylophone',
          family: 'percussion',
          note: 'C5',
          octave: 5,
          frequency: 523,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'xylophone_C5_forte.mp3',
          path: 'philharmonia/percussion/xylophone/xylophone_C5_forte.mp3',
        },
        {
          instrument: 'xylophone',
          family: 'percussion',
          note: 'E5',
          octave: 5,
          frequency: 659,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'xylophone_E5_forte.mp3',
          path: 'philharmonia/percussion/xylophone/xylophone_E5_forte.mp3',
        },
        {
          instrument: 'xylophone',
          family: 'percussion',
          note: 'G5',
          octave: 5,
          frequency: 784,
          dynamic: 'forte',
          articulation: 'normal',
          filename: 'xylophone_G5_forte.mp3',
          path: 'philharmonia/percussion/xylophone/xylophone_G5_forte.mp3',
        },
      ],
    });
  }

  private registerInstrument(instrument: Instrument) {
    this.instruments.set(instrument.name, instrument);
  }

  /**
   * Get an instrument by name
   */
  getInstrument(name: string): Instrument | undefined {
    return this.instruments.get(name);
  }

  /**
   * Get all instruments in a family
   */
  getInstrumentsByFamily(family: InstrumentFamily): Instrument[] {
    return Array.from(this.instruments.values()).filter(
      inst => inst.family === family
    );
  }

  /**
   * Get all instruments
   */
  getAllInstruments(): Instrument[] {
    return Array.from(this.instruments.values());
  }

  /**
   * Get a specific sample from an instrument
   */
  getSample(instrumentName: string, note: string): InstrumentSample | undefined {
    const instrument = this.instruments.get(instrumentName);
    if (!instrument) return undefined;

    return instrument.samples.find(s => s.note === note);
  }

  /**
   * Get all samples for an instrument
   */
  getSamples(instrumentName: string): InstrumentSample[] {
    const instrument = this.instruments.get(instrumentName);
    return instrument?.samples || [];
  }

  /**
   * Get sample path for loading (uses BASE_URL for deployment compatibility)
   */
  getSamplePath(instrumentName: string, note: string): string | undefined {
    const sample = this.getSample(instrumentName, note);
    if (!sample) return undefined;
    const basePath = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL 
      ? import.meta.env.BASE_URL 
      : '/';
    return `${basePath}audio/${sample.path}`;
  }

  /**
   * Get all available sample paths for an instrument
   */
  getSamplePaths(instrumentName: string): string[] {
    const samples = this.getSamples(instrumentName);
    const basePath = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL 
      ? import.meta.env.BASE_URL 
      : '/';
    return samples.map(s => `${basePath}audio/${s.path}`);
  }

  /**
   * Get instruments by animal character (for kids' games)
   */
  getInstrumentByAnimal(animal: string): Instrument | undefined {
    return Array.from(this.instruments.values()).find(
      inst => inst.animalCharacter === animal
    );
  }

  /**
   * Get a random instrument from a family
   */
  getRandomInstrument(family?: InstrumentFamily): Instrument {
    const pool = family
      ? this.getInstrumentsByFamily(family)
      : this.getAllInstruments();

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  /**
   * Get sample name (for use with sampleAudioService)
   */
  getSampleName(instrumentName: string, note: string): string {
    return `${instrumentName}-${note.toLowerCase()}`;
  }
}

// Singleton export
export const instrumentLibrary = InstrumentLibrary.getInstance();

// Helper functions for common use cases
export const getInstrumentSamples = (instrumentName: string) => {
  return instrumentLibrary.getSamples(instrumentName);
};

export const getInstrumentSamplePath = (instrumentName: string, note: string) => {
  return instrumentLibrary.getSamplePath(instrumentName, note);
};

export const getAllInstruments = () => {
  return instrumentLibrary.getAllInstruments();
};

export const getInstrumentsByFamily = (family: InstrumentFamily) => {
  return instrumentLibrary.getInstrumentsByFamily(family);
};
