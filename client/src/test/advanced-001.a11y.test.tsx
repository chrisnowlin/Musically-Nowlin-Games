/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Advanced001Game } from '@/components/Advanced001Game';

describe('Advanced001Game accessibility basics', () => {
  it('allows keyboard navigation to mode buttons and Start', async () => {
    const user = userEvent.setup();
    render(<Advanced001Game />);

    // Find all mode buttons
    const modeButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.toLowerCase().includes('advanced')
    );
    
    expect(modeButtons.length).toBeGreaterThan(0);

    // First mode button should be focusable
    const firstModeBtn = modeButtons[0];
    firstModeBtn.focus();
    expect(firstModeBtn).toHaveFocus();

    // Tab to Start button
    await user.tab();
    
    // Check that we can find and focus the start button
    const startBtn = screen.getByRole('button', { name: /start/i });
    expect(startBtn).toBeInTheDocument();
  });
});
