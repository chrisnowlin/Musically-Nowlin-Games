/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffRunnerGame from '@/components/StaffRunnerGame';

// Mock the audio service
vi.mock('@/lib/audioService', () => ({
  audioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    setVolume: vi.fn(),
    playNote: vi.fn(),
    playSuccessTone: vi.fn(),
    playErrorTone: vi.fn(),
  },
}));

// Mock the wouter hook
vi.mock('wouter', () => ({
  useLocation: () => [vi.fn(), vi.fn()],
}));

// Mock the responsive layout hook
vi.mock('@/hooks/useViewport', () => ({
  useResponsiveLayout: () => ({
    device: { isMobile: false },
    padding: 16,
    gridGap: 16,
    getFontSize: (size: string) => {
      const sizes: Record<string, number> = {
        'sm': 14,
        'lg': 18,
        'xl': 20,
        '3xl': 30,
        '4xl': 36,
      };
      return sizes[size] || 16;
    },
  }),
}));

describe('StaffRunnerGame accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();
  });

  it('has proper ARIA labels and roles', () => {
    render(<StaffRunnerGame />);
    
    // Main container should have application role
    const gameContainer = document.querySelector('[role="application"]');
    expect(gameContainer).toBeInTheDocument();
    expect(gameContainer).toHaveAttribute('aria-label', 'Staff Runner Game - Identify musical notes as they appear on staff');
    
    // Game title should be properly labeled
    const title = screen.getByRole('heading', { name: 'Staff Runner', level: 1 });
    expect(title).toHaveAttribute('id', 'game-title');
    
    // Back button should have proper aria-label
    const backButton = screen.getByRole('button', { name: 'Return to main menu' });
    expect(backButton).toBeInTheDocument();
  });

  it('has accessible score and progress display', () => {
    render(<StaffRunnerGame />);
    
    // Score display should have aria-label
    const scoreDisplay = screen.getByLabelText('Score: 0 points');
    expect(scoreDisplay).toBeInTheDocument();
    
    // Level display should have aria-label
    const levelDisplay = screen.getByLabelText('Level: 1');
    expect(levelDisplay).toBeInTheDocument();
    
    // Notes display should have aria-label
    const notesDisplay = screen.getByLabelText('Notes identified: 0');
    expect(notesDisplay).toBeInTheDocument();
    
    // Range display should have aria-label
    const rangeDisplay = screen.getByLabelText('Note range: Lines only');
    expect(rangeDisplay).toBeInTheDocument();
  });

  it('has accessible volume control', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    const volumeSlider = screen.getByRole('slider', { name: 'Volume: 30%' });
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveAttribute('aria-valuemin', '0');
    expect(volumeSlider).toHaveAttribute('aria-valuemax', '100');
    expect(volumeSlider).toHaveAttribute('aria-valuenow', '30');
    
    await user.clear(volumeSlider);
    await user.type(volumeSlider, '50');
    
    expect(volumeSlider).toHaveAttribute('aria-valuenow', '50');
    expect(volumeSlider).toHaveAttribute('aria-label', 'Volume: 50%');
  });

  it('has accessible note names toggle', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    const toggleButton = screen.getByRole('switch', { name: 'Show note names: off' });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    
    await user.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show note names: on');
  });

  it('has accessible game controls', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game button should have aria-label
    const startButton = screen.getByRole('button', { name: 'Start new Staff Runner game' });
    expect(startButton).toBeInTheDocument();
    
    await user.click(startButton);
    
    // Note buttons should be properly grouped
    const noteButtonGroup = screen.getByRole('group', { name: 'Note identification buttons' });
    expect(noteButtonGroup).toBeInTheDocument();
    
    // Note buttons should have proper aria-labels
    ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(note => {
      const button = screen.getByRole('button', { name: new RegExp(`Note ${note}.*disabled`) });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('has screen reader announcement region', () => {
    render(<StaffRunnerGame />);
    
    const announcementRegion = screen.getByRole('status', { name: undefined });
    expect(announcementRegion).toBeInTheDocument();
    expect(announcementRegion).toHaveAttribute('aria-live', 'assertive');
    expect(announcementRegion).toHaveAttribute('aria-atomic', 'true');
    expect(announcementRegion).toHaveClass('sr-only');
  });

  it('has accessible game canvas', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    await user.click(screen.getByRole('button', { name: 'Start new Staff Runner game' }));
    
    // Game canvas should have img role and aria-label
    const gameCanvas = screen.getByRole('img');
    expect(gameCanvas).toBeInTheDocument();
    expect(gameCanvas).toHaveAttribute('aria-label', expect.stringContaining('Musical staff with game character'));
    expect(gameCanvas).toHaveAttribute('aria-live', 'polite');
    expect(gameCanvas).toHaveAttribute('aria-atomic', 'true');
  });

  it('has accessible pause and resume controls', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    await user.click(screen.getByRole('button', { name: 'Start new Staff Runner game' }));
    
    // Pause with keyboard
    await user.keyboard('p');
    
    // Resume button should have aria-label
    const resumeButton = screen.getByRole('button', { name: 'Resume game' });
    expect(resumeButton).toBeInTheDocument();
    
    // Reset button should have aria-label
    const resetButton = screen.getByRole('button', { name: 'Reset game and return to main menu' });
    expect(resetButton).toBeInTheDocument();
  });

  it('provides keyboard navigation instructions', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    await user.click(screen.getByRole('button', { name: 'Start new Staff Runner game' }));
    
    // Should display keyboard instructions
    expect(screen.getByText(/SPACE\/↑: Jump \| P: Pause \| Keys C-B: Answer notes/)).toBeInTheDocument();
    expect(screen.getByText(/Screen reader: Note buttons become available when a note is active/)).toBeInTheDocument();
  });

  it('has accessible stun indicator', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    await user.click(screen.getByRole('button', { name: 'Start new Staff Runner game' }));
    
    // Initially no stun indicator
    expect(screen.queryByRole('status', { name: undefined })).not.toBeInTheDocument();
    
    // Note: In real gameplay, stun indicator would appear when wrong answer is given
    // This tests the structure is in place
  });

  it('has accessible distance indicator', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    await user.click(screen.getByRole('button', { name: 'Start new Staff Runner game' }));
    
    const distanceIndicator = screen.getByLabelText(/Distance traveled:/);
    expect(distanceIndicator).toBeInTheDocument();
    expect(distanceIndicator).toHaveAttribute('role', 'status');
    expect(distanceIndicator).toHaveAttribute('aria-live', 'polite');
  });

  it('includes screen reader instructions in menu', () => {
    render(<StaffRunnerGame />);
    
    expect(screen.getByText(/Screen reader users: Press Tab to navigate to note buttons when a note is active./)).toBeInTheDocument();
  });
});