import { describe, it, expect } from 'vitest';
import { getCross001Mode, cross001Modes } from '../lib/gameLogic/cross-001Modes';

describe('CrossCurricularMusicMasterGame Accessibility', () => {
  it('should have accessible mode definitions', () => {
    expect(cross001Modes).toHaveLength(3);
    
    cross001Modes.forEach(mode => {
      expect(mode.id).toBeDefined();
      expect(mode.label).toBeDefined();
      expect(mode.emoji).toBeDefined();
      expect(mode.description).toBeDefined();
      expect(mode.instructions).toBeDefined();
      expect(mode.difficultyCurve).toBeDefined();
    });
  });

  it('should have accessible mode labels', () => {
    const modes = cross001Modes.map(m => m.label);
    expect(modes).toContain('Music Math');
    expect(modes).toContain('Musical Language');
    expect(modes).toContain('Music & Movement');
  });

  it('should have meaningful descriptions', () => {
    cross001Modes.forEach(mode => {
      expect(mode.description.length).toBeGreaterThan(10);
      expect(mode.instructions.length).toBeGreaterThan(10);
    });
  });

  it('should have proper difficulty curves', () => {
    cross001Modes.forEach(mode => {
      const curve1 = mode.difficultyCurve(1);
      const curve3 = mode.difficultyCurve(3);
      const curve5 = mode.difficultyCurve(5);
      
      expect(curve1.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve1.difficulty).toBeLessThanOrEqual(5);
      expect(curve3.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve3.difficulty).toBeLessThanOrEqual(5);
      expect(curve5.difficulty).toBeGreaterThanOrEqual(1);
      expect(curve5.difficulty).toBeLessThanOrEqual(5);
    });
  });

  it('should have proper heading hierarchy', () => {
    renderComponent();
    
    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { name: /cross-curricular music master/i });
    expect(mainHeading.tagName).toBe('H1');
    
    // Mode selection heading should be h2
    const modeHeading = screen.getByRole('heading', { name: /select mode/i });
    expect(modeHeading.tagName).toBe('H2');
    
    // Instructions heading should be h3
    const instructionsHeading = screen.getByRole('heading', { name: /how to play/i });
    expect(instructionsHeading.tagName).toBe('H3');
  });

  it('should have accessible mode selection buttons', () => {
    renderComponent();
    
    const modeButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Music Math') ||
      button.textContent?.includes('Musical Language') ||
      button.textContent?.includes('Music & Movement')
    );
    
    expect(modeButtons).toHaveLength(3);
    
    modeButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
      // Should have accessible name
      expect(button).toHaveAccessibleName();
    });
  });

  it('should have proper ARIA labels and descriptions', () => {
    renderComponent();
    
    // Check for proper button descriptions
    const startButton = screen.getByRole('button', { name: /start/i });
    expect(startButton).toHaveAccessibleName();
    
    // Back button should have proper labeling
    const backButton = screen.getByRole('button', { name: /main menu/i });
    expect(backButton).toHaveAccessibleName();
  });

  it('should support keyboard navigation', () => {
    renderComponent();
    
    const startButton = screen.getByRole('button', { name: /start/i });
    startButton.focus();
    expect(startButton).toHaveFocus();
  });

  it('should have accessible form controls during gameplay', async () => {
    renderComponent();
    
    // Start the game
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    // Wait for game to load
    const roundInfo = await screen.findByText(/round/i);
    expect(roundInfo).toBeInTheDocument();
    
    // Answer options should be accessible
    const answerButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('Replay') &&
      !button.textContent?.includes('Main Menu')
    );
    
    answerButtons.forEach(button => {
      expect(button).toHaveAccessibleName();
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('should have proper focus management', () => {
    renderComponent();
    
    // Focus should be manageable
    const startButton = screen.getByRole('button', { name: /start/i });
    startButton.focus();
    expect(startButton).toHaveFocus();
    
    // Mode buttons should be focusable
    const modeButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Music Math') ||
      button.textContent?.includes('Musical Language') ||
      button.textContent?.includes('Music & Movement')
    );
    
    modeButtons[0].focus();
    expect(modeButtons[0]).toHaveFocus();
  });

  it('should have accessible progress indicators', async () => {
    renderComponent();
    
    // Start the game
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    // Progress should be announced
    const progressText = await screen.findByText(/progress/i);
    expect(progressText).toBeInTheDocument();
    
    // Round counter should be accessible
    const roundCounter = screen.getByText(/round/i);
    expect(roundCounter).toBeInTheDocument();
  });

  it('should have proper error handling and feedback', async () => {
    renderComponent();
    
    // Start the game
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    // Wait for question
    await screen.findByText(/round/i);
    
    // Answer a question
    const answerButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('Replay') &&
      !button.textContent?.includes('Main Menu')
    );
    
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      // Result should be announced
      await screen.findByText(/correct|incorrect/i);
    }
  });

  it('should have accessible help content', () => {
    renderComponent();
    
    // Instructions should be accessible
    const instructionsHeading = screen.getByRole('heading', { name: /how to play/i });
    expect(instructionsHeading).toBeInTheDocument();
    
    // Help content should be readable
    const helpContent = screen.getByText(/listen carefully/i);
    expect(helpContent).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    const { container } = renderComponent();
    
    // Should have proper landmarks
    expect(container.querySelector('main')).toBeInTheDocument();
    
    // Should have proper sections
    const sections = container.querySelectorAll('section, [role="region"]');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should have accessible statistics display', () => {
    renderComponent();
    
    // Statistics should be properly labeled
    const statsHeading = screen.getByRole('heading', { name: /statistics/i });
    expect(statsHeading).toBeInTheDocument();
    
    // Stats should have proper labels
    const highScoreLabel = screen.getByText(/high score/i);
    const roundsPlayedLabel = screen.getByText(/rounds played/i);
    const levelLabel = screen.getByText(/level/i);
    
    expect(highScoreLabel).toBeInTheDocument();
    expect(roundsPlayedLabel).toBeInTheDocument();
    expect(levelLabel).toBeInTheDocument();
  });
});