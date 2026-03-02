import { describe, it, expect } from 'vitest';
import { getNotationAsset, VOCAB_ASSET_MAP } from '../notationAssets';

describe('getNotationAsset', () => {
  it('returns the correct path for a known category and key', () => {
    expect(getNotationAsset('dynamics', 'f')).toBe('/images/notation/notation/dynamics/f.svg');
  });

  it('returns the correct path for symbols category', () => {
    expect(getNotationAsset('symbols', 'fermata')).toBe('/images/notation/notation/symbols/fermata.svg');
  });

  it('returns the correct path for clefs', () => {
    expect(getNotationAsset('clefs', 'treble-clef')).toBe('/images/notation/notation/clefs/treble-clef.svg');
  });
});

describe('VOCAB_ASSET_MAP', () => {
  it('maps "Quarter note" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['Quarter note']).toBe('notes/quarter-note');
  });

  it('maps "forte" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['forte']).toBe('dynamics/f');
  });

  it('maps "Treble clef" to the correct asset key', () => {
    expect(VOCAB_ASSET_MAP['Treble clef']).toBe('clefs/treble-clef');
  });

  it('returns undefined for terms without notation assets', () => {
    expect(VOCAB_ASSET_MAP['Melody']).toBeUndefined();
  });
});
