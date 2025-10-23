/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Advanced001Game } from '@/components/Advanced001Game';

vi.mock('@/lib/sampleAudioService', () => ({
  sampleAudioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    playNote: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Advanced001Game component', () => {
  beforeEach(() => {
    // isolate localStorage effects between tests
    localStorage.clear();
  });

  it('renders mode selection and starts a game', async () => {
    const user = userEvent.setup();
    render(<Advanced001Game />);

    // Start default mode
    await user.click(screen.getByRole('button', { name: /start advanced harmony/i }));

    // Gameplay view shows Round info
    expect(await screen.findByText(/round/i)).toBeInTheDocument();
  });

  it('switches to Advanced Form mode and starts', async () => {
    const user = userEvent.setup();
    render(<Advanced001Game />);

    await user.click(screen.getByRole('button', { name: /advanced form/i }));
    await user.click(screen.getByRole('button', { name: /start advanced form/i }));

    // Header shows selected mode label
    expect(await screen.findByText(/advanced form/i)).toBeInTheDocument();
  });

  it('answers a question and shows result UI', async () => {
    const user = userEvent.setup();
    render(<Advanced001Game />);

    await user.click(screen.getByRole('button', { name: /start advanced harmony/i }));

    // pick the first option-like button that is not Main Menu/Replay/Start/Next
    const buttons = screen.getAllByRole('button');
    const optionBtn = buttons.find(b => {
      const txt = (b.textContent || '').toLowerCase();
      return !/main menu|replay|start|next round|finish/.test(txt);
    });
    expect(optionBtn).toBeTruthy();
    if (optionBtn) await user.click(optionBtn);

    // Either Correct! or Incorrect appears
    const result = await screen.findByText(/correct!|incorrect/i);
    expect(result).toBeInTheDocument();
  });
});

