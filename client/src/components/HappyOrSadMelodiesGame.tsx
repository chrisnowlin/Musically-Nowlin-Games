import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Smile, Frown, Volume2, VolumeX, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentMelody: {
    isHappy: boolean;
    notes: number[];
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Major (happy) and minor (sad) scales and melodies
const MAJOR_SCALE = [262, 294, 330, 349, 392, 440, 494]; // C major
const MINOR_SCALE = [262, 294, 311, 349, 392, 415, 466]; // C natural minor

const HAPPY_MELODIES = [
  [262, 330, 392, 440, 523], // C E G A C - ascending major
  [392, 440, 392, 330, 262], // G A G E C - cheerful bounce
  [262, 294, 330, 349, 392, 349, 330], // Major scale up and down
  [330, 349, 392, 440, 392, 349], // E F G A G F - bright melody
  [262, 330, 262, 392, 330], // C E C G E - major triad
];

const SAD_MELODIES = [
  [262, 311, 349, 392, 311, 262], // C Eb F G Eb C - minor feel
  [392, 349, 311, 262], // G F Eb C - descending minor
  [262, 294, 311, 349, 311, 294, 262], // Minor scale walk
  [311, 349, 392, 349, 311], // Eb F G F Eb - melancholic
  [392, 311, 349, 262], // G Eb F C - sad descent
];

export default function HappyOrSadMelodiesGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentMelody: null,
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
    if (gameStarted && !gameState.currentMelody) {
      generateNewMelody();
    }
  }, [gameStarted]);

  const playMelody = useCallback((notes: number[]) => {
    if (!audioContext.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const masterVolume = gameState.volume / 100;
    const noteDuration = 0.5; // seconds per note

    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * noteDuration;
      const duration = noteDuration * 0.9;

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = 0.3 * masterVolume;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Reset playing state after melody finishes
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }, notes.length * noteDuration * 1000);
  }, [gameState.volume, gameState.isPlaying]);

  const generateNewMelody = useCallback(() => {
    const isHappy = Math.random() > 0.5;
    const melodyPool = isHappy ? HAPPY_MELODIES : SAD_MELODIES;
    const randomMelody = melodyPool[Math.floor(Math.random() * melodyPool.length)];

    setGameState(prev => ({
      ...prev,
      currentMelody: {
        isHappy,
        notes: randomMelody,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayMelody = useCallback(() => {
    if (gameState.currentMelody) {
      playMelody(gameState.currentMelody.notes);
    }
  }, [gameState.currentMelody, playMelody]);

  const handleAnswer = useCallback((answerIsHappy: boolean) => {
    if (!gameState.currentMelody || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = answerIsHappy === gameState.currentMelody.isHappy;

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
      generateNewMelody();
    }, 2000);
  }, [gameState.currentMelody, gameState.hasPlayed, gameState.feedback, generateNewMelody]);

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
              Happy or Sad Melodies?
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen to melodies and identify if they sound happy or sad!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Smile className="w-6 h-6 text-yellow-500" />
                <span>Listen to each melody carefully by clicking the Play button</span>
              </li>
              <li className="flex items-start gap-2">
                <Frown className="w-6 h-6 text-blue-500" />
                <span>Decide if the melody sounds happy (major) or sad (minor)</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Score points for each correct answer!</span>
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
            Happy or Sad Melodies?
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

        {/* Play Melody Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the melody and decide if it sounds happy or sad!
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayMelody}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Melody'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-8 py-6 text-xl"
              >
                <Smile className="w-8 h-8 mr-3" />
                Happy (Major)
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-6 text-xl"
              >
                <Frown className="w-8 h-8 mr-3" />
                Sad (Minor)
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
                    Correct! The melody was {gameState.currentMelody?.isHappy ? 'Happy (Major)' : 'Sad (Minor)'}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    That was {gameState.currentMelody?.isHappy ? 'Happy (Major)' : 'Sad (Minor)'}! Try again!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">
            Understanding Happy vs Sad Melodies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <p className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mb-2">
                <Smile size={20} /> Happy (Major)
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Major melodies use the major scale and typically sound bright, cheerful, and uplifting.
                They often ascend and use intervals that create a positive feeling.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Frown size={20} /> Sad (Minor)
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Minor melodies use the minor scale and typically sound melancholic, somber, or reflective.
                They often descend and use intervals that create an emotional, darker feeling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
