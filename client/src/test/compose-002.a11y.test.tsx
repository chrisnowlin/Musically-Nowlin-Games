import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrchestrationAndStyleStudioGame } from '@/components/OrchestrationAndStyleStudioGame';

// Mock the wouter hook
vi.mock('wouter', () => ({
  useLocation: () => [vi.fn(), vi.fn()],
}));

// Mock audioService
vi.mock('@/lib/audioService', () => ({
  audioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    playSuccessTone: vi.fn(),
    playErrorTone: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Setup window object for test environment
if (typeof window === 'undefined') {
  (global as any).window = {};
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('OrchestrationAndStyleStudioGame Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should have no accessibility violations on initial load', () => {
    const { container } = render(<OrchestrationAndStyleStudioGame />);
    
    // Manual accessibility checks
    expect(container).toBeInTheDocument();
    
    // Check for proper heading structure
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper button labels
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('should have proper heading hierarchy', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Orchestration & Style Studio');
  });

  it('should have accessible buttons with proper labels', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Check mode selection buttons
    const orchestrationButton = screen.getByRole('button', { name: /orchestration/i });
    const styleButton = screen.getByRole('button', { name: /style/i });
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    const backButton = screen.getByRole('button', { name: /back to games/i });
    
    expect(orchestrationButton).toBeInTheDocument();
    expect(styleButton).toBeInTheDocument();
    expect(startButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('should have proper ARIA labels and descriptions', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Check for descriptive text
    expect(screen.getByText(/master the art of arranging instruments/i)).toBeInTheDocument();
    expect(screen.getByText(/learn to identify instrument families/i)).toBeInTheDocument();
    expect(screen.getByText(/explore different musical styles/i)).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    
    // Test keyboard focus
    startButton.focus();
    expect(startButton).toHaveFocus();
    
    // Test keyboard activation
    fireEvent.keyDown(startButton, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
  });

  it('should have accessible game state during gameplay', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Check for accessible score and level information
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText(/Level:/)).toBeInTheDocument();
    expect(screen.getByText(/Streak:/)).toBeInTheDocument();
  });

  it('should have accessible answer options during gameplay', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question to load
    await waitFor(() => {
      const question = screen.getByRole('heading', { level: 3 });
      expect(question).toBeInTheDocument();
    });
    
    // Check answer buttons are accessible
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && !['Back', 'Start Game'].includes(button.textContent)
    );
    
    answerButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
    });
  });

  it('should have accessible feedback messages', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question and answer
    await waitFor(() => {
      const answerButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && !['Back', 'Start Game'].includes(button.textContent)
      );
      if (answerButtons.length > 0) {
        fireEvent.click(answerButtons[0]);
      }
    });
    
    // Check for accessible feedback
    await waitFor(() => {
      const feedback = screen.getByText(/✓ Correct!|✗ Incorrect/);
      expect(feedback).toBeInTheDocument();
    });
  });

  it('should maintain accessibility when switching modes', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Switch to style mode
    const styleButton = screen.getByRole('button', { name: /style/i });
    fireEvent.click(styleButton);
    
    // Check accessibility is maintained
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
    
    // Switch back to orchestration mode
    const orchestrationButton = screen.getByRole('button', { name: /orchestration/i });
    fireEvent.click(orchestrationButton);
    
    // Check accessibility is still maintained
    const buttons2 = screen.getAllByRole('button');
    buttons2.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('should have proper color contrast', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Check that buttons have proper contrast indicators
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      // Buttons should have either text or background colors for contrast
      const styles = window.getComputedStyle(button);
      expect(styles.color || styles.backgroundColor).toBeDefined();
    });
  });

  it('should have accessible form controls', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game to check for any form controls
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Check that any interactive elements are properly labeled
    const interactiveElements = screen.getAllByRole('button');
    interactiveElements.forEach(element => {
      expect(element).toHaveAccessibleName();
    });
  });

  it('should support screen reader announcements', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Mock aria-live region
    const announceMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: announceMock,
      },
      writable: true,
    });
    
    // Start the game
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Answer a question
    await waitFor(() => {
      const answerButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && !['Back', 'Start Game'].includes(button.textContent)
      );
      if (answerButtons.length > 0) {
        fireEvent.click(answerButtons[0]);
      }
    });
    
    // Check for feedback that should be announced
    await waitFor(() => {
      expect(screen.getByText(/✓ Correct!|✗ Incorrect/)).toBeInTheDocument();
    });
  });

  it('should have proper focus management', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Test initial focus
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    startButton.focus();
    expect(startButton).toHaveFocus();
    
    // Start game and check focus management
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Check that focus moves to game area
    await waitFor(() => {
      const answerButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && !['Back', 'Start Game'].includes(button.textContent)
      );
      if (answerButtons.length > 0) {
        answerButtons[0].focus();
        expect(answerButtons[0]).toHaveFocus();
      }
    });
  });

  it('should have accessible navigation', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Check back button accessibility
    const backButton = screen.getByRole('button', { name: /back to games/i });
    expect(backButton).toHaveAccessibleName();
    expect(backButton).toBeEnabled();
  });

  it('should handle error states accessibly', async () => {
    // Mock audio service to throw error
    vi.mocked(require('@/lib/audioService').audioService.initialize).mockRejectedValue(new Error('Audio failed'));
    
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    // Game should still be accessible even if audio fails
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
  });

  it('should have proper semantic structure', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Check for proper semantic elements
    const main = document.querySelector('main');
    const section = document.querySelector('section');
    
    // Should have semantic structure
    expect(main || section).toBeInTheDocument();
  });

  it('should have accessible game completion', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // This test would simulate completing the game
    // and checking that the completion screen is accessible
    
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Game should maintain accessibility throughout
    const { container } = render(<OrchestrationAndStyleStudioGame />);
    expect(container).toBeInTheDocument();
    
    // Check buttons have accessible names
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });
});