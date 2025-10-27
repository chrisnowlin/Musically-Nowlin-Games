import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Play, RotateCcw, Music2, Star, Zap } from "lucide-react";
import { audioService } from "@/lib/audioService";
import { Button } from "@/components/ui/button";
import { playfulColors, playfulShapes } from "@/theme/playful";
import { ResponsiveGameLayout, GameSection } from "@/components/ResponsiveGameLayout";
import { useResponsiveLayout } from "@/hooks/useViewport";

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver';

export interface GameState {
  status: GameStatus;
  score: number;
  level: number;
  speed: number;
  distance: number;
  notesIdentified: number;
  isStunned: boolean;
  stunEndTime: number;
}

export interface Note {
  id: string;
  name: string;
  position: number; // 0-8 representing staff lines and spaces
  x: number;
  isActive: boolean;
}

const initialState: GameState = {
  status: 'menu',
  score: 0,
  level: 1,
  speed: 2,
  distance: 0,
  notesIdentified: 0,
  isStunned: false,
  stunEndTime: 0,
};

// Note positions on staff (0 = bottom line, 8 = top line)
// Standard treble clef: Lines E-G-B-D-F, Spaces F-A-C-E
const NOTE_POSITIONS = {
  'E': 0, // Bottom line (E4)
  'F': 1, // First space (F4)
  'G': 2, // Second line (G4) - Treble clef fixes this note
  'A': 3, // Second space (A4)
  'B': 4, // Third line (B4)
  'C': 5, // Third space (C5)
  'D': 6, // Fourth line (D5)
  'E2': 7, // Fourth space (E5) - using E2 to distinguish from lower E
  'F2': 8, // Top line (F5) - using F2 to distinguish from lower F
};

