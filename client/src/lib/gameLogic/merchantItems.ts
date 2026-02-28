import type { PlayerState } from './dungeonTypes';

export interface MerchantItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'core' | 'exploration' | 'combat' | 'economy' | 'difficulty';
  getPrice: (floor: number) => number;
  canBuy: (player: PlayerState) => boolean;
  apply: (player: PlayerState) => PlayerState;
}

export const CORE_ITEMS: MerchantItem[] = [
  {
    id: 'potion',
    name: 'Potion',
    description: 'Restores 1 HP',
    emoji: '🧪',
    category: 'core',
    getPrice: (floor) => 150 + floor * 10,
    canBuy: (player) => player.score >= 150,
    apply: (player) => ({ ...player, potions: player.potions + 1 }),
  },
  {
    id: 'key',
    name: 'Key',
    description: 'Opens one chest',
    emoji: '🔑',
    category: 'core',
    getPrice: (floor) => 200 + floor * 15,
    canBuy: (player) => player.score >= 200,
    apply: (player) => ({ ...player, keys: player.keys + 1 }),
  },
  {
    id: 'potion-bundle',
    name: '3 Potions',
    description: 'Bulk healing deal',
    emoji: '🎁',
    category: 'core',
    getPrice: (floor) => 400 + floor * 25,
    canBuy: (player) => player.score >= 400,
    apply: (player) => ({ ...player, potions: player.potions + 3 }),
  },
  {
    id: 'shield-charm',
    name: 'Shield Charm',
    description: 'Blocks next wrong-answer damage',
    emoji: '🛡️',
    category: 'core',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300 && player.shieldCharm < 1,
    apply: (player) => ({ ...player, shieldCharm: 1 }),
  },
];

export const SPECIAL_ITEMS: MerchantItem[] = [
  {
    id: 'torch',
    name: 'Torch',
    description: '+2 visibility for this floor',
    emoji: '🔦',
    category: 'exploration',
    getPrice: (floor) => 200 + floor * 15,
    canBuy: (player) => !player.buffs.floor.torch,
    apply: (player) => ({
      ...player,
      buffs: { ...player.buffs, floor: { ...player.buffs.floor, torch: true } },
    }),
  },
  {
    id: 'map-scroll',
    name: 'Map Scroll',
    description: 'Reveals entire minimap',
    emoji: '🗺️',
    category: 'exploration',
    getPrice: (floor) => 250 + floor * 20,
    canBuy: (player) => !player.buffs.floor.mapRevealed,
    apply: (player) => ({
      ...player,
      buffs: { ...player.buffs, floor: { ...player.buffs.floor, mapRevealed: true } },
    }),
  },
  {
    id: 'compass',
    name: 'Compass',
    description: 'Shows stairs on minimap',
    emoji: '🧭',
    category: 'exploration',
    getPrice: (floor) => 175 + floor * 12,
    canBuy: (player) => !player.buffs.floor.compass,
    apply: (player) => ({
      ...player,
      buffs: { ...player.buffs, floor: { ...player.buffs.floor, compass: true } },
    }),
  },
  {
    id: 'streak-saver',
    name: 'Streak Saver',
    description: 'Preserves streak on next miss',
    emoji: '🔥',
    category: 'combat',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          streakSaver: player.buffs.persistent.streakSaver + 1,
        },
      },
    }),
  },
  {
    id: 'second-chance',
    name: 'Second Chance',
    description: 'Retry one failed challenge',
    emoji: '🔄',
    category: 'combat',
    getPrice: (floor) => 350 + floor * 25,
    canBuy: (player) => player.score >= 350,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          secondChance: player.buffs.persistent.secondChance + 1,
        },
      },
    }),
  },
  {
    id: 'dragon-bane',
    name: 'Dragon Bane',
    description: 'Weakens next dragon by 1 HP',
    emoji: '⚔️',
    category: 'combat',
    getPrice: (floor) => 400 + floor * 30,
    canBuy: (player) => player.score >= 400,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          dragonBane: player.buffs.persistent.dragonBane + 1,
        },
      },
    }),
  },
  {
    id: 'lucky-coin',
    name: 'Lucky Coin',
    description: 'Double score from next kill',
    emoji: '🪙',
    category: 'economy',
    getPrice: (floor) => 250 + floor * 15,
    canBuy: (player) => player.score >= 250,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          luckyCoin: player.buffs.persistent.luckyCoin + 1,
        },
      },
    }),
  },
  {
    id: 'treasure-magnet',
    name: 'Treasure Magnet',
    description: 'Double potion from next treasure',
    emoji: '🧲',
    category: 'economy',
    getPrice: (floor) => 200 + floor * 12,
    canBuy: (player) => player.score >= 200,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          treasureMagnet: player.buffs.persistent.treasureMagnet + 1,
        },
      },
    }),
  },
  {
    id: 'metronome',
    name: 'Metronome',
    description: 'Half-speed next rhythm challenge',
    emoji: '⏱️',
    category: 'difficulty',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          metronome: player.buffs.persistent.metronome + 1,
        },
      },
    }),
  },
  {
    id: 'tuning-fork',
    name: 'Tuning Fork',
    description: 'Hints correct interval answer',
    emoji: '🎵',
    category: 'difficulty',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300,
    apply: (player) => ({
      ...player,
      buffs: {
        ...player.buffs,
        persistent: {
          ...player.buffs.persistent,
          tuningFork: player.buffs.persistent.tuningFork + 1,
        },
      },
    }),
  },
];

export const ALL_ITEMS: MerchantItem[] = [...CORE_ITEMS, ...SPECIAL_ITEMS];
export const MERCHANT_ITEMS = ALL_ITEMS;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getShopInventory(floorNumber: number): MerchantItem[] {
  const rng = mulberry32(floorNumber * 31337);
  const shuffled = [...SPECIAL_ITEMS].sort(() => rng() - 0.5);
  return [...CORE_ITEMS, ...shuffled.slice(0, 3)];
}

/** Deduct price and apply item effect to player state. */
export function getMerchantPrice(
  player: PlayerState,
  item: MerchantItem,
  floorNumber: number
): PlayerState {
  const price = item.getPrice(floorNumber);
  return item.apply({ ...player, score: player.score - price });
}
