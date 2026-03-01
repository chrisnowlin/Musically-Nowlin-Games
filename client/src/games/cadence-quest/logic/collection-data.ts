import type { Instrument, Spell } from '@shared/types/cadence-quest';

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'golden-flute',
    name: 'Golden Flute',
    description: '+10% pitch accuracy',
    rarity: 'rare',
    modifiers: { pitchAccuracy: 0.1 },
    source: 'theory-tower',
  },
  {
    id: 'rhythm-drum',
    name: 'Rhythm Drum',
    description: '+10% rhythm accuracy',
    rarity: 'uncommon',
    modifiers: { rhythmAccuracy: 0.1 },
    source: 'rhythm-realm',
  },
  {
    id: 'harmony-harp',
    name: 'Harmony Harp',
    description: '+10% harmony damage',
    rarity: 'rare',
    modifiers: { harmonyDamage: 0.1 },
    source: 'harmony-harbor',
  },
  {
    id: 'dynamic-baton',
    name: 'Dynamic Baton',
    description: '+10% dynamics damage',
    rarity: 'uncommon',
    modifiers: { dynamicsDamage: 0.1 },
    source: 'dynamics-desert',
  },
];

export const SPELLS: Spell[] = [
  {
    id: 'fermata',
    name: 'Fermata',
    description: 'Freeze opponent timer for 3 seconds',
    rarity: 'rare',
    effect: 'freeze_timer',
    usesPerBattle: 1,
    source: 'skill-tree',
  },
  {
    id: 'heal',
    name: 'Resonance Heal',
    description: 'Heal 20% of max HP',
    rarity: 'uncommon',
    effect: 'heal_20',
    usesPerBattle: 1,
    source: 'harmony-harbor',
  },
  {
    id: 'double-damage',
    name: 'Fortissimo',
    description: 'Next correct answer deals 2x damage',
    rarity: 'epic',
    effect: 'double_damage',
    usesPerBattle: 1,
    source: 'dynamics-desert',
  },
];
