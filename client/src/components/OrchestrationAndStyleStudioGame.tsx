import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play } from "lucide-react";
import { useLocation } from "wouter";
import { generateRound, validateAnswer, calculateScore, getNextLevel, GameState } from "@/lib/gameLogic/compose-002Logic";
import { getCompose002Mode, Compose002ModeId } from "@/lib/gameLogic/compose-002Modes";
import { audioService } from "@/lib/audioService";
import { Button } from "@/components/ui/button";
import { ResponsiveGameLayout, GameSection, ResponsiveGrid } from "@/components/ResponsiveGameLayout";
import { playfulColors, playfulShapes, playfulComponents } from "@/theme/playful";

const LS_KEYS = {
  lastMode: "compose-002:lastMode",
  highScores: "compose-002:highScores",
  roundsPlayed: "compose-002:roundsPlayed",
  achievements: "compose-002:achievements",
} as const;

const OrchestrationAndStyleStudioGame: React.FC = () => {
  const [, setLocation] = useLocation();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    round: 0,
    totalRounds: 10,
    currentRound: null,
    showResult: false,
    lastAnswerCorrect: false,
    gameStarted: false,
    level: 1,
    correctStreak: 0,
  });

  const [currentMode, setCurrentMode] = useState<Compose002ModeId>("orchestration");
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Memoize mode config to prevent recalculations
  const modeConfig = useMemo(() => getCompose002Mode(currentMode), [currentMode]);

  // Start new round
  const startNewRound = useCallback(() => {
    if (!modeConfig) return;

    const difficulty = modeConfig.difficultyCurve(gameState.level).difficulty;
    const newRound = generateRound(currentMode, difficulty);
    
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      showResult: false,
      lastAnswerCorrect: false,
      round: prev.round + 1,
    }));
    setSelectedAnswer(null);
  }, [currentMode, gameState.level, modeConfig]);

  // Initialize audio with error handling
  const initializeAudio = useCallback(async () => {
    if (!audioInitialized && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        await audioService.initialize();
        setAudioInitialized(true);
      } catch (err) {
        setError('Failed to initialize audio. You can still play without sound.');
        console.error('Audio initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [audioInitialized, isLoading]);

  // Start game with error handling
  const startGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!audioInitialized) {
        await audioService.initialize();
        setAudioInitialized(true);
      }
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        score: 0,
        round: 0,
        level: 1,
        correctStreak: 0,
      }));
      startNewRound();
    } catch (err) {
      setError('Failed to start game. Please try again.');
      console.error('Game start failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [audioInitialized, startNewRound]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (gameState.showResult || !gameState.currentRound) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = validateAnswer(answerIndex, gameState.currentRound.correctAnswer);
    
    setGameState(prev => {
      const newScore = calculateScore(prev.score, isCorrect, gameState.currentRound!.difficulty);
      const newStreak = isCorrect ? prev.correctStreak + 1 : 0;
      const newLevel = getNextLevel(prev.level, newStreak);
      
      return {
        ...prev,
        score: newScore,
        showResult: true,
        lastAnswerCorrect: isCorrect,
        correctStreak: newStreak,
        level: newLevel,
      };
    });

    // Play feedback sound
    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }
  }, [gameState.showResult, gameState.currentRound]);

  // Continue to next round
  const continueToNextRound = useCallback(() => {
    if (gameState.round >= gameState.totalRounds) {
      // Game complete
      setGameState(prev => ({ ...prev, gameStarted: false }));
    } else {
      startNewRound();
    }
  }, [gameState.round, gameState.totalRounds, startNewRound]);

  // Error display
  if (error) {
    return (
      <ResponsiveGameLayout showDecorations={true}>
        <GameSection variant="main" fillSpace>
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`${playfulComponents.card.base} border-red-400 p-6 max-w-md text-center`}>
              <h3 className="text-xl font-semibold mb-4 text-red-600">Oops! Something went wrong</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
              <Button onClick={() => setError(null)} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </GameSection>
      </ResponsiveGameLayout>
    );
  }

  if (!gameState.gameStarted) {
    return (
      <ResponsiveGameLayout showDecorations={true}>
        <GameSection variant="header">
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/games")}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
            
            <h1 className={`${playfulColors.gradients.title} text-4xl md:text-6xl mb-4`}>
              Orchestration & Style Studio
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
              Master the art of arranging instruments and exploring musical styles
            </p>
          </div>
        </GameSection>

        <GameSection variant="main" fillSpace>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
              {["orchestration", "style"].map((mode) => {
                const config = getCompose002Mode(mode as Compose002ModeId);
                if (!config) return null;
                
                return (
                  <Button
                    key={mode}
                    onClick={() => setCurrentMode(mode as Compose002ModeId)}
                    variant={currentMode === mode ? "default" : "outline"}
                    className={`p-8 h-auto flex flex-col items-center gap-4 ${
                      currentMode === mode 
                        ? playfulColors.gradients.buttonPrimary 
                        : "border-2 border-gray-300"
                    }`}
                  >
                    <div className="text-4xl">{config.emoji}</div>
                    <div className="text-xl font-semibold">{config.label}</div>
                    <div className="text-sm text-center opacity-80">{config.description}</div>
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={startGame}
              size="lg"
              className={`mt-8 ${playfulShapes.rounded.button} ${playfulColors.gradients.buttonSuccess} ${playfulShapes.shadows.button}`}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Game
            </Button>
          </div>
        </GameSection>
      </ResponsiveGameLayout>
    );
  }

  return (
    <ResponsiveGameLayout showDecorations={true}>
      <GameSection variant="header">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/games")}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{modeConfig?.emoji}</span>
              <h2 className="text-xl font-semibold">{modeConfig?.label}</h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Round {gameState.round} of {gameState.totalRounds} • Level {gameState.level}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold">Score: {gameState.score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Streak: {gameState.correctStreak}
            </div>
          </div>
        </div>
      </GameSection>

      <GameSection variant="main" fillSpace>
        <div className="flex flex-col items-center justify-center h-full">
          {gameState.currentRound && (
            <>
              <div className={`text-center mb-8 ${playfulComponents.card.base} ${playfulComponents.card.available} p-6 max-w-2xl`}>
                <h3 className="text-2xl font-bold mb-4">
                  {gameState.currentRound.question}
                </h3>
              </div>

              <ResponsiveGrid columns={2} className="w-full max-w-2xl mb-8">
                {gameState.currentRound.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    disabled={gameState.showResult}
                    className={`p-6 h-auto text-lg ${
                      gameState.showResult && gameState.currentRound && index === gameState.currentRound.correctAnswer
                        ? "bg-green-500 hover:bg-green-500 text-white"
                        : gameState.showResult && selectedAnswer === index && gameState.currentRound && index !== gameState.currentRound.correctAnswer
                        ? "bg-red-500 hover:bg-red-500 text-white"
                        : ""
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </ResponsiveGrid>

              {gameState.showResult && (
                <div className={`text-center ${playfulComponents.card.base} p-6 max-w-2xl`}>
                  <div className={`text-lg font-semibold mb-2 ${
                    gameState.lastAnswerCorrect ? "text-green-600" : "text-red-600"
                  }`}>
                    {gameState.lastAnswerCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mb-4">
                    {gameState.currentRound.explanation}
                  </div>
                  <Button onClick={continueToNextRound}>
                    {gameState.round >= gameState.totalRounds ? "Finish Game" : "Next Round"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </GameSection>
    </ResponsiveGameLayout>
  );
};

export { OrchestrationAndStyleStudioGame };
export default OrchestrationAndStyleStudioGame;