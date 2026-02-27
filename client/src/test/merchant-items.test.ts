import { describe, expect, it } from 'vitest';
import { MERCHANT_ITEMS, getMerchantPrice } from '@/lib/gameLogic/merchantItems';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    position: { x: 0, y: 0 },
    health: 3,
    maxHealth: 5,
    score: 1000,
    keys: 0,
    potions: 0,
    streak: 0,
    shieldCharm: 0,
    ...overrides,
  };
}

describe('Merchant items', () => {
  it('has 4 items in the catalog', () => {
    expect(MERCHANT_ITEMS).toHaveLength(4);
  });

  it('prices scale with floor depth', () => {
    for (const item of MERCHANT_ITEMS) {
      const price1 = item.getPrice(1);
      const price10 = item.getPrice(10);
      expect(price10).toBeGreaterThan(price1);
    }
  });

  it('potion restores 1 potion', () => {
    const potion = MERCHANT_ITEMS.find((i) => i.id === 'potion')!;
    const player = makePlayer({ potions: 0 });
    const result = potion.apply(player);
    expect(result.potions).toBe(1);
  });

  it('key adds 1 key', () => {
    const key = MERCHANT_ITEMS.find((i) => i.id === 'key')!;
    const player = makePlayer({ keys: 0 });
    const result = key.apply(player);
    expect(result.keys).toBe(1);
  });

  it('potion bundle adds 3 potions', () => {
    const bundle = MERCHANT_ITEMS.find((i) => i.id === 'potion-bundle')!;
    const player = makePlayer({ potions: 1 });
    const result = bundle.apply(player);
    expect(result.potions).toBe(4);
  });

  it('shield charm sets shieldCharm to 1', () => {
    const charm = MERCHANT_ITEMS.find((i) => i.id === 'shield-charm')!;
    const player = makePlayer({ shieldCharm: 0 });
    const result = charm.apply(player);
    expect(result.shieldCharm).toBe(1);
  });

  it('shield charm cannot be bought if already held', () => {
    const charm = MERCHANT_ITEMS.find((i) => i.id === 'shield-charm')!;
    const player = makePlayer({ shieldCharm: 1 });
    expect(charm.canBuy(player)).toBe(false);
  });

  it('all items can be bought with sufficient score', () => {
    const player = makePlayer({ score: 10000 });
    for (const item of MERCHANT_ITEMS) {
      expect(item.canBuy(player)).toBe(true);
    }
  });

  it('items cannot be bought with insufficient score', () => {
    const player = makePlayer({ score: 0 });
    for (const item of MERCHANT_ITEMS) {
      expect(item.canBuy(player)).toBe(false);
    }
  });

  it('getMerchantPrice deducts score and applies item', () => {
    const potion = MERCHANT_ITEMS.find((i) => i.id === 'potion')!;
    const player = makePlayer({ score: 500, potions: 0 });
    const result = getMerchantPrice(player, potion, 1);
    expect(result.potions).toBe(1);
    expect(result.score).toBe(500 - potion.getPrice(1));
  });
});
