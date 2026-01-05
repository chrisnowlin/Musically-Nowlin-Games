import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { SameOrDifferentRound, generateSameOrDifferentRound, validateSameOrDifferentAnswer, calculateSameOrDifferentScore } from "@/lib/sameOrDifferentLogic";
import { audioService } from "@/lib/audioService";
import AnimalCharacter from "@/components/AnimalCharacter";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Music2, Loader2, Star, Sparkles, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, generateDecorativeOrbs } from "@/theme/playful";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import { createWebAudioScheduler, WebAudioScheduler, ScheduledSound } from '@/lib/audio/webAudioScheduler';

interface GameState {
  currentRound: SameOrDifferentRound | null;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: {
    show: boolean;
    isCorrect: boolean;
    selectedAnswer: "same" | "different" | null;
  } | null;
}

export default function SameOrDifferentGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
  });

  const [canAnswer, setCanAnswer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);
  const [volume, setVolume] = useState<number>(30);

  // Use the cleanup hook for auto-cleanup of timeouts and audio on unmount
  const { setTimeout, clearAll, isMounted } = useGameCleanup();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<WebAudioScheduler | null>(null);

  /**
   * Initialize Web Audio scheduler
   */
  const getScheduler = useCallback((): WebAudioScheduler | null => {
    if (schedulerRef.current) {
      return schedulerRef.current;
    }

    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }

    if (!masterGainRef.current && audioContextRef.current) {
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = volume / 100;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current && masterGainRef.current) {
      schedulerRef.current = createWebAudioScheduler(audioContextRef.current, masterGainRef.current);
      return schedulerRef.current;
    }

    return null;
  }, [volume]);

  // Play phrases for the current round
  const playPhrases = useCallback(async (round: SameOrDifferentRound) => {
    const scheduler = getScheduler();
    if (!scheduler || !isMounted.current) return;

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Stop any existing playback
    scheduler.stop();

    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setCanAnswer(false);

    try {
      // Build scheduled events for both phrases
      const events: ScheduledSound[] = [];
      let currentTime = 0;
      const gap = 0.05; // Gap between notes

      // First phrase
      for (let i = 0; i < round.phrase1.length; i++) {
        const frequency = round.phrase1[i];
        const durationSeconds = round.phraseDurations1[i] / 1000; // Convert ms to seconds
        const volume = round.dynamics1[i] !== undefined ? round.dynamics1[i] : 0.7;

        events.push({
          time: currentTime,
          frequency: frequency,
          duration: durationSeconds,
          volume: volume,
          eventIndex: i,
          partIndex: 1,
        });

        currentTime += durationSeconds + gap;
      }

      // Pause between phrases (800ms)
      currentTime += 0.8;

      // Second phrase
      for (let i = 0; i < round.phrase2.length; i++) {
        const frequency = round.phrase2[i];
        const durationSeconds = round.phraseDurations2[i] / 1000; // Convert ms to seconds
        const volume = round.dynamics2[i] !== undefined ? round.dynamics2[i] : 0.7;

        events.push({
          time: currentTime,
          frequency: frequency,
          duration: durationSeconds,
          volume: volume,
          eventIndex: i,
          partIndex: 2,
        });

        currentTime += durationSeconds + gap;
      }

      // Schedule all events
      await scheduler.scheduleSequence(events, {
        onComplete: () => {
          if (isMounted.current) {
            setGameState(prev => ({ ...prev, isPlaying: false }));
            setCanAnswer(true);
          }
        },
      });
    } catch (error) {
      console.error('Error playing phrases:', error);
      if (isMounted.current) {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }
    }
  }, [getScheduler, isMounted]);

  // Start a new round
  const startNewRound = useCallback(async () => {
    const newRound = generateSameOrDifferentRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));
    setCanAnswer(false);

    // Auto-play phrases after a short delay
    setTimeout(() => {
      playPhrases(newRound);
    }, 500);
  }, [playPhrases, setTimeout]);

  // Handle answer selection
  const handleAnswerClick = useCallback((answer: "same" | "different") => {
    if (!canAnswer || !gameState.currentRound || gameState.feedback) return;

    const isCorrect = validateSameOrDifferentAnswer(answer, gameState.currentRound.isDifferent);

    setGameState(prev => ({
      ...prev,
      score: calculateSameOrDifferentScore(prev.score, isCorrect),
      totalQuestions: prev.totalQuestions + 1,
      feedback: {
        show: true,
        isCorrect,
        selectedAnswer: answer,
      },
    }));

    // Play audio feedback
    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    // Show loading indicator
    setTimeout(() => {
      if (isMounted.current) {
        setIsLoadingNextRound(true);
      }
    }, 2000);

    // Auto-advance to next round
    setTimeout(() => {
      if (isMounted.current) {
        startNewRound();
        setIsLoadingNextRound(false);
      }
    }, 2500);
  }, [canAnswer, gameState.currentRound, gameState.feedback, startNewRound]);

  // Reset the game
  const resetGame = useCallback(() => {
    // Clear all pending timeouts and stop audio
    clearAll();

    setGameState({
      currentRound: null,
      score: 0,
      totalQuestions: 0,
      isPlaying: false,
      feedback: null,
    });
    setCanAnswer(false);
    setGameStarted(false);
    setIsLoadingNextRound(false);
  }, [clearAll]);

  // Initialize and start the game
  const handleStartGame = useCallback(async () => {
    await audioService.initialize();
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    setGameStarted(true);
    startNewRound();
  }, [startNewRound]);

  // Apply volume changes
  useEffect(() => {
    audioService.setVolume(volume / 100);
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      masterGainRef.current.gain.linearRampToValueAtTime(volume / 100, now + 0.05);
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const decorativeOrbs = generateDecorativeOrbs();

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

      {/* Decorative Background Elements */}
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* ARIA live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-announcements"
      >
        {gameState.currentRound && !gameState.isPlaying && canAnswer && (
          "Listen to both phrases. Are they the same or different? Choose your answer."
        )}
        {gameState.feedback && (
          gameState.feedback.isCorrect
            ? "Correct! Great job!"
            : "Incorrect. Try again next time!"
        )}
        {isLoadingNextRound && "Getting next round ready..."}
      </div>

      {/* Header */}
      <header className="py-4 md:py-8 px-4 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          {/* Animated Stars */}
          <div className="flex justify-center gap-4 mb-4">
            <Star className="w-8 h-8 text-yellow-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <Star className="w-10 h-10 text-pink-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <Star className="w-8 h-8 text-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>

          <h1 className={`${playfulTypography.headings.hero} text-center mb-4 md:mb-6 ${playfulColors.gradients.title}`}>
            Same or Different?
          </h1>

          <ScoreDisplay
            score={gameState.score}
            totalQuestions={gameState.totalQuestions}
            onReset={resetGame}
            volume={volume}
            onVolumeChange={setVolume}
          />
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        {!gameStarted ? (
          // Start screen
          <div className="text-center">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <Music2 className="w-24 h-24 mx-auto text-purple-600 animate-pulse" />
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
              </div>
              <h2 className={`${playfulTypography.headings.h1} mb-4 ${playfulColors.gradients.title}`}>
                Welcome to Same or Different!
              </h2>
              <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 max-w-md mx-auto`}>
                🎵 Listen carefully to two musical phrases and decide if they are the same or different! 🎵
              </p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              data-testid="button-start-game"
              className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button} font-fredoka text-xl px-12 py-8`}
            >
              <Play className="w-6 h-6 mr-2" />
              Let's Play!
            </Button>
          </div>
        ) : gameState.currentRound && (
          <>
            {/* Question prompt */}
            <div
              data-testid="display-question"
              className="w-full max-w-5xl xl:max-w-6xl mb-4 md:mb-6"
            >
              <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} p-4 md:p-6 text-center ${playfulShapes.borders.thick} border-purple-300 dark:border-purple-700`}>
                <h2 className={`${playfulTypography.headings.h2} text-foreground`}>
                  Are these two musical phrases{" "}
                  <span className="text-pink-600 font-bold">the same or different</span>?
                </h2>
                <div className="mt-3 min-h-[2rem] flex items-center justify-center">
                  <p className={`${playfulTypography.body.large} transition-opacity duration-300 ${
                    !gameState.isPlaying && !canAnswer && !gameState.feedback
                      ? "opacity-100 text-gray-700 dark:text-gray-300"
                      : "opacity-0 absolute"
                  }`}>
                    🎵 Listen carefully to both phrases... 🎵
                  </p>
                  <p className={`${playfulTypography.body.large} text-green-600 dark:text-green-400 font-semibold transition-opacity duration-300 ${
                    canAnswer && !gameState.feedback
                      ? "opacity-100"
                      : "opacity-0 absolute"
                  }`}>
                    ✨ Choose your answer! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Play button */}
            <div className="w-full max-w-5xl xl:max-w-6xl mb-4 md:mb-6 flex flex-col items-center justify-center gap-3">
              <Button
                onClick={() => playPhrases(gameState.currentRound!)}
                size="lg"
                data-testid={gameState.feedback ? "display-feedback" : "button-play-sounds"}
                className={`
                  gap-2 font-fredoka font-bold text-[clamp(1.25rem,2.5vw,2rem)]
                  px-[clamp(1.5rem,2.5vw,2.5rem)] py-[clamp(1rem,2vw,1.75rem)]
                  ${playfulShapes.rounded.button} ${playfulShapes.shadows.button} transition-all duration-300 min-w-[16rem]
                  ${gameState.feedback?.isCorrect
                    ? "bg-green-500 hover:bg-green-500 text-white shadow-xl"
                    : gameState.feedback?.isCorrect === false
                    ? "bg-red-500 hover:bg-red-500 text-white shadow-xl"
                    : playfulColors.gradients.buttonPrimary
                  }
                `}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
              >
                {gameState.feedback ? (
                  gameState.feedback.isCorrect ? "🎉 Great Job! 🎉" : "💪 Try Again Next Time! 💪"
                ) : isLoadingNextRound ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-nunito text-[clamp(1rem,2vw,1.25rem)]">Next Round...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span className="font-nunito text-[clamp(1rem,2vw,1.25rem)]">Play Sounds Again</span>
                  </>
                )}
              </Button>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-[clamp(1rem,3vw,4rem)] w-full max-w-4xl">
              <Button
                onClick={() => handleAnswerClick("same")}
                size="lg"
                disabled={!canAnswer || gameState.feedback !== null}
                className={`${playfulShapes.rounded.button} ${playfulShapes.shadows.button} font-fredoka text-lg py-6
                  ${gameState.feedback?.selectedAnswer === "same"
                    ? gameState.feedback.isCorrect
                      ? "bg-green-500 hover:bg-green-500 text-white"
                      : "bg-red-500 hover:bg-red-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                data-testid="button-same"
              >
                Same
              </Button>
              <Button
                onClick={() => handleAnswerClick("different")}
                size="lg"
                disabled={!canAnswer || gameState.feedback !== null}
                className={`${playfulShapes.rounded.button} ${playfulShapes.shadows.button} font-fredoka text-lg py-6
                  ${gameState.feedback?.selectedAnswer === "different"
                    ? gameState.feedback.isCorrect
                      ? "bg-green-500 hover:bg-green-500 text-white"
                      : "bg-red-500 hover:bg-red-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                data-testid="button-different"
              >
                Different
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Instructions footer */}
      <footer className="py-4 md:py-6 px-4 relative z-10">
        <div className="max-w-5xl xl:max-w-6xl mx-auto text-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl py-4 px-6 shadow-lg border-4 border-purple-300 dark:border-purple-700">
            <div className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200">
              <HelpCircle className="w-5 h-5" />
              <p className={`${playfulTypography.body.medium} font-semibold`}>
                🎵 Listen to both musical phrases, then tap "Same" or "Different"! 🎵
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
