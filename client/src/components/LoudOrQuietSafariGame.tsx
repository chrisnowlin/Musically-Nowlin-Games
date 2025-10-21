import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Volume2, Loader2, Star, Sparkles, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface Round {
  frequency: number;
  volume1: number; // 0.3 to 0.9
  volume2: number;
  correctAnswer: 1 | 2; // Which one is louder
}

interface GameState {
  currentRound: Round | null;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
}

function generateRound(): Round {
  const frequency = 330 + Math.random() * 200; // E4 to F5
  const volume1 = 0.3 + Math.random() * 0.6;
  const volume2 = 0.3 + Math.random() * 0.6;
  
  const diff = Math.abs(volume1 - volume2);
  if (diff < 0.2) {
    return generateRound();
  }
  
  return {
    frequency,
    volume1,
    volume2,
    correctAnswer: volume1 > volume2 ? 1 : 2,
  };
}

export default function LoudOrQuietSafariGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);
  const [playingCharacter, setPlayingCharacter] = useState<1 | 2 | null>(null);

  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  const playBothNotes = useCallback(async (round: Round) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));

    setPlayingCharacter(1);
    await audioService.playNoteWithDynamics(round.frequency, 1.5, round.volume1);
    setPlayingCharacter(null);

    await new Promise(resolve => setTimeout(resolve, 800));

    setPlayingCharacter(2);
    await audioService.playNoteWithDynamics(round.frequency, 1.5, round.volume2);
    setPlayingCharacter(null);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const startNewRound = useCallback(async () => {
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    const newRound = generateRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));

    setTimeout(() => playBothNotes(newRound), 500);
  }, [playBothNotes]);

  const handleAnswer = useCallback((answer: 1 | 2) => {
    if (!gameState.currentRound || gameState.feedback || gameState.isPlaying) return;

    const isCorrect = answer === gameState.currentRound.correctAnswer;

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

    nextRoundTimeoutRef.current = setTimeout(() => {
      setIsLoadingNextRound(true);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoadingNextRound(false);
        startNewRound();
        loadingTimeoutRef.current = null;
      }, 500);
      nextRoundTimeoutRef.current = null;
    }, 2000);
  }, [gameState, startNewRound]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
    startNewRound();
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
              Loud or Quiet Safari
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Which animal played the note louder?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Listen to both animals play the same note</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🔊</span>
                <span>Decide which one played louder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⭐</span>
                <span>Tap the louder animal to score!</span>
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
            Which animal played <span className="text-blue-600 font-bold">LOUDER</span>?
          </h2>
        </div>

        {gameState.currentRound && (
          <div className="w-full space-y-8">
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <button
                onClick={() => handleAnswer(1)}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                className={`
                  ${playfulShapes.rounded.card} ${playfulShapes.shadows.card} p-8
                  transition-all duration-300 transform
                  ${playingCharacter === 1 ? 'scale-110 bg-blue-200 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}
                  ${gameState.feedback?.show && gameState.currentRound.correctAnswer === 1 
                    ? 'bg-green-100 dark:bg-green-900 border-4 border-green-500' 
                    : gameState.feedback?.show && gameState.feedback.isCorrect === false && playingCharacter !== 1
                    ? 'opacity-50'
                    : 'hover:scale-105'
                  }
                  disabled:cursor-not-allowed
                  flex flex-col items-center gap-4
                `}
              >
                <Volume2 className={`w-24 h-24 ${playingCharacter === 1 ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
                <span className={playfulTypography.headings.h3}>Animal 1</span>
              </button>

              <button
                onClick={() => handleAnswer(2)}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                className={`
                  ${playfulShapes.rounded.card} ${playfulShapes.shadows.card} p-8
                  transition-all duration-300 transform
                  ${playingCharacter === 2 ? 'scale-110 bg-blue-200 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}
                  ${gameState.feedback?.show && gameState.currentRound.correctAnswer === 2 
                    ? 'bg-green-100 dark:bg-green-900 border-4 border-green-500' 
                    : gameState.feedback?.show && gameState.feedback.isCorrect === false && playingCharacter !== 2
                    ? 'opacity-50'
                    : 'hover:scale-105'
                  }
                  disabled:cursor-not-allowed
                  flex flex-col items-center gap-4
                `}
              >
                <Volume2 className={`w-24 h-24 ${playingCharacter === 2 ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
                <span className={playfulTypography.headings.h3}>Animal 2</span>
              </button>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => playBothNotes(gameState.currentRound!)}
                disabled={gameState.isPlaying || isLoadingNextRound}
                size="lg"
                variant="outline"
                className={`${playfulShapes.rounded.button}`}
              >
                {gameState.isPlaying ? (
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                ) : (
                  <Play className="w-6 h-6 mr-2" />
                )}
                Play Again
              </Button>
            </div>

            {gameState.feedback?.show && (
              <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
                gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                <p className={playfulTypography.headings.h3}>
                  {gameState.feedback.isCorrect ? (
                    <>
                      <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                      Correct! Great ear for volume!
                      <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                    </>
                  ) : (
                    <>Try again! Listen carefully to the loudness.</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

