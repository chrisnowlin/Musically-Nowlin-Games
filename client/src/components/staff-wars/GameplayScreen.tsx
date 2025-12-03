import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Star, Heart, Trophy, Menu } from 'lucide-react';
import { Clef, GameConfig, MAX_LIVES, CORRECT_ANSWERS_FOR_EXTRA_LIFE } from '../StaffWarsGame';
import StaffCanvas from './StaffCanvas';
import { audioService } from '@/lib/audioService';
import { useResponsiveLayout } from '@/hooks/useViewport';

interface GameplayScreenProps {
  config: GameConfig;
  score: number;
  lives: number;
  level: number;
  currentSpeed: number;
  sfxEnabled: boolean;
  showCorrectAnswer: boolean;
  isPaused: boolean;
  onPause: () => void;
  onGameOver: (finalScore: number) => void;
  onUpdateScore: (score: number) => void;
  onUpdateLives: (lives: number) => void;
  onUpdateLevel: (level: number) => void;
  onUpdateSpeed: (speed: number) => void;
  onToggleSFX: () => void;
  gameLoopRef: React.MutableRefObject<number | null>;
}

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Calculate speed based on level with 25% increase per level
const calculateSpeed = (level: number): number => {
  const baseSpeed = 50;
  const speedIncrease = 0.25; // 25% increase per level
  return Math.round(baseSpeed * Math.pow(1 + speedIncrease, level - 1));
};

// Duration to show correct answer feedback (in ms)
const CORRECT_ANSWER_DISPLAY_DURATION = 1500;

