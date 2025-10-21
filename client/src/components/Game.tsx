import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameRound } from "@/lib/schema";
import { audioService } from "@/lib/audioService";
import { generateNewRound as generateRound, validateAnswer, calculateScore } from "@/lib/gameUtils";
import AnimalCharacter from "@/components/AnimalCharacter";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Music2, Loader2, Star, Sparkles } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, generateDecorativeOrbs } from "@/theme/playful";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
  });

  const [playingCharacter, setPlayingCharacter] = useState<1 | 2 | null>(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);
  const [volume, setVolume] = useState<number>(30); // 0..100
  
  // Track timeout IDs for cleanup using refs (doesn't trigger re-renders)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []);

  // Play sounds for the current round
  const playSounds = useCallback(async (round: GameRound) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setCanAnswer(false);

    // Play first character's sound
    setPlayingCharacter(1);
    await audioService.playNote(round.pitch1, 1.5);
    setPlayingCharacter(null);

    // Small pause between sounds
    await new Promise(resolve => setTimeout(resolve, 500));

    // Play second character's sound
    setPlayingCharacter(2);
    await audioService.playNote(round.pitch2, 1.5);
    setPlayingCharacter(null);

    setGameState(prev => ({ ...prev, isPlaying: false }));
    setCanAnswer(true);
  }, []);

  // Start a new round
  const startNewRound = useCallback(async () => {
    // Clear any pending timeouts to avoid overlapping timers
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    const newRound = generateRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));
    setCanAnswer(false);
    
    // Auto-play sounds after a short delay
    autoPlayTimeoutRef.current = setTimeout(() => {
      playSounds(newRound);
      autoPlayTimeoutRef.current = null;
    }, 500);
  }, [playSounds]);

  // Handle character selection (answer)
  const handleCharacterClick = useCallback((characterPosition: 1 | 2) => {
    if (!canAnswer || !gameState.currentRound || gameState.feedback) return;

    const isCorrect = validateAnswer(characterPosition, gameState.currentRound.correctAnswer);

    setGameState(prev => ({
      ...prev,
      score: calculateScore(prev.score, isCorrect),
      totalQuestions: prev.totalQuestions + 1,
      feedback: {
        show: true,
        isCorrect,
        selectedCharacter: characterPosition,
      },
    }));

    // Play simple audio feedback matching visual cues
    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    // Clear any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }

    // Show loading indicator before next round
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoadingNextRound(true);
    }, 2000);

    // Auto-advance to next round after feedback
    nextRoundTimeoutRef.current = setTimeout(() => {
      startNewRound();
      setIsLoadingNextRound(false);
      loadingTimeoutRef.current = null;
      nextRoundTimeoutRef.current = null;
    }, 2500);
  }, [canAnswer, gameState.currentRound, gameState.feedback, startNewRound]);

  // Reset the game
  const resetGame = useCallback(() => {
    // Clear all pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    setGameState({
      currentRound: null,
      score: 0,
      totalQuestions: 0,
      isPlaying: false,
      feedback: null,
    });
    setCanAnswer(false);
    setPlayingCharacter(null);
    setGameStarted(false);
    setIsLoadingNextRound(false);
  }, []);

  // Start the game for the first time (initializes audio context)
  const handleStartGame = useCallback(async () => {
    await audioService.initialize();
    setGameStarted(true);
    startNewRound();
  }, [startNewRound]);

  // Apply volume changes to audio service
  useEffect(() => {
    audioService.setVolume(volume / 100);
  }, [volume]);

  const decorativeOrbs = generateDecorativeOrbs();

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* ARIA live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-announcements"
      >
        {gameState.currentRound && !gameState.isPlaying && canAnswer && (
          `Question: Which animal played the ${gameState.currentRound.question} sound? ${gameState.currentRound.character1.name} and ${gameState.currentRound.character2.name} are ready for your answer.`
        )}
        {gameState.feedback && (
          gameState.feedback.isCorrect
            ? "Correct! Great job!"
            : "Incorrect. Try again next time!"
        )}
        {isLoadingNextRound && "Getting next round ready..."}
      </div>

      {/* Header with title and score */}
      <header className="py-4 md:py-8 px-4 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          {/* Animated Stars */}
          <div className="flex justify-center gap-4 mb-4">
            <Star className="w-8 h-8 text-yellow-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <Star className="w-10 h-10 text-pink-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <Star className="w-8 h-8 text-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>

          <h1 className={`${playfulTypography.headings.hero} text-center mb-4 md:mb-6 ${playfulColors.gradients.title}`}>
            High or Low?
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
          // Start game screen
          <div className="text-center">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <Music2 className="w-24 h-24 mx-auto text-purple-600 animate-pulse" />
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
              </div>
              <h2 className={`${playfulTypography.headings.h1} mb-4 ${playfulColors.gradients.title}`}>
                Welcome to the Music Game!
              </h2>
              <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 max-w-md mx-auto`}>
                🎵 Learn to identify higher and lower sounds with our friendly animal musicians! 🎵
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
                  Which animal played the{" "}
                  <span className={gameState.currentRound.question === "higher" ? "text-blue-600 font-bold" : "text-orange-600 font-bold"}>
                    {gameState.currentRound.question === "higher" ? "HIGHER" : "LOWER"}
                  </span>{" "}
                  sound?
                </h2>
                {/* Persistent status message area - always takes up space */}
                <div className="mt-3 min-h-[2rem] flex items-center justify-center">
                  <p className={`${playfulTypography.body.large} transition-opacity duration-300 ${
                    !gameState.isPlaying && !canAnswer && !gameState.feedback
                      ? "opacity-100 text-gray-700 dark:text-gray-300"
                      : "opacity-0 absolute"
                  }`}>
                    🎵 Listen carefully to both sounds... 🎵
                  </p>
                  <p className={`${playfulTypography.body.large} text-green-600 dark:text-green-400 font-semibold transition-opacity duration-300 ${
                    canAnswer && !gameState.feedback
                      ? "opacity-100"
                      : "opacity-0 absolute"
                  }`}>
                    ✨ Tap the animal you think is correct! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Persistent button area - transforms to show feedback or loading */}
            <div className="w-full max-w-5xl xl:max-w-6xl mb-4 md:mb-6 flex flex-col items-center justify-center gap-3">
              {/* Multi-purpose button: Play Again / Feedback / Loading */}
              <Button
                onClick={() => playSounds(gameState.currentRound!)}
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
                  // Show feedback message with emoji
                  gameState.feedback.isCorrect ? "🎉 Great Job! 🎉" : "💪 Try Again Next Time! 💪"
                ) : isLoadingNextRound ? (
                  // Show loading state
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-nunito text-[clamp(1rem,2vw,1.25rem)]">Next Round...</span>
                  </>
                ) : (
                  // Show play button
                  <>
                    <Play className="w-6 h-6" />
                    <span className="font-nunito text-[clamp(1rem,2vw,1.25rem)]">Play Sounds Again</span>
                  </>
                )}
              </Button>
            </div>

            {/* Character grid */}
            <div className="grid grid-cols-2 gap-[clamp(1rem,3vw,4rem)] w-full max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl">
              <AnimalCharacter
                character={gameState.currentRound.character1}
                position={1}
                isPlaying={playingCharacter === 1}
                isSelected={gameState.feedback?.selectedCharacter === 1}
                isCorrect={
                  gameState.feedback?.selectedCharacter === 1 
                    ? gameState.feedback.isCorrect 
                    : null
                }
                disabled={!canAnswer || gameState.feedback !== null}
                onClick={() => handleCharacterClick(1)}
              />
              <AnimalCharacter
                character={gameState.currentRound.character2}
                position={2}
                isPlaying={playingCharacter === 2}
                isSelected={gameState.feedback?.selectedCharacter === 2}
                isCorrect={
                  gameState.feedback?.selectedCharacter === 2 
                    ? gameState.feedback.isCorrect 
                    : null
                }
                disabled={!canAnswer || gameState.feedback !== null}
                onClick={() => handleCharacterClick(2)}
              />
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
                🎵 Listen to both animals play their sounds, then tap the one that matches the question! 🎵
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}