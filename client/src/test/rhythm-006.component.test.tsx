/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Rhythm006Game } from '../components/Rhythm006Game';

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

// Mock window timers
Object.defineProperty(global, 'window', {
  value: {
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    setTimeout: vi.fn(),
  },
  writable: true,
});

describe('Rhythm006Game Component - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  it('should render the game title', () => {
    render(<Rhythm006Game />);
    expect(screen.getByText('Beat & Pulse Trainer')).toBeInTheDocument();
  });

  it('should render initial score and round', () => {
    render(<Rhythm006Game />);
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('should render mode selection buttons', () => {
    render(<Rhythm006Game />);
    
    expect(screen.getByText('STEADY BEAT')).toBeInTheDocument();
    expect(screen.getByText('BEAT TAPPING')).toBeInTheDocument();
    expect(screen.getByText('INTERNAL PULSE')).toBeInTheDocument();
    expect(screen.getByText('SUBDIVISIONS')).toBeInTheDocument();
    expect(screen.getByText('TEMPO STABILITY')).toBeInTheDocument();
  });

  it('should have a back button', () => {
    render(<Rhythm006Game />);
    expect(screen.getByText('Main Menu')).toBeInTheDocument();
  });

  it('should show correct initial mode', () => {
    render(<Rhythm006Game />);
    expect(screen.getByText('Mode: STEADY BEAT')).toBeInTheDocument();
  });
});

describe('Rhythm006Game Component - Mode Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should switch to beat tapping mode', () => {
    render(<Rhythm006Game />);
    
    const beatTappingButton = screen.getByText('BEAT TAPPING');
    beatTappingButton.click();
    
    expect(screen.getByText('Mode: BEAT TAPPING')).toBeInTheDocument();
  });

  it('should switch to internal pulse mode', () => {
    render(<Rhythm006Game />);
    
    const internalPulseButton = screen.getByText('INTERNAL PULSE');
    internalPulseButton.click();
    
    expect(screen.getByText('Mode: INTERNAL PULSE')).toBeInTheDocument();
  });

  it('should switch to subdivisions mode', () => {
    render(<Rhythm006Game />);
    
    const subdivisionsButton = screen.getByText('SUBDIVISIONS');
    subdivisionsButton.click();
    
    expect(screen.getByText('Mode: SUBDIVISIONS')).toBeInTheDocument();
  });

  it('should switch to tempo stability mode', () => {
    render(<Rhythm006Game />);
    
    const tempoStabilityButton = screen.getByText('TEMPO STABILITY');
    tempoStabilityButton.click();
    
    expect(screen.getByText('Mode: TEMPO STABILITY')).toBeInTheDocument();
  });
});

describe('Rhythm006Game Component - Basic Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render BPM controls in steady beat mode', () => {
    render(<Rhythm006Game />);
    
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('should render tap button in beat tapping mode', () => {
    render(<Rhythm006Game />);
    
    const beatTappingButton = screen.getByText('BEAT TAPPING');
    beatTappingButton.click();
    
    expect(screen.getByText('Tap')).toBeInTheDocument();
  });

  it('should render correct/incorrect buttons', () => {
    render(<Rhythm006Game />);
    
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('should update score when correct is clicked', () => {
    render(<Rhythm006Game />);
    
    const correctButton = screen.getByText('Correct');
    correctButton.click();
    
    expect(screen.getByText('Score: 1')).toBeInTheDocument();
  });

  it('should increment round when answer is given', () => {
    render(<Rhythm006Game />);
    
    const correctButton = screen.getByText('Correct');
    correctButton.click();
    
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });
});