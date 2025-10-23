import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, Volume2, VolumeX, Play, Trophy, Target, Clock, Star } from "lucide-react";
import { useLocation } from "wouter";

import { 
  DYNAMICS_MODES, 
  getModeById, 
  getMaxDifficultyForMode,
  GameMode 
} from "../lib/gameLogic/dynamics-001Modes";
import { 
  GameRound, 
  generateRound, 
  validateAnswer, 
  calculateScore, 
  updateProgress, 
  getNextDifficulty,
  GameProgress,
  getAudioParameters
} from "../lib/gameLogic/dynamics-001Logic";

interface GameState {
  currentMode: GameMode | null;
  score: number;
  round: number;
  currentRound: GameRound | null;
  isAnswered: boolean;
  selectedAnswer: number | null;
  volume: number;
  isPlaying: boolean;
  startTime: number;
  gameProgress: Record<string, GameProgress>;
  showModeSelection: boolean;
  totalScore: number;
  achievements: string[];
}

const Dynamics001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentMode: null,
    score: 0,
    round: 1,
    currentRound: null,
    isAnswered: false,
    selectedAnswer: null,
    volume: 50,
    isPlaying: false,
    startTime: Date.now(),
    gameProgress: {},
    showModeSelection: true,
    totalScore: 0,
    achievements: []
  });

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('dynamics-001-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setGameState(prev => ({
          ...prev,
          gameProgress: parsed.gameProgress || {},
          totalScore: parsed.totalScore || 0,
          achievements: parsed.achievements || []
        }));
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    const progressData = {
      gameProgress: gameState.gameProgress,
      totalScore: gameState.totalScore,
      achievements: gameState.achievements
    };
    localStorage.setItem('dynamics-001-progress', JSON.stringify(progressData));
  }, [gameState.gameProgress, gameState.totalScore, gameState.achievements]);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Audio synthesis functions
  const playTone = useCallback((frequency: number, duration: number, volume: number, articulation?: string) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    const actualVolume = volume * masterVolume * 0.3;

    // Apply articulation
    if (articulation === 'staccato') {
      duration *= 0.3;
      gainNode.gain.setValueAtTime(actualVolume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else if (articulation === 'legato') {
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(actualVolume, audioContextRef.current.currentTime + 0.05);
      gainNode.gain.setValueAtTime(actualVolume, audioContextRef.current.currentTime + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else if (articulation === 'accent') {
      gainNode.gain.setValueAtTime(actualVolume * 1.5, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(actualVolume, audioContextRef.current.currentTime + 0.1);
      gainNode.gain.setValueAtTime(actualVolume, audioContextRef.current.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else {
      gainNode.gain.setValueAtTime(actualVolume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    }

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [gameState.volume]);

  const playCrescendo = useCallback((startVolume: number, endVolume: number, duration: number) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = 440;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    gainNode.gain.setValueAtTime(startVolume * masterVolume * 0.3, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(endVolume * masterVolume * 0.3, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [gameState.volume]);

  const playAudioForRound = useCallback(async (round: GameRound) => {
    if (!audioContextRef.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    const parameters = getAudioParameters(round.audioConfig);

    if (round.audioConfig.type === 'comparison') {
      // Play first phrase
      parameters.forEach((param, index) => {
        setTimeout(() => {
          playTone(param.frequency, param.duration, param.volume, param.articulation);
        }, index * 600);
      });

      // Wait, then play second phrase
      setTimeout(() => {
        if (round.audioConfig.volume2 !== undefined) {
          const notes = round.audioConfig.notes || [440];
          notes.forEach((note, index) => {
            setTimeout(() => {
              playTone(note, round.audioConfig.duration || 1.0, round.audioConfig.volume2!, round.audioConfig.articulation);
            }, index * 600);
          });
        }
      }, 2000);

      setTimeout(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }, 4000);

    } else if (round.audioConfig.type === 'progression') {
      if (round.audioConfig.direction === 'crescendo') {
        playCrescendo(round.audioConfig.volume1!, round.audioConfig.volume2!, round.audioConfig.duration!);
      } else {
        playCrescendo(round.audioConfig.volume2!, round.audioConfig.volume1!, round.audioConfig.duration!);
      }

      setTimeout(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }, 3000);

    } else {
      // Single or articulation
      parameters.forEach((param, index) => {
        setTimeout(() => {
          playTone(param.frequency, param.duration, param.volume, param.articulation);
        }, index * 400);
      });

      setTimeout(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }, 2000);
    }
  }, [gameState.isPlaying, playTone, playCrescendo]);

  // Generate new round
  const generateNewRound = useCallback(() => {
    if (!gameState.currentMode) return;

    const difficulty = gameState.gameProgress[gameState.currentMode.id]?.currentDifficulty || 1;
    const newRound = generateRound(gameState.currentMode.id, difficulty);
    
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      isAnswered: false,
      selectedAnswer: null,
      startTime: Date.now()
    }));
  }, [gameState.currentMode, gameState.gameProgress]);

  // Generate round when mode or round changes
  useEffect(() => {
    if (gameState.currentMode && !gameState.showModeSelection) {
      generateNewRound();
    }
  }, [gameState.currentMode, gameState.round, gameState.showModeSelection, generateNewRound]);

  // Handle mode selection
  const selectMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      showModeSelection: false,
      round: 1,
      score: 0
    }));
  }, []);

  // Handle answer selection
  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentRound) return;

    const timeSpent = Date.now() - gameState.startTime;
    const isCorrect = validateAnswer(answerIndex, gameState.currentRound.correctAnswer);
    const roundScore = calculateScore(isCorrect, timeSpent, gameState.currentRound.difficulty);

    setGameState(prev => {
      const newProgress = { ...prev.gameProgress };
      const modeId = prev.currentMode!.id;
      
      if (!newProgress[modeId]) {
        newProgress[modeId] = {
          mode: modeId,
          score: 0,
          roundsCompleted: 0,
          currentDifficulty: 1,
          correctAnswers: 0,
          totalAnswers: 0,
          averageTime: 0,
          bestScore: 0
        };
      }

      const updatedProgress = updateProgress(newProgress[modeId], {
        correct: isCorrect,
        timeSpent,
        score: roundScore
      });

      const maxDifficulty = getMaxDifficultyForMode(modeId);
      updatedProgress.currentDifficulty = getNextDifficulty(
        updatedProgress.currentDifficulty,
        updatedProgress,
        maxDifficulty
      );

      newProgress[modeId] = updatedProgress;

      return {
        ...prev,
        selectedAnswer: answerIndex,
        isAnswered: true,
        score: prev.score + roundScore,
        totalScore: prev.totalScore + roundScore,
        gameProgress: newProgress
      };
    });
  }, [gameState.isAnswered, gameState.currentRound, gameState.startTime]);

  // Next round
  const nextRound = useCallback(() => {
    if (!gameState.currentMode) return;

    const modeConfig = getModeById(gameState.currentMode.id);
    if (!modeConfig) return;

    if (gameState.round >= modeConfig.maxRounds) {
      // Game completed for this mode
      setGameState(prev => ({
        ...prev,
        showModeSelection: true,
        currentMode: null,
        round: 1,
        score: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        round: prev.round + 1
      }));
    }
  }, [gameState.currentMode, gameState.round]);

  // Back to mode selection
  const backToModeSelection = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showModeSelection: true,
      currentMode: null,
      round: 1,
      score: 0,
      currentRound: null,
      isAnswered: false,
      selectedAnswer: null
    }));
  }, []);

  // Memoized mode progress for performance
  const modeProgress = useMemo(() => {
    if (!gameState.currentMode) return null;
    return gameState.gameProgress[gameState.currentMode.id] || null;
  }, [gameState.currentMode, gameState.gameProgress]);

  // Mode selection screen
  if (gameState.showModeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setLocation('/games')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              aria-label="Back to games"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Games
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold text-gray-700">
                Total Score: {gameState.totalScore}
              </div>
              <div className="flex items-center gap-2">
                {gameState.volume > 0 ? (
                  <Volume2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                )}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameState.volume}
                  onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-24"
                  aria-label="Volume control"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dynamics Master</h1>
            <p className="text-lg text-gray-600">Master musical expression through dynamics and articulation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DYNAMICS_MODES.map((mode) => {
              const progress = gameState.gameProgress[mode.id];
              const completion = progress ? (progress.correctAnswers / Math.max(progress.totalAnswers, 1)) * 100 : 0;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 text-left group"
                  aria-label={`Select ${mode.name} mode`}
                >
                  <div className="text-4xl mb-3">{mode.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                    {mode.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{mode.ageRange}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {mode.difficulty}
                    </span>
                  </div>

                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(completion)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${mode.color} h-2 rounded-full transition-all`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Best Score</span>
                        <span>{progress.bestScore}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {gameState.achievements.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Achievements
              </h2>
              <div className="flex flex-wrap gap-2">
                {gameState.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game screen
  if (!gameState.currentMode || !gameState.currentRound) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentMode = gameState.currentMode;
  const progress = modeProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToModeSelection}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            aria-label="Back to mode selection"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Modes
          </button>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-2xl font-bold text-gray-800">{gameState.score}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Round</div>
              <div className="text-2xl font-bold text-gray-800">
                {gameState.round}/{currentMode.maxRounds}
              </div>
            </div>

            {progress && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Accuracy</div>
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round((progress.correctAnswers / Math.max(progress.totalAnswers, 1)) * 100)}%
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {gameState.volume > 0 ? (
                <Volume2 className="w-5 h-5 text-gray-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={gameState.volume}
                onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                className="w-24"
                aria-label="Volume control"
              />
            </div>
          </div>
        </div>

        {/* Mode Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl">{currentMode.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentMode.name}</h2>
              <p className="text-gray-600">{currentMode.instructions}</p>
            </div>
          </div>

          {progress && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-gray-500" />
                <span>Difficulty {progress.currentDifficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Avg Time: {Math.round(progress.averageTime / 1000)}s</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gray-500" />
                <span>Best: {progress.bestScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {gameState.currentRound.question}
            </h3>
            
            <button
              onClick={() => playAudioForRound(gameState.currentRound!)}
              disabled={gameState.isPlaying}
              className="flex items-center gap-3 mx-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Play audio"
            >
              <Play className="w-5 h-5" />
              {gameState.isPlaying ? 'Playing...' : 'Play Audio'}
            </button>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.currentRound.options.map((option, index) => {
              const isCorrect = index === gameState.currentRound!.correctAnswer;
              const isSelected = index === gameState.selectedAnswer;
              const showResult = gameState.isAnswered;

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    showResult && isCorrect
                      ? 'border-green-500 bg-green-50'
                      : showResult && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  } ${gameState.isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Option ${index + 1}: ${option}`}
                >
                  <div className="text-lg font-medium text-gray-800">{option}</div>
                  {showResult && isCorrect && (
                    <div className="text-sm text-green-600 mt-2">✓ Correct</div>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <div className="text-sm text-red-600 mt-2">✗ Incorrect</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation and Next Button */}
          {gameState.isAnswered && (
            <div className="mt-8 text-center">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{gameState.currentRound.explanation}</p>
              </div>
              
              <button
                onClick={nextRound}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Next round"
              >
                {gameState.round >= currentMode.maxRounds ? 'Complete Mode' : 'Next Round'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dynamics001Game;