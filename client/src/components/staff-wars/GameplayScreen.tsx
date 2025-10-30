import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import { Clef, GameConfig } from '../StaffWarsGame';
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

// Calculate speed based on level with 20% increase per level
const calculateSpeed = (level: number): number => {
  const baseSpeed = 50;
  const speedIncrease = 0.20; // 20% increase per level
  return Math.round(baseSpeed * Math.pow(1 + speedIncrease, level - 1));
};

export default function GameplayScreen({
  config,
  score,
  lives,
  level,
  currentSpeed,
  sfxEnabled,
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

      // Note input (only when not paused)
      if (!isPaused && NOTE_NAMES.includes(key)) {
        e.preventDefault();
        handleNoteAnswer(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentNote, isPaused, onPause, onToggleSFX]);

  const handleNoteAnswer = async (noteName: string) => {
    if (!currentNote || isPaused) return;

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
      setFeedback('incorrect');
      if (sfxEnabled) {
        await audioService.playErrorTone();
      }
      const newLives = lives - 1;
      onUpdateLives(newLives);

      if (newLives <= 0) {
        onGameOver(score);
      }

      setCurrentNote(null);
      setTimeout(() => setFeedback(null), 300);
    }
  };

  const handleNoteTimeout = async () => {
    setCurrentNote(null);
    if (sfxEnabled) {
      await audioService.playErrorTone();
    }
    const newLives = lives - 1;
    onUpdateLives(newLives);

    if (newLives <= 0) {
      onGameOver(score);
    }
  };

  const handleLevelUp = () => {
    // Level-up visual feedback is handled in StaffCanvas
    // This callback can be used for additional effects if needed
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Space-themed container */}
      <div
        className="flex-1 flex flex-col rounded-2xl border-2 border-blue-900/50 bg-slate-900/90 backdrop-blur-sm shadow-2xl shadow-blue-900/30"
        style={{
          padding: `${layout.padding * 0.5}px`,
          margin: `${layout.padding * 0.5}px`,
          maxHeight: `calc(100vh - ${layout.padding}px)`,
          minHeight: 0
        }}
      >
        {/* HUD */}
        <div
          className="bg-slate-800/80 border border-slate-700 rounded-lg flex justify-between items-center flex-shrink-0"
          style={{ padding: `${layout.padding * 0.5}px`, marginBottom: `${layout.padding * 0.5}px` }}
          role="region"
          aria-label="Game status"
        >
          <div className="flex" style={{ gap: `${layout.gridGap * 2}px` }}>
            <div className="text-white">
              <p
                className="text-slate-400"
                style={{ fontSize: `${layout.getFontSize('xs')}px` }}
              >
                Score
              </p>
              <p
                className="font-bold"
                style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
                aria-live="polite"
                aria-label={`Score: ${score}`}
              >
                {score}
              </p>
            </div>
            <div className="text-white">
              <p
                className="text-slate-400"
                style={{ fontSize: `${layout.getFontSize('xs')}px` }}
              >
                Level
              </p>
              <p
                className="font-bold text-yellow-400"
                style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
                aria-live="polite"
                aria-label={`Level: ${level}`}
              >
                {level}
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((score % 10) / 10) * 100}%` }}
                  aria-label={`Progress to next level: ${score % 10}/10`}
                />
              </div>
              <p
                className="text-slate-500 text-xs mt-1"
                style={{ fontSize: `${layout.getFontSize('xs')}px` }}
              >
                {score % 10}/10 to next level
              </p>
            </div>
            <div className="text-white">
              <p
                className="text-slate-400"
                style={{ fontSize: `${layout.getFontSize('xs')}px` }}
              >
                Lives
              </p>
              <p
                className="font-bold text-red-400"
                style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
                aria-live="polite"
                aria-label={`Lives remaining: ${lives}`}
              >
                {'❤️'.repeat(lives)}
              </p>
            </div>
          </div>

          <div className="flex" style={{ gap: `${layout.gridGap / 2}px` }}>
            <Button
              onClick={onToggleSFX}
              variant="outline"
              size="icon"
              className="touch-target"
              style={{
                height: `${Math.max(layout.padding * 2, 44)}px`,
                width: `${Math.max(layout.padding * 2, 44)}px`
              }}
              aria-label={sfxEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              aria-pressed={sfxEnabled}
              title={sfxEnabled ? 'Mute (M)' : 'Unmute (M)'}
            >
              {sfxEnabled ? <Volume2 size={layout.device.isMobile ? 18 : 20} /> : <VolumeX size={layout.device.isMobile ? 18 : 20} />}
            </Button>
            <Button
              onClick={onPause}
              variant="outline"
              size="icon"
              className="touch-target"
              style={{
                height: `${Math.max(layout.padding * 2, 44)}px`,
                width: `${Math.max(layout.padding * 2, 44)}px`
              }}
              aria-label="Pause game"
              title="Pause (Space)"
            >
              <Pause size={layout.device.isMobile ? 18 : 20} />
            </Button>
          </div>
        </div>

        {/* Game Canvas */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden rounded-lg border border-slate-700/50 bg-slate-950/50"
          style={{ padding: `${layout.padding * 0.25}px`, minHeight: 0 }}
        >
        <StaffCanvas
          ref={canvasRef}
          config={config}
          currentNote={currentNote}
          onNoteSpawned={setCurrentNote}
          onNoteTimeout={handleNoteTimeout}
          speed={currentSpeed}
          isPaused={isPaused}
          feedback={feedback}
          gameLoopRef={gameLoopRef}
        />
        </div>

        {/* Note Buttons */}
        <div
          className="bg-slate-800/80 border-t border-slate-700 rounded-lg flex-shrink-0"
          style={{ padding: `${layout.padding * 0.5}px`, marginTop: `${layout.padding * 0.5}px` }}
        >
          <div
            className="flex justify-center flex-wrap mx-auto"
            style={{
              gap: `${layout.gridGap / 2}px`,
              maxWidth: `${layout.maxContentWidth}px`
            }}
          >
            {NOTE_NAMES.map((note) => (
              <Button
                key={note}
                onClick={() => handleNoteAnswer(note)}
                disabled={!currentNote || isPaused}
                aria-label={`Note ${note}${currentNote === note ? ' - current note' : ''}`}
                aria-pressed={currentNote === note}
                className={`font-bold touch-target ${
                  currentNote === note
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black ring-2 ring-yellow-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                style={{
                  height: `${Math.max(layout.padding * 2, 48)}px`,
                  width: `${Math.max(layout.padding * 2, 48)}px`,
                  minWidth: `${Math.max(layout.padding * 2, 48)}px`,
                  fontSize: `${layout.getFontSize('lg')}px`
                }}
                title={`Press ${note} or click to answer`}
              >
                {note}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

