import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Volume2, VolumeX, Play, Heart, Frown, Zap, Smile, Moon, Trophy, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ResponsiveGameLayout } from "@/components/ResponsiveGameLayout";
import {
  generateRound,
  validateAnswer,
  calculateScore,
  getScoreBreakdown,
  updateProgress,
  getAudioParameters,
  resetProgress,
  calculateAccuracy,
  getPerformanceFeedback,
  GameProgress,
  GameRound,
  ScoreBreakdown
} from "@/lib/gameLogic/dynamics-003Logic";
import {
  EMOTION_MODES,
  EMOTIONS,
  getModeById,
  getEmotionConfig,
  getAllModes
} from "@/lib/gameLogic/dynamics-003Modes";

interface GameState {
  currentMode: string;
  progress: GameProgress;
  currentRound: GameRound | null;
  isPlaying: boolean;
  isAnswered: boolean;
  selectedAnswer: number | null;
  showFeedback: boolean;
  volume: number;
  startTime: number;
  scoreBreakdown: ScoreBreakdown | null;
}

const STORAGE_KEY = 'dynamics-003-progress';

export const Dynamics003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const audioContext = useRef<AudioContext | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    currentMode: 'detection',
    progress: resetProgress('detection'),
    currentRound: null,
    isPlaying: false,
    isAnswered: false,
    selectedAnswer: null,
    showFeedback: false,
    volume: 50,
    startTime: Date.now(),
    scoreBreakdown: null
  });

  const [showModeSelection, setShowModeSelection] = useState(true);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        if (parsed && parsed.mode) {
          setGameState(prev => ({
            ...prev,
            progress: parsed
          }));
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, []);

  // Save progress when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.progress));
  }, [gameState.progress]);

  // Generate new round when mode or round changes
  useEffect(() => {
    if (!showModeSelection) {
      generateNewRound();
    }
  }, [gameState.currentMode, gameState.progress.round, showModeSelection]);

  const generateNewRound = useCallback(() => {
    try {
      const round = generateRound(gameState.currentMode, gameState.progress.difficulty);
      setGameState(prev => ({
        ...prev,
        currentRound: round,
        isAnswered: false,
        selectedAnswer: null,
        showFeedback: false,
        startTime: Date.now(),
        scoreBreakdown: null
      }));
    } catch (error) {
      console.error('Failed to generate round:', error);
    }
  }, [gameState.currentMode, gameState.progress.difficulty]);

  const playEmotionAudio = useCallback((emotionId: string) => {
    if (!audioContext.current) return;

    const emotionConfig = getEmotionConfig(emotionId);
    if (!emotionConfig) return;

    const masterVolume = gameState.volume / 100;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    emotionConfig.melody.forEach((freq, index) => {
      const startTime = audioContext.current!.currentTime + index * emotionConfig.tempo;
      const duration = emotionConfig.tempo * 0.9;

      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = emotionConfig.dynamics * masterVolume;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Stop playing indicator after audio finishes
    const totalDuration = emotionConfig.melody.length * emotionConfig.tempo * 1000;
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }, totalDuration + 500);
  }, [gameState.volume]);

  const playCurrentRound = useCallback(() => {
    if (gameState.currentRound && !gameState.isPlaying) {
      playEmotionAudio(gameState.currentRound.audioConfig.emotion);
    }
  }, [gameState.currentRound, gameState.isPlaying, playEmotionAudio]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentRound) return;

    const timeSpent = Date.now() - gameState.startTime;
    const correct = validateAnswer(answerIndex, gameState.currentRound.correctAnswer);
    const scoreBreakdown = getScoreBreakdown(correct, timeSpent, gameState.progress.difficulty, gameState.progress.streak);

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      selectedAnswer: answerIndex,
      showFeedback: true,
      scoreBreakdown
    }));

    // Update progress after a short delay to show feedback
    setTimeout(() => {
      setGameState(prev => {
        const updatedProgress = updateProgress(prev.progress, correct, timeSpent);
        return { ...prev, progress: updatedProgress };
      });
    }, 1500);
  }, [gameState.isAnswered, gameState.currentRound, gameState.startTime, gameState.progress]);

  const handleNextRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      progress: { ...prev.progress, round: prev.progress.round + 1 },
      isAnswered: false,
      selectedAnswer: null,
      showFeedback: false,
      scoreBreakdown: null
    }));
  }, []);

  const handleModeSelect = useCallback((modeId: string) => {
    let newProgress = resetProgress(modeId);
    
    // Load saved progress for this mode if available
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        if (parsed && parsed.mode === modeId) {
          newProgress = parsed;
        }
      } catch (error) {
        console.error('Failed to load saved progress for mode:', error);
      }
    }

    setGameState(prev => ({
      ...prev,
      currentMode: modeId,
      progress: newProgress,
      currentRound: null,
      isAnswered: false,
      selectedAnswer: null,
      showFeedback: false,
      scoreBreakdown: null
    }));

    setShowModeSelection(false);
  }, []);

  const handleBackToModes = useCallback(() => {
    setShowModeSelection(true);
  }, []);

  const getEmotionIcon = (emotionId: string) => {
    const emotion = getEmotionConfig(emotionId);
    if (!emotion) return null;

    switch (emotionId) {
      case 'happy': return <Smile className={`w-6 h-6 ${emotion.color}`} />;
      case 'sad': return <Frown className={`w-6 h-6 ${emotion.color}`} />;
      case 'energetic': return <Zap className={`w-6 h-6 ${emotion.color}`} />;
      case 'calm': return <Heart className={`w-6 h-6 ${emotion.color}`} />;
      case 'mysterious': return <Moon className={`w-6 h-6 ${emotion.color}`} />;
      case 'triumphant': return <Trophy className={`w-6 h-6 ${emotion.color}`} />;
      default: return null;
    }
  };

  const accuracy = calculateAccuracy(gameState.progress.correctAnswers, gameState.progress.totalAnswers);

  // Mode Selection Screen
  if (showModeSelection) {
    const modes = getAllModes();
    const currentMode = getModeById(gameState.currentMode);

    return (
      <ResponsiveGameLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setLocation("/games")}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <ChevronLeft size={24} />
              Main Menu
            </button>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Emotion Master
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Game Description */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Master Emotional Expression in Music</h2>
              <p className="text-gray-700 leading-relaxed">
                Learn to identify and understand how music expresses emotions through tempo, dynamics, 
                melody direction, and articulation. Choose your learning mode below!
              </p>
            </div>
          </div>

          {/* Mode Selection Grid */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
            {modes.map((mode) => {
              let progress = resetProgress(mode.id);
              const savedProgress = localStorage.getItem(STORAGE_KEY);
              
              if (savedProgress) {
                try {
                  const parsed = JSON.parse(savedProgress);
                  if (parsed && parsed.mode === mode.id) {
                    progress = parsed;
                  }
                } catch (error) {
                  // Use default progress
                }
              }

              const modeAccuracy = calculateAccuracy(progress.correctAnswers, progress.totalAnswers);
              const isCurrentMode = gameState.currentMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                    isCurrentMode ? 'border-purple-400 ring-4 ring-purple-200' : 'border-transparent hover:border-purple-300'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="relative p-8">
                    <div className="text-6xl mb-4">{mode.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{mode.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{mode.description}</p>
                    
                    {/* Progress Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        {progress.totalAnswers > 0 ? `${progress.totalAnswers} rounds played` : 'Not started'}
                      </div>
                      {progress.totalAnswers > 0 && (
                        <div className="text-sm font-semibold text-purple-600">
                          {modeAccuracy}% accuracy
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    {progress.totalAnswers > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-purple-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-purple-600">{progress.score}</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-pink-600">{progress.difficulty}</div>
                          <div className="text-xs text-gray-600">Level</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-2">
                          <div className="text-lg font-bold text-indigo-600">{progress.bestStreak}</div>
                          <div className="text-xs text-gray-600">Best Streak</div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {mode.ageRange} • {mode.difficulty}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isCurrentMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
                      }`}>
                        {isCurrentMode ? 'Current' : 'Select'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-3">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">🎭 Emotion Detection</h4>
                  <p>Listen to musical phrases and identify the emotion they express (happy, sad, energetic, calm, mysterious, triumphant).</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">🔍 Emotional Analysis</h4>
                  <p>Identify which musical elements create the emotional effect (tempo, dynamics, melody direction, articulation).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveGameLayout>
    );
  }

  // Active Game Screen
  const currentMode = getModeById(gameState.currentMode);

  return (
    <ResponsiveGameLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToModes}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft size={20} />
            Modes
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Emotion Master
            </h1>
            <p className="text-sm text-purple-700 font-medium">{currentMode?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{gameState.progress.score}</div>
            <div className="text-xs text-gray-600">Score</div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex items-center gap-4">
            <VolumeX size={20} className="text-gray-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <Volume2 size={20} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700 min-w-[45px]">{gameState.volume}%</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-600">{gameState.progress.round}</div>
                <div className="text-xs text-gray-600">Round</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{gameState.progress.difficulty}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{accuracy}%</div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{gameState.progress.streak}</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{gameState.progress.bestStreak}</div>
                <div className="text-xs text-gray-600">Best</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        {gameState.currentRound && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
              {/* Question */}
              <div className="text-center mb-8">
                <div className="text-sm text-gray-500 mb-2">Round {gameState.progress.round} • Level {gameState.progress.difficulty}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {gameState.currentRound.question}
                </h2>
                
                {/* Emotion Display for Detection Mode */}
                {gameState.currentMode === 'detection' && (
                  <div className="flex justify-center mb-6">
                    {getEmotionIcon(gameState.currentRound.emotionId)}
                  </div>
                )}
              </div>

              {/* Play Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={playCurrentRound}
                  disabled={gameState.isPlaying}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100"
                >
                  {gameState.isPlaying ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play size={28} />
                      Play Music
                    </>
                  )}
                </button>
              </div>

              {/* Answer Options */}
              <div className="grid gap-4 mb-6">
                {gameState.currentRound.options.map((option, index) => {
                  let buttonClass = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg shadow-lg transition-all transform hover:scale-105";

                  if (gameState.isAnswered) {
                    if (index === gameState.currentRound!.correctAnswer) {
                      buttonClass = "bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg shadow-lg";
                    } else if (index === gameState.selectedAnswer) {
                      buttonClass = "bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg shadow-lg";
                    } else {
                      buttonClass = "bg-gray-300 text-gray-600 font-semibold text-lg shadow-lg";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={gameState.isAnswered}
                      className={`${buttonClass} px-6 py-4 rounded-xl transition-all disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Section */}
              {gameState.showFeedback && gameState.scoreBreakdown && (
                <div className={`text-center p-6 rounded-xl mb-6 ${
                  gameState.selectedAnswer === gameState.currentRound!.correctAnswer
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className={`text-2xl font-bold mb-3 ${
                    gameState.selectedAnswer === gameState.currentRound!.correctAnswer
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {gameState.selectedAnswer === gameState.currentRound!.correctAnswer ? '🎉 Correct!' : '❌ Incorrect'}
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="text-sm text-gray-700 mb-3">
                    <div className="font-semibold mb-1">Score Breakdown:</div>
                    <div>Base: {gameState.scoreBreakdown.baseScore} • Speed: +{gameState.scoreBreakdown.speedBonus} • Streak: +{gameState.scoreBreakdown.streakBonus}</div>
                    <div className="text-lg font-bold text-purple-700">Total: +{gameState.scoreBreakdown.total}</div>
                  </div>

                  {/* Explanation */}
                  {gameState.currentRound.explanation && (
                    <div className="text-sm text-gray-700 bg-white/70 rounded-lg p-3 mb-4">
                      <div className="font-semibold mb-1">💡 Learning:</div>
                      {gameState.currentRound.explanation}
                    </div>
                  )}

                  <button
                    onClick={handleNextRound}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
                  >
                    Next Round →
                  </button>
                </div>
              )}
            </div>

            {/* Learning Guide */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4">🎵 Emotions in Music</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(EMOTIONS).map(([id, emotion]) => (
                  <div key={id} className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{emotion.icon}</span>
                      <span className={`font-bold ${emotion.color}`}>{emotion.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {emotion.characteristics.map((char, index) => (
                        <div key={index}>• {char}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-white/80 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <strong className="text-purple-800">🎼 Musical Elements that Express Emotion:</strong> Tempo (speed), dynamics (volume), melody direction (up/down), scale type (major/minor), rhythm patterns, and articulation all work together to create emotional expression in music.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveGameLayout>
  );
};
