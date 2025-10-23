import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Rhythm006Game } from '../components/Rhythm006Game';
import { RHYTHM_006_MODES } from '../lib/gameLogic/rhythm-006Modes';
import { generateRound, validateAnswer, calculateScore } from '../lib/gameLogic/rhythm-006Logic';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => [() => {}, vi.fn()],
}));

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    type: 'square',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { 
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
};

(global as any).AudioContext = vi.fn(() => mockAudioContext);
(global as any).webkitAudioContext = vi.fn(() => mockAudioContext);

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Mock window.setInterval and clearInterval
const mockSetInterval = vi.fn();
const mockClearInterval = vi.fn();
Object.defineProperty(global, 'window', {
  value: {
    setInterval: mockSetInterval,
    clearInterval: mockClearInterval,
    setTimeout: vi.fn(),
  },
  writable: true,
});

describe('rhythm-006 Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateRound', () => {
    it('should generate a round with required properties', () => {
      const round = generateRound('steady-beat', 1);
      
      expect(round).toHaveProperty('id');
      expect(round).toHaveProperty('mode', 'steady-beat');
      expect(round).toHaveProperty('question');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('difficulty', 1);
    });

    it('should generate unique IDs for different rounds', () => {
      const round1 = generateRound('beat-tapping', 2);
      // Mock Date.now to return different values
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);
      const round2 = generateRound('beat-tapping', 2);
      mockDateNow.mockRestore();
      
      expect(round1.id).not.toBe(round2.id);
    });

    it('should support all rhythm-006 modes', () => {
      RHYTHM_006_MODES.forEach((mode: string) => {
        const round = generateRound(mode, 1);
        expect(round.mode).toBe(mode);
      });
    });
  });

  describe('validateAnswer', () => {
    it('should return true for correct answers', () => {
      expect(validateAnswer('correct', 'correct')).toBe(true);
    });

    it('should return false for incorrect answers', () => {
      expect(validateAnswer('wrong', 'correct')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(validateAnswer('Correct', 'correct')).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for incorrect answers', () => {
      expect(calculateScore(false, 1000, 1)).toBe(0);
    });

    it('should calculate base score based on difficulty', () => {
      expect(calculateScore(true, 1000, 1)).toBe(140); // 100*1 + 40 (time bonus)
      expect(calculateScore(true, 1000, 2)).toBe(240); // 100*2 + 40 (time bonus)
    });

    it('should apply time bonus for quick answers', () => {
      const quickScore = calculateScore(true, 1000, 1); // 50 time bonus
      const slowScore = calculateScore(true, 5000, 1);  // 0 time bonus
      
      expect(quickScore).toBeGreaterThan(slowScore);
    });

    it('should not give negative time bonus', () => {
      const score = calculateScore(true, 10000, 1); // Very slow
      expect(score).toBe(100); // Base score only, no negative bonus
    });
  });
});

