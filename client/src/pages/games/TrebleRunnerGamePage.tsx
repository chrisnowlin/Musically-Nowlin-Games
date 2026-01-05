import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

// Note definitions with staff positions (0 = middle line B, positive = up, negative = down)
const NOTE_DEFINITIONS: Record<string, { name: string; position: number; ledger: boolean }> = {
  'C4': { name: 'C', position: -6, ledger: true },  // Middle C
  'D4': { name: 'D', position: -5, ledger: true },
  'E4': { name: 'E', position: -4, ledger: false }, // Bottom line
  'F4': { name: 'F', position: -3, ledger: false },
  'G4': { name: 'G', position: -2, ledger: false },
  'A4': { name: 'A', position: -1, ledger: false },
  'B4': { name: 'B', position: 0, ledger: false },  // Middle line
  'C5': { name: 'C', position: 1, ledger: false },
  'D5': { name: 'D', position: 2, ledger: false },
  'E5': { name: 'E', position: 3, ledger: false },
  'F5': { name: 'F', position: 4, ledger: false },  // Top line
  'G5': { name: 'G', position: 5, ledger: true },
  'A5': { name: 'A', position: 6, ledger: true },
};

// Level configurations
const LEVELS: Record<number, { name: string; subtitle: string; notes: string[]; speed: number; spawnRate: number }> = {
  1: {
    name: 'Space Notes',
    subtitle: 'F - A - C - E',
    notes: ['F4', 'A4', 'C5', 'E5'],
    speed: 1.2,
    spawnRate: 2500,
  },
  2: {
    name: 'Line Notes',
    subtitle: 'E - G - B - D - F',
    notes: ['E4', 'G4', 'B4', 'D5', 'F5'],
    speed: 1.2,
    spawnRate: 2500,
  },
  3: {
    name: 'Mixed Staff',
    subtitle: 'All Notes E - F',
    notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
    speed: 1.2,
    spawnRate: 2500,
  },
  4: {
    name: 'Ledger Lines Below',
    subtitle: 'Adding Middle C & D',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
    speed: 1.2,
    spawnRate: 2500,
  },
  5: {
    name: 'Full Range',
    subtitle: 'All Notes with Ledger Lines',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
    speed: 1.2,
    spawnRate: 2500,
  },
};

// Audio context for sound effects
const playSound = (frequency: number, duration = 0.15, type: OscillatorType = 'sine') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
};

const playCorrectSound = () => playSound(880, 0.1);
const playWrongSound = () => playSound(220, 0.2, 'sawtooth');
const playGameOverSound = () => {
  playSound(330, 0.15);
  setTimeout(() => playSound(220, 0.3), 150);
};

interface StaffNoteProps {
  position: number;
  isActive: boolean;
  feedback: 'correct' | 'wrong' | null;
  x: number;
}

// Musical note component on staff
const StaffNote: React.FC<StaffNoteProps> = ({ position, isActive, feedback, x }) => {
  const LINE_SPACING = 12;
  const STAFF_CENTER = 60; // Center of staff (B4 position)
  
  const y = STAFF_CENTER - (position * LINE_SPACING / 2);
  const ledgerLines = [];
  
  // Calculate ledger lines needed
  if (position <= -5) {
    // Below staff - Middle C and below
    for (let i = -6; i >= position; i -= 2) {
      if (i % 2 === 0) {
        ledgerLines.push(STAFF_CENTER - (i * LINE_SPACING / 2));
      }
    }
  }
  if (position >= 5) {
    // Above staff
    for (let i = 6; i <= position; i += 2) {
      if (i % 2 === 0) {
        ledgerLines.push(STAFF_CENTER - (i * LINE_SPACING / 2));
      }
    }
  }
  
  let noteColor = '#1a1a2e';
  if (feedback === 'correct') noteColor = '#22c55e';
  if (feedback === 'wrong') noteColor = '#ef4444';
  if (isActive) noteColor = '#3b82f6';
  
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Ledger lines */}
      {ledgerLines.map((ly, idx) => (
        <line
          key={idx}
          x1="-14"
          x2="14"
          y1={ly}
          y2={ly}
          stroke="#374151"
          strokeWidth="1.5"
        />
      ))}
      {/* Note head (ellipse) */}
      <ellipse
        cx="0"
        cy={y}
        rx="9"
        ry="7"
        fill={noteColor}
        stroke={isActive ? '#60a5fa' : 'none'}
        strokeWidth="2"
        style={{
          transition: 'fill 0.1s ease',
          filter: feedback === 'correct' ? 'drop-shadow(0 0 8px #22c55e)' : 
                  feedback === 'wrong' ? 'drop-shadow(0 0 8px #ef4444)' : 'none'
        }}
      />
      {/* Note stem */}
      <line
        x1={position < 0 ? "8" : "-8"}
        y1={y}
        x2={position < 0 ? "8" : "-8"}
        y2={position < 0 ? y - 35 : y + 35}
        stroke={noteColor}
        strokeWidth="2"
      />
    </g>
  );
};

