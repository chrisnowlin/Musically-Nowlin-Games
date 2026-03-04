import { describe, it, expect } from 'vitest';
import { getIntervalSvgUrl, INTERVAL_ASSETS } from '../logic/intervalAssets';

describe('intervalAssets', () => {
  it('has an entry for each standard-mode interval name', () => {
    const expectedNames = ['Unison', '2nd', '3rd', '4th', '5th', '6th', 'Octave'];
    for (const name of expectedNames) {
      expect(INTERVAL_ASSETS[name]).toBeDefined();
    }
  });

  it('returns correct SVG URL for a known interval', () => {
    expect(getIntervalSvgUrl('3rd')).toBe(
      '/images/notation/challenges/intervals/3rd.svg'
    );
  });

  it('returns correct SVG URL for octave', () => {
    expect(getIntervalSvgUrl('Octave')).toBe(
      '/images/notation/challenges/intervals/octave.svg'
    );
  });

  it('returns undefined for unknown interval name', () => {
    expect(getIntervalSvgUrl('Unknown')).toBeUndefined();
  });
});
