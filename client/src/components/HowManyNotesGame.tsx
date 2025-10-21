import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Hash, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentSequence: {
    notes: number[];
    count: number;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

// Notes in C major scale
const SCALE_NOTES = [262, 294, 330, 349, 392, 440, 494, 523]; // C D E F G A B C

export default function HowManyNotesGame() {
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

  const playSequence = useCallback((notes: number[]) => {
    if (!audioContext.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const masterVolume = gameState.volume / 100;
    const noteDuration = 0.4; // seconds per note
    const notePacing = 0.5; // time between note starts

    notes.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * notePacing;
      const duration = noteDuration;

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

    // Reset playing state after sequence finishes
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }, notes.length * notePacing * 1000 + 500);
  }, [gameState.volume, gameState.isPlaying]);

  const generateNewSequence = useCallback(() => {
    // Generate 2-7 random notes
    const count = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const notes: number[] = [];

    for (let i = 0; i < count; i++) {
      const randomNote = SCALE_NOTES[Math.floor(Math.random() * SCALE_NOTES.length)];
      notes.push(randomNote);
    }

    setGameState(prev => ({
      ...prev,
      currentSequence: {
        notes,
        count,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlaySequence = useCallback(() => {
    if (gameState.currentSequence) {
      playSequence(gameState.currentSequence.notes);
    }
  }, [gameState.currentSequence, playSequence]);

  const handleAnswer = useCallback((guess: number) => {
    if (!gameState.currentSequence || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guess === gameState.currentSequence.count;

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
              How Many Notes?
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen carefully and count the notes!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Hash className="w-6 h-6 text-pink-500" />
                <span>Listen to a sequence of 2-7 musical notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Count how many notes you hear</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Click the correct number to score points!</span>
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
            How Many Notes?
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

        {/* Play Sequence Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the sequence and count the notes!
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlaySequence}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Sequence'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4, 5, 6, 7].map((num) => (
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
                    Correct! There were {gameState.currentSequence?.count} notes!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    That was {gameState.currentSequence?.count} notes! Listen again!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Tips for Counting Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2">
                Listening Strategy
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Focus on each distinct sound you hear. Each note is separate from the next,
                even if they're very close together.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Counting Technique
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Try tapping your finger or nodding your head for each note you hear.
                This helps you keep track of the count.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Counting notes helps develop auditory attention and memory.
              This skill is essential for learning rhythm, following sheet music, and understanding
              musical structure. The sequences range from 2 to 7 notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
