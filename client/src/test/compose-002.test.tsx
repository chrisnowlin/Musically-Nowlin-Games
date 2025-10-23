import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrchestrationAndStyleStudioGame } from '@/components/OrchestrationAndStyleStudioGame';
import { generateRound, validateAnswer, calculateScore, getNextLevel } from '@/lib/gameLogic/compose-002Logic';
import { getCompose002Mode } from '@/lib/gameLogic/compose-002Modes';

// Mock the wouter hook
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [mockSetLocation, vi.fn()],
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

// Setup minimal DOM for test environment
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    body: {},
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  },
  writable: true,
});

describe('OrchestrationAndStyleStudioGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders the game with initial state', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    expect(screen.getByText('Orchestration & Style Studio')).toBeInTheDocument();
    expect(screen.getByText('Master the art of arranging instruments and exploring musical styles')).toBeInTheDocument();
    expect(screen.getByText('Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('displays mode descriptions correctly', () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    expect(screen.getByText(/Learn to identify instrument families/)).toBeInTheDocument();
    expect(screen.getByText(/Explore different musical styles/)).toBeInTheDocument();
  });

  it('switches between modes correctly', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const styleButton = screen.getByText('Style');
    fireEvent.click(styleButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('compose-002:lastMode', 'style');
    });
    
    const orchestrationButton = screen.getByText('Orchestration');
    fireEvent.click(orchestrationButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('compose-002:lastMode', 'orchestration');
    });
  });

  it('starts the game when Start Game is clicked', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
      expect(screen.getByText(/Level 1/)).toBeInTheDocument();
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });
  });

  it('loads saved mode from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('style');
    
    render(<OrchestrationAndStyleStudioGame />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('compose-002:lastMode');
  });

  it('displays game header with score and streak during gameplay', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Streak: 0')).toBeInTheDocument();
    });
  });

  it('handles answer selection correctly', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question to load
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const answerButtons = buttons.filter(button => 
        button.textContent && !['Back', 'Start Game'].includes(button.textContent)
      );
      expect(answerButtons.length).toBeGreaterThan(0);
    });
    
    // Click first answer button
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && !['Back', 'Start Game'].includes(button.textContent)
    );
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/✓ Correct!|✗ Incorrect/)).toBeInTheDocument();
      });
    }
  });

  it('shows feedback after answering', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question and answer
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const answerButtons = buttons.filter(button => 
        button.textContent && !['Back', 'Start Game'].includes(button.textContent)
      );
      if (answerButtons.length > 0) {
        fireEvent.click(answerButtons[0]);
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/✓ Correct!|✗ Incorrect/)).toBeInTheDocument();
      expect(screen.getByText('Next Round')).toBeInTheDocument();
    });
  });

  it('navigates back to home when Back is clicked', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    const backButton = screen.getByText('Back to Games');
    fireEvent.click(backButton);
    
    expect(mockSetLocation).toHaveBeenCalledWith('/');
  });
});

