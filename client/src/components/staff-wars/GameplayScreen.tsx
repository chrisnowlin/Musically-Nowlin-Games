import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import { Clef, GameConfig } from '../StaffWarsGame';
import StaffCanvas from './StaffCanvas';
import { audioService } from '@/lib/audioService';

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

const SPEED_CURVE = [
  { correctAnswers: 0, pxPerSecond: 50 },
  { correctAnswers: 5, pxPerSecond: 75 },
  { correctAnswers: 10, pxPerSecond: 100 },
  { correctAnswers: 15, pxPerSecond: 125 },
  { correctAnswers: 20, pxPerSecond: 150 },
];

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

      // Update level based on speed curve
      let newLevel = 1;
      for (let i = SPEED_CURVE.length - 1; i >= 0; i--) {
        if (newScore >= SPEED_CURVE[i].correctAnswers) {
          newLevel = i + 1;
          break;
        }
      }

      if (newLevel !== level) {
        onUpdateLevel(newLevel);
        const speedCurve = SPEED_CURVE[Math.min(newLevel - 1, SPEED_CURVE.length - 1)];
        onUpdateSpeed(speedCurve.pxPerSecond);
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

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* HUD */}
      <div className="bg-slate-800/80 border-b border-slate-700 p-4 flex justify-between items-center" role="region" aria-label="Game status">
        <div className="flex gap-8">
          <div className="text-white">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-3xl font-bold" aria-live="polite" aria-label={`Score: ${score}`}>{score}</p>
          </div>
          <div className="text-white">
            <p className="text-sm text-slate-400">Level</p>
            <p className="text-3xl font-bold" aria-live="polite" aria-label={`Level: ${level}`}>{level}</p>
          </div>
          <div className="text-white">
            <p className="text-sm text-slate-400">Lives</p>
            <p className="text-3xl font-bold text-red-400" aria-live="polite" aria-label={`Lives remaining: ${lives}`}>
              {'❤️'.repeat(lives)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onToggleSFX}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label={sfxEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            aria-pressed={sfxEnabled}
            title={sfxEnabled ? 'Mute (M)' : 'Unmute (M)'}
          >
            {sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          <Button
            onClick={onPause}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label="Pause game"
            title="Pause (Space)"
          >
            <Pause size={20} />
          </Button>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
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
      <div className="bg-slate-800/80 border-t border-slate-700 p-4">
        <div className="flex justify-center gap-2 flex-wrap max-w-4xl mx-auto">
          {NOTE_NAMES.map((note) => (
            <Button
              key={note}
              onClick={() => handleNoteAnswer(note)}
              disabled={!currentNote || isPaused}
              aria-label={`Note ${note}${currentNote === note ? ' - current note' : ''}`}
              aria-pressed={currentNote === note}
              className={`h-12 w-12 text-lg font-bold min-w-12 ${
                currentNote === note
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black ring-2 ring-yellow-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={`Press ${note} or click to answer`}
            >
              {note}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

