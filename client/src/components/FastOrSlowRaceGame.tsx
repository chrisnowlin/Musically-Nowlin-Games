import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Loader2, Star, Sparkles, ChevronLeft } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useGameCleanup } from "@/hooks/useGameCleanup";

const CHARACTERS = [
  { image: "/images/leo-lion.jpeg", name: "Leo Lion", id: "leo" },
  { image: "/images/milo-monkey.jpeg", name: "Milo Monkey", id: "milo" },
  { image: "/images/bella-bird.jpeg", name: "Bella Bird", id: "bella" },
];

interface Character {
  image: string;
  name: string;
  id: string;
}

interface Round {
  melody: number[];
  tempo1: number; // Duration multiplier (lower = faster)
  tempo2: number;
  correctAnswer: 1 | 2; // Which one is faster
  character1: Character;
  character2: Character;
}

interface GameState {
  currentRound: Round | null;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
}

const MELODIES = [
  [262, 294, 330, 349], // C D E F
  [392, 440, 494, 523], // G A B C
  [330, 392, 440, 494], // E G A B
  [262, 330, 392, 523], // C E G C (Major Arpeggio)
  [523, 494, 440, 392], // C B A G (Descending)
  [262, 262, 392, 392], // C C G G (Twinkle start)
  [330, 294, 262, 294, 330], // E D C D E (Mary Had a Little Lamb)
  [392, 392, 392, 311], // G G G Eb (Beethoven 5th)
  [262, 277, 294, 311], // C C# D Eb (Chromatic)
  [262, 262, 262, 392], // C C C G (Fanfare)
  [330, 262, 294, 196], // E C D G3 (Doorbell)
  [262, 294, 330, 349, 392], // C D E F G (Scale Run)
  [262, 392, 294, 440], // C G D A (Jumping Intervals)
  [220, 262, 330, 440], // A C E A (Minor Arpeggio)
  [262, 294, 262, 294], // C D C D (Simple Steps)
];

function generateRound(): Round {
  const melody = MELODIES[Math.floor(Math.random() * MELODIES.length)];
  // Wider tempo range: 0.15s (Very Fast) to 1.0s (Very Slow)
  const tempo1 = 0.15 + Math.random() * 0.85; 
  const tempo2 = 0.15 + Math.random() * 0.85;
  
  // Ensure tempos are different enough - increased threshold for clarity
  const diff = Math.abs(tempo1 - tempo2);
  if (diff < 0.25) {
    return generateRound(); // Regenerate if too similar
  }

  // Pick two random characters
  const shuffled = [...CHARACTERS].sort(() => 0.5 - Math.random());
  const character1 = shuffled[0];
  const character2 = shuffled[1];
  
  return {
    melody,
    tempo1,
    tempo2,
    correctAnswer: tempo1 < tempo2 ? 1 : 2, // Lower tempo value = faster
    character1,
    character2,
  };
}

async function playMelodyAtTempo(melody: number[], tempo: number, isMounted: React.MutableRefObject<boolean>, setTimeout: <T = void>(callback: (value?: T) => void, delay: number) => NodeJS.Timeout): Promise<void> {
  for (const freq of melody) {
    if (!isMounted.current) return; // Exit early if unmounted
    await audioService.playNote(freq, tempo * 0.8);
    if (!isMounted.current) return; // Check again after note
    await new Promise<void>(resolve => setTimeout(resolve, tempo * 200));
  }
}

