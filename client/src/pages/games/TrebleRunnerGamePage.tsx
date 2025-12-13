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
    speed: 1.44,
    spawnRate: 2200,
  },
  3: {
    name: 'Mixed Staff',
    subtitle: 'All Notes E - F',
    notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
    speed: 1.6,
    spawnRate: 2000,
  },
  4: {
    name: 'Ledger Lines Below',
    subtitle: 'Adding Middle C & D',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
    speed: 1.76,
    spawnRate: 1800,
  },
  5: {
    name: 'Full Range',
    subtitle: 'All Notes with Ledger Lines',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
    speed: 2.0,
    spawnRate: 1600,
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
  const baseY = isJumping ? 10 : (isStumbling ? 35 : 25);
  const rotation = isStumbling ? 15 : 0;
  const legAngle = Math.sin(frame * 0.3) * 20;
  
  return (
    <div 
      className="absolute transition-all duration-150"
      style={{ 
        left: '60px', 
        bottom: `${baseY}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg width="40" height="50" viewBox="0 0 40 50">
        {/* Quarter note body */}
        <ellipse cx="20" cy="35" rx="12" ry="10" fill="#1a1a2e" />
        {/* Stem */}
        <line x1="31" y1="35" x2="31" y2="5" stroke="#1a1a2e" strokeWidth="3" />
        {/* Eyes */}
        <circle cx="16" cy="33" r="3" fill="white" />
        <circle cx="24" cy="33" r="3" fill="white" />
        <circle cx="16" cy="33" r="1.5" fill="#1a1a2e" />
        <circle cx="24" cy="33" r="1.5" fill="#1a1a2e" />
        {/* Smile */}
        {!isStumbling && (
          <path d="M15,39 Q20,44 25,39" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
        )}
        {isStumbling && (
          <path d="M15,42 Q20,38 25,42" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
        )}
        {/* Legs */}
        <line 
          x1="14" y1="44" 
          x2={14 + Math.sin((legAngle) * Math.PI / 180) * 8} 
          y2="50" 
          stroke="#1a1a2e" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <line 
          x1="26" y1="44" 
          x2={26 + Math.sin((-legAngle) * Math.PI / 180) * 8} 
          y2="50" 
          stroke="#1a1a2e" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
      </svg>
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
      transition-all duration-75 select-none touch-manipulation
      ${disabled ? 'bg-gray-300 text-gray-500' : 
        isPressed ? 'bg-indigo-700 text-white scale-95 shadow-inner' :
        'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg hover:from-indigo-400 hover:to-indigo-500 active:scale-95'}
      ${['C', 'D', 'E'].includes(note) ? 'rounded-b-xl' : ''}
    `}
  >
    {note}
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
        const updated = prev.map(note => ({
          ...note,
          x: note.x - level.speed,
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
    
    // Find the closest unanswered note in the answer zone
    const answerZone = { min: 60, max: 168 };
    
    setNotes(prev => {
      const targetNote = prev.find(note => 
        !note.answered && 
        note.x >= answerZone.min && 
        note.x <= answerZone.max
      );
      
      if (!targetNote) return prev;
      
      const isCorrect = targetNote.name === noteName;
      
      if (isCorrect) {
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
    setGameState('playing');
  };

  // End game and save score
  const endGame = () => {
    const levelKey = `level${currentLevel}`;
    if (!highScores[levelKey] || score > highScores[levelKey]) {
      setHighScores(prev => ({ ...prev, [levelKey]: score }));
    }
    setGameState('menu');
  };

  // Calculate accuracy
  const accuracy = stats.correct + stats.wrong > 0 
    ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) 
    : 0;

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative">
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">🎵 Treble Runner</h1>
          <p className="text-indigo-200 text-lg">Master the treble clef!</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Select Level</h2>
          
          <div className="space-y-3">
            {Object.entries(LEVELS).map(([level, config]) => (
              <button
                key={level}
                onClick={() => startGame(Number(level))}
                className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white text-left transition-all hover:scale-102 active:scale-98 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">Level {level}: {config.name}</div>
                    <div className="text-indigo-200 text-sm">{config.subtitle}</div>
                  </div>
                  {highScores[`level${level}`] && (
                    <div className="text-right">
                      <div className="text-xs text-indigo-200">Best</div>
                      <div className="font-bold">{highScores[`level${level}`]}</div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
          </div>
        </div>
        
        <p className="text-indigo-300 text-sm mt-6 text-center max-w-md">
          Identify the notes before they pass! Tap the correct note name to keep running.
        </p>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    const isNewHighScore = score > (highScores[`level${currentLevel}`] || 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative">
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
          
          {isNewHighScore && (
            <div className="text-yellow-400 text-xl mb-4 animate-pulse">🏆 New High Score! 🏆</div>
          )}
          
          <div className="text-6xl font-bold text-white mb-6">{score}</div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-white">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{stats.correct}</div>
              <div className="text-sm text-indigo-200">Correct</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{stats.wrong}</div>
              <div className="text-sm text-indigo-200">Missed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 col-span-2">
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-sm text-indigo-200">Accuracy</div>
            </div>
          </div>
          
          {Object.keys(stats.notesPlayed).length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-sm mb-2">Notes Breakdown</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(stats.notesPlayed).map(([note, data]) => (
                  <div key={note} className="bg-white/10 rounded px-3 py-1 text-sm">
                    <span className="text-white font-bold">{note}</span>
                    <span className="text-green-400 ml-2">{data.correct || 0}✓</span>
                    <span className="text-red-400 ml-1">{data.wrong || 0}✗</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => startGame(currentLevel)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-bold text-lg transition-all"
            >
              Play Again
            </button>
            <button
              onClick={endGame}
              className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
            >
              Level Select
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex flex-col relative">
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur shadow-md p-3">
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
      <div className="flex-1 flex flex-col justify-center px-4 max-w-lg mx-auto w-full">
        {/* Staff with notes */}
        <div className="relative mb-4">
          <Staff>
            {/* Answer zone indicator */}
            <rect x="60" y="10" width="108" height="100" fill="rgba(59, 130, 246, 0.1)" rx="5" />
            
            {/* Notes */}
            {notes.map(note => (
              <StaffNote
                key={note.id}
                position={note.position}
                x={note.x}
                isActive={note.x >= 60 && note.x <= 168 && !note.answered}
                feedback={note.feedback}
              />
            ))}
          </Staff>
        </div>
        
        {/* Runner track */}
        <div className="relative h-20 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-lg overflow-hidden border-4 border-amber-700 shadow-inner">
          {/* Ground pattern */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-1 bg-amber-800"
                style={{ left: `${i * 5}%`, transform: `translateX(${-(animFrame * 2) % 50}px)` }}
              />
            ))}
          </div>
          
          {/* Runner */}
          <Runner 
            isJumping={runnerState.isJumping} 
            isStumbling={runnerState.isStumbling}
            frame={animFrame}
          />
          
          {/* Grass on top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-green-500 to-transparent" />
        </div>
      </div>
      
      {/* Note buttons */}
      <div className="bg-white/90 backdrop-blur-sm p-4 shadow-lg mt-auto">
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
        <div className="text-center text-xs text-gray-500 mt-2">
          Tap the note name when it enters the blue zone!
        </div>
      </div>
    </div>
  );
}
