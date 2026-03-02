import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RhythmTapChallenge from '../challenges/RhythmTapChallenge';

// Mock dungeonAudio so no real audio plays
vi.mock('../dungeonAudio', () => ({
  playClick: vi.fn(),
}));

describe('RhythmTapChallenge - notation', () => {
  it('renders a notation SVG image for the rhythm pattern', () => {
    const { container } = render(
      <RhythmTapChallenge tier={1} onResult={() => {}} />
    );
    const notationImages = container.querySelectorAll('img[src*="/images/notation/"]');
    expect(notationImages.length).toBeGreaterThan(0);
  });

  it('notation image src contains the challenges/rhythm-patterns path', () => {
    const { container } = render(
      <RhythmTapChallenge tier={1} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt="Rhythm pattern notation"]');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toMatch(/challenges\/rhythm-patterns/);
  });

  it('notation image has an onError handler to hide on missing assets', () => {
    const { container } = render(
      <RhythmTapChallenge tier={2} onResult={() => {}} />
    );
    const img = container.querySelector('img[alt="Rhythm pattern notation"]') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    // Simulate an error event
    img.dispatchEvent(new Event('error'));
    expect(img.style.display).toBe('none');
  });
});
