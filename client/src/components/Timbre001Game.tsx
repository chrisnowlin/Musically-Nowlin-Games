import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Volume2, Play, Pause, RotateCcw, Trophy, Target, Clock, Music, Star, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  initializeGame,
  generateGameRounds,
  updateGameState,
  calculateGameResults,
  getInstrumentAudioProperties,
  getFamilyColor,
  getModeConfig,
  type GameState,
  type GameRound,
  type GameResult
} from "@/lib/gameLogic/timbre-001Logic";
import { TIMBRE_MODES, INSTRUMENT_FAMILIES } from "@/lib/gameLogic/timbre-001Modes";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

export const Timbre001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("families");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  // Initialize audio context
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Initialize game when mode changes
  const initializeNewGame = useCallback((mode: string, difficulty: number) => {
    const newGameState = initializeGame(mode, difficulty);
    const rounds = generateGameRounds(mode, difficulty);
    setGameState({ ...newGameState, rounds });
    setIsPlaying(true);
    setShowResult(false);
    setSelectedAnswer("");
    setFeedback(null);
  }, []);

  // Play instrument sound
  const playInstrumentSound = useCallback(async (instrumentId: string) => {
    if (!audioContext) return;

    try {
      const audioProps = getInstrumentAudioProperties(instrumentId);
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = audioProps.waveform as OscillatorType;
      oscillator.frequency.setValueAtTime(audioProps.frequency, audioContext.currentTime);

      // Apply envelope
      const { attack, decay, sustain, release } = audioProps.envelope;
      const now = audioContext.currentTime;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + attack);
      gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gainNode.gain.linearRampToValueAtTime(0, now + attack + decay + release);

      oscillator.start(now);
      oscillator.stop(now + attack + decay + release);
    } catch (error) {
      console.error('Error playing instrument sound:', error);
    }
  }, [audioContext]);

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!gameState || !isPlaying || feedback) return;

    const timeSpent = Date.now() - roundStartTime;
    setSelectedAnswer(answer);
    
    const currentRound = gameState.rounds[gameState.currentRound];
    const isCorrect = answer === currentRound.answer;
    
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Correct! Well done!" : `Incorrect. The answer was ${currentRound.answer}.`
    });

    const updatedState = updateGameState(gameState, currentRound.id, answer, timeSpent);
    setGameState(updatedState);

    // Auto-advance after feedback
    setGameTimeout(() => {
      if (updatedState.currentRound < updatedState.totalRounds) {
        setRoundStartTime(Date.now());
        setSelectedAnswer("");
        setFeedback(null);
      } else {
        setIsPlaying(false);
        setShowResult(true);
      }
    }, 2000);
  }, [gameState, isPlaying, feedback, roundStartTime, setGameTimeout]);

  // Start game
  const startGame = useCallback(() => {
    initializeNewGame(selectedMode, selectedDifficulty);
    setRoundStartTime(Date.now());
  }, [selectedMode, selectedDifficulty, initializeNewGame]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(null);
    setIsPlaying(false);
    setShowResult(false);
    setSelectedAnswer("");
    setFeedback(null);
  }, []);

  // Get current round
  const currentRound = gameState?.rounds[gameState.currentRound];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation("/games")}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border border-purple-100"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Back to Games</span>
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-sm">
            Instrument Master
          </h1>
          <p className="text-purple-600/80 font-medium text-sm mt-1">Master the Sounds of the Orchestra</p>
        </div>

        <div className="w-[120px] flex justify-end">
            {gameState && (
             <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-purple-100">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-purple-900">{gameState.score}</span>
             </div>
            )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!gameState ? (
          /* Mode Selection */
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-10 border border-white/50">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-purple-900 mb-3">Choose Your Challenge</h2>
                <p className="text-gray-600">Select a game mode and difficulty to begin your musical journey</p>
              </div>
              
              {/* Mode Selection */}
              <div className="mb-10">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5" /> Select Mode
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TIMBRE_MODES.map(mode => (
                    <motion.button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-6 rounded-2xl text-left transition-all border-2 h-full flex flex-col ${
                        selectedMode === mode.id
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white ring-2 ring-purple-200 ring-offset-2'
                          : 'border-transparent bg-white shadow-md hover:border-purple-200'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 ${
                        selectedMode === mode.id ? 'bg-purple-200' : 'bg-gray-100'
                      }`}>
                        {mode.icon}
                      </div>
                      <div className="font-bold text-xl text-purple-900 mb-2">{mode.name}</div>
                      <p className="text-sm text-gray-600 flex-grow leading-relaxed">{mode.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                         <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                             {mode.ageRange}
                         </span>
                         {selectedMode === mode.id && (
                             <motion.div layoutId="selected-check" className="text-purple-600">
                                 <Target size={20} />
                             </motion.div>
                         )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-end">
                {/* Difficulty Selection */}
                <div className="flex-1 w-full">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" /> Select Difficulty
                  </h3>
                  <div className="flex gap-3">
                    {[1, 2, 3].map(level => (
                      <motion.button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-sm border-2 ${
                          selectedDifficulty === level
                            ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200'
                            : 'bg-white text-gray-600 border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg">Level {level}</div>
                        <div className="text-xs font-normal opacity-80 mt-1">
                            {level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Expert'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <div className="w-full md:w-auto">
                  <motion.button
                    onClick={startGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3"
                  >
                    <Play fill="currentColor" />
                    Start Game
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : showResult ? (
          /* Game Results */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50 text-center">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 rounded-full bg-yellow-100 mb-6 relative"
              >
                <Trophy className="w-20 h-20 text-yellow-500" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-yellow-300 rounded-full"
                />
              </motion.div>
              
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                Game Complete!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">You've mastered this session!</p>
              
              {(() => {
                const results = calculateGameResults(gameState);
                return (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Final Score", value: results.score, color: "purple", icon: <Star className="w-5 h-5" /> },
                        { label: "Accuracy", value: `${results.accuracy}%`, color: "blue", icon: <Target className="w-5 h-5" /> },
                        { label: "Correct", value: `${results.correctAnswers}/${gameState.totalRounds}`, color: "green", icon: <Sparkles className="w-5 h-5" /> },
                        { label: "Avg Time", value: `${Math.round(results.averageTime / 1000)}s`, color: "orange", icon: <Clock className="w-5 h-5" /> },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className={`bg-${stat.color}-50 p-5 rounded-2xl border border-${stat.color}-100 flex flex-col items-center justify-center gap-1`}
                        >
                          <div className={`text-${stat.color}-600 mb-1`}>{stat.icon}</div>
                          <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                          <div className={`text-xs font-bold uppercase tracking-wider text-${stat.color}-400`}>{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {results.improvements.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }} 
                        className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-left"
                      >
                        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                            <Target size={18} /> Tips for Improvement:
                        </h4>
                        <ul className="text-sm text-orange-800 space-y-2">
                          {results.improvements.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                                {tip}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={20} />
                        Play Again
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="px-8 py-4 bg-white text-purple-700 border-2 border-purple-100 rounded-xl font-bold text-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        Change Mode
                      </motion.button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        ) : (
          /* Game Play */
          <motion.div
            key="gameplay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Game Stats Bar */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between border border-purple-100">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {gameState.currentRound + 1}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                            of {gameState.totalRounds}
                        </div>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        <span className="font-bold text-gray-700">Streak:</span>
                        <span className="font-bold text-orange-500">{gameState.streak}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-50 px-4 py-1.5 rounded-full">
                    <span className="text-lg">{getModeConfig(gameState.mode)?.icon}</span>
                    <span className="font-bold text-purple-800 text-sm">
                        {getModeConfig(gameState.mode)?.name}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 px-2">
                <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((gameState.currentRound) / gameState.totalRounds) * 100}%` }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Question Panel */}
                {currentRound && (
                    <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50">
                        <div className="p-8 md:p-10 text-center relative">
                            <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-3">
                                {currentRound.question}
                            </h2>
                            {currentRound.hint && (
                                <p className="text-gray-500 font-medium mb-6 flex items-center justify-center gap-1">
                                    <Sparkles size={16} className="text-yellow-400" /> 
                                    Hint: {currentRound.hint}
                                </p>
                            )}
                            
                            <div className="py-6">
                                {/* Sound Player */}
                                {currentRound.questionType === 'sound' && currentRound.instrument && (
                                    <div className="flex flex-col items-center justify-center">
                                        <motion.button
                                            onClick={() => playInstrumentSound(currentRound.instrument!)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-200 flex items-center justify-center relative group"
                                        >
                                            <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:border-white/40 transition-all"></div>
                                            <Volume2 size={48} strokeWidth={1.5} />
                                            <div className="absolute -bottom-2 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                CLICK ME
                                            </div>
                                        </motion.button>
                                        <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Listen Carefully</p>
                                    </div>
                                )}

                                {/* Image Placeholder for image questions */}
                                {currentRound.questionType === 'image' && (
                                    <div className="w-64 h-64 bg-gray-100 rounded-2xl mx-auto flex flex-col items-center justify-center border-4 border-white shadow-inner">
                                        <Music size={64} className="text-gray-300 mb-4" />
                                        <span className="text-gray-400 font-bold">Image Placeholder</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Answer Options */}
                        <div className="bg-gray-50/80 p-6 md:p-8 border-t border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentRound.options.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentRound.answer;
                                const showCorrect = feedback && isCorrect;
                                const showIncorrect = feedback && isSelected && !isCorrect;
                                const isDisabled = !!feedback;

                                return (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isDisabled}
                                        whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                        className={`
                                            relative p-5 rounded-xl font-bold text-lg transition-all border-2 flex items-center justify-between group overflow-hidden
                                            ${feedback
                                                ? showCorrect
                                                    ? 'bg-green-100 border-green-500 text-green-800 shadow-none'
                                                    : showIncorrect
                                                    ? 'bg-red-100 border-red-500 text-red-800 shadow-none'
                                                    : 'bg-white border-gray-200 text-gray-400 opacity-60'
                                                : isSelected
                                                ? 'bg-purple-100 border-purple-500 text-purple-800'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                                                feedback 
                                                ? showCorrect ? 'bg-green-200 border-green-300 text-green-700' 
                                                : showIncorrect ? 'bg-red-200 border-red-300 text-red-700'
                                                : 'bg-gray-100 border-gray-200 text-gray-400'
                                                : 'bg-gray-50 border-gray-200 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 group-hover:border-purple-200'
                                            }`}>
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span>{option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                        </div>
                                        
                                        {currentRound.family && INSTRUMENT_FAMILIES[currentRound.family as keyof typeof INSTRUMENT_FAMILIES] && (
                                            <div className={`w-4 h-4 rounded-full ${getFamilyColor(currentRound.family)} shadow-sm border border-black/10 relative z-10`}></div>
                                        )}

                                        {/* Feedback Icon Overlay */}
                                        {feedback && (showCorrect || showIncorrect) && (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full ${showCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                            >
                                                {showCorrect ? <Target size={16} /> : <RotateCcw size={16} />}
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                                })}
                            </div>
                        </div>

                        {/* Feedback Overlay */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className={`absolute inset-x-0 bottom-0 p-6 text-center font-bold text-xl backdrop-blur-md ${
                                        feedback.correct 
                                            ? 'bg-green-500/90 text-white' 
                                            : 'bg-red-500/90 text-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        {feedback.correct ? <Star className="fill-current" /> : <RotateCcw />}
                                        {feedback.message}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timbre001Game;