export default function FastOrSlowRaceGame() {
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
  const [volume, setVolume] = useState(75);

  // Use the cleanup hook for auto-cleanup of timeouts and audio on unmount
  const { setTimeout, clearAll, isMounted } = useGameCleanup();

  // Update volume when changed
  useEffect(() => {
    audioService.setVolume(volume / 100);
  }, [volume]);

  const handleReset = useCallback(() => {
    // Clear all pending timeouts and stop audio
    clearAll();
    
    setGameState({
      currentRound: null,
      score: 0,
      totalQuestions: 0,
      isPlaying: false,
      feedback: null,
    });
    setGameStarted(false);
  }, [clearAll]);

  const playBothMelodies = useCallback(async (round: Round) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));

    setPlayingCharacter(1);
    await playMelodyAtTempo(round.melody, round.tempo1, isMounted, setTimeout);
    setPlayingCharacter(null);

    // Check if still mounted before pause
    if (!isMounted.current) return;
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if still mounted before second melody
    if (!isMounted.current) return;
    setPlayingCharacter(2);
    await playMelodyAtTempo(round.melody, round.tempo2, isMounted, setTimeout);
    setPlayingCharacter(null);

    // Only update state if still mounted
    if (isMounted.current) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [isMounted, setTimeout]);

  const startNewRound = useCallback(async () => {
    const newRound = generateRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));

    setTimeout(() => playBothMelodies(newRound), 500);
  }, [playBothMelodies, setTimeout]);

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

    setTimeout(() => {
      if (isMounted.current) {
        setIsLoadingNextRound(true);
        setTimeout(() => {
          if (isMounted.current) {
            setIsLoadingNextRound(false);
            startNewRound();
          }
        }, 500);
      }
    }, 2500);
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
          onClick={() => setLocation("/games")}
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
              Fast or Slow Race
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Which animal played the melody faster?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Listen to both animals play the same melody</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⚡</span>
                <span>Decide which one played faster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🏁</span>
                <span>Tap the faster animal to score!</span>
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
        <ScoreDisplay 
          score={gameState.score} 
          totalQuestions={gameState.totalQuestions}
          onReset={handleReset}
          volume={volume}
          onVolumeChange={setVolume}
        />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            Which animal played <span className="text-orange-600 font-bold">FASTER</span>?
          </h2>
        </div>

        {gameState.currentRound && (
          <div className="w-full space-y-8">
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Character 1 */}
              <button
                onClick={() => handleAnswer(1)}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                className={`
                  ${playfulShapes.rounded.card} ${playfulShapes.shadows.card} p-6 pb-8
                  transition-all duration-300 transform relative overflow-hidden
                  ${playingCharacter === 1 ? 'scale-105 bg-orange-100 dark:bg-orange-900/30 ring-4 ring-orange-400' : 'bg-white dark:bg-gray-800'}
                  ${gameState.feedback?.show && gameState.currentRound.correctAnswer === 1 
                    ? 'bg-green-100 dark:bg-green-900/50 border-4 border-green-500 scale-105' 
                    : gameState.feedback?.show && gameState.feedback.isCorrect === false && playingCharacter !== 1
                    ? 'opacity-50 grayscale'
                    : 'hover:scale-105'
                  }
                  disabled:cursor-not-allowed
                  flex flex-col items-center gap-4 group
                `}
              >
                <div className="w-48 h-48 relative overflow-hidden rounded-2xl">
                   <img
                     src={gameState.currentRound.character1.image}
                     alt={gameState.currentRound.character1.name}
                     className={`w-full h-full object-cover transition-transform duration-300 ${playingCharacter === 1 ? 'scale-110' : ''}`}
                   />
                   {/* Speed indicator when playing */}
                   {playingCharacter === 1 && (
                     <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full animate-bounce">
                       <span className="text-2xl">🎵</span>
                     </div>
                   )}
                </div>
                <span className={`${playfulTypography.headings.h3} group-hover:text-orange-600 transition-colors`}>
                  {gameState.currentRound.character1.name}
                </span>
              </button>

              {/* Character 2 */}
              <button
                onClick={() => handleAnswer(2)}
                disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                className={`
                  ${playfulShapes.rounded.card} ${playfulShapes.shadows.card} p-6 pb-8
                  transition-all duration-300 transform relative overflow-hidden
                  ${playingCharacter === 2 ? 'scale-105 bg-orange-100 dark:bg-orange-900/30 ring-4 ring-orange-400' : 'bg-white dark:bg-gray-800'}
                  ${gameState.feedback?.show && gameState.currentRound.correctAnswer === 2 
                    ? 'bg-green-100 dark:bg-green-900/50 border-4 border-green-500 scale-105' 
                    : gameState.feedback?.show && gameState.feedback.isCorrect === false && playingCharacter !== 2
                    ? 'opacity-50 grayscale'
                    : 'hover:scale-105'
                  }
                  disabled:cursor-not-allowed
                  flex flex-col items-center gap-4 group
                `}
              >
                <div className="w-48 h-48 relative overflow-hidden rounded-2xl">
                   <img
                     src={gameState.currentRound.character2.image}
                     alt={gameState.currentRound.character2.name}
                     className={`w-full h-full object-cover transition-transform duration-300 ${playingCharacter === 2 ? 'scale-110' : ''}`}
                   />
                   {/* Speed indicator when playing */}
                   {playingCharacter === 2 && (
                     <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full animate-bounce">
                       <span className="text-2xl">🎵</span>
                     </div>
                   )}
                </div>
                <span className={`${playfulTypography.headings.h3} group-hover:text-orange-600 transition-colors`}>
                  {gameState.currentRound.character2.name}
                </span>
              </button>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => playBothMelodies(gameState.currentRound!)}
                disabled={gameState.isPlaying || isLoadingNextRound}
                size="lg"
                variant="outline"
                className={`${playfulShapes.rounded.button} min-w-[200px]`}
              >
                {gameState.isPlaying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Play Again
                  </>
                )}
              </Button>
            </div>

            {gameState.feedback?.show && (
              <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
                gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              } max-w-xl mx-auto transform animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                <p className={playfulTypography.headings.h3}>
                  {gameState.feedback.isCorrect ? (
                    <>
                      <Star className="inline w-8 h-8 mr-2 text-yellow-500 animate-spin-slow" />
                      Correct! {gameState.currentRound.correctAnswer === 1 ? gameState.currentRound.character1.name : gameState.currentRound.character2.name} was faster!
                      <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500 animate-pulse" />
                    </>
                  ) : (
                    <>Try again! Listen carefully to who finishes first.</>
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
