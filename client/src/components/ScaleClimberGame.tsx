import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, TrendingUp, TrendingDown, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useGameCleanup } from "@/hooks/useGameCleanup";

type ScaleType = "complete-ascending" | "complete-descending" | "incomplete-ascending" | "incomplete-descending";

interface ScalePattern {
  noteIndices: number[]; // indices into SCALE_NOTES
  type: ScaleType;
  isComplete: boolean;
  direction: "ascending" | "descending";
  missingNote?: number; // index of missing note if incomplete
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentScale: ScalePattern | null;
  hasPlayed: boolean;
  volume: number;
}

// C major scale
const SCALE_NOTES = [
  { freq: 262, name: "C" },
  { freq: 294, name: "D" },
  { freq: 330, name: "E" },
  { freq: 349, name: "F" },
  { freq: 392, name: "G" },
  { freq: 440, name: "A" },
  { freq: 494, name: "B" },
  { freq: 523, name: "C'" },
];

export default function ScaleClimberGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentScale: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  // Use the cleanup hook for auto-cleanup of timeouts and audio on unmount
  const { setTimeout, clearAll, isMounted } = useGameCleanup();

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentScale) {
      generateNewScale();
    }
  }, [gameStarted]);

  const playNote = useCallback(async (frequency: number, duration: number) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const volume = 0.3 * masterVolume;
    const startTime = audioContext.current.currentTime;
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }, [gameState.volume]);

  const playScale = useCallback(async (scale: ScalePattern) => {
    if (!audioContext.current) return;

    const noteDuration = 0.4;

    for (const noteIndex of scale.noteIndices) {
      if (!isMounted.current) return; // Exit early if unmounted
      const note = SCALE_NOTES[noteIndex];
      await playNote(note.freq, noteDuration);
      if (!isMounted.current) return; // Check again after note
    }
  }, [playNote, isMounted]);

  const generateNewScale = useCallback(() => {
    // Randomly choose: complete (70%) or incomplete (30%)
    const isComplete = Math.random() > 0.3;
    const isAscending = Math.random() > 0.5;

    let noteIndices: number[];
    let missingNote: number | undefined;

    if (isComplete) {
      // Complete scale: all 8 notes
      noteIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    } else {
      // Incomplete scale: skip one note (not first or last)
      const skipIndex = Math.floor(Math.random() * 6) + 1; // Skip one of indices 1-6
      noteIndices = [0, 1, 2, 3, 4, 5, 6, 7].filter((_, index) => index !== skipIndex);
      missingNote = skipIndex;
    }

    // Reverse if descending
    if (!isAscending) {
      noteIndices = [...noteIndices].reverse();
    }

    const type: ScaleType = isComplete
      ? isAscending ? "complete-ascending" : "complete-descending"
      : isAscending ? "incomplete-ascending" : "incomplete-descending";

    setGameState(prev => ({
      ...prev,
      currentScale: {
        noteIndices,
        type,
        isComplete,
        direction: isAscending ? "ascending" : "descending",
        missingNote,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayScale = useCallback(async () => {
    if (!gameState.currentScale || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playScale(gameState.currentScale);

    // Only update state if still mounted
    if (isMounted.current) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [gameState.currentScale, gameState.isPlaying, gameState.feedback, playScale, isMounted]);

  const handleAnswer = useCallback((answeredComplete: boolean) => {
    if (!gameState.currentScale || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = answeredComplete === gameState.currentScale.isComplete;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setTimeout(() => {
      generateNewScale();
    }, 3000);
  }, [gameState.currentScale, gameState.hasPlayed, gameState.feedback, generateNewScale]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const resetGame = useCallback(() => {
    // Clear all pending timeouts and stop audio
    clearAll();
    
    setGameState({
      score: 0,
      totalQuestions: 0,
      isPlaying: false,
      feedback: null,
      currentScale: null,
      hasPlayed: false,
      volume: 50,
    });
    setGameStarted(false);
  }, [clearAll]);

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
              Scale Climber
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Is the scale complete or missing a note?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-teal-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-teal-500" />
                <span>Listen to a musical scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎢</span>
                <span>Decide if the scale is complete or if a note is missing</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about scales and stepwise motion!</span>
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
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            Scale Climber
          </h2>
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
              disabled={gameState.isPlaying}
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl space-y-6`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the scale
            </p>
            {gameState.currentScale && (
              <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                {gameState.currentScale.direction === "ascending" ? (
                  <><TrendingUp className="inline w-6 h-6 mr-2" />Ascending Scale</>
                ) : (
                  <><TrendingDown className="inline w-6 h-6 mr-2" />Descending Scale</>
                )}
              </p>
            )}
          </div>

          {/* Visual Scale Representation (after playing) */}
          {gameState.hasPlayed && gameState.currentScale && !gameState.feedback && (
            <div className="mb-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                Scale visualization:
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {SCALE_NOTES.map((note, index) => {
                  const isPlayed = gameState.currentScale!.noteIndices.includes(index);
                  const isMissing = gameState.currentScale!.missingNote === index;
                  return (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 text-sm font-bold transition-all ${
                        isPlayed
                          ? 'bg-teal-500 border-teal-600 text-white shadow-lg'
                          : isMissing
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      {note.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayScale}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Scale'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Is this scale complete or missing a note?
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-12 text-2xl font-bold flex flex-col items-center gap-3"
                >
                  <span className="text-6xl">✅</span>
                  <span>Complete</span>
                  <span className="text-sm font-normal">All notes present</span>
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  size="lg"
                  className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-12 text-2xl font-bold flex flex-col items-center gap-3"
                >
                  <span className="text-6xl">❌</span>
                  <span>Missing Note</span>
                  <span className="text-sm font-normal">Gap in the scale</span>
                </Button>
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the scale!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentScale && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! The scale was {gameState.currentScale.isComplete ? 'complete' : 'missing a note'}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    The scale was {gameState.currentScale.isComplete ? 'complete' : 'missing a note'}!
                    {!gameState.currentScale.isComplete && gameState.currentScale.missingNote !== undefined && (
                      <span className="block mt-2 text-sm">
                        Missing note: {SCALE_NOTES[gameState.currentScale.missingNote].name}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Musical Scales & Stepwise Motion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg">
              <p className="font-bold text-teal-600 dark:text-teal-400 mb-2">
                What is a Scale?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A <strong>scale</strong> is a series of notes in ascending or descending order.
                The C major scale has 8 notes: C, D, E, F, G, A, B, C'. Each note is one step apart.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Stepwise Motion
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                When notes move in order without skipping any (like C-D-E), this is called
                <strong> stepwise motion</strong> or <strong>conjunct motion</strong>. Smooth and connected!
              </p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> Scales are fundamental to all music! The C major scale
              (C-D-E-F-G-A-B-C) uses all the white keys on a piano. When you skip a note in a scale,
              you create a <em>leap</em> instead of a <em>step</em>. Most melodies use stepwise motion
              from scales, making them smooth and singable. Practicing scales helps musicians develop
              finger technique and understand key signatures!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
