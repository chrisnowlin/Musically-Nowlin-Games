/**
 * Preset configurations for Rhythm Randomizer V2
 * Rhythm-only presets (no pitch settings)
 */

import { DifficultyPreset, RhythmSettings } from '@/lib/rhythmRandomizerV2/types';

export interface RhythmPreset {
  name: string;
  description: string;
  settings: Partial<RhythmSettings>;
}

export const RHYTHM_PRESETS: Record<DifficultyPreset, RhythmPreset> = {
  beginner: {
    name: 'Beginner',
    description: 'Quarter & half notes, simple patterns',
    settings: {
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
      ensembleMode: 'single',
    },
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Add eighth notes & syncopation',
    settings: {
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
      ensembleMode: 'single',
    },
  },
  advanced: {
    name: 'Advanced',
    description: 'All note values, triplets & ties',
    settings: {
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
      ensembleMode: 'single',
    },
  },
  custom: {
    name: 'Custom',
    description: 'Use your current settings',
    settings: {},
  },
};