export default function StaffRunnerGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [volume, setVolume] = useState<number>(30);
  const [isJumping, setIsJumping] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [noteRange, setNoteRange] = useState<'lines' | 'spaces' | 'mixed'>('lines');
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  
  const gameLoopRef = useRef<number | null>(null);
  const lastNoteTimeRef = useRef<number>(0);
  const layout = useResponsiveLayout();

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await audioService.initialize();
    };
    initAudio();
  }, []);

  // Apply volume changes
  useEffect(() => {
    audioService.setVolume(volume / 100);
  }, [volume]);

  // Generate new note
  const generateNote = useCallback((): Note => {
    let noteName: string;
    let position: number;

    if (noteRange === 'lines') {
      const lineNotes = ['E', 'G', 'B', 'D', 'F2'];
      noteName = lineNotes[Math.floor(Math.random() * lineNotes.length)];
      position = NOTE_POSITIONS[noteName as keyof typeof NOTE_POSITIONS];
    } else if (noteRange === 'spaces') {
      const spaceNotes = ['F', 'A', 'C', 'E2'];
      noteName = spaceNotes[Math.floor(Math.random() * spaceNotes.length)];
      position = NOTE_POSITIONS[noteName as keyof typeof NOTE_POSITIONS];
    } else {
      const allNotes = ['E', 'F', 'G', 'A', 'B', 'C', 'D', 'E2', 'F2'];
      noteName = allNotes[Math.floor(Math.random() * allNotes.length)];
      position = NOTE_POSITIONS[noteName as keyof typeof NOTE_POSITIONS];
    }

    return {
      id: Math.random().toString(36).substring(2, 11),
      name: noteName,
      position,
      x: 800, // Start from right side
      isActive: false,
    };
  }, [noteRange]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const currentTime = Date.now();

    setGameState(prev => {
      const newDistance = prev.distance + prev.speed * 0.016; // 60 FPS
      const newLevel = Math.floor(newDistance / 500) + 1;
      const newSpeed = 2 + (newLevel - 1) * 0.3; // Gradual speed increase

      // Check if stun period is over
      const isStunned = currentTime < prev.stunEndTime;
      
      return {
        ...prev,
        distance: newDistance,
        level: newLevel,
        speed: newSpeed,
        isStunned,
      };
    });

    // Update notes position
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => ({
        ...note,
        x: note.x - gameState.speed,
      })).filter(note => note.x > -50); // Remove notes that have scrolled off screen

      // Generate new notes at intervals
      if (currentTime - lastNoteTimeRef.current > 3000 / gameState.speed) { // Adjust interval based on speed
        lastNoteTimeRef.current = currentTime;
        return [...updatedNotes, generateNote()];
      }

      return updatedNotes;
    });

    // Update active note
    setNotes(currentNotes => {
      const characterX = 100; // Character's fixed X position
      const activeNote = currentNotes.find(note => 
        Math.abs(note.x - characterX) < 50 && !note.isActive
      );

      if (activeNote && !gameState.isStunned) {
        setActiveNote(activeNote);
        // Announce active note for screen readers
        setScreenReaderAnnouncement(`Active note: ${activeNote.name}. Use note buttons or keyboard keys C through B to answer.`);
        return currentNotes.map(note => ({
          ...note,
          isActive: note.id === activeNote.id,
        }));
      }

      return currentNotes.map(note => ({
        ...note,
        isActive: false,
      }));
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.status, gameState.speed, gameState.isStunned, generateNote]);

  // Start game loop when playing
  useEffect(() => {
    if (gameState.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  const handleStartGame = useCallback(() => {
    setGameState({
      ...initialState,
      status: 'playing',
    });
    setNotes([]);
    setActiveNote(null);
    lastNoteTimeRef.current = Date.now();
  }, []);

  const handlePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(initialState);
    setNotes([]);
    setActiveNote(null);
    setIsJumping(false);
    lastNoteTimeRef.current = 0;
  }, []);

  const handleJump = useCallback(() => {
    if (gameState.status !== 'playing' || isJumping || gameState.isStunned) return;
    
    setIsJumping(true);
    audioService.playNote(523.25, 0.2); // C5
    
    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  }, [gameState.status, isJumping, gameState.isStunned]);

  const handleNoteAnswer = useCallback((noteName: string) => {
    if (!activeNote || gameState.isStunned) return;

    if (noteName === activeNote.name) {
      // Correct answer
      audioService.playSuccessTone();
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        notesIdentified: prev.notesIdentified + 1,
      }));
      
      // Screen reader announcement
      setScreenReaderAnnouncement(`Correct! You identified ${activeNote.name}. Score: ${gameState.score + 10}. Notes identified: ${gameState.notesIdentified + 1}.`);
      
      // Remove identified note
      setNotes(prev => prev.filter(note => note.id !== activeNote.id));
      setActiveNote(null);
    } else {
      // Incorrect answer - apply stun
      audioService.playErrorTone();
      const stunEndTime = Date.now() + 1000; // 1 second stun
      
      // Screen reader announcement
      setScreenReaderAnnouncement(`Incorrect. The note was ${activeNote.name}. You are stunned for 1 second.`);
      
      setGameState(prev => ({
        ...prev,
        isStunned: true,
        stunEndTime,
      }));
    }
  }, [activeNote, gameState.isStunned, gameState.score, gameState.notesIdentified]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;
      
      switch (e.key) {
        case ' ':
        case 'ArrowUp':
          e.preventDefault();
          handleJump();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handlePause();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          handleNoteAnswer('C');
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          handleNoteAnswer('D');
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          // Check if active note is E2 (high E) or E (low E)
          if (activeNote && (activeNote.name === 'E2')) {
            handleNoteAnswer('E2');
          } else {
            handleNoteAnswer('E');
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          // Check if active note is F2 (high F) or F (low F)
          if (activeNote && (activeNote.name === 'F2')) {
            handleNoteAnswer('F2');
          } else {
            handleNoteAnswer('F');
          }
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          handleNoteAnswer('G');
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          handleNoteAnswer('A');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          handleNoteAnswer('B');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handleJump, handlePause, handleNoteAnswer]);

  // Update note range based on progress
  useEffect(() => {
    if (gameState.notesIdentified >= 20 && noteRange === 'lines') {
      setNoteRange('spaces');
      setScreenReaderAnnouncement(`Difficulty increased! Now including space notes. Range: Lines and spaces.`);
    } else if (gameState.notesIdentified >= 40 && noteRange === 'spaces') {
      setNoteRange('mixed');
      setScreenReaderAnnouncement(`Difficulty increased! Now including all notes. Range: Lines, spaces, and ledger lines.`);
    }
  }, [gameState.notesIdentified, noteRange]);

  return (
    <div 
      className="w-full min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-teal-900 to-cyan-800 flex items-center justify-center relative"
      role="application"
      aria-label="Staff Runner Game - Identify musical notes as they appear on the staff"
    >
      {/* Back button */}
      <button
        onClick={() => setLocation("/")}
        className="absolute z-50 flex items-center text-teal-700 hover:text-teal-900 font-semibold bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all touch-target"
        style={{
          top: `${layout.padding}px`,
          left: `${layout.padding}px`,
          gap: `${layout.gridGap / 4}px`,
          padding: `${layout.padding * 0.5}px ${layout.padding}px`,
          fontSize: `${layout.getFontSize('sm')}px`
        }}
        aria-label="Return to main menu"
        title="Return to main menu"
      >
        <ChevronLeft size={layout.device.isMobile ? 20 : 24} aria-hidden="true" />
        Main Menu
      </button>

       {/* Screen reader announcements */}
       <div 
         className="sr-only" 
         role="status" 
         aria-live="assertive" 
         aria-atomic="true"
       >
         {screenReaderAnnouncement}
       </div>

       <ResponsiveGameLayout showDecorations={true}>
        {/* Header */}
        <GameSection variant="header">
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <Star className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-500 animate-bounce`} style={{ animationDelay: "0ms" }} />
              <Zap className={`${layout.device.isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-orange-500 animate-pulse`} />
              <Star className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-500 animate-bounce`} style={{ animationDelay: "300ms" }} />
            </div>

            <h1
              className={`text-center ${playfulColors.gradients.title}`}
              style={{
                fontSize: `${layout.getFontSize('4xl')}px`,
                marginBottom: `${layout.padding}px`
              }}
              id="game-title"
            >
              Staff Runner
            </h1>

            {/* Score and progress display */}
            <div 
              className="flex justify-center gap-6 text-white font-bold flex-wrap"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div style={{ fontSize: `${layout.getFontSize('lg')}px` }} aria-label={`Score: ${gameState.score} points`}>
                Score: {gameState.score}
              </div>
              <div style={{ fontSize: `${layout.getFontSize('lg')}px` }} aria-label={`Level: ${gameState.level}`}>
                Level: {gameState.level}
              </div>
              <div style={{ fontSize: `${layout.getFontSize('lg')}px` }} aria-label={`Notes identified: ${gameState.notesIdentified}`}>
                Notes: {gameState.notesIdentified}
              </div>
              <div style={{ fontSize: `${layout.getFontSize('lg')}px` }} aria-label={`Note range: ${noteRange === 'lines' ? 'Lines only' : noteRange === 'spaces' ? 'Spaces only' : 'Lines and spaces'}`}>
                Range: {noteRange === 'lines' ? 'Lines' : noteRange === 'spaces' ? 'Spaces' : 'Mixed'}
              </div>
            </div>
          </div>
        </GameSection>

        {/* Main game area */}
        <GameSection variant="main" fillSpace>
          <div className="flex flex-col items-center justify-center h-full">
            {gameState.status === 'menu' && (
              <div className="text-center text-white">
                <div className={`${layout.device.isMobile ? 'mb-6' : 'mb-8'}`}>
                  <div className="relative inline-block mb-6">
                    <Music2 className={`${layout.device.isMobile ? 'w-16 h-16' : 'w-24 h-24'} mx-auto text-teal-400 animate-pulse`} />
                    <Zap className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-400 absolute -top-2 -right-2 animate-spin`} />
                  </div>
                  <h2
                    className={`${playfulColors.gradients.title} mb-4`}
                    style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
                  >
                    Ready to Run?
                  </h2>
                   <p
                     className="text-cyan-100 max-w-md mx-auto mb-6"
                     style={{ fontSize: `${layout.getFontSize('lg')}px` }}
                   >
                     🎵 Identify notes as they appear! 🎵<br/>
                     Use buttons or keys (C, D, E, F, G, A, B)<br/>
                     Screen reader users: Press Tab to navigate to note buttons when a note is active.
                   </p>
                </div>
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button} font-fredoka`}
                  style={{
                    fontSize: `${layout.getFontSize('lg')}px`,
                    padding: `${layout.padding}px ${layout.padding * 1.5}px`
                  }}
                  aria-label="Start new Staff Runner game"
                >
                  <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} aria-hidden="true" />
                  Start Game
                </Button>
              </div>
            )}

            {gameState.status === 'playing' && (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* Game canvas area */}
                <div 
                  className="relative bg-gradient-to-b from-blue-200 to-blue-100 rounded-lg overflow-hidden border-4 border-teal-600"
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: '400px'
                  }}
                  role="img"
                  aria-label={`Musical staff with game character. ${gameState.isStunned ? 'Character is stunned.' : 'Character is running.'} ${activeNote ? `Active note: ${activeNote.name}` : 'No active note.'}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {/* Staff lines */}
                  <div className="absolute inset-0 flex flex-col justify-center">
                    {[1, 2, 3, 4, 5].map((line) => (
                      <div
                        key={line}
                        className="w-full h-0.5 bg-gray-600"
                        style={{ marginTop: line === 1 ? '0' : '20px' }}
                      />
                    ))}
                  </div>

                   {/* Notes */}
                   {notes.map((note) => (
                     <div
                       key={note.id}
                       className={`absolute transition-all duration-200 ${
                         note.isActive 
                           ? 'scale-110 z-20' 
                           : gameState.isStunned 
                             ? 'opacity-50' 
                             : 'hover:scale-105'
                       } ${
                         note.isActive && gameState.isStunned
                           ? 'animate-pulse border-4 border-red-500'
                           : note.isActive
                             ? 'border-4 border-green-500'
                             : 'border-2 border-gray-800'
                       }`}
                       style={{
                         left: `${note.x}px`,
                         bottom: `${40 + note.position * 20}px`, // Position on staff
                         width: '40px',
                         height: '40px',
                         borderRadius: '50%',
                         backgroundColor: note.isActive 
                           ? (gameState.isStunned ? '#ef4444' : '#10b981')
                           : '#1f2937',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontWeight: 'bold',
                         fontSize: '14px',
                       }}
                       aria-label={`Note ${note.name}${note.isActive ? ', active' : ''}${gameState.isStunned && note.isActive ? ', stunned' : ''}`}
                       role="img"
                     >
                       {showNoteNames && (
                         <div className="absolute -bottom-6 text-xs font-bold text-gray-700 whitespace-nowrap" aria-hidden="true">
                           {note.name}
                         </div>
                       )}
                       ♩
                     </div>
                   ))}

                   {/* Character */}
                   <div
                     className={`absolute left-20 w-12 h-12 bg-teal-600 rounded-full border-2 border-white transition-all duration-300 ${
                       isJumping ? '-translate-y-16' : ''
                     } ${
                       gameState.isStunned ? 'animate-pulse bg-red-600' : ''
                     }`}
                     style={{
                       bottom: '80px',
                     }}
                     aria-label={`Game character ${gameState.isStunned ? 'stunned' : isJumping ? 'jumping' : 'running'}`}
                     role="img"
                   >
                     <div className="w-full h-full flex items-center justify-center text-white font-bold" aria-hidden="true">
                       🏃
                     </div>
                   </div>

                   {/* Stun indicator */}
                   {gameState.isStunned && (
                     <div 
                       className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse"
                       role="status"
                       aria-live="assertive"
                       aria-atomic="true"
                     >
                       STUNNED
                     </div>
                   )}

                   {/* Distance indicator */}
                   <div 
                     className="absolute top-4 right-4 text-gray-700 font-bold"
                     aria-label={`Distance traveled: ${Math.floor(gameState.distance)} meters`}
                     role="status"
                     aria-live="polite"
                   >
                     {Math.floor(gameState.distance)}m
                   </div>
                </div>

                {/* Note input buttons */}
                <div 
                  className="mt-6 flex justify-center gap-2"
                  role="group"
                  aria-label="Note identification buttons"
                >
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((noteName) => {
                    // Handle E/E2 and F/F2 distinction
                    const getNoteAnswer = (simpleNote: string) => {
                      if (simpleNote === 'E' && activeNote && activeNote.name === 'E2') {
                        return 'E2';
                      } else if (simpleNote === 'F' && activeNote && activeNote.name === 'F2') {
                        return 'F2';
                      } else {
                        return simpleNote;
                      }
                    };
                    
                    return (
                    <Button
                      key={noteName}
                      onClick={() => handleNoteAnswer(getNoteAnswer(noteName))}
                      disabled={!activeNote || gameState.isStunned}
                      size="lg"
                      className={`w-12 h-12 font-bold text-lg ${
                        activeNote && !gameState.isStunned
                          ? playfulColors.gradients.buttonPrimary
                          : 'bg-gray-400 text-gray-600'
                      } ${playfulShapes.rounded.button} ${playfulShapes.shadows.button}`}
                      style={{
                        fontSize: `${layout.getFontSize('lg')}px`,
                        padding: `${layout.padding * 0.5}px`,
                      }}
                      aria-label={`Note ${noteName}${!activeNote || gameState.isStunned ? ' - disabled' : ' - click to identify active note'}`}
                      aria-disabled={!activeNote || gameState.isStunned}
                    >
                      {noteName}
                    </Button>
);
                  })}
                </div>

                {/* Controls hint */}
                <div className="mt-4 text-white text-center">
                  <p style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
                    SPACE/↑: Jump | P: Pause | Keys C-B: Answer notes
                  </p>
                  <p style={{ fontSize: `${layout.getFontSize('sm')}px` }} className="mt-1">
                    Screen reader: Note buttons become available when a note is active
                  </p>
                </div>
              </div>
            )}

            {gameState.status === 'paused' && (
              <div className="text-center text-white">
                <h2 style={{ fontSize: `${layout.getFontSize('3xl')}px` }} className="mb-6">
                  Game Paused
                </h2>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonPrimary} ${playfulShapes.shadows.button} font-fredoka`}
                    style={{
                      fontSize: `${layout.getFontSize('lg')}px`,
                      padding: `${layout.padding}px ${layout.padding * 1.5}px`
                    }}
                    aria-label="Resume game"
                  >
                    <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} aria-hidden="true" />
                    Resume
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className={`${playfulShapes.rounded.button} font-fredoka border-white text-white hover:bg-white hover:text-teal-600`}
                    style={{
                      fontSize: `${layout.getFontSize('lg')}px`,
                      padding: `${layout.padding}px ${layout.padding * 1.5}px`
                    }}
                    aria-label="Reset game and return to main menu"
                  >
                    <RotateCcw className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} aria-hidden="true" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {gameState.status === 'gameOver' && (
              <div className="text-center text-white">
                <h2 style={{ fontSize: `${layout.getFontSize('3xl')}px` }} className="mb-6">
                  Game Complete!
                </h2>
                <div className="mb-6">
                  <p style={{ fontSize: `${layout.getFontSize('xl')}px` }} className="mb-2">
                    Final Score: {gameState.score}
                  </p>
                  <p style={{ fontSize: `${layout.getFontSize('lg')}px` }}>
                    Notes Identified: {gameState.notesIdentified}
                  </p>
                  <p style={{ fontSize: `${layout.getFontSize('lg')}px` }}>
                    Distance: {Math.floor(gameState.distance)}m
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button} font-fredoka`}
                    style={{
                      fontSize: `${layout.getFontSize('lg')}px`,
                      padding: `${layout.padding}px ${layout.padding * 1.5}px`
                    }}
                    aria-label="Start new game"
                  >
                    <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} aria-hidden="true" />
                    Play Again
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className={`${playfulShapes.rounded.button} font-fredoka border-white text-white hover:bg-white hover:text-teal-600`}
                    style={{
                      fontSize: `${layout.getFontSize('lg')}px`,
                      padding: `${layout.padding}px ${layout.padding * 1.5}px`
                    }}
                    aria-label="Return to main menu"
                  >
                    <RotateCcw className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} aria-hidden="true" />
                    Main Menu
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GameSection>

        {/* Footer with controls */}
        <GameSection variant="footer">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold" style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
                  Volume:
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24"
                  aria-label={`Volume: ${volume}%`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={volume}
                />
                <span className="text-white" style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
                  {volume}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-white font-semibold" style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
                  Show Names:
                </label>
                <button
                  onClick={() => setShowNoteNames(!showNoteNames)}
                  className={`px-3 py-1 rounded font-bold ${
                    showNoteNames 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}
                  style={{ fontSize: `${layout.getFontSize('sm')}px` }}
                  aria-label={`Show note names: ${showNoteNames ? 'on' : 'off'}`}
                  aria-pressed={showNoteNames}
                  role="switch"
                >
                  {showNoteNames ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </GameSection>
      </ResponsiveGameLayout>
    </div>
  );
}