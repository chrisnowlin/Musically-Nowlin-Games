import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, GameRound } from "@/lib/schema";
import { audioService } from "@/lib/audioService";
import { generateNewRound as generateRound, validateAnswer, calculateScore } from "@/lib/gameUtils";
import AnimalCharacter from "@/components/AnimalCharacter";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Music2, Loader2, Star, Sparkles } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes } from "@/theme/playful";
import { ResponsiveGameLayout, GameSection, ResponsiveGrid } from "@/components/ResponsiveGameLayout";
import { useResponsiveLayout } from "@/hooks/useViewport";

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

  // Get responsive layout utilities
  const layout = useResponsiveLayout();

  return (
    <ResponsiveGameLayout showDecorations={true}>

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
      <GameSection variant="header">
        <div className="text-center">
          {/* Animated Stars */}
          <div className="flex justify-center gap-4 mb-4">
            <Star className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-500 animate-bounce`} style={{ animationDelay: "0ms" }} />
            <Star className={`${layout.device.isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-pink-500 animate-bounce`} style={{ animationDelay: "150ms" }} />
            <Star className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-purple-500 animate-bounce`} style={{ animationDelay: "300ms" }} />
          </div>

          <h1
            className={`text-center ${playfulColors.gradients.title}`}
            style={{
              fontSize: `${layout.getFontSize('4xl')}px`,
              marginBottom: `${layout.padding}px`
            }}
          >
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
      </GameSection>

      {/* Main game area */}
      <GameSection variant="main" fillSpace>
        <div className="flex flex-col items-center justify-center h-full overflow-y-auto">
          {!gameStarted ? (
            // Start game screen
            <div className="text-center">
              <div className={`${layout.device.isMobile ? 'mb-6' : 'mb-8'}`}>
                <div className="relative inline-block mb-6">
                  <Music2 className={`${layout.device.isMobile ? 'w-16 h-16' : 'w-24 h-24'} mx-auto text-purple-600 animate-pulse`} />
                  <Sparkles className={`${layout.device.isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-400 absolute -top-2 -right-2 animate-spin`} />
                </div>
                <h2
                  className={`${playfulColors.gradients.title} mb-4`}
                  style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
                >
                  Welcome to the Music Game!
                </h2>
                <p
                  className="text-gray-700 dark:text-gray-300 max-w-md mx-auto"
                  style={{ fontSize: `${layout.getFontSize('lg')}px` }}
                >
                  🎵 Learn to identify higher and lower sounds with our friendly animal musicians! 🎵
                </p>
              </div>
              <Button
                onClick={handleStartGame}
                size="lg"
                data-testid="button-start-game"
                className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button} font-fredoka`}
                style={{
                  fontSize: `${layout.getFontSize('lg')}px`,
                  padding: `${layout.padding}px ${layout.padding * 1.5}px`
                }}
              >
                <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                Let's Play!
              </Button>
            </div>
          ) : gameState.currentRound && (
          <>
            {/* Question prompt */}
            <div
              data-testid="display-question"
              className="w-full"
              style={{
                maxWidth: `${layout.maxContentWidth}px`,
                marginBottom: `${layout.padding}px`
              }}
            >
              <div
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} text-center ${playfulShapes.borders.thick} border-purple-300 dark:border-purple-700`}
                style={{ padding: `${layout.padding}px` }}
              >
                <h2
                  className="text-foreground"
                  style={{ fontSize: `${layout.getFontSize('2xl')}px` }}
                >
                  Which animal played the{" "}
                  <span className={gameState.currentRound.question === "higher" ? "text-blue-600 font-bold" : "text-orange-600 font-bold"}>
                    {gameState.currentRound.question === "higher" ? "HIGHER" : "LOWER"}
                  </span>{" "}
                  sound?
                </h2>
                {/* Persistent status message area - always takes up space */}
                <div className="mt-3 min-h-[2rem] flex items-center justify-center">
                  <p
                    className={`transition-opacity duration-300 ${
                      !gameState.isPlaying && !canAnswer && !gameState.feedback
                        ? "opacity-100 text-gray-700 dark:text-gray-300"
                        : "opacity-0 absolute"
                    }`}
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
                  >
                    🎵 Listen carefully to both sounds... 🎵
                  </p>
                  <p
                    className={`text-green-600 dark:text-green-400 font-semibold transition-opacity duration-300 ${
                      canAnswer && !gameState.feedback
                        ? "opacity-100"
                        : "opacity-0 absolute"
                    }`}
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
                  >
                    ✨ Tap the animal you think is correct! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Persistent button area - transforms to show feedback or loading */}
            <div
              className="w-full flex flex-col items-center justify-center"
              style={{
                maxWidth: `${layout.maxContentWidth}px`,
                marginBottom: `${layout.padding}px`,
                gap: `${layout.gridGap / 2}px`
              }}
            >
              {/* Multi-purpose button: Play Again / Feedback / Loading */}
              <Button
                onClick={() => playSounds(gameState.currentRound!)}
                size="lg"
                data-testid={gameState.feedback ? "display-feedback" : "button-play-sounds"}
                className={`
                  gap-2 font-fredoka font-bold
                  ${playfulShapes.rounded.button} ${playfulShapes.shadows.button} transition-all duration-300
                  ${gameState.feedback?.isCorrect
                    ? "bg-green-500 hover:bg-green-500 text-white shadow-xl"
                    : gameState.feedback?.isCorrect === false
                    ? "bg-red-500 hover:bg-red-500 text-white shadow-xl"
                    : playfulColors.gradients.buttonPrimary
                  }
                `}
                style={{
                  fontSize: `${layout.getFontSize('lg')}px`,
                  padding: `${layout.padding * 0.8}px ${layout.padding * 1.2}px`,
                  minWidth: layout.device.isMobile ? 'auto' : '16rem'
                }}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
              >
                {gameState.feedback ? (
                  // Show feedback message with emoji
                  gameState.feedback.isCorrect ? "🎉 Great Job! 🎉" : "💪 Try Again Next Time! 💪"
                ) : isLoadingNextRound ? (
                  // Show loading state
                  <>
                    <Loader2 className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} animate-spin`} />
                    <span style={{ fontSize: `${layout.getFontSize('base')}px` }}>Next Round...</span>
                  </>
                ) : (
                  // Show play button
                  <>
                    <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    <span style={{ fontSize: `${layout.getFontSize('base')}px` }}>Play Sounds Again</span>
                  </>
                )}
              </Button>
            </div>

            {/* Character grid */}
            <ResponsiveGrid
              columns={2}
              className="w-full"
              style={{ maxWidth: `${layout.maxContentWidth}px` }}
            >
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
            </ResponsiveGrid>
          </>
        )}
        </div>
      </GameSection>

      {/* Instructions footer */}
      <GameSection variant="footer">
        <div className="text-center mx-auto" style={{ maxWidth: `${layout.maxContentWidth}px` }}>
          <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg border-4 border-purple-300 dark:border-purple-700"
            style={{ padding: `${layout.padding * 0.75}px ${layout.padding}px` }}
          >
            <div className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200">
              <HelpCircle className={`${layout.device.isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <p
                className="font-semibold"
                style={{ fontSize: `${layout.getFontSize('sm')}px` }}
              >
                🎵 Listen to both animals play their sounds, then tap the one that matches the question! 🎵
              </p>
            </div>
          </div>
        </div>
      </GameSection>
    </ResponsiveGameLayout>
  );
}