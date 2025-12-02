import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentPattern: {
    pattern: "ABA" | "ABC";
    melodies: [number[], number[], number[]]; // Three melody segments: A, B, C or A, B, A
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Different melodic phrases for A, B, C sections
const MELODY_A_OPTIONS = [
  [262, 294, 330], // C D E
  [330, 349, 392], // E F G
  [392, 440, 494], // G A B
];

const MELODY_B_OPTIONS = [
  [349, 330, 294], // F E D
  [440, 392, 349], // A G F
  [523, 494, 440], // C B A (high)
];

const MELODY_C_OPTIONS = [
  [294, 330, 349, 392], // D E F G
  [392, 349, 330, 294], // G F E D
  [262, 330, 392, 440], // C E G A
];

export default function MusicalPatternDetectiveGame() {
  const [, setLocation] = useLocation();
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentPattern: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameState.currentPattern) {
      generateNewPattern();
    }
  }, [gameStarted]);

  const playMelody = useCallback(async (melody: number[]) => {
    const masterVolume = gameState.volume / 100;
    audio.setVolume(masterVolume);

    const noteDuration = 400; // milliseconds per note
    const gap = 0.05; // gap between notes in seconds

    try {
      await audio.playPhrase(
        melody,
        melody.map(() => noteDuration),
        melody.map(() => 0.7),
        gap
      );
    } catch (err) {
      console.error('Failed to play melody:', err);
    }
  }, [gameState.volume, audio]);

  const playFullPattern = useCallback(async (melodies: [number[], number[], number[]]) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    // Play all three sections with pauses between
    await playMelody(melodies[0]); // Section A
    await playMelody(melodies[1]); // Section B
    await playMelody(melodies[2]); // Section A again (ABA) or C (ABC)

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.isPlaying, playMelody]);

  const generateNewPattern = useCallback(() => {
    const isABA = Math.random() > 0.5;

    // Pick random melodies for A and B
    const melodyA = MELODY_A_OPTIONS[Math.floor(Math.random() * MELODY_A_OPTIONS.length)];
    const melodyB = MELODY_B_OPTIONS[Math.floor(Math.random() * MELODY_B_OPTIONS.length)];

    let melodies: [number[], number[], number[]];

    if (isABA) {
      // ABA pattern: same melody A appears twice
      melodies = [melodyA, melodyB, melodyA];
    } else {
      // ABC pattern: all different melodies
      const melodyC = MELODY_C_OPTIONS[Math.floor(Math.random() * MELODY_C_OPTIONS.length)];
      melodies = [melodyA, melodyB, melodyC];
    }

    setGameState(prev => ({
      ...prev,
      currentPattern: {
        pattern: isABA ? "ABA" : "ABC",
        melodies,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayPattern = useCallback(() => {
    if (gameState.currentPattern) {
      playFullPattern(gameState.currentPattern.melodies);
    }
  }, [gameState.currentPattern, playFullPattern]);

  const handleAnswer = useCallback((guess: "ABA" | "ABC") => {
    if (!gameState.currentPattern || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guess === gameState.currentPattern.pattern;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audio.playSuccessTone();
    } else {
      audio.playErrorTone();
    }

    setGameTimeout(() => {
      generateNewPattern();
    }, 2500);
  }, [gameState.currentPattern, gameState.hasPlayed, gameState.feedback, generateNewPattern, audio, setGameTimeout]);

  const handleStartGame = async () => {
    if (!isReady) {
      await initialize();
    }
    setGameStarted(true);
  };

  // Show audio error if initialization failed
  if (error) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4`}>
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <AudioErrorFallback error={error} onRetry={initialize} />
      </div>
    );
  }

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
        <div className="w-full z-50 flex justify-start mb-4">
          <button
            onClick={() => setLocation("/games")}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft size={24} />
            Main Menu
          </button>
        </div>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl w-full flex-1 flex flex-col justify-center items-center mx-auto">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Musical Pattern Detective
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Identify the pattern: ABA or ABC?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🔎</span>
                <span>Listen to a three-part melody pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Identify if the pattern is ABA (first and last are same) or ABC (all different)</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about musical form and structure!</span>
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
            Musical Pattern Detective
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

        {/* Play Pattern Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the three-part pattern. Is it ABA or ABC?
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayPattern}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing Pattern...' : 'Play Pattern'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer("ABA")}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                <div className="text-4xl font-extrabold">ABA</div>
                <div className="text-sm font-normal">Same-Different-Same</div>
              </Button>
              <Button
                onClick={() => handleAnswer("ABC")}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                <div className="text-4xl font-extrabold">ABC</div>
                <div className="text-sm font-normal">All Different</div>
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
                    Correct! The pattern was {gameState.currentPattern?.pattern}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    The pattern was {gameState.currentPattern?.pattern}! Listen for repeating melodies!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Understanding Musical Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2">
                ABA Pattern (Ternary Form)
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                A musical structure where the first section (A) returns after a contrasting section (B).
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                <strong>Example:</strong> Many classical pieces use this form. The return of A creates a sense of completeness.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                ABC Pattern (Through-Composed)
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                A musical structure where each section is different, with no repeated sections.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                <strong>Example:</strong> This creates continuous forward motion and development throughout the piece.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> Recognizing patterns is fundamental to understanding musical form.
              Composers use repetition and contrast to create structure, unity, and variety in their music.
              Common forms include ABA (ternary), AB (binary), ABACA (rondo), and through-composed (ABC).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
