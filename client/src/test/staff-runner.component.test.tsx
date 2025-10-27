/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('StaffRunnerGame component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the game menu initially', () => {
    render(<StaffRunnerGame />);
    
    expect(screen.getByText('Staff Runner')).toBeInTheDocument();
    expect(screen.getByText('Ready to Run?')).toBeInTheDocument();
    expect(screen.getByText('🎵 Identify notes as they appear! 🎵')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });

  it('starts the game when Start Game button is clicked', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    const startButton = screen.getByRole('button', { name: /start game/i });
    await user.click(startButton);
    
    // Should show game canvas and note buttons
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Level: 1')).toBeInTheDocument();
    expect(screen.getByText('Notes: 0')).toBeInTheDocument();
    expect(screen.getByText('Range: Lines')).toBeInTheDocument();
    
    // Note input buttons should be present
    ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(note => {
      expect(screen.getByRole('button', { name: note })).toBeInTheDocument();
    });
  });

  it('pauses and resumes the game', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    // Press 'P' to pause
    await user.keyboard('p');
    
    expect(screen.getByText('Game Paused')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    
    // Click resume
    await user.click(screen.getByRole('button', { name: /resume/i }));
    
    // Should be back to playing (game canvas visible)
    expect(screen.queryByText('Game Paused')).not.toBeInTheDocument();
  });

  it('resets the game from pause menu', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    // Pause and reset
    await user.keyboard('p');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    
    // Should be back to menu
    expect(screen.getByText('Ready to Run?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });

  it('handles volume control', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveValue('30');
    
    await user.clear(volumeSlider);
    await user.type(volumeSlider, '50');
    
    expect(volumeSlider).toHaveValue('50');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('toggles note names display', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    const showNamesButton = screen.getByRole('button', { name: /show names/i });
    expect(showNamesButton).toBeInTheDocument();
    expect(showNamesButton).toHaveTextContent('OFF');
    
    await user.click(showNamesButton);
    
    expect(showNamesButton).toHaveTextContent('ON');
    
    await user.click(showNamesButton);
    
    expect(showNamesButton).toHaveTextContent('OFF');
  });

  it('handles keyboard controls for note answers', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    // Mock active note for testing
    // Note: In real scenario, notes would be generated by game loop
    const mockAudioService = await import('@/lib/audioService');
    
    // Test keyboard inputs (they shouldn't crash)
    await user.keyboard('c');
    await user.keyboard('d');
    await user.keyboard('e');
    await user.keyboard('f');
    await user.keyboard('g');
    await user.keyboard('a');
    await user.keyboard('b');
    
    // Audio service should not be called for error tones since no active note
    expect(mockAudioService.audioService.playErrorTone).not.toHaveBeenCalled();
  });

  it('handles jump controls', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    const mockAudioService = await import('@/lib/audioService');
    
    // Test jump with spacebar
    await user.keyboard(' ');
    
    // Should play jump sound
    expect(mockAudioService.audioService.playNote).toHaveBeenCalledWith(523.25, 0.2);
    
    // Test jump with up arrow
    await user.keyboard('{ArrowUp}');
    
    // Should play jump sound again
    expect(mockAudioService.audioService.playNote).toHaveBeenCalledTimes(2);
  });

  it('shows game over state', () => {
    render(<StaffRunnerGame />);
    
    // Initially should not show game over
    expect(screen.queryByText('Game Complete!')).not.toBeInTheDocument();
  });

  it('navigates back to main menu', async () => {
    const user = userEvent.setup();
    const mockSetLocation = vi.fn();
    
    vi.mock('wouter', () => ({
      useLocation: () => [mockSetLocation, vi.fn()],
    }));
    
    render(<StaffRunnerGame />);
    
    const backButton = screen.getByRole('button', { name: /main menu/i });
    await user.click(backButton);
    
    expect(mockSetLocation).toHaveBeenCalledWith('/');
  });

  it('disables note buttons when no active note', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    // Note buttons should be disabled when no active note
    ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(note => {
      const button = screen.getByRole('button', { name: note });
      expect(button).toBeDisabled();
    });
  });

  it('shows correct game stats', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    // Check initial stats
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Level: 1')).toBeInTheDocument();
    expect(screen.getByText('Notes: 0')).toBeInTheDocument();
    expect(screen.getByText('Range: Lines')).toBeInTheDocument();
  });

  it('displays controls hint', async () => {
    const user = userEvent.setup();
    render(<StaffRunnerGame />);
    
    // Start game
    await user.click(screen.getByRole('button', { name: /start game/i }));
    
    expect(screen.getByText(/SPACE\/↑: Jump \| P: Pause \| Keys C-B: Answer notes/)).toBeInTheDocument();
  });

  it('has proper responsive layout structure', () => {
    render(<StaffRunnerGame />);
    
    // Should have main game container with proper styling
    const gameContainer = document.querySelector('.bg-gradient-to-br.from-teal-900.to-cyan-800');
    expect(gameContainer).toBeInTheDocument();
    
    // Should have back button
    expect(screen.getByRole('button', { name: /main menu/i })).toBeInTheDocument();
    
    // Should have game title
    expect(screen.getByText('Staff Runner')).toBeInTheDocument();
  });
});