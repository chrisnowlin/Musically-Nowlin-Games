import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TimbreChallenge from '../challenges/TimbreChallenge';

// Mock the Philharmonia hook so we don't attempt real audio loading
vi.mock('@/common/hooks/usePhilharmoniaInstruments', () => ({
  usePhilharmoniaInstruments: () => ({
    isLoading: false,
    loadingProgress: 100,
    error: null,
    playInstrument: vi.fn(),
    playNote: vi.fn(),
    playMelody: vi.fn(),
    isInstrumentLoaded: () => true,
    loadedInstruments: [],
    getInstrument: () => undefined,
    getSamples: () => [],
  }),
}));

// Mock dungeonAudio so no real audio plays
vi.mock('../dungeonAudio', () => ({
  playNoteAtFrequency: vi.fn(),
}));

describe('TimbreChallenge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title text for T1', () => {
    render(<TimbreChallenge tier={1} onResult={() => {}} />);
    expect(screen.getByText('Name That Sound!')).toBeInTheDocument();
  });

  it('renders title text for T3', () => {
    render(<TimbreChallenge tier={3} onResult={() => {}} />);
    expect(screen.getByText('Name That Instrument!')).toBeInTheDocument();
  });

  it('shows 4 answer buttons', () => {
    render(<TimbreChallenge tier={1} onResult={() => {}} />);
    const buttons = screen.getAllByRole('button');
    // May include replay button, so filter to answer buttons only
    // Answer buttons have the option display names; the replay button says "Replay"
    const answerButtons = buttons.filter(b => b.textContent !== 'Replay');
    expect(answerButtons.length).toBe(4);
  });

  it('calls onResult with a boolean when button clicked', () => {
    const onResult = vi.fn();
    render(<TimbreChallenge tier={1} onResult={onResult} />);

    // Advance past auto-play delay
    act(() => { vi.advanceTimersByTime(600); });

    const buttons = screen.getAllByRole('button').filter(b => b.textContent !== 'Replay');
    fireEvent.click(buttons[0]);
    act(() => { vi.advanceTimersByTime(1000); });

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(expect.any(Boolean));
  });

  it('disables buttons after selection', () => {
    render(<TimbreChallenge tier={2} onResult={() => {}} />);

    act(() => { vi.advanceTimersByTime(600); });

    const buttons = screen.getAllByRole('button').filter(b => b.textContent !== 'Replay');
    fireEvent.click(buttons[0]);

    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it('shows feedback after answering', () => {
    render(<TimbreChallenge tier={1} onResult={() => {}} />);

    act(() => { vi.advanceTimersByTime(600); });

    const buttons = screen.getAllByRole('button').filter(b => b.textContent !== 'Replay');
    fireEvent.click(buttons[0]);

    // Should show either "Correct!" or "It was: ..."
    const feedback = screen.getByText(/correct!|it was:/i);
    expect(feedback).toBeInTheDocument();
  });

  it('shows replay button when allowReplay is true (T1-T4)', () => {
    render(<TimbreChallenge tier={1} onResult={() => {}} />);

    // Advance past auto-play delay so hasPlayed becomes true
    act(() => { vi.advanceTimersByTime(600); });

    const replayBtn = screen.queryByText('Replay');
    expect(replayBtn).toBeInTheDocument();
  });

  it('does not show replay button for T5', () => {
    render(<TimbreChallenge tier={5} onResult={() => {}} />);

    act(() => { vi.advanceTimersByTime(600); });

    const replayBtn = screen.queryByText('Replay');
    expect(replayBtn).not.toBeInTheDocument();
  });
});
