/**
 * Preset configurations for Sight Reading Randomizer
 * Combines rhythm settings with sight reading specific settings
 */

import { DifficultyPreset, RhythmSettings } from '@/lib/rhythmRandomizer/types';
import { SightReadingSettings } from '@/lib/sightReadingRandomizer/types';

export interface SightReadingPreset {
  name: string;
  description: string;
  rhythm: Partial<RhythmSettings>;
  sightReading: Partial<SightReadingSettings>;
}

export const SIGHT_READING_PRESETS: Record<DifficultyPreset, SightReadingPreset> = {
  beginner: {
    name: 'Beginner',
    description: 'Quarter & half notes, stepwise motion',
    rhythm: {
      timeSignature: '4/4',
      tempo: 60,
      measureCount: 2,
      allowedNoteValues: ['quarter', 'half'],
      allowedRestValues: ['quarterRest'],
      includeTriplets: false,
      syncopationProbability: 0,
      noteDensity: 'sparse',
      restProbability: 10,
      swingAmount: 0,
    },
    sightReading: {
      keySignature: 'C',
      melodicDifficulty: 'easy',
      tonicGravity: 70,
      pitchSyllableSystem: 'moveableDo',
    },
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Add eighth notes & small leaps',
    rhythm: {
      timeSignature: '4/4',
      tempo: 80,
      measureCount: 4,
      allowedNoteValues: ['quarter', 'half', 'eighth', 'twoEighths'],
      allowedRestValues: ['quarterRest', 'eighthRest'],
      includeTriplets: false,
      syncopationProbability: 25,
      noteDensity: 'medium',
      restProbability: 15,
      swingAmount: 0,
    },
    sightReading: {
      keySignature: 'G',
      melodicDifficulty: 'medium',
      tonicGravity: 50,
      pitchSyllableSystem: 'moveableDo',
    },
  },
  advanced: {
    name: 'Advanced',
    description: 'All note values & larger intervals',
    rhythm: {
      timeSignature: '4/4',
      tempo: 100,
      measureCount: 4,
      allowedNoteValues: ['quarter', 'half', 'eighth', 'sixteenth', 'twoEighths', 'fourSixteenths'],
      allowedRestValues: ['quarterRest', 'eighthRest', 'sixteenthRest'],
      includeTriplets: true,
      syncopationProbability: 40,
      noteDensity: 'dense',
      restProbability: 20,
      accentProbability: 30,
      tieProbability: 15,
      swingAmount: 0,
    },
    sightReading: {
      keySignature: 'D',
      melodicDifficulty: 'hard',
      tonicGravity: 30,
      pitchSyllableSystem: 'moveableDo',
    },
  },
  custom: {
    name: 'Custom',
    description: 'Use your current settings',
    rhythm: {},
    sightReading: {},
  },
};
