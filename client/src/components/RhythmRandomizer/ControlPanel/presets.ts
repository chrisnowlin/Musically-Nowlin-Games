/**
 * Rhythm Presets for Rhythm Randomizer V3
 * Defines difficulty presets with rhythm-specific settings
 */

import { DifficultyPreset, RhythmSettings } from '@/lib/rhythmRandomizer/types';

export interface RhythmPresetConfig {
  name: string;
  rhythm: Partial<RhythmSettings>;
}

export const RHYTHM_PRESETS: Record<DifficultyPreset, RhythmPresetConfig> = {
  beginner: {
    name: 'Beginner',
    rhythm: {
      timeSignature: '4/4',
      measureCount: 2,
      allowedNoteValues: ['quarter', 'half'],
      allowedRestValues: ['quarterRest'],
      includeTriplets: false,
      syncopationProbability: 0,
      noteDensity: 'sparse',
      restProbability: 10,
      tempo: 72,
    },
  },
  intermediate: {
    name: 'Intermediate',
    rhythm: {
      timeSignature: '4/4',
      measureCount: 4,
      allowedNoteValues: ['quarter', 'half', 'eighth', 'twoEighths'],
      allowedRestValues: ['quarterRest', 'eighthRest'],
      includeTriplets: false,
      syncopationProbability: 20,
      noteDensity: 'medium',
      restProbability: 15,
      tempo: 88,
    },
  },
  advanced: {
    name: 'Advanced',
    rhythm: {
      timeSignature: '4/4',
      measureCount: 4,
      allowedNoteValues: ['quarter', 'half', 'eighth', 'sixteenth', 'twoEighths', 'fourSixteenths', 'eighthTwoSixteenths', 'twoSixteenthsEighth'],
      allowedRestValues: ['quarterRest', 'eighthRest', 'sixteenthRest'],
      includeTriplets: true,
      syncopationProbability: 35,
      noteDensity: 'dense',
      restProbability: 20,
      tempo: 96,
    },
  },
  custom: {
    name: 'Custom',
    rhythm: {},
  },
};

export const PRESET_TOOLTIPS: Record<DifficultyPreset, string> = {
  beginner: 'Simple rhythms with quarter and half notes',
  intermediate: 'More variety with eighth notes and simple syncopation',
  advanced: 'Complex rhythms with sixteenths and syncopation',
  custom: 'Use your current custom settings',
};
