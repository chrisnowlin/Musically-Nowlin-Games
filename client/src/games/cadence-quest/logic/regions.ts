import type { Region } from '@shared/types/cadence-quest';

export const REGIONS: Region[] = [
  {
    id: 'rhythm-realm',
    name: 'Rhythm Realm',
    description: 'Master the beat. Tempo and rhythm challenges await.',
    discipline: 'rhythm',
    encounterCount: 6,
  },
  {
    id: 'melody-mountains',
    name: 'Melody Mountains',
    description: 'Scale the peaks of pitch and melody.',
    discipline: 'pitch',
    encounterCount: 6,
    requiresRegionId: 'rhythm-realm',
  },
  {
    id: 'harmony-harbor',
    name: 'Harmony Harbor',
    description: 'Chords and scales guide your way.',
    discipline: 'harmony',
    encounterCount: 6,
    requiresRegionId: 'melody-mountains',
  },
  {
    id: 'dynamics-desert',
    name: 'Dynamics Desert',
    description: 'Navigate expression and volume.',
    discipline: 'dynamics',
    encounterCount: 6,
    requiresRegionId: 'harmony-harbor',
  },
  {
    id: 'theory-tower',
    name: 'Theory Tower',
    description: 'The final challenge. Mixed disciplines.',
    discipline: 'theory',
    encounterCount: 8,
    requiresRegionId: 'dynamics-desert',
  },
  {
    id: 'pvp-arena',
    name: 'PvP Arena',
    description: 'Battle other players in real-time!',
    discipline: 'theory',
    encounterCount: 0,
    isArena: true,
  },
];