export default function GameplayScreen({
  config,
  score,
  lives,
  level,
  currentSpeed,
  sfxEnabled,
  showCorrectAnswer,
  isPaused,
  onPause,
  onGameOver,
  onUpdateScore,
  onUpdateLives,
  onUpdateLevel,
  onUpdateSpeed,
  onToggleSFX,
  gameLoopRef,
}: GameplayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswerDisplay, setCorrectAnswerDisplay] = useState<string | null>(null);
  const [isShowingCorrectAnswer, setIsShowingCorrectAnswer] = useState(false);
  const layout = useResponsiveLayout();

  // Initialize audio on first interaction
  useEffect(() => {
    audioService.initialize();
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // Global shortcuts
      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onPause();
        return;
      }

      if (key === 'M') {
        e.preventDefault();
        onToggleSFX();
        return;
      }

      // Note input (only when not paused and not showing correct answer)
      if (!isPaused && !isShowingCorrectAnswer && NOTE_NAMES.includes(key)) {
        e.preventDefault();
        handleNoteAnswer(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentNote, isPaused, isShowingCorrectAnswer, onPause, onToggleSFX]);

  const handleNoteAnswer = async (noteName: string) => {
    if (!currentNote || isPaused || isShowingCorrectAnswer) return;

    // Extract just the letter from the current note (e.g., "G4" -> "G")
    const currentNoteLetter = currentNote.charAt(0);
    const isCorrect = noteName === currentNoteLetter;

    if (isCorrect) {
      setFeedback('correct');
      if (sfxEnabled) {
        await audioService.playSuccessTone();
      }
      const newScore = score + 1;
      onUpdateScore(newScore);

      // Restore a life every 30 correct answers (capped at MAX_LIVES)
      if (newScore > 0 && newScore % CORRECT_ANSWERS_FOR_EXTRA_LIFE === 0 && lives < MAX_LIVES) {
        onUpdateLives(lives + 1);
      }

      // Calculate new level (every 10 correct answers)
      const newLevel = Math.floor(newScore / 10) + 1;

      if (newLevel !== level) {
        onUpdateLevel(newLevel);
        const newSpeed = calculateSpeed(newLevel);
        onUpdateSpeed(newSpeed);
        
        // Play level-up sound effect
        if (sfxEnabled) {
          audioService.playLevelUpSound();
        }
      }

      setCurrentNote(null);
      setTimeout(() => setFeedback(null), 300);
    } else {
      // Wrong answer
      setFeedback('incorrect');
      if (sfxEnabled) {
        await audioService.playErrorTone();
      }
      
      const newLives = lives - 1;
      onUpdateLives(newLives);

      // Show correct answer if setting is enabled
      if (showCorrectAnswer) {
        setCorrectAnswerDisplay(currentNoteLetter);
        setIsShowingCorrectAnswer(true);
        
        // Keep the note visible during feedback, then dismiss after delay
        setTimeout(() => {
          setCorrectAnswerDisplay(null);
          setIsShowingCorrectAnswer(false);
          setCurrentNote(null);
          setFeedback(null);
          
          if (newLives <= 0) {
            onGameOver(score);
          }
        }, CORRECT_ANSWER_DISPLAY_DURATION);
      } else {
        // No correct answer display - dismiss immediately
        setCurrentNote(null);
        setTimeout(() => setFeedback(null), 300);
        
        if (newLives <= 0) {
          onGameOver(score);
        }
      }
    }
  };

  const handleNoteTimeout = async () => {
    // Don't process timeout if we're already showing correct answer
    if (isShowingCorrectAnswer) return;
    
    if (sfxEnabled) {
      await audioService.playErrorTone();
    }
    
    const newLives = lives - 1;
    onUpdateLives(newLives);

    // Show correct answer on timeout if setting is enabled
    if (showCorrectAnswer && currentNote) {
      const currentNoteLetter = currentNote.charAt(0);
      setCorrectAnswerDisplay(currentNoteLetter);
      setIsShowingCorrectAnswer(true);
      setFeedback('incorrect');
      
      setTimeout(() => {
        setCorrectAnswerDisplay(null);
        setIsShowingCorrectAnswer(false);
        setCurrentNote(null);
        setFeedback(null);
        
        if (newLives <= 0) {
          onGameOver(score);
        }
      }, CORRECT_ANSWER_DISPLAY_DURATION);
    } else {
      setCurrentNote(null);
      
      if (newLives <= 0) {
        onGameOver(score);
      }
    }
  };

  const handleLevelUp = () => {
    // Level-up visual feedback is handled in StaffCanvas
    // This callback can be used for additional effects if needed
  };

  return (
    <div className="w-full h-[100dvh] overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 to-black relative">
      {/* Starfield background effect (CSS) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
         <div className="absolute top-20 left-3/4 w-2 h-2 bg-blue-200 rounded-full shadow-[0_0_10px_blue]" />
         <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-white rounded-full" />
      </div>

      {/* Main Game Container */}
      <div
        className="flex-1 flex flex-col relative z-10"
        style={{
          padding: `${layout.padding * 0.5}px`,
          gap: `${layout.padding * 0.5}px`,
          maxHeight: '100dvh'
        }}
      >
        {/* HUD Bar */}
        <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Score */}
            <div className="flex flex-col">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Score
              </div>
              <div className="text-2xl font-mono font-bold text-white leading-none mt-1">
                {score.toString().padStart(3, '0')}
              </div>
            </div>

            {/* Level & Progress */}
            <div className="flex flex-col min-w-[100px]">
              <div className="flex justify-between items-center text-xs uppercase text-slate-400 font-bold tracking-wider">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Level {level}</span>
                <span className="text-slate-500">{score % 10}/10</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full mt-1.5 overflow-hidden border border-slate-600/30">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500 ease-out"
                  style={{ width: `${((score % 10) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Lives */}
            <div className="flex flex-col">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" /> Lives
              </div>
              <div className="flex gap-1 mt-1.5">
                {[...Array(MAX_LIVES)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all duration-300 ${
                      i < lives ? 'fill-red-500 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'fill-slate-700 text-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleSFX}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              onClick={onPause}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Pause className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 relative overflow-hidden shadow-inner shadow-black/50">
          <StaffCanvas
            ref={canvasRef}
            config={config}
            currentNote={currentNote}
            onNoteSpawned={setCurrentNote}
            onNoteTimeout={handleNoteTimeout}
            speed={currentSpeed}
            isPaused={isPaused || isShowingCorrectAnswer}
            feedback={feedback}
            correctAnswerDisplay={correctAnswerDisplay}
            gameLoopRef={gameLoopRef}
          />
        </div>

        {/* Input Controls */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg">
          <div className="flex justify-center gap-2 flex-wrap">
            {NOTE_NAMES.map((note) => {
              const isMatching = currentNote === note;
              const isCorrectAnswer = correctAnswerDisplay === note;
              return (
                <button
                  key={note}
                  onClick={() => handleNoteAnswer(note)}
                  disabled={!currentNote || isPaused || isShowingCorrectAnswer}
                  className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-150
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isCorrectAnswer
                      ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-110 z-10 ring-2 ring-white animate-pulse'
                      : isMatching
                      ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)] scale-110 z-10 ring-2 ring-white'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 shadow-lg border border-slate-600 hover:border-slate-400 hover:text-white'
                    }
                  `}
                >
                  {note}
                </button>
              );
            })}
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500 uppercase tracking-widest">
            {isShowingCorrectAnswer ? 'The correct answer was highlighted' : 'Tap note to fire'}
          </div>
        </div>
      </div>
    </div>
  );
}