// Staff lines component
const Staff = ({ children }: { children: React.ReactNode }) => {
  const LINE_SPACING = 12;
  const STAFF_CENTER = 60;
  const linePositions = [-4, -2, 0, 2, 4]; // E, G, B, D, F lines
  
  return (
    <svg viewBox="0 0 400 120" className="w-full h-32 bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
      {/* Staff lines */}
      {linePositions.map((pos, idx) => (
        <line
          key={idx}
          x1="20"
          x2="390"
          y1={STAFF_CENTER - (pos * LINE_SPACING / 2)}
          y2={STAFF_CENTER - (pos * LINE_SPACING / 2)}
          stroke="#374151"
          strokeWidth="1.5"
        />
      ))}
      
      {/* Treble Clef */}
      <text 
        x="10" 
        y="90" 
        fontSize="98" 
        fill="#1a1a2e" 
        style={{ fontFamily: 'Arial, sans-serif', pointerEvents: 'none', userSelect: 'none' }}
      >
        𝄞
      </text>

      {children}
    </svg>
  );
};

// Runner character
const Runner = ({ isJumping, isStumbling, frame }: { isJumping: boolean; isStumbling: boolean; frame: number }) => {
  // Bobbing motion for running effect
  const runBob = isStumbling ? 0 : Math.sin(frame * 0.5) * 4;
  
  // Position logic: Jump goes up, Stumble drops down/back
  const baseY = isJumping ? 60 : (isStumbling ? 5 : 25);
  const rotation = isStumbling ? -20 : (isJumping ? -10 : 0);
  
  return (
    <div 
      className="absolute transition-all duration-150 z-20"
      style={{ 
        left: '20px', 
        bottom: `${baseY + runBob}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img 
        src="/images/treble-runner-character.png" 
        alt="Runner"
        className="w-40 h-40 object-contain drop-shadow-xl"
        style={{
          filter: isStumbling ? 'brightness(0.8) sepia(1) hue-rotate(-50deg)' : 'none'
        }}
      />
    </div>
  );
};

interface NoteButtonProps {
  note: string;
  onPress: (note: string) => void;
  disabled: boolean;
  isPressed: boolean;
}

// Note button component
const NoteButton: React.FC<NoteButtonProps> = ({ note, onPress, disabled, isPressed }) => (
  <button
    onPointerDown={() => !disabled && onPress(note)}
    disabled={disabled}
    className={`
      w-12 h-16 sm:w-14 sm:h-20 rounded-lg font-bold text-xl sm:text-2xl
      transition-all duration-75 select-none touch-manipulation relative
      flex items-center justify-center overflow-hidden font-serif
      ${disabled 
        ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-80' 
        : isPressed
          ? 'bg-[#CD853F] text-amber-900 translate-y-1 shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] border-t-4 border-amber-800'
          : 'bg-[#D2B48C] text-amber-900 shadow-[0_4px_0_rgb(139,90,43),0_6px_6px_rgba(0,0,0,0.4)] hover:bg-[#DEB887] active:translate-y-1 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:border-t-4 active:border-amber-800'
      }
    `}
  >
    {/* Wood texture effect */}
    {!disabled && (
      <>
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{
               backgroundImage: `
                 repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(40,20,0,0.2) 4px, rgba(40,20,0,0.2) 6px),
                 repeating-radial-gradient(circle at 50% 0%, transparent, transparent 10px, rgba(60,30,0,0.1) 12px)
               `
             }}
        />
        {/* Inner highlight for 3D effect */}
        {!isPressed && (
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        )}
      </>
    )}

    <span className="relative z-10 drop-shadow-md transform translate-y-[-2px]">{note}</span>
  </button>
);

// Health bar component
const HealthBar = ({ health, maxHealth }: { health: number; maxHealth: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-gray-600">❤️</span>
    <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-300 ${
          health > maxHealth * 0.5 ? 'bg-green-500' : 
          health > maxHealth * 0.25 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${(health / maxHealth) * 100}%` }}
      />
    </div>
  </div>
);

