import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, Loader2, ChevronLeft, Trophy, Flag } from "lucide-react";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import { motion, AnimatePresence } from "framer-motion";

const CHARACTERS = [
  { image: "/images/leo-lion.jpeg", name: "Leo Lion", id: "leo", color: "bg-orange-500" },
  { image: "/images/milo-monkey.jpeg", name: "Milo Monkey", id: "milo", color: "bg-yellow-500" },
  { image: "/images/bella-bird.jpeg", name: "Bella Bird", id: "bella", color: "bg-blue-500" },
];

interface Character {
  image: string;
  name: string;
  id: string;
  color: string;
}

type QuestionType = "faster" | "slower";

interface Round {
  melody: number[];
  tempo1: number; // Duration multiplier (lower = faster)
  tempo2: number;
  correctAnswer: 1 | 2; // Which one is the correct answer based on questionType
  questionType: QuestionType;
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

  // Randomly choose whether to ask about faster or slower
  const questionType: QuestionType = Math.random() < 0.5 ? "faster" : "slower";

  // Lower tempo value = faster playback
  // If asking "faster", correct answer is the one with lower tempo
  // If asking "slower", correct answer is the one with higher tempo
  const correctAnswer: 1 | 2 = questionType === "faster"
    ? (tempo1 < tempo2 ? 1 : 2)
    : (tempo1 > tempo2 ? 1 : 2);

