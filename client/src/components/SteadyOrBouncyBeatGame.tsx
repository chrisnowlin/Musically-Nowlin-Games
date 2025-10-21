import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

type BeatType = "march" | "waltz" | "swing";

interface BeatPattern {
  type: BeatType;
  name: string;
  emoji: string;
  beats: { duration: number; volume: number; pitch: number }[];
  description: string;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentPattern: BeatPattern | null;
  hasPlayed: boolean;
  volume: number;
}

// Beat patterns for different musical feels
const BEAT_PATTERNS: BeatPattern[] = [
  {
    type: "march",
    name: "March",
    emoji: "🥁",
    beats: [
      { duration: 0.5, volume: 1.0, pitch: 200 }, // Beat 1 (strong)
      { duration: 0.5, volume: 0.7, pitch: 200 }, // Beat 2 (weak)
      { duration: 0.5, volume: 0.8, pitch: 200 }, // Beat 3 (medium)
      { duration: 0.5, volume: 0.7, pitch: 200 }, // Beat 4 (weak)
      // Repeat
      { duration: 0.5, volume: 1.0, pitch: 200 },
      { duration: 0.5, volume: 0.7, pitch: 200 },
      { duration: 0.5, volume: 0.8, pitch: 200 },
      { duration: 0.5, volume: 0.7, pitch: 200 },
    ],
    description: "Steady 4/4 time - like marching LEFT-right-left-right",
  },
  {
    type: "waltz",
    name: "Waltz",
    emoji: "💃",
    beats: [
      { duration: 0.6, volume: 1.0, pitch: 180 }, // Beat 1 (strong)
      { duration: 0.6, volume: 0.5, pitch: 250 }, // Beat 2 (weak)
      { duration: 0.6, volume: 0.5, pitch: 250 }, // Beat 3 (weak)
      // Repeat
      { duration: 0.6, volume: 1.0, pitch: 180 },
      { duration: 0.6, volume: 0.5, pitch: 250 },
      { duration: 0.6, volume: 0.5, pitch: 250 },
      { duration: 0.6, volume: 1.0, pitch: 180 },
      { duration: 0.6, volume: 0.5, pitch: 250 },
      { duration: 0.6, volume: 0.5, pitch: 250 },
    ],
    description: "Bouncy 3/4 time - like dancing BOOM-ta-ta BOOM-ta-ta",
  },
  {
    type: "swing",
    name: "Swing",
    emoji: "🎷",
    beats: [
      { duration: 0.4, volume: 1.0, pitch: 220 }, // Long
      { duration: 0.2, volume: 0.6, pitch: 280 }, // Short
      { duration: 0.4, volume: 0.8, pitch: 220 }, // Long
      { duration: 0.2, volume: 0.6, pitch: 280 }, // Short
      // Repeat
      { duration: 0.4, volume: 1.0, pitch: 220 },
      { duration: 0.2, volume: 0.6, pitch: 280 },
      { duration: 0.4, volume: 0.8, pitch: 220 },
      { duration: 0.2, volume: 0.6, pitch: 280 },
    ],
    description: "Syncopated, uneven feel - like jazz DU-da DU-da",
  },
];

export default function SteadyOrBouncyBeatGame() {
  const [, setLocation] = useLocation();
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
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentPattern) {
      generateNewPattern();
    }
  }, [gameStarted]);

  const playBeat = useCallback(async (pitch: number, duration: number, relativeVolume: number) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = pitch;
    oscillator.type = "sine";

    const volume = 0.3 * masterVolume * relativeVolume;
    const startTime = audioContext.current.currentTime;
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }, [gameState.volume]);

  const playPattern = useCallback(async (pattern: BeatPattern) => {
    if (!audioContext.current) return;

    for (const beat of pattern.beats) {
      await playBeat(beat.pitch, beat.duration, beat.volume);
    }
  }, [playBeat]);

  const generateNewPattern = useCallback(() => {
    const pattern = BEAT_PATTERNS[Math.floor(Math.random() * BEAT_PATTERNS.length)];

    setGameState(prev => ({
      ...prev,
      currentPattern: pattern,
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayPattern = useCallback(async () => {
    if (!gameState.currentPattern || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playPattern(gameState.currentPattern);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentPattern, gameState.isPlaying, gameState.feedback, playPattern]);

  const handleAnswer = useCallback((selectedType: BeatType) => {
    if (!gameState.currentPattern || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedType === gameState.currentPattern.type;

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
      generateNewPattern();
    }, 3000);
  }, [gameState.currentPattern, gameState.hasPlayed, gameState.feedback, generateNewPattern]);

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
              Steady or Bouncy Beat?
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Is this a march, waltz, or swing?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-rose-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-rose-500" />
                <span>Listen to a rhythm pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">💃</span>
                <span>Identify if it's a march, waltz, or swing rhythm</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about different rhythmic feels and meters!</span>
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
            Steady or Bouncy Beat?
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
              Listen to the rhythm pattern
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayPattern}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Pattern'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Which rhythm pattern did you hear?
              </p>
              <div className="grid grid-cols-3 gap-4">
                {BEAT_PATTERNS.map((pattern) => (
                  <Button
                    key={pattern.type}
                    onClick={() => handleAnswer(pattern.type)}
                    size="lg"
                    className={`${
                      pattern.type === "march" ? "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600" :
                      pattern.type === "waltz" ? "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600" :
                      "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600"
                    } text-white px-6 py-8 text-xl font-bold flex flex-col items-center gap-2`}
                  >
                    <span className="text-5xl">{pattern.emoji}</span>
                    <span>{pattern.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the rhythm pattern!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentPattern && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! It was a {gameState.currentPattern.emoji} {gameState.currentPattern.name}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    It was a {gameState.currentPattern.emoji} {gameState.currentPattern.name}!
                  </>
                )}
              </p>
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                {gameState.currentPattern.description}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Rhythm Feels & Musical Meter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="font-bold text-red-600 dark:text-red-400 mb-2 text-center text-2xl">
                🥁 March
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>4/4 time</strong> - Steady, even beats. Think of marching: LEFT-right-left-right.
                Four beats per measure with emphasis on beats 1 and 3.
              </p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2 text-center text-2xl">
                💃 Waltz
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>3/4 time</strong> - Bouncy, lilting feel. Think of dancing: BOOM-ta-ta BOOM-ta-ta.
                Three beats per measure with strong emphasis on beat 1.
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
              <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 text-center text-2xl">
                🎷 Swing
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Syncopated</strong> - Uneven, jazzy feel. Think of jazz: DU-da DU-da.
                Long-short pattern that "swings" instead of staying even.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-rose-50 dark:bg-rose-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> The <em>meter</em> or <em>time signature</em> tells musicians
              how beats are grouped. March music (4/4) is used in military bands and rock. Waltz music (3/4)
              is used for dancing and classical music. Swing rhythm creates the jazzy, laid-back feel in blues
              and jazz. Being able to identify these feels helps you understand different musical styles and
              dance to the beat!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
