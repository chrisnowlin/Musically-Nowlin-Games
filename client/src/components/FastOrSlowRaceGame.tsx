import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Play, Loader2, ChevronLeft, Trophy, Flag } from "lucide-react";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import { motion, AnimatePresence } from "framer-motion";
import { createWebAudioScheduler, WebAudioScheduler, ScheduledSound } from '@/lib/audio/webAudioScheduler';

const CHARACTERS = [
  { image: "/images/leo-lion.jpeg", name: "Leo Lion", id: "leo", color: "bg-orange-500" },
  { image: "/images/milo-monkey.jpeg", name: "Milo Monkey", id: "milo", color: "bg-yellow-500" },
  { image: "/images/bella-bird.jpeg", name: "Bella Bird", id: "bella", color: "bg-blue-500" },
  { image: "/images/ellie-elephant.jpeg", name: "Ellie Elephant", id: "ellie", color: "bg-purple-500" },
  { image: "/images/gary-giraffe.jpeg", name: "Gary Giraffe", id: "gary", color: "bg-green-500" },
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

// This function is now replaced by Web Audio scheduling in the component

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

    // Create AudioContext if needed
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }

    // Create master gain if needed
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

  /**
   * Play melody at specific tempo using Web Audio scheduling
   */
  const playMelodyAtTempo = useCallback(async (
    melody: number[],
    tempo: number,
    startTime: number = 0
  ): Promise<number> => {
    const scheduler = getScheduler();
    if (!scheduler || !isMounted.current) {
      return startTime;
    }

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const noteDuration = tempo * 0.8;
    const noteSpacing = tempo * 0.2;
    const events: ScheduledSound[] = [];
    let currentTime = startTime;

    // Build scheduled events
    for (let i = 0; i < melody.length; i++) {
      if (!isMounted.current) break;
      
      events.push({
        time: currentTime,
        frequency: melody[i],
        duration: noteDuration,
        volume: 0.7 * (volume / 100),
        eventIndex: i,
      });

      currentTime += noteDuration + noteSpacing;
    }

    // Schedule all events
    await scheduler.scheduleSequence(events, {});

    return currentTime;
  }, [getScheduler, volume, isMounted]);

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
    const scheduler = getScheduler();
    if (!scheduler || !isMounted.current) return;

    // Stop any existing playback
    scheduler.stop();

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setWinner(null); // Reset winner animation position

    // Build events for both melodies with pause between
    const allEvents: ScheduledSound[] = [];
    let currentTime = 0;

    // First melody
    const noteDuration1 = round.tempo1 * 0.8;
    const noteSpacing1 = round.tempo1 * 0.2;
    for (let i = 0; i < round.melody.length; i++) {
      allEvents.push({
        time: currentTime,
        frequency: round.melody[i],
        duration: noteDuration1,
        volume: 0.7 * (volume / 100),
        eventIndex: i,
        partIndex: 1,
      });
      currentTime += noteDuration1 + noteSpacing1;
    }

    // Pause between melodies (800ms)
    currentTime += 0.8;

    // Second melody
    const noteDuration2 = round.tempo2 * 0.8;
    const noteSpacing2 = round.tempo2 * 0.2;
    for (let i = 0; i < round.melody.length; i++) {
      allEvents.push({
        time: currentTime,
        frequency: round.melody[i],
        duration: noteDuration2,
        volume: 0.7 * (volume / 100),
        eventIndex: i,
        partIndex: 2,
      });
      currentTime += noteDuration2 + noteSpacing2;
    }

    // Schedule all events
    await scheduler.scheduleSequence(allEvents, {
      onEventStart: (event) => {
        if (event.partIndex === 1) {
          setPlayingCharacter(1);
        } else if (event.partIndex === 2) {
          setPlayingCharacter(2);
        }
      },
      onComplete: () => {
        setPlayingCharacter(null);
        if (isMounted.current) {
          setGameState(prev => ({ ...prev, isPlaying: false }));
        }
      },
    });
  }, [getScheduler, volume, isMounted]);

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
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    setGameStarted(true);
    startNewRound();
  };

  // Update master gain when volume changes
  useEffect(() => {
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

  if (!gameStarted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-8 px-12 rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
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

        {/* Question Header & Feedback Area */}
        <div className="mt-2 mb-8 relative z-20 min-h-[140px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!gameState.feedback?.show ? (
              <motion.div 
                key="question"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center bg-black/80 backdrop-blur-md rounded-2xl p-6 border-4 border-white shadow-xl mx-auto max-w-2xl transform -skew-x-12"
              >
                <h2 className="transform skew-x-12 text-3xl font-black text-white uppercase tracking-wider">
                Who was{" "}
                <span className={`text-4xl px-2 ${gameState.currentRound?.questionType === "faster" ? "text-yellow-400 animate-pulse" : "text-blue-400 animate-pulse"}`}>
                    {gameState.currentRound?.questionType === "faster" ? "FASTER" : "SLOWER"}
                </span>?
                </h2>
              </motion.div>
            ) : (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`text-center p-6 rounded-2xl border-4 shadow-xl mx-auto max-w-2xl transform -skew-x-12 ${
                  gameState.feedback.isCorrect ? 'bg-green-600 border-green-300' : 'bg-red-600 border-red-300'
                }`}
              >
                <div className="transform skew-x-12 text-white">
                  <h3 className="text-3xl font-black mb-2 uppercase italic">
                    {gameState.feedback.isCorrect ? (
                      <>
                        <Trophy className="inline w-10 h-10 mr-2 text-yellow-300 animate-bounce" />
                        Winner!
                      </>
                    ) : (
                      "False Start!"
                    )}
                  </h3>
                  <p className="text-xl font-bold">
                    {gameState.feedback.isCorrect 
                      ? `Great job! That was definitely ${gameState.currentRound?.questionType}!`
                      : `Oops! That wasn't the ${gameState.currentRound?.questionType} one.`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Race Track Area */}
        <div 
          className="relative flex flex-col justify-center gap-12 py-8 bg-cover bg-center rounded-xl overflow-hidden shadow-2xl border-4 border-black mx-auto"
          style={{ 
            backgroundImage: 'url(/images/race-track-bg-v2.jpeg)',
            width: '100%',
            maxWidth: '1024px',
            height: '500px', // Fixed height
            minHeight: '500px'
          }}
        >
            {gameState.currentRound && (
                <>
                {/* Replay Controls (Centered) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
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

                {/* Lane 1 */}
                <div className="relative h-48 w-full flex items-center">
                     
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
                <div className="relative h-48 w-full flex items-center">

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

      </div>
    </div>
  );
}
