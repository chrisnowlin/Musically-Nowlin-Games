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
    <svg viewBox="0 0 400 120" className="w-full h-32 bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl overflow-visible">
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

// Game Wrapper for 16:9 aspect ratio
const GameWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
    <div 
      className="relative w-full max-w-[177.78vh] aspect-video bg-cover bg-center shadow-2xl overflow-hidden"
      style={{ backgroundImage: "url('/images/treble-runner-bg.jpeg')" }}
    >
      {children}
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
      <GameWrapper>
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative bg-black/20 backdrop-blur-[2px]">
          <button
            onClick={() => setLocation("/games")}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-indigo-900 font-bold bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <ChevronLeft size={24} />
            Back
          </button>
          
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
            <h1 className="text-7xl font-black text-white mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
              Treble Runner
            </h1>
            <p className="text-indigo-100 text-2xl font-medium drop-shadow-md bg-black/30 px-6 py-2 rounded-full inline-block backdrop-blur-sm">
              Master the notes on the staff! 🎼
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
              Select Difficulty Level
            </h2>
            
            <div className="grid gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(LEVELS).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => startGame(Number(level))}
                  className="group relative w-full p-4 bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-500 hover:to-purple-600 border-2 border-indigo-100 hover:border-transparent rounded-2xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <div className="font-bold text-xl text-indigo-900 group-hover:text-white transition-colors">
                        Level {level}: {config.name}
                      </div>
                      <div className="text-indigo-500 group-hover:text-indigo-100 font-medium mt-1 transition-colors">
                        {config.subtitle}
                      </div>
                    </div>
                    {highScores[`level${level}`] && (
                      <div className="text-right bg-white/50 group-hover:bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm transition-colors">
                        <div className="text-xs text-indigo-600 group-hover:text-indigo-100 uppercase font-bold tracking-wider">Best</div>
                        <div className="font-bold text-xl text-indigo-900 group-hover:text-white">{highScores[`level${level}`]}</div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center border-t border-indigo-100 pt-6">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all
                  ${soundEnabled 
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                `}
              >
                {soundEnabled ? '🔊 Sound Effects On' : '🔇 Sound Effects Off'}
              </button>
            </div>
          </div>
        </div>
      </GameWrapper>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    const isNewHighScore = score > (highScores[`level${currentLevel}`] || 0);
    
    return (
      <GameWrapper>
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg text-center shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-white/50">
            <h2 className="text-4xl font-black text-indigo-900 mb-2 uppercase tracking-wide">Game Over</h2>
            
            {isNewHighScore && (
              <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold text-lg mb-6 inline-flex items-center gap-2 animate-bounce">
                🏆 New High Score!
              </div>
            )}
            
            <div className="bg-indigo-900 text-white rounded-2xl p-6 mb-8 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950"></div>
              <div className="relative z-10">
                <div className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-7xl font-black tabular-nums tracking-tight group-hover:scale-110 transition-transform duration-300">{score}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <div className="text-xs font-bold text-green-800 uppercase tracking-wide">Correct</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                <div className="text-2xl font-bold text-red-500">{stats.wrong}</div>
                <div className="text-xs font-bold text-red-800 uppercase tracking-wide">Missed</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">Accuracy</div>
              </div>
            </div>
            
            {Object.keys(stats.notesPlayed).length > 0 && (
              <div className="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-3">Performance by Note</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(stats.notesPlayed).map(([note, data]) => (
                    <div key={note} className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm shadow-sm flex items-center gap-2">
                      <span className="font-bold text-gray-700 w-4">{note}</span>
                      <div className="flex gap-1 text-xs">
                        <span className="text-green-600 font-bold">{data.correct || 0}</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-red-500 font-bold">{data.wrong || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startGame(currentLevel)}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl text-white font-bold text-xl transition-all hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
              >
                Play Again
              </button>
              <button
                onClick={endGame}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xl transition-all hover:shadow-lg"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </GameWrapper>
    );
  }

  // Playing Screen
  return (
    <GameWrapper>
      <div className="w-full h-full flex flex-col relative">
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-indigo-900 font-bold bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Exit
        </button>
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md shadow-sm p-4 border-b border-indigo-50 z-20">
          <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-6">
              <div className="bg-indigo-900 text-white px-4 py-1 rounded-lg font-mono font-bold text-2xl shadow-inner min-w-[100px] text-center">
                {score}
              </div>
              {streak >= 3 && (
                <div className="flex items-center gap-1 text-orange-500 font-black animate-pulse bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  <span className="text-xl">🔥</span>
                  <span>{streak}</span>
                </div>
              )}
            </div>
            <HealthBar health={health} maxHealth={MAX_HEALTH} />
            <button
              onClick={() => setGameState('gameOver')}
              className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg font-bold transition-colors border border-gray-200 hover:border-red-200"
            >
              Quit
            </button>
          </div>
        </div>
        
        {/* Level indicator */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg border border-white/20 z-10">
          Level {currentLevel}: {LEVELS[currentLevel].name}
        </div>
        
        {/* Game area */}
        <div className="flex-1 flex flex-col justify-center px-4 max-w-4xl mx-auto w-full relative z-0">
          {/* Staff with notes */}
          <div className="relative mb-0 translate-y-8 z-10">
            <Staff>
              {/* Answer zone indicator */}
              <rect x="60" y="10" width="108" height="100" fill="rgba(59, 130, 246, 0.15)" rx="12" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="6 4" />
              
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
          
          {/* Runner track - Adjusted visual to float */}
          <div className="relative h-24 mt-[-20px]">
            {/* Runner */}
            <Runner 
              isJumping={runnerState.isJumping} 
              isStumbling={runnerState.isStumbling}
              frame={animFrame}
            />
          </div>
        </div>
        
        {/* Note buttons */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-white/50 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] mt-auto z-20">
          <div className="flex justify-center gap-3 max-w-4xl mx-auto">
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
          <div className="text-center text-sm font-medium text-indigo-800 mt-4 bg-indigo-50 inline-block mx-auto px-4 py-1 rounded-full">
            Tap the note name when it enters the blue zone!
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
