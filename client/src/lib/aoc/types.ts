/**
 * Animal Orchestra Conductor - Type Definitions
 */

// Part variation identifier (A-F variations per instrument)
export type PartId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// Instrument family categories
export type InstrumentFamily = 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'color';

// Character types for animal musicians
export type CharacterType = 'bird' | 'lion' | 'monkey' | null;

// Seat positioning information
export interface SeatPosition {
  row: number;
  xPct: number;
  yPct: number;
  scale: number;
  zIndex: number;
}

// Musical variation for an instrument part
export interface PartVariation {
  id: PartId;
  name: string;
  description: string;
  notes: string[];
  pattern: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// Pre-made arrangement preset for exploration
export interface PresetArrangement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  layers: Record<string, boolean>;
  parts: Record<string, PartId>;
  tempo: number;
}

// Orchestra layer state (runtime representation of a musician/section)
export interface OrchestraLayer {
  id: string;
  name: string;
  family: InstrumentFamily;
  seat: SeatPosition;
  instrumentName: string;
  animal: string;
  emoji: string;
  color: string;
  bgColor: string;
  isPlaying: boolean;
  volume: number;
  currentNoteIndex: number;
  character?: CharacterType;
  description: string;
  selectedPart: PartId;
  variations: PartVariation[];
}

// Configuration template for orchestra seats (used to initialize layers)
export interface OrchestraSeatConfig {
  id: string;
  name: string;
  family: InstrumentFamily;
  instrumentName: string;
  animal: string;
  emoji: string;
  color: string;
  bgColor: string;
  character?: CharacterType;
  description: string;
  defaultVolume: number;
  seat: SeatPosition;
}

// Learning tip for an instrument
export interface InstrumentTip {
  title: string;
  facts: string[];
}
