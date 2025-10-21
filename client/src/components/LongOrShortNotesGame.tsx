import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Clock, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentQuestion: {
    note1Duration: number;
    note2Duration: number;
    longerNote: 1 | 2;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Note duration options (in seconds)
const DURATIONS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]; // Half note to whole note ranges

export default function LongOrShortNotesGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentQuestion: null,
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
    if (gameStarted && !gameState.currentQuestion) {
      generateNewQuestion();
    }
  }, [gameStarted]);

  const playTwoNotes = useCallback((duration1: number, duration2: number) => {
    if (!audioContext.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const masterVolume = gameState.volume / 100;
    const frequency = 440; // A4
    const gap = 0.5; // Half second gap between notes

    // Play first note
    const osc1 = audioContext.current!.createOscillator();
    const gain1 = audioContext.current!.createGain();

    osc1.connect(gain1);
    gain1.connect(audioContext.current!.destination);

    osc1.frequency.value = frequency;
    osc1.type = "sine";

    const volume = 0.3 * masterVolume;
    const startTime1 = audioContext.current!.currentTime;
    gain1.gain.setValueAtTime(volume, startTime1);
    gain1.gain.exponentialRampToValueAtTime(0.01, startTime1 + duration1);

    osc1.start(startTime1);
    osc1.stop(startTime1 + duration1);

    // Play second note after gap
    const startTime2 = startTime1 + duration1 + gap;
    const osc2 = audioContext.current!.createOscillator();
    const gain2 = audioContext.current!.createGain();

    osc2.connect(gain2);
    gain2.connect(audioContext.current!.destination);

    osc2.frequency.value = frequency;
    osc2.type = "sine";

    gain2.gain.setValueAtTime(volume, startTime2);
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime2 + duration2);

    osc2.start(startTime2);
    osc2.stop(startTime2 + duration2);

    // Reset playing state after both notes finish
    const totalDuration = (duration1 + gap + duration2 + 0.2) * 1000;
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }, totalDuration);
  }, [gameState.volume, gameState.isPlaying]);

  const generateNewQuestion = useCallback(() => {
    // Pick two different durations
    const duration1 = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    let duration2 = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];

    // Ensure they're different enough to be distinguishable (at least 0.5s difference)
    while (Math.abs(duration1 - duration2) < 0.5) {
      duration2 = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    }

    const longerNote: 1 | 2 = duration1 > duration2 ? 1 : 2;

    setGameState(prev => ({
      ...prev,
      currentQuestion: {
        note1Duration: duration1,
        note2Duration: duration2,
        longerNote,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayNotes = useCallback(() => {
    if (gameState.currentQuestion) {
      playTwoNotes(
        gameState.currentQuestion.note1Duration,
        gameState.currentQuestion.note2Duration
      );
    }
  }, [gameState.currentQuestion, playTwoNotes]);

  const handleAnswer = useCallback((guessNote: 1 | 2) => {
    if (!gameState.currentQuestion || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guessNote === gameState.currentQuestion.longerNote;

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
      generateNewQuestion();
    }, 2500);
  }, [gameState.currentQuestion, gameState.hasPlayed, gameState.feedback, generateNewQuestion]);

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
              Long or Short Notes?
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen and compare note durations!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                <span>Listen to two notes played one after the other</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Identify which note was held longer</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about note duration and rhythm!</span>
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
            Long or Short Notes?
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

        {/* Play Notes Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to both notes. Which one was held longer?
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayNotes}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Two Notes'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(1)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                <Clock className="w-12 h-12" />
                First Note
              </Button>
              <Button
                onClick={() => handleAnswer(2)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                <Clock className="w-12 h-12" />
                Second Note
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
                    Correct! The {gameState.currentQuestion?.longerNote === 1 ? 'first' : 'second'} note was longer!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    The {gameState.currentQuestion?.longerNote === 1 ? 'first' : 'second'} note was longer! Listen again!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Understanding Note Duration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                What is Duration?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Duration is how long a note is held. Some notes are short (staccato), while others
                are long (sustained). Duration is a key element of rhythm.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Note Values
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                In music notation: Quarter note (♩) = 1 beat, Half note (𝅗𝅥) = 2 beats,
                Whole note (𝅝) = 4 beats. Longer durations create different musical effects.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Recognizing note duration is essential for understanding rhythm,
              reading music, and playing instruments. This game helps develop your sense of musical timing
              by comparing notes of different lengths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
