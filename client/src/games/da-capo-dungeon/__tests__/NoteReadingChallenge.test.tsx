import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { mockVexFlow } from '@/test/vexflowMock';
mockVexFlow();
import NoteReadingChallenge from '../challenges/NoteReadingChallenge';

// Mock dungeonAudio
vi.mock('../dungeonAudio', () => ({
  playNote: vi.fn(),
  noteKeyToName: (key: string) => key.replace(/\d+/, ''),
}));

describe('NoteReadingChallenge', () => {
  it('renders an SVG for the staff notation (VexFlow)', () => {
    const { container } = render(
      <NoteReadingChallenge tier={1} onResult={() => {}} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders 7 note-name buttons', () => {
    const { container } = render(
      <NoteReadingChallenge tier={1} onResult={() => {}} />
    );
    const buttons = container.querySelectorAll('button');
    // 7 note buttons (C,D,E,F,G,A,B) + 1 "Hear it again" = 8
    expect(buttons.length).toBeGreaterThanOrEqual(7);
  });
});
