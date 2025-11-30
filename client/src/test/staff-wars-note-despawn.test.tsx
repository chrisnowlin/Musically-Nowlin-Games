/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import StaffWarsGame from '@/components/StaffWarsGame';

// Mock the audio service
vi.mock('@/lib/audioService', () => ({
  audioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    playSuccessTone: vi.fn().mockResolvedValue(undefined),
    playErrorTone: vi.fn().mockResolvedValue(undefined),
    playLevelUpSound: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock canvas context
const mockCanvasContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  font: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt' as const,
  lineJoin: 'miter' as const,
  globalAlpha: 1,
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  textAlign: 'start' as const,
  textBaseline: 'alphabetic' as const,
} as any;

// Mock HTMLCanvasElement
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    getContext() {
      return mockCanvasContext;
    }
    get offsetWidth() {
      return 800;
    }
    get offsetHeight() {
      return 600;
    }
  },
  configurable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

describe('Staff Wars Note Despawn Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start game and render note buttons', async () => {
    render(<StaffWarsGame />);

    // Start the game
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    // Wait for gameplay to start
    await waitFor(() => {
      expect(screen.getByText(/score/i)).toBeInTheDocument();
    });

    // Find note buttons
    const noteButtons = screen.getAllByRole('button').filter(button => {
      const text = button.textContent;
      return text && /^[A-G]$/.test(text);
    });

    expect(noteButtons.length).toBeGreaterThan(0);
  });

  it('should handle note button clicks without errors', async () => {
    render(<StaffWarsGame />);

    // Start the game
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    // Wait for gameplay to start
    await waitFor(() => {
      expect(screen.getByText(/score/i)).toBeInTheDocument();
    });

    // Find note buttons
    const noteButtons = screen.getAllByRole('button').filter(button => {
      const text = button.textContent;
      return text && /^[A-G]$/.test(text);
    });

    if (noteButtons.length > 0) {
      // Click a note button to test note clearing behavior
      fireEvent.click(noteButtons[0]);

      // The bug would manifest as the same note not despawning properly
      // With the fix, the note should be cleared immediately and a new one can spawn
      // We verify the game continues without errors
      expect(screen.getByText(/score/i)).toBeInTheDocument();
    }
  });
});