// Game Wrapper for 16:9 aspect ratio with Day/Night cycle
const GameWrapper = ({ children, correctCount = 0 }: { children: React.ReactNode; correctCount?: number }) => {
  const isNight = Math.floor(correctCount / 30) % 2 === 1;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div 
        className="relative w-full aspect-video shadow-2xl overflow-hidden flex flex-col" 
        style={{ 
          maxHeight: '100vh',
          maxWidth: '177.78vh' // 16/9 * 100vh
        }}
      >
        {/* Background Layer - Day */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ 
            backgroundImage: "url('/images/treble-runner-bg-16x9.png')",
            opacity: isNight ? 0 : 1,
            zIndex: 0
          }}
        />
        
        {/* Background Layer - Night */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ 
            backgroundImage: "url('/images/treble-runner-bg-night-16x9.png')",
            opacity: isNight ? 1 : 0,
            zIndex: 0
          }}
        />

        {/* Content Layer */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Game Component
export default function TrebleRunner() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('trebleRunnerHighScores') || '{}');
    } catch {
      return {};
    }
  });
  const [health, setHealth] = useState(100);
  const [streak, setStreak] = useState(0);
  const [notes, setNotes] = useState<any[]>([]);
  const [runnerState, setRunnerState] = useState({ isJumping: false, isStumbling: false });
  const [animFrame, setAnimFrame] = useState(0);
  const [stats, setStats] = useState<{ correct: number; wrong: number; notesPlayed: Record<string, { correct: number; wrong: number }> }>({ correct: 0, wrong: 0, notesPlayed: {} });
  const [pressedNote, setPressedNote] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const noteIdRef = useRef(0);
  const correctCountRef = useRef(0);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmStartedRef = useRef(false);
  
  const MAX_HEALTH = 100;
  const DAMAGE = 20;
  const NOTE_BUTTONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // Save high scores
  useEffect(() => {
    try {
      localStorage.setItem('trebleRunnerHighScores', JSON.stringify(highScores));
    } catch {
      // Storage not available
    }
  }, [highScores]);

  // Initialize background music audio element once
  useEffect(() => {
    const audio = new Audio('/audio/gentle-steps-through-the-green.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.25;
    bgmRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      bgmRef.current = null;
      bgmStartedRef.current = false;
    };
  }, []);

  // Keep background music playing when game is active (and sound is enabled)
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    const shouldPlay =
      bgmStartedRef.current &&
      gameState === 'playing' &&
      soundEnabled;

    if (!shouldPlay) {
      try {
        audio.pause();
      } catch {
        // ignore
      }
      return;
    }

    void audio.play().catch(() => {
      // If play fails due to browser gesture rules, we'll retry on next user gesture.
    });
  }, [gameState, soundEnabled]);

  // Spawn new note
  const spawnNote = useCallback(() => {
    const level = LEVELS[currentLevel];
    const randomNoteKey = level.notes[Math.floor(Math.random() * level.notes.length)];
    const noteData = NOTE_DEFINITIONS[randomNoteKey];
    
    const newNote = {
      id: noteIdRef.current++,
      noteKey: randomNoteKey,
      name: noteData.name,
      position: noteData.position,
      x: 350,
      feedback: null,
      answered: false,
    };
    
    setNotes(prev => [...prev, newNote]);
  }, [currentLevel]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const level = LEVELS[currentLevel];
    
    // Animation frame counter
    const animInterval = setInterval(() => {
      setAnimFrame(f => f + 1);
    }, 50);
    
    // Main game loop - move notes
    gameLoopRef.current = setInterval(() => {
      setNotes(prev => {
        // Speed increases by 2% with each correct answer
        const speedMultiplier = Math.pow(1.02, correctCountRef.current);
        const currentSpeed = level.speed * speedMultiplier;

        const updated = prev.map(note => ({
          ...note,
          x: note.x - currentSpeed,
        }));
        
        // Check for missed notes (passed the answer zone)
        const answerZone = 80;
        updated.forEach(note => {
          if (!note.answered && note.x < answerZone - 30) {
            note.answered = true;
            note.feedback = 'wrong';
            setHealth(h => {
              const newHealth = Math.max(0, h - DAMAGE);
              if (newHealth <= 0) {
                setGameState('gameOver');
                if (soundEnabled) playGameOverSound();
              }
              return newHealth;
            });
            setStreak(0);
            setStats(s => ({
              ...s,
              wrong: s.wrong + 1,
              notesPlayed: {
                ...s.notesPlayed,
                [note.name]: {
                  ...(s.notesPlayed[note.name] || { correct: 0, wrong: 0 }),
                  wrong: ((s.notesPlayed[note.name]?.wrong) || 0) + 1,
                },
              },
            }));
            setRunnerState({ isJumping: false, isStumbling: true });
            setTimeout(() => setRunnerState({ isJumping: false, isStumbling: false }), 300);
            if (soundEnabled) playWrongSound();
          }
        });
        
        // Remove notes that are off screen
        return updated.filter(note => note.x > -50);
      });
    }, 16);
    
    // Spawn timer
    spawnTimerRef.current = setInterval(spawnNote, level.spawnRate);
    
    // Initial spawn
    setTimeout(spawnNote, 500);
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      clearInterval(animInterval);
    };
  }, [gameState, currentLevel, spawnNote, soundEnabled]);

  // Handle note button press
  const handleNotePress = useCallback((noteName: string) => {
    if (gameState !== 'playing') return;

    setPressedNote(noteName);
    setTimeout(() => setPressedNote(null), 100);

    // Find the leftmost (closest) unanswered note that is visible on screen
    setNotes(prev => {
      const unansweredNotes = prev.filter(note => !note.answered && note.x < 350);
      if (unansweredNotes.length === 0) return prev;

      // Get the leftmost note (smallest x value)
      const targetNote = unansweredNotes.reduce((closest, note) =>
        note.x < closest.x ? note : closest
      );

      if (!targetNote) return prev;
      
      const isCorrect = targetNote.name === noteName;
      
      if (isCorrect) {
        correctCountRef.current += 1;
        const streakBonus = Math.floor(streak / 5) * 10;
        setScore(s => s + 100 + streakBonus);
        setStreak(s => s + 1);
        setStats(s => ({
          ...s,
          correct: s.correct + 1,
          notesPlayed: {
            ...s.notesPlayed,
            [targetNote.name]: {
              ...(s.notesPlayed[targetNote.name] || { correct: 0, wrong: 0 }),
              correct: ((s.notesPlayed[targetNote.name]?.correct) || 0) + 1,
            },
          },
        }));
        setRunnerState({ isJumping: true, isStumbling: false });
        setTimeout(() => setRunnerState({ isJumping: false, isStumbling: false }), 200);
        if (soundEnabled) playCorrectSound();
      } else {
        setHealth(h => {
          const newHealth = Math.max(0, h - DAMAGE);
          if (newHealth <= 0) {
            setGameState('gameOver');
            if (soundEnabled) playGameOverSound();
          }
          return newHealth;
        });
        setStreak(0);
        setStats(s => ({
          ...s,
          wrong: s.wrong + 1,
          notesPlayed: {
            ...s.notesPlayed,
            [targetNote.name]: {
              ...(s.notesPlayed[targetNote.name] || { correct: 0, wrong: 0 }),
              wrong: ((s.notesPlayed[targetNote.name]?.wrong) || 0) + 1,
            },
          },
        }));
        setRunnerState({ isJumping: false, isStumbling: true });
        setTimeout(() => setRunnerState({ isJumping: false, isStumbling: false }), 300);
        if (soundEnabled) playWrongSound();
      }
      
      return prev.map(note => 
        note.id === targetNote.id 
          ? { ...note, answered: true, feedback: isCorrect ? 'correct' : 'wrong' }
          : note
      );
    });
  }, [gameState, streak, soundEnabled]);

  // Start game
  const startGame = (level: number) => {
    setCurrentLevel(level);
    setScore(0);
    setHealth(MAX_HEALTH);
    setStreak(0);
    setNotes([]);
    setStats({ correct: 0, wrong: 0, notesPlayed: {} });
    setRunnerState({ isJumping: false, isStumbling: false });
    noteIdRef.current = 0;
    correctCountRef.current = 0;
    setGameState('playing');
    
    // Unlock background music on user gesture (game start)
    const audio = bgmRef.current;
    if (audio && !bgmStartedRef.current) {
      bgmStartedRef.current = true;
      void audio.play().catch(() => {
        // If blocked, the effect above will retry when possible.
      });
    }
  };

  // End game and save score
  const endGame = () => {
    const levelKey = `level${currentLevel}`;
    if (!highScores[levelKey] || score > highScores[levelKey]) {
      setHighScores(prev => ({ ...prev, [levelKey]: score }));
    }
    setGameState('menu');
    
    // Reset background music when returning to menu
    const audio = bgmRef.current;
    if (audio && bgmStartedRef.current) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      bgmStartedRef.current = false;
    }
  };

  // Calculate accuracy
  const accuracy = stats.correct + stats.wrong > 0 
    ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) 
    : 0;

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <GameWrapper correctCount={stats.correct}>
        <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative bg-black/40 backdrop-blur-sm overflow-y-auto">
          <button
            onClick={() => setLocation("/games")}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center gap-1 sm:gap-2 text-white hover:text-indigo-200 font-semibold bg-white/10 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all border border-white/20 text-sm sm:text-base"
          >
            <ChevronLeft size={20} />
            Main Menu
          </button>
          <div className="text-center mb-4 sm:mb-8 mt-10 sm:mt-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">🎵 Treble Runner</h1>
            <p className="text-indigo-100 text-base sm:text-lg drop-shadow-md">Master the treble clef!</p>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 w-full max-w-md border border-white/10 shadow-xl my-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">Select Level</h2>

            <div className="space-y-2 sm:space-y-3">
              {Object.entries(LEVELS).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => startGame(Number(level))}
                  className="w-full p-3 sm:p-4 bg-[#D2B48C] text-amber-900 rounded-xl text-left transition-all hover:bg-[#DEB887] active:translate-y-1 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] shadow-[0_4px_0_rgb(139,90,43),0_6px_6px_rgba(0,0,0,0.4)] relative overflow-hidden font-serif"
                >
                  {/* Wood texture effect */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none"
                       style={{
                         backgroundImage: `
                           repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(40,20,0,0.2) 4px, rgba(40,20,0,0.2) 6px),
                           repeating-radial-gradient(circle at 50% 0%, transparent, transparent 10px, rgba(60,30,0,0.1) 12px)
                         `
                       }}
                  />
                  {/* Inner highlight for 3D effect */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-base sm:text-lg">Level {level}: {config.name}</div>
                      <div className="text-amber-800 text-xs sm:text-sm">{config.subtitle}</div>
                    </div>
                    {highScores[`level${level}`] && (
                      <div className="text-right">
                        <div className="text-xs text-amber-700">Best</div>
                        <div className="font-bold text-sm sm:text-base">{highScores[`level${level}`]}</div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D2B48C] text-amber-900 rounded-lg hover:bg-[#DEB887] active:translate-y-1 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] shadow-[0_4px_0_rgb(139,90,43),0_6px_6px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden font-serif text-sm sm:text-base"
              >
                {/* Wood texture effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                     style={{
                       backgroundImage: `
                         repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(40,20,0,0.2) 4px, rgba(40,20,0,0.2) 6px),
                         repeating-radial-gradient(circle at 50% 0%, transparent, transparent 10px, rgba(60,30,0,0.1) 12px)
                       `
                     }}
                />
                {/* Inner highlight for 3D effect */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10">{soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}</span>
              </button>
            </div>
          </div>

          <p className="text-white/80 text-xs sm:text-sm mt-4 sm:mt-6 text-center max-w-md drop-shadow-md font-medium px-4">
            Identify the notes before they pass! Tap the correct note name to keep running.
          </p>
        </div>
      </GameWrapper>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    const isNewHighScore = score > (highScores[`level${currentLevel}`] || 0);

    return (
      <GameWrapper correctCount={stats.correct}>
        <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative bg-black/50 backdrop-blur-sm overflow-y-auto">
          <button
            onClick={() => setLocation("/games")}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center gap-1 sm:gap-2 text-white hover:text-indigo-200 font-semibold bg-white/10 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all border border-white/20 text-sm sm:text-base"
          >
            <ChevronLeft size={20} />
            Main Menu
          </button>
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md text-center border border-white/10 shadow-2xl my-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Game Over!</h2>

            {isNewHighScore && (
              <div className="text-yellow-400 text-base sm:text-xl mb-2 sm:mb-4 animate-pulse">🏆 New High Score! 🏆</div>
            )}

            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-6">{score}</div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6 text-white">
              <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.correct}</div>
                <div className="text-xs sm:text-sm text-indigo-200">Correct</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-bold text-red-400">{stats.wrong}</div>
                <div className="text-xs sm:text-sm text-indigo-200">Missed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 col-span-2">
                <div className="text-xl sm:text-2xl font-bold">{accuracy}%</div>
                <div className="text-xs sm:text-sm text-indigo-200">Accuracy</div>
              </div>
            </div>

            {Object.keys(stats.notesPlayed).length > 0 && (
              <div className="mb-3 sm:mb-6">
                <h3 className="text-white text-xs sm:text-sm mb-2">Notes Breakdown</h3>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {Object.entries(stats.notesPlayed).map(([note, data]) => (
                    <div key={note} className="bg-white/10 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      <span className="text-white font-bold">{note}</span>
                      <span className="text-green-400 ml-1 sm:ml-2">{data.correct || 0}✓</span>
                      <span className="text-red-400 ml-1">{data.wrong || 0}✗</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => startGame(currentLevel)}
                className="w-full py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-bold text-base sm:text-lg transition-all shadow-lg"
              >
                Play Again
              </button>
              <button
                onClick={endGame}
                className="w-full py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all border border-white/10 text-base sm:text-lg"
              >
                Level Select
              </button>
            </div>
          </div>
        </div>
      </GameWrapper>
    );
  }

  // Playing Screen
  return (
    <GameWrapper correctCount={stats.correct}>
      <div className="w-full h-full flex flex-col relative">
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white hover:text-indigo-200 font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all border border-white/20"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-md shadow-md p-3 border-b border-white/20">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-indigo-900">{score}</div>
            {streak >= 3 && (
              <div className="text-orange-500 font-bold animate-pulse">
                🔥 {streak}
              </div>
            )}
          </div>
          <HealthBar health={health} maxHealth={MAX_HEALTH} />
          <button
            onClick={() => setGameState('gameOver')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Quit
          </button>
        </div>
      </div>
      
      {/* Level indicator */}
      <div className="text-center py-2 text-white font-medium drop-shadow">
        Level {currentLevel}: {LEVELS[currentLevel].name}
      </div>
      
      {/* Game area */}
      <div className="flex-1 flex flex-col justify-end pb-2 px-4 max-w-lg mx-auto w-full">
        {/* Staff with notes */}
        <div className="relative mb-2">
          <Staff>
            {/* Notes */}
            {notes.map((note, index) => {
              // Find the leftmost unanswered note to mark as active
              const unansweredNotes = notes.filter(n => !n.answered && n.x < 350);
              const leftmostNote = unansweredNotes.length > 0
                ? unansweredNotes.reduce((closest, n) => n.x < closest.x ? n : closest)
                : null;
              const isActive = leftmostNote?.id === note.id;

              return (
                <StaffNote
                  key={note.id}
                  position={note.position}
                  x={note.x}
                  isActive={isActive}
                  feedback={note.feedback}
                />
              );
            })}
          </Staff>
        </div>
        
        {/* Runner track */}
        <div className="relative h-28 rounded-lg">
          {/* Ground pattern - matching background scenery (inferred) */}
          <div className="absolute inset-0 overflow-hidden rounded-sm">
            {/* Simple dirt path or ground line that blends better */}
            <div className="absolute bottom-4 left-0 right-0 h-4 bg-black/20 blur-sm rounded-full transform scale-x-90" />
            
            {/* Animated ground markers for speed reference */}
             <div className="absolute bottom-0 inset-x-0 h-12 overflow-hidden opacity-40">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-2 w-16 h-2 bg-white/20 rounded-full blur-[1px]"
                  style={{ 
                    left: `${i * 15}%`, 
                    transform: `translateX(${-(animFrame * 8) % 100}%)` 
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Runner - can overflow */}
          <Runner 
            isJumping={runnerState.isJumping} 
            isStumbling={runnerState.isStumbling}
            frame={animFrame}
          />
        </div>
      </div>
      
      {/* Note buttons */}
      <div className="p-2 pt-0">
        <div className="flex justify-center gap-2 max-w-lg mx-auto">
          {NOTE_BUTTONS.map(note => (
            <NoteButton
              key={note}
              note={note}
              onPress={handleNotePress}
              disabled={gameState !== 'playing'}
              isPressed={pressedNote === note}
            />
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-xs font-medium text-indigo-900 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            Identify the highlighted note before it passes!
          </span>
        </div>
      </div>
      </div>
    </GameWrapper>
  );
}
