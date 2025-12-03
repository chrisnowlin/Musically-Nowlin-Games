import { useState, useEffect, useCallback, useMemo } from "react";
import { GameState, GameRound } from "@/lib/schema";
import { audioService } from "@/lib/audioService";
import { generateNewRound as generateRound, validateAnswer, calculateScore } from "@/lib/gameUtils";
import AnimalCharacter from "@/components/AnimalCharacter";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Music2, Star, Sparkles } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes } from "@/theme/playful";
import { ResponsiveGameLayout, GameSection, ResponsiveCard } from "@/components/ResponsiveGameLayout";
import { useResponsiveLayout } from "@/hooks/useViewport";
import { useGameCleanup } from "@/hooks/useGameCleanup";

const FEEDBACK_OPTIONS = [
  { title: "Correct!", message: "You're a music master! 🎵" },
  { title: "Awesome!", message: "Your ears are amazing! 👂✨" },
  { title: "Spot On!", message: "That was perfect pitch! 🎯" },
  { title: "Great Job!", message: "You're getting really good at this! 🌟" },
  { title: "Fantastic!", message: "Keep up the musical magic! 🪄" },
  { title: "Brilliant!", message: "You're a star listener! ⭐" },
  { title: "Super!", message: "You got the right sound! 🎶" },
  { title: "Hooray!", message: "That's the correct answer! 🎉" },
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
  });

  const [numAnimals, setNumAnimals] = useState<number>(2); // Default to 2 animals
  const [playingCharacter, setPlayingCharacter] = useState<number | null>(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);
  const [volume, setVolume] = useState<number>(30); // 0..100
  
  // Use the cleanup hook for auto-cleanup of timeouts and audio on unmount
  const { setTimeout, clearAll, isMounted } = useGameCleanup();

  // Play sounds for the current round
  const playSounds = useCallback(async (round: GameRound) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setCanAnswer(false);

    // Play each character's sound in sequence
    for (let i = 0; i < round.characters.length; i++) {
      // Check if component unmounted - exit early to stop the loop
      if (!isMounted.current) return;
      
      setPlayingCharacter(i + 1);
      await audioService.playNote(round.pitches[i], 1.5);
      
      // Check again after note finished
      if (!isMounted.current) return;
      
      setPlayingCharacter(null);
      
      // Small pause between sounds (except after the last one)
      if (i < round.characters.length - 1) {
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      }
    }

    // Only update state if still mounted
    if (isMounted.current) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
      setCanAnswer(true);
    }
  }, [isMounted, setTimeout]);

  // Start a new round
  const startNewRound = useCallback(async () => {
    const newRound = generateRound(numAnimals);
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));
    setCanAnswer(false);
    
    // Auto-play sounds after a short delay (auto-cleaned on unmount)
    setTimeout(() => playSounds(newRound), 500);
  }, [playSounds, numAnimals, setTimeout]);

  // Handle character selection (answer)
  const handleCharacterClick = useCallback((characterPosition: number) => {
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

    // Show loading indicator before next round (auto-cleaned on unmount)
    setTimeout(() => setIsLoadingNextRound(true), 2000);

    // Auto-advance to next round after feedback (auto-cleaned on unmount)
    setTimeout(() => {
      startNewRound();
      setIsLoadingNextRound(false);
    }, 2500);
  }, [canAnswer, gameState.currentRound, gameState.feedback, startNewRound, setTimeout]);

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
    setPlayingCharacter(null);
    setGameStarted(false);
    setIsLoadingNextRound(false);
  }, [clearAll]);

  // Reset game when numAnimals changes
  useEffect(() => {
    if (gameStarted) {
      resetGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numAnimals]);

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

  // Randomize feedback message when correct answer is shown
  const celebrationFeedback = useMemo(() => {
    if (gameState.feedback?.isCorrect) {
      return FEEDBACK_OPTIONS[Math.floor(Math.random() * FEEDBACK_OPTIONS.length)];
    }
    return FEEDBACK_OPTIONS[0]; // Default fallback
  }, [gameState.feedback?.isCorrect, gameState.totalQuestions]); // Recalculate only when answer correctness changes or new question answered

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
          `Question: Which animal played the ${numAnimals > 2 
            ? (gameState.currentRound.question === "higher" ? "highest" : "lowest")
            : (gameState.currentRound.question === "higher" ? "higher" : "lower")
          } sound? ${gameState.currentRound.characters.map(c => c.name).join(', ')} are ready for your answer.`
        )}
        {gameState.feedback && (
          gameState.feedback.isCorrect
            ? `${celebrationFeedback.title} ${celebrationFeedback.message}`
            : "Incorrect. Try again next time!"
        )}
        {isLoadingNextRound && "Getting next round ready..."}
      </div>

      {/* Celebration Overlay */}
      {gameState.feedback?.isCorrect && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300" />
          <div className="relative z-10 animate-in zoom-in-50 bounce-in duration-500">
            <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-[3rem] shadow-2xl border-8 border-green-400 flex flex-col items-center gap-4 transform rotate-[-2deg]">
              <div className="flex gap-4">
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <h2 className={`${playfulTypography.headings.h1} text-green-600 dark:text-green-400 drop-shadow-md text-center`}>
                {celebrationFeedback.title}
              </h2>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 text-center">
                {celebrationFeedback.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with title and score */}
      <GameSection variant="header">
        <div className="text-center">
          {/* Animated Stars */}
          <div className="flex justify-center gap-2 mb-1">
            <Star className={`${layout.device.isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-500 animate-bounce`} style={{ animationDelay: "0ms" }} />
            <Star className={`${layout.device.isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-pink-500 animate-bounce`} style={{ animationDelay: "150ms" }} />
            <Star className={`${layout.device.isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-purple-500 animate-bounce`} style={{ animationDelay: "300ms" }} />
          </div>

          <h1
            className={`text-center ${playfulColors.gradients.title}`}
            style={{
              fontSize: `${layout.getFontSize('2xl')}px`,
              marginBottom: `${layout.padding * 0.25}px`
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
            <ResponsiveCard className="w-full max-w-2xl mx-auto border-4 border-purple-300 dark:border-purple-700">
              <div className="text-center">
                <div className={`${layout.device.isMobile ? 'mb-4' : 'mb-6'}`}>
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Music2 className={`${layout.device.isMobile ? 'w-12 h-12' : 'w-20 h-20'} mx-auto text-purple-600 relative z-10`} />
                    <Sparkles className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400 absolute -top-2 -right-2 animate-spin z-20`} />
                    <Sparkles className={`${layout.device.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-pink-400 absolute -bottom-2 -left-2 animate-pulse z-20 delay-300`} />
                  </div>
                  <h2
                    className={`${playfulColors.gradients.title} mb-4 font-bold`}
                    style={{ fontSize: `${layout.getFontSize('2xl')}px` }}
                  >
                    Welcome to the Music Game!
                  </h2>
                  <p
                    className="text-gray-700 dark:text-gray-300 max-w-md mx-auto mb-6 font-medium leading-relaxed"
                    style={{ fontSize: `${layout.getFontSize('lg')}px` }}
                  >
                    🎵 Learn to identify <span className="text-blue-600 font-bold">higher</span> and <span className="text-orange-600 font-bold">lower</span> sounds with our friendly animal musicians! 🎵
                  </p>
                </div>
                
                {/* Mode Selection Menu */}
                <div className="mb-8">
                  <h3
                    className="text-purple-800 dark:text-purple-200 mb-4 font-bold"
                    style={{ fontSize: `${layout.getFontSize('xl')}px` }}
                  >
                    How many animals?
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                    {[2, 3, 4, 5].map((count) => (
                      <Button
                        key={count}
                        onClick={() => setNumAnimals(count)}
                        variant={numAnimals === count ? "default" : "outline"}
                        className={`
                          ${playfulShapes.rounded.button} font-fredoka transition-all duration-300
                          ${numAnimals === count 
                            ? `${playfulColors.gradients.buttonPrimary} ${playfulShapes.shadows.button} scale-110 ring-2 ring-purple-300` 
                            : "border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 hover:bg-purple-50 text-purple-700"
                          }
                        `}
                        style={{
                          fontSize: `${layout.getFontSize('base')}px`,
                          padding: `${layout.padding * 0.4}px ${layout.padding * 0.8}px`,
                          minWidth: '4rem'
                        }}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStartGame}
                  size="lg"
                  data-testid="button-start-game"
                  className={`${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button} font-fredoka hover:scale-105 transition-transform duration-200`}
                  style={{
                    fontSize: `${layout.getFontSize('xl')}px`,
                    padding: `${layout.padding * 0.75}px ${layout.padding * 1.5}px`
                  }}
                >
                  <Play className={`${layout.device.isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2 fill-current`} />
                  Let's Play!
                </Button>
              </div>
            </ResponsiveCard>
          ) : gameState.currentRound && (
          <>
            {/* Question prompt */}
            <div
              data-testid="display-question"
              className="w-full"
              style={{
                maxWidth: `${layout.maxContentWidth}px`,
                marginBottom: `${layout.padding * 0.25}px`
              }}
            >
              <ResponsiveCard
                className={`${playfulShapes.borders.thick} border-purple-300 dark:border-purple-700 text-center relative overflow-visible`}
              >
                {/* Floating decorative notes */}
                <div className="absolute -top-4 -left-2 text-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}>
                  <Music2 size={24} />
                </div>
                <div className="absolute -top-2 -right-2 text-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}>
                  <Music2 size={20} />
                </div>

                <h2
                  className="text-foreground font-bold mb-2"
                  style={{ fontSize: `${layout.getFontSize('lg')}px` }}
                >
                  Which animal played the{" "}
                  <span className={`
                    inline-block px-2 py-1 rounded-lg transform -rotate-2
                    ${gameState.currentRound.question === "higher" 
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-200" 
                      : "bg-orange-100 text-orange-600 border-2 border-orange-200"
                    }
                  `}>
                    {numAnimals > 2 
                      ? (gameState.currentRound.question === "higher" ? "HIGHEST" : "LOWEST")
                      : (gameState.currentRound.question === "higher" ? "HIGHER" : "LOWER")
                    }
                  </span>{" "}
                  sound?
                </h2>
                {/* Persistent status message area - always takes up space */}
                <div className="mt-2 min-h-[1.5rem] flex items-center justify-center">
                  <p
                    className={`transition-all duration-300 flex items-center gap-2 ${
                      !gameState.isPlaying && !canAnswer && !gameState.feedback
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 absolute transform -translate-y-2"
                    }`}
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
                  >
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"/>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Listen carefully...</span>
                  </p>
                  <p
                    className={`text-green-600 dark:text-green-400 font-bold transition-all duration-300 flex items-center gap-2 ${
                      canAnswer && !gameState.feedback
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 absolute transform translate-y-2"
                    }`}
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
                  >
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Tap the correct animal!
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </p>
                </div>
              </ResponsiveCard>
            </div>

            {/* Persistent button area - transforms to show feedback or loading */}
            <div
              className="w-full flex flex-col items-center justify-center"
              style={{
                maxWidth: `${layout.maxContentWidth}px`,
                marginBottom: `${layout.padding * 0.25}px`,
                gap: `${layout.gridGap / 4}px`
              }}
            >
              {/* Multi-purpose button: Play Again / Feedback / Loading */}
              <Button
                onClick={() => playSounds(gameState.currentRound!)}
                size="lg"
                data-testid={gameState.feedback ? "display-feedback" : "button-play-sounds"}
                className={`
                  gap-2 font-fredoka font-bold
                  ${playfulShapes.rounded.button} ${playfulShapes.shadows.button} transition-all duration-300 hover:scale-105
                  ${gameState.feedback?.isCorrect
                    ? "bg-green-500 hover:bg-green-500 text-white shadow-xl"
                    : gameState.feedback?.isCorrect === false
                    ? "bg-red-500 hover:bg-red-500 text-white shadow-xl"
                    : playfulColors.gradients.buttonPrimary
                  }
                `}
                style={{
                  fontSize: `${layout.getFontSize('sm')}px`,
                  padding: `${layout.padding * 0.25}px ${layout.padding * 0.5}px`,
                  minWidth: layout.device.isMobile ? 'auto' : '12rem'
                }}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
              >
                {gameState.feedback ? (
                  // Show feedback message with emoji
                  gameState.feedback.isCorrect ? "🎉 Great Job! 🎉" : "💪 Try Again Next Time! 💪"
                ) : isLoadingNextRound ? (
                  // Show loading state
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span style={{ fontSize: `${layout.getFontSize('base')}px` }} className="ml-1">Next Round...</span>
                  </div>
                ) : (
                  // Show play button
                  <>
                    <Play className={`${layout.device.isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span style={{ fontSize: `${layout.getFontSize('base')}px` }}>Play Sounds Again</span>
                  </>
                )}
              </Button>
            </div>

            {/* Character grid */}
            <div
              className="w-full flex flex-wrap items-center justify-center gap-[clamp(0.75rem,1.5vw,1.5rem)]"
              style={{ maxWidth: `${layout.maxContentWidth}px` }}
            >
              {gameState.currentRound.characters.map((character, index) => {
                const position = index + 1;
                return (
                  <AnimalCharacter
                    key={character.id}
                    character={character}
                    position={position}
                    isPlaying={playingCharacter === position}
                    isSelected={gameState.feedback?.selectedCharacter === position}
                    isCorrect={
                      gameState.feedback?.selectedCharacter === position
                        ? gameState.feedback.isCorrect
                        : null
                    }
                    disabled={!canAnswer || gameState.feedback !== null}
                    onClick={() => handleCharacterClick(position)}
                  />
                );
              })}
            </div>
          </>
        )}
        </div>
      </GameSection>

      {/* Instructions footer - only show before game starts */}
      {!gameStarted && (
        <GameSection variant="footer">
          <div className="text-center mx-auto" style={{ maxWidth: `${layout.maxContentWidth}px` }}>
            <div
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg border-4 border-purple-300 dark:border-purple-700"
              style={{ padding: `${layout.padding * 0.25}px ${layout.padding * 0.5}px` }}
            >
              <div className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200">
                <HelpCircle className={`${layout.device.isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <p
                  className="font-semibold"
                  style={{ fontSize: `${layout.getFontSize('sm')}px` }}
                >
                  🎵 Listen to all the animals play their sounds, then tap the one that matches the question! 🎵
                </p>
              </div>
            </div>
          </div>
        </GameSection>
      )}
    </ResponsiveGameLayout>
  );
}
