import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Volume2, Play, Pause, RotateCcw, Trophy, Target, Clock, Music } from "lucide-react";
import { useLocation } from "wouter";
import {
  initializeGame,
  generateGameRounds,
  updateGameState,
  calculateGameResults,
  getProgressionAudioData,
  getFeatureAudioData,
  getRhythmAudioData,
  getModeConfig,
  type GameState,
  type GameRound,
  type GameResult
} from "@/lib/gameLogic/harmony-003Logic";
import { HARMONY_MODES, CHORD_PROGRESSIONS, HARMONIC_FEATURES, HARMONIC_RHYTHMS } from "@/lib/gameLogic/harmony-003Modes";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

const Harmony003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("progressions");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Use audio service hook
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

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

  // Play chord progression audio
  const playProgressionAudio = useCallback(async (progression: string[], tempo: number = 120) => {
    if (!isReady || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      const audioData = getProgressionAudioData(progression);

      for (const chord of audioData) {
        // Play chord as a phrase (all notes simultaneously)
        const durations = chord.frequencies.map(() => chord.duration);
        const dynamics = chord.frequencies.map(() => 0.3);
        await audio.playPhrase(chord.frequencies, durations, dynamics, 0);
      }
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [audio, isReady, isPlayingAudio]);

  // Play feature audio
  const playFeatureAudio = useCallback(async (featureId: string) => {
    if (!isReady || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      const audioData = getFeatureAudioData(featureId);

      // Play feature as a chord
      const durations = audioData.frequencies.map(() => audioData.duration);
      const dynamics = audioData.frequencies.map(() => 0.4);
      await audio.playPhrase(audioData.frequencies, durations, dynamics, 0);
    } catch (error) {
      console.error('Error playing feature:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [audio, isReady, isPlayingAudio]);

  // Play rhythm audio
  const playRhythmAudio = useCallback(async (rhythmId: string, tempo: number = 120) => {
    if (!isReady || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      const audioData = getRhythmAudioData(rhythmId);
      const beatDuration = 60000 / tempo;

      // Play a simple chord progression with the specified rhythm
      const frequencies = [261.63, 329.63, 392.00]; // C major chord

      for (const changes of audioData.chordChanges) {
        const duration = beatDuration * changes;
        const durations = frequencies.map(() => duration);
        const dynamics = frequencies.map(() => 0.3);
        await audio.playPhrase(frequencies, durations, dynamics, 0);
      }
    } catch (error) {
      console.error('Error playing rhythm:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [audio, isReady, isPlayingAudio]);

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
  const startGame = useCallback(async () => {
    await initialize();
    initializeNewGame(selectedMode, selectedDifficulty);
    setRoundStartTime(Date.now());
  }, [initialize, selectedMode, selectedDifficulty, initializeNewGame]);

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

  // Play audio based on round type
  const playRoundAudio = useCallback(() => {
    if (!currentRound || isPlayingAudio) return;

    switch (currentRound.questionType) {
      case 'progression':
        if (currentRound.progression) {
          playProgressionAudio(currentRound.progression, currentRound.tempo);
        }
        break;
      case 'feature':
        if (currentRound.feature) {
          playFeatureAudio(currentRound.feature);
        }
        break;
      case 'rhythm':
        if (currentRound.rhythm) {
          playRhythmAudio(currentRound.rhythm, currentRound.tempo);
        }
        break;
    }
  }, [currentRound, isPlayingAudio, playProgressionAudio, playFeatureAudio, playRhythmAudio]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <h1 className="text-3xl font-bold text-green-900 text-center flex-1">Harmonic Progression Master</h1>
        {gameState && (
          <div className="text-xl font-bold text-green-700">Score: {gameState.score}</div>
        )}
      </div>

      {!gameState ? (
        /* Mode Selection */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">Choose Your Challenge</h2>
            
            {/* Mode Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-4">Select Mode:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HARMONY_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMode === mode.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="font-semibold text-green-900">{mode.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
                    <div className="text-xs text-green-600 mt-2">{mode.ageRange}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-4">Select Difficulty:</h3>
              <div className="flex gap-4 justify-center">
                {[1, 2, 3].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedDifficulty === level
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
              >
                Start Game
              </button>
            </div>
          </div>

          {/* Mode Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Mode Details</h3>
            {(() => {
              const mode = getModeConfig(selectedMode);
              return mode ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <div className="font-semibold">{mode.name}</div>
                      <div className="text-sm text-gray-600">{mode.ageRange}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{mode.description}</p>
                  <p className="text-sm text-green-600">{mode.instructions}</p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="bg-green-100 px-3 py-1 rounded-full">
                      {mode.maxRounds} rounds
                    </span>
                    <span className="bg-blue-100 px-3 py-1 rounded-full">
                      {mode.difficulty}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      ) : showResult ? (
        /* Game Results */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-900 mb-2">Game Complete!</h2>
            </div>
            
            {(() => {
              const results = calculateGameResults(gameState);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{results.score}</div>
                      <div className="text-sm text-gray-600">Final Score</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{results.correctAnswers}</div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{Math.round(results.averageTime / 1000)}s</div>
                      <div className="text-sm text-gray-600">Avg Time</div>
                    </div>
                  </div>

                  {results.improvements.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Tips for Improvement:</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {results.improvements.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                    >
                      Choose New Mode
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Game Play */
        <div className="max-w-4xl mx-auto">
          {/* Game Stats */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Round</div>
                  <div className="text-xl font-bold text-green-600">
                    {gameState.currentRound + 1}/{gameState.totalRounds}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="text-xl font-bold text-green-600">{gameState.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Streak</div>
                  <div className="text-xl font-bold text-orange-600">{gameState.streak}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  {getModeConfig(gameState.mode)?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Question Area */}
          {currentRound && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-900 mb-2">{currentRound.question}</h2>
                {currentRound.hint && (
                  <p className="text-gray-600 text-sm">{currentRound.hint}</p>
                )}
              </div>

              {/* Audio Player */}
              <div className="text-center mb-6">
                <button
                  onClick={playRoundAudio}
                  disabled={isPlayingAudio}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 size={20} />
                  {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                </button>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentRound.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentRound.answer;
                  const showCorrect = feedback && isCorrect;
                  const showIncorrect = feedback && isSelected && !isCorrect;

                  // Get display name based on mode
                  const getDisplayName = (opt: string) => {
                    switch (currentRound.questionType) {
                      case 'progression':
                        const prog = CHORD_PROGRESSIONS[opt as keyof typeof CHORD_PROGRESSIONS];
                        return (prog as any)?.name || opt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      case 'feature':
                        const feat = HARMONIC_FEATURES[opt as keyof typeof HARMONIC_FEATURES];
                        return feat?.name || opt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      case 'rhythm':
                        const rhythm = HARMONIC_RHYTHMS[opt as keyof typeof HARMONIC_RHYTHMS];
                        return rhythm?.name || opt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      default:
                        return opt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    }
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={!!feedback}
                      className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                        feedback
                          ? showCorrect
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : showIncorrect
                            ? 'bg-red-100 border-red-500 text-red-800'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                          : isSelected
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{getDisplayName(option)}</span>
                        <Music className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${
                  feedback.correct 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feedback.message}
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${((gameState.currentRound + 1) / gameState.totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Harmony003Game;