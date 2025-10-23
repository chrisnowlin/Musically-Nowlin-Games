import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Compose001Game } from '@/components/Compose001Game';
import { generateRound, validateComposition, calculateScore } from '@/lib/gameLogic/compose-001Logic';
import { getAllModes, getModeDefinition } from '@/lib/gameLogic/compose-001Modes';

// Mock the wouter hook
vi.mock('wouter', () => ({
  useLocation: () => [vi.fn(), vi.fn()],
}));

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
})) as any;

describe('Compose001Game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game with initial state', () => {
    render(<Compose001Game />);
    
    expect(screen.getByText('Composition Studio')).toBeInTheDocument();
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('MELODY')).toBeInTheDocument();
    expect(screen.getByText('RHYTHM')).toBeInTheDocument();
    expect(screen.getByText('HARMONY')).toBeInTheDocument();
  });

  it('switches between modes correctly', async () => {
    render(<Compose001Game />);
    
    const rhythmButton = screen.getByText('RHYTHM');
    fireEvent.click(rhythmButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Mode: RHYTHM/)).toBeInTheDocument();
    });
    
    const harmonyButton = screen.getByText('HARMONY');
    fireEvent.click(harmonyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Mode: HARMONY/)).toBeInTheDocument();
    });
  });

  it('allows note selection in melody mode', async () => {
    render(<Compose001Game />);
    
    await waitFor(() => {
      expect(screen.getByText('Click notes below to compose your melody')).toBeInTheDocument();
    });
    
    const noteButton = screen.getByText('C');
    fireEvent.click(noteButton);
    
    await waitFor(() => {
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  it('allows rhythm selection in rhythm mode', async () => {
    render(<Compose001Game />);
    
    const rhythmButton = screen.getByText('RHYTHM');
    fireEvent.click(rhythmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Click rhythm notes below to compose your pattern')).toBeInTheDocument();
    });
    
    const rhythmButtonElement = screen.getByText('♩');
    fireEvent.click(rhythmButtonElement);
    
    await waitFor(() => {
      expect(screen.getByText('♩')).toBeInTheDocument();
    });
  });

  it('allows chord selection in harmony mode', async () => {
    render(<Compose001Game />);
    
    const harmonyButton = screen.getByText('HARMONY');
    fireEvent.click(harmonyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Click chords below to build your progression')).toBeInTheDocument();
    });
    
    const chordButton = screen.getByText('C Major');
    fireEvent.click(chordButton);
    
    await waitFor(() => {
      expect(screen.getByText('C Major')).toBeInTheDocument();
    });
  });

  it('clears selections when clear button is clicked', async () => {
    render(<Compose001Game />);
    
    await waitFor(() => {
      expect(screen.getByText('Click notes below to compose your melody')).toBeInTheDocument();
    });
    
    const noteButton = screen.getByText('C');
    fireEvent.click(noteButton);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.getByText('Click notes below to compose your melody')).toBeInTheDocument();
    });
  });

  it('adjusts volume correctly', async () => {
    render(<Compose001Game />);
    
    const volumeSlider = screen.getByRole('slider');
    fireEvent.change(volumeSlider, { target: { value: '75' } });
    
    expect(volumeSlider).toHaveValue('75');
  });
});

