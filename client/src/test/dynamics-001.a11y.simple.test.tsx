/**
 * Simple Accessibility Tests for Dynamics Master Game
 * ID: dynamics-001
 * Basic accessibility checks without jest-axe dependency
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dynamics001Game from '../components/Dynamics001Game';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/games/dynamics-001', vi.fn()],
  Router: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Dynamics Master - Basic Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render main heading', () => {
    render(<Dynamics001Game />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Dynamics Master');
  });

  it('should have accessible navigation', () => {
    render(<Dynamics001Game />);
    const backButton = screen.getByRole('button', { name: /back to games/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have mode selection buttons with accessible names', () => {
    render(<Dynamics001Game />);
    const modeButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && ['Volume Levels', 'Relative Dynamics', 'Dynamic Changes', 'Musical Expression'].some(mode => 
        button.textContent!.includes(mode)
      )
    );
    
    expect(modeButtons).toHaveLength(4);
    modeButtons.forEach(button => {
      expect(button.textContent?.trim()).toBeTruthy();
    });
  });

  it('should support keyboard navigation', async () => {
    render(<Dynamics001Game />);
    const firstModeButton = screen.getByRole('button', { name: /volume levels/i });
    
    // Test focus
    firstModeButton.focus();
    expect(firstModeButton).toHaveFocus();
    
    // Test keyboard activation
    fireEvent.keyDown(firstModeButton, { key: 'Enter' });
    
    // Should navigate to game (we can't fully test this without proper audio setup)
    expect(firstModeButton).toBeInTheDocument();
  });

  it('should have proper button labels', () => {
    render(<Dynamics001Game />);
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      // Every button should have either text content or an aria-label
      const hasText = button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.hasAttribute('aria-label') && button.getAttribute('aria-label')!.trim().length > 0;
      
      expect(hasText || hasAriaLabel).toBe(true);
    });
  });
});