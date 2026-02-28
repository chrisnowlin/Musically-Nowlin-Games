import { describe, expect, it } from 'vitest';
import { MERCHANT_ITEMS, ALL_ITEMS, CORE_ITEMS, SPECIAL_ITEMS, getMerchantPrice, getShopInventory } from '@/lib/gameLogic/merchantItems';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';
import { DEFAULT_BUFFS } from '@/lib/gameLogic/dungeonTypes';

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
    buffs: {
      floor: { ...DEFAULT_BUFFS.floor },
      persistent: { ...DEFAULT_BUFFS.persistent },
    },
    ...overrides,
  };
}

describe('Merchant items', () => {
  it('has 14 items in the catalog', () => {
    expect(ALL_ITEMS).toHaveLength(14);
  });

  it('has 4 core items and 10 special items', () => {
    expect(CORE_ITEMS).toHaveLength(4);
    expect(SPECIAL_ITEMS).toHaveLength(10);
  });

  it('all items have a category', () => {
    for (const item of ALL_ITEMS) {
      expect(item.category).toBeDefined();
    }
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

  it('shield charm cannot be stacked', () => {
    const charm = CORE_ITEMS.find((i) => i.id === 'shield-charm')!;
    const player = makePlayer({ shieldCharm: 1 });
    expect(charm.canBuy(player)).toBe(false);
  });

  it('getMerchantPrice deducts score and applies item', () => {
    const potion = MERCHANT_ITEMS.find((i) => i.id === 'potion')!;
    const player = makePlayer({ score: 500, potions: 0 });
    const result = getMerchantPrice(player, potion, 1);
    expect(result.potions).toBe(1);
    expect(result.score).toBe(500 - potion.getPrice(1));
  });

  it('getShopInventory returns 7 items (4 core + 3 special)', () => {
    const inventory = getShopInventory(5);
    expect(inventory).toHaveLength(7);
    const coreIds = CORE_ITEMS.map((i) => i.id);
    const inventoryIds = inventory.map((i) => i.id);
    for (const id of coreIds) {
      expect(inventoryIds).toContain(id);
    }
  });

  it('getShopInventory is deterministic for the same floor', () => {
    const a = getShopInventory(5).map((i) => i.id);
    const b = getShopInventory(5).map((i) => i.id);
    expect(a).toEqual(b);
  });

  it('getShopInventory varies between floors', () => {
    const ids3 = getShopInventory(3).map((i) => i.id);
    const ids7 = getShopInventory(7).map((i) => i.id);
    // At least one special item should differ (core items are always the same)
    const specials3 = ids3.filter((id) => !CORE_ITEMS.some((c) => c.id === id));
    const specials7 = ids7.filter((id) => !CORE_ITEMS.some((c) => c.id === id));
    expect(specials3).not.toEqual(specials7);
  });

  it('torch sets floor buff', () => {
    const torch = ALL_ITEMS.find((i) => i.id === 'torch')!;
    const player = makePlayer();
    const result = torch.apply(player);
    expect(result.buffs.floor.torch).toBe(true);
  });

  it('torch cannot be re-bought when active', () => {
    const torch = ALL_ITEMS.find((i) => i.id === 'torch')!;
    const player = makePlayer({
      buffs: {
        floor: { torch: true, mapRevealed: false, compass: false },
        persistent: { ...DEFAULT_BUFFS.persistent },
      },
    });
    expect(torch.canBuy(player)).toBe(false);
  });

  it('streak saver increments persistent buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'streak-saver')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.persistent.streakSaver).toBe(1);
    const result2 = item.apply(result);
    expect(result2.buffs.persistent.streakSaver).toBe(2);
  });

  it('second chance increments persistent buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'second-chance')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.persistent.secondChance).toBe(1);
  });

  it('dragon bane increments persistent buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'dragon-bane')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.persistent.dragonBane).toBe(1);
  });

  it('lucky coin increments persistent buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'lucky-coin')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.persistent.luckyCoin).toBe(1);
  });

  it('compass sets floor buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'compass')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.floor.compass).toBe(true);
  });

  it('map scroll sets floor buff', () => {
    const item = ALL_ITEMS.find((i) => i.id === 'map-scroll')!;
    const player = makePlayer();
    const result = item.apply(player);
    expect(result.buffs.floor.mapRevealed).toBe(true);
  });

  it('new items prices scale with floor depth', () => {
    for (const item of SPECIAL_ITEMS) {
      const price1 = item.getPrice(1);
      const price10 = item.getPrice(10);
      expect(price10).toBeGreaterThan(price1);
    }
  });
});