describe('compose-001Logic', () => {
  describe('generateRound', () => {
    it('generates a round for melody mode', () => {
      const round = generateRound('melody', 1);
      
      expect(round.mode).toBe('melody');
      expect(round.difficulty).toBe(1);
      expect(round.challenge).toBeDefined();
      expect(round.id).toBeDefined();
      expect(round.timeLimit).toBeDefined();
    });

    it('generates a round for rhythm mode', () => {
      const round = generateRound('rhythm', 2);
      
      expect(round.mode).toBe('rhythm');
      expect(round.difficulty).toBe(2);
      expect(round.challenge).toBeDefined();
    });

    it('generates a round for harmony mode', () => {
      const round = generateRound('harmony', 3);
      
      expect(round.mode).toBe('harmony');
      expect(round.difficulty).toBe(3);
      expect(round.challenge).toBeDefined();
    });
  });

  describe('validateComposition', () => {
    it('validates a correct melody composition', () => {
      const round = generateRound('melody', 1);
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback).toBe('Great composition!');
    });

    it('validates a melody that is too short', () => {
      const round = generateRound('melody', 1);
      const composition = {
        type: 'melody' as const,
        notes: ['C'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toBe('Keep working on it!');
    });

    it('validates a correct rhythm composition', () => {
      const round = generateRound('rhythm', 1);
      const composition = {
        type: 'rhythm' as const,
        rhythm: ['♩', '♩', '♩', '♩'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('validates a rhythm with required rest', () => {
      const round = {
        id: 'test-round',
        mode: 'rhythm' as const,
        challenge: {
          id: 'rhythm-002',
          text: 'Create a rhythm with at least one rest',
          difficulty: 2,
          validation: {
            minLength: 3,
            maxLength: 8,
            requiredElements: ['rest'],
          },
        },
        difficulty: 2,
        timeLimit: 100,
      };
      const composition = {
        type: 'rhythm' as const,
        rhythm: ['♩', '𝄽', '♩', '♩'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Includes rest');
    });

    it('validates a correct harmony composition', () => {
      const round = generateRound('harmony', 1);
      const composition = {
        type: 'harmony' as const,
        chords: ['C Major', 'F Major', 'G Major'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('validates an I-IV-V progression', () => {
      const round = {
        id: 'test-round',
        mode: 'harmony' as const,
        challenge: {
          id: 'harmony-004',
          text: 'Build a simple I-IV-V progression',
          difficulty: 2,
          validation: {
            minLength: 3,
            maxLength: 3,
            patterns: [['I-IV-V']],
          },
        },
        difficulty: 2,
        timeLimit: 100,
      };
      const composition = {
        type: 'harmony' as const,
        chords: ['C Major', 'F Major', 'G Major'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Shows I-IV-V pattern');
    });

    it('detects ascending melody pattern', () => {
      const round = generateRound('melody', 1);
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const result = validateComposition(composition, round, 5000);
      
      expect(result.valid).toBe(true);
      expect(result.details?.metRequirements).toContain('Shows ascending pattern');
    });

    it('gives time bonus for quick completion', () => {
      const round = {
        id: 'test-round',
        mode: 'melody' as const,
        challenge: {
          id: 'melody-001',
          text: 'Create an ascending melody using at least 4 notes',
          difficulty: 1,
          validation: {
            minLength: 4,
            maxLength: 8,
            patterns: [['ascending']],
          },
        },
        difficulty: 1,
        timeLimit: 10000, // 10 seconds
      };
      const composition = {
        type: 'melody' as const,
        notes: ['C', 'D', 'E', 'F'],
      };
      
      const quickResult = validateComposition(composition, round, 1000); // 1 second
      const slowResult = validateComposition(composition, round, 15000); // 15 seconds (over limit)
      
      expect(quickResult.score).toBeGreaterThan(slowResult.score);
    });
  });

  describe('calculateScore', () => {
    it('calculates score with difficulty multiplier', () => {
      const validationResult = {
        valid: true,
        score: 100,
        feedback: 'Great!',
      };
      
      const score1 = calculateScore(validationResult, 1);
      const score3 = calculateScore(validationResult, 3);
      
      expect(score3).toBeGreaterThan(score1);
    });

    it('returns 0 for invalid composition', () => {
      const validationResult = {
        valid: false,
        score: 0,
        feedback: 'Keep working!',
      };
      
      const score = calculateScore(validationResult, 2);
      
      expect(score).toBe(0);
    });
  });
});

describe('compose-001Modes', () => {
  describe('getAllModes', () => {
    it('returns all available modes', () => {
      const modes = getAllModes();
      
      expect(modes).toHaveLength(3);
      expect(modes.map(m => m.id)).toContain('melody');
      expect(modes.map(m => m.id)).toContain('rhythm');
      expect(modes.map(m => m.id)).toContain('harmony');
    });
  });

  describe('getModeDefinition', () => {
    it('returns correct mode definition', () => {
      const melodyMode = getModeDefinition('melody');
      
      expect(melodyMode?.id).toBe('melody');
      expect(melodyMode?.name).toBe('Melody');
      expect(melodyMode?.color).toBe('blue');
    });

    it('returns undefined for invalid mode', () => {
      const invalidMode = getModeDefinition('invalid');
      
      expect(invalidMode).toBeUndefined();
    });
  });

  describe('Mode definitions', () => {
    it('has correct structure for all modes', () => {
      const modes = getAllModes();
      
      modes.forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('description');
        expect(mode).toHaveProperty('color');
        expect(mode).toHaveProperty('icon');
        expect(mode).toHaveProperty('instructions');
        expect(mode).toHaveProperty('difficultyRange');
        expect(mode).toHaveProperty('maxRounds');
        expect(Array.isArray(mode.instructions)).toBe(true);
      });
    });
  });
});

describe('Integration Tests', () => {
  it('completes a full game round', async () => {
    render(<Compose001Game />);
    
    // Wait for initial round to load
    await waitFor(() => {
      expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    });
    
    // Add notes in melody mode
    const noteC = screen.getByText('C');
    const noteD = screen.getByText('D');
    const noteE = screen.getByText('E');
    const noteF = screen.getByText('F');
    
    fireEvent.click(noteC);
    fireEvent.click(noteD);
    fireEvent.click(noteE);
    fireEvent.click(noteF);
    
    // Submit the composition
    const submitButton = screen.getByText('Submit Melody');
    fireEvent.click(submitButton);
    
    // Check for feedback
    await waitFor(() => {
      expect(screen.getByText(/Great composition!/)).toBeInTheDocument();
    });
    
    // Check that score increased
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });

  it('handles mode switching during gameplay', async () => {
    render(<Compose001Game />);
    
    // Start in melody mode
    await waitFor(() => {
      expect(screen.getByText(/Mode: MELODY/)).toBeInTheDocument();
    });
    
    // Switch to rhythm mode
    const rhythmButton = screen.getByText('RHYTHM');
    fireEvent.click(rhythmButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Mode: RHYTHM/)).toBeInTheDocument();
    });
    
    // Add rhythm elements
    const rhythmNote = screen.getByText('♩');
    fireEvent.click(rhythmNote);
    fireEvent.click(rhythmNote);
    fireEvent.click(rhythmNote);
    fireEvent.click(rhythmNote);
    
    // Submit rhythm
    const submitButton = screen.getByText('Submit Rhythm');
    fireEvent.click(submitButton);
    
    // Check for feedback
    await waitFor(() => {
      expect(screen.getByText(/Great composition!/)).toBeInTheDocument();
    });
  });
});