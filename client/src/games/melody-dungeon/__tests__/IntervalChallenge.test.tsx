import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import IntervalChallenge from '../challenges/IntervalChallenge';

// Mock dungeonAudio so no real audio plays
vi.mock('../dungeonAudio', () => ({
  playTwoNotes: vi.fn(),
  getFrequency: vi.fn(() => 440),
  ALL_NOTE_KEYS: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
}));

describe('IntervalChallenge - notation', () => {
  it('renders a notation image in standard mode (tier 3)', () => {
    const { container } = render(
      <IntervalChallenge tier={3} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt*="interval"]');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toMatch(/challenges\/intervals/);
  });

  it('does NOT render notation in highLow mode (tier 1)', () => {
    const { container } = render(
      <IntervalChallenge tier={1} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt*="interval"]');
    expect(img).toBeNull();
  });
});
