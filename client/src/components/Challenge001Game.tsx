import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Clock, Trophy, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import { 
  Challenge001ModeId, 
  challenge001Modes, 
  getChallenge001Mode 
} from "@/lib/gameLogic/challenge-001Modes";
import {
  GameState,
  Question,
  generateRound,
  validateAnswer,
  calculateScore,
  calculateMasteryProgress,
  getAccuracy,
} from "@/lib/gameLogic/challenge-001Logic";

const Challenge001GameComponent: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "speed-challenges",
    score: 0,
    round: 1,
    currentQuestion: null,
    timeLeft: 10,
    isAnswered: false,
    streak: 0,
    highScore: 0,
    masteryLevel: 1,
    totalAnswered: 0,
    correctAnswers: 0,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [focusedAnswerIndex, setFocusedAnswerIndex] = useState<number | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('challenge-001-game-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setGameState(prev => ({
          ...prev,
          highScore: parsed.highScore || 0,
          masteryLevel: parsed.masteryLevel || 1,
        }));
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save high score and mastery level to localStorage
  useEffect(() => {
    const saveData = {
      highScore: gameState.highScore,
      masteryLevel: gameState.masteryLevel,
    };
    localStorage.setItem('challenge-001-game-state', JSON.stringify(saveData));
  }, [gameState.highScore, gameState.masteryLevel]);

  // Save session statistics
  const saveSessionStats = useCallback(() => {
    const sessionStats = {
      date: new Date().toISOString(),
      mode: gameState.currentMode,
      finalScore: gameState.score,
      roundsCompleted: gameState.round - 1,
      accuracy: getAccuracy(gameState.correctAnswers, gameState.totalAnswered),
      masteryLevel: gameState.masteryLevel,
    };

    const existingStats = JSON.parse(localStorage.getItem('challenge-001-session-stats') || '[]');
    existingStats.push(sessionStats);
    
    // Keep only the last 50 sessions
    const recentStats = existingStats.slice(-50);
    localStorage.setItem('challenge-001-session-stats', JSON.stringify(recentStats));
  }, [gameState.currentMode, gameState.score, gameState.round, gameState.correctAnswers, gameState.totalAnswered, gameState.masteryLevel]);

  // Save session when game ends or mode changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState.totalAnswered > 0) {
        saveSessionStats();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveSessionStats, gameState.totalAnswered]);

  // Audio functions
  const playSuccessSound = useCallback(async () => {
    try {
      // Play ascending major third for success
      await audioService.playSequence(523.25, 659.25, 0.2, 0.1); // C5 to E5
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  }, []);

  const playErrorSound = useCallback(async () => {
    try {
      // Play descending minor second for error
      await audioService.playSequence(440, 415.30, 0.3, 0.1); // A4 to G#4
    } catch (error) {
      console.error('Error playing error sound:', error);
    }
  }, []);

  const playModeChangeSound = useCallback(async () => {
    try {
      // Play a short arpeggio for mode change
      await audioService.playPhrase([523.25, 659.25, 783.99], [150, 150, 200]); // C5-E5-G5
    } catch (error) {
      console.error('Error playing mode change sound:', error);
    }
  }, []);

  const playTimeWarningSound = useCallback(async () => {
    try {
      // Play a quick beep for time warning
      await audioService.playNote(880, 0.1); // A5
    } catch (error) {
      console.error('Error playing time warning sound:', error);
    }
  }, []);

  const startNewQuestion = useCallback(() => {
    const round = generateRound(gameState.currentMode, gameState.masteryLevel);
    const modeConfig = getChallenge001Mode(gameState.currentMode);
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: round.question,
      timeLeft: round.timeLimit,
      isAnswered: false,
    }));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestionStartTime(Date.now());
  }, [gameState.currentMode, gameState.masteryLevel]);

  const handleTimeout = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      streak: 0,
      totalAnswered: prev.totalAnswered + 1,
    }));
    setIsCorrect(false);
    
    // Play error sound for timeout
    playErrorSound();

    setTimeout(() => {
      setGameState(prev => ({ ...prev, round: prev.round + 1 }));
      startNewQuestion();
    }, 2000);
  }, [playErrorSound, startNewQuestion]);

  // Timer effect
  useEffect(() => {
    if (gameState.timeLeft > 0 && !gameState.isAnswered && gameState.currentQuestion) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);

      // Play warning sound when time is running out (3 seconds left)
      if (gameState.timeLeft === 3) {
        playTimeWarningSound();
      }

      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && !gameState.isAnswered) {
      // Time's up
      handleTimeout();
    }
  }, [gameState.timeLeft, gameState.isAnswered, gameState.currentQuestion, playTimeWarningSound, handleTimeout]);

  const handleAnswer = (answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentQuestion) return;

    setSelectedAnswer(answerIndex);
    const correct = validateAnswer(answerIndex, gameState.currentQuestion.correctAnswer);
    setIsCorrect(correct);

    // Play appropriate sound
    if (correct) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const modeConfig = getChallenge001Mode(gameState.currentMode);
    const timeLimit = modeConfig?.timeLimit ?? 10;
    
    const scoreCalculation = calculateScore(
      correct,
      timeSpent,
      timeLimit,
      gameState.currentQuestion.difficulty,
      gameState.streak,
      gameState.currentMode
    );

    const newMasteryLevel = calculateMasteryProgress(
      correct,
      gameState.masteryLevel,
      gameState.currentQuestion.difficulty
    );

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      score: prev.score + scoreCalculation.totalScore,
      streak: correct ? prev.streak + 1 : 0,
      totalAnswered: prev.totalAnswered + 1,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      masteryLevel: gameState.currentMode === "progressive-mastery" 
        ? newMasteryLevel 
        : prev.masteryLevel,
      highScore: prev.score + scoreCalculation.totalScore > prev.highScore
        ? prev.score + scoreCalculation.totalScore
        : prev.highScore,
    }));

    setTimeout(() => {
      setGameState(prev => ({ ...prev, round: prev.round + 1 }));
      startNewQuestion();
    }, 2000);
  };

  const handleModeChange = (mode: Challenge001ModeId) => {
    // Save current session stats before changing modes
    if (gameState.totalAnswered > 0) {
      saveSessionStats();
    }

    const modeConfig = getChallenge001Mode(mode);
    setGameState({
      currentMode: mode,
      score: 0,
      round: 1,
      currentQuestion: null,
      timeLeft: modeConfig?.timeLimit ?? 10,
      isAnswered: false,
      streak: 0,
      highScore: gameState.highScore, // Preserve high score
      masteryLevel: gameState.masteryLevel, // Preserve mastery level
      totalAnswered: 0,
      correctAnswers: 0,
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    setFocusedAnswerIndex(null);
    
    // Play mode change sound
    playModeChangeSound();
  };

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This will clear your high score and mastery level.')) {
      localStorage.removeItem('challenge-001-game-state');
      localStorage.removeItem('challenge-001-session-stats');
      setGameState(prev => ({
        ...prev,
        highScore: 0,
        masteryLevel: 1,
        score: 0,
        round: 1,
        streak: 0,
        totalAnswered: 0,
        correctAnswers: 0,
      }));
    }
  };

  // Initialize first question
  useEffect(() => {
    if (!gameState.currentQuestion) {
      startNewQuestion();
    }
  }, [gameState.currentQuestion, startNewQuestion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.isAnswered || !gameState.currentQuestion) return;

      // Number keys 1-4 for answers
      if (event.key >= '1' && event.key <= '4') {
        const answerIndex = parseInt(event.key) - 1;
        if (answerIndex < gameState.currentQuestion.options.length) {
          handleAnswer(answerIndex);
        }
      }

      // Arrow keys for navigation
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setFocusedAnswerIndex(prev => {
          if (prev === null || prev >= gameState.currentQuestion!.options.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setFocusedAnswerIndex(prev => {
          if (prev === null || prev <= 0) {
            return gameState.currentQuestion!.options.length - 1;
          }
          return prev - 1;
        });
      }

      // Enter or Space to select focused answer
      if ((event.key === 'Enter' || event.key === ' ') && focusedAnswerIndex !== null) {
        event.preventDefault();
        handleAnswer(focusedAnswerIndex);
      }

      // Escape to go back to main menu
      if (event.key === 'Escape') {
        setLocation("/games");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isAnswered, gameState.currentQuestion, focusedAnswerIndex, handleAnswer, setLocation]);

  const accuracy = useMemo(() => {
    return getAccuracy(gameState.correctAnswers, gameState.totalAnswered);
  }, [gameState.correctAnswers, gameState.totalAnswered]);

  // Helper function to render accessible answer buttons
  const renderAnswerButton = (option: string, index: number, buttonClass: string, isSelected: boolean, isCorrectAnswer: boolean) => (
    <button
      key={index}
      onClick={() => handleAnswer(index)}
      disabled={gameState.isAnswered}
      className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed ${
        focusedAnswerIndex === index ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
      }`}
      aria-label={`Answer option ${index + 1}: ${option}`}
      aria-describedby={`question-${gameState.round}`}
      aria-disabled={gameState.isAnswered}
      aria-pressed={isSelected}
      role="button"
      tabIndex={focusedAnswerIndex === index ? 0 : -1}
      ref={focusedAnswerIndex === index ? (el) => el?.focus() : undefined}
    >
      <span className="flex items-center justify-between">
        <span>{option}</span>
        <span className="text-sm opacity-75 ml-2" aria-hidden="true">
          {index + 1}
        </span>
      </span>
      {gameState.isAnswered && isCorrectAnswer && (
        <span className="sr-only">Correct answer</span>
      )}
      {gameState.isAnswered && isSelected && !isCorrect && (
        <span className="sr-only">Incorrect answer</span>
      )}
    </button>
  );

  const renderSpeedChallenges = useCallback(() => (
    <div>
      <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-2 border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={32} className="text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-3xl font-bold text-yellow-600">{gameState.timeLeft}s</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={32} className="text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-3xl font-bold text-orange-600">{gameState.streak}</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              gameState.timeLeft > 5 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${(gameState.timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4" role="group" aria-label="Answer options">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return renderAnswerButton(option, index, buttonClass, isSelected, isCorrectAnswer);
            })}
          </div>
        </div>
      )}
    </div>
  ), [gameState.timeLeft, gameState.streak, gameState.currentQuestion, gameState.round, gameState.isAnswered, selectedAnswer, renderAnswerButton]);

  const renderProgressiveMastery = useCallback(() => (
    <div>
      <div className="bg-purple-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Mastery Level</p>
            <p className="text-3xl font-bold text-purple-600">Level {Math.floor(gameState.masteryLevel)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${((gameState.masteryLevel % 1) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {gameState.currentQuestion && `Difficulty: ${"★".repeat(gameState.currentQuestion.difficulty)}`}
        </p>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  ), [gameState.masteryLevel, gameState.currentQuestion, gameState.round, gameState.isAnswered, selectedAnswer, accuracy, renderAnswerButton]);

  const renderCompetitivePlay = useCallback(() => (
    <div>
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={40} />
            <div>
              <p className="text-sm opacity-90">High Score</p>
              <p className="text-3xl font-bold">{gameState.highScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target size={40} />
            <div>
              <p className="text-sm opacity-90">Current Score</p>
              <p className="text-3xl font-bold">{gameState.score}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg p-4 mb-6 border-2 border-orange-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <p className="text-xl font-bold text-orange-600">{gameState.streak}🔥</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-xl font-bold text-green-600">{accuracy}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-blue-600">{gameState.timeLeft}s</p>
          </div>
        </div>
      </div>

      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg p-8 mb-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {gameState.currentQuestion.question}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === gameState.currentQuestion!.correctAnswer;

              let buttonClass = "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white";

              if (gameState.isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white";
                } else if (isSelected && !isCorrect) {
                  buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`${buttonClass} px-6 py-4 rounded-lg font-semibold text-lg shadow-md transition-all disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  ), [gameState.highScore, gameState.score, gameState.streak, gameState.timeLeft, gameState.currentQuestion, gameState.round, gameState.isAnswered, selectedAnswer, accuracy, renderAnswerButton]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 relative">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#game-panel" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main game content
      </a>

      {/* Screen reader live region for announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {gameState.isAnswered && isCorrect !== null && (
          <>
            {isCorrect ? 'Correct answer!' : 'Incorrect answer.'}
            {gameState.currentQuestion && (
              ` The correct answer was option ${gameState.currentQuestion.correctAnswer + 1}: ${gameState.currentQuestion.options[gameState.currentQuestion.correctAnswer]}`
            )}
          </>
        )}
        {gameState.timeLeft <= 3 && gameState.timeLeft > 0 && !gameState.isAnswered && (
          `Time warning: ${gameState.timeLeft} seconds remaining`
        )}
        {gameState.timeLeft === 0 && !gameState.isAnswered && (
          'Time is up! Moving to next question.'
        )}
      </div>

      {/* Keyboard instructions */}
      <div className="sr-only" role="note" aria-label="Keyboard instructions">
        Use number keys 1-4 to select answers, arrow keys to navigate, Enter or Space to select focused answer, and Escape to return to main menu.
      </div>
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-900">Musical Skills Arena</h1>
        <div className="text-xl font-bold text-purple-700" aria-live="polite">Score: {gameState.score}</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Game modes">
        {challenge001Modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            role="tab"
            aria-selected={gameState.currentMode === mode.id}
            aria-controls="game-panel"
            className={
              gameState.currentMode === mode.id
                ? "px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white shadow-lg"
                : "px-6 py-3 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"
            }
          >
            <span aria-hidden="true">{mode.emoji}</span> {mode.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700">
              Mode: {gameState.currentMode.replace(/-/g, " ").toUpperCase()}
            </p>
          </div>

          <div id="game-panel" role="tabpanel" aria-labelledby={`mode-${gameState.currentMode}`}>
            {gameState.currentMode === "speed-challenges" && renderSpeedChallenges()}
            {gameState.currentMode === "progressive-mastery" && renderProgressiveMastery()}
            {gameState.currentMode === "competitive-play" && renderCompetitivePlay()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Stats</h3>
            <button
              onClick={resetProgress}
              className="text-sm text-red-600 hover:text-red-800 underline"
              aria-label="Reset all progress"
            >
              Reset Progress
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600">Round</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.round}</p>
            </div>
            <div>
              <p className="text-gray-600">Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            </div>
            <div>
              <p className="text-gray-600">High Score</p>
              <p className="text-2xl font-bold text-orange-600">{gameState.highScore}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Mastery Level</p>
                <p className="text-xl font-bold text-purple-600">Level {Math.floor(gameState.masteryLevel)}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Streak</p>
                <p className="text-xl font-bold text-orange-600">{gameState.streak}🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Challenge001Game = React.memo(Challenge001GameComponent);
