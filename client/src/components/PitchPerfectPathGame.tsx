import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, TrendingUp, TrendingDown, Minus, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

type PitchDirection = "ascending" | "descending" | "same";

interface PitchSequence {
  frequencies: number[];
  direction: PitchDirection;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentSequence: PitchSequence | null;
  hasPlayed: boolean;
  volume: number;
}

// Base frequencies for C major scale
const SCALE_NOTES = [262, 294, 330, 349, 392, 440, 494, 523]; // C D E F G A B C

export default function PitchPerfectPathGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentSequence: null,
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
    if (gameStarted && !gameState.currentSequence) {
      generateNewSequence();
    }
  }, [gameStarted]);

  const playSequence = useCallback(async (frequencies: number[]) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    const noteDuration = 0.5;

    for (const freq of frequencies) {
      if (!audioContext.current) break;

      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = 0.3 * masterVolume;
      const startTime = audioContext.current.currentTime;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
    }
  }, [gameState.volume]);

  const generateNewSequence = useCallback(() => {
    const direction = ["ascending", "descending", "same"][Math.floor(Math.random() * 3)] as PitchDirection;
    const startIndex = Math.floor(Math.random() * 4); // Start from first 4 notes
    const sequenceLength = 4; // 4 notes per sequence

    let frequencies: number[];

    if (direction === "ascending") {
      frequencies = SCALE_NOTES.slice(startIndex, startIndex + sequenceLength);
    } else if (direction === "descending") {
      frequencies = SCALE_NOTES.slice(startIndex, startIndex + sequenceLength).reverse();
    } else {
      // Same pitch repeated
      const singleNote = SCALE_NOTES[startIndex + 1];
      frequencies = [singleNote, singleNote, singleNote, singleNote];
    }

    setGameState(prev => ({
      ...prev,
      currentSequence: { frequencies, direction },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlaySequence = useCallback(async () => {
    if (!gameState.currentSequence || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playSequence(gameState.currentSequence.frequencies);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentSequence, gameState.isPlaying, gameState.feedback, playSequence]);

  const handleAnswer = useCallback((selectedDirection: PitchDirection) => {
    if (!gameState.currentSequence || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedDirection === gameState.currentSequence.direction;

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
      generateNewSequence();
    }, 2500);
  }, [gameState.currentSequence, gameState.hasPlayed, gameState.feedback, generateNewSequence]);

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
              Pitch Perfect Path
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Do pitches go up, down, or stay the same?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-blue-500" />
                <span>Listen to a sequence of 4 notes</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <span>Decide if the pitches go up, down, or stay the same</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about melodic contour and pitch direction!</span>
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
            Pitch Perfect Path
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
              Listen to the pitch sequence
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlaySequence}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Sequence'}
            </Button>
          </div>

          {/* Direction Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Which direction do the pitches go?
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => handleAnswer("ascending")}
                  size="lg"
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-8 text-lg font-bold flex flex-col items-center gap-2"
                >
                  <TrendingUp className="w-8 h-8" />
                  <span>Ascending</span>
                  <span className="text-sm font-normal">(Up)</span>
                </Button>
                <Button
                  onClick={() => handleAnswer("same")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-8 text-lg font-bold flex flex-col items-center gap-2"
                >
                  <Minus className="w-8 h-8" />
                  <span>Same</span>
                  <span className="text-sm font-normal">(Level)</span>
                </Button>
                <Button
                  onClick={() => handleAnswer("descending")}
                  size="lg"
                  className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-8 text-lg font-bold flex flex-col items-center gap-2"
                >
                  <TrendingDown className="w-8 h-8" />
                  <span>Descending</span>
                  <span className="text-sm font-normal">(Down)</span>
                </Button>
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the pitch sequence!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentSequence && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! The pitches were {gameState.currentSequence.direction}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    The pitches were {gameState.currentSequence.direction}!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Melodic Contour & Pitch Direction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                <TrendingUp size={20} /> Ascending
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Pitches that go higher create excitement, tension, or uplifting feelings. Think of climbing stairs!
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                <Minus size={20} /> Same
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Repeated pitches create stability and emphasis. Used in chants and driving rhythms.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <TrendingDown size={20} /> Descending
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Pitches that go lower create resolution, relaxation, or sadness. Like walking down stairs!
              </p>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> The melodic contour is the shape of a melody created by the direction
              pitches move. Composers use contour to create emotional arcs - ascending melodies build energy while
              descending melodies provide release. Understanding contour helps you recognize and remember melodies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
