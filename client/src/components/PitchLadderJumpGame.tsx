import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, ArrowUpSquare, ArrowDownSquare, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

type IntervalType = "step" | "leap";

interface PitchInterval {
  note1: number;
  note2: number;
  intervalType: IntervalType;
  semitones: number;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentInterval: PitchInterval | null;
  hasPlayed: boolean;
  volume: number;
}

// C major scale with note names
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

export default function PitchLadderJumpGame() {
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

  const playTwoNotes = useCallback(async (note1: number, note2: number) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;
    const noteDuration = 0.6;

    for (const freq of [note1, note2]) {
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

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000 + 200));
    }
  }, [gameState.volume]);

  const generateNewInterval = useCallback(() => {
    // Step = 1 or 2 semitones (adjacent or one note apart)
    // Leap = 3+ semitones (skipping multiple notes)
    const isStep = Math.random() > 0.5;

    let index1, index2, semitones;

    if (isStep) {
      // Step: 1-2 scale degrees apart
      index1 = Math.floor(Math.random() * 6);
      const stepSize = Math.random() > 0.5 ? 1 : 2; // 1 or 2 notes apart
      index2 = index1 + stepSize;
      semitones = stepSize;
    } else {
      // Leap: 3-5 scale degrees apart
      index1 = Math.floor(Math.random() * 3);
      const leapSize = Math.floor(Math.random() * 3) + 3; // 3-5 notes apart
      index2 = index1 + leapSize;
      semitones = leapSize;
    }

    // Sometimes go down instead of up
    let note1 = SCALE_NOTES[index1].freq;
    let note2 = SCALE_NOTES[index2].freq;

    if (Math.random() > 0.5) {
      [note1, note2] = [note2, note1]; // Reverse direction
    }

    setGameState(prev => ({
      ...prev,
      currentInterval: {
        note1,
        note2,
        intervalType: isStep ? "step" : "leap",
        semitones,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayInterval = useCallback(async () => {
    if (!gameState.currentInterval || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playTwoNotes(gameState.currentInterval.note1, gameState.currentInterval.note2);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentInterval, gameState.isPlaying, gameState.feedback, playTwoNotes]);

  const handleAnswer = useCallback((selectedType: IntervalType) => {
    if (!gameState.currentInterval || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedType === gameState.currentInterval.intervalType;

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
      generateNewInterval();
    }, 2500);
  }, [gameState.currentInterval, gameState.hasPlayed, gameState.feedback, generateNewInterval]);

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
              Pitch Ladder Jump
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Is it a step or a leap?
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
                <span>Listen to two notes played in sequence</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowUpSquare className="w-6 h-6 text-green-500" />
                <span>Identify if it's a STEP (close together) or LEAP (far apart)</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about melodic intervals and pitch distance!</span>
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
            Pitch Ladder Jump
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
              Listen to the two notes
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayInterval}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Interval'}
            </Button>
          </div>

          {/* Step vs Leap Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Is this a STEP or a LEAP?
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Button
                  onClick={() => handleAnswer("step")}
                  size="lg"
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-12 text-2xl font-bold flex flex-col items-center gap-3"
                >
                  <div className="text-6xl">🪜</div>
                  <span>STEP</span>
                  <span className="text-sm font-normal">Close Together</span>
                </Button>
                <Button
                  onClick={() => handleAnswer("leap")}
                  size="lg"
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-12 text-2xl font-bold flex flex-col items-center gap-3"
                >
                  <div className="text-6xl">🦘</div>
                  <span>LEAP</span>
                  <span className="text-sm font-normal">Far Apart</span>
                </Button>
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the pitch interval!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentInterval && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! It was a {gameState.currentInterval.intervalType}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    It was a {gameState.currentInterval.intervalType}!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Steps & Leaps in Music
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                <span className="text-2xl">🪜</span> Step
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                A <strong>step</strong> moves to the next note in the scale (like climbing stairs one at a time).
                Steps are 1-2 scale degrees apart.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                <strong>Examples:</strong> C to D, E to F, G to A
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                <span className="text-2xl">🦘</span> Leap
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                A <strong>leap</strong> skips over notes in the scale (like jumping up stairs).
                Leaps are 3+ scale degrees apart.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                <strong>Examples:</strong> C to E, D to G, E to B
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> Steps create smooth, connected melodies (called <em>conjunct motion</em>).
              Leaps create dramatic, energetic melodies (called <em>disjunct motion</em>). Most melodies use a mix of both!
              Recognizing steps and leaps helps you understand melodic movement and sing melodies more accurately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
