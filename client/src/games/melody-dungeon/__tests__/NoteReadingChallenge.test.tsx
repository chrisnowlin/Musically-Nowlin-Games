import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import NoteReadingChallenge from '../challenges/NoteReadingChallenge';

// Mock dungeonAudio
vi.mock('../dungeonAudio', () => ({
  playNote: vi.fn(),
  noteKeyToName: (key: string) => key.replace(/\d+/, ''),
}));

// Mock VexFlow (doesn't work in jsdom)
vi.mock('vexflow', () => {
  const mockContext = {
    setStrokeStyle: vi.fn(),
    setFillStyle: vi.fn(),
  };
  return {
    Renderer: class {
      static Backends = { SVG: 'svg' };
      constructor(el: HTMLElement) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        el.appendChild(svg);
      }
      resize() {}
      getContext() { return mockContext; }
    },
    Stave: class {
      addClef() { return this; }
      setStyle() {}
      draw() {}
    },
    StaveNote: class {
      setStyle() {}
    },
    Voice: class {
      setStrict() {}
      addTickables() {}
      draw() {}
    },
    Formatter: class {
      joinVoices() { return this; }
      format() { return this; }
    },
  };
});

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
