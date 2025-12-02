import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Check, X, Volume2, VolumeX, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentInterval: {
    isConsonant: boolean;
    name: string;
    semitones: number;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Interval definitions (in semitones from base note)
const CONSONANT_INTERVALS = [
  { name: "Perfect Unison", semitones: 0, description: "Same note" },
  { name: "Perfect Fourth", semitones: 5, description: "Very stable" },
  { name: "Perfect Fifth", semitones: 7, description: "Most consonant" },
  { name: "Perfect Octave", semitones: 12, description: "Same note, higher" },
  { name: "Major Third", semitones: 4, description: "Pleasant and bright" },
  { name: "Major Sixth", semitones: 9, description: "Smooth and sweet" },
];

const DISSONANT_INTERVALS = [
  { name: "Minor Second", semitones: 1, description: "Very tense" },
  { name: "Major Second", semitones: 2, description: "Slightly tense" },
  { name: "Tritone", semitones: 6, description: "Maximum dissonance" },
  { name: "Minor Seventh", semitones: 10, description: "Tension seeking resolution" },
  { name: "Major Seventh", semitones: 11, description: "Sharp dissonance" },
];

const BASE_FREQUENCY = 262; // Middle C

export default function HarmonyHelperGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentInterval: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
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
    if (gameStarted && !gameState.currentInterval) {
      generateNewInterval();
    }
  }, [gameStarted]);

  const playInterval = useCallback(async (semitones: number) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const duration = 2500; // 2.5 seconds in ms

    // Calculate second frequency
    const freq1 = BASE_FREQUENCY;
    const freq2 = BASE_FREQUENCY * Math.pow(2, semitones / 12);

    // Play both notes simultaneously using playChord
    await audio.playChord([freq1, freq2], duration, gameState.volume / 100);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.volume, gameState.isPlaying, audio]);

  const generateNewInterval = useCallback(() => {
    const isConsonant = Math.random() > 0.5;
    const intervalPool = isConsonant ? CONSONANT_INTERVALS : DISSONANT_INTERVALS;
    const randomInterval = intervalPool[Math.floor(Math.random() * intervalPool.length)];

    setGameState(prev => ({
      ...prev,
      currentInterval: {
        isConsonant,
        name: randomInterval.name,
        semitones: randomInterval.semitones,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayInterval = useCallback(() => {
    if (gameState.currentInterval) {
      playInterval(gameState.currentInterval.semitones);
    }
  }, [gameState.currentInterval, playInterval]);

  const handleAnswer = useCallback((answerIsConsonant: boolean) => {
    if (!gameState.currentInterval || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = answerIsConsonant === gameState.currentInterval.isConsonant;

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

    setGameTimeout(() => {
      generateNewInterval();
    }, 2500);
  }, [gameState.currentInterval, gameState.hasPlayed, gameState.feedback, generateNewInterval, setGameTimeout]);

  const handleStartGame = async () => {
    await initialize();
    setGameStarted(true);
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
              Harmony Helper
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Learn to hear consonance and dissonance in music!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Check className="w-6 h-6 text-green-500" />
                <span>Listen to two notes playing together (an interval)</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-6 h-6 text-red-500" />
                <span>Decide if they sound consonant (pleasant) or dissonant (tense)</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn which intervals create harmony or tension!</span>
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
            Harmony Helper
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

        {/* Play Interval Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the two notes playing together. Do they sound consonant or dissonant?
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayInterval}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Interval'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-6 text-xl"
              >
                <Check className="w-8 h-8 mr-3" />
                Consonant (Pleasant)
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 text-xl"
              >
                <X className="w-8 h-8 mr-3" />
                Dissonant (Tense)
              </Button>
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
                    Correct! That was a {gameState.currentInterval?.name} - {gameState.currentInterval?.isConsonant ? 'Consonant' : 'Dissonant'}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    That was a {gameState.currentInterval?.name} - {gameState.currentInterval?.isConsonant ? 'Consonant' : 'Dissonant'}! Listen again!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Understanding Consonance & Dissonance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="font-bold text-green-600 dark:text-green-400 flex items-center gap-2 mb-3">
                <Check size={20} /> Consonant Intervals
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Perfect Fifth (7)</strong> - Most stable</li>
                <li><strong>Perfect Fourth (5)</strong> - Very stable</li>
                <li><strong>Major Third (4)</strong> - Bright and pleasant</li>
                <li><strong>Major Sixth (9)</strong> - Smooth</li>
                <li><strong>Octave (12)</strong> - Same note higher</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                <X size={20} /> Dissonant Intervals
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Minor Second (1)</strong> - Very tense</li>
                <li><strong>Major Second (2)</strong> - Slightly tense</li>
                <li><strong>Tritone (6)</strong> - Maximum tension</li>
                <li><strong>Minor Seventh (10)</strong> - Needs resolution</li>
                <li><strong>Major Seventh (11)</strong> - Sharp tension</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> Consonance creates a sense of rest and stability, while dissonance creates
              tension that wants to resolve. Composers use both to create emotional movement in music. The number in parentheses
              shows semitones (half-steps) between the notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