  return {
    melody,
    tempo1,
    tempo2,
    correctAnswer,
    questionType,
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
  const [winner, setWinner] = useState<1 | 2 | null>(null);

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
    setWinner(null);
  }, [clearAll]);

  const playBothMelodies = useCallback(async (round: Round) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setWinner(null); // Reset winner animation position

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
    setWinner(null);

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
      setWinner(answer); // The correct answer character "wins" the race to the finish line
    } else {
      audioService.playErrorTone();
      setWinner(gameState.currentRound.correctAnswer); // Show who actually won
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
    }, 3000); // Slightly longer delay to enjoy the race animation
  }, [gameState, startNewRound, isMounted, setTimeout]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
    startNewRound();
  };

  if (!gameStarted) {
    return (
      <div className={`min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #444 10px, #444 20px)"
        }}></div>

        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white hover:text-orange-400 font-semibold bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg transition-all border border-white/20"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 tracking-tighter italic uppercase drop-shadow-2xl">
              Fast or Slow<br/>Race
            </h1>
            <p className="text-2xl text-gray-300 font-medium">
              On your marks! Who is the fastest?
            </p>
          </motion.div>

          <div className="bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold text-white">
              <Flag className="w-6 h-6 text-green-500" />
              <span>How to Race:</span>
            </div>
            <ul className="text-left space-y-4 text-lg text-gray-200">
              <li className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                <span className="text-3xl">👂</span>
                <span>Listen to the <strong>rhythm</strong> of both runners</span>
              </li>
              <li className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                <span className="text-3xl">🏎️</span>
                <span>Pick the one that was <strong>FASTER</strong> or <strong>SLOWER</strong></span>
              </li>
              <li className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                <span className="text-3xl">🏆</span>
                <span>Watch them race to the finish line!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl font-bold py-8 px-12 rounded-2xl shadow-lg transform hover:scale-105 transition-all border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
          >
            <Play className="w-8 h-8 mr-3 fill-current" />
            START RACE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex flex-col p-4 relative overflow-hidden">
        {/* Mowed Grass Pattern Overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)"
        }}></div>

      <div className="flex-1 flex flex-col z-10 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-4">
             <button
              onClick={() => setLocation("/games")}
              className="flex items-center gap-2 text-white hover:text-green-100 font-bold bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition-all"
            >
              <ChevronLeft size={20} />
              Quit
            </button>
            <ScoreDisplay 
            score={gameState.score} 
            totalQuestions={gameState.totalQuestions}
            onReset={handleReset}
            volume={volume}
            onVolumeChange={setVolume}
            className="bg-black/80 text-white border-white/20"
            />
        </div>

        {/* Question Header */}
        <div className="mt-2 mb-8 text-center bg-black/80 backdrop-blur-md rounded-2xl p-6 border-4 border-white shadow-xl mx-auto max-w-2xl transform -skew-x-12">
            <h2 className="transform skew-x-12 text-3xl font-black text-white uppercase tracking-wider">
            Who was{" "}
            <span className={`text-4xl px-2 ${gameState.currentRound?.questionType === "faster" ? "text-yellow-400 animate-pulse" : "text-blue-400"}`}>
                {gameState.currentRound?.questionType === "faster" ? "FASTER" : "SLOWER"}
            </span>?
            </h2>
        </div>

        {/* Race Track Area */}
        <div 
          className="flex-1 relative flex flex-col justify-center gap-52 py-8 bg-cover bg-center rounded-xl overflow-hidden shadow-2xl border-4 border-black mx-4 max-w-5xl mx-auto w-full"
          style={{ backgroundImage: 'url(/images/race-track-bg-v2.jpeg)' }}
        >
            {gameState.currentRound && (
                <>
                {/* Lane 1 */}
                <div className="relative h-40 w-full flex items-center">
                     
                     {/* Character 1 */}
                     <div className="absolute left-[20%] z-20 -translate-x-1/2 flex flex-col items-center gap-2">
                        <motion.div
                            animate={{
                                x: winner === 1 ? "calc(70vw - 100px)" : (playingCharacter === 1 ? [0, 5, -2, 2, 0] : 0),
                                scale: playingCharacter === 1 ? [1, 1.05, 1] : 1,
                            }}
                            transition={{
                                x: { duration: winner === 1 ? 2.5 : 0.3, type: "spring", stiffness: 30 },
                                scale: { duration: 0.2, repeat: playingCharacter === 1 ? Infinity : 0 }
                            }}
                        >
                            <div 
                                className={`relative w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden ${gameState.currentRound.character1.color} cursor-pointer hover:scale-105 transition-transform`}
                                onClick={() => !gameState.feedback && handleAnswer(1)}
                            >
                                <img 
                                    src={gameState.currentRound.character1.image} 
                                    alt={gameState.currentRound.character1.name}
                                    className="w-full h-full object-cover"
                                />
                             {/* Speed/Dust Effect */}
                             {playingCharacter === 1 && (
                                <motion.div 
                                    className="absolute -left-6 bottom-4 w-10 h-10 bg-white/40 rounded-full blur-lg"
                                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2], x: [-10, -30] }}
                                    transition={{ repeat: Infinity, duration: 0.4 }}
                                />
                             )}
                            </div>
                            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold border border-white/20 whitespace-nowrap">
                                {gameState.currentRound.character1.name}
                            </div>
                        </motion.div>
                     </div>

                     {/* Select Button 1 */}
                     <div className="absolute left-4 z-30">
                         <Button 
                            onClick={() => handleAnswer(1)}
                            disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                            className={`
                                h-auto py-3 px-6 rounded-xl font-bold text-lg uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-lg
                                ${gameState.currentRound.correctAnswer === 1 && gameState.feedback?.show 
                                    ? 'bg-green-500 hover:bg-green-600 border-green-700 text-white' 
                                    : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300'
                                }
                            `}
                         >
                            Select
                         </Button>
                     </div>
                </div>

                {/* Lane 2 */}
                <div className="relative h-40 w-full flex items-center">

                     {/* Character 2 */}
                     <div className="absolute left-[20%] z-20 -translate-x-1/2 flex flex-col items-center gap-2">
                        <motion.div
                            animate={{
                                x: winner === 2 ? "calc(70vw - 100px)" : (playingCharacter === 2 ? [0, 5, -2, 2, 0] : 0),
                                scale: playingCharacter === 2 ? [1, 1.05, 1] : 1,
                            }}
                            transition={{
                                x: { duration: winner === 2 ? 2.5 : 0.3, type: "spring", stiffness: 30 },
                                scale: { duration: 0.2, repeat: playingCharacter === 2 ? Infinity : 0 }
                            }}
                        >
                            <div 
                                className={`relative w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden ${gameState.currentRound.character2.color} cursor-pointer hover:scale-105 transition-transform`}
                                onClick={() => !gameState.feedback && handleAnswer(2)}
                            >
                                <img 
                                    src={gameState.currentRound.character2.image} 
                                    alt={gameState.currentRound.character2.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Speed/Dust Effect */}
                                {playingCharacter === 2 && (
                                    <motion.div 
                                        className="absolute -left-6 bottom-4 w-10 h-10 bg-white/40 rounded-full blur-lg"
                                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2], x: [-10, -30] }}
                                        transition={{ repeat: Infinity, duration: 0.4 }}
                                    />
                                )}
                            </div>
                            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold border border-white/20 whitespace-nowrap">
                                {gameState.currentRound.character2.name}
                            </div>
                        </motion.div>
                     </div>

                     {/* Select Button 2 */}
                     <div className="absolute left-4 z-30">
                         <Button 
                            onClick={() => handleAnswer(2)}
                            disabled={gameState.isPlaying || gameState.feedback !== null || isLoadingNextRound}
                            className={`
                                h-auto py-3 px-6 rounded-xl font-bold text-lg uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-lg
                                ${gameState.currentRound.correctAnswer === 2 && gameState.feedback?.show 
                                    ? 'bg-green-500 hover:bg-green-600 border-green-700 text-white' 
                                    : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300'
                                }
                            `}
                         >
                            Select
                         </Button>
                     </div>
                </div>
                </>
            )}
        </div>

        {/* Controls */}
        <div className="flex justify-center p-8 bg-black/20 backdrop-blur-sm rounded-t-3xl">
             <Button
                onClick={() => gameState.currentRound && playBothMelodies(gameState.currentRound)}
                disabled={gameState.isPlaying || isLoadingNextRound}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-6 px-8 rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
              >
                {gameState.isPlaying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Replay Race
                  </>
                )}
              </Button>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
            {gameState.feedback?.show && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-8 rounded-3xl shadow-2xl border-4 ${
                gameState.feedback.isCorrect ? 'bg-green-500 border-green-300' : 'bg-red-500 border-red-300'
              } text-white text-center max-w-lg w-full`}
              >
                <h3 className="text-4xl font-black mb-4 uppercase italic">
                  {gameState.feedback.isCorrect ? (
                    <>
                      <Trophy className="inline w-12 h-12 mr-2 text-yellow-300 animate-bounce" />
                      Winner!
                    </>
                  ) : (
                    "False Start!"
                  )}
                </h3>
                <p className="text-xl font-medium">
                  {gameState.feedback.isCorrect 
                    ? `Great job! That was definitely ${gameState.currentRound?.questionType}!`
                    : `Oops! That wasn't the ${gameState.currentRound?.questionType} one.`}
                </p>
              </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
