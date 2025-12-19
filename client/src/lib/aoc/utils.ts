/**
 * Animal Orchestra Conductor - Utility Functions
 * Helper functions and constants for the AOC game
 */

import type { OrchestraLayer } from './types';
import { ORCHESTRA_SEATS, INSTRUMENT_PART_VARIATIONS, PART_VARIATIONS } from './data';

/**
 * Keyboard hotkey mappings for seat selection
 * 1-9 = seats 1-9, 0 = seat 10, QWERTYUI = seats 11-18
 */
export const SEAT_HOTKEYS: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6,
  '8': 7,
  '9': 8,
  '0': 9,
  q: 10,
  w: 11,
  e: 12,
  r: 13,
  t: 14,
  y: 15,
  u: 16,
  i: 17,
};

/**
 * Creates the initial layers state from orchestra seat configurations
 */
export function createInitialLayers(): OrchestraLayer[] {
  return ORCHESTRA_SEATS.map((seat) => ({
    id: seat.id,
    name: seat.name,
    family: seat.family,
    seat: seat.seat,
    instrumentName: seat.instrumentName,
    animal: seat.animal,
    emoji: seat.emoji,
    color: seat.color,
    bgColor: seat.bgColor,
    isPlaying: false,
    volume: seat.defaultVolume,
    currentNoteIndex: 0,
    character: seat.character ?? null,
    description: seat.description,
    selectedPart: 'A',
    variations: INSTRUMENT_PART_VARIATIONS[seat.instrumentName] ?? PART_VARIATIONS.melody,
  }));
}
