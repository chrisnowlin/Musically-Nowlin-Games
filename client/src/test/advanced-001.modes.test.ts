import { describe, it, expect } from 'vitest';
import { advanced001Modes, getAdvanced001Mode } from '@/lib/gameLogic/advanced-001Modes';

describe('advanced-001 modes difficulty curves', () => {
  it('all modes return difficulty within bounds 1..5', () => {
    for (const m of advanced001Modes) {
      for (let level = 0; level <= 10; level++) {
        const d = m.difficultyCurve(level).difficulty;
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(5);
      }
    }
  });

  it('form and rhythm have faster ramps than harmony', () => {
    const harmony = getAdvanced001Mode('advanced-harmony')!;
    const rhythm = getAdvanced001Mode('advanced-rhythm')!;
    const form = getAdvanced001Mode('advanced-form')!;

    const l = 3;
    expect(rhythm.difficultyCurve(l).difficulty).toBeGreaterThanOrEqual(harmony.difficultyCurve(l).difficulty);
    expect(form.difficultyCurve(l).difficulty).toBeGreaterThanOrEqual(harmony.difficultyCurve(l).difficulty);
  });
});

