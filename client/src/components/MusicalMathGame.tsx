import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Plus, Equal, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentProblem: {
    note1Count: number;
    note2Count: number;
    totalCount: number;
    note1Duration: number;
    note2Duration: number;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Note durations in seconds (quarter, half, whole)
const DURATIONS = {
  quarter: 0.5,
  half: 1.0,
  whole: 2.0,
};

export default function MusicalMathGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentProblem: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentProblem) {
      generateNewProblem();
    }
  }, [gameStarted]);

  const playNote = useCallback(async (duration: number) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    const frequency = 440; // A4

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

    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 200));
  }, [gameState.volume]);

  const playNotesSequence = useCallback(async (count: number, duration: number) => {
    if (!audioContext.current || gameState.isPlaying) return;

    for (let i = 0; i < count; i++) {
      await playNote(duration);
    }

    // Pause between groups
    await new Promise(resolve => setTimeout(resolve, 400));
  }, [playNote, gameState.isPlaying]);

  const playProblem = useCallback(async () => {
    if (!gameState.currentProblem || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    // Play first group of notes
    await playNotesSequence(
      gameState.currentProblem.note1Count,
      gameState.currentProblem.note1Duration
    );

    // Play second group of notes
    await playNotesSequence(
      gameState.currentProblem.note2Count,
      gameState.currentProblem.note2Duration
    );

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentProblem, gameState.isPlaying, playNotesSequence]);

  const generateNewProblem = useCallback(() => {
    // Generate simple addition problems: 2-4 notes + 2-4 notes
    const note1Count = Math.floor(Math.random() * 3) + 2; // 2-4
    const note2Count = Math.floor(Math.random() * 3) + 2; // 2-4
    const totalCount = note1Count + note2Count;

    // Both groups use quarter notes for simplicity
    const note1Duration = DURATIONS.quarter;
    const note2Duration = DURATIONS.quarter;

    setGameState(prev => ({
      ...prev,
      currentProblem: {
        note1Count,
        note2Count,
        totalCount,
        note1Duration,
        note2Duration,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handleAnswer = useCallback((guess: number) => {
    if (!gameState.currentProblem || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guess === gameState.currentProblem.totalCount;

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
      generateNewProblem();
    }, 2500);
  }, [gameState.currentProblem, gameState.hasPlayed, gameState.feedback, generateNewProblem]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/")}
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
              Musical Math
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Add and count musical notes!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Plus className="w-6 h-6 text-pink-500" />
                <span>Listen to two groups of notes played one after another</span>
              </li>
              <li className="flex items-start gap-2">
                <Equal className="w-6 h-6 text-blue-500" />
                <span>Count the total number of notes you heard</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn musical addition and counting!</span>
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
            Musical Math
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
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Play Problem */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to both groups of notes. How many notes in total?
            </p>
          </div>

          {gameState.currentProblem && (
            <div className="flex items-center justify-center gap-4 mb-6 text-4xl font-bold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-pink-600">?</span>
                <span className="text-sm">notes</span>
              </div>
              <Plus size={32} className="text-blue-600" />
              <div className="flex items-center gap-2">
                <span className="text-pink-600">?</span>
                <span className="text-sm">notes</span>
              </div>
              <Equal size={32} className="text-green-600" />
              <span className="text-purple-600">?</span>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <Button
              onClick={playProblem}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Problem'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-4 gap-3">
              {[4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                <Button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  disabled={gameState.feedback !== null}
                  size="lg"
                  className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-6 py-6 text-2xl font-bold"
                >
                  {num}
                </Button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! {gameState.currentProblem?.note1Count} + {gameState.currentProblem?.note2Count} = {gameState.currentProblem?.totalCount}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    The answer was {gameState.currentProblem?.totalCount}! ({gameState.currentProblem?.note1Count} + {gameState.currentProblem?.note2Count})
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Musical Math Concepts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-2">
                <Plus size={20} /> Addition
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                When we add notes together, we count the total. If you hear 3 notes, then 4 notes,
                you heard 7 notes total!
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Note Values
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Quarter note (♩) = 1 beat. You can add notes to make longer durations:
                4 quarter notes = 1 whole note (𝅝).
              </p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Understanding musical addition helps with rhythm and counting beats.
              Musicians count notes and beats constantly when playing music. This skill builds both math and
              music abilities at the same time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
