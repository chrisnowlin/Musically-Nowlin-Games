import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Music, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  isListening: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  sequence: number[];
  userSequence: number[];
  volume: number;
  gameOver: boolean;
}

// Four colored notes/buttons (like Simon Says)
const NOTES = [
  { id: 0, color: "red", frequency: 262, name: "C" },      // Red - C
  { id: 1, color: "blue", frequency: 330, name: "E" },     // Blue - E
  { id: 2, color: "green", frequency: 392, name: "G" },    // Green - G
  { id: 3, color: "yellow", frequency: 523, name: "C'" },  // Yellow - high C
];

export default function MusicalSimonSaysGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    isListening: false,
    feedback: null,
    sequence: [],
    userSequence: [],
    volume: 50,
    gameOver: false,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && gameState.sequence.length === 0 && !gameState.gameOver) {
      startNewRound();
    }
  }, [gameStarted]);

  const playNote = useCallback(async (noteId: number, duration: number = 0.6) => {
    const note = NOTES[noteId];
    setActiveNote(noteId);

    await audio.playNote(note.frequency, duration * 1000, gameState.volume / 100);

    setActiveNote(null);
    await new Promise(resolve => setGameTimeout(resolve, 200)); // Gap between notes
  }, [gameState.volume, audio, setGameTimeout]);

  const playSequence = useCallback(async (sequence: number[]) => {
    setGameState(prev => ({ ...prev, isPlaying: true, isListening: true }));

    for (const noteId of sequence) {
      await playNote(noteId);
    }

    setGameState(prev => ({ ...prev, isPlaying: false, isListening: false }));
  }, [playNote]);

  const startNewRound = useCallback(() => {
    // Add a random note to the sequence
    const newNote = Math.floor(Math.random() * NOTES.length);
    const newSequence = [...gameState.sequence, newNote];

    setGameState(prev => ({
      ...prev,
      sequence: newSequence,
      userSequence: [],
      feedback: null,
    }));

    // Play the new sequence after a short delay
    setGameTimeout(() => {
      playSequence(newSequence);
    }, 500);
  }, [gameState.sequence, playSequence, setGameTimeout]);

  const handleNoteClick = useCallback(async (noteId: number) => {
    if (gameState.isPlaying || gameState.isListening || gameState.feedback || gameState.gameOver) return;

    // Play the note
    await playNote(noteId, 0.3);

    const newUserSequence = [...gameState.userSequence, noteId];
    const currentIndex = gameState.userSequence.length;

    // Check if the note matches the sequence
    if (noteId !== gameState.sequence[currentIndex]) {
      // Wrong note! Game over
      setGameState(prev => ({
        ...prev,
        userSequence: newUserSequence,
        feedback: { show: true, isCorrect: false },
        gameOver: true,
      }));
      audioService.playErrorTone();
      return;
    }

    // Correct note!
    setGameState(prev => ({ ...prev, userSequence: newUserSequence }));

    // Check if sequence is complete
    if (newUserSequence.length === gameState.sequence.length) {
      // Level complete!
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        level: prev.level + 1,
        feedback: { show: true, isCorrect: true },
      }));
      audioService.playSuccessTone();

      // Start next round after delay
      setGameTimeout(() => {
        startNewRound();
      }, 2000);
    }
  }, [gameState, playNote, startNewRound, setGameTimeout]);

  const handleStartGame = async () => {
    await initialize();
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameState({
      score: 0,
      level: 1,
      isPlaying: false,
      isListening: false,
      feedback: null,
      sequence: [],
      userSequence: [],
      volume: gameState.volume,
      gameOver: false,
    });
    setGameTimeout(() => {
      startNewRound();
    }, 500);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Musical Simon Says
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Repeat the growing musical pattern!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Music className="w-6 h-6 text-orange-500" />
                <span>Watch and listen as the game plays a musical sequence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Click the colored notes to repeat the same sequence</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Each level adds one more note to remember!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Playing!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
        <ScoreDisplay score={gameState.score} total={gameState.level - 1} />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            Level {gameState.level}
          </h2>
          <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-2">
            {gameState.isListening ? "Watch and Listen..." : "Your Turn!"}
          </p>
        </div>

        {/* Volume Control */}
        <div className={`w-full max-w-md mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-4 ${playfulShapes.shadows.card}`}>
          <div className="flex items-center gap-4">
            <VolumeX size={20} className="text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
              disabled={gameState.isPlaying || gameState.isListening}
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Game Board */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {NOTES.map((note) => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                disabled={gameState.isPlaying || gameState.isListening || gameState.gameOver}
                className={`
                  aspect-square rounded-2xl transition-all duration-200 transform
                  ${activeNote === note.id ? 'scale-95' : 'hover:scale-105'}
                  ${gameState.isPlaying || gameState.isListening || gameState.gameOver ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  ${note.color === 'red' ? 'bg-gradient-to-br from-red-400 to-red-600' : ''}
                  ${note.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : ''}
                  ${note.color === 'green' ? 'bg-gradient-to-br from-green-400 to-green-600' : ''}
                  ${note.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : ''}
                  ${activeNote === note.id ? 'shadow-2xl ring-4 ring-white' : 'shadow-lg'}
                  flex flex-col items-center justify-center text-white font-bold text-3xl
                `}
              >
                <span className="text-5xl">♪</span>
                <span className="text-lg mt-2">{note.name}</span>
              </button>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {gameState.sequence.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < gameState.userSequence.length
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Feedback */}
          {gameState.feedback?.show && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Perfect! Level {gameState.level - 1} Complete!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    Game Over! You reached Level {gameState.level}!
                  </>
                )}
              </p>
            </div>
          )}

          {gameState.gameOver && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleRestart}
                size="lg"
                className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
              >
                Play Again
              </Button>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Memory & Musical Pattern Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Auditory Memory
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Remembering sequences of sounds is crucial for musicians. This game strengthens
                your ability to recall musical patterns.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Pattern Recognition
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Musicians constantly recognize and reproduce patterns. Each level challenges you
                to remember increasingly complex sequences.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Memory games like this help develop the auditory working memory
              that musicians need to learn songs, improvise, and play with others. Each color represents a
              different note in a chord (C major: C-E-G-C).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
