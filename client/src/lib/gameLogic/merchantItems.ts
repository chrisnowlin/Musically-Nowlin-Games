import type { PlayerState } from './dungeonTypes';

export interface MerchantItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  getPrice: (floor: number) => number;
  canBuy: (player: PlayerState) => boolean;
  apply: (player: PlayerState) => PlayerState;
}

export const MERCHANT_ITEMS: MerchantItem[] = [
  {
    id: 'potion',
    name: 'Potion',
    description: 'Restores 1 HP',
    emoji: '\uD83E\uDDEA',
    getPrice: (floor) => 150 + floor * 10,
    canBuy: (player) => player.score >= 150,
    apply: (player) => ({ ...player, potions: player.potions + 1 }),
  },
  {
    id: 'key',
    name: 'Key',
    description: 'Opens one chest',
    emoji: '\uD83D\uDD11',
    getPrice: (floor) => 200 + floor * 15,
    canBuy: (player) => player.score >= 200,
    apply: (player) => ({ ...player, keys: player.keys + 1 }),
  },
  {
    id: 'potion-bundle',
    name: '3 Potions',
    description: 'Bulk healing deal',
    emoji: '\uD83C\uDF81',
    getPrice: (floor) => 400 + floor * 25,
    canBuy: (player) => player.score >= 400,
    apply: (player) => ({ ...player, potions: player.potions + 3 }),
  },
  {
    id: 'shield-charm',
    name: 'Shield Charm',
    description: 'Blocks next wrong-answer damage',
    emoji: '\uD83D\uDEE1\uFE0F',
    getPrice: (floor) => 300 + floor * 20,
    canBuy: (player) => player.score >= 300 && player.shieldCharm < 1,
    apply: (player) => ({ ...player, shieldCharm: 1 }),
  },
];

/** Deduct price and apply item effect to player state. */
export function getMerchantPrice(
  player: PlayerState,
  item: MerchantItem,
  floorNumber: number
): PlayerState {
  const price = item.getPrice(floorNumber);
  return item.apply({ ...player, score: player.score - price });
}
