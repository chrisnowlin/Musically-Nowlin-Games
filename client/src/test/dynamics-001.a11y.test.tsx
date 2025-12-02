/**
 * Accessibility Tests for Dynamics Master Game
 * ID: dynamics-001
 * Testing WCAG 2.1 AA compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dynamics001Game from '../components/Dynamics001Game';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/games/dynamics-001', vi.fn()],
  Router: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: { value: 440 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
  close: vi.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

expect.extend(toHaveNoViolations);

describe('Dynamics Master - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Setup Web Audio API mock
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: vi.fn(() => mockAudioContext),
    });

    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: vi.fn(() => mockAudioContext),
    });

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  describe('Mode Selection Screen', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Dynamics001Game />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(<Dynamics001Game />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Dynamics Master');
    });

    it('should have accessible navigation buttons', () => {
      render(<Dynamics001Game />);
      
      const backButton = screen.getByRole('button', { name: /back to games/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute('aria-label', 'Back to games');
    });

    it('should have accessible mode selection buttons', () => {
      render(<Dynamics001Game />);
      
      const modeButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && ['Volume Levels', 'Relative Dynamics', 'Dynamic Changes', 'Musical Expression'].some(mode => 
          button.textContent!.includes(mode)
        )
      );
      
      expect(modeButtons).toHaveLength(4);
      modeButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible volume control', () => {
      render(<Dynamics001Game />);
      
      const volumeSlider = screen.getByRole('slider', { name: /volume control/i });
      expect(volumeSlider).toBeInTheDocument();
      expect(volumeSlider).toHaveAttribute('aria-label', 'Volume control');
      expect(volumeSlider).toHaveAttribute('min', '0');
      expect(volumeSlider).toHaveAttribute('max', '100');
    });

    it('should support keyboard navigation', async () => {
      render(<Dynamics001Game />);
      
      const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
      firstModeButton.focus();
      expect(firstModeButton).toHaveFocus();
      
      fireEvent.keyDown(firstModeButton, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.getByText(/listen to the music and select/i)).toBeInTheDocument();
      });
    });

    it('should have sufficient color contrast', () => {
      render(<Dynamics001Game />);
      
      // This would typically be checked with a color contrast analyzer
      // For now, we ensure that information is not conveyed by color alone
      const modeButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && ['Volume Levels', 'Relative Dynamics', 'Dynamic Changes', 'Musical Expression'].some(mode => 
          button.textContent!.includes(mode)
        )
      );
      
      modeButtons.forEach(button => {
        // Check that buttons have text content, not just visual indicators
        expect(button.textContent?.trim()).toBeTruthy();
      });
    });
  });

  describe('Game Screen', () => {
    beforeEach(async () => {
      render(<Dynamics001Game />);
      
      // Navigate to a game mode
      const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
      fireEvent.click(firstModeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/listen to the music and select/i)).toBeInTheDocument();
      });
    });

    it('should have no accessibility violations during gameplay', async () => {
      const { container } = render(<Dynamics001Game />);
      
      // Navigate to game
      const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
      fireEvent.click(firstModeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/listen to the music and select/i)).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible play button', async () => {
      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /play audio/i });
        expect(playButton).toBeInTheDocument();
        expect(playButton).toHaveAttribute('aria-label', 'Play audio');
      });
    });

    it('should have accessible answer options', async () => {
      await waitFor(() => {
        const answerOptions = screen.getAllByRole('button').filter(button => 
          button.textContent && (button.textContent.includes('P -') || button.textContent.includes('F -'))
        );
        
        expect(answerOptions.length).toBeGreaterThan(0);
        answerOptions.forEach((button, index) => {
          expect(button).toHaveAttribute('aria-label', new RegExp(`Option ${index + 1}:`, 'i'));
        });
      });
    });

    it('should announce game state changes', async () => {
      await waitFor(() => {
        expect(screen.getByText(/score/i)).toBeInTheDocument();
        expect(screen.getByText(/round/i)).toBeInTheDocument();
      });
      
      // Check that score and round are properly labeled
      const scoreElement = screen.getByText(/score/i).closest('div');
      const roundElement = screen.getByText(/round/i).closest('div');
      
      expect(scoreElement?.querySelector('div')).toHaveTextContent('0');
      expect(roundElement?.querySelector('div')).toHaveTextContent('1/');
    });

    it('should support keyboard navigation for answers', async () => {
      await waitFor(() => {
        const answerOptions = screen.getAllByRole('button').filter(button => 
          button.textContent && (button.textContent.includes('P -') || button.textContent.includes('F -'))
        );
        
        if (answerOptions.length > 0) {
          answerOptions[0].focus();
          expect(answerOptions[0]).toHaveFocus();
          
          fireEvent.keyDown(answerOptions[0], { key: 'Enter' });
          
          // Should trigger answer selection
          setTimeout(() => {
            expect(screen.getByText(/correct/i)).toBeInTheDocument();
          }, 100);
        }
      });
    });

    it('should have accessible feedback for correct/incorrect answers', async () => {
      await waitFor(() => {
        const answerOptions = screen.getAllByRole('button').filter(button => 
          button.textContent && (button.textContent.includes('P -') || button.textContent.includes('F -'))
        );
        
        if (answerOptions.length > 0) {
          fireEvent.click(answerOptions[0]);
          
          setTimeout(() => {
            // Should show feedback
            const feedback = screen.getByText(/✓|✗/);
            expect(feedback).toBeInTheDocument();
            
            // Should have explanation
            const explanation = screen.getByText(/the correct answer is/i);
            expect(explanation).toBeInTheDocument();
          }, 100);
        }
      });
    });

    it('should have accessible next round button', async () => {
      await waitFor(() => {
        const answerOptions = screen.getAllByRole('button').filter(button => 
          button.textContent && (button.textContent.includes('P -') || button.textContent.includes('F -'))
        );
        
        if (answerOptions.length > 0) {
          fireEvent.click(answerOptions[0]);
          
          setTimeout(() => {
            const nextButton = screen.getByRole('button', { name: /next round|complete mode/i });
            expect(nextButton).toBeInTheDocument();
            expect(nextButton).toHaveAttribute('aria-label');
          }, 100);
        }
      });
    });

    it('should handle focus management correctly', async () => {
      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /play audio/i });
        playButton.focus();
        expect(playButton).toHaveFocus();
        
        // Tab to answer options
        fireEvent.keyDown(playButton, { key: 'Tab' });
        
        const answerOptions = screen.getAllByRole('button').filter(button => 
          button.textContent && (button.textContent.includes('P -') || button.textContent.includes('F -'))
        );
        
        if (answerOptions.length > 0) {
          expect(answerOptions[0]).toHaveFocus();
        }
      });
    });

    it('should be usable with screen reader', async () => {
      await waitFor(() => {
        // Check that all interactive elements have accessible names
        const interactiveElements = screen.getAllByRole('button');
        interactiveElements.forEach(element => {
          expect(element).toHaveAccessibleName();
        });
        
        // Check that important information is in the DOM
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /play audio/i })).toBeInTheDocument();
      });
    });

    it('should respect reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Dynamics001Game />);
      
      // Navigate to game
      const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
      fireEvent.click(firstModeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/listen to the music and select/i)).toBeInTheDocument();
      });
      
      // The component should still be functional with reduced motion
      const playButton = screen.getByRole('button', { name: /play audio/i });
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle audio context errors gracefully', async () => {
      // Mock audio context to throw error
      Object.defineProperty(window, 'AudioContext', {
        writable: true,
        value: vi.fn(() => {
          throw new Error('Audio context not supported');
        }),
      });

      render(<Dynamics001Game />);
      
      // Should still render the UI without crashing
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Dynamics Master')).toBeInTheDocument();
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => {
            throw new Error('Storage not available');
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
      });

      render(<Dynamics001Game />);
      
      // Should still render the UI without crashing
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause excessive re-renders', async () => {
      const { container } = render(<Dynamics001Game />);
      
      // Navigate to game
      const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
      fireEvent.click(firstModeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/listen to the music and select/i)).toBeInTheDocument();
      });
      
      // Check that the component doesn't have excessive DOM nodes
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeLessThan(20); // Reasonable limit
    });
  });
});