import { BossEncounter } from '@shared/types/cadence-quest';

export interface BossDrop {
  bossId: string;
  guaranteed: string[];
  possible: BossPossibleDrop[];
}

export interface BossPossibleDrop {
  itemId: string;
  dropChance: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export const BOSS_DROPS: BossDrop[] = [
  {
    bossId: 'metronome-mage',
    guaranteed: [],
    possible: [
      { itemId: 'metronome', dropChance: 0.3 },
      { itemId: 'rhythmic-vest', dropChance: 0.25 },
    ],
  },
  {
    bossId: 'siren-sovereign',
    guaranteed: [],
    possible: [
      { itemId: 'silver-tuning-fork', dropChance: 0.3 },
      { itemId: 'pitch-pipe', dropChance: 0.25 },
    ],
  },
  {
    bossId: 'chord-kraken',
    guaranteed: [],
    possible: [
      { itemId: 'harmonist-vestments', dropChance: 0.3 },
      { itemId: 'ear-training-earplugs', dropChance: 0.25 },
    ],
  },
  {
    bossId: 'fortress-phoenix',
    guaranteed: [],
    possible: [
      { itemId: 'conductors-baton', dropChance: 0.3 },
      { itemId: 'streakkeepers-amulet', dropChance: 0.25 },
    ],
  },
  {
    bossId: 'grand-maestro',
    guaranteed: ['symphony-blade'],
    possible: [
      { itemId: 'crescendo-ring', dropChance: 0.5 },
      { itemId: 'harmony-lute', dropChance: 0.3 },
    ],
  },
];

export function generateBossDrops(boss: BossEncounter): string[] {
  const dropData = BOSS_DROPS.find(d => d.bossId === boss.id);
  if (!dropData) return [];

  const drops: string[] = [];

  for (const itemId of dropData.guaranteed) {
    drops.push(itemId);
  }

  for (const possibleDrop of dropData.possible) {
    if (Math.random() < possibleDrop.dropChance) {
      const minQty = possibleDrop.minQuantity || 1;
      const maxQty = possibleDrop.maxQuantity || 1;
      const quantity = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
      for (let i = 0; i < quantity; i++) {
        drops.push(possibleDrop.itemId);
      }
    }
  }

  return drops;
}