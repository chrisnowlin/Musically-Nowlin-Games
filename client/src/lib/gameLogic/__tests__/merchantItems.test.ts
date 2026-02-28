import { describe, it, expect } from 'vitest';
import { rollChestReward, CHEST_LOOT_ITEMS } from '../merchantItems';

describe('CHEST_LOOT_ITEMS', () => {
  it('excludes the key item', () => {
    expect(CHEST_LOOT_ITEMS.every((i) => i.id !== 'key')).toBe(true);
  });

  it('excludes the potion-bundle item', () => {
    expect(CHEST_LOOT_ITEMS.every((i) => i.id !== 'potion-bundle')).toBe(true);
  });
});

describe('rollChestReward', () => {
  it('returns kind potion or item', () => {
    for (let i = 0; i < 50; i++) {
      const reward = rollChestReward(1);
      expect(['potion', 'item']).toContain(reward.kind);
      if (reward.kind === 'item') {
        expect(reward.item).toBeDefined();
        expect(CHEST_LOOT_ITEMS).toContain(reward.item);
        expect(reward.item.id).not.toBe('key');
        expect(reward.item.id).not.toBe('potion-bundle');
      }
    }
  });

  it('statistically returns potion most of the time', () => {
    let potionCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      if (rollChestReward(1).kind === 'potion') potionCount++;
    }
    // Expect ~65% potions — allow ±5% tolerance
    expect(potionCount / runs).toBeGreaterThan(0.60);
    expect(potionCount / runs).toBeLessThan(0.70);
  });
});
