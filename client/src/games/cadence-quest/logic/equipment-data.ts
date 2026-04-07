import type { Equipment, MusicDiscipline, CharacterClass, EquipmentSlot, EquipmentRarity } from '@shared/types/cadence-quest';

const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#9a9a9a',
  uncommon: '#4ade80',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const WEAPONS: Equipment[] = [
  {
    id: 'practice-flute',
    name: 'Practice Flute',
    description: 'A simple flute for beginners',
    emoji: '🎵',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'pitch', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/practice-flute.svg',
    source: 'shop',
  },
  {
    id: 'wooden-drumsticks',
    name: 'Wooden Drumsticks',
    description: 'Basic drumsticks for rhythm practice',
    emoji: '🥁',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'rhythm', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/wooden-drumsticks.svg',
    source: 'shop',
  },
  {
    id: 'ceramic-shaker',
    name: 'Ceramic Shaker',
    description: 'A simple shaker for dynamics exercises',
    emoji: '🪘',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'dynamics', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/ceramic-shaker.svg',
    source: 'shop',
  },
  {
    id: 'student-violin',
    name: 'Student Violin',
    description: 'A good starter violin for harmony practice',
    emoji: '🎻',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'harmony', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/student-violin.svg',
    source: 'shop',
  },
  {
    id: 'theory-manual',
    name: 'Theory Manual',
    description: 'A comprehensive guide to music theory',
    emoji: '📖',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'theory', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/theory-manual.svg',
    source: 'shop',
  },
  {
    id: 'silver-tuning-fork',
    name: 'Silver Tuning Fork',
    description: 'Resonates with perfect pitch',
    emoji: '🔔',
    slot: 'weapon',
    rarity: 'uncommon',
    passiveEffects: {
      accuracyBonus: 0.1,
      disciplineBonus: { discipline: 'pitch', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/silver-tuning-fork.svg',
    source: 'drop',
    flavorText: 'Forged by master craftsmen of Melody Mountains',
  },
  {
    id: 'metronome',
    name: 'Vintage Metronome',
    description: 'Holds perfect time forever',
    emoji: '⏱️',
    slot: 'weapon',
    rarity: 'uncommon',
    passiveEffects: {
      accuracyBonus: 0.1,
      disciplineBonus: { discipline: 'rhythm', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/metronome.svg',
    source: 'drop',
    flavorText: 'Never misses a beat',
  },
  {
    id: 'conductors-baton',
    name: "Conductor's Baton",
    description: 'Channels the power of orchestration',
    emoji: '🎼',
    slot: 'weapon',
    rarity: 'rare',
    passiveEffects: {
      damageModifier: 0.15,
      classBonus: { class: 'conductor', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/conductors-baton.svg',
    source: 'boss',
    flavorText: 'Once wielded by the legendary Maestro Fortissimo',
  },
  {
    id: 'harmony-lute',
    name: 'Harmony Lute',
    description: 'Strums chords of pure resonance',
    emoji: '🎸',
    slot: 'weapon',
    rarity: 'epic',
    passiveEffects: {
      damageModifier: 0.2,
      healOnCorrect: 0.05,
      disciplineBonus: { discipline: 'harmony', bonus: 0.15 },
    },
    spritePath: '/images/cadence-quest/equipment/harmony-lute.svg',
    source: 'boss',
    flavorText: 'Said to have been played by the Harmonist Primus',
  },
  {
    id: 'symphony-blade',
    name: 'Symphony Blade',
    description: 'Cuts through discord with perfect harmony',
    emoji: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    passiveEffects: {
      damageModifier: 0.3,
      criticalChance: 0.15,
      classBonus: { class: 'conductor', bonus: 0.2 },
    },
    spritePath: '/images/cadence-quest/equipment/symphony-blade.svg',
    source: 'boss',
    flavorText: 'Forged in the fires of Theory Tower itself',
  },
];

export const ARMOR: Equipment[] = [
  {
    id: 'scholars-robe',
    name: "Scholar's Robe",
    description: 'Basic protection for music students',
    emoji: '👘',
    slot: 'armor',
    rarity: 'common',
    passiveEffects: {
      maxHpBonus: 5,
    },
    spritePath: '/images/cadence-quest/equipment/scholars-robe.svg',
    source: 'shop',
  },
  {
    id: 'leather-armor',
    name: 'Leather Tuner Armor',
    description: 'Light armor for traveling musicians',
    emoji: '🛡️',
    slot: 'armor',
    rarity: 'common',
    passiveEffects: {
      maxHpBonus: 8,
      accuracyBonus: 0.05,
    },
    spritePath: '/images/cadence-quest/equipment/leather-armor.svg',
    source: 'shop',
  },
  {
    id: 'rhythmic-vest',
    name: 'Rhythmic Vest',
    description: 'Helps you feel the beat',
    emoji: '🎽',
    slot: 'armor',
    rarity: 'uncommon',
    passiveEffects: {
      maxHpBonus: 12,
      disciplineBonus: { discipline: 'rhythm', bonus: 0.08 },
    },
    spritePath: '/images/cadence-quest/equipment/rhythmic-vest.svg',
    source: 'drop',
  },
  {
    id: 'harmonist-vestments',
    name: 'Harmonist Vestments',
    description: 'Channels protective harmonies',
    emoji: '🧥',
    slot: 'armor',
    rarity: 'rare',
    passiveEffects: {
      maxHpBonus: 15,
      healOnCorrect: 0.03,
      classBonus: { class: 'harmonist', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/harmonist-vestments.svg',
    source: 'boss',
    flavorText: 'Woven from threads of pure harmony',
  },
];

export const ACCESSORIES: Equipment[] = [
  {
    id: 'lucky-pick',
    name: 'Lucky Pick',
    description: 'Increases critical hit chance',
    emoji: '🎸',
    slot: 'accessory',
    rarity: 'uncommon',
    passiveEffects: {
      criticalChance: 0.1,
    },
    spritePath: '/images/cadence-quest/equipment/lucky-pick.svg',
    source: 'drop',
  },
  {
    id: 'pitch-pipe',
    name: 'Pitch Pipe',
    description: 'Always know the right note',
    emoji: '🎶',
    slot: 'accessory',
    rarity: 'uncommon',
    passiveEffects: {
      accuracyBonus: 0.08,
      disciplineBonus: { discipline: 'pitch', bonus: 0.08 },
    },
    spritePath: '/images/cadence-quest/equipment/pitch-pipe.svg',
    source: 'drop',
  },
  {
    id: 'ear-training-earplugs',
    name: 'Ear Training Earplugs',
    description: 'Focus your ear for better listening',
    emoji: '🎧',
    slot: 'accessory',
    rarity: 'rare',
    passiveEffects: {
      accuracyBonus: 0.12,
      criticalChance: 0.05,
    },
    spritePath: '/images/cadence-quest/equipment/ear-training-earplugs.svg',
    source: 'boss',
  },
  {
    id: 'streakkeepers-amulet',
    name: "Streakkeeper's Amulet",
    description: 'Preserves streak on one wrong answer',
    emoji: '📿',
    slot: 'accessory',
    rarity: 'rare',
    passiveEffects: {
      streakProtection: 1,
    },
    spritePath: '/images/cadence-quest/equipment/streakkeepers-amulet.svg',
    source: 'boss',
    flavorText: 'Contains a fragment of eternal rhythm',
  },
  {
    id: 'crescendo-ring',
    name: 'Crescendo Ring',
    description: 'Build up power over time',
    emoji: '💍',
    slot: 'accessory',
    rarity: 'epic',
    passiveEffects: {
      damageModifier: 0.1,
      classBonus: { class: 'conductor', bonus: 0.15 },
    },
    spritePath: '/images/cadence-quest/equipment/crescendo-ring.svg',
    source: 'boss',
  },
];

export const ALL_EQUIPMENT = [...WEAPONS, ...ARMOR, ...ACCESSORIES];

export function getEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
  switch (slot) {
    case 'weapon':
      return WEAPONS;
    case 'armor':
      return ARMOR;
    case 'accessory':
      return ACCESSORIES;
  }
}

export function getEquipmentByRarity(rarity: EquipmentRarity): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.rarity === rarity);
}

export function getEquipmentBySource(source: 'drop' | 'quest' | 'shop' | 'boss'): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.source === source);
}

export function getStarterEquipment(): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.rarity === 'common' && e.source === 'shop').slice(0, 3);
}

export function getRarityColor(rarity: EquipmentRarity): string {
  return RARITY_COLORS[rarity];
}