describe('Rhythm006Game Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the game with initial state', () => {
    render(<Rhythm006Game />);
    
    expect(screen.getByText('Beat & Pulse Trainer')).toBeInTheDocument();
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Mode: STEADY BEAT')).toBeInTheDocument();
  });

  it('should display all mode buttons', () => {
    render(<Rhythm006Game />);
    
    RHYTHM_006_MODES.forEach((mode: string) => {
      expect(screen.getByText(mode.replace(/-/g, ' ').toUpperCase())).toBeInTheDocument();
    });
  });

  it('should switch modes when mode button is clicked', () => {
    render(<Rhythm006Game />);
    
    const beatTappingButton = screen.getByText('BEAT TAPPING');
    fireEvent.click(beatTappingButton);
    
    expect(screen.getByText('Mode: BEAT TAPPING')).toBeInTheDocument();
  });

  describe('Steady Beat Mode', () => {
    it('should display BPM controls', () => {
      render(<Rhythm006Game />);
      
      expect(screen.getByText('BPM')).toBeInTheDocument();
      expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    });

    it('should change BPM when slider is moved', () => {
      render(<Rhythm006Game />);
      
      const bpmSlider = screen.getByDisplayValue('80');
      fireEvent.change(bpmSlider, { target: { value: '120' } });
      
      expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    });

    it('should show start button initially', () => {
      render(<Rhythm006Game />);
      
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.queryByText('Stop')).not.toBeInTheDocument();
    });

    it('should toggle play state when start/stop is clicked', () => {
      render(<Rhythm006Game />);
      
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);
      
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });
  });

  describe('Beat Tapping Mode', () => {
    beforeEach(() => {
      render(<Rhythm006Game />);
      const beatTappingButton = screen.getByText('BEAT TAPPING');
      fireEvent.click(beatTappingButton);
    });

    it('should display tapping controls', () => {
      expect(screen.getByText('Tap with the metronome as precisely as you can.')).toBeInTheDocument();
      expect(screen.getByText('Tap')).toBeInTheDocument();
    });

    it('should show timing error after tapping', () => {
      mockPerformanceNow.mockReturnValue(1000);
      
      const tapButton = screen.getByText('Tap');
      fireEvent.click(tapButton);
      
      expect(screen.getByText(/Avg timing error:/)).toBeInTheDocument();
    });
  });

  describe('Internal Pulse Mode', () => {
    beforeEach(() => {
      render(<Rhythm006Game />);
      const internalPulseButton = screen.getByText('INTERNAL PULSE');
      fireEvent.click(internalPulseButton);
    });

    it('should display internal pulse controls', () => {
      expect(screen.getByText('Listen to two bars, then keep tapping after it goes silent.')).toBeInTheDocument();
      expect(screen.getByText('Start Exercise')).toBeInTheDocument();
      expect(screen.getByText('Tap')).toBeInTheDocument();
    });

    it('should show silent timing error after tapping', () => {
      mockPerformanceNow.mockReturnValue(1000);
      
      const tapButton = screen.getByText('Tap');
      fireEvent.click(tapButton);
      
      expect(screen.getByText(/Avg timing error \(silent\):/)).toBeInTheDocument();
    });
  });

  describe('Subdivisions Mode', () => {
    beforeEach(() => {
      render(<Rhythm006Game />);
      const subdivisionsButton = screen.getByText('SUBDIVISIONS');
      fireEvent.click(subdivisionsButton);
    });

    it('should display subdivision controls', () => {
      expect(screen.getByText('Choose a subdivision and tap evenly on each sub-beat.')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('3x')).toBeInTheDocument();
      expect(screen.getByText('4x')).toBeInTheDocument();
    });

    it('should change subdivision when subdivision button is clicked', () => {
      const subdiv3Button = screen.getByText('3x');
      fireEvent.click(subdiv3Button);
      
      // 3x should be selected (different styling)
      expect(subdiv3Button).toHaveClass('bg-purple-600');
    });

    it('should show timing error after tapping', () => {
      mockPerformanceNow.mockReturnValue(1000);
      
      const tapButton = screen.getByText('Tap');
      fireEvent.click(tapButton);
      
      expect(screen.getByText(/Avg timing error:/)).toBeInTheDocument();
    });
  });

  describe('Tempo Stability Mode', () => {
    beforeEach(() => {
      render(<Rhythm006Game />);
      const tempoStabilityButton = screen.getByText('TEMPO STABILITY');
      fireEvent.click(tempoStabilityButton);
    });

    it('should display tempo stability controls', () => {
      expect(screen.getByText('Tap steadily without a metronome.')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Tap')).toBeInTheDocument();
    });

    it('should show IOI stability after multiple taps', () => {
      // Simulate multiple taps
      const tapTimes = [1000, 1500, 2000, 2500, 3000];
      
      tapTimes.forEach((time: number) => {
        mockPerformanceNow.mockReturnValue(time);
        const tapButton = screen.getByText('Tap');
        fireEvent.click(tapButton);
      });
      
      expect(screen.getByText(/IOI stability \(std dev\):/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have a back button to main menu', () => {
      render(<Rhythm006Game />);
      
      expect(screen.getByText('Main Menu')).toBeInTheDocument();
    });

    it('should update score when correct button is clicked', () => {
      render(<Rhythm006Game />);
      
      const correctButton = screen.getByText('Correct');
      fireEvent.click(correctButton);
      
      expect(screen.getByText('Score: 1')).toBeInTheDocument();
    });

    it('should not update score when incorrect button is clicked', () => {
      render(<Rhythm006Game />);
      
      const incorrectButton = screen.getByText('Incorrect');
      fireEvent.click(incorrectButton);
      
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });

    it('should increment round when answer is given', () => {
      render(<Rhythm006Game />);
      
      const correctButton = screen.getByText('Correct');
      fireEvent.click(correctButton);
      
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should display current round and score', () => {
      render(<Rhythm006Game />);
      
      expect(screen.getByText('Round')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Round 1
      expect(screen.getByText('0')).toBeInTheDocument(); // Score 0
    });
  });
});

describe('Rhythm006Game Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain state across mode switches', () => {
    render(<Rhythm006Game />);
    
    // Start in steady-beat mode
    expect(screen.getByText('Mode: STEADY BEAT')).toBeInTheDocument();
    
    // Switch to beat-tapping mode
    const beatTappingButton = screen.getByText('BEAT TAPPING');
    fireEvent.click(beatTappingButton);
    
    expect(screen.getByText('Mode: BEAT TAPPING')).toBeInTheDocument();
    
    // Score should reset when switching modes
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('should handle rapid mode switching', () => {
    render(<Rhythm006Game />);
    
    // Rapidly switch through all modes
    RHYTHM_006_MODES.forEach((mode: string) => {
      const button = screen.getByText(mode.replace(/-/g, ' ').toUpperCase());
      fireEvent.click(button);
      expect(screen.getByText(`Mode: ${mode.replace(/-/g, ' ').toUpperCase()}`)).toBeInTheDocument();
    });
  });

  it('should handle BPM changes across modes', () => {
    render(<Rhythm006Game />);
    
    // Change BPM in steady-beat mode
    const bpmSlider = screen.getByDisplayValue('80');
    fireEvent.change(bpmSlider, { target: { value: '120' } });
    
    // Switch to another mode
    const beatTappingButton = screen.getByText('BEAT TAPPING');
    fireEvent.click(beatTappingButton);
    
    // BPM should persist
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('should have proper button labels', () => {
    render(<Rhythm006Game />);
    
    // Check that buttons have accessible text
    expect(screen.getByRole('button', { name: /main menu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tap/i })).toBeInTheDocument();
  });

  it('should have proper form controls', () => {
    render(<Rhythm006Game />);
    
    // BPM slider should be accessible
    const bpmSlider = screen.getByRole('slider');
    expect(bpmSlider).toHaveAttribute('min', '40');
    expect(bpmSlider).toHaveAttribute('max', '200');
  });

  it('should have semantic HTML structure', () => {
    render(<Rhythm006Game />);
    
    // Main heading should be present
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Beat & Pulse Trainer');
  });
});