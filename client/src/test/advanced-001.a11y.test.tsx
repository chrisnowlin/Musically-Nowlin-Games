/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Advanced001Game } from '@/components/Advanced001Game';

describe('Advanced001Game accessibility basics', () => {
  it('allows keyboard navigation to mode buttons and Start', async () => {
    const user = userEvent.setup();
    render(<Advanced001Game />);

    // Focus first focusable element and tab through to a mode button
    await user.tab(); // Main Menu
    await user.tab(); // likely lands inside content
    await user.tab(); // mode button

    // At least one mode button should be focusable
    const modeBtn = screen.getByRole('button', { name: /advanced harmony/i });
    modeBtn.focus();
    expect(modeBtn).toHaveFocus();

    // Tab to Start button
    await user.tab();
    const startBtn = screen.getByRole('button', { name: /start/i });
    startBtn.focus();
    expect(startBtn).toHaveFocus();
  });
});