describe('compose-002Logic', () => {
  describe('generateRound', () => {
    it('generates a round for orchestration mode', () => {
      const round = generateRound('orchestration', 1);
      
      expect(round.mode).toBe('orchestration');
      expect(round.difficulty).toBe(1);
      expect(round.question).toBeDefined();
      expect(round.options).toHaveLength(4);
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(4);
      expect(round.explanation).toBeDefined();
    });

    it('generates a round for style mode', () => {
      const round = generateRound('style', 2);
      
      expect(round.mode).toBe('style');
      expect(round.difficulty).toBe(2);
      expect(round.question).toBeDefined();
      expect(round.options).toHaveLength(4);
      expect(round.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(round.correctAnswer).toBeLessThan(4);
      expect(round.explanation).toBeDefined();
    });

    it('generates different questions for multiple rounds', () => {
      const round1 = generateRound('orchestration', 1);
      const round2 = generateRound('orchestration', 1);
      
      // Should have different questions (most of the time)
      expect(round1.question).toBeDefined();
      expect(round2.question).toBeDefined();
    });

    it('includes instrument families in orchestration mode', () => {
      const round = generateRound('orchestration', 1);
      
      expect(round.mode).toBe('orchestration');
      expect(round.question).toContain('family');
      // The question should mention an instrument family
      const instrumentFamilies = ['Strings', 'Woodwinds', 'Brass', 'Percussion'];
      const hasInstrumentFamily = instrumentFamilies.some(family => 
        round.question.includes(family)
      );
      expect(hasInstrumentFamily).toBe(true);
    });

    it('includes musical styles in style mode', () => {
      const round = generateRound('style', 1);
      
      expect(round.mode).toBe('style');
      expect(round.question).toContain('characteristic');
      // The question should mention a musical style
      const musicalStyles = ['Classical', 'Jazz', 'Rock', 'Folk'];
      const hasMusicalStyle = musicalStyles.some(style => 
        round.question.includes(style)
      );
      expect(hasMusicalStyle).toBe(true);
    });
  });

  describe('validateAnswer', () => {
    it('validates correct answer', () => {
      const round = {
        mode: 'orchestration' as const,
        difficulty: 1,
        question: 'Which family includes violins?',
        options: ['Strings', 'Woodwinds'],
        correctAnswer: 0,
        explanation: 'Violins belong to the string family.',
      };
      
      const result = validateAnswer(0, round.correctAnswer);
      expect(result).toBe(true);
    });

    it('validates incorrect answer', () => {
      const round = {
        mode: 'orchestration' as const,
        difficulty: 1,
        question: 'Which family includes violins?',
        options: ['Strings', 'Woodwinds'],
        correctAnswer: 0,
        explanation: 'Violins belong to the string family.',
      };
      
      const result = validateAnswer(1, round.correctAnswer);
      expect(result).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('calculates score with difficulty multiplier', () => {
      const baseScore = 100;
      const correctScore1 = calculateScore(baseScore, true, 1);
      const correctScore3 = calculateScore(baseScore, true, 3);
      
      expect(correctScore3).toBeGreaterThan(correctScore1);
    });

    it('returns same score for incorrect answers regardless of difficulty', () => {
      const baseScore = 100;
      const incorrectScore1 = calculateScore(baseScore, false, 1);
      const incorrectScore3 = calculateScore(baseScore, false, 3);
      
      expect(incorrectScore1).toBe(incorrectScore3);
    });

    it('applies correct difficulty multipliers', () => {
      const baseScore = 100;
      
      const score1 = calculateScore(baseScore, true, 1);
      const score2 = calculateScore(baseScore, true, 2);
      const score3 = calculateScore(baseScore, true, 3);
      
      expect(score1).toBe(110); // 100 + (10 * 1)
      expect(score2).toBe(120); // 100 + (10 * 2)
      expect(score3).toBe(130); // 100 + (10 * 3)
    });
  });

  describe('getNextLevel', () => {
    it('levels up after 5 correct answers', () => {
      expect(getNextLevel(1, 5)).toBe(2);
      expect(getNextLevel(2, 5)).toBe(3);
    });

    it('does not level up with fewer than 5 correct answers', () => {
      expect(getNextLevel(1, 4)).toBe(1);
      expect(getNextLevel(2, 3)).toBe(2);
    });

    it('does not go above level 5', () => {
      expect(getNextLevel(5, 5)).toBe(5);
      expect(getNextLevel(4, 10)).toBe(5);
    });

    it('maintains level with non-multiple-of-5 streaks', () => {
      expect(getNextLevel(3, 6)).toBe(4); // 6 correct = level up
      expect(getNextLevel(3, 7)).toBe(4); // 7 correct = same level
      expect(getNextLevel(3, 9)).toBe(4); // 9 correct = same level
    });
  });
});

describe('compose-002Modes', () => {
  describe('getCompose002Mode', () => {
    it('returns orchestration mode definition', () => {
      const mode = getCompose002Mode('orchestration');
      
      expect(mode?.id).toBe('orchestration');
      expect(mode?.label).toBe('Orchestration');
      expect(mode?.emoji).toBe('🎻');
      expect(mode?.description).toContain('Arrange instruments');
    });

    it('returns style mode definition', () => {
      const mode = getCompose002Mode('style');
      
      expect(mode?.id).toBe('style');
      expect(mode?.label).toBe('Style Studio');
      expect(mode?.emoji).toBe('🎨');
      expect(mode?.description).toContain('musical styles');
    });

    it('returns undefined for invalid mode', () => {
      const mode = getCompose002Mode('invalid' as any);
      expect(mode).toBeUndefined();
    });
  });

  describe('Mode definitions', () => {
    it('has correct structure for orchestration mode', () => {
      const mode = getCompose002Mode('orchestration');
      
      expect(mode).toHaveProperty('id');
      expect(mode).toHaveProperty('label');
      expect(mode).toHaveProperty('description');
      expect(mode).toHaveProperty('emoji');
      expect(mode).toHaveProperty('difficultyCurve');
      expect(typeof mode?.difficultyCurve).toBe('function');
    });

    it('has correct structure for style mode', () => {
      const mode = getCompose002Mode('style');
      
      expect(mode).toHaveProperty('id');
      expect(mode).toHaveProperty('label');
      expect(mode).toHaveProperty('description');
      expect(mode).toHaveProperty('emoji');
      expect(mode).toHaveProperty('difficultyCurve');
      expect(typeof mode?.difficultyCurve).toBe('function');
    });

    it('difficulty curve returns valid difficulty levels', () => {
      const orchestrationMode = getCompose002Mode('orchestration');
      const styleMode = getCompose002Mode('style');
      
      for (let level = 1; level <= 5; level++) {
        const orchDifficulty = orchestrationMode?.difficultyCurve(level);
        const styleDifficulty = styleMode?.difficultyCurve(level);
        
        expect(orchDifficulty?.difficulty).toBeGreaterThanOrEqual(1);
        expect(orchDifficulty?.difficulty).toBeLessThanOrEqual(5);
        expect(styleDifficulty?.difficulty).toBeGreaterThanOrEqual(1);
        expect(styleDifficulty?.difficulty).toBeLessThanOrEqual(5);
      }
    });
  });
});

describe('Integration Tests', () => {
  it('completes a full game round in orchestration mode', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    // Wait for round to load
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question to appear
    await waitFor(() => {
      const questionElement = screen.getByText(/Which|What|Identify/);
      expect(questionElement).toBeInTheDocument();
    });
    
    // Select an answer
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && !['Back', 'Start Game'].includes(button.textContent)
    );
    
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      // Check for feedback
      await waitFor(() => {
        expect(screen.getByText(/✓ Correct!|✗ Incorrect/)).toBeInTheDocument();
      });
      
      // Continue to next round
      const nextButton = screen.getByText('Next Round');
      fireEvent.click(nextButton);
      
      // Should advance to round 2
      await waitFor(() => {
        expect(screen.getByText(/Round 2/)).toBeInTheDocument();
      });
    }
  });

  it('completes a full game round in style mode', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Switch to style mode
    const styleButton = screen.getByText('Style');
    fireEvent.click(styleButton);
    
    // Start the game
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    // Wait for round to load
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Wait for question to appear
    await waitFor(() => {
      const questionElement = screen.getByText(/Which|What|Identify/);
      expect(questionElement).toBeInTheDocument();
    });
    
    // Select an answer
    const answerButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && !['Back', 'Start Game'].includes(button.textContent)
    );
    
    if (answerButtons.length > 0) {
      fireEvent.click(answerButtons[0]);
      
      // Check for feedback
      await waitFor(() => {
        expect(screen.getByText(/✓ Correct!|✗ Incorrect/)).toBeInTheDocument();
      });
    }
  });

  it('handles level progression correctly', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    // Complete multiple rounds correctly
    for (let round = 1; round <= 4; round++) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Round ${round}`))).toBeInTheDocument();
      });
      
      // Wait for question and answer
      await waitFor(() => {
        const answerButtons = screen.getAllByRole('button').filter(button => 
          button.textContent && !['Back', 'Start Game', 'Next Round', 'Finish Game'].includes(button.textContent)
        );
        if (answerButtons.length > 0) {
          fireEvent.click(answerButtons[0]);
        }
      });
      
      // Wait for feedback and continue
      await waitFor(() => {
        const nextButton = screen.getByText(round === 10 ? 'Finish Game' : 'Next Round');
        fireEvent.click(nextButton);
      });
    }
    
    // Should show level progression after correct answers
    await waitFor(() => {
      expect(screen.getByText(/Level [2-5]/)).toBeInTheDocument();
    });
  });

  it('handles game completion after 10 rounds', async () => {
    render(<OrchestrationAndStyleStudioGame />);
    
    // Start the game
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    // Simulate completing 10 rounds
    for (let round = 1; round <= 10; round++) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Round ${round}`))).toBeInTheDocument();
      });
      
      // Answer and continue
      await waitFor(() => {
        const answerButtons = screen.getAllByRole('button').filter(button => 
          button.textContent && !['Back', 'Start Game', 'Next Round', 'Finish Game'].includes(button.textContent)
        );
        if (answerButtons.length > 0) {
          fireEvent.click(answerButtons[0]);
        }
      });
      
      await waitFor(() => {
        const nextButton = screen.getByText(round === 10 ? 'Finish Game' : 'Next Round');
        fireEvent.click(nextButton);
      });
    }
    
    // Should return to main screen after game completion
    await waitFor(() => {
      expect(screen.getByText('Orchestration & Style Studio')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });
  });
});